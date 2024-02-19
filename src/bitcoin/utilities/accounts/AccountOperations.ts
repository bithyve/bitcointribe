import * as bip32 from 'bip32'
import * as bitcoinJS from 'bitcoinjs-lib'

import {
  Account, Accounts, AccountType, ActiveAddressAssignee,
  ActiveAddresses,
  AverageTxFees,
  AverageTxFeesByNetwork,
  Balances,
  DerivationPurpose,
  Gift,
  GiftStatus,
  GiftThemeId,
  GiftType,
  InputUTXOs,
  MultiSigAccount,
  NetworkType,
  Transaction,
  TransactionPrerequisite,
  TransactionPrerequisiteElements,
  TransactionType,
  TxPriority
} from '../Interface'

import coinselect from 'coinselect'
import coinselectSplit from 'coinselect/split'
import crypto from 'crypto'
import idx from 'idx'
import ElectrumClient from '../../electrum/client'
import TestElectrumClient from '../../electrum/test-client'
import config from '../../HexaConfig'
import { getPurpose } from './AccountFactory'
import AccountUtilities from './AccountUtilities'

export default class AccountOperations {

  static getNextFreeExternalAddress = ( account: Account | MultiSigAccount, requester?: ActiveAddressAssignee ): { updatedAccount: Account | MultiSigAccount, receivingAddress: string} => {
    let receivingAddress
    const network = AccountUtilities.getNetworkByType( account.networkType )
    if( ( account as MultiSigAccount ).is2FA ) receivingAddress = AccountUtilities.createMultiSig(  {
      primary: account.xpub,
      secondary: ( account as MultiSigAccount ).xpubs.secondary,
      bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
    }, 2, network, account.nextFreeAddressIndex, false ).address
    else {
      const purpose = getPurpose( account.derivationPath, account.type )
      receivingAddress = AccountUtilities.getAddressByIndex( account.xpub, false, account.nextFreeAddressIndex, network, purpose )
    }

    account.activeAddresses.external[ receivingAddress ] = {
      index: account.nextFreeAddressIndex,
      assignee: requester? requester: {
        type: account.type,
        id: account.id
      }
    }
    account.nextFreeAddressIndex++
    account.receivingAddress = receivingAddress
    return {
      updatedAccount: account, receivingAddress
    }
  }

  static syncGapLimit = async ( account: Account | MultiSigAccount ) => {
    let tryAgain = false
    const hardGapLimit = 10
    const network = AccountUtilities.getNetworkByType( account.networkType )

    const purpose = getPurpose( account.derivationPath, account.type  )

    let externalAddress: string
    if( ( account as MultiSigAccount ).is2FA ) externalAddress = AccountUtilities.createMultiSig( {
      primary: account.xpub,
      secondary: ( account as MultiSigAccount ).xpubs.secondary,
      bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
    }, 2, network, account.nextFreeAddressIndex + hardGapLimit - 1, false ).address
    else externalAddress = AccountUtilities.getAddressByIndex( account.xpub, false,  account.nextFreeAddressIndex + hardGapLimit - 1, network, purpose )


    let internalAddress: string
    if( ( account as MultiSigAccount ).is2FA ) internalAddress = AccountUtilities.createMultiSig( {
      primary: account.xpub,
      secondary: ( account as MultiSigAccount ).xpubs.secondary,
      bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
    }, 2, network, account.nextFreeChangeAddressIndex + hardGapLimit - 1, true ).address
    else internalAddress = AccountUtilities.getAddressByIndex( account.xpub, true, account.nextFreeChangeAddressIndex + hardGapLimit - 1, network, purpose )

    const txCounts = await AccountUtilities.getTxCounts( [ externalAddress, internalAddress ], network )

    if ( txCounts[ externalAddress ] > 0 ) {
      account.nextFreeAddressIndex += hardGapLimit
      tryAgain = true
    }

    if ( txCounts[ internalAddress ] > 0 ) {
      account.nextFreeChangeAddressIndex += hardGapLimit
      tryAgain = true
    }

    if ( tryAgain ) {
      return AccountOperations.syncGapLimit(
        account
      )
    }
  };

  static importAddress = async ( account: Account | MultiSigAccount, privateKey: string, address: string, requester: ActiveAddressAssignee ) => {
    if( !account.importedAddresses ) account.importedAddresses = {
    }
    account.importedAddresses[ address ] = {
      address,
      privateKey
    }
    account.activeAddresses.external[ address ] = {
      index: -1,
      assignee: requester
    }
  }

