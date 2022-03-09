import * as bitcoinJS from 'bitcoinjs-lib'
import * as bip32 from 'bip32'
import crypto from 'crypto'
import coinselect from 'coinselect'
import coinselectSplit from 'coinselect/split'
import {
  Transaction,
  TransactionPrerequisite,
  InputUTXOs,
  AverageTxFees,
  TransactionPrerequisiteElements,
  Account,
  TxPriority,
  MultiSigAccount,
  Accounts,
  AccountType,
  DonationAccount,
  ActiveAddresses,
  ActiveAddressAssignee,
  Balances,
  Gift,
  GiftType,
  GiftStatus,
  GiftThemeId,
  DerivationPurpose,
} from '../Interface'
import AccountUtilities from './AccountUtilities'
import config from '../../HexaConfig'
import idx from 'idx'
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
      const purpose = account.type === AccountType.SWAN_ACCOUNT? DerivationPurpose.BIP84: DerivationPurpose.BIP49
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

    const purpose = account.type === AccountType.SWAN_ACCOUNT? DerivationPurpose.BIP84: DerivationPurpose.BIP49
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
      const purpose = account.type === AccountType.SWAN_ACCOUNT? DerivationPurpose.BIP84: DerivationPurpose.BIP49
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
      const purpose = account.type === AccountType.SWAN_ACCOUNT? DerivationPurpose.BIP84: DerivationPurpose.BIP49

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

  static syncDonationAccount = async ( account: DonationAccount, network: bitcoinJS.networks.Network ): Promise<{
    synchedAccount: Account,
  }> => {

    const xpubId = account.id
    const donationId = account.id.slice( 0, 15 )
    const { nextFreeAddressIndex, nextFreeChangeAddressIndex, utxos, balances, transactions } = await AccountUtilities.syncViaXpubAgent( xpubId, donationId )
    const internalAddresses = []
    for ( let itr = 0; itr < nextFreeChangeAddressIndex + config.DONATION_GAP_LIMIT_INTERNAL; itr++ )
    {
      let address
      if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig(  {
        primary: account.xpub,
        secondary: ( account as MultiSigAccount ).xpubs.secondary,
        bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
      }, 2, network, itr, true ).address
      else address = AccountUtilities.getAddressByIndex( account.xpub, true, itr, network )
      internalAddresses.push( address )
    }

    const confirmedUTXOs = []
    const unconfirmedUTXOs = []
    for ( const utxo of utxos ) {
      if ( utxo.status ) {
        if ( utxo.status.confirmed ) confirmedUTXOs.push( utxo )
        else {
          if ( internalAddresses.includes( utxo.address ) ) {
            // defaulting utxo's on the change branch to confirmed
            confirmedUTXOs.push( utxo )
          }
          else unconfirmedUTXOs.push( utxo )
        }
      } else {
        // utxo's from fallback won't contain status var (defaulting them as confirmed)
        confirmedUTXOs.push( utxo )
      }
    }

    const { newTransactions, lastSynched } = AccountUtilities.setNewTransactions( transactions, account.lastSynched )
    account.unconfirmedUTXOs = unconfirmedUTXOs
    account.confirmedUTXOs = confirmedUTXOs
    account.balances = balances
    account.nextFreeAddressIndex = nextFreeAddressIndex
    account.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex
    account.transactions = transactions
    account.newTransactions = newTransactions
    account.lastSynched = lastSynched
    if( ( account as MultiSigAccount ).is2FA ) account.receivingAddress = AccountUtilities.createMultiSig(  {
      primary: account.xpub,
      secondary: ( account as MultiSigAccount ).xpubs.secondary,
      bithyve: ( account as MultiSigAccount ).xpubs.bithyve,
    }, 2, network, account.nextFreeAddressIndex, false ).address
    else account.receivingAddress = AccountUtilities.getAddressByIndex( account.xpub, false, account.nextFreeAddressIndex, network )

    return {
      synchedAccount: account
    }
  }

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

    const purpose = account.type === AccountType.SWAN_ACCOUNT? DerivationPurpose.BIP84: DerivationPurpose.BIP49
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
    console.log( {
      inputUTXOs, outputUTXOs, customTxFeePerByte
    } )
    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      customTxFeePerByte,
    )
    console.log( {
      inputs, outputs, fee
    } )
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
    txb: bitcoinJS.TransactionBuilder;
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

      // console.log({ inputs, outputs });
      const txb: bitcoinJS.TransactionBuilder = new bitcoinJS.TransactionBuilder(
        network,
      )

      for ( const input of inputs ) {
        if( account.type === AccountType.SWAN_ACCOUNT ){
          // native segwit
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
          txb.addInput( input.txId, input.vout, nSequence, p2wpkh.output )
        } else txb.addInput( input.txId, input.vout, nSequence )
      }

      const sortedOuts = await AccountUtilities.sortOutputs(
        account,
        outputs,
        account.nextFreeChangeAddressIndex,
        network
      )

      for ( const output of sortedOuts ) {
        txb.addOutput( output.address, output.value )
      }

      return {
        txb,
      }
    } catch ( err ) {
      throw new Error( `Transaction creation failed: ${err.message}` )
    }
  };

  static signTransaction = (
    account: Account | MultiSigAccount,
    inputs: any,
    txb: bitcoinJS.TransactionBuilder,
    witnessScript?: any,
  ): {
    signedTxb: bitcoinJS.TransactionBuilder;
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

        if( account.type === AccountType.SWAN_ACCOUNT ){
          // native segwit
          txb.sign(
            vin,
            keyPair,
            null,
            null,
            input.value,
          )
        } else {
          txb.sign(
            vin,
            keyPair,
            redeemScript,
            null,
            input.value,
            witnessScript,
          )
        }

        vin++
      }

      return {
        signedTxb: txb, childIndexArray: childIndexArray.length? childIndexArray: null
      }
    } catch ( err ) {
      throw new Error( `Transaction signing failed: ${err.message}` )
    }
  };

  static multiSignTransaction = (
    account: MultiSigAccount,
    inputs: any,
    txb: bitcoinJS.TransactionBuilder,
  ): {
    signedTxb: bitcoinJS.TransactionBuilder;
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

      txb.sign(
        vin,
        keyPair,
        redeemScript,
        null,
        input.value,
        witnessScript,
      )
      vin += 1
    } )

    return {
      signedTxb: txb
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
    const { txb } = await AccountOperations.createTransaction(
      account,
      txPrerequisites,
      txnPriority,
      customTxPrerequisites,
      nSequence,
    )

    let inputs
    if ( txnPriority === TxPriority.CUSTOM && customTxPrerequisites ) inputs = customTxPrerequisites.inputs
    else inputs = txPrerequisites[ txnPriority ].inputs


    const { signedTxb, childIndexArray } = AccountOperations.signTransaction( account, inputs, txb )
    let txHex

    if( ( account as MultiSigAccount ).is2FA ){
      if( token ){
        const partiallySignedTxHex = signedTxb.buildIncomplete().toHex()
        const { signedTxHex } =  await AccountUtilities.getSecondSignature(
          account.walletId,
          token,
          partiallySignedTxHex,
          childIndexArray,
        )
        txHex = signedTxHex
      } else if( ( account as MultiSigAccount ).xprivs.secondary ){
        const { signedTxb } = AccountOperations.multiSignTransaction(
          ( account as MultiSigAccount ),
          inputs,
          txb,
        )
        txHex = signedTxb.build().toHex()
        delete ( account as MultiSigAccount ).xprivs.secondary
      } else throw new Error( 'Multi-sig transaction failed: token/secondary-key missing' )

    } else {
      txHex = signedTxb.build().toHex()
    }

    const { txid } = await AccountUtilities.broadcastTransaction( txHex, network )
    if( txid.includes( 'sendrawtransaction RPC error' ) ){
      let err
      try{
        err = ( txid.split( ':' )[ 3 ] ).split( '"' )[ 1 ]
      } catch( err ){
        console.log( {
          err
        } )
      }
      throw new Error( err )
    }

    if( txid ){
      AccountOperations.removeConsumedUTXOs( account, inputs, txid, recipients )  // chip consumed utxos
    }
    else throw new Error( 'Failed to broadcast transaction, txid missing' )
    return {
      txid
    }
  };

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
