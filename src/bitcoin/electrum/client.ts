/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import * as bitcoinJS from 'bitcoinjs-lib'
import reverse from 'buffer-reverse'
import ElectrumCli from 'electrum-client'
import config from '../HexaConfig'
import { NetworkType } from '../utilities/Interface'
import { ElectrumTransaction, ElectrumUTXO, NodeDetail } from './interface'

function shufflePeers( peers ) {
  for ( let i = peers.length - 1; i > 0; i-- ) {
    const j = Math.floor( Math.random() * ( i + 1 ) );
    [ peers[ i ], peers[ j ] ] = [ peers[ j ], peers[ i ] ]
  }
  return peers
}

const ELECTRUM_CLIENT_CONFIG: {
  predefinedTestnetPeers: NodeDetail[];
  predefinedPeers: NodeDetail[];
  maxConnectionAttempt: number;
  reconnectDelay: number;
} = {
  predefinedTestnetPeers: null,
  predefinedPeers: null,
  maxConnectionAttempt: 2,
  reconnectDelay: 500, // retry after half a second
}

const ELECTRUM_CLIENT_DEFAULTS = {
  electrumClient: null,
  isClientConnected: false,
  currentPeerIndex: -1,
  connectionAttempt: 0,
  activePeer: null,
}

export let ELECTRUM_CLIENT: {
  electrumClient: any;
  isClientConnected: boolean;
  currentPeerIndex: number;
  connectionAttempt: number;
  activePeer: NodeDetail;
} = ELECTRUM_CLIENT_DEFAULTS

export const ELECTRUM_NOT_CONNECTED_ERR =
  'Network Error: The current electrum node is not reachable, please try again with a different node'


export default class ElectrumClient {

  public static async connect() {
    let timeoutId = null

    try {
      if ( !ELECTRUM_CLIENT.activePeer ) {
        console.log(
          'Unable to connect to any electrum server. Please switch network and try again!'
        )
        return {
          connected: ELECTRUM_CLIENT.isClientConnected,
          error: 'Unable to connect to any electrum server. Please switch network and try again!',
        }
      }


      ELECTRUM_CLIENT.electrumClient = new ElectrumCli(
        ( global as any ).net,
        ( global as any ).tls,
        ELECTRUM_CLIENT.activePeer.port,
        ELECTRUM_CLIENT.activePeer.host,
        ELECTRUM_CLIENT.activePeer.useSSL ? 'tls' : 'tcp'
      ) // tcp or tls

      ELECTRUM_CLIENT.electrumClient.onError = ( error ) => {
        if ( ELECTRUM_CLIENT.isClientConnected ) {
          console.log( 'Electrum mainClient.onError():', error?.message || error )

          if ( ELECTRUM_CLIENT.electrumClient.close ) ELECTRUM_CLIENT.electrumClient.close()

          ELECTRUM_CLIENT.isClientConnected = false
          ELECTRUM_CLIENT.activePeer.isConnected = false
          console.log( 'Error: Close the connection' )

          // setTimeout(
          //   ElectrumClient.connect,
          //   ELECTRUM_CLIENT.activePeer?.host?.endsWith('.onion') ? 4000 : 500
          // );
        }
      }

      console.log( 'Initiate electrum server...' )

      const ver = await Promise.race( [
        new Promise( ( resolve ) => {
          timeoutId = setTimeout( () => resolve( 'timeout' ), 4000 )
        } ),
        ELECTRUM_CLIENT.electrumClient.initElectrum( {
          client: 'btc-k',
          version: '1.4',
        } ), // should resolve within 4 seconds(prior to timeout)
      ] )
      if ( ver === 'timeout' ) throw new Error( 'Connection time-out' )

      if ( ver && ver[ 0 ] ) {
        console.log( 'Connection to electrum server is established', {
          ver,
          node: ELECTRUM_CLIENT.activePeer.host,
        } )

        ELECTRUM_CLIENT.isClientConnected = true
        ELECTRUM_CLIENT.activePeer.isConnected = true
      }
    } catch ( error ) {
      ELECTRUM_CLIENT.isClientConnected = false
      ELECTRUM_CLIENT.activePeer.isConnected = false

      console.log( 'Bad connection:', JSON.stringify( ELECTRUM_CLIENT.activePeer ), error )
    } finally {
      if ( timeoutId ) clearTimeout( timeoutId )
    }

    if ( ELECTRUM_CLIENT.isClientConnected )
      return {
        connected: ELECTRUM_CLIENT.isClientConnected,
        connectedTo: ELECTRUM_CLIENT.activePeer.host,
      }
    return ElectrumClient.reconnect()
  }

  public static async reconnect() {
    ELECTRUM_CLIENT.connectionAttempt += 1

    // close the connection before attempting again
    if ( ELECTRUM_CLIENT.electrumClient.close ) ELECTRUM_CLIENT.electrumClient.close()

    if ( ELECTRUM_CLIENT.connectionAttempt >= ELECTRUM_CLIENT_CONFIG.maxConnectionAttempt ) {
      const nextPeer = ElectrumClient.getNextDefaultPeer()
      if ( !nextPeer ) {
        console.log(
          'Unable to connect to any electrum server. Please switch network and try again!'
        )
        return {
          connected: ELECTRUM_CLIENT.isClientConnected,
          error: 'Unable to connect to any electrum server. Please switch network and try again!',
        }
      }

      ELECTRUM_CLIENT.activePeer = nextPeer
      ELECTRUM_CLIENT.connectionAttempt = 1
      console.log( `Attempting a connection with next peer: ${nextPeer?.host}` )
      return ElectrumClient.connect()
    }
    console.log( `Reconnection attempt #${ELECTRUM_CLIENT.connectionAttempt}` )
    await new Promise( ( resolve ) => {
      setTimeout( resolve, ELECTRUM_CLIENT_CONFIG.reconnectDelay ) // attempts reconnection after 1 second
    } )
    return ElectrumClient.connect()
  }