  static fetchTransactions = async (
    account: Account,
    addresses: string[],
    externalAddresses: { [address: string]: number },
    internalAddresses: { [address: string]: number },
    network: bitcoinJS.Network
  ) => {

    const client = account.type === AccountType.TEST_ACCOUNT?  TestElectrumClient: ElectrumClient
    const { historyByAddress, txids, txidToAddress } = await client.syncHistoryByAddress(
      addresses,
      network
    )

    const transactions: Transaction[] = []
    const txs = await client.getTransactionsById( txids )

    // saturate transaction:  inputs-params, type, amount
    const inputTxIds = []
    for ( const txid in txs ) {
      for ( const vin of txs[ txid ].vin ) inputTxIds.push( vin.txid )
    }
    const inputTxs = await client.getTransactionsById( inputTxIds )

    let lastUsedAddressIndex = account.nextFreeAddressIndex - 1
    let lastUsedChangeAddressIndex = account.nextFreeChangeAddressIndex - 1

    for ( const txid in txs ) {
      const tx = txs[ txid ]
      // popluate tx-inputs with addresses and values
      const inputs = tx.vin
      for ( let index = 0; index < tx.vin.length; index++ ) {
        const input = inputs[ index ]

        const inputTx = inputTxs[ input.txid ]
        if ( inputTx && inputTx.vout[ input.vout ] ) {
          const vout = inputTx.vout[ input.vout ]
          input.addresses = vout.scriptPubKey.addresses
          input.value = vout.value
        }
      }

      // calculate cumulative amount and transaction type
      const outputs = tx.vout
      let fee = 0 // delta b/w inputs and outputs
      let amount = 0
      const senderAddresses = []
      const recipientAddresses = []

      for ( const input of inputs ) {
        const inputAddress = input.addresses[ 0 ]
        if (
          externalAddresses[ inputAddress ] !== undefined ||
          internalAddresses[ inputAddress ] !== undefined
        )
          amount -= input.value

        senderAddresses.push( inputAddress )
        fee += input.value
      }

      for ( const output of outputs ) {
        const outputAddress = output.scriptPubKey.addresses[ 0 ]
        if (
          externalAddresses[ outputAddress ] !== undefined ||
          internalAddresses[ outputAddress ] !== undefined
        )
          amount += output.value

        recipientAddresses.push( outputAddress )
        fee -= output.value
      }

      const address = txidToAddress[ txid ]

      const transaction: Transaction = {
        txid,
        confirmations: tx.confirmations ? tx.confirmations : 0,
        status: tx.confirmations ? 'Confirmed' : 'Unconfirmed',
        fee: Math.floor( fee * 1e8 ),
        date: tx.time ? new Date( tx.time * 1000 ).toUTCString() : new Date( Date.now() ).toUTCString(),
        transactionType: amount > 0 ? TransactionType.RECEIVED : TransactionType.SENT,
        amount: Math.floor( Math.abs( amount ) * 1e8 ),
        accountType: account.type,
        accountName: account.accountName,
        recipientAddresses,
        senderAddresses,
        address,
        blockTime: tx.blocktime,
      }
      transactions.push( transaction )

      // update the last used address/change-address index
      if ( externalAddresses[ address ] !== undefined ) {
        lastUsedAddressIndex = Math.max( externalAddresses[ address ], lastUsedAddressIndex )
      } else if ( internalAddresses[ address ] !== undefined ) {
        lastUsedChangeAddressIndex = Math.max(
          internalAddresses[ address ],
          lastUsedChangeAddressIndex
        )
      }
    }

    // sort transactions chronologically
    transactions.sort( ( tx1, tx2 ) => ( tx1.confirmations > tx2.confirmations ? 1 : -1 ) )
    return {
      transactions,
      lastUsedAddressIndex,
      lastUsedChangeAddressIndex,
    }
  };

