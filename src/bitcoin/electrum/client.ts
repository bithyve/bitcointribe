import config from '../HexaConfig'
import ElectrumCli from 'electrum-client'
import reverse from 'buffer-reverse'
import * as bitcoinJS from 'bitcoinjs-lib'
import { ElectrumTransaction, ElectrumUTXO, NodeDetail } from './interface'
import { NetworkType } from '../utilities/Interface'
import { isTestnet } from '../../common/constants/Bitcoin'

const ELECTRUM_CLIENT_CONFIG = {
  predefinedTestnetPeers: [ {
    host: '13.42.121.212', ssl: '50002'
  } ],
  predefinedPeers: [ {
    host: '52.56.32.52', ssl: '50002'
  } ],
  maxConnectionAttempt: 5,
  reconnectDelay: 1000, // 1 second
}

const ELECTRUM_CLIENT = {
  electrumClient: null,
  isClientConnected: false,
  currentPeerIndex: Math.floor( Math.random() * ELECTRUM_CLIENT_CONFIG.predefinedPeers.length ),
  connectionAttempt: 0,
  activePeer: null,
}

export default class ElectrumClient {
  public static async connect() {
    // const peer = await ElectrumClient.getNextPeer()
    try {
      if ( !ELECTRUM_CLIENT.activePeer ) {
        console.log( 'No active peer is available' )
        return
      }

      ELECTRUM_CLIENT.electrumClient = new ElectrumCli(
        ( global as any ).net,
        ( global as any ).tls,
        ELECTRUM_CLIENT.activePeer?.ssl || ELECTRUM_CLIENT.activePeer?.tcp,
        ELECTRUM_CLIENT.activePeer?.host,
        ELECTRUM_CLIENT.activePeer?.ssl ? 'tls' : 'tcp'
      ) // tcp or tls

      ELECTRUM_CLIENT.electrumClient.onError = ( error ) => {
        console.log( 'Electrum mainClient.onError():', error?.message )

        if ( ELECTRUM_CLIENT.electrumClient.close ) ELECTRUM_CLIENT.electrumClient.close()

        ELECTRUM_CLIENT.isClientConnected = false
        console.log( 'Error: Close the connection' )
      }

      console.log( 'Initiate electrum server' )
      const ver = await ELECTRUM_CLIENT.electrumClient.initElectrum( {
        client: 'bitcoin-keeper',
        version: '1.4',
      } )
      console.log( 'Connection to electrum server is established', {
        ver
      } )
      if ( ver && ver[ 0 ] ) {
        ELECTRUM_CLIENT.isClientConnected = true
      }
    } catch ( error ) {
      ELECTRUM_CLIENT.isClientConnected = false
      console.log( 'Bad connection:', JSON.stringify( ELECTRUM_CLIENT.activePeer ), error )
    }

    if ( ELECTRUM_CLIENT.isClientConnected ) return ELECTRUM_CLIENT.isClientConnected
    return await ElectrumClient.reconnect()
  }

  public static async reconnect() {
    console.log( 'Trying to reconnect' )
    ELECTRUM_CLIENT.connectionAttempt += 1

    // close the connection before attempting again
    if ( ELECTRUM_CLIENT.electrumClient.close ) ELECTRUM_CLIENT.electrumClient.close()

    if ( ELECTRUM_CLIENT.connectionAttempt >= ELECTRUM_CLIENT_CONFIG.maxConnectionAttempt ) {
      console.log( 'Could not find the working electrum server. Please try again later.' )
      return ELECTRUM_CLIENT.isClientConnected // false
    }
    console.log( `Reconnection attempt #${ELECTRUM_CLIENT.connectionAttempt}` )
    await new Promise( ( resolve ) => {
      setTimeout( resolve, ELECTRUM_CLIENT_CONFIG.reconnectDelay ) // attempts reconnection after 1 second
    } )
    return await ElectrumClient.connect()
  }

  public static getCurrentPeer() {
    const isTestnet = config.NETWORK_TYPE === NetworkType.TESTNET
    return isTestnet
      ? ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers[ ELECTRUM_CLIENT.currentPeerIndex ]
      : ELECTRUM_CLIENT_CONFIG.predefinedPeers[ ELECTRUM_CLIENT.currentPeerIndex ]
  }

  public static getActivePrivateNodeToUse( peers: NodeDetail[] ) {
    const node = peers?.filter( ( node ) => node.isConnected )[ 0 ]
    let peer = null
    let useKeeperNode = false

    if ( node ) {
      useKeeperNode = node?.useKeeperNode || false
      if ( node.useSSL ) peer = {
        host: node.host, ssl: node.port, tcp: null
      }
      else peer = {
        host: node.host, tcp: node.port, ssl: null
      }
    }
    return {
      peer, useKeeperNode
    }
  }

