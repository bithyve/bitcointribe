import { AxiosResponse } from 'axios'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import * as bitcoinJS from 'bitcoinjs-lib'
import coinselect from 'coinselect'
import crypto from 'crypto'
import config from '../../HexaConfig'
import {
  Transactions,
  DerivativeAccounts,
  TransactionDetails,
  TransactionPrerequisite,
  DonationDerivativeAccount,
  DonationDerivativeAccountElements,
  SubPrimaryDerivativeAccountElements,
  DerivativeAccount,
  DerivativeAccountElements,
  InputUTXOs,
  AverageTxFees,
} from '../Interface'
import Bitcoin from './Bitcoin'
import {
  FAST_BITCOINS,
  TRUSTED_CONTACTS,
  DONATION_ACCOUNT,
  SUB_PRIMARY_ACCOUNT,
  SECURE_ACCOUNT,
  WYRE,
} from '../../../common/constants/serviceTypes'
import { SIGNING_AXIOS, BH_AXIOS } from '../../../services/api'
import _ from 'lodash'
const {  HEXA_ID } = config


export default class SecureHDWallet extends Bitcoin {
  public twoFASetup: {
    qrData: string;
    secret: string;
  };
  public secondaryMnemonic: string;
  public secondaryXpriv: string;
  public xpubs: {
    primary: string;
    secondary: string;
    bh: string;
  };
  public balances: { balance: number; unconfirmedBalance: number } = {
    balance: 0,
    unconfirmedBalance: 0,
  };
  public receivingAddress: string;
  public transactions: Transactions = {
    totalTransactions: 0,
    confirmedTransactions: 0,
    unconfirmedTransactions: 0,
    transactionDetails: [],
  };
  public feeRates: any;
  public derivativeAccounts: DerivativeAccounts | DonationDerivativeAccount =
    config.DERIVATIVE_ACC;
  public newTransactions: Array<TransactionDetails> = [];
  public accountName: string;
  public accountDescription: string;

  private lastBalTxSync = 0;
  private confirmedUTXOs: Array<{
    txId: string;
    vout: number;
    value: number;
    address: string;
    status?: any;
  }> = [];
  private unconfirmedUTXOs: Array<{
    txId: string;
    vout: number;
    value: number;
    address: string;
    status?: any;
  }> = [];
  private txIdMap: {[txid: string]: string[]} = {
  };
  private addressQueryList: {external: {[address: string]: boolean}, internal: {[address: string]: boolean} } = {
    external: {
    }, internal:{
    }
  }

  private primaryMnemonic: string;
  private walletID: string;
  private nextFreeAddressIndex: number;
  private nextFreeChangeAddressIndex: number;
  private primaryXpriv: string;
  private gapLimit: number;
  private derivativeGapLimit: number;

  private cipherSpec: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = {
    algorithm: 'aes-192-cbc',
    salt: 'bithyeSalt', // NOTE: The salt should be as unique as possible. It is recommended that a salt is random and at least 16 bytes long
    keyLength: 24,
    iv: Buffer.alloc( 16, 0 ),
  };

