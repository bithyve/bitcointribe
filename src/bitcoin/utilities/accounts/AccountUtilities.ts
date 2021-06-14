import axios, { AxiosResponse } from 'axios'
import bip21 from 'bip21'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import bs58check from 'bs58check'
import * as bitcoinJS from 'bitcoinjs-lib'
import config from '../../HexaConfig'
import { TransactionDetails, Transactions, ScannedAddressKind } from '../Interface'
import { SUB_PRIMARY_ACCOUNT, } from '../../../common/constants/wallet-service-types'
import Toast from '../../../components/Toast'
import { SATOSHIS_IN_BTC } from '../../../common/constants/Bitcoin'
import { BH_AXIOS } from '../../../services/api'
const { REQUEST_TIMEOUT } = config
let bitcoinAxios = axios.create( {
  timeout: REQUEST_TIMEOUT
} )

export default class AccountUtilities {

    static networkType = ( scannedStr: string ) => {
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
    }

    static getKeyPair = ( privateKey: string, network: bitcoinJS.Network ): bitcoinJS.ECPairInterface =>
      bitcoinJS.ECPair.fromWIF( privateKey, network )

    static deriveAddressFromKeyPair = (
      keyPair: bip32.BIP32Interface,
      standard: number,
      network: bitcoinJS.Network
    ): string => {
      if ( standard === config.STANDARD.BIP44 ) {
        return bitcoinJS.payments.p2pkh( {
          pubkey: keyPair.publicKey,
          network,
        } ).address
      } else if ( standard === config.STANDARD.BIP49 ) {
        return bitcoinJS.payments.p2sh( {
          redeem: bitcoinJS.payments.p2wpkh( {
            pubkey: keyPair.publicKey,
            network,
          } ),
          network,
        } ).address
      } else if ( standard === config.STANDARD.BIP84 ) {
        return bitcoinJS.payments.p2wpkh( {
          pubkey: keyPair.publicKey,
          network,
        } ).address
      }
    }

   static isValidAddress = ( address: string, network: bitcoinJS.Network ): boolean => {
     try {
       bitcoinJS.address.toOutputScript( address, network )
       return true
     } catch ( err ) {
       return false
     }
   }

    static getPrivateKeyByIndex = (
      xpriv: string,
      internal: boolean,
      index: number,
      network: bitcoinJS.networks.Network
    ) => {
      const node = bip32.fromBase58(
        xpriv,
        network,
      )
      return node
        .derive( internal ? 1 : 0 )
        .derive( index )
        .toWIF()
    };

    static getAddressByIndex = (
      xpub: string,
      internal: boolean,
      index: number,
      network: bitcoinJS.networks.Network
    ): string => {
      const node = bip32.fromBase58(
        xpub,
        network,
      )
      const keyPair = node.derive( internal ? 1 : 0 ).derive( index )
      return AccountUtilities.deriveAddressFromKeyPair(
        keyPair,
        config.DPATH_PURPOSE,
        network
      )
    };

    static getP2SH = ( keyPair: bitcoinJS.ECPairInterface, network: bitcoinJS.Network ): bitcoinJS.Payment =>
      bitcoinJS.payments.p2sh( {
        redeem: bitcoinJS.payments.p2wpkh( {
          pubkey: keyPair.publicKey,
          network,
        } ),
        network,
      } )

    static generateExtendedKey = ( mnemonic: string, privateKey: boolean, network: bitcoinJS.networks.Network, derivationPath: string, passphrase?: string ) => {
      const seed = bip39.mnemonicToSeedSync( mnemonic, passphrase )
      const root = bip32.fromSeed( seed, network )
      const child = privateKey? root.derivePath( derivationPath ): root.derivePath( derivationPath ).neutered()
      const xKey = child.toBase58()
      return xKey
    };

    static generateYpub = ( xpub: string, network: bitcoinJS.Network ): string => {
      let data = bs58check.decode( xpub )
      data = data.slice( 4 )
      let versionBytes
      if ( network == bitcoinJS.networks.bitcoin ) {
        versionBytes = xpub ? '049d7cb2' : '049d7878'
      } else {
        versionBytes = xpub ? '044a5262' : '044a4e28'
      }
      data = Buffer.concat( [ Buffer.from( versionBytes, 'hex' ), data ] )
      return bs58check.encode( data )
    }

    static generateMultiSig = (
      required: number,
      pubKeys: any[],
      network: bitcoinJS.Network
    ): {
    p2wsh: bitcoinJS.Payment;
    p2sh: bitcoinJS.Payment;
    address: string;
  } => {
      const pubkeys = pubKeys.map( ( hex ) => Buffer.from( hex, 'hex' ) )

      const p2ms = bitcoinJS.payments.p2ms( {
        m: required,
        pubkeys,
        network,
      } )
      const p2wsh = bitcoinJS.payments.p2wsh( {
        redeem: p2ms,
        network,
      } )
      const p2sh = bitcoinJS.payments.p2sh( {
        redeem: p2wsh,
        network,
      } )

      return {
        p2wsh,
        p2sh,
        address: p2sh.address,
      }
    }

