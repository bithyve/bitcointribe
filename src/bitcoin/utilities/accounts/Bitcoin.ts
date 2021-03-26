import axios, { AxiosResponse } from 'axios'
import bip21 from 'bip21'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import bip65 from 'bip65'
import Client from 'bitcoin-core'
import * as bitcoinJS from 'bitcoinjs-lib'
import config from '../../HexaConfig'
import { TransactionDetails, Transactions, ScannedAddressKind } from '../Interface'
import {
  SUB_PRIMARY_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../../common/constants/wallet-service-types'
import Toast from '../../../components/Toast'
const { REQUEST_TIMEOUT } = config

let bitcoinAxios = axios.create( {
  timeout: REQUEST_TIMEOUT
} )
export default class Bitcoin {
  public static networkType = ( scannedStr: string ) => {
    scannedStr = scannedStr.replace( 'BITCOIN', 'bitcoin' )
    let address = scannedStr
    if ( scannedStr.slice( 0, 8 ) === 'bitcoin:' ) {
      address = bip21.decode( scannedStr ).address
    }
    try {
      bitcoinJS.address.toOutputScript( address, bitcoinJS.networks.bitcoin )
      return 'MAINNET'
    } catch ( err ) {
      try {
        bitcoinJS.address.toOutputScript( address, bitcoinJS.networks.testnet )
        return 'TESTNET'
      } catch ( err ) {
        return ''
      }
    }
  };

  public network: bitcoinJS.Network;
  public client: Client;
  public isTest = false; // flag for test account
  constructor( network?: bitcoinJS.Network ) {
    if ( network ) this.isTest = true
    this.network = network ? network : config.NETWORK
    this.client = config.BITCOIN_NODE
  }

  public getKeyPair = ( privateKey: string ): bitcoinJS.ECPairInterface =>
    bitcoinJS.ECPair.fromWIF( privateKey, this.network );

  public utcNow = (): number => Math.floor( Date.now() / 1000 );

  public deriveAddress = (
    keyPair: bip32.BIP32Interface,
    standard: number,
  ): string => {
    if ( standard === config.STANDARD.BIP44 ) {
      return bitcoinJS.payments.p2pkh( {
        pubkey: keyPair.publicKey,
        network: this.network,
      } ).address
    } else if ( standard === config.STANDARD.BIP49 ) {
      return bitcoinJS.payments.p2sh( {
        redeem: bitcoinJS.payments.p2wpkh( {
          pubkey: keyPair.publicKey,
          network: this.network,
        } ),
        network: this.network,
      } ).address
    } else if ( standard === config.STANDARD.BIP84 ) {
      return bitcoinJS.payments.p2wpkh( {
        pubkey: keyPair.publicKey,
        network: this.network,
      } ).address
    }
  };

  public getP2SH = ( keyPair: bitcoinJS.ECPairInterface ): bitcoinJS.Payment =>
    bitcoinJS.payments.p2sh( {
      redeem: bitcoinJS.payments.p2wpkh( {
        pubkey: keyPair.publicKey,
        network: this.network,
      } ),
      network: this.network,
    } );

  public fetchBalanceTransactionsByAddresses = async (
    accounts: {[xpubId: string]: {
    externalAddressSet:  {[address: string]: number}, // external range set (soft/hard)
    internalAddressSet:  {[address: string]: number}, // internal range set (soft/hard)
    externalAddresses: {[address: string]: number},  // all external addresses(till nextFreeAddressIndex)
    internalAddresses:  {[address: string]: number},  // all internal addresses(till nextFreeChangeAddressIndex)
    ownedAddresses: string[],
    cachedUTXOs:  Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
      status?: any;
    }>,
    cachedTxs: Transactions,
    cachedTxIdMap: {[txid: string]: string[]},
    cachedAQL: {external: {[address: string]: boolean}, internal: {[address: string]: boolean} },
    lastUsedAddressIndex: number,
    lastUsedChangeAddressIndex: number,
    accountType: string,
    contactName?: string,
    primaryAccType?: string,
    accountName?: string,
    }}
  ): Promise<
  {
    synchedAccounts: {
    [xpubId: string] : {
      UTXOs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
        status?: any;
      }>;
      balances: { balance: number; unconfirmedBalance: number };
      txIdMap:  {[txid: string]: string[]},
      transactions: Transactions;
      addressQueryList: {external: {[address: string]: boolean}, internal: {[address: string]: boolean} },
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
    }
   }
  }> => {
    let res: AxiosResponse
    try {
      const accountToAddressMapping = {
      }
      const accountsTemp: {
        [accountId: string]: {
          upToDateTxs?: TransactionDetails[];
          txsToUpdate?: TransactionDetails[];
          newTxs? : TransactionDetails[]
        }
      } = {
      }
      for( const accountId of Object.keys( accounts ) ){
        const { externalAddressSet, internalAddressSet, externalAddresses, ownedAddresses, cachedAQL, cachedTxs, cachedTxIdMap } = accounts[ accountId ]
        const upToDateTxs: TransactionDetails[] = []
        const txsToUpdate: TransactionDetails[] = []
        const newTxs : TransactionDetails[] = []

        // hydrate AQL & split txs(conf & unconf(<=6))
        cachedTxs.transactionDetails.forEach( ( tx ) => {
          if( tx.confirmations <= 6 ){
            txsToUpdate.push( tx )
            if( tx.address ){
            // update address query list to include out of bound addresses if the range set has moved while corresponding txs doesn't have 6+ confs
              if( externalAddressSet[ tx.address ] === undefined && internalAddressSet[ tx.address ] === undefined ){
                if( externalAddresses[ tx.address ] !== undefined ) cachedAQL.external[ tx.address ] = true
                else cachedAQL.internal[ tx.address ] = true
              }
            }
          } else upToDateTxs.push( tx )

          if( !cachedTxIdMap[ tx.txid ] ) // backward compatibility (for versions w/o txIdMaps)
            cachedTxIdMap[ tx.txid ] = [ tx.address ]

        } )

        accountsTemp[ accountId ] = {
          upToDateTxs, txsToUpdate, newTxs
        }

        const externalArray = [ ...Object.keys( externalAddressSet ), ...Object.keys( cachedAQL.external ) ]
        const internalArray = [ ...Object.keys( internalAddressSet ), ...Object.keys( cachedAQL.internal ) ]
        const ownedArray = [ ...ownedAddresses, ...Object.keys( cachedAQL.external ), ...Object.keys( cachedAQL.internal ) ]

        accountToAddressMapping[ accountId ] = {
          External: externalArray,
          Internal: internalArray,
          Owned: ownedArray,
        }
      }

      let usedFallBack = false
      bitcoinAxios = axios.create( {
        timeout: 4 * REQUEST_TIMEOUT // accounting for blind refresh
      } )
      try{
        if ( this.network === bitcoinJS.networks.testnet ) {
          res = await bitcoinAxios.post(
            config.ESPLORA_API_ENDPOINTS.TESTNET.NEWMULTIUTXOTXN,
            accountToAddressMapping,
          )
        } else {
          res = await bitcoinAxios.post(
            config.ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN,
            accountToAddressMapping,
          )
        }
      } catch( err ){
        if( config.ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN === config.BITHYVE_ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN ) throw new Error( err.message ) // not using own-node

        if( !config.USE_ESPLORA_FALLBACK ){
          Toast( 'We could not connect to your node.\nTry connecting to the BitHyve node- Go to settings ....' )
          throw new Error( err.message )
        }
        console.log( 'using Hexa node as fallback(fetch-balTx)' )

        usedFallBack = true
        if ( this.network === bitcoinJS.networks.testnet ) {
          res = await bitcoinAxios.post(
            config.BITHYVE_ESPLORA_API_ENDPOINTS.TESTNET.NEWMULTIUTXOTXN,
            accountToAddressMapping,
          )
        } else {
          res = await bitcoinAxios.post(
            config.BITHYVE_ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN,
            accountToAddressMapping,
          )
        }
      }

      const accountToResponseMapping = res.data
      const synchedAccounts = {
      }
      for( const accountId of Object.keys( accountToResponseMapping ) ){
        const { cachedUTXOs, externalAddresses, internalAddressSet, internalAddresses, cachedTxIdMap, cachedAQL, accountType, primaryAccType, accountName } = accounts[ accountId ]
        const { Utxos, Txs } = accountToResponseMapping[ accountId ]

        const UTXOs = cachedUTXOs
        const balances = {
          balance: 0,
          unconfirmedBalance: 0,
        }

        // (re)categorise UTXOs
        if ( Utxos )
          for ( const addressSpecificUTXOs of Utxos ) {
            for ( const utxo of addressSpecificUTXOs ) {
              const { value, Address, status, vout, txid } = utxo
              let include = true
              UTXOs.forEach( ( utxo ) => {
                if( utxo.txId === txid ) {
                  if( status.confirmed && !utxo.status.confirmed ){
                  // cached utxo status change(unconf to conf)
                    utxo.status = status
                  }
                  include = false
                }
              } )

              if( include )
              {
                UTXOs.push( {
                  txId: txid,
                  vout,
                  value,
                  address: Address,
                  status,
                } )
              }
            }
          }

        // calculate balance
        for( const utxo of UTXOs ){
          if (
            accountType === 'Test Account' &&
          externalAddresses[ utxo.address ] === 0
          ) {
            balances.balance += utxo.value // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
            continue
          }

          if ( utxo.status && utxo.status.confirmed ) balances.balance += utxo.value
          else if (
            internalAddressSet[ utxo.address ] !== undefined
          )
            balances.balance += utxo.value
          else balances.unconfirmedBalance += utxo.value
        }

        // process txs
        const addressesInfo = Txs
        const txIdMap = cachedTxIdMap? cachedTxIdMap: {
        }
        let { lastUsedAddressIndex, lastUsedChangeAddressIndex } = accounts[ accountId ]
        const { upToDateTxs, txsToUpdate, newTxs } = accountsTemp[ accountId ]

        if ( addressesInfo )
          for ( const addressInfo of addressesInfo ) {
            if ( addressInfo.TotalTransactions === 0 ) {
              continue
            }
            // TODO: remove totalTransactions, confirmedTransactions & unconfirmedTransactions
            // transactions.totalTransactions += addressInfo.TotalTransactions
            // transactions.confirmedTransactions +=
            //   addressInfo.ConfirmedTransactions
            // transactions.unconfirmedTransactions +=
            //   addressInfo.UnconfirmedTransactions

            addressInfo.Transactions.forEach( ( tx ) => {
              if ( !txIdMap[ tx.txid ] ) {
              // check for duplicate tx (fetched against sending and  then again for change address)
                txIdMap[ tx.txid ] = [ addressInfo.Address ]

                if ( tx.transactionType === 'Self' ) {
                  const outgoingTx = {
                    txid: tx.txid,
                    confirmations: tx.NumberofConfirmations,
                    status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                    fee: tx.fee,
                    date: tx.Status.block_time
                      ? new Date( tx.Status.block_time * 1000 ).toUTCString()
                      : new Date( Date.now() ).toUTCString(),
                    transactionType: 'Sent',
                    amount: tx.SentAmount,
                    accountType:
                    accountType === SUB_PRIMARY_ACCOUNT
                      ? primaryAccType
                      : accountType,
                    primaryAccType,
                    recipientAddresses: tx.RecipientAddresses,
                    blockTime: tx.Status.block_time? tx.Status.block_time: Date.now(),
                    address: addressInfo.Address
                  }

                  const incomingTx = {
                    txid: tx.txid,
                    confirmations: tx.NumberofConfirmations,
                    status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                    fee: tx.fee,
                    date: tx.Status.block_time
                      ? new Date( tx.Status.block_time * 1000 ).toUTCString()
                      : new Date( Date.now() ).toUTCString(),
                    transactionType: 'Received',
                    amount: tx.ReceivedAmount,
                    accountType:
                    accountType === SUB_PRIMARY_ACCOUNT
                      ? primaryAccType
                      : accountType,
                    primaryAccType,
                    senderAddresses: tx.SenderAddresses,
                    blockTime: tx.Status.block_time? tx.Status.block_time: Date.now(),
                  }
                  // console.log({ outgoingTx, incomingTx });
                  newTxs.push(
                    ...[ outgoingTx, incomingTx ],
                  )
                } else {
                  const transaction : TransactionDetails = {
                    txid: tx.txid,
                    confirmations: tx.NumberofConfirmations,
                    status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                    fee: tx.fee,
                    date: tx.Status.block_time
                      ? new Date( tx.Status.block_time * 1000 ).toUTCString()
                      : new Date( Date.now() ).toUTCString(),
                    transactionType: tx.TransactionType,
                    amount: tx.Amount,
                    accountType,
                    primaryAccType,
                    accountName: accountName? accountName: accountType,
                    recipientAddresses: tx.RecipientAddresses,
                    senderAddresses: tx.SenderAddresses,
                    blockTime: tx.Status.block_time? tx.Status.block_time: Date.now(), // only available when tx is confirmed; otherwise set to the current timestamp
                    address: addressInfo.Address
                  }

                  newTxs.push( transaction )
                }
              } else {
                if( !txIdMap[ tx.txid ].includes( addressInfo.Address ) ) txIdMap[ tx.txid ].push( addressInfo.Address )
                txsToUpdate.forEach( txToUpdate => {
                  if( txToUpdate.txid === tx.txid ) txToUpdate.confirmations = tx.NumberofConfirmations
                } )
              }
            } )

            const addressIndex = externalAddresses[ addressInfo.Address ]
            if ( addressIndex !== undefined ) {
              lastUsedAddressIndex =
              addressIndex > lastUsedAddressIndex
                ? addressIndex
                : lastUsedAddressIndex
            } else {
              const changeAddressIndex = internalAddresses[ addressInfo.Address ]
              if ( changeAddressIndex !== undefined ) {
                lastUsedChangeAddressIndex =
                changeAddressIndex > lastUsedChangeAddressIndex
                  ? changeAddressIndex
                  : lastUsedChangeAddressIndex
              }
            }
          }

        const transactions: Transactions = {
          totalTransactions: 0,
          confirmedTransactions: 0,
          unconfirmedTransactions: 0,
          transactionDetails: [ ...newTxs, ...txsToUpdate, ...upToDateTxs ]
        }

        // pop addresses from the query list if tx-conf > 6
        txsToUpdate.forEach( tx => {
          if( tx.confirmations > 6 ){
            const addresses = txIdMap[ tx.txid ]
            addresses.forEach( address => {
              if( cachedAQL.external[ address ] ) delete cachedAQL.external[ address ]
              else if( cachedAQL.internal[ address ] ) delete cachedAQL.internal[ address ]
            } )
          }
        } )

        // sort transactions(lastest first)
        transactions.transactionDetails.sort( ( tx1, tx2 ) => {
          return tx2.blockTime - tx1.blockTime
        } )

        synchedAccounts[ accountId ] =  {
          UTXOs,
          balances,
          txIdMap,
          transactions,
          addressQueryList: cachedAQL,
          nextFreeAddressIndex: lastUsedAddressIndex + 1,
          nextFreeChangeAddressIndex: lastUsedChangeAddressIndex + 1,
        }
      }

      if( usedFallBack )
        Toast( 'We could not connect to your own node.\nRefreshed using the BitHyve node....' )

      return {
        synchedAccounts
      }

    } catch ( err ) {
      // console.log(
      //  `An error occurred while fetching balance-txnn via Esplora: ${err.response.data.err}`,
      //);
      console.log( {
        err
      } )
      throw new Error( 'Fetching balance-txn by addresses failed' )
    }
  };

  public getTxCounts = async ( addresses: string[] ) => {
    const txCounts = {
    }
    try {
      let res: AxiosResponse
      try {
        if ( this.network === bitcoinJS.networks.testnet ) {
          res = await bitcoinAxios.post(
            config.ESPLORA_API_ENDPOINTS.TESTNET.MULTITXN,
            {
              addresses,
            },
          )
        } else {
          res = await bitcoinAxios.post(
            config.ESPLORA_API_ENDPOINTS.MAINNET.MULTITXN,
            {
              addresses,
            },
          )
        }
      } catch ( err ) {
        throw new Error( err.response.data.err )
      }

      const addressesInfo = res.data
      for ( const addressInfo of addressesInfo ) {
        txCounts[ addressInfo.Address ] = addressInfo.TotalTransactions
      }

      return txCounts
    } catch ( err ) {
      // console.log(
      //  `An error occurred while fetching transactions via Blockcypher fallback as well: ${err}`,
      //);
      throw new Error( 'Transaction fetching failed' )

    }
  };

  public generateMultiSig = (
    required: number,
    pubKeys: any[],
  ): {
    p2wsh: bitcoinJS.Payment;
    p2sh: bitcoinJS.Payment;
    address: string;
  } => {
    // generic multiSig address generator

    if ( required <= 0 || required > pubKeys.length ) {
      throw new Error( 'Inappropriate value for required param' )
    }
    // if (!network) network = bitcoinJS.networks.bitcoin;
    const pubkeys = pubKeys.map( ( hex ) => Buffer.from( hex, 'hex' ) )

    const p2ms = bitcoinJS.payments.p2ms( {
      m: required,
      pubkeys,
      network: this.network,
    } )
    const p2wsh = bitcoinJS.payments.p2wsh( {
      redeem: p2ms,
      network: this.network,
    } )
    const p2sh = bitcoinJS.payments.p2sh( {
      redeem: p2wsh,
      network: this.network,
    } )

    return {
      p2wsh,
      p2sh,
      address: p2sh.address,
    }
  };

  public isValidAddress = ( address: string ): boolean => {
    try {
      bitcoinJS.address.toOutputScript( address, this.network )
      return true
    } catch ( err ) {
      return false
    }
  };

  public isPaymentURI = ( paymentURI: string ): boolean => {
    if ( paymentURI.slice( 0, 8 ) === 'bitcoin:' ) {
      return true
    }
    return false
  };

  public addressDiff = (
    scannedStr: string,
  ): { type: ScannedAddressKind | null } => {
    scannedStr = scannedStr.replace( 'BITCOIN', 'bitcoin' )
    if ( this.isPaymentURI( scannedStr ) ) {
      const { address } = this.decodePaymentURI( scannedStr )
      if ( this.isValidAddress( address ) ) {
        return {
          type: ScannedAddressKind.PAYMENT_URI
        }
      }
    } else if ( this.isValidAddress( scannedStr ) ) {
      return {
        type: ScannedAddressKind.ADDRESS
      }
    }

    return {
      type: null
    }
  };


  public broadcastTransaction = async (
    txHex: string,
  ): Promise<{
    txid: string;
  }> => {
    let res: AxiosResponse
    try {
      if ( this.network === bitcoinJS.networks.testnet ) {
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.TESTNET.BROADCAST_TX,
          txHex,
          {
            headers: {
              'Content-Type': 'text/plain'
            },
          },
        )
      } else {
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX,
          txHex,
          {
            headers: {
              'Content-Type': 'text/plain'
            },
          },
        )
      }
      return {
        txid: res.data
      }
    } catch ( err ) {
      console.log(
        `An error occurred while broadcasting via current node. ${err}`,
      )

      if( config.ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX === config.BITHYVE_ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX ) throw new Error( err.message ) // not using own-node

      if ( config.USE_ESPLORA_FALLBACK ) {
        console.log( 'using Hexa node as fallback(tx-broadcast)' )
        try {
          if ( this.network === bitcoinJS.networks.testnet ) {
            res = await bitcoinAxios.post(
              config.BITHYVE_ESPLORA_API_ENDPOINTS.TESTNET.BROADCAST_TX,
              txHex,
              {
                headers: {
                  'Content-Type': 'text/plain'
                },
              },
            )
          } else {
            res = await bitcoinAxios.post(
              config.BITHYVE_ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX,
              txHex,
              {
                headers: {
                  'Content-Type': 'text/plain'
                },
              },
            )
          }

          Toast( 'We could not connect to your own node.\nSent using the BitHyve node....' )
          return {
            txid: res.data
          }
        } catch ( err ) {
          // console.log(err.message);
          throw new Error( 'Transaction broadcasting failed' )
        }
      } else {
        Toast( 'We could not connect to your node.\nTry connecting to the BitHyve node- Go to settings ....' )
        throw new Error( 'Transaction broadcasting failed' )
      }
    }
  };

  public fromOutputScript = ( output: Buffer ): string => {
    return bitcoinJS.address.fromOutputScript( output, this.network )
  };

  public generatePaymentURI = (
    address: string,
    options?: { amount: number; label?: string; message?: string },
  ): { paymentURI: string } => {
    if ( options ) {
      return {
        paymentURI: bip21.encode( address, options )
      }
    } else {
      return {
        paymentURI: bip21.encode( address )
      }
    }
  };

  public decodePaymentURI = (
    paymentURI: string,
  ): {
    address: string;
    options: {
      amount?: number;
      label?: string;
      message?: string;
    };
  } => {
    return bip21.decode( paymentURI )
  };

  public categorizeTx = (
    tx: any,
    inUseAddresses: { [address: string]: boolean },
    accountType: string,
    externalAddresses: { [address: string]: boolean },
  ) => {
    const inputs = tx.vin || tx.inputs
    const outputs = tx.Vout || tx.outputs
    let value = 0
    let amountToSelf = 0
    const probableRecipientList: string[] = []
    const probableSenderList: string[] = []
    const selfRecipientList: string[] = []
    const selfSenderList: string[] = []

    inputs.forEach( ( input ) => {
      if ( !input.addresses && !input.prevout ) {
        // skip it (quirks from blockcypher)
      } else {
        const address = input.addresses
          ? input.addresses[ 0 ]
          : input.prevout.scriptpubkey_address

        if ( inUseAddresses[ address ] ) {
          value -= input.prevout ? input.prevout.value : input.output_value
          selfSenderList.push( address )
        } else {
          probableSenderList.push( address )
        }
      }
    } )

    outputs.forEach( ( output ) => {
      if ( !output.addresses && !output.scriptpubkey_address ) {
        // do nothing
      } else {
        const address = output.addresses
          ? output.addresses[ 0 ]
          : output.scriptpubkey_address

        if ( inUseAddresses[ address ] ) {
          value += output.value
          inUseAddresses[ address ]
          if ( externalAddresses[ address ] ) {
            amountToSelf += output.value
            selfRecipientList.push( address )
          }
        } else {
          probableRecipientList.push( address ) // could be the change address of the sender (in context of incoming tx)
        }
      }
    } )

    if ( value > 0 ) {
      tx.transactionType = 'Received'
      tx.senderAddresses = probableSenderList
    } else {
      if ( value + ( tx.fee | tx.fees ) === 0 ) {
        tx.transactionType = 'Self'
        tx.sentAmount = Math.abs( amountToSelf ) + ( tx.fee | tx.fees )
        tx.receivedAmount = Math.abs( amountToSelf )
        tx.senderAddresses = selfSenderList
        tx.recipientAddresses = selfRecipientList
      } else {
        tx.transactionType = 'Sent'
        tx.recipientAddresses = probableRecipientList
      }
    }

    tx.amount = Math.abs( value )
    tx.accountType = accountType
    return tx
  };

  // private ownedAddress = (
  //   address: string,
  //   inUseAddresses: string[],
  // ): boolean => {
  //   for (const addr of inUseAddresses) {
  //     if (address === addr) {
  //       return true;
  //     }
  //   }
  //   return false;
  // };
}