  constructor(
    primaryMnemonic: string,
    stateVars?: {
      accountName: string;
      accountDescription: string;
      secondaryMnemonic: string;
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      primaryXpriv: string;
      secondaryXpriv?: string;
      xpubs: {
        primary: string;
        secondary: string;
        bh: string;
      };
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      confirmedUTXOs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
        status?: any;
      }>;
      unconfirmedUTXOs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
        status?: any;
      }>;
      addressQueryList: {external: {[address: string]: boolean}, internal: {[address: string]: boolean} };
      txIdMap: {[txid: string]: string[]};
      twoFASetup: {
        qrData: string;
        secret: string;
      };
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
      feeRates: any;
    },
    network?: bitcoinJS.Network,
  ) {
    super( network )
    this.primaryMnemonic = primaryMnemonic
    const { walletId } = this.getWalletId()
    this.walletID = walletId
    this.initializeStateVars( stateVars )
  }

  public initializeStateVars = ( stateVars ) => {
    if( stateVars ){
      this.accountName =  stateVars.accountName ? stateVars.accountName: ''
      this.accountDescription =  stateVars.accountDescription ? stateVars.accountDescription: ''
      this.secondaryMnemonic =
         stateVars.secondaryMnemonic
           ? stateVars.secondaryMnemonic
           : null
      this.nextFreeAddressIndex =
         stateVars.nextFreeAddressIndex
           ? stateVars.nextFreeAddressIndex
           : 0
      this.nextFreeChangeAddressIndex =
         stateVars.nextFreeChangeAddressIndex
           ? stateVars.nextFreeChangeAddressIndex
           : 0
      this.gapLimit = config.GAP_LIMIT
      this.derivativeGapLimit = config.DERIVATIVE_GAP_LIMIT
      this.primaryXpriv =
         stateVars.primaryXpriv ? stateVars.primaryXpriv : undefined
      this.secondaryXpriv =
         stateVars.secondaryXpriv
           ? stateVars.secondaryXpriv
           : undefined
      this.xpubs =  stateVars.xpubs ? stateVars.xpubs : undefined
      this.balances =
         stateVars.balances ? stateVars.balances : this.balances
      this.receivingAddress =
         stateVars.receivingAddress
           ? stateVars.receivingAddress
           : this.getInitialReceivingAddress()
      this.transactions =
         stateVars.transactions
           ? stateVars.transactions
           : this.transactions
      this.txIdMap = stateVars.txIdMap
        ? stateVars.txIdMap
        : this.txIdMap
      this.confirmedUTXOs =
         stateVars.confirmedUTXOs
           ? stateVars.confirmedUTXOs
           : this.confirmedUTXOs
      this.unconfirmedUTXOs =
           stateVars.unconfirmedUTXOs
             ? stateVars.unconfirmedUTXOs
             : this.unconfirmedUTXOs
      this.addressQueryList = stateVars.addressQueryList ? stateVars.addressQueryList: this.addressQueryList
      this.twoFASetup =
         stateVars.twoFASetup ? stateVars.twoFASetup : undefined
      this.derivativeAccounts =
         stateVars.derivativeAccounts
           ? {
             ...config.DERIVATIVE_ACC, ...stateVars.derivativeAccounts
           }
           : config.DERIVATIVE_ACC
      this.lastBalTxSync =
         stateVars.lastBalTxSync
           ? stateVars.lastBalTxSync
           : this.lastBalTxSync
      this.newTransactions =
         stateVars.newTransactions
           ? stateVars.newTransactions
           : this.newTransactions
      this.feeRates =
         stateVars.feeRates ? stateVars.feeRates : this.feeRates
    }
  };

  public importBHXpub = async (
    token: number,
  ): Promise<{
    bhXpub: string;
  }> => {
    const { walletId } = this.getWalletId()

    let res: AxiosResponse
    try {
      res = await SIGNING_AXIOS.post( 'importBHXpub', {
        HEXA_ID,
        token,
        walletID: walletId,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    return {
      bhXpub: res.data.bhXpub,
    }
  };

  public getWalletId = (): { walletId: string } => {
    const hash = crypto.createHash( 'sha256' )
    const seed = bip39.mnemonicToSeedSync( this.primaryMnemonic )
    hash.update( seed )
    return {
      walletId: hash.digest( 'hex' )
    }
  };

  public getInitialReceivingAddress = (): string => {
    if ( this.xpubs ) return this.createSecureMultiSig( 0 ).address
  };

  public getReceivingAddress = (
    derivativeAccountType?: string,
    accountNumber?: number,
  ): string => {
    let receivingAddress
    switch ( derivativeAccountType ) {
        case DONATION_ACCOUNT:
        case FAST_BITCOINS:
        case SUB_PRIMARY_ACCOUNT:
        case WYRE:
          if( !accountNumber ) throw new Error( 'Failed to generate receiving address: instance number missing' )
          const account = this
            .derivativeAccounts[ derivativeAccountType ][ accountNumber ]
          receivingAddress = account ? account.receivingAddress : ''
          break

        default:
          receivingAddress = this.receivingAddress
    }

    return receivingAddress
  };

  public getSecondaryID = (
    secondaryMnemonic: string,
  ): { secondaryID: string } => {
    if ( !secondaryMnemonic ) {
      throw new Error(
        'SecondaryID generation failed; missing secondary mnemonic',
      )
    }
    const hash = crypto.createHash( 'sha256' )
    const seed = bip39.mnemonicToSeedSync( secondaryMnemonic )
    hash.update( seed )
    return {
      secondaryID: hash.digest( 'hex' )
    }
  };

  public removeSecondaryMnemonic = () => {
    this.secondaryMnemonic = null
    return {
      removed: !this.secondaryMnemonic
    }
  };

  public removeTwoFADetails = () => {
    this.twoFASetup = null
    return {
      removed: !this.twoFASetup
    }
  };

  public isSecondaryMnemonic = ( secondaryMnemonic: string ) => {
    const path = this.derivePath( this.xpubs.bh )
    const currentXpub = this.getRecoverableXKey( secondaryMnemonic, path )
    if ( currentXpub !== this.xpubs.secondary ) {
      return false
    }
    return true
  };

  public restoreSecondaryMnemonic = (
    secondaryMnemonic: string,
  ): {
    restored: boolean;
  } => {
    const path = this.derivePath( this.xpubs.bh )
    const currentXpub = this.getRecoverableXKey( secondaryMnemonic, path )
    if ( currentXpub !== this.xpubs.secondary ) {
      return {
        restored: false
      }
    }
    this.secondaryMnemonic = secondaryMnemonic
    return {
      restored: true
    }
  };

  public getSecondaryXpub = (): { secondaryXpub: string } => {
    return {
      secondaryXpub: this.xpubs.secondary
    }
  };

  public getAccountId = (): string => {
    const xpub = this.xpubs.secondary
    return crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' )
  };

  public decryptSecondaryXpub = ( encryptedSecXpub: string ) => {
    const key = this.generateKey(
      bip39.mnemonicToSeedSync( this.primaryMnemonic ).toString( 'hex' ),
    )
    const decipher = crypto.createDecipheriv(
      this.cipherSpec.algorithm,
      key,
      this.cipherSpec.iv,
    )
    let decrypted = decipher.update( encryptedSecXpub, 'hex', 'utf8' )
    decrypted += decipher.final( 'utf8' )

    const secondaryXpub = decrypted
    if ( this.validateXpub( secondaryXpub ) ) {
      return {
        secondaryXpub
      }
    } else {
      throw new Error( 'Secondary Xpub is either tampered or is invalid' )
    }
  };

  public checkHealth = async (
    chunk: string,
    pos: number,
  ): Promise<{ isValid: boolean }> => {
    if ( chunk.length !== config.CHUNK_SIZE ) {
      throw new Error( 'Invalid number of characters' )
    }

    const { walletId } = this.getWalletId()
    let res: AxiosResponse
    try {
      res = await SIGNING_AXIOS.post( 'checkSecureHealth', {
        HEXA_ID,
        chunk,
        pos,
        walletID: walletId,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    return {
      isValid: res.data.isValid
    }
  };

  public findTxDelta = ( previousTxidMap, currentTxIdMap, transactions ) => {
    // return new/found transactions(delta b/w hard and soft refresh)
    const txsFound: TransactionDetails[] = []
    const newTxIds: string[] = _.difference( Object.keys( currentTxIdMap ),  Object.keys( previousTxidMap ) )
    const newTxIdMap = {
    }
    newTxIds.forEach( ( txId ) => newTxIdMap[ txId ] = true )

    if( newTxIds.length ){
      transactions.transactionDetails.forEach( tx => {
        if( newTxIdMap[ tx.txid ] ) txsFound.push( tx )
      } )
    }

    return txsFound
  }

  public setNewTransactions = ( transactions: Transactions ) => {
    // delta transactions setter
    const lastSyncTime = this.lastBalTxSync
    let latestSyncTime = this.lastBalTxSync
    this.newTransactions = [] // delta transactions
    for ( const tx of transactions.transactionDetails ) {
      if ( tx.status === 'Confirmed' && tx.transactionType === 'Received' ) {
        if ( tx.blockTime > lastSyncTime ) {
          this.newTransactions.push( tx )
        }
        if ( tx.blockTime > latestSyncTime ) {
          latestSyncTime = tx.blockTime
        }
      }
    }
    this.lastBalTxSync = latestSyncTime
  };

  public fetchBalanceTransaction = async ( hardRefresh?: boolean ): Promise<{
    balances: {
      balance: number;
      unconfirmedBalance: number;
    };
    transactions: Transactions;
    txsFound: TransactionDetails[];
  }> => {
    const ownedAddresses = [] // owned address mapping
    // owned addresses are used for apt tx categorization and transfer amount calculation

    // init refresh dependent params
    let startingExtIndex: number, closingExtIndex: number, startingIntIndex: number, closingIntIndex: number
    if( hardRefresh ){
      const hardGapLimit  = 10
      startingExtIndex = 0
      closingExtIndex = this.nextFreeAddressIndex + hardGapLimit
      startingIntIndex = 0
      closingIntIndex = this.nextFreeChangeAddressIndex + hardGapLimit
    }
    else {
      const softGapLimit = 5
      startingExtIndex = this.nextFreeAddressIndex - softGapLimit >= 0? this.nextFreeAddressIndex - softGapLimit : 0
      closingExtIndex = this.nextFreeAddressIndex + softGapLimit
      startingIntIndex = this.nextFreeChangeAddressIndex - softGapLimit >= 0? this.nextFreeChangeAddressIndex - softGapLimit : 0
      closingIntIndex = this.nextFreeChangeAddressIndex + softGapLimit
    }

    const externalAddresses :{[address: string]: number}  = {
    }// all external addresses(till closingExtIndex)
    const externalAddressSet:{[address: string]: number}= {
    } // external address range set w/ query list
    for ( let itr = 0; itr < closingExtIndex; itr++ ) {
      const { address } = this.createSecureMultiSig( itr )
      externalAddresses[ address ] = itr
      ownedAddresses.push( address )
      if( itr >= startingExtIndex ) externalAddressSet[ address ] = itr
    }

    const internalAddresses :{[address: string]: number}  = {
    }// all internal addresses(till closingIntIndex)
    const internalAddressSet :{[address: string]: number}= {
    } // internal address range set
    for ( let itr = 0; itr < closingIntIndex; itr++ ) {
      const { address } = this.createSecureMultiSig( itr, true )
      internalAddresses[ address ] = itr
      ownedAddresses.push( address )
      if( itr >= startingIntIndex ) internalAddressSet[ address ] = itr
    }

    const batchedDerivativeAddresses = []

    for ( const dAccountType of config.DERIVATIVE_ACC_TO_SYNC ) {
      if ( dAccountType === TRUSTED_CONTACTS ) continue
      const derivativeAccount = this.derivativeAccounts[ dAccountType ]
      if ( derivativeAccount.instance.using ) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          const derivativeInstance = derivativeAccount[ accountNumber ]
          if (
            derivativeInstance.usedAddresses &&
            derivativeInstance.usedAddresses.length
          ) {
            batchedDerivativeAddresses.push(
              ...derivativeInstance.usedAddresses,
            )
            ownedAddresses.push( ...derivativeInstance.usedAddresses )
          }
        }
      }
    }

    // garner cached params for bal-tx sync
    let cachedUTXOs =  [ ...this.confirmedUTXOs, ...this.unconfirmedUTXOs ]
    let cachedTxIdMap = this.txIdMap
    let cachedTxs = this.transactions
    let cachedAQL = this.addressQueryList
    if( hardRefresh ){
      cachedUTXOs = []
      cachedTxIdMap = {
      }
      cachedTxs  = {
        totalTransactions: 0,
        confirmedTransactions: 0,
        unconfirmedTransactions: 0,
        transactionDetails: [],
      }
      cachedAQL = {
        external: {
        }, internal: {
        }
      }
    }

    const xpubId = crypto.createHash( 'sha256' ).update( this.xpubs.secondary ).digest( 'hex' )
    const accounts = {
      [ xpubId ]: {
        externalAddressSet,
        internalAddressSet,
        externalAddresses,
        internalAddresses,
        ownedAddresses,
        cachedUTXOs,
        cachedTxs,
        cachedTxIdMap,
        cachedAQL,
        lastUsedAddressIndex: this.nextFreeAddressIndex - 1,
        lastUsedChangeAddressIndex: this.nextFreeChangeAddressIndex - 1,
        accountType: 'Savings Account',
      }
    }
    const { synchedAccounts } = await this.fetchBalanceTransactionsByAddresses( accounts )

    const  {
      UTXOs,
      balances,
      transactions,
      txIdMap,
      addressQueryList,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
    } = synchedAccounts[ xpubId ]


    // update utxo sets
    const confirmedUTXOs = []
    const unconfirmedUTXOs = []
    for ( const utxo of UTXOs ) {
      if ( utxo.status ) {
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

    this.unconfirmedUTXOs = unconfirmedUTXOs
    this.confirmedUTXOs = confirmedUTXOs
    this.balances = balances
    this.addressQueryList = addressQueryList
    this.nextFreeAddressIndex = nextFreeAddressIndex
    this.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex
    this.receivingAddress = this.createSecureMultiSig(
      this.nextFreeAddressIndex,
    ).address

    const txsFound: TransactionDetails[] = hardRefresh? this.findTxDelta( this.txIdMap, txIdMap, transactions ) : []
    this.transactions = transactions
    this.txIdMap = txIdMap
    this.setNewTransactions( transactions )

    return {
      balances, transactions, txsFound
    }
  };

  public getDerivativeAccReceivingAddress = async (
    accountType: string,
    accountNumber = 1,
    contactName?: string,
    accountName?: string,
  ): Promise<{ address: string }> => {
    // generates receiving address for derivative accounts
    if ( !this.derivativeAccounts[ accountType ] )
      if ( config[ accountType ] )
        this.derivativeAccounts = {
          ...this.derivativeAccounts,
          [ accountType ]: config[ accountType ],
        }
      else throw new Error( `${accountType} does not exists` )

    switch ( accountType ) {
        case DONATION_ACCOUNT:
          if ( !this.derivativeAccounts[ accountType ][ accountNumber ] )
            throw new Error( `Donation account(${accountNumber}) doesn't exist` )

          break

        default:
          if ( !this.derivativeAccounts[ accountType ][ accountNumber ] )
            this.generateDerivativeXpub( accountType, accountNumber, accountName )

          break
    }

    // receiving address updates during balance sync
    return {
      address: this.derivativeAccounts[ accountType ][ accountNumber ]
        .receivingAddress,
    }
  };

  public fetchDerivativeAccBalanceTxs = async (
    accountsInfo: {
      accountType: string,
      accountNumber: number,
    }[],
    hardRefresh?: boolean,
  ): Promise<{
    synched: boolean
    txsFound: TransactionDetails[]
    }> => {
    const accounts = {
    }
    const accountsTemp: {
      [accountId: string]: {
        internalAddresses: {[address: string]: number};
      }
    } = {
    }

    for( const { accountType, accountNumber } of accountsInfo ){
      // preliminary checks
      if ( !this.derivativeAccounts[ accountType ] )
        throw new Error( `${accountType} does not exists` )

      let {
        nextFreeAddressIndex,
        nextFreeChangeAddressIndex,
      } = this.derivativeAccounts[ accountType ][ accountNumber ]
      // supports upgrading from a previous version containing TC (where nextFreeAddressIndex is undefined)
      if ( nextFreeAddressIndex !== 0 && !nextFreeAddressIndex )
        nextFreeAddressIndex = 0
      if ( nextFreeChangeAddressIndex !== 0 && !nextFreeChangeAddressIndex )
        nextFreeChangeAddressIndex = 0

      // init refresh dependent params
      let startingExtIndex: number, closingExtIndex: number, startingIntIndex: number, closingIntIndex: number
      if( hardRefresh ){
        const hardGapLimit  = 10
        startingExtIndex = 0
        closingExtIndex = nextFreeAddressIndex + hardGapLimit
        startingIntIndex = 0
        closingIntIndex = nextFreeChangeAddressIndex + hardGapLimit
      }
      else {
        const softGapLimit = 5
        startingExtIndex = nextFreeAddressIndex - softGapLimit >= 0? nextFreeAddressIndex - softGapLimit : 0
        closingExtIndex = nextFreeAddressIndex + softGapLimit
        startingIntIndex = nextFreeChangeAddressIndex - softGapLimit >= 0? nextFreeChangeAddressIndex - softGapLimit : 0
        closingIntIndex = nextFreeChangeAddressIndex + softGapLimit
      }

      const externalAddresses :{[address: string]: number}  = {
      }
      const externalAddressSet:{[address: string]: number}  = {
      }
      const ownedAddresses = []
      for (
        let itr = 0;
        itr < closingExtIndex;
        itr++
      ) {
        const { address } = this.createSecureMultiSig(
          itr,
          false,
          this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
        )
        externalAddresses[ address ] = itr
        ownedAddresses.push( address )
        if( itr >= startingExtIndex ) externalAddressSet[ address ] = itr
      }

      const internalAddresses :{[address: string]: number}  = {
      }
      const internalAddressSet:{[address: string]: number}  = {
      }
      for (
        let itr = 0;
        itr < closingIntIndex;
        itr++
      ) {
        const { address } = this.createSecureMultiSig(
          itr,
          true,
          this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
        )
        internalAddresses[ address ] = itr
        ownedAddresses.push( address )
        if( itr >= startingIntIndex ) internalAddressSet[ address ] = itr
      }

      this.derivativeAccounts[ accountType ][ accountNumber ][
        'usedAddresses'
      ] = ownedAddresses // derv used addresses forms a part of ownedAddresses array during primary-acc sync

      const  { confirmedUTXOs, unconfirmedUTXOs, transactions, txIdMap, addressQueryList } = ( this.derivativeAccounts[ accountType ][ accountNumber ] as DerivativeAccountElements )

      // garner cached params for bal-tx sync
      let cachedUTXOs =  [  ]
      if( confirmedUTXOs ) cachedUTXOs.push( ...confirmedUTXOs )
      if( unconfirmedUTXOs ) cachedUTXOs.push( ...unconfirmedUTXOs )
      let cachedTxs = transactions? transactions: {
        totalTransactions: 0,
        confirmedTransactions: 0,
        unconfirmedTransactions: 0,
        transactionDetails: [],
      }
      let cachedTxIdMap = txIdMap? txIdMap: {
      }
      let cachedAQL =  addressQueryList? addressQueryList: {
        external: {
        }, internal:{
        }
      }
      if( hardRefresh ){
        cachedUTXOs = []
        cachedTxIdMap = {
        }
        cachedTxs  = {
          totalTransactions: 0,
          confirmedTransactions: 0,
          unconfirmedTransactions: 0,
          transactionDetails: [],
        }
        cachedAQL = {
          external: {
          }, internal:{
          }
        }
      }

      let { xpubId, xpub } = ( this.derivativeAccounts[ accountType ][ accountNumber ] as DerivativeAccountElements )
      if( !xpubId ){
        xpubId = crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' )
        this.derivativeAccounts[ accountType ][ accountNumber ].xpubId = xpubId
      }
      accountsTemp[ xpubId ] = {
        internalAddresses
      }

      accounts[ xpubId ] = {
        externalAddressSet,
        internalAddressSet,
        externalAddresses,
        internalAddresses,
        ownedAddresses,
        cachedUTXOs,
        cachedTxs,
        cachedTxIdMap,
        cachedAQL,
        lastUsedAddressIndex: this.derivativeAccounts[ accountType ][ accountNumber ].nextFreeAddressIndex -
          1,
        lastUsedChangeAddressIndex: this.derivativeAccounts[ accountType ][ accountNumber ]
          .nextFreeChangeAddressIndex - 1,
        accountType: accountType === FAST_BITCOINS ? FAST_BITCOINS : accountType,
        contactName: null,
        primaryAccType: accountType === SUB_PRIMARY_ACCOUNT ? 'Savings Account' : null,
      }
    }

    const { synchedAccounts } = await this.fetchBalanceTransactionsByAddresses( accounts )

    const txsFound: TransactionDetails[] = []
    for( const { accountType, accountNumber } of accountsInfo ){
      const { xpubId, txIdMap }  =  ( this.derivativeAccounts[ accountType ][ accountNumber ] as DerivativeAccountElements )
      const res = synchedAccounts[ xpubId ]
      const { internalAddresses } = accountsTemp[ xpubId ]


      // update utxo sets
      const confUTXOs = []
      const unconfUTXOs = []
      for ( const utxo of res.UTXOs ) {
        if ( utxo.status ) {
          if ( utxo.status.confirmed ) confUTXOs.push( utxo )
          else {
            if ( internalAddresses[ utxo.address ] !== undefined ) {
            // defaulting utxo's on the change branch to confirmed
              confUTXOs.push( utxo )
            }
            else unconfUTXOs.push( utxo )
          }
        } else {
        // utxo's from fallback won't contain status var (defaulting them as confirmed)
          confUTXOs.push( utxo )
        }
      }

      const lastSyncTime =
      this.derivativeAccounts[ accountType ][ accountNumber ].lastBalTxSync || 0
      let latestSyncTime =
      this.derivativeAccounts[ accountType ][ accountNumber ].lastBalTxSync || 0
      const newTransactions: Array<TransactionDetails> = [] // delta transactions
      for ( const tx of res.transactions.transactionDetails ) {
        if ( tx.status === 'Confirmed' && tx.transactionType === 'Received' ) {
          if ( tx.blockTime > lastSyncTime ) {
            newTransactions.push( tx )
          }
          if ( tx.blockTime > latestSyncTime ) {
            latestSyncTime = tx.blockTime
          }
        }
      }

      // find tx delta(missing txs): hard vs soft refresh
      if( hardRefresh ){
        const deltaTxs = this.findTxDelta( txIdMap, res.txIdMap, res.transactions )
        if( deltaTxs.length ) txsFound.push( ...deltaTxs )
      }

      this.derivativeAccounts[ accountType ][ accountNumber ] = {
        ...this.derivativeAccounts[ accountType ][ accountNumber ],
        lastBalTxSync: latestSyncTime,
        newTransactions,
        confirmedUTXOs: confUTXOs,
        unconfirmedUTXOs: unconfUTXOs,
        balances: res.balances,
        transactions: res.transactions,
        txIdMap: res.txIdMap,
        addressQueryList: res.addressQueryList,
        nextFreeAddressIndex: res.nextFreeAddressIndex,
        nextFreeChangeAddressIndex: res.nextFreeChangeAddressIndex,
        receivingAddress: this.createSecureMultiSig(
          res.nextFreeAddressIndex,
          false,
          this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
        ).address,
      }
    }

    return {
      synched: true,
      txsFound,
    }
  };

  public syncDerivativeAccountsBalanceTxs = async (
    accountTypes: string[],
    hardRefresh?: boolean
  ): Promise<{
    synched: boolean;
    txsFound: TransactionDetails[]
  }> => {
    const accountsInfo :  {
      accountType: string,
      accountNumber: number,
    }[] = []

    for ( const dAccountType of accountTypes ) {
      if ( dAccountType === TRUSTED_CONTACTS ) continue
      const derivativeAccounts = this.derivativeAccounts[ dAccountType ]

      if ( !derivativeAccounts.instance.using ) continue
      for (
        let accountNumber = 1;
        accountNumber <= derivativeAccounts.instance.using;
        accountNumber++
      ) {
        accountsInfo.push( {
          accountType: dAccountType, accountNumber
        } )
      }
    }

    if( accountsInfo.length )
      return this.fetchDerivativeAccBalanceTxs( accountsInfo, hardRefresh )
  }

  public syncViaXpubAgent = async (
    accountType: string,
    accountNumber: number,
  ): Promise<{
    synched: boolean;
  }> => {
    if (
      !this.derivativeAccounts[ accountType ] ||
      !this.derivativeAccounts[ accountType ][ accountNumber ]
    ) {
      throw new Error( `${accountType}:${accountNumber} does not exists` )
    }

    let accountDetails
    if ( accountType === DONATION_ACCOUNT ) {
      const { id } = this.derivativeAccounts[ accountType ][ accountNumber ]
      if ( id ) accountDetails = {
        donationId: id
      }
    }

    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'fetchXpubInfo', {
        HEXA_ID,
        xpubId: this.derivativeAccounts[ accountType ][ accountNumber ].xpubId,
        accountType,
        accountDetails,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const {
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      utxos,
      balances,
      transactions,
    } = res.data

    const internalAddresses = []
    for ( let itr = 0; itr < nextFreeChangeAddressIndex + this.gapLimit; itr++ ) {
      internalAddresses.push(
        this.createSecureMultiSig(
          itr,
          true,
          this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
        ).address,
      )
    }

    const confirmedUTXOs = []
    for ( const utxo of utxos ) {
      if ( utxo.status ) {
        if ( utxo.status.confirmed ) confirmedUTXOs.push( utxo )
        else {
          if ( internalAddresses.includes( utxo.address ) ) {
            // defaulting utxo's on the change branch to confirmed
            confirmedUTXOs.push( utxo )
          }
        }
      } else {
        // utxo's from fallback won't contain status var (defaulting them as confirmed)
        confirmedUTXOs.push( utxo )
      }
    }

    const lastSyncTime =
      this.derivativeAccounts[ accountType ][ accountNumber ].lastBalTxSync || 0
    let latestSyncTime =
      this.derivativeAccounts[ accountType ][ accountNumber ].lastBalTxSync || 0
    const newTransactions: Array<TransactionDetails> = [] // delta transactions
    for ( const tx of transactions.transactionDetails ) {
      if ( tx.status === 'Confirmed' && tx.transactionType === 'Received' ) {
        if ( tx.blockTime > lastSyncTime ) {
          newTransactions.push( tx )
        }
        if ( tx.blockTime > latestSyncTime ) {
          latestSyncTime = tx.blockTime
        }
      }
    }

    this.derivativeAccounts[ accountType ][
      accountNumber
    ].lastBalTxSync = latestSyncTime
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].newTransactions = newTransactions
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].usedAddresses = usedAddresses
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].confirmedUTXOs = confirmedUTXOs
    this.derivativeAccounts[ accountType ][ accountNumber ].balances = balances
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].transactions = transactions
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].nextFreeAddressIndex = nextFreeAddressIndex
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].nextFreeChangeAddressIndex = nextFreeChangeAddressIndex
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].receivingAddress = this.createSecureMultiSig(
      nextFreeAddressIndex,
      false,
      this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
    ).address

    return {
      synched: true
    }
  };

  public setupDerivativeAccount = (
    accountType: string,
    accountDetails: { accountName?: string; accountDescription?: string },
  ): {
    accountId: string;
    accountNumber: number;
  } => {
    let accountId: string
    let accountNumber: number
    switch ( accountType ) {
        case FAST_BITCOINS:
        case SUB_PRIMARY_ACCOUNT:
        case WYRE:
          const derivativeAcc: DerivativeAccount = this
            .derivativeAccounts[ accountType ]
          const inUse = derivativeAcc.instance.using
          accountNumber = inUse + 1
          this.generateDerivativeXpub( accountType, accountNumber )
          const derivativeInstance: DerivativeAccountElements = this
            .derivativeAccounts[ accountType ][ accountNumber ]
          const updatedDervInstance = {
            ...derivativeInstance,
            accountName: accountDetails.accountName,
            accountDescription: accountDetails.accountDescription,
          }
          this.derivativeAccounts[ accountType ][
            accountNumber
          ] = updatedDervInstance
          accountId = updatedDervInstance.xpubId
          break
    }

    if ( !accountId ) throw new Error( `Failed to setup ${accountType} account` )
    return {
      accountId, accountNumber
    }
  };

  public updateAccountDetails = (
    account: {
      kind: string,
      instanceNumber: number,
      customDescription: string,
      customDisplayName: string
    }
  ): {
    updateSuccessful: boolean;
  } => {
    switch( account.kind ){
        case SECURE_ACCOUNT:
          if ( !account.instanceNumber ) {
            // instance num zero represents the parent acc
            this.accountName = account.customDisplayName
            this.accountDescription = account.customDescription
          }
          else {
            const subPrimInstance: SubPrimaryDerivativeAccountElements =
            this.derivativeAccounts[ SUB_PRIMARY_ACCOUNT ][ account.instanceNumber ]
            subPrimInstance.accountName = account.customDisplayName
            subPrimInstance.accountDescription = account.customDescription
          }
          break

        case DONATION_ACCOUNT:
          const donationInstance: DonationDerivativeAccountElements =
              this.derivativeAccounts[ DONATION_ACCOUNT ][ account.instanceNumber ]
          donationInstance.subject = account.customDisplayName
          donationInstance.description = account.customDescription
          break
    }


    return {
      updateSuccessful: true
    }
  };

  public setupDonationAccount = async (
    donee: string,
    subject: string,
    description: string,
    configuration: {
      displayBalance: boolean;
      displayTransactions: boolean;
      displayTxDetails: boolean;
    },
    disableAccount = false,
  ): Promise<{
    setupSuccessful: boolean;
    accountId: string;
    accountNumber: number;
  }> => {
    const accountType = DONATION_ACCOUNT
    let donationAccounts: DonationDerivativeAccount = this.derivativeAccounts[
      accountType
    ]

    if ( !donationAccounts ) {
      this.derivativeAccounts = {
        ...this.derivativeAccounts,
        [ DONATION_ACCOUNT ]: config.DONATION_ACCOUNT,
      }
      donationAccounts = this.derivativeAccounts[ accountType ]
    }

    const inUse = donationAccounts.instance.using
    const accountNumber = inUse + 1

    const xpub = this.generateDerivativeXpub( accountType, accountNumber )
    let xpubId = this.derivativeAccounts[ accountType ][ accountNumber ].xpubId
    if ( !xpubId ) {
      xpubId = crypto
        .createHash( 'sha256' )
        .update( xpub + this.xpubs.secondary + this.xpubs.bh )
        .digest( 'hex' )
      this.derivativeAccounts[ accountType ][ accountNumber ].xpubId = xpubId
    }

    const id = xpubId.slice( 0, 15 )

    this.derivativeAccounts[ accountType ][ accountNumber ] = {
      ...this.derivativeAccounts[ accountType ][ accountNumber ],
      donee,
      id,
      subject,
      description,
      configuration,
      disableAccount,
    }

    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'setupDonationAccount', {
        HEXA_ID,
        donationId: id,
        walletID: this.getWalletId().walletId,
        details: {
          donee,
          subject,
          description,
          xpubs: [ xpub, this.xpubs.secondary, this.xpubs.bh ],
          xpubId,
          configuration,
        },
      } )
    } catch ( err ) {
      delete this.derivativeAccounts[ accountType ][ accountNumber ]
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { setupSuccessful } = res.data
    if ( !setupSuccessful ) {
      delete this.derivativeAccounts[ accountType ][ accountNumber ]
      throw new Error( 'Donation account setup failed' )
    }

    return {
      setupSuccessful, accountId: xpubId, accountNumber
    }
  };

  public setupSecureAccount = async (): Promise<{
    setupData: {
      qrData: string;
      secret: string;
      bhXpub: string;
    };
  }> => {
    // invoked once per wallet (during initial setup)
    let res: AxiosResponse
    this.secondaryMnemonic = bip39.generateMnemonic( 256 )
    const { secondaryID } = this.getSecondaryID( this.secondaryMnemonic )
    try {
      res = await SIGNING_AXIOS.post( 'setupSecureAccount', {
        HEXA_ID,
        walletID: this.walletID,
        secondaryID,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }
    // console.log({ res });
    const { setupSuccessful, setupData } = res.data
    if ( !setupSuccessful ) {
      throw new Error( 'Secure account setup failed' )
    } else {
      const { prepared } = this.prepareSecureAccount( setupData.bhXpub )
      if ( prepared ) {
        this.twoFASetup = setupData
        return {
          setupData
        }
      } else {
        throw new Error(
          'Something went wrong; unable to prepare secure account',
        )
      }
    }
  };

  public validate2FASetup = async ( token: number ): Promise<{
    valid: Boolean
  }> => {
    let res: AxiosResponse
    try {
      res = await SIGNING_AXIOS.post( 'validate2FASetup', {
        HEXA_ID,
        walletID: this.walletID,
        token,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }
    console.log( {
      res
    } )
    const { valid } = res.data
    if ( !valid ) {
      throw new Error( '2FA validation failed' )
    } else {
      return {
        valid
      }
    }
  };

  public updateDonationPreferences = async (
    accountNumber: number,
    preferences: {
      disableAccount?: boolean;
      configuration?: {
        displayBalance: boolean;
        displayTransactions: boolean;
        displayTxDetails: boolean;
      };
      accountDetails?: {
        donee: string;
        subject: string;
        description: string;
      };
    },
  ): Promise<{ updated: boolean }> => {
    const donationAcc: DonationDerivativeAccountElements = this
      .derivativeAccounts[ DONATION_ACCOUNT ][ accountNumber ]
    if ( !donationAcc ) {
      throw new Error(
        `Donation account do not exist (instance id:${accountNumber})`,
      )
    }

    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'updatePreferences', {
        HEXA_ID,
        donationId: donationAcc.id,
        walletID: this.getWalletId().walletId,
        preferences,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { updated } = res.data
    if ( !updated ) {
      throw new Error( 'Preference updation failed' )
    }

    const { configuration, disableAccount, accountDetails } = preferences
    if ( configuration )
      this.derivativeAccounts[ DONATION_ACCOUNT ][
        accountNumber
      ].configuration = configuration

    if ( disableAccount !== undefined )
      this.derivativeAccounts[ DONATION_ACCOUNT ][
        accountNumber
      ].disableAccount = disableAccount

    if ( accountDetails ) {
      this.derivativeAccounts[ DONATION_ACCOUNT ][ accountNumber ].donee =
        accountDetails.donee
      this.derivativeAccounts[ DONATION_ACCOUNT ][ accountNumber ].subject =
        accountDetails.subject
      this.derivativeAccounts[ DONATION_ACCOUNT ][ accountNumber ].description =
        accountDetails.description
    }

    return {
      updated
    }
  };

  public resetTwoFA = async (
    secondaryMnemonic: string,
  ): Promise<{
    qrData: any;
    secret: any;
  }> => {
    const path = this.derivePath( this.xpubs.bh )
    const currentXpub = this.getRecoverableXKey( secondaryMnemonic, path )
    if ( currentXpub !== this.xpubs.secondary ) {
      throw new Error( 'Invaild secondary mnemonic' )
    }

    let res: AxiosResponse
    const { secondaryID } = this.getSecondaryID( secondaryMnemonic )
    try {
      res = await SIGNING_AXIOS.post( 'resetTwoFA', {
        HEXA_ID,
        walletID: this.walletID,
        secondaryID,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }
    const { qrData, secret } = res.data
    this.twoFASetup = {
      qrData, secret
    }
    return this.twoFASetup
  };

  public isActive = async (): Promise<{ isActive: boolean }> => {
    let res: AxiosResponse
    try {
      res = await SIGNING_AXIOS.post( 'isSecureActive', {
        HEXA_ID,
        walletID: this.walletID,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }
    return res.data
  };

  public removeConsumedUTXOs= ( inputs: InputUTXOs[], derivativeAccountDetails?: { type: string; number: number } ) => {
    const consumedUTXOs: {[txid: string]: InputUTXOs} = {
    }
    inputs.forEach( ( input ) => {
      consumedUTXOs[ input.txId ] = input
    } )

    if ( derivativeAccountDetails ) {
      const updatedUTXOSet = []
      let consumedBalance = 0

      const derivativeInstance: DerivativeAccountElements = this.derivativeAccounts[
        derivativeAccountDetails.type
      ][ derivativeAccountDetails.number ]

      derivativeInstance.confirmedUTXOs.forEach( confirmedUTXO => {
        let include = true
        if( consumedUTXOs[ confirmedUTXO.txId ] ) {
          include = false
          consumedBalance += consumedUTXOs[ confirmedUTXO.txId ].value
        }
        if( include ) updatedUTXOSet.push( confirmedUTXO )
      } )

      derivativeInstance.balances.balance -= consumedBalance
      derivativeInstance.confirmedUTXOs = updatedUTXOSet
    } else {

      // update primary utxo set and balance (test/reg)
      const updatedUTXOSet = []
      let consumedBalance = 0

      this.confirmedUTXOs.forEach( confirmedUTXO => {
        let include = true
        if( consumedUTXOs[ confirmedUTXO.txId ] ) {
          include = false
          consumedBalance += consumedUTXOs[ confirmedUTXO.txId ].value
        }
        if( include ) updatedUTXOSet.push( confirmedUTXO )
      } )

      this.balances.balance -= consumedBalance
      this.confirmedUTXOs = updatedUTXOSet


      // update derivative utxo set and balance (if derivative utxos are consumed)
      for ( const dAccountType of config.DERIVATIVE_ACC_TO_SYNC ) {
        const derivativeAccount = this.derivativeAccounts[ dAccountType ]
        if ( derivativeAccount.instance.using ) {
          for (
            let accountNumber = 1;
            accountNumber <= derivativeAccount.instance.using;
            accountNumber++
          ) {
            const updatedUTXOSet = []
            let consumedBalance = 0

            const derivativeInstance = derivativeAccount[ accountNumber ]
            if (
              derivativeInstance.confirmedUTXOs
            )
              derivativeInstance.confirmedUTXOs.forEach( ( confirmedUTXO ) => {
                let include = true
                if( consumedUTXOs[ confirmedUTXO.txId ] ) {
                  include = false
                  consumedBalance += consumedUTXOs[ confirmedUTXO.txId ].value
                }
                if( include ) updatedUTXOSet.push( confirmedUTXO )
              } )


            derivativeInstance.balances.balance -= consumedBalance
            derivativeInstance.confirmedUTXOs = updatedUTXOSet
          }
        }
      }
    }

    this.updateQueryList( consumedUTXOs, derivativeAccountDetails )
  }

  private updateQueryList = ( consumedUTXOs: {[txid: string]: InputUTXOs}, derivativeAccountDetails?: { type: string; number: number }  ) => {
    // updates query list with out of bound(lower bound) external/internal addresses
    const softGapLimit = 5

    if ( derivativeAccountDetails ) {
      const derivativeInstance: DerivativeAccountElements = this.derivativeAccounts[
        derivativeAccountDetails.type
      ][ derivativeAccountDetails.number ]

      // updates query list(derv) with out of bound(lower bound) external/internal addresses
      const startingExtIndex = derivativeInstance.nextFreeAddressIndex - softGapLimit >= 0? derivativeInstance.nextFreeAddressIndex - softGapLimit : 0
      const startingIntIndex = derivativeInstance.nextFreeChangeAddressIndex - softGapLimit >= 0? derivativeInstance.nextFreeChangeAddressIndex - softGapLimit : 0

      if( !derivativeInstance.addressQueryList )
      {
        derivativeInstance.addressQueryList = {
          external: {
          }, internal: {
          }
        }
      }

      for( const consumedUTXO of Object.values( consumedUTXOs ) ){
        let found = false
        // is out of bound external address?
        if( startingExtIndex )
          for ( let itr = 0; itr < startingExtIndex; itr++ ) {
            const { address } = this.createSecureMultiSig( itr, false, derivativeInstance.xpub )
            if( consumedUTXO.address === address ){
              derivativeInstance.addressQueryList.external[ consumedUTXO.address ] = true// include out of bound(soft-refresh range) ext address
              found = true
              break
            }
          }

        // is out of bound internal address?
        if( startingIntIndex && !found )
          for ( let itr = 0; itr < startingIntIndex; itr++ ) {
            const { address } = this.createSecureMultiSig( itr, true, derivativeInstance.xpub )
            if( consumedUTXO.address === address ){
              derivativeInstance.addressQueryList.internal[ consumedUTXO.address ] = true // include out of bound(soft-refresh range) int address
              found = true
              break
            }
          }
      }
    } else {
      // updates query list(primary: reg/test) with out of bound(lower bound) external/internal addresses
      const startingExtIndex = this.nextFreeAddressIndex - softGapLimit >= 0? this.nextFreeAddressIndex - softGapLimit : 0
      const startingIntIndex = this.nextFreeChangeAddressIndex - softGapLimit >= 0? this.nextFreeChangeAddressIndex - softGapLimit : 0

      for( const consumedUTXO of Object.values( consumedUTXOs ) ){
        let found = false
        // is out of bound external address?
        if( startingExtIndex )
          for ( let itr = 0; itr < startingExtIndex; itr++ ) {
            const { address } = this.createSecureMultiSig( itr )
            if( consumedUTXO.address === address ){
              this.addressQueryList.external[ consumedUTXO.address ] = true // include out of bound(soft-refresh range) ext address
              found = true
              break
            }
          }

        // is out of bound internal address?
        if( startingIntIndex && !found )
          for ( let itr = 0; itr < startingIntIndex; itr++ ) {
            const { address } = this.createSecureMultiSig( itr, true )
            if( consumedUTXO.address === address ){
              this.addressQueryList.internal[ consumedUTXO.address ] = true // include out of bound(soft-refresh range) int address
              found = true
              break
            }
          }

        if( !found )
        // updates query list(derivative) with out of bound(lower bound) external/internal addresses
          for ( const dAccountType of config.DERIVATIVE_ACC_TO_SYNC ) {
            const derivativeAccount = this.derivativeAccounts[ dAccountType ]
            if ( derivativeAccount.instance.using ) {
              for (
                let accountNumber = 1;
                accountNumber <= derivativeAccount.instance.using;
                accountNumber++
              ) {
                const derivativeInstance: DerivativeAccountElements = derivativeAccount[ accountNumber ]

                const startingExtIndex = derivativeInstance.nextFreeAddressIndex - softGapLimit >= 0? derivativeInstance.nextFreeAddressIndex - softGapLimit : 0
                const startingIntIndex = derivativeInstance.nextFreeChangeAddressIndex - softGapLimit >= 0? derivativeInstance.nextFreeChangeAddressIndex - softGapLimit : 0

                if( !derivativeInstance.addressQueryList )
                {
                  derivativeInstance.addressQueryList = {
                    external: {
                    }, internal: {
                    }
                  }
                }

                // is out of bound external address?
                if( startingExtIndex )
                  for ( let itr = 0; itr < startingExtIndex; itr++ ) {
                    const { address } = this.createSecureMultiSig( itr, false, derivativeInstance.xpub )
                    if( consumedUTXO.address === address ){
                      derivativeInstance.addressQueryList.external[ consumedUTXO.address ] = true// include out of bound(soft-refresh range) ext address
                      found = true
                      break
                    }
                  }

                // is out of bound internal address?
                if( startingIntIndex && !found )
                  for ( let itr = 0; itr < startingIntIndex; itr++ ) {
                    const { address } = this.createSecureMultiSig( itr, true, derivativeInstance.xpub )
                    if( consumedUTXO.address === address ){
                      derivativeInstance.addressQueryList.internal[ consumedUTXO.address ] = true // include out of bound(soft-refresh range) int address
                      found = true
                      break
                    }
                  }

                if( found ) break
              }
            }
            if( found ) break
          }
      }
    }

  }

  public sortOutputs = async (
    outputs: Array<{
      address: string;
      value: number;
    }>,
    derivativeAccountDetails?: { type: string; number: number },
  ): Promise<
    Array<{
      address: string;
      value: number;
    }>
  > => {
    for ( const output of outputs ) {
      if ( !output.address ) {
        let changeAddress
        if ( derivativeAccountDetails ) {
          const { xpub, nextFreeChangeAddressIndex } = this.derivativeAccounts[
            derivativeAccountDetails.type
          ][ derivativeAccountDetails.number ]

          changeAddress = this.createSecureMultiSig(
            nextFreeChangeAddressIndex,
            true,
            xpub,
          ).address
        } else {
          changeAddress = this.createSecureMultiSig(
            this.nextFreeChangeAddressIndex,
            true,
          ).address
        }
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
    // console.log({ sortedOutputs: outputs });

    return outputs
  };

  public calculateSendMaxFee = (
    numberOfRecipients: number,
    feePerByte: number,
    derivativeAccountDetails?: { type: string; number: number },
  ): { fee: number } => {
    let inputUTXOs
    if ( derivativeAccountDetails ) {
      const derivativeUtxos = this.derivativeAccounts[
        derivativeAccountDetails.type
      ][ derivativeAccountDetails.number ].confirmedUTXOs
      inputUTXOs = derivativeUtxos ? derivativeUtxos : []
    } else {
      const derivativeUTXOs = []
      for ( const dAccountType of config.DERIVATIVE_ACC_TO_SYNC ) {
        const derivativeAccount = this.derivativeAccounts[ dAccountType ]
        if ( derivativeAccount.instance.using ) {
          for (
            let accountNumber = 1;
            accountNumber <= derivativeAccount.instance.using;
            accountNumber++
          ) {
            const derivativeInstance = derivativeAccount[ accountNumber ]
            if (
              derivativeInstance.confirmedUTXOs &&
              derivativeInstance.confirmedUTXOs.length
            )
              derivativeUTXOs.push( ...derivativeInstance.confirmedUTXOs )
          }
        }
      }

      inputUTXOs = [ ...this.confirmedUTXOs, ...derivativeUTXOs ]
    }

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
            network: this.network,
          } ),
          network: this.network,
        } ).address,
        value: Math.floor( confirmedBalance / numberOfRecipients ),
      } )
    }
    const { fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      feePerByte,
    )
    // console.log({ inputUTXOs, outputUTXOs, fee });

    return {
      fee
    }
  };

  public calculateCustomFee = (
    outputUTXOs: {
      address: string;
      value: number;
    }[],
    customTxFeePerByte: number,
    derivativeAccountDetails?: { type: string; number: number },
  ) => {
    let inputUTXOs
    if ( derivativeAccountDetails ) {
      const derivativeUtxos = this.derivativeAccounts[
        derivativeAccountDetails.type
      ][ derivativeAccountDetails.number ].confirmedUTXOs
      inputUTXOs = derivativeUtxos ? derivativeUtxos : []
    } else {
      const derivativeUTXOs = []
      for ( const dAccountType of config.DERIVATIVE_ACC_TO_SYNC ) {
        const derivativeAccount = this.derivativeAccounts[ dAccountType ]
        if ( derivativeAccount.instance.using ) {
          for (
            let accountNumber = 1;
            accountNumber <= derivativeAccount.instance.using;
            accountNumber++
          ) {
            const derivativeInstance = derivativeAccount[ accountNumber ]
            if (
              derivativeInstance.confirmedUTXOs &&
              derivativeInstance.confirmedUTXOs.length
            )
              derivativeUTXOs.push( ...derivativeInstance.confirmedUTXOs )
          }
        }
      }

      inputUTXOs = [ ...this.confirmedUTXOs, ...derivativeUTXOs ]
    }
    // console.log({ inputUTXOs });

    let confirmedBalance = 0
    inputUTXOs.forEach( ( confirmedUtxo ) => {
      confirmedBalance += confirmedUtxo.value
    } )
    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      customTxFeePerByte,
    )

    if ( !inputs ) return {
      fee, balance: confirmedBalance
    }
    return {
      inputs, outputs, fee, balance: confirmedBalance
    }
  };

  public transactionPrerequisites = (
    recipients: {
      address: string;
      amount: number;
    }[],
    averageTxFees: AverageTxFees,
    derivativeAccountDetails?: { type: string; number: number },
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
    let inputUTXOs
    if ( derivativeAccountDetails ) {
      const derivativeUtxos = this.derivativeAccounts[
        derivativeAccountDetails.type
      ][ derivativeAccountDetails.number ].confirmedUTXOs
      inputUTXOs = derivativeUtxos ? derivativeUtxos : []
    } else {
      const derivativeUTXOs = []
      for ( const dAccountType of config.DERIVATIVE_ACC_TO_SYNC ) {
        if ( dAccountType === TRUSTED_CONTACTS ) continue

        const derivativeAccount = this.derivativeAccounts[ dAccountType ]
        if ( derivativeAccount.instance.using ) {
          for (
            let accountNumber = 1;
            accountNumber <= derivativeAccount.instance.using;
            accountNumber++
          ) {
            const derivativeInstance = derivativeAccount[ accountNumber ]
            if (
              derivativeInstance.confirmedUTXOs &&
              derivativeInstance.confirmedUTXOs.length
            )
              derivativeUTXOs.push( ...derivativeInstance.confirmedUTXOs )
          }
        }
      }

      inputUTXOs = [ ...this.confirmedUTXOs, ...derivativeUTXOs ]
    }

    // console.log('Input UTXOs:', inputUTXOs);
    let confirmedBalance = 0
    inputUTXOs.forEach( ( confirmedUtxo ) => {
      confirmedBalance += confirmedUtxo.value
    } )

    const outputUTXOs = []
    for ( const recipient of recipients ) {
      outputUTXOs.push( {
        address: recipient.address,
        value: recipient.amount,
      } )
    }
    // console.log('Output UTXOs:', outputUTXOs);

    const defaultTxPriority = 'low' // doing base calculation with low fee (helps in sending the tx even if higher priority fee isn't possible)
    // console.log({ averageTxFees });

    const defaultFeePerByte = averageTxFees[ defaultTxPriority ].feePerByte
    const defaultEstimatedBlocks =
      averageTxFees[ defaultTxPriority ].estimatedBlocks

    const assets = coinselect( inputUTXOs, outputUTXOs, defaultFeePerByte )
    const defaultPriorityInputs = assets.inputs
    const defaultPriorityOutputs = assets.outputs
    const defaultPriorityFee = assets.fee

    // console.log('-------Transaction--------');
    // console.log('\tDynamic Fee', defaultPriorityFee);
    // console.log('\tInputs:', defaultPriorityInputs);
    // console.log('\tOutputs:', defaultPriorityOutputs);

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
    for ( const priority of [ 'low', 'medium', 'high' ] ) {
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
          if ( priority === 'medium' )
            txPrerequisites[ priority ] = {
              ...txPrerequisites[ 'low' ]
            }
          if ( priority === 'high' )
            txPrerequisites[ priority ] = {
              ...txPrerequisites[ 'medium' ]
            }
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

    // console.log({ txPrerequisites });
    return {
      txPrerequisites
    }
  };

  public createHDTransaction = async (
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: any,
    derivativeAccountDetails?: { type: string; number: number },
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
      // console.log({ inputs, outputs });
      const txb: bitcoinJS.TransactionBuilder = new bitcoinJS.TransactionBuilder(
        this.network,
      )
      // console.log({ txb });

      for ( const input of inputs ) {
        txb.addInput( input.txId, input.vout, nSequence )
      }

      const sortedOuts = await this.sortOutputs(
        outputs,
        derivativeAccountDetails,
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

  public signHDTransaction = (
    inputs: any,
    txb: bitcoinJS.TransactionBuilder,
  ): {
    signedTxb: bitcoinJS.TransactionBuilder;
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }>;
  } => {
    // single signature (via primary mnemonic), to be followed by server signing
    try {
      // console.log('------ Transaction Signing ----------');
      let vin = 0
      const childIndexArray = []

      for ( const input of inputs ) {
        const { multiSig, primaryPriv, childIndex } = this.getSigningEssentials(
          input.address,
        )
        txb.sign(
          vin,
          bip32.fromBase58( primaryPriv, this.network ),
          Buffer.from( multiSig.scripts.redeem, 'hex' ),
          null,
          input.value,
          Buffer.from( multiSig.scripts.witness, 'hex' ),
        )
        childIndexArray.push( {
          childIndex,
          inputIdentifier: {
            txId: input.txId,
            vout: input.vout,
            value: input.value,
          },
        } )
        vin++
      }

      return {
        signedTxb: txb, childIndexArray
      }
    } catch ( err ) {
      throw new Error( `Transaction signing failed: ${err.message}` )
    }
  };

  public serverSigningAndBroadcast = async (
    token: number,
    txHex: string,
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }>,
  ): Promise<{
    txid: string;
  }> => {
    try {
      let res: AxiosResponse
      try {
        res = await SIGNING_AXIOS.post( 'secureHDTransaction', {
          HEXA_ID,
          walletID: this.walletID,
          token,
          txHex,
          childIndexArray,
        } )
      } catch ( err ) {
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }

      // console.log(
      //  '---- Transaction Signed by BH Server (2nd sig for 2/3 MultiSig)----',
      //);

      // console.log({ txHex: res.data.txHex });
      // console.log('------ Broadcasting Transaction --------');

      const { txid } = await this.broadcastTransaction( res.data.txHex )
      // console.log({ txid });

      return {
        txid
      }
    } catch ( err ) {
      throw new Error( `Unable to transfer: ${err.message}` )
    }
  };

  public dualSignHDTransaction = (
    inputs: any,
    txb: bitcoinJS.TransactionBuilder,
  ): {
    signedTxb: bitcoinJS.TransactionBuilder;
  } => {
    // dual signing (via primary and secondary mnemonic), generates a fully-signed broadcastable transaction
    try {
      // console.log('------ Transaction Signing ----------');
      let vin = 0
      inputs.forEach( ( input ) => {
        // console.log('Signing Input:', input);
        const {
          multiSig,
          primaryPriv,
          secondaryPriv,
        } = this.getSigningEssentials( input.address )

        txb.sign(
          vin,
          bip32.fromBase58( primaryPriv, this.network ),
          Buffer.from( multiSig.scripts.redeem, 'hex' ),
          null,
          input.value,
          Buffer.from( multiSig.scripts.witness, 'hex' ),
        )

        if ( !secondaryPriv ) {
          throw new Error( 'Private key from secondary mnemonic is missing' )
        }
        txb.sign(
          vin,
          bip32.fromBase58( secondaryPriv, this.network ),
          Buffer.from( multiSig.scripts.redeem, 'hex' ),
          null,
          input.value,
          Buffer.from( multiSig.scripts.witness, 'hex' ),
        )
        vin += 1
      } )

      return {
        signedTxb: txb
      }
    } catch ( err ) {
      throw new Error( `Transaction signing failed: ${err.message}` )
    }
  };

  public prepareSecureAccount = (
    bhXpub: string,
    secondaryXpub?: string,
  ): { prepared: boolean } => {
    try {
      const primaryPath = `${config.DPATH_PURPOSE}'/0'/1'`
      const primaryXpub = this.getRecoverableXKey(
        this.primaryMnemonic,
        primaryPath,
      )
      this.primaryXpriv = this.getRecoverableXKey(
        this.primaryMnemonic,
        primaryPath,
        true,
      )

      if ( !secondaryXpub ) {
        if ( !this.secondaryMnemonic )
          throw new Error(
            'SecondaryXpub required; secondary mnemonic missing ',
          )
        const path = this.derivePath( bhXpub )
        secondaryXpub = this.getRecoverableXKey( this.secondaryMnemonic, path )
      }

      this.xpubs = {
        primary: primaryXpub,
        secondary: secondaryXpub,
        bh: bhXpub,
      }

      return {
        prepared: true,
      }
    } catch ( err ) {
      return {
        prepared: false,
      }
    }
  };

  public rederivePrimaryXKeys = (): boolean => {
    const primaryPath = `${config.DPATH_PURPOSE}'/0'/1'`
    const primaryXpub = this.getRecoverableXKey(
      this.primaryMnemonic,
      primaryPath,
    )
    this.primaryXpriv = this.getRecoverableXKey(
      this.primaryMnemonic,
      primaryPath,
      true,
    )
    this.xpubs.primary = primaryXpub
    return true
  };

  public generateSecondaryXpriv = ( secondaryMnemonic: string ): boolean => {
    const path = this.derivePath( this.xpubs.bh )
    const currentXpub = this.getRecoverableXKey( secondaryMnemonic, path )
    if ( currentXpub !== this.xpubs.secondary ) {
      throw new Error( 'Invaild secondary mnemonic' )
    }

    this.secondaryXpriv = this.getRecoverableXKey(
      secondaryMnemonic,
      path,
      true,
    )
    return true
  };

  public removeSecondaryXpriv = () => {
    this.secondaryXpriv = null
  };

  private getSigningEssentials = ( address: string ) => {
    for (
      let itr = 0;
      itr <= this.nextFreeChangeAddressIndex + this.gapLimit;
      itr++
    ) {
      const internal = true
      const multiSig = this.createSecureMultiSig( itr, internal )
      if ( multiSig.address === address ) {
        return {
          multiSig,
          primaryPriv: this.derivePrimaryChildXKey(
            this.primaryXpriv,
            itr,
            internal,
          ),
          secondaryPriv: this.secondaryXpriv
            ? this.deriveChildXKey( this.secondaryXpriv, itr )
            : null,
          childIndex: itr,
        }
      }
    }

    for ( let itr = 0; itr <= this.nextFreeAddressIndex + this.gapLimit; itr++ ) {
      const multiSig = this.createSecureMultiSig( itr )
      if ( multiSig.address === address ) {
        return {
          multiSig,
          primaryPriv: this.derivePrimaryChildXKey( this.primaryXpriv, itr ),
          secondaryPriv: this.secondaryXpriv
            ? this.deriveChildXKey( this.secondaryXpriv, itr )
            : null,
          childIndex: itr,
        }
      }
    }

    for ( const dAccountType of Object.keys( config.DERIVATIVE_ACC ) ) {
      if ( dAccountType === TRUSTED_CONTACTS ) continue
      const derivativeAccount = this.derivativeAccounts[ dAccountType ]
      if ( derivativeAccount.instance.using ) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          const derivativeInstance = derivativeAccount[ accountNumber ]
          if (
            derivativeInstance.usedAddresses &&
            derivativeInstance.usedAddresses.length
          ) {
            for (
              let itr = 0;
              itr <=
              derivativeInstance.nextFreeAddressIndex + this.derivativeGapLimit;
              itr++
            ) {
              const multiSig = this.createSecureMultiSig(
                itr,
                false,
                derivativeInstance.xpub,
              )
              const possibleAddress = multiSig.address
              if ( possibleAddress === address ) {
                return {
                  multiSig,
                  primaryPriv: this.deriveDerivativeChildXKey(
                    derivativeInstance.xpriv,
                    itr,
                  ),
                  secondaryPriv: this.secondaryXpriv
                    ? this.deriveChildXKey( this.secondaryXpriv, itr )
                    : null,
                  childIndex: itr,
                }
              }
            }

            for (
              let itr = 0;
              itr <=
              derivativeInstance.nextFreeChangeAddressIndex +
                this.derivativeGapLimit;
              itr++
            ) {
              const multiSig = this.createSecureMultiSig(
                itr,
                true,
                derivativeInstance.xpub,
              )
              const possibleAddress = multiSig.address
              if ( possibleAddress === address ) {
                return {
                  multiSig,
                  primaryPriv: this.deriveDerivativeChildXKey(
                    derivativeInstance.xpriv,
                    itr,
                    true,
                  ),
                  secondaryPriv: this.secondaryXpriv
                    ? this.deriveChildXKey( this.secondaryXpriv, itr )
                    : null,
                  childIndex: itr,
                }
              }
            }
          }
        }
      }
    }

    throw new Error( 'Could not find signing essentials for ' + address )
  };

  private getRecoverableXKey = (
    mnemonic: string,
    path: string,
    priv?: boolean,
  ): string => {
    const seed = bip39.mnemonicToSeedSync( mnemonic )
    const root = bip32.fromSeed( seed, this.network )
    if ( !priv ) {
      const xpub = root
        .derivePath( 'm/' + path )
        .neutered()
        .toBase58()
      return xpub
    } else {
      const xpriv = root.derivePath( 'm/' + path ).toBase58()
      return xpriv
    }
  };

  private getPub = ( extendedKey: string ): string => {
    const xKey = bip32.fromBase58( extendedKey, this.network )
    return xKey.publicKey.toString( 'hex' )
  };

  private derivePrimaryChildXKey = (
    extendedKey: string,
    childIndex: number,
    internal = false,
  ): string => {
    const xKey = bip32.fromBase58( extendedKey, this.network )
    const childXKey = xKey.derive( internal ? 1 : 0 ).derive( childIndex )
    return childXKey.toBase58()
  };

  private deriveChildXKey = (
    extendedKey: string,
    childIndex: number,
  ): string => {
    const xKey = bip32.fromBase58( extendedKey, this.network )
    const childXKey = xKey.derive( childIndex )
    return childXKey.toBase58()
  };

  private deriveDerivativeChildXKey = (
    extendedKey: string, // account xpub
    childIndex: number,
    internal = false,
  ): string => {
    const xKey = bip32.fromBase58( extendedKey, this.network )
    const childXKey = xKey.derive( internal ? 1 : 0 ).derive( childIndex ) // deriving on external chain
    return childXKey.toBase58()
  };

  private validateXpub = async ( xpub: string ) => {
    try {
      bip32.fromBase58( xpub, this.network )
      return true
    } catch ( err ) {
      return false
    }
  };

  private derivePath = ( bhXpub: string ): string => {
    const bhxpub = bip32.fromBase58( bhXpub, this.network )
    let path
    if ( bhxpub.index === 0 ) {
      path = config.SECURE_DERIVATION_BRANCH
    } else {
      path = config.SECURE_WALLET_XPUB_PATH + config.SECURE_DERIVATION_BRANCH
    }
    return path
  };

  private createSecureMultiSig = (
    childIndex: number,
    internal = false,
    derivativeXpub?: string,
  ): {
    scripts: {
      redeem: string;
      witness: string;
    };
    address: string;
  } => {
    let childPrimaryPub
    if ( !derivativeXpub )
      childPrimaryPub = this.getPub(
        this.derivePrimaryChildXKey( this.xpubs.primary, childIndex, internal ),
      )
    else
      childPrimaryPub = this.getPub(
        this.deriveDerivativeChildXKey( derivativeXpub, childIndex, internal ),
      )

    const childRecoveryPub = this.getPub(
      this.deriveChildXKey( this.xpubs.secondary, childIndex ),
    )
    const childBHPub = this.getPub(
      this.deriveChildXKey( this.xpubs.bh, childIndex ),
    )

    // public keys should be aligned in the following way: [bhPub, primaryPub, recoveryPub]
    // for generating ga_recovery based recoverable multiSigs
    const pubs = [ childBHPub, childPrimaryPub, childRecoveryPub ]
    // console.log({ pubs });
    const multiSig = this.generateMultiSig( 2, pubs )

    const construct = {
      scripts: {
        redeem: multiSig.p2sh.redeem.output.toString( 'hex' ),
        witness: multiSig.p2wsh.redeem.output.toString( 'hex' ),
      },
      address: multiSig.address,
    }

    return construct
  };

  private generateKey = ( psuedoKey: string ): string => {
    const hashRounds = 5048
    let key = psuedoKey
    for ( let itr = 0; itr < hashRounds; itr++ ) {
      const hash = crypto.createHash( 'sha512' )
      key = hash.update( key ).digest( 'hex' )
    }
    return key.slice( key.length - this.cipherSpec.keyLength )
  };

  private generateDerivativeXpub = (
    accountType: string,
    accountNumber = 1,
    accountName?: string,
  ) => {
    if ( accountType === TRUSTED_CONTACTS )
      throw new Error(
        `Secure a/c doesn't support account-type: ${accountType} yet`,
      )

    if ( !this.derivativeAccounts[ accountType ] )
      throw new Error( 'Unsupported dervative account' )
    if ( accountNumber > this.derivativeAccounts[ accountType ].instance.max )
      throw Error(
        `Cannot create more than ${this.derivativeAccounts[ accountType ].instance.max} ${accountType} derivative accounts`,
      )
    if ( this.derivativeAccounts[ accountType ][ accountNumber ] ) {
      return this.derivativeAccounts[ accountType ][ accountNumber ][ 'xpub' ]
    } else {
      const seed = bip39.mnemonicToSeedSync( this.primaryMnemonic )
      const root = bip32.fromSeed( seed, this.network )
      const path = `m/${config.DPATH_PURPOSE}'/${
        this.network === bitcoinJS.networks.bitcoin ? 0 : 1
      }'/${this.derivativeAccounts[ accountType ][ 'series' ] + accountNumber}'`
      // console.log({ path });
      const xpriv = root.derivePath( path ).toBase58()
      const xpub = root.derivePath( path ).neutered().toBase58()
      this.derivativeAccounts[ accountType ][ accountNumber ] = {
        xpub,
        xpubId: crypto
          .createHash( 'sha256' )
          .update( xpub + this.xpubs.secondary + this.xpubs.bh )
          .digest( 'hex' ),
        xpriv,
        nextFreeAddressIndex: 0,
        nextFreeChangeAddressIndex: 0,
        accountName,
      }
      this.derivativeAccounts[ accountType ].instance.using++

      this.derivativeAccounts[ accountType ][
        accountNumber
      ].receivingAddress = this.createSecureMultiSig(
        0,
        false,
        this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
      ).address
      return xpub
    }
  };
}