  static syncAccounts = async ( accounts: Accounts, network: bitcoinJS.networks.Network, hardRefresh?: boolean ): Promise<{
    synchedAccounts: Accounts,
    txsFound: Transaction[],
    activeAddressesWithNewTxsMap: {
      [accountId: string]: ActiveAddresses
    }
  }> => {
    const accountInstances: {
      [id: string]: {
        activeAddresses: ActiveAddresses,
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
        cachedTxs: Transaction[],
        cachedTxIdMap: {[txid: string]: string[]},
        lastUsedAddressIndex: number,
        lastUsedChangeAddressIndex: number,
        accountType: string,
        transactionsNote: {
          [txId: string]: string
        }
        contactName?: string,
        primaryAccType?: string,
        accountName?: string,
        hardRefresh?: boolean,
        }
    } = {
    }
    const accountsInternals: {
      [accountId: string]: {
        internalAddresses: {[address: string]: number};
      }
    } = {
    }
    for( const account of Object.values( accounts ) ){
      const purpose = getPurpose( account.derivationPath, account.type )

      const ownedAddresses = [] // owned address mapping
      // owned addresses are used for apt tx categorization and transfer amount calculation

      const hardGapLimit = 5 // hard refresh gap limit
      const externalAddresses :{[address: string]: number}  = {
      }// all external addresses(till closingExtIndex)
      for ( let itr = 0; itr < account.nextFreeAddressIndex + hardGapLimit; itr++ ) {
        let address: string
        if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig( {
          primary: account.xpub,
          secondary: ( account as MultiSigAccount ).xpubs.secondary,
          bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
        }, 2, network, itr, false ).address
        else address = AccountUtilities.getAddressByIndex( account.xpub, false, itr, network, purpose )
        externalAddresses[ address ] = itr
        ownedAddresses.push( address )
      }

      // include imported external addresses
      if( !account.importedAddresses ) account.importedAddresses = {
      }
      Object.keys( account.importedAddresses ).forEach( address => {
        externalAddresses[ address ] = -1
        ownedAddresses.push( address )
      } )

      const internalAddresses :{[address: string]: number}  = {
      }// all internal addresses(till closingIntIndex)
      for ( let itr = 0; itr < account.nextFreeChangeAddressIndex + hardGapLimit; itr++ ) {
        let address: string
        if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig(  {
          primary: account.xpub,
          secondary: ( account as MultiSigAccount ).xpubs.secondary,
          bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
        }, 2, network, itr, true ).address
        else address = AccountUtilities.getAddressByIndex( account.xpub, true, itr, network, purpose )
        internalAddresses[ address ] = itr
        ownedAddresses.push( address )
      }

      // garner cached params for bal-tx sync
      const cachedUTXOs = hardRefresh? []: [ ...account.confirmedUTXOs, ...account.unconfirmedUTXOs ]
      const cachedTxIdMap = hardRefresh? {
      }: account.txIdMap
      const cachedTxs = hardRefresh? []: account.transactions

      let shouldHardRefresh = hardRefresh
      if( !shouldHardRefresh ){
        // hard-refresh SWAN account(default)
        if( account.type === AccountType.SWAN_ACCOUNT ) shouldHardRefresh = true
      }

      accountInstances[ account.id ] = {
        activeAddresses: account.activeAddresses,
        externalAddresses,
        internalAddresses,
        ownedAddresses,
        cachedUTXOs,
        cachedTxs,
        cachedTxIdMap,
        lastUsedAddressIndex: account.nextFreeAddressIndex - 1,
        lastUsedChangeAddressIndex: account.nextFreeChangeAddressIndex - 1,
        transactionsNote: account.transactionsNote,
        accountType: account.type,
        accountName: account.accountName,
        hardRefresh: shouldHardRefresh,
      }

      accountsInternals[ account.id ] = {
        internalAddresses
      }
    }

    const { synchedAccounts } = await AccountUtilities.fetchBalanceTransactionsByAccounts( accountInstances, network )

    const txsFound: Transaction[] = []
    const activeAddressesWithNewTxsMap: {[accountId: string]: ActiveAddresses} = {
    }
    for( const account of Object.values( accounts ) ) {
      const  {
        UTXOs,
        transactions,
        txIdMap,
        nextFreeAddressIndex,
        nextFreeChangeAddressIndex,
        activeAddresses,
        activeAddressesWithNewTxs,
        hasNewTxn
      } = synchedAccounts[ account.id ]
      const { internalAddresses } = accountsInternals[ account.id ]
      const purpose = getPurpose( account.derivationPath, account.type )

      // update utxo sets and balances
      const balances: Balances = {
        confirmed: 0,
        unconfirmed: 0,
      }
      const confirmedUTXOs = []
      const unconfirmedUTXOs = []
      for ( const utxo of UTXOs ) {
        if ( account.type === AccountType.TEST_ACCOUNT ) {
          if( utxo.address === AccountUtilities.getAddressByIndex( account.xpub, false, 0, network, purpose ) ){
            confirmedUTXOs.push( utxo ) // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
            balances.confirmed += utxo.value
            continue
          }
        }

        if ( utxo.status.confirmed ){
          confirmedUTXOs.push( utxo )
          balances.confirmed += utxo.value
        }
        else {
          if ( internalAddresses[ utxo.address ] !== undefined ) {
            // defaulting utxo's on the change branch to confirmed
            confirmedUTXOs.push( utxo )
            balances.confirmed += utxo.value
          }
          else {
            unconfirmedUTXOs.push( utxo )
            balances.unconfirmed += utxo.value
          }
        }
      }

      account.unconfirmedUTXOs = unconfirmedUTXOs
      account.confirmedUTXOs = confirmedUTXOs
      account.balances = balances
      account.nextFreeAddressIndex = nextFreeAddressIndex
      account.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex
      account.activeAddresses = activeAddresses
      account.hasNewTxn = hasNewTxn

      if( ( account as MultiSigAccount ).is2FA ) account.receivingAddress = AccountUtilities.createMultiSig( {
        primary: account.xpub,
        secondary: ( account as MultiSigAccount ).xpubs.secondary,
        bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
      }, 2, network, account.nextFreeAddressIndex, false ).address
      else account.receivingAddress = AccountUtilities.getAddressByIndex( account.xpub, false, account.nextFreeAddressIndex, network, purpose )

      // find tx delta(missing txs): hard vs soft refresh
      // if( hardRefresh ){
      //   if( account.txIdMap && txIdMap ){
      //     const deltaTxs = AccountUtilities.findTxDelta( account.txIdMap, txIdMap, transactions )
      //     if( deltaTxs.length ) txsFound.push( ...deltaTxs )
      //   } else txsFound.push( ...transactions )
      // }
      const { newTransactions, lastSynched } = AccountUtilities.setNewTransactions( transactions, account.lastSynched )

      account.transactions = transactions
      account.txIdMap = txIdMap
      account.newTransactions = newTransactions
      account.lastSynched = lastSynched
      activeAddressesWithNewTxsMap[ account.id ] = activeAddressesWithNewTxs
      account.hasNewTxn = hasNewTxn
    }
    return {
      synchedAccounts: accounts,
      txsFound,
      activeAddressesWithNewTxsMap
    }
  };


