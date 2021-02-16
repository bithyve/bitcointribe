import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import * as bitcoinJS from 'bitcoinjs-lib'
import coinselect from 'coinselect'
import crypto from 'crypto'
import config from '../../HexaConfig'
import Bitcoin from './Bitcoin'
import {
  Transactions,
  DerivativeAccounts,
  TransactionDetails,
  TransactionPrerequisite,
  TrustedContactDerivativeAccount,
  TrustedContactDerivativeAccountElements,
  DonationDerivativeAccount,
  DonationDerivativeAccountElements,
  SubPrimaryDerivativeAccountElements,
  WyreDerivativeAccountElements,
  RampDerivativeAccountElements,
  DerivativeAccount,
  DerivativeAccountElements,
  InputUTXOs,
  AverageTxFees,
} from '../Interface'
import { AxiosResponse } from 'axios'
import {
  TRUSTED_CONTACTS,
  DONATION_ACCOUNT,
  SUB_PRIMARY_ACCOUNT,
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
  WYRE,
  RAMP,
  FAST_BITCOINS,
} from '../../../common/constants/wallet-service-types'
import { BH_AXIOS } from '../../../services/api'
import { SATOSHIS_IN_BTC } from '../../../common/constants/Bitcoin'
import _ from 'lodash'
const { HEXA_ID } = config

export default class HDSegwitWallet extends Bitcoin {
  public balances: { balance: number; unconfirmedBalance: number } = {
    balance: 0,
    unconfirmedBalance: 0,
  };
  public receivingAddress: string;

  // TODO: convert transactionDetails into a map(txid >> txObj); would require migration script
  public transactions: Transactions = {
    totalTransactions: 0, // remove
    confirmedTransactions: 0, // remove
    unconfirmedTransactions: 0, // remove
    transactionDetails: [],
  };
  public derivativeAccounts:
    | DerivativeAccounts
    | TrustedContactDerivativeAccount
    | DonationDerivativeAccount = config.DERIVATIVE_ACC;
  public newTransactions: Array<TransactionDetails> = [];
  public trustedContactToDA: { [contactName: string]: number } = {
  };
  public feeRates: any;
  public accountName: string;
  public accountDescription: string;

  private mnemonic: string;
  private passphrase: string;
  private purpose: number;
  private derivationPath: string;
  private xpub: string;
  private xpriv: string;
  private nextFreeAddressIndex: number;
  private nextFreeChangeAddressIndex: number;
  private gapLimit: number;
  private lastBalTxSync = 0;
  private derivativeGapLimit: number;

  // TODO: convert confirmedUTXOs into a map(utxo:txid >> utxo:obj)
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

  constructor(
    mnemonic?: string,
    passphrase?: string,
    dPathPurpose?: number,
    stateVars?: {
      accountName: string;
      accountDescription: string;
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      txIdMap: {[txid: string]: string[]};
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
      addressQueryList:{external: {[address: string]: boolean}, internal: {[address: string]: boolean} };
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
      trustedContactToDA: { [contactName: string]: number };
      feeRates: any;
    },
    network?: bitcoinJS.Network,
  ) {
    super( network )
    this.mnemonic = mnemonic ? mnemonic : bip39.generateMnemonic( 256 )
    this.passphrase = passphrase
    this.purpose = dPathPurpose ? dPathPurpose : config.DPATH_PURPOSE
    // this.derivationPath =
    //   this.network === bitcoinJS.networks.bitcoin
    //     ? `m/${this.purpose}'/0'/0'`
    //     : `m/${this.purpose}'/1'/0'`;

    this.derivationPath = this.isTest
      ? `m/${this.purpose}'/1'/0'`
      : `m/${this.purpose}'/0'/0'` // helps with separating regular and test acc (even on the testnet)

    this.initializeStateVars( stateVars )
  }

