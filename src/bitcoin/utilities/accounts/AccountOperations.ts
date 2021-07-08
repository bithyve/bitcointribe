import * as bitcoinJS from 'bitcoinjs-lib'
import * as bip32 from 'bip32'
import coinselect from 'coinselect'
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
} from '../Interface'
import AccountUtilities from './AccountUtilities'
import config from '../../HexaConfig'
export default class AccountOperations {

  static syncGapLimit = async ( account: Account | MultiSigAccount ) => {
    let tryAgain = false
    const hardGapLimit = 10
    const network = AccountUtilities.getNetworkByType( account.networkType )

    let externalAddress: string
    if( ( account as MultiSigAccount ).is2FA ) externalAddress = AccountUtilities.createMultiSig(  ( account as MultiSigAccount ).xpubs, 2, network, account.nextFreeAddressIndex + hardGapLimit - 1, false ).address
    else externalAddress = AccountUtilities.getAddressByIndex( account.xpub, false,  account.nextFreeAddressIndex + hardGapLimit - 1, network )


    let internalAddress: string
    if( ( account as MultiSigAccount ).is2FA ) internalAddress = AccountUtilities.createMultiSig(  ( account as MultiSigAccount ).xpubs, 2, network, account.nextFreeChangeAddressIndex + hardGapLimit - 1, true ).address
    else internalAddress = AccountUtilities.getAddressByIndex( account.xpub, true, account.nextFreeChangeAddressIndex + hardGapLimit - 1, network )

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

  static syncAccounts = async ( accounts: Accounts, network: bitcoinJS.networks.Network, hardRefresh?: boolean, blindRefresh?: boolean  ): Promise<{
    synchedAccounts: Accounts,
    txsFound: Transaction[]
  }> => {

    const accountInstances: {
      [id: string]: {
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
        cachedTxs: Transaction[],
        cachedTxIdMap: {[txid: string]: string[]},
        cachedAQL: {external: {[address: string]: boolean}, internal: {[address: string]: boolean} },
        lastUsedAddressIndex: number,
        lastUsedChangeAddressIndex: number,
        accountType: string,
        contactName?: string,
        primaryAccType?: string,
        accountName?: string,
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
      const ownedAddresses = [] // owned address mapping
      // owned addresses are used for apt tx categorization and transfer amount calculation

      // if( blindRefresh ) await AccountOperations.syncGapLimit( account )

      // init refresh dependent params
      let startingExtIndex: number, closingExtIndex: number, startingIntIndex: number, closingIntIndex: number
      if( hardRefresh ){
        const hardGapLimit  = 10
        startingExtIndex = 0
        closingExtIndex = account.nextFreeAddressIndex + hardGapLimit
        startingIntIndex = 0
        closingIntIndex = account.nextFreeChangeAddressIndex + hardGapLimit
      }
      else {
        const softGapLimit = 5
        startingExtIndex = account.nextFreeAddressIndex - softGapLimit >= 0? account.nextFreeAddressIndex - softGapLimit : 0
        closingExtIndex = account.nextFreeAddressIndex + softGapLimit
        startingIntIndex = account.nextFreeChangeAddressIndex - softGapLimit >= 0? account.nextFreeChangeAddressIndex - softGapLimit : 0
        closingIntIndex = account.nextFreeChangeAddressIndex + softGapLimit
      }

      const externalAddresses :{[address: string]: number}  = {
      }// all external addresses(till closingExtIndex)
      const externalAddressSet:{[address: string]: number}= {
      } // external address range set w/ query list
      for ( let itr = 0; itr < closingExtIndex; itr++ ) {
        let address: string
        if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig(  ( account as MultiSigAccount ).xpubs, 2, network, itr, false ).address
        else address = AccountUtilities.getAddressByIndex( account.xpub, false, itr, network )
        externalAddresses[ address ] = itr
        ownedAddresses.push( address )
        if( itr >= startingExtIndex ) externalAddressSet[ address ] = itr
      }

      const internalAddresses :{[address: string]: number}  = {
      }// all internal addresses(till closingIntIndex)
      const internalAddressSet :{[address: string]: number}= {
      } // internal address range set
      for ( let itr = 0; itr < closingIntIndex; itr++ ) {
        let address: string
        if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig(  ( account as MultiSigAccount ).xpubs, 2, network, itr, true ).address
        else address = AccountUtilities.getAddressByIndex( account.xpub, true, itr, network )
        internalAddresses[ address ] = itr
        ownedAddresses.push( address )
        if( itr >= startingIntIndex ) internalAddressSet[ address ] = itr
      }

      // garner cached params for bal-tx sync
      let cachedUTXOs =  [ ...account.confirmedUTXOs, ...account.unconfirmedUTXOs ]
      let cachedTxIdMap = account.txIdMap
      let cachedTxs = account.transactions
      let cachedAQL = account.addressQueryList
      if( hardRefresh ){
        cachedUTXOs = []
        cachedTxIdMap = {
        }
        cachedTxs = []
        cachedAQL = {
          external: {
          }, internal: {
          }
        }
      }

      accountInstances[ account.id ] = {
        externalAddressSet,
        internalAddressSet,
        externalAddresses,
        internalAddresses,
        ownedAddresses,
        cachedUTXOs,
        cachedTxs,
        cachedTxIdMap,
        cachedAQL,
        lastUsedAddressIndex: account.nextFreeAddressIndex - 1,
        lastUsedChangeAddressIndex: account.nextFreeChangeAddressIndex - 1,
        accountType: account.type,
        accountName: account.accountName,
      }

      accountsInternals[ account.id ] = {
        internalAddresses
      }
    }

    const { synchedAccounts } = await AccountUtilities.fetchBalanceTransactionsByAccounts( accountInstances, network )

    const txsFound: Transaction[] = []
    for( const account of Object.values( accounts ) ) {
      const  {
        UTXOs,
        balances,
        transactions,
        txIdMap,
        addressQueryList,
        nextFreeAddressIndex,
        nextFreeChangeAddressIndex,
      } = synchedAccounts[ account.id ]
      const { internalAddresses } = accountsInternals[ account.id ]

      // update utxo sets
      const confirmedUTXOs = []
      const unconfirmedUTXOs = []
      for ( const utxo of UTXOs ) {
        if ( utxo.status ) {
          if ( account.type === AccountType.TEST_ACCOUNT ) {
            if( utxo.address === AccountUtilities.getAddressByIndex( account.xpub, false, 0, network ) ){
              confirmedUTXOs.push( utxo ) // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
              continue
            }
          }

          if ( utxo.status.confirmed ) confirmedUTXOs.push( utxo )
          else {
            if ( internalAddresses[ utxo.address ] !== undefined ) {
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

      account.unconfirmedUTXOs = unconfirmedUTXOs
      account.confirmedUTXOs = confirmedUTXOs
      account.balances = balances
      account.addressQueryList = addressQueryList
      account.nextFreeAddressIndex = nextFreeAddressIndex
      account.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex

      if( ( account as MultiSigAccount ).is2FA ) account.receivingAddress = AccountUtilities.createMultiSig(  ( account as MultiSigAccount ).xpubs, 2, network, account.nextFreeAddressIndex, false ).address
      else account.receivingAddress = AccountUtilities.getAddressByIndex( account.xpub, false, account.nextFreeAddressIndex, network )

      // find tx delta(missing txs): hard vs soft refresh
      if( hardRefresh ){
        if( txIdMap ){
          const deltaTxs = AccountUtilities.findTxDelta( account.txIdMap, txIdMap, transactions )
          if( deltaTxs.length ) txsFound.push( ...deltaTxs )
        } else txsFound.push( ...transactions )
      }
      const { newTransactions, lastSynched } = AccountUtilities.setNewTransactions( transactions, account.lastSynched )

      account.transactions = transactions
      account.txIdMap = txIdMap
      account.newTransactions = newTransactions
      account.lastSynched = lastSynched
    }

    return {
      synchedAccounts: accounts,
      txsFound
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
      if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig(  ( account as MultiSigAccount ).xpubs, 2, network, itr, true ).address
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

    return {
      synchedAccount: account
    }
  }

  static updateQueryList = ( account: Account, consumedUTXOs: {[txid: string]: InputUTXOs} ) => {
    const softGapLimit = 5
    const network = AccountUtilities.getNetworkByType( account.networkType )

    // updates query list(primary: reg/test) with out of bound(lower bound) external/internal addresses
    const startingExtIndex = account.nextFreeAddressIndex - softGapLimit >= 0? account.nextFreeAddressIndex - softGapLimit : 0
    const startingIntIndex = account.nextFreeChangeAddressIndex - softGapLimit >= 0? account.nextFreeChangeAddressIndex - softGapLimit : 0

    for( const consumedUTXO of Object.values( consumedUTXOs ) ){
      let found = false
      // is out of bound external address?
      if( startingExtIndex )
        for ( let itr = 0; itr < startingExtIndex; itr++ ) {
          let address: string
          if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig(  ( account as MultiSigAccount ).xpubs, 2, network, itr, false ).address
          else address = AccountUtilities.getAddressByIndex( account.xpub, false, itr, network )

          if( consumedUTXO.address === address ){
            account.addressQueryList.external[ consumedUTXO.address ] = true// include out of bound(soft-refresh range) ext address
            found = true
            break
          }
        }

      // is out of bound internal address?
      if( startingIntIndex && !found )
        for ( let itr = 0; itr < startingIntIndex; itr++ ) {
          let address: string
          if( ( account as MultiSigAccount ).is2FA ) address = AccountUtilities.createMultiSig(  ( account as MultiSigAccount ).xpubs, 2, network, itr, true ).address
          else address = AccountUtilities.getAddressByIndex( account.xpub, true, itr, network )

          if( consumedUTXO.address === address ){
            account.addressQueryList.internal[ consumedUTXO.address ] = true // include out of bound(soft-refresh range) int address
            found = true
            break
          }
        }
    }
  }

  static removeConsumedUTXOs= ( account: Account | MultiSigAccount, inputs: InputUTXOs[] ) => {
    const consumedUTXOs: {[txid: string]: InputUTXOs} = {
    }
    inputs.forEach( ( input ) => {
      consumedUTXOs[ input.txId ] = input
    } )

    // update primary utxo set and balance
    const updatedUTXOSet = []
    let consumedBalance = 0

    account.confirmedUTXOs.forEach( confirmedUTXO => {
      let include = true
      if( consumedUTXOs[ confirmedUTXO.txId ] ) {
        include = false
        consumedBalance += consumedUTXOs[ confirmedUTXO.txId ].value
      }
      if( include ) updatedUTXOSet.push( confirmedUTXO )
    } )

    account.balances.confirmed -= consumedBalance
    account.confirmedUTXOs = updatedUTXOSet

    AccountOperations.updateQueryList( account, consumedUTXOs )
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
        value: Math.floor( confirmedBalance / numberOfRecipients ),
      } )
    }
    const { fee } = coinselect(
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
    txb: bitcoinJS.TransactionBuilder;
  }> => {
    try {
      let inputs, outputs
      if ( txnPriority === 'custom' && customTxPrerequisites ) {
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
        txb.addInput( input.txId, input.vout, nSequence )
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

        txb.sign(
          vin,
          keyPair,
          redeemScript,
          null,
          input.value,
          witnessScript,
        )
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
      const { multiSig, primaryPriv, secondaryPriv } = AccountUtilities.signingEssentialsForMultiSig(
        account,
        input.address,
      )

      for( const priv of [ primaryPriv, secondaryPriv ] ){
        const keyPair = bip32.fromBase58( priv, network )
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
      }
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
    if( txid ) AccountOperations.removeConsumedUTXOs( account, inputs )  // chip consumed utxos
    else throw new Error( 'Failed to broadcast transaction, txid missing' )
    return {
      txid
    }
  };
}