  static syncAccountsViaElectrumClient = async (
    accounts: Accounts,
    network: bitcoinJS.networks.Network
  ): Promise<{
    synchedAccounts: Accounts,
  }> => {
    for ( const account of Object.values( accounts ) ) {

      const purpose = getPurpose( account.derivationPath, account.type )
      const hardGapLimit = 10 // hard refresh gap limit
      const addresses = []

      // collect external(receive) chain addresses
      const externalAddresses: { [address: string]: number } = {
      } // all external addresses(till closingExtIndex)
      for ( let itr = 0; itr < account.nextFreeAddressIndex + hardGapLimit; itr++ ) {
        let address: string
        if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig( {
          primary: account.xpub,
          secondary: ( account as MultiSigAccount ).xpubs.secondary,
          bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
        }, 2, network, itr, false ).address
        else address = AccountUtilities.getAddressByIndex( account.xpub, false, itr, network, purpose )

        externalAddresses[ address ] = itr
        addresses.push( address )
      }

      // include imported external addresses
      if( !account.importedAddresses ) account.importedAddresses = {
      }
      Object.keys( account.importedAddresses ).forEach( address => {
        externalAddresses[ address ] = -1
        addresses.push( address )
      } )

      // collect internal(change) chain addresses
      const internalAddresses: { [address: string]: number } = {
      } // all internal addresses(till closingIntIndex)
      for ( let itr = 0; itr < account.nextFreeChangeAddressIndex + hardGapLimit; itr++ ) {
        let address: string
        if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig(  {
          primary: account.xpub,
          secondary: ( account as MultiSigAccount ).xpubs.secondary,
          bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
        }, 2, network, itr, true ).address
        else address = AccountUtilities.getAddressByIndex( account.xpub, true, itr, network, purpose )

        internalAddresses[ address ] = itr
        addresses.push( address )
      }

      const client = account.type === AccountType.TEST_ACCOUNT?  TestElectrumClient: ElectrumClient
      // sync utxos & balances

      const utxosByAddress = await client.syncUTXOByAddress( addresses, network )

      const balances: Balances = {
        confirmed: 0,
        unconfirmed: 0,
      }
      const confirmedUTXOs: InputUTXOs[] = []
      const unconfirmedUTXOs: InputUTXOs[] = []
      for ( const address in utxosByAddress ) {
        const utxos = utxosByAddress[ address ]
        for ( const utxo of utxos ) {
          if ( utxo.height > 0 ) {
            confirmedUTXOs.push( utxo )
            balances.confirmed += utxo.value
          } else if ( internalAddresses[ utxo.address ] !== undefined ) {
            // defaulting utxo's on the change branch to confirmed
            confirmedUTXOs.push( utxo )
            balances.confirmed += utxo.value
          } else {
            unconfirmedUTXOs.push( utxo )
            balances.unconfirmed += utxo.value
          }
        }
      }

      // sync & populate transactions
      const { transactions, lastUsedAddressIndex, lastUsedChangeAddressIndex } =
        await AccountOperations.fetchTransactions(
          account,
          addresses,
          externalAddresses,
          internalAddresses,
          network
        )

      // update wallet w/ latest utxos, balances and transactions
      account.unconfirmedUTXOs = unconfirmedUTXOs
      account.confirmedUTXOs = confirmedUTXOs
      account.balances = balances
      account.transactions = transactions
      account.nextFreeAddressIndex = lastUsedAddressIndex + 1
      account.nextFreeChangeAddressIndex = lastUsedChangeAddressIndex + 1
    }

    return {
      synchedAccounts: accounts,
    }
  };

  static updateActiveAddresses = (
    account: Account,
    consumedUTXOs: {[txid: string]: InputUTXOs},
    txid: string,
    recipients: {
    id?: string;
    address: string;
    amount: number;
    name?: string
    }[] ) => {
    const network = AccountUtilities.getNetworkByType( account.networkType )

    const activeExternalAddresses = account.activeAddresses.external
    const activeInternalAddresses = account.activeAddresses.internal

    const recipientInfo = {
      [ txid ]:recipients.map( recipient => {
        return {
          id: recipient.id,
          name: recipient.name, amount: recipient.amount
        }} ),
    }

    const purpose = getPurpose( account.derivationPath, account.type )
    for( const consumedUTXO of Object.values( consumedUTXOs ) ){
      let found = false
      // is out of bound external address?
      for ( let itr = 0; itr < account.nextFreeAddressIndex; itr++ ) {
        let address: string
        if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig( {
          primary: account.xpub,
          secondary: ( account as MultiSigAccount ).xpubs.secondary,
          bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
        }, 2, network, itr, false ).address
        else address = AccountUtilities.getAddressByIndex( account.xpub, false, itr, network, purpose )

        if( consumedUTXO.address === address ){
          if( !activeExternalAddresses[ address ] )
            activeExternalAddresses[ address ] = {
              index: itr,
              assignee: {
                type: account.type,
                id: account.id,
                recipientInfo,
              },
            } // include out of bound ext address
          else
            activeExternalAddresses[ address ] = {
              ...activeExternalAddresses[ address ],
              assignee: {
                ...activeExternalAddresses[ address ].assignee,
                recipientInfo: idx( activeExternalAddresses[ address ], _ => _.assignee.recipientInfo )? {
                  ...activeExternalAddresses[ address ].assignee.recipientInfo,
                  ...recipientInfo
                }: recipientInfo,
              }
            }
          found = true
          break
        }
      }

      // is out of bound internal address?
      if( !found )
        for ( let itr = 0; itr < account.nextFreeChangeAddressIndex; itr++ ) {
          let address: string
          if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig( {
            primary: account.xpub,
            secondary: ( account as MultiSigAccount ).xpubs.secondary,
            bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
          }, 2, network, itr, true ).address
          else address = AccountUtilities.getAddressByIndex( account.xpub, true, itr, network, purpose )

          if( consumedUTXO.address === address ){
            if( !activeInternalAddresses[ address ] )
              activeInternalAddresses[ address ] = {
                index: itr,
                assignee: {
                  type: account.type,
                  id: account.id,
                  recipientInfo
                },
              } // include out of bound(soft-refresh range) int address
            else
              activeInternalAddresses[ address ] = {
                ...activeInternalAddresses[ address ],
                assignee: {
                  ...activeInternalAddresses[ address ].assignee,
                  recipientInfo: idx( activeInternalAddresses[ address ], _ => _.assignee.recipientInfo )? {
                    ...activeInternalAddresses[ address ].assignee.recipientInfo,
                    ...recipientInfo
                  }: recipientInfo
                }
              }
            found = true
            break
          }
        }
    }

    // add internal address used for change utxo to activeAddresses.internal
    let changeAddress: string

    if( ( account as MultiSigAccount ).is2FA ) changeAddress = AccountUtilities.createMultiSig(  {
      primary: account.xpub,
      secondary: ( account as MultiSigAccount ).xpubs.secondary,
      bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
    }, 2, network, account.nextFreeChangeAddressIndex, true ).address
    else changeAddress = AccountUtilities.getAddressByIndex(
      account.xpub,
      true,
      account.nextFreeChangeAddressIndex,
      network,
      purpose
    )

    activeInternalAddresses[ changeAddress ] = {
      index: account.nextFreeChangeAddressIndex,
      assignee: {
        type: account.type,
        id: account.id
      },
    }
    account.nextFreeChangeAddressIndex++
  }