    static isPaymentURI = ( paymentURI: string ): boolean => {
      if ( paymentURI.slice( 0, 8 ) === 'bitcoin:' ) {
        return true
      }
      return false
    }

    static generatePaymentURI = (
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
    }

    static decodePaymentURI = (
      paymentURI: string,
    ): {
    address: string;
    options: {
      amount?: number;
      label?: string;
      message?: string;
    };
   } => bip21.decode( paymentURI )


    static addressDiff = (
      scannedStr: string,
      network: bitcoinJS.Network
    ): { type: ScannedAddressKind | null } => {
      scannedStr = scannedStr.replace( 'BITCOIN', 'bitcoin' )
      if ( AccountUtilities.isPaymentURI( scannedStr ) ) {
        const { address } = AccountUtilities.decodePaymentURI( scannedStr )
        if ( AccountUtilities.isValidAddress( address, network ) ) {
          return {
            type: ScannedAddressKind.PAYMENT_URI
          }
        }
      } else if ( AccountUtilities.isValidAddress( scannedStr, network ) ) {
        return {
          type: ScannedAddressKind.ADDRESS
        }
      }

      return {
        type: null
      }
    }

    static fetchBalanceTransactionsByAddresses = async (
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
    }},
      network: bitcoinJS.Network
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
          timeout: 7 * REQUEST_TIMEOUT // accounting for blind refresh
        } )
        try{
          if ( network === bitcoinJS.networks.testnet ) {
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
          if ( network === bitcoinJS.networks.testnet ) {
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
        console.log( {
          err
        } )
        throw new Error( 'Fetching balance-txn by addresses failed' )
      }
    }

    static getTxCounts = async ( addresses: string[], network: bitcoinJS.Network ) => {
      const txCounts = {
      }
      try {
        let res: AxiosResponse
        try {
          if ( network === bitcoinJS.networks.testnet ) {
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
        throw new Error( 'Transaction count fetching failed' )
      }
    }

    static broadcastTransaction = async (
      txHex: string,
      network: bitcoinJS.Network
    ): Promise<{
    txid: string;
  }> => {
      let res: AxiosResponse
      try {
        if ( network === bitcoinJS.networks.testnet ) {
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
            if ( network === bitcoinJS.networks.testnet ) {
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
            throw new Error( 'Transaction broadcasting failed' )
          }
        } else {
          Toast( 'We could not connect to your node.\nTry connecting to the BitHyve node- Go to settings ....' )
          throw new Error( 'Transaction broadcasting failed' )
        }
      }
    }

    static testnetFaucet = async ( recipientAddress: string, network: bitcoinJS.networks.Network ): Promise<{
    txid: any;
    funded: any;
  }> => {
      if ( network === bitcoinJS.networks.bitcoin ) {
        throw new Error( 'Invalid network: failed to fund via testnet' )
      }
      const amount = 10000 / SATOSHIS_IN_BTC
      try {
        const res = await BH_AXIOS.post( '/testnetFaucet', {
          HEXA_ID: config.HEXA_ID,
          recipientAddress,
          amount,
        } )
        const { txid, funded } = res.data
        return {
          txid,
          funded,
        }
      } catch ( err ) {
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
    }

  static sortOutputs = async (
    xpub: string,
    outputs: Array<{
      address: string;
      value: number;
    }>,
    nextFreeChangeAddressIndex: number,
    network: bitcoinJS.networks.Network,
  ): Promise<
    Array<{
      address: string;
      value: number;
    }>
  > => {
    for ( const output of outputs ) {
      if ( !output.address ) {
        const changeAddress = AccountUtilities.getAddressByIndex(
          xpub,
          true,
          nextFreeChangeAddressIndex,
          network
        )
        output.address = changeAddress
        // console.log(`adding the change address: ${output.address}`);
      }
    }

    outputs.sort( ( out1, out2 ) => {
      if ( out1.address < out2.address ) {
        return -1
      }
      if ( out1.address > out2.address ) {
        return 1
      }
      return 0
    } )

    return outputs
  };

  static addressToPrivateKey = ( address: string, xpub: string, nextFreeAddressIndex: number, nextFreeChangeAddressIndex: number, network: bitcoinJS.networks.Network ): string => {
    for (
      let itr = 0;
      itr <= nextFreeChangeAddressIndex + config.GAP_LIMIT;
      itr++
    ) {
      if ( AccountUtilities.getAddressByIndex( xpub, true, itr, network ) === address )
        return AccountUtilities.getPrivateKeyByIndex( xpub, true, itr, network )
    }

    for ( let itr = 0; itr <= nextFreeAddressIndex + config.GAP_LIMIT; itr++ ) {
      if ( AccountUtilities.getAddressByIndex( xpub, false, itr, network ) === address )
        return AccountUtilities.getPrivateKeyByIndex( xpub, false, itr, network )
    }

    throw new Error( 'Could not find private key for: ' + address )
  };
}
