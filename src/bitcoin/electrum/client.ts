import config from '../HexaConfig'
import ElectrumCli from 'electrum-client'
import reverse from 'buffer-reverse'
import * as bitcoinJS from 'bitcoinjs-lib'
import { ElectrumTransaction, ElectrumUTXO } from './interface'
import { NetworkType } from '../utilities/Interface'

const ELECTRUM_CLIENT_CONFIG = {
  predefinedTestnetPeers: [ {
    host: '35.177.46.45', ssl: '50002'
  } ],
  predefinedPeers: [
    // peers for production server goes here.
  ],
  maxConnectionAttempt: 5,
  reconnectDelay: 1000, // 1 second
}

const ELECTRUM_CLIENT = {
  electrumClient: null,
  isClientConnected: false,
  currentPeerIndex: Math.floor( Math.random() * ELECTRUM_CLIENT_CONFIG.predefinedPeers.length ),
  connectionAttempt: 0,
}

export default class ElectrumClient {
  public static async connect() {
    const peer = await ElectrumClient.getNextPeer()
    try {
      ELECTRUM_CLIENT.electrumClient = new ElectrumCli(
        global.net,
        global.tls,
        peer.ssl || peer.tcp,
        peer.host,
        peer.ssl ? 'tls' : 'tcp'
      ) // tcp or tls

      ELECTRUM_CLIENT.electrumClient.onError = ( error ) => {
        console.log( 'Electrum mainClient.onError():', error.message )

        if ( ELECTRUM_CLIENT.isClientConnected ) {
          if ( ELECTRUM_CLIENT.electrumClient.close ) ELECTRUM_CLIENT.electrumClient.close()

          ELECTRUM_CLIENT.isClientConnected = false
          console.log( 'Error: Close the connection' )
          setTimeout( ElectrumClient.connect, ELECTRUM_CLIENT_CONFIG.reconnectDelay )
        }
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
        console.log( `ver : ${ver}` )
        ELECTRUM_CLIENT.isClientConnected = true
      }
    } catch ( error ) {
      ELECTRUM_CLIENT.isClientConnected = false
      console.log( 'Bad connection:', JSON.stringify( peer ), error )
    }

    if ( ELECTRUM_CLIENT.isClientConnected ) return ELECTRUM_CLIENT.isClientConnected
    return ElectrumClient.reconnect()
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
    return ElectrumClient.connect()
  }

  public static getCurrentPeer() {
    const isTestnet = config.NETWORK_TYPE === NetworkType.TESTNET
    return isTestnet
      ? ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers[ ELECTRUM_CLIENT.currentPeerIndex ]
      : ELECTRUM_CLIENT_CONFIG.predefinedPeers[ ELECTRUM_CLIENT.currentPeerIndex ]
  }

  public static getNextPeer() {
    const isTestnet = config.NETWORK_TYPE === NetworkType.TESTNET
    ELECTRUM_CLIENT.currentPeerIndex += 1
    if (
      ELECTRUM_CLIENT.currentPeerIndex >
      ( isTestnet
        ? ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers.length - 1
        : ELECTRUM_CLIENT_CONFIG.predefinedPeers.length - 1 )
    )
      ELECTRUM_CLIENT.currentPeerIndex = 0 // reset(out of bounds)

    const peer = ElectrumClient.getCurrentPeer()
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
}