  static removeConsumedUTXOs= (
    account: Account | MultiSigAccount,
    inputs: InputUTXOs[],
    txid: string,
    recipients: {
    id?: string,
    address: string;
    amount: number;
    name?: string
  }[] ) => {
    const consumedUTXOs: {[txid: string]: InputUTXOs} = {
    }
    inputs.forEach( ( input ) => {
      consumedUTXOs[ input.txId ] = input
    } )

    // update primary utxo set and balance
    const updatedUTXOSet = []

    account.confirmedUTXOs.forEach( confirmedUTXO => {
      if( !consumedUTXOs[ confirmedUTXO.txId ] ) updatedUTXOSet.push( confirmedUTXO )
    } )

    account.confirmedUTXOs = updatedUTXOSet
    AccountOperations.updateActiveAddresses( account, consumedUTXOs, txid, recipients )
  }

  static calculateSendMaxFee = (
    account: Account,
    numberOfRecipients: number,
    feePerByte: number,
    network: bitcoinJS.networks.Network
  ): { fee: number } => {

    const inputUTXOs = account.confirmedUTXOs
    let confirmedBalance = 0
    inputUTXOs.forEach( ( utxo ) => {
      confirmedBalance += utxo.value
    } )

    const outputUTXOs = []
    for ( let index = 0; index < numberOfRecipients; index++ ) {
      // using random outputs for send all fee calculation
      outputUTXOs.push( {
        address: bitcoinJS.payments.p2sh( {
          redeem: bitcoinJS.payments.p2wpkh( {
            pubkey: bitcoinJS.ECPair.makeRandom().publicKey,
            network,
          } ),
          network,
        } ).address,
      } )
    }
    const { fee } = coinselectSplit(
      inputUTXOs,
      outputUTXOs,
      feePerByte,
    )

    return {
      fee
    }
  };

  static fetchFeeRatesByPriority = async () => {
    // high fee: 30 minutes
    const highFeeBlockEstimate = 3
    const high = {
      feePerByte: Math.round( await ElectrumClient.estimateFee( highFeeBlockEstimate ) ),
      estimatedBlocks: highFeeBlockEstimate,
    } // high: within 3 blocks

    // medium fee: 2 hours
    const mediumFeeBlockEstimate = 12
    const medium = {
      feePerByte: Math.round( await ElectrumClient.estimateFee( mediumFeeBlockEstimate ) ),
      estimatedBlocks: mediumFeeBlockEstimate,
    } // medium: within 12 blocks

    // low fee: 6 hours
    const lowFeeBlockEstimate = 36
    const low = {
      feePerByte: Math.round( await ElectrumClient.estimateFee( lowFeeBlockEstimate ) ),
      estimatedBlocks: lowFeeBlockEstimate,
    } // low: within 36 blocks

    const feeRatesByPriority = {
      high, medium, low
    }
    return feeRatesByPriority
  };

  static calculateAverageTxFee = async () => {
    const feeRatesByPriority = await AccountOperations.fetchFeeRatesByPriority()
    const averageTxSize = 226 // the average Bitcoin transaction is about 226 bytes in size (1 Inp (148); 2 Out)
    const averageTxFees: AverageTxFees = {
      high: {
        averageTxFee: Math.round( averageTxSize * feeRatesByPriority.high.feePerByte ),
        feePerByte: feeRatesByPriority.high.feePerByte,
        estimatedBlocks: feeRatesByPriority.high.estimatedBlocks,
      },
      medium: {
        averageTxFee: Math.round( averageTxSize * feeRatesByPriority.medium.feePerByte ),
        feePerByte: feeRatesByPriority.medium.feePerByte,
        estimatedBlocks: feeRatesByPriority.medium.estimatedBlocks,
      },
      low: {
        averageTxFee: Math.round( averageTxSize * feeRatesByPriority.low.feePerByte ),
        feePerByte: feeRatesByPriority.low.feePerByte,
        estimatedBlocks: feeRatesByPriority.low.estimatedBlocks,
      },
    }

    // TODO: configure to procure fee by network type
    const averageTxFeeByNetwork: AverageTxFeesByNetwork = {
      [ NetworkType.TESTNET ]: averageTxFees,
      [ NetworkType.MAINNET ]: averageTxFees,
    }
    return averageTxFeeByNetwork
  };