  public static forceDisconnect() {
    if ( !ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client not available' )
    if ( ELECTRUM_CLIENT.electrumClient.close ) ELECTRUM_CLIENT.electrumClient.close()
    ELECTRUM_CLIENT.isClientConnected = false
    ELECTRUM_CLIENT.activePeer.isConnected = false
  }

  public static async serverFeatures() {
    ElectrumClient.checkConnection()

    return ELECTRUM_CLIENT.electrumClient.server_features()
  }

  public static getBlockchainHeaders = async (): Promise<{ height: number; hex: string }> =>
    ELECTRUM_CLIENT.electrumClient.blockchainHeaders_subscribe();

  public static checkConnection() {
    if ( !ELECTRUM_CLIENT.isClientConnected ) {
      const connectionError = ELECTRUM_NOT_CONNECTED_ERR
      throw new Error( connectionError )
    }
  }

  public static async ping() {
    if ( !ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client not available' )

    try {
      await ELECTRUM_CLIENT.electrumClient.server_ping()
    } catch ( _ ) {
      return false
    }
    return true
  }

  public static getActivePeer() {
    return ELECTRUM_CLIENT.activePeer
  }

  public static getNextDefaultPeer() {
    ELECTRUM_CLIENT.currentPeerIndex += 1
    const peers =
      config.NETWORK_TYPE === NetworkType.TESTNET
        ? ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers
        : ELECTRUM_CLIENT_CONFIG.predefinedPeers

    if ( !peers || ELECTRUM_CLIENT.currentPeerIndex > peers.length - 1 ) return null // exhuasted all available peers
    return peers[ ELECTRUM_CLIENT.currentPeerIndex ]
  }

  public static resetCurrentPeerIndex() {
    ELECTRUM_CLIENT.currentPeerIndex = -1;
  }

  // if current peer to use is not provided, it will try to get the active peer from the saved list of private nodes
  // if current peer to use is provided, it will use that peer
  public static setActivePeer(
    defaultNodes: NodeDetail[],
    privateNodes: NodeDetail[],
    currentPeerToUse?: NodeDetail
  ) {
    // close previous connection
    if ( ELECTRUM_CLIENT.isClientConnected && ELECTRUM_CLIENT.electrumClient?.close )
      ELECTRUM_CLIENT.electrumClient.close()

    // set defaults
    ELECTRUM_CLIENT = ELECTRUM_CLIENT_DEFAULTS
    if ( config.NETWORK_TYPE === NetworkType.TESTNET )
      ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers = shufflePeers( defaultNodes )
    else ELECTRUM_CLIENT_CONFIG.predefinedPeers = shufflePeers( defaultNodes )

    // set active node
    let activeNode = currentPeerToUse || privateNodes.filter( ( node ) => node.isConnected )[ 0 ]
    if ( !activeNode && defaultNodes.length ) activeNode = ElectrumClient.getNextDefaultPeer() // pick one of the default nodes
    ELECTRUM_CLIENT.activePeer = activeNode
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
    ElectrumClient.checkConnection()
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
    ElectrumClient.checkConnection()

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
    ElectrumClient.checkConnection()

    const res = {
    }
    txids = [ ...new Set( txids ) ] // remove duplicates, if any

    // lets try cache first
    const chunks = ElectrumClient.splitIntoChunks( txids, batchsize )
    for ( const chunk of chunks ) {
      let results = []

      // eslint-disable-next-line no-await-in-loop
      results = await ELECTRUM_CLIENT.electrumClient.blockchainTransaction_getBatch( chunk, verbose )

      for ( const txdata of results ) {
        if ( txdata.error && txdata.error.code === -32600 ) {
          // large response error, would need to handle it over a single call
        }

        res[ txdata.param ] = txdata.result
        if ( res[ txdata.param ] ) delete res[ txdata.param ].hex

        // bitcoin core 22.0.0+ .addresses in vout has been replaced by `.address`
        for ( const vout of res[ txdata.param ]?.vout || [] ) {
          if ( vout?.scriptPubKey?.address )
            vout.scriptPubKey.addresses = [ vout.scriptPubKey.address ]
        }
      }
    }

    return res
  }

  public static async estimateFee( numberOfBlocks = 1 ) {
    ElectrumClient.checkConnection()

    const feePerKB = await ELECTRUM_CLIENT.electrumClient.blockchainEstimatefee( numberOfBlocks ) // in bitcoin
    if ( feePerKB === -1 ) return 1
    return Math.round( ( feePerKB / 1024 ) * 1e8 ) // feePerByte(sats)
  }

  public static async broadcast( txHex: string ) {
    ElectrumClient.checkConnection()

    return ELECTRUM_CLIENT.electrumClient.blockchainTransaction_broadcast( txHex )
  }

  public static async testConnection( node: NodeDetail ) {
    const client = new ElectrumCli(
      ( global as any ).net,
      ( global as any ).tls,
      node.port,
      node.host,
      node.useSSL ? 'tls' : 'tcp'
    )

    client.onError = ( ex ) => {
      console.log( ex )
    } // mute
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
    } catch ( ex ) {
      console.log( ex )
    } finally {
      if ( timeoutId ) clearTimeout( timeoutId )
      client.close()
    }

    return false
  }
}