  public static async ping() {
    try {
      await ELECTRUM_CLIENT.electrumClient?.server_ping()
    } catch ( _ ) {
      return false
    }
    return true
  }

  public static getActivePeer() {
    return ELECTRUM_CLIENT.activePeer
  }

  // if current peer to use is not provided, it will try to get the active peer from the saved list of private nodes
  // if saved private node is not available, and use keeper node is true, it will use the keeper node
  // if current peer to use is provided, it will use that peer
  public static setActivePeer( savedPrivateNodes: NodeDetail[], currentPeerToUse = null ) {
    const { peer: privatePeer, useKeeperNode } = ElectrumClient.getActivePrivateNodeToUse(
      currentPeerToUse != null ? [ currentPeerToUse ] : savedPrivateNodes
    )
    let peer = null
    if ( privatePeer != null ) {
      peer = privatePeer
      if ( ElectrumClient.testConnection( peer?.host, peer?.tcp, peer?.ssl ) ) {
        ELECTRUM_CLIENT.activePeer = peer
        return
      }

      if ( useKeeperNode ) {
        peer = ElectrumClient.getNextPeer()
        ELECTRUM_CLIENT.activePeer = peer
        return
      }

      ELECTRUM_CLIENT.activePeer = null
      return
    }
    peer = ElectrumClient.getNextPeer()
    ELECTRUM_CLIENT.activePeer = peer
  }

  public static getPredefinedCurrentPeer() {
    return isTestnet()
      ? ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers[ ELECTRUM_CLIENT.currentPeerIndex ]
      : ELECTRUM_CLIENT_CONFIG.predefinedPeers[ ELECTRUM_CLIENT.currentPeerIndex ]
  }

  public static getNextPeer() {
    ELECTRUM_CLIENT.currentPeerIndex += 1
    if (
      ELECTRUM_CLIENT.currentPeerIndex >
      ( isTestnet()
        ? ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers.length - 1
        : ELECTRUM_CLIENT_CONFIG.predefinedPeers.length - 1 )
    )
      ELECTRUM_CLIENT.currentPeerIndex = 0 // reset(out of bounds)

    const peer = ElectrumClient.getPredefinedCurrentPeer()
    return peer
  }

  public static splitIntoChunks( arr, chunkSize ) {
    const groups = []
    for ( let itr = 0; itr < arr.length; itr += chunkSize )
      groups.push( arr.slice( itr, itr + chunkSize ) )
    return groups
  }