  static prepareTransactionPrerequisites = (
    account: Account | MultiSigAccount,
    recipients: {
      address: string;
      amount: number;
    }[],
    averageTxFees: AverageTxFees,
  ): {
        fee: number;
        balance: number;
        txPrerequisites?: undefined;
      }
    | {
        txPrerequisites: TransactionPrerequisite;
        fee?: undefined;
        balance?: undefined;
      } => {

    const inputUTXOs = account.confirmedUTXOs
    let confirmedBalance = 0
    inputUTXOs.forEach( ( utxo ) => {
      confirmedBalance += utxo.value
    } )

    const outputUTXOs = []
    for ( const recipient of recipients ) {
      outputUTXOs.push( {
        address: recipient.address,
        value: recipient.amount,
      } )
    }

    const defaultTxPriority = TxPriority.LOW // doing base calculation with low fee (helps in sending the tx even if higher priority fee isn't possible)
    const defaultFeePerByte = averageTxFees[ defaultTxPriority ].feePerByte
    const defaultEstimatedBlocks =
      averageTxFees[ defaultTxPriority ].estimatedBlocks

    const assets = coinselect( inputUTXOs, outputUTXOs, defaultFeePerByte )
    const defaultPriorityInputs = assets.inputs
    const defaultPriorityOutputs = assets.outputs
    const defaultPriorityFee = assets.fee

    let netAmount = 0
    recipients.forEach( ( recipient ) => {
      netAmount += recipient.amount
    } )
    const defaultDebitedAmount = netAmount + defaultPriorityFee
    if ( !defaultPriorityInputs || defaultDebitedAmount > confirmedBalance ) {
      // insufficient input utxos to compensate for output utxos + lowest priority fee
      return {
        fee: defaultPriorityFee, balance: confirmedBalance
      }
    }

    const txPrerequisites: TransactionPrerequisite = {
    }

    for ( const priority of [ TxPriority.LOW, TxPriority.MEDIUM, TxPriority.HIGH ] ) {
      if (
        priority === defaultTxPriority ||
        defaultDebitedAmount === confirmedBalance
      ) {
        txPrerequisites[ priority ] = {
          inputs: defaultPriorityInputs,
          outputs: defaultPriorityOutputs,
          fee: defaultPriorityFee,
          estimatedBlocks: defaultEstimatedBlocks,
        }
      } else {
        // re-computing inputs with a non-default priority fee
        const { inputs, outputs, fee } = coinselect(
          inputUTXOs,
          outputUTXOs,
          averageTxFees[ priority ].feePerByte,
        )
        const debitedAmount = netAmount + fee
        if ( !inputs || debitedAmount > confirmedBalance ) {
          // to previous priority assets
          if ( priority === TxPriority.MEDIUM )
            txPrerequisites[ priority ] = txPrerequisites[ TxPriority.LOW ]
          if ( priority === TxPriority.HIGH )
            txPrerequisites[ priority ] = txPrerequisites[ TxPriority.MEDIUM ]
        } else {
          txPrerequisites[ priority ] = {
            inputs,
            outputs,
            fee,
            estimatedBlocks: averageTxFees[ priority ].estimatedBlocks,
          }
        }
      }
    }

    return {
      txPrerequisites
    }
  };

  static prepareCustomTransactionPrerequisites = (
    account: Account | MultiSigAccount,
    outputUTXOs: {
      address: string;
      value: number;
    }[],
    customTxFeePerByte: number,
  ): TransactionPrerequisiteElements => {
    const inputUTXOs = account.confirmedUTXOs

    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      customTxFeePerByte,
    )

    if ( !inputs ) return {
      fee
    }

