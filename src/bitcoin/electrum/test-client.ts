import config from '../HexaConfig'
import ElectrumCli from 'electrum-client'
import reverse from 'buffer-reverse'
import * as bitcoinJS from 'bitcoinjs-lib'
import { ElectrumTransaction, ElectrumUTXO } from './interface'

const TEST_ELECTRUM_CLIENT_CONFIG = {
  predefinedTestnetPeers: [ {
    host: 'testnet.qtornado.com',
    ssl: '51002',
  } ],
  maxConnectionAttempt: 5,
  reconnectDelay: 1000, // 1 second
}

const TEST_ELECTRUM_CLIENT = {
  electrumClient: null,
  isClientConnected: false,
  currentPeerIndex: Math.floor( Math.random() * TEST_ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers.length ),
  connectionAttempt: 0,
  activePeer: TEST_ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers[ 0 ],
}

export default class TestElectrumClient {
  public static async connect() {
    try {
      TEST_ELECTRUM_CLIENT.electrumClient = new ElectrumCli(
        ( global as any ).net,
        ( global as any ).tls,
        TEST_ELECTRUM_CLIENT.activePeer?.ssl || TEST_ELECTRUM_CLIENT.activePeer?.tcp,
        TEST_ELECTRUM_CLIENT.activePeer?.host,
        TEST_ELECTRUM_CLIENT.activePeer?.ssl ? 'tls' : 'tcp'
      ) // tcp or tls

      TEST_ELECTRUM_CLIENT.electrumClient.onError = ( error ) => {
        console.log( 'Electrum mainClient.onError():', error?.message )

        if ( TEST_ELECTRUM_CLIENT.electrumClient.close ) TEST_ELECTRUM_CLIENT.electrumClient.close()

        TEST_ELECTRUM_CLIENT.isClientConnected = false
        console.log( 'Error: Close the connection' )
      }

      console.log( 'Initiate electrum server for test account' )
      const ver = await TEST_ELECTRUM_CLIENT.electrumClient.initElectrum( {
        client: 'bitcoin-keeper',
        version: '1.4',
      } )
      console.log( 'Connection to electrum server is established', {
        ver
      } )
      if ( ver && ver[ 0 ] ) {
        TEST_ELECTRUM_CLIENT.isClientConnected = true
      }
    } catch ( error ) {
      TEST_ELECTRUM_CLIENT.isClientConnected = false
      console.log( 'Bad connection:', JSON.stringify( TEST_ELECTRUM_CLIENT.activePeer ), error )
    }

    if ( TEST_ELECTRUM_CLIENT.isClientConnected ) return TEST_ELECTRUM_CLIENT.isClientConnected
    return await TestElectrumClient.reconnect()
  }

  public static async reconnect() {
    console.log( 'Trying to reconnect electrum for test account' )
    TEST_ELECTRUM_CLIENT.connectionAttempt += 1

    // close the connection before attempting again
    if ( TEST_ELECTRUM_CLIENT.electrumClient.close ) TEST_ELECTRUM_CLIENT.electrumClient.close()

    if ( TEST_ELECTRUM_CLIENT.connectionAttempt >= TEST_ELECTRUM_CLIENT_CONFIG.maxConnectionAttempt ) {
      console.log( 'Could not find the working electrum server. Please try again later.' )
      return TEST_ELECTRUM_CLIENT.isClientConnected // false
    }
    console.log( `Reconnection attempt #${TEST_ELECTRUM_CLIENT.connectionAttempt}` )
    await new Promise( ( resolve ) => {
      setTimeout( resolve, TEST_ELECTRUM_CLIENT_CONFIG.reconnectDelay ) // attempts reconnection after 1 second
    } )
    return await TestElectrumClient.connect()
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
    if ( !TEST_ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client is not connected' )
    const res = {
    }

    const chunks = TestElectrumClient.splitIntoChunks( addresses, batchsize )
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
      const results = await TEST_ELECTRUM_CLIENT.electrumClient.blockchainScripthash_listunspentBatch(
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
    if ( !TEST_ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client is not connected' )
    const historyByAddress = {
    }
    const txids = []
    const txidToAddress = {
    }

    const chunks = TestElectrumClient.splitIntoChunks( addresses, batchsize )
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
      const results = await TEST_ELECTRUM_CLIENT.electrumClient.blockchainScripthash_getHistoryBatch(
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
    if ( !TEST_ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client is not connected' )
    const res = {
    }
    txids = [ ...new Set( txids ) ] // remove duplicates, if any

    // TODO: lets try cache first

    const chunks = TestElectrumClient.splitIntoChunks( txids, batchsize )
    for ( const chunk of chunks ) {
      let results = []

      // eslint-disable-next-line no-await-in-loop
      results = await TEST_ELECTRUM_CLIENT.electrumClient.blockchainTransaction_getBatch( chunk, verbose )

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
    if ( !TEST_ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client is not connected' )
    const feePerKB = await TEST_ELECTRUM_CLIENT.electrumClient.blockchainEstimatefee( numberOfBlocks ) // in bitcoin
    if ( feePerKB === -1 ) return 1
    return Math.round( ( feePerKB / 1024 ) * 1e8 ) // feePerByte(sats)
  }

  public static async broadcast( txHex: string ) {
    console.log( {
      predefinedTestnetPeers: TEST_ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers
    } )
    if ( !TEST_ELECTRUM_CLIENT.electrumClient ) throw new Error( 'Electrum client is not connected' )
    return TEST_ELECTRUM_CLIENT.electrumClient.blockchainTransaction_broadcast( txHex )
  }
}