  public initializeStateVars = ( stateVars ) => {
    if( stateVars ){
      this.accountName = stateVars.accountName ? stateVars.accountName: ''
      this.accountDescription = stateVars.accountDescription ? stateVars.accountDescription: ''
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
      this.unconfirmedUTXOs =
        stateVars.unconfirmedUTXOs
          ? stateVars.unconfirmedUTXOs
          : this.unconfirmedUTXOs
      this.confirmedUTXOs =
        stateVars.confirmedUTXOs
          ? stateVars.confirmedUTXOs
          : this.confirmedUTXOs
      this.addressQueryList = stateVars.addressQueryList ? stateVars.addressQueryList: this.addressQueryList
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
      this.trustedContactToDA =
        stateVars.trustedContactToDA
          ? stateVars.trustedContactToDA
          : this.trustedContactToDA
      this.feeRates =
        stateVars.feeRates ? stateVars.feeRates : this.feeRates
    }

  };

  public getMnemonic = (): { mnemonic: string } => {
    return {
      mnemonic: this.mnemonic
    }
  };

  public getTestXPub = (): string => {
    if ( this.isTest ) {
      if ( this.xpub ) {
        return this.xpub
      }
      const seed = bip39.mnemonicToSeedSync( this.mnemonic, this.passphrase )
      const root = bip32.fromSeed( seed, this.network )
      const child = root.derivePath( this.derivationPath ).neutered()
      this.xpub = child.toBase58()

      return this.xpub
    }
  };

  public getWalletId = (): { walletId: string } => {
    const seed = bip39.mnemonicToSeedSync( this.mnemonic, this.passphrase )
    return {
      walletId: crypto.createHash( 'sha256' ).update( seed ).digest( 'hex' ),
    }
  };

  public getAccountId = (): string => {
    const xpub = this.getXpub()
    return crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' )
  };

  public getInitialReceivingAddress = (): string => {
    return this.getAddress( false, 0 )
  };

  public getReceivingAddress = (
    derivativeAccountType?: string,
    accountNumber?: number,
  ): string => {
    let receivingAddress
    let account = null
    switch ( derivativeAccountType ) {
        case DONATION_ACCOUNT:
        case FAST_BITCOINS:
        case SUB_PRIMARY_ACCOUNT:
        case WYRE:
        case RAMP:
          if( !accountNumber ) throw new Error( 'Failed to generate receiving address: instance number missing' )
          account = this
            .derivativeAccounts[ derivativeAccountType ][ accountNumber ]
          receivingAddress = account ? account.receivingAddress : ''
          break
        default:
          receivingAddress = this.receivingAddress
    }
    return receivingAddress
  };

  public getDerivativeAccXpub = (
    accountType: string,
    accountNumber?: number,
    contactName?: string,
  ): string => {
    // generates receiving xpub for derivative accounts
    if ( accountType === TRUSTED_CONTACTS ) {
      if ( !contactName )
        throw new Error( `Required param: contactName for ${accountType}` )

      return this.getTrustedContactDerivativeAccXpub( accountType, contactName )
    }

    const baseXpub = this.generateDerivativeXpub( accountType, accountNumber )
    return baseXpub
  };