    return {
      inputs, outputs, fee
    }
  };

  static createTransaction = async (
    account: Account | MultiSigAccount,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: TransactionPrerequisiteElements,
    nSequence?: number,
  ): Promise<{
    PSBT: bitcoinJS.Psbt;
  }> => {
    try {
      let inputs, outputs
      if ( txnPriority === TxPriority.CUSTOM && customTxPrerequisites ) {
        inputs = customTxPrerequisites.inputs
        outputs = customTxPrerequisites.outputs
      } else {
        inputs = txPrerequisites[ txnPriority ].inputs
        outputs = txPrerequisites[ txnPriority ].outputs
      }

      const network = AccountUtilities.getNetworkByType( account.networkType )

      const PSBT: bitcoinJS.Psbt = new bitcoinJS.Psbt( {
        network,
      } )

      for ( const input of inputs ) {
        const privateKey = AccountUtilities.addressToPrivateKey(
          input.address,
          account
        )
        const keyPair = AccountUtilities.getKeyPair(
          privateKey,
          network
        )
        const p2wpkh = bitcoinJS.payments.p2wpkh( {
          pubkey: keyPair.publicKey,
          network,
        } )

        const purpose = getPurpose( account.derivationPath, account.type )

        if ( purpose === DerivationPurpose.BIP84 ) {
          PSBT.addInput( {
            hash: input.txId,
            index: input.vout,
            bip32Derivation: [],
            witnessUtxo: {
              script: p2wpkh.output,
              value: input.value,
            },
          } )
        } else if ( purpose === DerivationPurpose.BIP49 ) {
          const p2sh = bitcoinJS.payments.p2sh( {
            redeem: p2wpkh,
          } )

          PSBT.addInput( {
            hash: input.txId,
            index: input.vout,
            bip32Derivation: [],
            witnessUtxo: {
              script: p2sh.output,
              value: input.value,
            },
            redeemScript: p2wpkh.output,
          } )
        } else throw new Error( 'Unsupported input version' )
      }

      const sortedOuts = await AccountUtilities.sortOutputs(
        account,
        outputs,
        account.nextFreeChangeAddressIndex,
        network
      )

      for ( const output of sortedOuts ) {
        PSBT.addOutput( output )
      }

      return {
        PSBT,
      }
    } catch ( err ) {
      throw new Error( `Transaction creation failed: ${err.message}` )
    }
  };

  static signTransaction = (
    account: Account | MultiSigAccount,
    inputs: any,
    PSBT: bitcoinJS.Psbt,
    witnessScript?: any,
  ): {
    signedPSBT: bitcoinJS.Psbt;
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }> | null;
  } => {
    try {
      let vin = 0
      const childIndexArray = []
      const network = AccountUtilities.getNetworkByType( account.networkType )

      for ( const input of inputs ) {
        let keyPair, redeemScript
        if( ( account as MultiSigAccount ).is2FA ){
          const { multiSig, primaryPriv, childIndex } = AccountUtilities.signingEssentialsForMultiSig(
            ( account as MultiSigAccount ),
            input.address,
          )

          keyPair = bip32.fromBase58( primaryPriv, network )
          redeemScript = Buffer.from( multiSig.scripts.redeem, 'hex' )
          witnessScript = Buffer.from( multiSig.scripts.witness, 'hex' )
          childIndexArray.push( {
            childIndex,
            inputIdentifier: {
              txId: input.txId,
              vout: input.vout,
              value: input.value,
            },
          } )
        } else {
          const privateKey = AccountUtilities.addressToPrivateKey(
            input.address,
            account
          )

          keyPair = AccountUtilities.getKeyPair(
            privateKey,
            network
          )
          redeemScript = AccountUtilities.getP2SH( keyPair, network ).redeem.output
        }

        PSBT.signInput( vin, keyPair )
        vin++
      }

      return {
        signedPSBT: PSBT, childIndexArray: childIndexArray.length? childIndexArray: null
      }
    } catch ( err ) {
      throw new Error( `Transaction signing failed: ${err.message}` )
    }
  };

  static multiSignTransaction = (
    account: MultiSigAccount,
    inputs: any,
    PSBT: bitcoinJS.Psbt,
  ): {
    signedPSBT: bitcoinJS.Psbt;
  } => {
    let vin = 0

    if( !account.xprivs.secondary ) throw new Error( 'Multi-sign transaction failed: secondary xpriv missing' )
    const network = AccountUtilities.getNetworkByType( account.networkType )

    inputs.forEach( ( input ) => {
      const { multiSig, secondaryPriv } = AccountUtilities.signingEssentialsForMultiSig(
        account,
        input.address,
      )

      const keyPair = bip32.fromBase58( secondaryPriv, network )
      const redeemScript = Buffer.from( multiSig.scripts.redeem, 'hex' )
      const witnessScript = Buffer.from( multiSig.scripts.witness, 'hex' )

      PSBT.signInput( vin, keyPair )
      vin += 1
    } )

    return {
      signedPSBT: PSBT
    }
  };

  static transferST1 = async (
    account: Account | MultiSigAccount,
    recipients: {
      address: string;
      amount: number;
    }[],
    averageTxFees: AverageTxFees,
  ): Promise<
     {
      txPrerequisites: TransactionPrerequisite;
      }
  > => {

    recipients = recipients.map( ( recipient ) => {
      recipient.amount = Math.round( recipient.amount )
      return recipient
    } )

    let {
      fee,
      balance,
      txPrerequisites,
    } = AccountOperations.prepareTransactionPrerequisites(
      account,
      recipients,
      averageTxFees,
    )

    let netAmount = 0
    recipients.forEach( ( recipient ) => {
      netAmount += recipient.amount
    } )

    if ( balance < netAmount + fee ) {
      // check w/ the lowest fee possible for this transaction
      const minTxFeePerByte = 1 // default minimum relay fee
      const minAvgTxFee = {
        ...averageTxFees
      }
      minAvgTxFee[ TxPriority.LOW ].feePerByte = minTxFeePerByte

      const minTxPrerequisites  = AccountOperations.prepareTransactionPrerequisites(
        account,
        recipients,
        minAvgTxFee,
      )

      if( minTxPrerequisites.balance < netAmount + minTxPrerequisites.fee )
        throw new Error( 'Insufficient balance' )
      else txPrerequisites = minTxPrerequisites.txPrerequisites
    }

    if ( Object.keys( txPrerequisites ).length ) {
      return  {
        txPrerequisites
      }
    } else {
      throw new Error(
        'Unable to create transaction: inputs failed at coinselect',
      )
    }
  };

  static transferST2 = async (
    account: Account | MultiSigAccount,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: TxPriority,
    network: bitcoinJS.networks.Network,
    recipients: {
      id?: string,
      address: string;
      amount: number;
      name?: string
    }[],
    token?: number,
    customTxPrerequisites?: TransactionPrerequisiteElements,
    nSequence?: number,
  ): Promise<
     {
      txid: string;
     }
  > => {
    const { PSBT } = await AccountOperations.createTransaction(
      account,
      txPrerequisites,
      txnPriority,
      customTxPrerequisites,
      nSequence,
    )

    let inputs
    if ( txnPriority === TxPriority.CUSTOM && customTxPrerequisites ) inputs = customTxPrerequisites.inputs
    else inputs = txPrerequisites[ txnPriority ].inputs


    const { signedPSBT, childIndexArray } = AccountOperations.signTransaction( account, inputs, PSBT )
    const areSignaturesValid = signedPSBT.validateSignaturesOfAllInputs()
    if ( !areSignaturesValid ) throw new Error( 'Failed to broadcast: invalid signatures' )

    let txHex
    if( ( account as MultiSigAccount ).is2FA ){
      if( token ){
        const partiallySignedTxHex = PSBT.extractTransaction().toHex()
        const { signedTxHex } =  await AccountUtilities.getSecondSignature(
          account.walletId,
          token,
          partiallySignedTxHex,
          childIndexArray,
        )
        txHex = signedTxHex
      } else if( ( account as MultiSigAccount ).xprivs.secondary ){
        const { signedPSBT } = AccountOperations.multiSignTransaction(
          ( account as MultiSigAccount ),
          inputs,
          PSBT,
        )
        const tx = signedPSBT.finalizeAllInputs()
        txHex = tx.extractTransaction().toHex()

        delete ( account as MultiSigAccount ).xprivs.secondary
      } else throw new Error( 'Multi-sig transaction failed: token/secondary-key missing' )

    } else {
      const tx = signedPSBT.finalizeAllInputs()
      txHex = tx.extractTransaction().toHex()
    }

    const client = account.type === AccountType.TEST_ACCOUNT?  TestElectrumClient: ElectrumClient
    const txid = await client.broadcast( txHex )
    if ( !txid ) throw new Error( 'Failed to broadcast transaction, txid missing' )

    if ( txid.includes( 'sendrawtransaction RPC error' ) ) {
      let err
      try {
        err = txid.split( ':' )[ 3 ].split( '"' )[ 1 ]
      } catch ( err ) {}
      throw new Error( err || txid )
    }

    AccountOperations.removeConsumedUTXOs( account, inputs, txid, recipients )  // chip consumed utxos
    return {
      txid
    }
  };

  static sweepPrivateKey = async (
    privateKey: string,
    address:string,
    recipientAddress: string,
    averageTxFees: AverageTxFees,
    network: bitcoinJS.networks.Network,
    derivationPurpose: DerivationPurpose = DerivationPurpose.BIP84,
  ): Promise<{
    txid: string;
   }> => {
    const keyPair = AccountUtilities.getKeyPair( privateKey, network )

    // fetch input utxos against the address
    const { confirmedUTXOs } = await AccountUtilities.fetchBalanceTransactionByAddresses( [ address ], network )
    if( confirmedUTXOs.length === 0 ) throw new Error( 'Insufficient balance to perform send' )
    const inputUTXOs: InputUTXOs[] = confirmedUTXOs


    // prepare outputs
    const outputUTXOs = [ {
      address: recipientAddress
    } ]

    // perform coinselection
    const defaultTxPriority = TxPriority.LOW
    const defaultFeePerByte = averageTxFees[ defaultTxPriority ].feePerByte
    const { inputs, outputs } = coinselectSplit( inputUTXOs, outputUTXOs, defaultFeePerByte )

    // build trasaction
    const PSBT: bitcoinJS.Psbt = new bitcoinJS.Psbt( {
      network
    }
    )

    for ( const input of inputs ) {
      if( derivationPurpose === DerivationPurpose.BIP84 ){
        // native segwit

        const p2wpkh = bitcoinJS.payments.p2wpkh( {
          pubkey: keyPair.publicKey,
          network,
        } )

        PSBT.addInput( {
          hash: input.txId,
          index: input.vout,

          witnessUtxo: {
            script: p2wpkh.output,
            value: input.value,
          },
        } )

      }
    }
    for ( const output of outputs ) PSBT.addOutput( output )

    // sign transaction
    let vin = 0
    for ( const input of inputs ) {
      // const redeemScript = derivationPurpose === DerivationPurpose.BIP84? null: AccountUtilities.getP2SH( keyPair, network ).redeem.output
      PSBT.signInput( vin, keyPair, ) // native segwit
      vin++
    }

    // broadcast transaciton
    const areSignaturesValid = PSBT.validateSignaturesOfAllInputs()
    if( areSignaturesValid ){
      const txHex =  PSBT.finalizeAllInputs().extractTransaction().toHex()
      const { txid } = await AccountUtilities.broadcastTransaction( txHex, network )
      return {
        txid
      }
    } else throw new Error( 'Invalid Signatures' )
  }

  static generateGifts = async (
    walletDetails: {
      walletId: string,
      walletName: string,
    },
    account: Account | MultiSigAccount,
    amounts: number[],
    averageTxFees: AverageTxFees,
    includeFee?: boolean,
    exclusiveGifts?: boolean,
    validity: number = config.DEFAULT_GIFT_VALIDITY,
  ): Promise<{
    txid: string;
    gifts: Gift[];
   }> => {

    const network = AccountUtilities.getNetworkByType( account.networkType )
    const txPriority = TxPriority.LOW

    const recipients = []
    const gifts: Gift[] = []
    let exclusiveGiftCode
    if( exclusiveGifts ) exclusiveGiftCode = walletDetails.walletId.slice( 0, 5 ) + '-' + Date.now()

    amounts.forEach( amount => {
      const keyPair = bitcoinJS.ECPair.makeRandom( {
        network: network
      } )

      const privateKey = keyPair.toWIF()
      const address = AccountUtilities.deriveAddressFromKeyPair(
        keyPair,
        network
      )

      recipients.push( {
        address,
        amount,
        name: 'Gift',
      } )

      const id = crypto.createHash( 'sha256' ).update( privateKey ).digest( 'hex' )
      const createdGift: Gift = {
        id,
        privateKey,
        address,
        amount,
        type: GiftType.SENT,
        status: GiftStatus.CREATED,
        themeId: GiftThemeId.ONE,
        timestamps: {
          created: Date.now(),
        },
        validitySpan: validity,
        sender: {
          walletId: walletDetails.walletId,
          walletName: walletDetails.walletName,
          accountId: account.id,
        },
        receiver: {
        },
        exclusiveGiftCode,
      }

      gifts.push( createdGift )
    } )

    const { txPrerequisites } = await AccountOperations.transferST1( account, recipients, averageTxFees )
    let feeDeductedFromAddress: string
    const priorityBasedTxPrerequisites = txPrerequisites[ txPriority ]

    if( includeFee ){
      priorityBasedTxPrerequisites.outputs.forEach( output => {
        if( !output.address ){
          // adding back fee to the change address
          output.value += priorityBasedTxPrerequisites.fee
        } else {
          // deducting fee from the gift(or one of the gifts)
          if( !feeDeductedFromAddress ){
            output.value -= priorityBasedTxPrerequisites.fee
            if( output.value <= 0 ) throw new Error( 'Failed to generate gifts, inclusion fee is greater than gift amount' )
            feeDeductedFromAddress = output.address
          }
        }
      } )
    }

    if( feeDeductedFromAddress ){
      recipients.forEach( recipient => {
        if( recipient.address === feeDeductedFromAddress ) recipient.amount -= priorityBasedTxPrerequisites.fee
      } )

      gifts.forEach( gift => {
        if( gift.address === feeDeductedFromAddress ) gift.amount -= priorityBasedTxPrerequisites.fee
      } )
    }

    const { txid } = await AccountOperations.transferST2( account, txPrerequisites, txPriority, network, recipients )

    return {
      txid, gifts
    }
  }
}
