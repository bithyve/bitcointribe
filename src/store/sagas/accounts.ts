import { call, put, select } from 'redux-saga/effects'
import { createWatcher } from '../utils/utilities'
import {
  GET_TESTCOINS,
  GENERATE_SECONDARY_XPRIV,
  RESET_TWO_FA,
  twoFAResetted,
  UPDATE_DONATION_PREFERENCES,
  secondaryXprivGenerated,
  ADD_NEW_ACCOUNT_SHELLS,
  newAccountShellsAdded,
  ReassignTransactionsActionPayload,
  REASSIGN_TRANSACTIONS,
  transactionReassignmentSucceeded,
  transactionReassignmentFailed,
  MergeAccountShellsActionPayload,
  MERGE_ACCOUNT_SHELLS,
  accountShellMergeSucceeded,
  accountShellMergeFailed,
  REFRESH_ACCOUNT_SHELLS,
  AUTO_SYNC_SHELLS,
  accountShellRefreshCompleted,
  accountShellRefreshStarted,
  FETCH_FEE_AND_EXCHANGE_RATES,
  exchangeRatesCalculated,
  setAverageTxFee,
  VALIDATE_TWO_FA,
  twoFAValid,
  clearAccountSyncCache,
  CREATE_SM_N_RESETTFA_OR_XPRIV,
  resetTwoFA,
  generateSecondaryXpriv,
  SYNC_ACCOUNTS,
  updateAccountShells,
  getTestcoins,
  refreshAccountShells,
  UPDATE_ACCOUNT_SETTINGS,
  accountSettingsUpdated,
  accountSettingsUpdateFailed,
  updateAccounts,
  RESTORE_ACCOUNT_SHELLS,
} from '../actions/accounts'
import {
  updateWalletImageHealth
} from '../actions/health'
import {
  SECURE_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import {
  Account,
  Accounts,
  AccountType,
  ActiveAddressAssignee,
  ActiveAddresses,
  ContactInfo,
  DonationAccount,
  MultiSigAccount,
  NetworkType,
  TrustedContact,
  Trusted_Contacts,
  UnecryptedStreamData,
  Wallet,
} from '../../bitcoin/utilities/Interface'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import AccountShell from '../../common/data/models/AccountShell'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import SyncStatus from '../../common/data/enums/SyncStatus'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import { insertDBWorker } from './storage'
import config from '../../bitcoin/HexaConfig'
import { AccountsState } from '../reducers/accounts'
import LevelHealth from '../../bitcoin/utilities/LevelHealth/LevelHealth'
import TrustedContacts from '../../bitcoin/utilities/TrustedContacts'
import AccountOperations from '../../bitcoin/utilities/accounts/AccountOperations'
import * as bitcoinJS from 'bitcoinjs-lib'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import { generateAccount, generateDonationAccount, generateMultiSigAccount } from '../../bitcoin/utilities/accounts/AccountFactory'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { updateWallet } from '../actions/storage'
import { APP_STAGE } from '../../common/interfaces/Interfaces'
import * as bip39 from 'bip39'
import crypto from 'crypto'
import TestSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TestSubAccountInfo'
import CheckingSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo'
import SavingsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo'
import DonationSubAccountInfo from '../../common/data/models/SubAccountInfo/DonationSubAccountInfo'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'

import dbManager from '../../storage/realm/dbManager'
import _ from 'lodash'
import Relay from '../../bitcoin/utilities/Relay'
import AccountVisibility from '../../common/data/enums/AccountVisibility'
import { syncPermanentChannelsWorker } from './trustedContacts'
import { PermanentChannelsSyncKind } from '../actions/trustedContacts'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'

// to be used by react components(w/ dispatch)
export function getNextFreeAddress( dispatch: any, account: Account | MultiSigAccount, requester?: ActiveAddressAssignee ) {
  const { updatedAccount, receivingAddress } = AccountOperations.getNextFreeExternalAddress( account, requester )
  dispatch( updateAccounts( {
    accounts: {
      [ updatedAccount.id ]: updatedAccount
    }
  } ) )
  dbManager.updateAccount( ( updatedAccount as Account ).id, updatedAccount )
  return receivingAddress
}

// to be used by sagas(w/o dispatch)
export function* getNextFreeAddressWorker( account: Account | MultiSigAccount, requester?: ActiveAddressAssignee ) {
  const { updatedAccount, receivingAddress } = yield call( AccountOperations.getNextFreeExternalAddress, account, requester )
  yield put( updateAccounts( {
    accounts: {
      [ updatedAccount.id ]: updatedAccount
    }
  } ) )
  yield call( dbManager.updateAccount, ( updatedAccount as Account ).id, updatedAccount )
  return receivingAddress
}

function* updatePaymentAddressesToChannels( activeAddressesWithNewTxsMap: {
  [accountId: string]: ActiveAddresses
}, synchedAccounts ){
  const wallet: Wallet = yield select( state => state.storage.wallet )
  const channelUpdates = []
  for( const accountId of Object.keys( activeAddressesWithNewTxsMap ) ){
    const newTxActiveAddresses: ActiveAddresses = activeAddressesWithNewTxsMap[ accountId ]

    for( const address of Object.keys( newTxActiveAddresses.external ) ) {
      const { assignee } = newTxActiveAddresses.external[ address ]
      if( assignee.type === AccountType.FNF_ACCOUNT ){
        const channelKey = assignee.id
        const streamUpdates: UnecryptedStreamData = {
          streamId: TrustedContactsOperations.getStreamId( wallet.walletId ),
          primaryData: {
            paymentAddresses: {
              [ ( synchedAccounts[ accountId ] as Account ).type ]: yield call( getNextFreeAddressWorker, synchedAccounts[ accountId ], assignee )
            }
          },
          metaData: {
            flags:{
              active: true,
              newData: true,
              lastSeen: Date.now(),
            },
          }
        }

        const contactInfo: ContactInfo = {
          channelKey: channelKey,
        }
        channelUpdates.push( {
          contactInfo, streamUpdates
        } )
      }
    }
  }

  if( Object.keys( channelUpdates ).length )
    yield call ( syncPermanentChannelsWorker, {
      payload: {
        permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
        channelUpdates
      }
    } )
}

function* syncAccountsWorker( { payload }: {payload: {
  accounts: Accounts,
  options: {
    hardRefresh?: boolean;
    syncDonationAccount?: boolean,
  }}} ) {
  const { accounts, options } = payload
  const network = AccountUtilities.getNetworkByType( Object.values( accounts )[ 0 ].networkType )

  if( options.syncDonationAccount ){
    // can only sync one donation instance at a time
    const donationAccount = ( Object.values( accounts )[ 0 ] as DonationAccount )

    const { synchedAccount, txsFound } = yield call(
      AccountOperations.syncDonationAccount,
      donationAccount,
      network )

    const synchedAccounts = {
      [ synchedAccount.id ]: synchedAccount
    }
    return {
      synchedAccounts, txsFound, activeAddressesWithNewTxsMap: {
      }
    }
  } else {
    const { synchedAccounts, txsFound, activeAddressesWithNewTxsMap } = yield call(
      AccountOperations.syncAccounts,
      accounts,
      network,
      options.hardRefresh )

    return {
      synchedAccounts, txsFound, activeAddressesWithNewTxsMap
    }
  }
}

export const syncAccountsWatcher = createWatcher(
  syncAccountsWorker,
  SYNC_ACCOUNTS
)

function* generateSecondaryXprivWorker( { payload }: { payload: { accountShell: AccountShell, secondaryMnemonic: string } } ) {
  const { secondaryMnemonic, accountShell } = payload
  const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
  const accountsState: AccountsState = yield select( ( state ) => state.accounts )
  const account = ( accountsState.accounts[ accountShell.primarySubAccount.id ] as MultiSigAccount )
  const network = config.APP_STAGE === APP_STAGE.DEVELOPMENT? bitcoinJS.networks.testnet: bitcoinJS.networks.bitcoin

  const { secondaryXpriv } = yield call( AccountUtilities.generateSecondaryXpriv,
    secondaryMnemonic,
    wallet.details2FA.secondaryXpub,
    network,
  )

  if ( secondaryXpriv ){
    account.xprivs.secondary = secondaryXpriv
    yield put( updateAccounts( {
      accounts: {
        [ account.id ]: account
      }
    } ) )
    yield call( dbManager.updateAccount, account.id, account )
    yield put( secondaryXprivGenerated( true ) )
  }
  else yield put( secondaryXprivGenerated( false ) )
}

export const generateSecondaryXprivWatcher = createWatcher(
  generateSecondaryXprivWorker,
  GENERATE_SECONDARY_XPRIV
)

function* testcoinsWorker( { payload: testAccount }: { payload: Account } ) {
  const { receivingAddress } = AccountOperations.getNextFreeExternalAddress( testAccount )
  const network = AccountUtilities.getNetworkByType( testAccount.networkType )

  const { txid } = yield call( AccountUtilities.getTestcoins, receivingAddress, network )

  if( !txid ) console.log( 'Failed to get testcoins' )
  else{
    const accountsState: AccountsState = yield select( ( state ) => state.accounts )
    let testShell: AccountShell
    accountsState.accountShells.forEach( ( shell )=>{
      if( shell.primarySubAccount.id === testAccount.id ) testShell = shell
    } )
    if( testShell ) yield put( refreshAccountShells( [ testShell ], {
    } ) )
  }
}

export const testcoinsWatcher = createWatcher( testcoinsWorker, GET_TESTCOINS )

function* feeAndExchangeRatesWorker() {
  const storedExchangeRates = yield select(
    ( state ) => state.accounts.exchangeRates
  )
  const storedAverageTxFees = yield select(
    ( state ) => state.accounts.averageTxFees
  )
  const currencyCode = yield select(
    ( state ) => state.preferences.currencyCode
  )
  try {
    const { exchangeRates, averageTxFees } = yield call( Relay.fetchFeeAndExchangeRates, currencyCode )
    if ( !exchangeRates ) console.log( 'Failed to fetch exchange rates' )
    else {
      if (
        JSON.stringify( exchangeRates ) !== JSON.stringify( storedExchangeRates )
      )
        yield put( exchangeRatesCalculated( exchangeRates ) )
    }

    if ( !averageTxFees ) console.log( 'Failed to fetch fee rates' )
    else {
      if (
        JSON.stringify( averageTxFees ) !== JSON.stringify( storedAverageTxFees )
      )
        yield put( setAverageTxFee( averageTxFees ) )
    }
  } catch ( err ) {
    console.log( {
      err
    } )
  }
}

export const feeAndExchangeRatesWatcher = createWatcher(
  feeAndExchangeRatesWorker,
  FETCH_FEE_AND_EXCHANGE_RATES
)

function* resetTwoFAWorker( { payload }: { payload: { secondaryMnemonic: string }} ) {
  const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
  const { secondaryMnemonic } = payload
  const network = config.APP_STAGE === APP_STAGE.DEVELOPMENT? bitcoinJS.networks.testnet: bitcoinJS.networks.bitcoin
  const { secret: twoFAKey } = yield call( AccountUtilities.resetTwoFA, wallet.walletId, wallet.secondaryWalletId, secondaryMnemonic, wallet.details2FA.secondaryXpub, network )

  if( twoFAKey ){
    const details2FA = {
      ...wallet.details2FA,
      twoFAKey
    }
    const updatedWallet = {
      ...wallet,
      details2FA
    }
    yield put( updateWallet( updatedWallet ) )
    yield call ( dbManager.updateWallet, {
      details2FA
    } )
    yield put( twoFAResetted( true ) )
  }
  else {
    yield put( twoFAResetted( false ) )
    throw new Error( 'Failed to reset twoFA' )
  }
}

export const resetTwoFAWatcher = createWatcher( resetTwoFAWorker, RESET_TWO_FA )

function* validateTwoFAWorker( { payload }: {payload: { token: number }} ) {
  const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
  const { token } = payload
  const { valid } = yield call( AccountUtilities.validateTwoFA, wallet.walletId, token )

  if ( valid ) yield put( twoFAValid( true ) )
  else yield put( twoFAValid( false ) )
}

export const validateTwoFAWatcher = createWatcher(
  validateTwoFAWorker,
  VALIDATE_TWO_FA
)

function* updateDonationPreferencesWorker( { payload } ) {
  const { donationAccount, preferences } = payload

  const { updated, updatedAccount }  = yield call(
    AccountUtilities.updateDonationPreferences,
    donationAccount,
    preferences
  )

  if( updated ) yield put( updateAccountShells( {
    accounts: {
      [ updatedAccount.id ]: updatedAccount
    }
  } ) )
  else throw new Error( 'Failed to update donation preferences' )
}

export const updateDonationPreferencesWatcher = createWatcher(
  updateDonationPreferencesWorker,
  UPDATE_DONATION_PREFERENCES
)

function* refreshAccountShellsWorker( { payload }: { payload: {
  shells: AccountShell[],
  options: { hardRefresh?: boolean, syncDonationAccount?: boolean }
}} ) {
  const accountShells: AccountShell[] = payload.shells
  const options: { hardRefresh?: boolean, syncDonationAccount?: boolean } = payload.options
  yield put( accountShellRefreshStarted( accountShells ) )
  const accountState: AccountsState = yield select(
    ( state ) => state.accounts
  )

  const accounts: Accounts = accountState.accounts
  const accountsToSync: Accounts = {
  }
  for( const accountShell of accountShells ){
    accountsToSync[ accountShell.primarySubAccount.id ] = accounts[ accountShell.primarySubAccount.id ]
  }

  const { synchedAccounts, activeAddressesWithNewTxsMap } = yield call( syncAccountsWorker, {
    payload: {
      accounts: accountsToSync,
      options,
    }
  } )

  yield put( updateAccountShells( {
    accounts: synchedAccounts
  } ) )
  yield put( accountShellRefreshCompleted( accountShells ) )
  for ( const [ key, synchedAcc ] of Object.entries( synchedAccounts ) ) {
    yield call( dbManager.updateAccount, ( synchedAcc as Account ).id, synchedAcc )
  }

  // update F&F channels if any new txs found on an assigned address
  if( Object.keys( activeAddressesWithNewTxsMap ).length )  yield call( updatePaymentAddressesToChannels, activeAddressesWithNewTxsMap, synchedAccounts )
}

export const refreshAccountShellsWatcher = createWatcher(
  refreshAccountShellsWorker,
  REFRESH_ACCOUNT_SHELLS
)

function* autoSyncShellsWorker( ) {
  const shells: AccountShell[] = yield select(
    ( state ) => state.accounts.accountShells
  )

  const shellsToSync: AccountShell[] = []
  const donationShellsToSync: AccountShell[] = []
  for ( const shell of shells ) {
    if( shell.primarySubAccount.visibility === AccountVisibility.DEFAULT ){
      switch( shell.primarySubAccount.type ){
          case AccountType.TEST_ACCOUNT:
          // skip test account auto-sync
            break

          case AccountType.DONATION_ACCOUNT:
            donationShellsToSync.push( shell )
            break

          default:
            shellsToSync.push( shell )
      }
    }
  }

  if( shellsToSync.length ) yield call( refreshAccountShellsWorker, {
    payload: {
      shells: shellsToSync,
      options: {
        hardRefresh: false
      }
    }
  } )

  // TODO: enable multi-donation sync
  if( donationShellsToSync.length )
    try {
      for( const donationAcc of donationShellsToSync ) {
        yield call( refreshAccountShellsWorker, {
          payload: {
            shells: [ donationAcc ],
            options: {
              syncDonationAccount: true
            }
          }
        } )
      }
    }
    catch( err ){
      console.log( `Sync via xpub agent failed w/ the following err: ${err}` )
    }
}

export const autoSyncShellsWatcher = createWatcher(
  autoSyncShellsWorker,
  AUTO_SYNC_SHELLS
)

function* setup2FADetails( wallet: Wallet ) {
  const secondaryMnemonic = bip39.generateMnemonic( 256 )
  const secondarySeed = bip39.mnemonicToSeedSync( secondaryMnemonic )
  const secondaryWalletId = crypto.createHash( 'sha256' ).update( secondarySeed ).digest( 'hex' )

  const { setupData } = yield call( AccountUtilities.registerTwoFA, wallet.walletId, secondaryWalletId )
  const rootDerivationPath = yield call( AccountUtilities.getDerivationPath, NetworkType.MAINNET, AccountType.CHECKING_ACCOUNT, 0 )
  const network = config.APP_STAGE === APP_STAGE.DEVELOPMENT? bitcoinJS.networks.testnet: bitcoinJS.networks.bitcoin
  const secondaryXpub = AccountUtilities.generateExtendedKey( secondaryMnemonic, false, network, rootDerivationPath )

  const bithyveXpub = setupData.bhXpub
  const twoFAKey = setupData.secret
  const updatedWallet = {
    ...wallet,
    secondaryMnemonic,
    secondaryWalletId,
    details2FA: {
      secondaryXpub,
      bithyveXpub,
      twoFAKey
    }
  }
  yield put( updateWallet( updatedWallet ) )
  return updatedWallet
}


export function* generateShellFromAccount ( account: Account | MultiSigAccount ) {
  const network = AccountUtilities.getNetworkByType( account.networkType )
  let primarySubAccount: SubAccountDescribing

  switch( account.type ){
      case AccountType.TEST_ACCOUNT:
        primarySubAccount = new TestSubAccountInfo( {
          id: account.id,
          xPub: yield call( AccountUtilities.generateYpub, account.xpub, network ),
          instanceNumber: account.instanceNum,
          customDisplayName: account.accountName,
          customDescription: account.accountDescription,
        } )
        break

      case AccountType.CHECKING_ACCOUNT:
        primarySubAccount = new CheckingSubAccountInfo( {
          id: account.id,
          xPub: yield call( AccountUtilities.generateYpub, account.xpub, network ),
          instanceNumber: account.instanceNum,
          customDisplayName: account.accountName,
          customDescription: account.accountDescription,
        } )
        break

      case AccountType.SAVINGS_ACCOUNT:
        primarySubAccount = new SavingsSubAccountInfo( {
          id: account.id,
          xPub: null,
          instanceNumber: account.instanceNum,
          customDisplayName: account.accountName,
          customDescription: account.accountDescription,
        } )
        break

      case AccountType.DONATION_ACCOUNT:
        primarySubAccount = new DonationSubAccountInfo( {
          id: account.id,
          xPub: ( account as DonationAccount ).is2FA? null: yield call( AccountUtilities.generateYpub, account.xpub, network ),
          instanceNumber: account.instanceNum,
          customDisplayName: account.accountName,
          customDescription: account.accountDescription,
          doneeName: ( account as DonationAccount ).donee,
          causeName: account.accountName,
          isTFAEnabled: ( account as DonationAccount ).is2FA
        } )
        break

      case AccountType.SWAN_ACCOUNT:
      case AccountType.DEPOSIT_ACCOUNT:

        let serviceAccountKind: ServiceAccountKind
        switch( account.type ){
            case AccountType.SWAN_ACCOUNT:
              serviceAccountKind = ServiceAccountKind.SWAN
              break

            case AccountType.DEPOSIT_ACCOUNT:
              serviceAccountKind = ServiceAccountKind.DEPOSIT_ACCOUNT
              break
        }

        primarySubAccount = new ExternalServiceSubAccountInfo( {
          id: account.id,
          xPub: ( account as MultiSigAccount ).is2FA? null: yield call( AccountUtilities.generateYpub, account.xpub, network ),
          instanceNumber: account.instanceNum,
          type: account.type,
          customDisplayName: account.accountName,
          customDescription: account.accountDescription,
          serviceAccountKind,
        } )
        break
  }

  const accountShell = new AccountShell( {
    primarySubAccount,
    unit: account.networkType === NetworkType.TESTNET ? BitcoinUnit.TSATS: BitcoinUnit.SATS,
    displayOrder: 1
  } )
  accountShell.syncStatus = SyncStatus.COMPLETED
  return accountShell
}

export function* addNewAccount( accountType: AccountType, accountDetails: newAccountDetails ) {
  let wallet: Wallet = yield select( state => state.storage.wallet )
  const { walletId, primaryMnemonic, accounts } = wallet
  const { name: accountName, description: accountDescription, is2FAEnabled, doneeName } = accountDetails

  switch ( accountType ) {
      case AccountType.TEST_ACCOUNT:
        const testInstanceCount = ( accounts[ AccountType.TEST_ACCOUNT ] )?.length | 0
        const testAccount: Account = yield call( generateAccount, {
          walletId,
          type: AccountType.TEST_ACCOUNT,
          instanceNum: testInstanceCount,
          accountName: accountName? accountName: 'Test Account',
          accountDescription: 'Testnet Wallet',
          mnemonic: primaryMnemonic,
          derivationPath: yield call( AccountUtilities.getDerivationPath, NetworkType.TESTNET, AccountType.TEST_ACCOUNT, testInstanceCount ),
          networkType: NetworkType.TESTNET,
        } )
        return testAccount

      case AccountType.CHECKING_ACCOUNT:
        const checkingInstanceCount = ( accounts[ AccountType.CHECKING_ACCOUNT ] )?.length | 0
        const checkingAccount: Account = yield call( generateAccount, {
          walletId,
          type: AccountType.CHECKING_ACCOUNT,
          instanceNum: checkingInstanceCount,
          accountName: accountName? accountName: 'Checking Account',
          accountDescription: accountDescription? accountDescription: 'Bitcoin Wallet',
          mnemonic: primaryMnemonic,
          derivationPath: yield call( AccountUtilities.getDerivationPath, NetworkType.MAINNET, AccountType.CHECKING_ACCOUNT, checkingInstanceCount ),
          networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT? NetworkType.TESTNET: NetworkType.MAINNET,
        } )
        return checkingAccount

      case AccountType.SAVINGS_ACCOUNT:
        if( !wallet.details2FA ) wallet = yield call( setup2FADetails, wallet )

        const savingsInstanceCount = ( accounts[ AccountType.SAVINGS_ACCOUNT ] )?.length | 0
        const savingsAccount: MultiSigAccount = generateMultiSigAccount( {
          walletId,
          type: AccountType.SAVINGS_ACCOUNT,
          instanceNum: savingsInstanceCount,
          accountName: accountName? accountName: 'Savings Account',
          accountDescription: accountDescription? accountDescription: 'MultiSig Wallet',
          mnemonic: primaryMnemonic,
          derivationPath: AccountUtilities.getDerivationPath( NetworkType.MAINNET, AccountType.SAVINGS_ACCOUNT, savingsInstanceCount ),
          secondaryXpub: wallet.details2FA.secondaryXpub,
          bithyveXpub: wallet.details2FA.bithyveXpub,
          networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT? NetworkType.TESTNET: NetworkType.MAINNET,
        } )
        return savingsAccount

      case AccountType.DONATION_ACCOUNT:
        if( is2FAEnabled && !wallet.details2FA ) wallet = yield call( setup2FADetails, wallet )

        const donationInstanceCount = ( accounts[ accountType ] )?.length | 0
        const donationAccount: DonationAccount = yield call( generateDonationAccount, {
          walletId,
          type: accountType,
          instanceNum: donationInstanceCount,
          accountName: accountName? accountName: 'Donation Account',
          accountDescription: accountDescription? accountDescription: 'Receive Donations',
          donee: doneeName? doneeName: wallet.walletName,
          mnemonic: primaryMnemonic,
          derivationPath: yield call( AccountUtilities.getDerivationPath, NetworkType.MAINNET, accountType, donationInstanceCount ),
          is2FA: is2FAEnabled,
          secondaryXpub: is2FAEnabled? wallet.details2FA.secondaryXpub: null,
          bithyveXpub:  is2FAEnabled? wallet.details2FA.bithyveXpub: null,
          networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT? NetworkType.TESTNET: NetworkType.MAINNET,
        } )
        const { setupSuccessful } = yield call( AccountUtilities.setupDonationAccount, donationAccount )
        if( !setupSuccessful ) throw new Error( 'Failed to generate donation account' )
        return donationAccount

      case AccountType.SWAN_ACCOUNT:
      case AccountType.DEPOSIT_ACCOUNT:
        let defaultAccountName, defaultAccountDescription
        switch( accountType ){
            case AccountType.SWAN_ACCOUNT:
              defaultAccountName = 'Swan Bitcoin'
              defaultAccountDescription = 'Withdrawal Wallet'
              break

            case AccountType.DEPOSIT_ACCOUNT:
              defaultAccountName = 'Deposit Account'
              defaultAccountDescription = 'Stack sats'
              break
        }

        const serviceInstanceCount = ( accounts[ accountType ] )?.length | 0
        const serviceAccount: Account = yield call( generateAccount, {
          walletId,
          type: accountType,
          instanceNum: serviceInstanceCount,
          accountName: accountName? accountName: defaultAccountName,
          accountDescription: accountDescription? accountDescription: defaultAccountDescription,
          mnemonic: primaryMnemonic,
          derivationPath: yield call( AccountUtilities.getDerivationPath, NetworkType.MAINNET, accountType, serviceInstanceCount ),
          networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT? NetworkType.TESTNET: NetworkType.MAINNET,
        } )
        return serviceAccount
  }
}
export interface newAccountDetails {
  name?: string,
  description?: string,
  is2FAEnabled?: boolean,
  doneeName?: string,
}
export interface newAccountsInfo {
  accountType: AccountType,
  accountDetails?: newAccountDetails
}

export function* addNewAccountShellsWorker( { payload: newAccountsInfo }: {payload: newAccountsInfo[]} ) {
  const newAccountShells: AccountShell[] = []
  const accounts = {
  }
  let testcoinsToAccount

  for ( const { accountType, accountDetails } of newAccountsInfo ){
    const account: Account | MultiSigAccount | DonationAccount = yield call(
      addNewAccount,
      accountType,
      accountDetails || {
      }
    )

    const accountShell = yield call( generateShellFromAccount, account )
    newAccountShells.push( accountShell )
    accounts [ account.id ] = account
    // yield put( accountShellOrderedToFront( accountShell ) )
    if( account.type === AccountType.TEST_ACCOUNT && account.instanceNum === 0 ) testcoinsToAccount = account
  }

  const wallet: Wallet = yield select( state => state.storage.wallet )
  let presentAccounts = _.cloneDeep( wallet.accounts )
  Object.values( ( accounts as Accounts ) ).forEach( account => {
    if( presentAccounts[ account.type ] ) presentAccounts[ account.type ].push( account.id )
    else presentAccounts = {
      ...presentAccounts,
      [ account.type ]: [ account.id ]
    }
  } )

  const updatedWallet: Wallet = {
    ...wallet,
    accounts: presentAccounts
  }
  yield put( updateWallet( updatedWallet ) )

  yield put( newAccountShellsAdded( {
    accountShells: newAccountShells,
    accounts,
  } ) )
  yield call( dbManager.createAccounts, accounts )
  yield call( dbManager.updateWallet, {
    accounts: presentAccounts
  } )
  yield put( updateWalletImageHealth() )
  if( testcoinsToAccount ) yield put( getTestcoins( testcoinsToAccount ) ) // pre-fill test-account w/ testcoins
}

export const addNewAccountShellsWatcher = createWatcher(
  addNewAccountShellsWorker,
  ADD_NEW_ACCOUNT_SHELLS
)

function* updateAccountSettingsWorker( { payload }: {
  payload: {
    accountShell: AccountShell,
    settings: {
      accountName?: string,
      accountDescription?: string,
      visibility?: AccountVisibility,
    },
}} ) {

  const { accountShell, settings } = payload
  const { accountName, accountDescription, visibility } = settings

  try {
    const account: Account = yield select( state => state.accounts.accounts[ accountShell.primarySubAccount.id ] )
    if( accountName ) account.accountName = accountName
    if( accountDescription ) account.accountDescription = accountDescription
    if( visibility ) account.accountVisibility = visibility

    yield put( updateAccountShells( {
      accounts: {
        [ account.id ]: account
      }
    } ) )
    yield call( dbManager.updateAccount, account.id, account )
    yield put( accountSettingsUpdated() )

  } catch ( error ) {
    yield put( accountSettingsUpdateFailed( {
      error
    } ) )
  }
}

export const updateAccountSettingsWatcher = createWatcher(
  updateAccountSettingsWorker,
  UPDATE_ACCOUNT_SETTINGS
)

function* reassignTransactions( { payload: { transactionIDs, sourceID, destinationID }, }: {
  payload: ReassignTransactionsActionPayload;
} ) {
  try {
    // TODO: Implement backend logic here for processing transaction re-assignment

    yield put(
      transactionReassignmentSucceeded( {
        transactionIDs,
        sourceID,
        destinationID,
      } )
    )
  } catch ( error ) {
    yield put(
      transactionReassignmentFailed( {
        transactionIDs,
        sourceID,
        destinationID,
        error,
      } )
    )
  }
}

export const reassignTransactionsWatcher = createWatcher(
  reassignTransactions,
  REASSIGN_TRANSACTIONS
)

function* mergeAccountShells( { payload: { source, destination }, }: {
  payload: MergeAccountShellsActionPayload;
} ) {
  try {
    // TODO: Implement backend logic here for processing the merge

    yield put(
      accountShellMergeSucceeded( {
        source,
        destination,
      } )
    )
  } catch ( error ) {
    yield put(
      accountShellMergeFailed( {
        source,
        destination,
        error,
      } )
    )
  }
}

export const mergeAccountShellsWatcher = createWatcher(
  mergeAccountShells,
  MERGE_ACCOUNT_SHELLS
)

function* createSmNResetTFAOrXPrivWorker( { payload }: { payload: { qrdata: string, QRModalHeader: string, accountShell: AccountShell } } ) {
  try {
    const { qrdata, QRModalHeader, accountShell } = payload
    const { DECENTRALIZED_BACKUP } = yield select( ( state ) => state.storage.database )
    const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
    const s3Service = yield select( ( state ) => state.health.service )
    const walletId = s3Service.levelhealth.walletId
    const trustedContacts: Trusted_Contacts = yield select( ( state ) => state.trustedContacts.contact )
    let secondaryMnemonic
    const sharesArray = [ DECENTRALIZED_BACKUP.SM_SHARE ]
    const qrDataObj = JSON.parse( qrdata )
    let currentContact: TrustedContact
    let channelKey: string
    if( trustedContacts ){
      for( const ck of Object.keys( trustedContacts ) ){
        channelKey=ck
        currentContact = trustedContacts[ ck ]
        if( currentContact.permanentChannelAddress == qrDataObj.channelId ){
          break
        }
      }
    }
    const res = yield call( TrustedContacts.retrieveFromStream, {
      walletId, channelKey, options: {
        retrieveSecondaryData: true,
      }, secondaryChannelKey: qrDataObj.channelKey2
    } )
    const shard: string = res.data.secondaryData.secondaryMnemonicShard
    sharesArray.push( shard )

    if( sharesArray.length>1 ){
      secondaryMnemonic = LevelHealth.getMnemonics( sharesArray, wallet.security.answer )
    }
    if ( QRModalHeader === 'Reset 2FA' ) {
      yield put( resetTwoFA( secondaryMnemonic.mnemonic ) )
    } else if ( QRModalHeader === 'Sweep Funds' ) {
      yield put( generateSecondaryXpriv( accountShell, secondaryMnemonic.mnemonic ) )
    }
  } catch ( error ) {
    console.log( 'error', error )
  }
}

export const createSmNResetTFAOrXPrivWatcher = createWatcher(
  createSmNResetTFAOrXPrivWorker,
  CREATE_SM_N_RESETTFA_OR_XPRIV
)

export function* restoreAccountShellsWorker( { payload: restoredAccounts }: {payload: Account[]} ) {
  const newAccountShells: AccountShell[] = []
  const accounts: Accounts = {
  }

  // restore account shells for respective accountss
  for ( const account of restoredAccounts ){
    const accountShell = yield call( generateShellFromAccount, account )
    newAccountShells.push( accountShell )
    accounts [ account.id ] = account
  }

  // restore account's balance and transactions
  const shellsToSync: AccountShell[] = []
  const donationShellsToSync: AccountShell[] = []
  for ( const shell of newAccountShells ) {
    switch( shell.primarySubAccount.type ){
        case AccountType.TEST_ACCOUNT:
          // skip test account auto-sync
          break

        case AccountType.DONATION_ACCOUNT:
          donationShellsToSync.push( shell )
          break

        default:
          shellsToSync.push( shell )
    }
  }

  if( shellsToSync.length ) yield call( refreshAccountShellsWorker, {
    payload: {
      shells: shellsToSync,
      options: {
        hardRefresh: true,
      }
    }
  } )

  if( donationShellsToSync.length )
    try{
      for( const donationAcc of donationShellsToSync ) {
        yield call( refreshAccountShellsWorker, {
          payload: {
            shells: [ donationAcc ],
            options: {
              syncDonationAccount: true
            }
          }
        } )
      }
    } catch( err ){
      console.log( `Sync via xpub agent failed w/ the following err: ${err}` )
    }


  // update redux store & database
  const wallet: Wallet = yield select( state => state.storage.wallet )
  let presentAccounts = {
  }
  Object.values( ( accounts as Accounts ) ).forEach( account => {
    if( presentAccounts[ account.type ] ) presentAccounts[ account.type ].push( account.id )
    else presentAccounts = {
      ...presentAccounts,
      [ account.type ]: [ account.id ]
    }
  } )
  const updatedWallet: Wallet = {
    ...wallet,
    accounts: presentAccounts,
  }

  yield put( updateWallet( updatedWallet ) )
  yield put( newAccountShellsAdded( {
    accountShells: newAccountShells,
    accounts,
  } ) )
  yield call( dbManager.createAccounts, accounts )
  yield call( dbManager.updateWallet, {
    accounts: presentAccounts
  } )
}

export const restoreAccountShellsWatcher = createWatcher(
  restoreAccountShellsWorker,
  RESTORE_ACCOUNT_SHELLS,
)