  public getTrustedContactDerivativeAccXpub = (
    accountType: string,
    contactName: string,
  ): string => {
    contactName = contactName.toLowerCase().trim()
    const trustedAccounts: TrustedContactDerivativeAccount = this
      .derivativeAccounts[ accountType ]
    const inUse = trustedAccounts.instance.using

    let accountNumber = this.trustedContactToDA[ contactName ]
    if ( accountNumber ) {
      return trustedAccounts[ accountNumber ].xpub
    }

    // for (let index = 0; index <= inUse; index++) {
    //   if (
    //     trustedAccounts[index] &&
    //     trustedAccounts[index].contactName === contactName
    //   ) {
    //     return trustedAccounts[index].xpub;
    //   }
    // }
    accountNumber = inUse + 1

    const baseXpub = this.generateTrustedDerivativeXpub(
      accountType,
      accountNumber,
      contactName,
    )

    return baseXpub
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
        case TRUSTED_CONTACTS:
          if ( !contactName )
            throw new Error( `Required param: contactName for ${accountType}` )

          return this.getTrustedContactDerivativeAccReceivingAddress(
            accountType,
            contactName,
          )

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

  public getTrustedContactDerivativeAccReceivingAddress = async (
    accountType: string,
    contactName: string,
  ) => {
    // provides receiving address from the contact's xpub
    contactName = contactName.toLowerCase().trim()
    const trustedAccounts: TrustedContactDerivativeAccount = this
      .derivativeAccounts[ accountType ]
    let account: TrustedContactDerivativeAccountElements

    const accountNumber = this.trustedContactToDA[ contactName ]
    if ( accountNumber ) {
      account = trustedAccounts[ accountNumber ]
    }

    if ( !account ) {
      throw new Error(
        `No contact derivative account exists for: ${contactName}`,
      )
    } else if ( !account.contactDetails ) {
      throw new Error( `Contact details (xpub) missing for ${contactName}` )
    }

    try {
      let availableAddress = ''
      let itr

      const { nextFreeAddressIndex } = account.contactDetails
      if ( nextFreeAddressIndex !== 0 && !nextFreeAddressIndex )
        account.contactDetails.nextFreeAddressIndex = 0

      for ( itr = 0; itr < this.derivativeGapLimit + 1; itr++ ) {
        const address = this.getAddress(
          false,
          account.contactDetails.nextFreeAddressIndex + itr,
          account.contactDetails.xpub,
        )

        const txCounts = await this.getTxCounts( [ address ] )
        if ( txCounts[ address ] === 0 ) {
          availableAddress = address
          account.contactDetails.nextFreeAddressIndex += itr
          break
        }
      }

      if ( !availableAddress )
        account.contactDetails.nextFreeAddressIndex += itr + 1

      account.contactDetails.receivingAddress = availableAddress
        ? availableAddress
        : this.getAddress(
          false,
          account.contactDetails.nextFreeAddressIndex + itr,
          account.contactDetails.xpub,
        )

      return {
        address: account.contactDetails.receivingAddress
      }
    } catch ( err ) {
      throw new Error( `Unable to generate receiving address: ${err.message}` )
    }
  };

  private syncDerivativeAccGapLimit = async ( accountType, accountNumber ) => {
    // scanning future addresses in hierarchy for transactions, in case our 'next free addr' indexes are lagging behind
    let tryAgain = false
    let { nextFreeAddressIndex, nextFreeChangeAddressIndex, xpub } = this.derivativeAccounts[ accountType ][
      accountNumber
    ]

    if ( nextFreeAddressIndex !== 0 && !nextFreeAddressIndex )
      nextFreeAddressIndex = 0
    if ( nextFreeChangeAddressIndex !== 0 && !nextFreeChangeAddressIndex )
      nextFreeChangeAddressIndex = 0

    const externalAddress = this.getAddress(
      false,
      nextFreeAddressIndex + this.derivativeGapLimit -
        1,
      xpub,
    )

    const internalAddress = this.getAddress(
      true,
      nextFreeChangeAddressIndex + this.derivativeGapLimit -
        1,
      xpub,
    )

    const txCounts = await this.getTxCounts( [ externalAddress, internalAddress ] )

    if ( txCounts[ externalAddress ] > 0 ) {
      this.derivativeAccounts[ accountType ][
        accountNumber
      ].nextFreeAddressIndex += this.derivativeGapLimit
      tryAgain = true
    }

    if ( txCounts[ internalAddress ] > 0 ) {
      this.derivativeAccounts[ accountType ][
        accountNumber
      ].nextFreeChangeAddressIndex += this.derivativeGapLimit
      tryAgain = true
    }

    if ( tryAgain ) {
      return this.syncDerivativeAccGapLimit( accountType, accountNumber )
    }
  };

  public blindRefreshCleanup = ( ) => {
    for( const accountType of Object.keys( config.DERIVATIVE_ACC ) ){
      for( let accountNumber = this.derivativeAccounts[ accountType ].instance.max; accountNumber > 0; accountNumber -- ){
        if ( ( this.derivativeAccounts[ accountType ][ accountNumber ] as DerivativeAccountElements ).blindGeneration ){
          // dynamically generated derv account (blind refresh)
          const { transactionDetails } = this.derivativeAccounts[ accountType ][ accountNumber ].transactions
          // remove if no txs exist on such an account
          if( !transactionDetails.length ){
            delete this.derivativeAccounts[ accountType ][ accountNumber ];
            ( this.derivativeAccounts[ accountType ] as DerivativeAccount ).instance.using = accountNumber - 1
          } else {
            ( this.derivativeAccounts[ accountType ] as DerivativeAccount ).instance.using = accountNumber
            for( let remainingAcc = accountNumber; remainingAcc > 0; remainingAcc -- ){
              ( this.derivativeAccounts[ accountType ][ remainingAcc ] as DerivativeAccountElements ).blindGeneration = null
            }
            break
          }
        }
      }
    }
  }

  public fetchDerivativeAccBalanceTxs = async (
    accountsInfo: {
      accountType: string,
      accountNumber: number,
      contactName?: string,
    }[],
    hardRefresh?: boolean,
    blindRefresh?: boolean
  ): Promise<{
    synched: boolean,
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

    for( const { accountType, accountNumber, contactName } of accountsInfo ){

      if( blindRefresh ){
        if( !this.derivativeAccounts[ accountType ][ accountNumber ] ){
          // blind derv-account generation
          this.getDerivativeAccXpub( accountType, accountNumber, contactName );
          ( this.derivativeAccounts[ accountType ][ accountNumber ] as DerivativeAccountElements ).blindGeneration = true
        }
        await this.syncDerivativeAccGapLimit( accountType, accountNumber )
      }

      let {
        nextFreeAddressIndex,
        nextFreeChangeAddressIndex,
      } = ( this.derivativeAccounts[ accountType ][ accountNumber ] as DerivativeAccountElements )
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
        const address = this.getAddress(
          false,
          itr,
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
        const address = this.getAddress(
          true,
          itr,
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
        accountType,
        contactName,
        primaryAccType: accountType === SUB_PRIMARY_ACCOUNT ? 'Checking Account' : null
      }
    }

    const { synchedAccounts } = await this.fetchBalanceTransactionsByAddresses( accounts )

    const txsFound: TransactionDetails[] = []
    for( let { accountType, accountNumber, contactName } of accountsInfo ){
      if ( accountType === TRUSTED_CONTACTS ) {
        contactName = contactName.toLowerCase().trim()
        accountNumber = this.trustedContactToDA[ contactName ]
      }
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
        if( txIdMap ){
          const deltaTxs = this.findTxDelta( txIdMap, res.txIdMap, res.transactions )
          if( deltaTxs.length ) txsFound.push( ...deltaTxs )
        } else txsFound.push( ...res.transactions.transactionDetails )
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
        receivingAddress: this.getAddress(
          false,
          res.nextFreeAddressIndex,
          this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
        ),
      }
    }

    // blind refresh sub-acc cleanup
    if( blindRefresh )
      this.blindRefreshCleanup()

    return {
      synched: true,
      txsFound,
    }
  };

  public syncDerivativeAccountsBalanceTxs = async (
    accountTypes: string[],
    hardRefresh?: boolean,
    blindRefresh?: boolean,
  ): Promise<{
    synched: boolean;
    txsFound: TransactionDetails[];
  }> => {
    const accountsInfo :  {
      accountType: string,
      accountNumber: number,
      contactName?: string
    }[] = []

    for ( const dAccountType of accountTypes ) {
      const derivativeAccounts = this.derivativeAccounts[ dAccountType ]

      const instanceToIterate = blindRefresh? derivativeAccounts.instance.max: derivativeAccounts.instance.using
      for (
        let accountNumber = 1;
        accountNumber <= instanceToIterate;
        accountNumber++
      ) {
        const info: {
          accountType: string;
          accountNumber: number;
          contactName?: string;
        } = {
          accountType: dAccountType, accountNumber
        }
        if( dAccountType === TRUSTED_CONTACTS ){
          if( derivativeAccounts[ accountNumber ] ) info.contactName = derivativeAccounts[ accountNumber ].contactName
          else if( blindRefresh ) info.contactName = `contact ${accountNumber}`
        }
        accountsInfo.push( info )
      }
    }

    if( accountsInfo.length )
      return this.fetchDerivativeAccBalanceTxs( accountsInfo, hardRefresh, blindRefresh )
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
    for (
      let itr = 0;
      itr < nextFreeChangeAddressIndex + this.derivativeGapLimit;
      itr++
    ) {
      internalAddresses.push(
        this.getAddress(
          true,
          itr,
          this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
        ),
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
    ].receivingAddress = this.getAddress(
      false,
      nextFreeAddressIndex,
      this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
    )

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
        case RAMP:
          const RampDerivativeAcc: DerivativeAccount = this
            .derivativeAccounts[ accountType ]
          const RampInUse = RampDerivativeAcc.instance.using
          accountNumber = RampInUse + 1
          this.generateDerivativeXpub( accountType, accountNumber )
          const RampDerivativeInstance: DerivativeAccountElements = this
            .derivativeAccounts[ accountType ][ accountNumber ]
          const RampUpdatedDervInstance = {
            ...RampDerivativeInstance,
            accountName: accountDetails.accountName,
            accountDescription: accountDetails.accountDescription,
          }
          this.derivativeAccounts[ accountType ][
            accountNumber
          ] = RampUpdatedDervInstance
          accountId = RampUpdatedDervInstance.xpubId
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
        case TEST_ACCOUNT:
          this.accountName = account.customDisplayName
          this.accountDescription = account.customDescription
          break

        case REGULAR_ACCOUNT:
          if( !account.instanceNumber ){
          // instance num zero represents the parent acc
            this.accountName = account.customDisplayName
            this.accountDescription = account.customDescription
          } else {
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
        case WYRE:
          const wyreInstance: WyreDerivativeAccountElements =
              this.derivativeAccounts[ WYRE ][ account.instanceNumber ]

          wyreInstance.accountName = account.customDisplayName
          wyreInstance.accountDescription = account.customDescription
          break
        case RAMP:
          const rampInstance: RampDerivativeAccountElements =
              this.derivativeAccounts[ RAMP ][ account.instanceNumber ]

          rampInstance.accountName = account.customDisplayName
          rampInstance.accountDescription = account.customDescription
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
      xpubId = crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' )
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
          xpubs: [ xpub ],
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

  public deriveReceivingAddress = async (
    xpub: string,
  ): Promise<{ address: string }> => {
    try {
      let availableAddress = ''
      let itr
      for ( itr = 0; itr < this.gapLimit + 1; itr++ ) {
        const address = this.getAddress( false, itr, xpub )
        const txCounts = await this.getTxCounts( [ address ] )
        if ( txCounts[ address ] === 0 ) {
          availableAddress = address
          break
        }
      }

      return {
        address: availableAddress
          ? availableAddress
          : this.getAddress( false, itr ),
      }
    } catch ( err ) {
      throw new Error( `Unable to generate receiving address: ${err.message}` )
    }
  };

  public testnetFaucet = async (): Promise<{
    txid: any;
    funded: any;
    balances: any;
    transactions: any;
  }> => {
    if ( !this.isTest ) {
      throw new Error( 'Can only fund test account' )
    }
    const amount = 10000 / SATOSHIS_IN_BTC
    let res: AxiosResponse
    const recipientAddress = this.getAddress( false, 0 )
    try {
      res = await BH_AXIOS.post( '/testnetFaucet', {
        HEXA_ID,
        recipientAddress,
        amount,
      } )
      // console.log({ res });
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { txid, funded } = res.data

    if ( txid ) {
      const externalAddresses = {
        [ recipientAddress ]: 0
      }
      const internalAddresses = {
      }
      const ownedAddresses = [ recipientAddress ]

      const externalAddressSet = externalAddresses
      const internalAddressSet = internalAddresses

      const xpubId = crypto.createHash( 'sha256' ).update( this.getXpub() ).digest( 'hex' )
      const accounts = {
        [ xpubId ]: {
          externalAddressSet,
          internalAddressSet,
          externalAddresses,
          internalAddresses,
          ownedAddresses,
          cachedUTXOs: this.confirmedUTXOs,
          cachedTxs: this.transactions,
          cachedTxIdMap: this.txIdMap,
          cachedAQL: this.addressQueryList,
          lastUsedAddressIndex: this.nextFreeAddressIndex - 1,
          lastUsedChangeAddressIndex: this.nextFreeChangeAddressIndex - 1,
          accountType: 'Test Account'
        }
      }
      const { synchedAccounts } = await this.fetchBalanceTransactionsByAddresses( accounts )

      const  {
        UTXOs,
        balances,
        transactions,
        nextFreeAddressIndex,
        nextFreeChangeAddressIndex,
      } = synchedAccounts[ xpubId ]

      const confirmedUTXOs = []
      for ( const utxo of UTXOs ) {
        if ( utxo.status ) {
          if ( this.isTest && utxo.address === this.getAddress( false, 0 ) ) {
            confirmedUTXOs.push( utxo ) // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
            continue
          }

          if ( utxo.status.confirmed ) confirmedUTXOs.push( utxo )
        } else {
          // utxo's from fallback won't contain status var (defaulting them as confirmed)
          confirmedUTXOs.push( utxo )
        }
      }

      this.confirmedUTXOs = confirmedUTXOs
      this.nextFreeAddressIndex = nextFreeAddressIndex
      this.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex
      this.receivingAddress = this.getAddress( false, this.nextFreeAddressIndex )

      this.balances = balances
      this.transactions = transactions
    }
    return {
      txid,
      funded,
      balances: this.balances,
      transactions: this.transactions,
    }
  };


  private syncGapLimit = async () => {
    // synching nextFreeAddressIndex and nextFreeChangeAddressIndex(typically during blind refresh)
    let tryAgain = false
    const hardGapLimit = 10
    const externalAddress = this.getAddress( false,
      this.nextFreeAddressIndex + hardGapLimit - 1,
    )

    const internalAddress = this.getAddress( true,
      this.nextFreeChangeAddressIndex + hardGapLimit - 1,
    )

    const txCounts = await this.getTxCounts( [ externalAddress, internalAddress ] )

    if ( txCounts[ externalAddress ] > 0 ) {
      this.nextFreeAddressIndex += this.gapLimit
      tryAgain = true
    }

    if ( txCounts[ internalAddress ] > 0 ) {
      this.nextFreeChangeAddressIndex += this.gapLimit
      tryAgain = true
    }

    if ( tryAgain ) {
      return this.syncGapLimit()
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

  public fetchBalanceTransaction = async ( hardRefresh?: boolean, blindRefresh?: boolean  ): Promise<{
    balances: {
      balance: number;
      unconfirmedBalance: number;
    };
    transactions: Transactions;
    txsFound: TransactionDetails[]
  }> => {
    const ownedAddresses = [] // owned address mapping
    // owned addresses are used for apt tx categorization and transfer amount calculation

    if( blindRefresh ) await this.syncGapLimit()

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
      const address = this.getAddress( false, itr )
      externalAddresses[ address ] = itr
      ownedAddresses.push( address )
      if( itr >= startingExtIndex ) externalAddressSet[ address ] = itr
    }

    const internalAddresses :{[address: string]: number}  = {
    }// all internal addresses(till closingIntIndex)
    const internalAddressSet :{[address: string]: number}= {
    } // internal address range set
    for ( let itr = 0; itr < closingIntIndex; itr++ ) {
      const address = this.getAddress( true, itr )
      internalAddresses[ address ] = itr
      ownedAddresses.push( address )
      if( itr >= startingIntIndex ) internalAddressSet[ address ] = itr
    }

    const batchedDerivativeAddresses = []
    if ( !this.isTest ) {
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

    const xpubId = crypto.createHash( 'sha256' ).update( this.getXpub() ).digest( 'hex' )
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
        accountType: this.isTest ? 'Test Account' : 'Checking Account'
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
        if ( this.isTest && utxo.address === this.getAddress( false, 0 ) ) {
          confirmedUTXOs.push( utxo ) // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
          continue
        }

        if ( utxo.status.confirmed ) confirmedUTXOs.push( utxo )
        else {
          if ( internalAddressSet[ utxo.address ] !== undefined ) {
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
    this.receivingAddress = this.getAddress( false, this.nextFreeAddressIndex )

    const txsFound: TransactionDetails[] = hardRefresh? this.findTxDelta( this.txIdMap, txIdMap, transactions ) : []
    this.transactions = transactions
    this.txIdMap = txIdMap
    this.setNewTransactions( transactions )

    return {
      balances, transactions, txsFound
    }
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
    // console.log({ inputUTXOs });

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
    inputUTXOs.forEach( ( utxo ) => {
      confirmedBalance += utxo.value
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
            txPrerequisites[ priority ] = txPrerequisites[ 'low' ]
          if ( priority === 'high' )
            txPrerequisites[ priority ] = txPrerequisites[ 'medium' ]
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
    witnessScript?: any,
  ): bitcoinJS.TransactionBuilder => {
    try {
      // console.log('------ Transaction Signing ----------');
      let vin = 0
      for ( const input of inputs ) {
        const keyPair = this.getKeyPair(
          this.addressToPrivateKey( input.address ),
        )

        txb.sign(
          vin,
          keyPair,
          this.getP2SH( keyPair ).redeem.output,
          null,
          input.value,
          witnessScript,
        )
        vin++
      }

      return txb
    } catch ( err ) {
      throw new Error( `Transaction signing failed: ${err.message}` )
    }
  };

  public removeConsumedUTXOs= ( inputs: InputUTXOs[], derivativeAccountDetails?: { type: string; number: number },
  ) => {
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

            const derivativeInstance: DerivativeAccountElements = derivativeAccount[ accountNumber ]
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

  private updateQueryList = ( consumedUTXOs: {[txid: string]: InputUTXOs}, derivativeAccountDetails?: { type: string; number: number } ) => {
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
            const address = this.getAddress( false, itr, derivativeInstance.xpub )
            if( consumedUTXO.address === address ){
              derivativeInstance.addressQueryList.external[ consumedUTXO.address ] = true// include out of bound(soft-refresh range) ext address
              found = true
              break
            }
          }

        // is out of bound internal address?
        if( startingIntIndex && !found )
          for ( let itr = 0; itr < startingIntIndex; itr++ ) {
            const address = this.getAddress( true, itr, derivativeInstance.xpub )
            if( consumedUTXO.address === address ){
              derivativeInstance.addressQueryList.internal[ consumedUTXO.address ] = true // include out of bound(soft-refresh range) int address
              found = true
              break
            }
          }
      }
    }
    else {
      // updates query list(primary: reg/test) with out of bound(lower bound) external/internal addresses
      const startingExtIndex = this.nextFreeAddressIndex - softGapLimit >= 0? this.nextFreeAddressIndex - softGapLimit : 0
      const startingIntIndex = this.nextFreeChangeAddressIndex - softGapLimit >= 0? this.nextFreeChangeAddressIndex - softGapLimit : 0

      for( const consumedUTXO of Object.values( consumedUTXOs ) ){
        let found = false
        // is out of bound external address?
        if( startingExtIndex )
          for ( let itr = 0; itr < startingExtIndex; itr++ ) {
            const address = this.getAddress( false, itr )
            if( consumedUTXO.address === address ){
              this.addressQueryList.external[ consumedUTXO.address ] = true// include out of bound(soft-refresh range) ext address
              found = true
              break
            }
          }

        // is out of bound internal address?
        if( startingIntIndex && !found )
          for ( let itr = 0; itr < startingIntIndex; itr++ ) {
            const address = this.getAddress( true, itr )
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
                    const address = this.getAddress( false, itr, derivativeInstance.xpub )
                    if( consumedUTXO.address === address ){
                      derivativeInstance.addressQueryList.external[ consumedUTXO.address ] = true// include out of bound(soft-refresh range) ext address
                      found = true
                      break
                    }
                  }

                // is out of bound internal address?
                if( startingIntIndex && !found )
                  for ( let itr = 0; itr < startingIntIndex; itr++ ) {
                    const address = this.getAddress( true, itr, derivativeInstance.xpub )
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

  private sortOutputs = async (
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

          changeAddress = this.getAddress(
            true,
            nextFreeChangeAddressIndex,
            xpub,
          )
        } else {
          changeAddress = this.getAddress(
            true,
            this.nextFreeChangeAddressIndex,
          )
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

    return outputs
  };

  private getPrivateKey = (
    change: boolean,
    index: number,
    derivativeXpriv?: string,
  ) => {
    const node = bip32.fromBase58(
      derivativeXpriv ? derivativeXpriv : this.getXpriv(),
      this.network,
    )
    return node
      .derive( change ? 1 : 0 )
      .derive( index )
      .toWIF()
  };

  private getAddress = (
    internal: boolean,
    index: number,
    derivativeXpub?: string,
  ): string => {
    const node = bip32.fromBase58(
      derivativeXpub ? derivativeXpub : this.getXpub(),
      this.network,
    )
    return this.deriveAddress(
      node.derive( internal ? 1 : 0 ).derive( index ),
      this.purpose,
    )
  };

  private addressToPrivateKey = ( address: string ): string => {
    for (
      let itr = 0;
      itr <= this.nextFreeChangeAddressIndex + this.gapLimit;
      itr++
    ) {
      if ( this.getAddress( true, itr ) === address ) {
        return this.getPrivateKey( true, itr )
      }
    }

    for ( let itr = 0; itr <= this.nextFreeAddressIndex + this.gapLimit; itr++ ) {
      if ( this.getAddress( false, itr ) === address ) {
        return this.getPrivateKey( false, itr )
      }
    }

    if ( !this.isTest ) {
      // address to WIF for derivative accounts
      for ( const dAccountType of Object.keys( config.DERIVATIVE_ACC ) ) {
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
                derivativeInstance.nextFreeAddressIndex +
                  this.derivativeGapLimit; // would always be greater than
                itr++
              ) {
                if (
                  this.getAddress( false, itr, derivativeInstance.xpub ) ===
                  address
                ) {
                  return this.getPrivateKey(
                    false,
                    itr,
                    derivativeInstance.xpriv,
                  )
                }
              }

              for (
                let itr = 0;
                itr <=
                derivativeInstance.nextFreeChangeAddressIndex +
                  this.derivativeGapLimit; // would always be greater than
                itr++
              ) {
                if (
                  this.getAddress( true, itr, derivativeInstance.xpub ) ===
                  address
                ) {
                  return this.getPrivateKey(
                    true,
                    itr,
                    derivativeInstance.xpriv,
                  )
                }
              }
            }
          }
        }
      }
    }

    throw new Error( 'Could not find private key for: ' + address )
  };

  private getXpub = () => {
    if ( this.xpub ) {
      return this.xpub
    }
    const seed = bip39.mnemonicToSeedSync( this.mnemonic, this.passphrase )
    const root = bip32.fromSeed( seed, this.network )
    const child = root.derivePath( this.derivationPath ).neutered()
    this.xpub = child.toBase58()

    return this.xpub
  };

  private getXpriv = () => {
    if ( this.xpriv ) {
      return this.xpriv
    }
    const seed = bip39.mnemonicToSeedSync( this.mnemonic, this.passphrase )
    const root = bip32.fromSeed( seed, this.network )
    const child = root.derivePath( this.derivationPath )
    this.xpriv = child.toBase58()

    return this.xpriv
  };

  private generateTrustedDerivativeXpub = (
    accountType: string,
    accountNumber = 1,
    contactName: string,
  ) => {
    const xpub = this.generateDerivativeXpub( accountType, accountNumber )
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].contactName = contactName
    this.trustedContactToDA[ contactName ] = accountNumber

    return xpub
  };

  private generateDerivativeXpub = (
    accountType: string,
    accountNumber = 1,
    accountName?: string,
  ) => {
    if ( !this.derivativeAccounts[ accountType ] )
      throw new Error( 'Unsupported dervative account' )
    if ( accountNumber > this.derivativeAccounts[ accountType ].instance.max )
      throw Error(
        `Cannot create more than ${this.derivativeAccounts[ accountType ].instance.max} ${accountType} derivative accounts`,
      )
    if ( this.derivativeAccounts[ accountType ][ accountNumber ] ) {
      return this.derivativeAccounts[ accountType ][ accountNumber ][ 'xpub' ]
    } else {
      const seed = bip39.mnemonicToSeedSync( this.mnemonic, this.passphrase )
      const root = bip32.fromSeed( seed, this.network )
      const path = `m/${this.purpose}'/${
        this.network === bitcoinJS.networks.bitcoin ? 0 : 1
      }'/${this.derivativeAccounts[ accountType ][ 'series' ] + accountNumber}'`
      const xpriv = root.derivePath( path ).toBase58()
      const xpub = root.derivePath( path ).neutered().toBase58()
      this.derivativeAccounts[ accountType ][ accountNumber ] = {
        xpriv,
        xpub,
        xpubId: crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' ),
        nextFreeAddressIndex: 0,
        nextFreeChangeAddressIndex: 0,
        accountName,
      }
      this.derivativeAccounts[ accountType ].instance.using++

      this.derivativeAccounts[ accountType ][
        accountNumber
      ].receivingAddress = this.getAddress( false, 0, xpub )

      return xpub
    }
  };
}