  public static async syncUTXOByAddress(
    addresses: string[],
    network: bitcoinJS.Network = config.NETWORK,
    batchsize = 150
  ): Promise<{ [address: string]: ElectrumUTXO[] }> {
    if ( !ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client is not connected' )
    const res = {
    }

    const chunks = ElectrumClient.splitIntoChunks( addresses, batchsize )
    for ( let itr = 0; itr < chunks.length; itr += 1 ) {
      const chunk = chunks[ itr ]
      const scripthashes = []
      const scripthash2addr = {
      }

      for ( let index = 0; index < chunk.length; index += 1 ) {
        const addr = chunk[ index ]
        const script = bitcoinJS.address.toOutputScript( addr, network )
        const hash = bitcoinJS.crypto.sha256( script )
        const reversedHash = Buffer.from( reverse( hash ) )
        const reversedHashHex = reversedHash.toString( 'hex' )
        scripthashes.push( reversedHashHex )
        scripthash2addr[ reversedHashHex ] = addr
      }

      // eslint-disable-next-line no-await-in-loop
      const results = await ELECTRUM_CLIENT.electrumClient.blockchainScripthash_listunspentBatch(
        scripthashes
      )

      for ( let index = 0; index < results.length; index += 1 ) {
        const utxos = results[ index ]
        const address = scripthash2addr[ utxos.param ]
        res[ address ] = utxos.result

        for ( let utIdx = 0; utIdx < res[ address ].length; utIdx += 1 ) {
          const utxo = res[ address ][ utIdx ]
          utxo.address = address
          utxo.txId = utxo.tx_hash
          utxo.vout = utxo.tx_pos
          delete utxo.tx_pos
          delete utxo.tx_hash
        }
      }
    }

    return res
  }

  public static async syncHistoryByAddress(
    addresses: string[],
    network: bitcoinJS.Network = config.NETWORK,
    batchsize = 150
  ): Promise<{
    historyByAddress: {};
    txids: any[];
    txidToAddress: { [tx_hash: string]: string };
  }> {
    if ( !ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client is not connected' )
    const historyByAddress = {
    }
    const txids = []
    const txidToAddress = {
    }

    const chunks = ElectrumClient.splitIntoChunks( addresses, batchsize )
    for ( let itr = 0; itr < chunks.length; itr += 1 ) {
      const chunk = chunks[ itr ]
      const scripthashes = []
      const scripthash2addr = {
      }

      for ( let index = 0; index < chunk.length; index += 1 ) {
        const addr = chunk[ index ]
        const script = bitcoinJS.address.toOutputScript( addr, network )
        const hash = bitcoinJS.crypto.sha256( script )
        const reversedHash = Buffer.from( reverse( hash ) )
        const reversedHashHex = reversedHash.toString( 'hex' )
        scripthashes.push( reversedHashHex )
        scripthash2addr[ reversedHashHex ] = addr
      }

      // eslint-disable-next-line no-await-in-loop
      const results = await ELECTRUM_CLIENT.electrumClient.blockchainScripthash_getHistoryBatch(
        scripthashes
      )

      for ( let index = 0; index < results.length; index += 1 ) {
        const history = results[ index ]
        if ( history.error ) console.log( 'syncHistoryByAddresses:', history.error )

        const address = scripthash2addr[ history.param ]
        historyByAddress[ address ] = history.result || []
        if ( historyByAddress[ address ].length ) {
          for ( const { tx_hash } of historyByAddress[ address ] ) {
            txids.push( tx_hash )
            txidToAddress[ tx_hash ] = address
          }
        }
      }
    }

    return {
      historyByAddress, txids, txidToAddress
    }
  }

  public static async getTransactionsById(
    txids: string[],
    verbose = true,
    batchsize = 40
  ): Promise<{ [txid: string]: ElectrumTransaction }> {
    if ( !ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client is not connected' )
    const res = {
    }
    txids = [ ...new Set( txids ) ] // remove duplicates, if any

    // TODO: lets try cache first

    const chunks = ElectrumClient.splitIntoChunks( txids, batchsize )
    for ( const chunk of chunks ) {
      let results = []

      // eslint-disable-next-line no-await-in-loop
      results = await ELECTRUM_CLIENT.electrumClient.blockchainTransaction_getBatch( chunk, verbose )

      for ( const txdata of results ) {
        if ( txdata.error && txdata.error.code === -32600 ) {
          // TODO: large response error, would need to handle it over a single call
        }

        res[ txdata.param ] = txdata.result
        if ( res[ txdata.param ] ) delete res[ txdata.param ].hex

        // bitcoin core 22.0.0+ .addresses in vout has been replaced by `.address`
        for ( const vout of res[ txdata.param ].vout || [] ) {
          if ( vout?.scriptPubKey?.address )
            vout.scriptPubKey.addresses = [ vout.scriptPubKey.address ]
        }
      }
    }

    return res
  }

  public static async estimateFee( numberOfBlocks = 1 ) {
    if ( !ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client is not connected' )
    const feePerKB = await ELECTRUM_CLIENT.electrumClient.blockchainEstimatefee( numberOfBlocks ) // in bitcoin
    if ( feePerKB === -1 ) return 1
    return Math.round( ( feePerKB / 1024 ) * 1e8 ) // feePerByte(sats)
  }

  public static async broadcast( txHex: string ) {
    if ( !ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client is not connected' )
    return ELECTRUM_CLIENT.electrumClient.blockchainTransaction_broadcast( txHex )
  }

  public static async testConnection( host, tcpPort, sslPort ) {
    console.log( 'testConnection', host, tcpPort, sslPort )
    const client = new ElectrumCli(
      ( global as any ).net,
      ( global as any ).tls,
      sslPort || tcpPort,
      host,
      sslPort ? 'tls' : 'tcp'
    )

    client.onError = () => {} // mute
    let timeoutId = null
    try {
      const rez = await Promise.race( [
        new Promise( ( resolve ) => {
          timeoutId = setTimeout( () => resolve( 'timeout' ), 5000 )
        } ),
        client.connect(),
      ] )
      if ( rez === 'timeout' ) return false

      await client.server_version( '2.7.11', '1.4' )
      await client.server_ping()
      return true
    } catch ( _ ) {
      console.log( {
        _
      } )
    } finally {
      if ( timeoutId ) clearTimeout( timeoutId )
      client.close()
    }

    return false
  }
}
