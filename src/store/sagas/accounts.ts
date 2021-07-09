import { call, put, select } from 'redux-saga/effects'
import { createWatcher, requestTimedout } from '../utils/utilities'
import {
  GET_TESTCOINS,
  ACCUMULATIVE_BAL_AND_TX,
  FETCH_BALANCE_TX,
  GENERATE_SECONDARY_XPRIV,
  RESET_TWO_FA,
  twoFAResetted,
  FETCH_DERIVATIVE_ACC_BALANCE_TX,
  SETUP_DONATION_ACCOUNT,
  UPDATE_DONATION_PREFERENCES,
  SYNC_VIA_XPUB_AGENT,
  secondaryXprivGenerated,
  ADD_NEW_ACCOUNT_SHELLS,
  newAccountShellsAdded,
  UPDATE_SUB_ACCOUNT_SETTINGS,
  accountSettingsUpdated,
  accountSettingsUpdateFailed,
  ReassignTransactionsActionPayload,
  REASSIGN_TRANSACTIONS,
  transactionReassignmentSucceeded,
  transactionReassignmentFailed,
  MergeAccountShellsActionPayload,
  MERGE_ACCOUNT_SHELLS,
  accountShellMergeSucceeded,
  accountShellMergeFailed,
  REFRESH_ACCOUNT_SHELL,
  AUTO_SYNC_SHELLS,
  accountShellRefreshCompleted,
  accountShellRefreshStarted,
  FETCH_FEE_AND_EXCHANGE_RATES,
  exchangeRatesCalculated,
  setAverageTxFee,
  VALIDATE_TWO_FA,
  twoFAValid,
  clearAccountSyncCache,
  BLIND_REFRESH,
  blindRefreshStarted,
  GET_ALL_ACCOUNTS_DATA,
  setAllAccountsData,
  fetchReceiveAddressSucceeded,
  FETCH_RECEIVE_ADDRESS,
  CREATE_SM_N_RESETTFA_OR_XPRIV,
  resetTwoFA,
  generateSecondaryXpriv,
  SYNC_ACCOUNTS,
  updateAccountShells,
  getTestcoins,
} from '../actions/accounts'
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import {
  Account,
  Accounts,
  AccountType,
  DerivativeAccountTypes,
  DonationAccount,
  MultiSigAccount,
  NetworkType,
  TrustedContact,
  Trusted_Contacts,
  Wallet,
} from '../../bitcoin/utilities/Interface'
import SubAccountDescribing, { ExternalServiceSubAccountDescribing } from '../../common/data/models/SubAccountInfo/Interfaces'
import AccountShell from '../../common/data/models/AccountShell'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import RelayServices from '../../bitcoin/services/RelayService'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import BaseAccount from '../../bitcoin/utilities/accounts/BaseAccount'
import SyncStatus from '../../common/data/enums/SyncStatus'
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces'
import { rescanSucceeded } from '../actions/wallet-rescanning'
import { RescannedTransactionData } from '../reducers/wallet-rescanning'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import { insertDBWorker } from './storage'
import config from '../../bitcoin/HexaConfig'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import getAvatarForSubAccount from '../../utils/accounts/GetAvatarForSubAccountKind'
import { AccountsState } from '../reducers/accounts'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import LevelHealth from '../../bitcoin/utilities/LevelHealth/LevelHealth'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
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
import idx from 'idx'
import TestSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TestSubAccountInfo'
import CheckingSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo'
import SavingsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo'
import DonationSubAccountInfo from '../../common/data/models/SubAccountInfo/DonationSubAccountInfo'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'

import dbManager from '../../storage/realm/dbManager'
import _ from 'lodash'


function* fetchBalanceTxWorker( { payload }: {payload: {
  serviceType: string,
  options: {
    service?;
    loader?: boolean;
    derivativeAccountsToSync?: string[];
    hardRefresh?: boolean;
    blindRefresh?: boolean;
    shouldNotInsert?: boolean;
    syncTrustedDerivative?: boolean;
  }}} ) {
  // delta txs(hard refresh)
  const txsFound: TransactionDescribing[] = []

  // if ( payload.options.loader )
  //   yield put( switchLoader( payload.serviceType, 'balanceTx' ) )
  const service = payload.options.service
    ? payload.options.service
    : yield select( ( state ) => state.accounts[ payload.serviceType ].service )

  const preFetchBalances = JSON.stringify(
    payload.serviceType === SECURE_ACCOUNT
      ? service.secureHDWallet.balances
      : service.hdWallet.balances
  )

  const preFetchTransactions = JSON.stringify(
    payload.serviceType === SECURE_ACCOUNT
      ? service.secureHDWallet.transactions
      : service.hdWallet.transactions
  )

  const res = yield call( ( service as BaseAccount | SecureAccount ).getBalanceTransactions, payload.options.hardRefresh, payload.options.blindRefresh )
  console.log( {
    res
  } )
  const postFetchBalances =
    res.status === 200 ? JSON.stringify( res.data.balances ) : preFetchBalances
  const postFetchTransactions =
    res.status === 200
      ? JSON.stringify( res.data.transactions )
      : preFetchTransactions

  let parentSynched = false
  if (
    res.status === 200 &&
    ( preFetchBalances !== postFetchBalances ||
      preFetchTransactions !== postFetchTransactions )
  ) {
    parentSynched = true
    if ( res.data.txsFound && res.data.txsFound.length ) txsFound.push( ...res.data.txsFound )

    if (
      payload.serviceType === TEST_ACCOUNT ||
      ( !payload.options.shouldNotInsert &&
        !payload.options.syncTrustedDerivative )
    ) {
      const { SERVICES } = yield select( ( state ) => state.storage.database )
      const updatedSERVICES = {
        ...SERVICES,
        [ payload.serviceType ]: JSON.stringify( service ),
      }
      yield call( insertDBWorker, {
        payload: {
          SERVICES: updatedSERVICES
        }
      } )

      return txsFound
    }
  } else if ( res.status !== 200 ) {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    console.log( 'Failed to fetch balance/transactions from the indexer' )
  }

  if (
    res.status === 200 &&
    payload.options.syncTrustedDerivative &&
    ( payload.serviceType === REGULAR_ACCOUNT ||
      payload.serviceType === SECURE_ACCOUNT )
  ) {
    try {
      const dervTxsFound: TransactionDescribing[] = yield call( syncDerivativeAccountsWorker, {
        payload: {
          serviceTypes: [ payload.serviceType ],
          parentSynched,
          derivativeAccountsToSync: payload.options.derivativeAccountsToSync,
          hardRefresh: payload.options.hardRefresh,
          blindRefresh: payload.options.blindRefresh,
        },
      } )
      if ( dervTxsFound && dervTxsFound.length ) txsFound.push( ...dervTxsFound )
    } catch ( err ) {
      console.log( {
        err
      } )
    }
  }

  if ( payload.options.loader ) {
    // yield delay(1000); // introducing delay for a sec to let the fetchTx/insertIntoDB finish
    // yield put( switchLoader( payload.serviceType, 'balanceTx' ) )
  }

  return txsFound
}

export const fetchBalanceTxWatcher = createWatcher(
  fetchBalanceTxWorker,
  FETCH_BALANCE_TX
)

function* syncAccountsWorker( { payload }: {payload: {
  accounts: Accounts,
  options: {
    hardRefresh?: boolean;
    blindRefresh?: boolean;
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
      synchedAccounts, txsFound
    }
  } else {
    const { synchedAccounts, txsFound } = yield call(
      AccountOperations.syncAccounts,
      accounts,
      network,
      options.hardRefresh,
      options.blindRefresh )

    return {
      synchedAccounts, txsFound
    }
  }

}

export const syncAccountsWatcher = createWatcher(
  syncAccountsWorker,
  SYNC_ACCOUNTS
)

function* fetchDerivativeAccBalanceTxWorker( { payload } ) {
  let { serviceType, accountNumber, accountType, hardRefresh, blindRefresh } = payload
  const dervTxsFound: TransactionDescribing[] = []

  // yield put( switchLoader( serviceType, 'derivativeBalanceTx' ) )
  const service = yield select( ( state ) => state.accounts[ serviceType ].service )

  if ( !accountNumber ) accountNumber = 1

  const { derivativeAccounts } =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet
  if (
    !derivativeAccounts[ accountType ] ||
    !derivativeAccounts[ accountType ][ accountNumber ].xpub
  ) {
    throw new Error( 'Following derivative account does not exists' )
  }

  const accountsInfo = [ {
    accountType,
    accountNumber
  } ]

  const res = yield call(
    ( service as BaseAccount | SecureAccount ).getDerivativeAccBalanceTransactions,
    accountsInfo,
    hardRefresh,
    blindRefresh,
  )

  if (
    res.status === 200
  ) {
    const { txsFound } = res.data
    if ( txsFound && txsFound.length ) dervTxsFound.push( ...txsFound )

    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const updatedSERVICES = {
      ...SERVICES,
      [ serviceType ]: JSON.stringify( service ),
    }
    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )
    // yield put( switchLoader( serviceType, 'derivativeBalanceTx' ) )
  } else if ( res.status !== 200 ) {
    // yield put( switchLoader( serviceType, 'derivativeBalanceTx' ) )

    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    throw new Error( 'Failed to fetch balance/transactions from the indexer' )
  }

  return dervTxsFound
}

export const fetchDerivativeAccBalanceTxWatcher = createWatcher(
  fetchDerivativeAccBalanceTxWorker,
  FETCH_DERIVATIVE_ACC_BALANCE_TX
)

function* syncDerivativeAccountsWorker( { payload }: { payload: { serviceTypes: string[], parentSynched: boolean, derivativeAccountsToSync?: string[], hardRefresh?: boolean, blindRefresh?: boolean } } ) {
  const dervTxsFound: TransactionDescribing[] = []

  for ( const serviceType of payload.serviceTypes ) {
    console.log( 'Syncing DAs for: ', serviceType )

    // yield put(switchLoader(serviceType, 'derivativeBalanceTx'));
    const service = yield select(
      ( state ) => state.accounts[ serviceType ].service
    )

    const preFetchDerivativeAccounts = JSON.stringify(
      serviceType === REGULAR_ACCOUNT
        ? service.hdWallet.derivativeAccounts
        : service.secureHDWallet.derivativeAccounts
    )
    const { derivativeAccountsToSync } = payload
    const accountsToSync = derivativeAccountsToSync && derivativeAccountsToSync.length ? derivativeAccountsToSync : config.DERIVATIVE_ACC_TO_SYNC

    const res = yield call(
      ( service as BaseAccount | SecureAccount ).syncDerivativeAccountsBalanceTxs,
      accountsToSync,
      payload.hardRefresh,
      payload.blindRefresh
    )

    const postFetchDerivativeAccounts = JSON.stringify(
      serviceType === REGULAR_ACCOUNT
        ? service.hdWallet.derivativeAccounts
        : service.secureHDWallet.derivativeAccounts
    )

    if ( res.status === 200 ) {
      // accumulate delta txs(during hard refresh) from derivative accounts(if present)
      if ( res.data ) {
        const { txsFound } = res.data
        if ( txsFound && txsFound.length ) dervTxsFound.push( ...txsFound )
      }

      if (
        postFetchDerivativeAccounts !== preFetchDerivativeAccounts ||
        payload.parentSynched
      ) {
        const { SERVICES } = yield select( ( state ) => state.storage.database )
        const updatedSERVICES = {
          ...SERVICES,
          [ serviceType ]: JSON.stringify( service ),
        }
        yield call( insertDBWorker, {
          payload: {
            SERVICES: updatedSERVICES
          }
        } )
      }
    } else {
      if ( res.err === 'ECONNABORTED' ) requestTimedout()
      console.log( 'Failed to sync derivative account' )
    }
  }

  return dervTxsFound
}

function* syncViaXpubAgentWorker( { payload } ) {
  // yield put( switchLoader( payload.serviceType, 'balanceTx' ) )

  const { serviceType, derivativeAccountType, accountNumber } = payload
  const service = yield select( ( state ) => state.accounts[ serviceType ].service )

  const preFetchDerivativeAccount = JSON.stringify(
    serviceType === REGULAR_ACCOUNT
      ? service.hdWallet.derivativeAccounts[ derivativeAccountType ][
        accountNumber
      ]
      : service.secureHDWallet.derivativeAccounts[ derivativeAccountType ][
        accountNumber
      ]
  )

  const res = yield call(
    service.syncViaXpubAgent,
    derivativeAccountType,
    accountNumber
  )

  const postFetchDerivativeAccount = JSON.stringify(
    serviceType === REGULAR_ACCOUNT
      ? service.hdWallet.derivativeAccounts[ derivativeAccountType ][
        accountNumber
      ]
      : service.secureHDWallet.derivativeAccounts[ derivativeAccountType ][
        accountNumber
      ]
  )

  if ( res.status === 200 ) {
    if ( postFetchDerivativeAccount !== preFetchDerivativeAccount ) {
      const { SERVICES } = yield select( ( state ) => state.storage.database )
      const updatedSERVICES = {
        ...SERVICES,
        [ serviceType ]: JSON.stringify( service ),
      }
      yield call( insertDBWorker, {
        payload: {
          SERVICES: updatedSERVICES
        }
      } )
    }
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    console.log( 'Failed to sync derivative account' )
  }

  // yield put( switchLoader( payload.serviceType, 'balanceTx' ) )
}

export const syncViaXpubAgentWatcher = createWatcher(
  syncViaXpubAgentWorker,
  SYNC_VIA_XPUB_AGENT
)


function* generateSecondaryXprivWorker( { payload } ) {
  const service = yield select(
    ( state ) => state.accounts[ payload.serviceType ].service
  )
  console.log( 'service', service )

  const { generated } = service.generateSecondaryXpriv(
    payload.secondaryMnemonic
  )
  console.log( 'generated', generated )
  if ( generated ) {
    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const updatedSERVICES = {
      ...SERVICES,
      [ payload.serviceType ]: JSON.stringify( service ),
    }
    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )
    yield put( secondaryXprivGenerated( true ) )
  } else {
    yield put( secondaryXprivGenerated( false ) )
  }
}

export const generateSecondaryXprivWatcher = createWatcher(
  generateSecondaryXprivWorker,
  GENERATE_SECONDARY_XPRIV
)


function* testcoinsWorker( { payload: testAccount }: { payload: Account } ) {
  const receivingAddress = testAccount.receivingAddress
  const network = AccountUtilities.getNetworkByType( testAccount.networkType )

  const { txid } = yield call( AccountUtilities.getTestcoins, receivingAddress, network )

  if( !txid ) console.log( 'Failed to get testcoins' )
  else{
    // const accountsState: AccountsState = yield select( ( state ) => state.accounts )
    // let testShell: AccountShell
    // accountsState.accountShells.forEach( ( shell )=>{
    //   if( shell.primarySubAccount.id === testAccount.id ) testShell = shell
    // } )
    // // auto-sync test account
    // const options = {
    //   autoSync: true
    // }
    // if( testShell ) yield put( refreshAccountShell( testShell, options ) )
  }
}

export const testcoinsWatcher = createWatcher( testcoinsWorker, GET_TESTCOINS )

function* accumulativeTxAndBalWorker() {
  const accounts = yield select( ( state ) => state.accounts )
  console.log( {
    accounts
  } )

  const regularBalance = accounts[ REGULAR_ACCOUNT ].service
    ? accounts[ REGULAR_ACCOUNT ].service.hdWallet.balances.balance +
    accounts[ REGULAR_ACCOUNT ].service.hdWallet.balances.unconfirmedBalance
    : 0
  const secureBalance = accounts[ SECURE_ACCOUNT ].service
    ? accounts[ SECURE_ACCOUNT ].service.secureHDWallet.balances.balance +
    accounts[ SECURE_ACCOUNT ].service.secureHDWallet.balances
      .unconfirmedBalance
    : 0
  const accumulativeBalance = regularBalance + secureBalance

  const testTransactions = accounts[ TEST_ACCOUNT ].service
    ? accounts[ TEST_ACCOUNT ].service.hdWallet.transactions.transactionDetails
    : []
  const regularTransactions = accounts[ REGULAR_ACCOUNT ].service
    ? accounts[ REGULAR_ACCOUNT ].service.hdWallet.transactions.transactionDetails
    : []
  const secureTransactions = accounts[ SECURE_ACCOUNT ].service
    ? accounts[ SECURE_ACCOUNT ].service.secureHDWallet.transactions
      .transactionDetails
    : []
  const accumulativeTransactions = [
    ...testTransactions,
    ...regularTransactions,
    ...secureTransactions,
  ]
  console.log( {
    accumulativeBalance, accumulativeTransactions
  } )
}

export const accumulativeTxAndBalWatcher = createWatcher(
  accumulativeTxAndBalWorker,
  ACCUMULATIVE_BAL_AND_TX
)

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
    const res = yield call( RelayServices.fetchFeeAndExchangeRates, currencyCode )
    console.log( {
      res
    } )
    if ( res.status === 200 ) {
      const { exchangeRates, averageTxFees } = res.data

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

function* resetTwoFAWorker( { payload } ) {
  const service: SecureAccount = yield select(
    ( state ) => state.accounts[ SECURE_ACCOUNT ].service,
  )

  const res = yield call( service.resetTwoFA, payload.secondaryMnemonic )

  if ( res.status == 200 ) {
    yield put( twoFAResetted( true ) )
    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const updatedSERVICES = {
      ...SERVICES,
      [ SECURE_ACCOUNT ]: JSON.stringify( service ),
    }
    console.log( 'updatedSERVICES', updatedSERVICES )
    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    console.log( 'Failed to reset twoFA', res.err )
    yield put( twoFAResetted( false ) )
  }
}

export const resetTwoFAWatcher = createWatcher( resetTwoFAWorker, RESET_TWO_FA )

function* validateTwoFAWorker( { payload }: {payload: { token: number }} ) {
  // TODO: read wallet from realm
  const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
  const { token } = payload
  const { valid } = yield call( AccountUtilities.validateTwoFA, wallet.walletId, token )

  if ( valid ) {
    yield put( twoFAValid( true ) )
    delete wallet.details2FA
    // TODO: save udpated wallet into realm
    const tempDB = JSON.parse( yield call ( AsyncStorage.getItem, 'tempDB' ) )
    yield call( AsyncStorage.setItem, 'tempDB', JSON.stringify( {
      ...tempDB,
      wallet
    } ) )
    yield put( updateWallet( wallet ) )
  } else yield put( twoFAValid( false ) )
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

function* refreshAccountShellWorker( { payload } ) {
  const accountShell: AccountShell = payload.shell
  yield put( accountShellRefreshStarted( accountShell ) )
  const accountState: AccountsState = yield select(
    ( state ) => state.accounts
  )

  const accounts: Accounts = accountState.accounts
  const options: { autoSync?: boolean, hardRefresh?: boolean, syncDonationAccount?: boolean } = {
    ...payload.options,
    syncDonationAccount: accountShell.primarySubAccount.type === AccountType.DONATION_ACCOUNT
  }
  const accountsToSync: Accounts = {
    [ accountShell.primarySubAccount.id ]: accounts[ accountShell.primarySubAccount.id ]
  }
  const { synchedAccounts, txsFound } = yield call( syncAccountsWorker, {
    payload: {
      accounts: accountsToSync,
      options,
    }
  } )

  yield put( updateAccountShells( {
    accounts: synchedAccounts
  } ) )

  Object.values( synchedAccounts ).forEach( ( synchedAcc: Account | MultiSigAccount )=> {
    accounts[ synchedAcc.id ] = synchedAcc
  } )

  // const rescanTxs: RescannedTransactionData[] = []
  // deltaTxs.forEach( ( deltaTx ) => {
  //   rescanTxs.push( {
  //     details: deltaTx,
  //     accountShell: accountShell,
  //   } )
  // } )
  // yield put( rescanSucceeded( rescanTxs ) )

  // TODO: insert into Realm database
  yield put( accountShellRefreshCompleted( accountShell ) )
}

export const refreshAccountShellWatcher = createWatcher(
  refreshAccountShellWorker,
  REFRESH_ACCOUNT_SHELL
)

function* autoSyncShellsWorker( { payload } ) {
  yield call( clearAccountSyncCache )
  const shells = yield select(
    ( state ) => state.accounts.accountShells
  )
  for ( const shell of shells ) {
    if ( shell.syncStatus === SyncStatus.PENDING ) {
      // yield delay( 3000 )
      yield call( refreshAccountShellWorker,
        {
          payload: {
            shell: shell,
            options: {
              autoSync: true
            }
          }
        }
      )
    }
  }
}
export const autoSyncShellsWatcher = createWatcher(
  autoSyncShellsWorker,
  AUTO_SYNC_SHELLS
)

function* blindRefreshWorker() {
  yield put( blindRefreshStarted( true ) )
  const netDeltaTxs: TransactionDescribing[] = []
  for ( const accountKind of [ SourceAccountKind.TEST_ACCOUNT, SourceAccountKind.REGULAR_ACCOUNT, SourceAccountKind.SECURE_ACCOUNT ] ) {
    const payload = {
      serviceType: accountKind,
      options: {
        loader: true,
        syncTrustedDerivative:
          accountKind === TEST_ACCOUNT ? false : true,
        derivativeAccountsToSync: Object.keys( config.DERIVATIVE_ACC ),
        hardRefresh: true,
        blindRefresh: true,
      },
    }

    const deltaTxs: TransactionDescribing[] = yield call( fetchBalanceTxWorker, {
      payload
    } )
    if ( deltaTxs.length ) netDeltaTxs.push( ...deltaTxs )
  }

  const rescanTxs : RescannedTransactionData[]= []
  netDeltaTxs.forEach( ( deltaTx )=>{
    rescanTxs.push( {
      details: deltaTx,
    } )
  } )

  // TODO: re-establish accountShell recreation
  // if( netDeltaTxs.length ){
  //   const accountsState: AccountsState = yield select( ( state ) => state.accounts )
  //   const newAccountShells: AccountShell[]
  //   = yield call( recreatePrimarySubAccounts, accountsState,  )

  //   yield put( newAccountShellsAdded( {
  //     accountShells: newAccountShells
  //   } ) )
  // }

  yield put( rescanSucceeded( rescanTxs ) )
  yield put( blindRefreshStarted( false ) )
}

export const blindRefreshWatcher = createWatcher(
  blindRefreshWorker,
  BLIND_REFRESH
)

function* setup2FADetails( wallet: Wallet ) {
  const secondaryMemonic = bip39.generateMnemonic( 256 )
  const secondarySeed = bip39.mnemonicToSeedSync( secondaryMemonic )
  const secondaryWalletId = crypto.createHash( 'sha256' ).update( secondarySeed ).digest( 'hex' )

  const { setupData } = yield call( AccountUtilities.registerTwoFA, wallet.walletId, secondaryWalletId )
  console.log( {
    setupData
  } )
  const rootDerivationPath = yield call( AccountUtilities.getDerivationPath, NetworkType.MAINNET, AccountType.CHECKING_ACCOUNT, 0 )
  const secondaryXpub = AccountUtilities.generateExtendedKey( secondaryMemonic, false, bitcoinJS.networks.testnet, rootDerivationPath )
  const bithyveXpub = setupData.bhXpub
  const twoFAKey = setupData.secret
  const updatedWallet = {
    ...wallet,
    secondaryMemonic,
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
        primarySubAccount = new ExternalServiceSubAccountInfo( {
          id: account.id,
          xPub: ( account as MultiSigAccount ).is2FA? null: yield call( AccountUtilities.generateYpub, account.xpub, network ),
          instanceNumber: account.instanceNum,
          type: account.type,
          customDisplayName: account.accountName,
          customDescription: account.accountDescription,
          serviceAccountKind: ServiceAccountKind.SWAN,
        } )
        break
  }


  const accountShell = new AccountShell( {
    primarySubAccount,
    unit: AccountType.TEST_ACCOUNT? BitcoinUnit.TSATS: BitcoinUnit.SATS,
    displayOrder: 1,
  } )

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
          accountDescription: accountDescription? accountDescription: 'Learn Bitcoin',
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
          accountDescription: accountDescription? accountDescription: 'Fast and easy',
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
          accountDescription: accountDescription? accountDescription: 'Multi-factor security',
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
          accountDescription: accountDescription? accountDescription: 'Accept donations',
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
        let defaultAccountName, defaultAccountDescription
        switch( accountType ){
            case AccountType.SWAN_ACCOUNT:
              defaultAccountName = 'Swan Bitcoin'
              defaultAccountDescription = 'Stack sats with Swan'
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


// function* createServiceSecondarySubAccount ( secondarySubAccount: ExternalServiceSubAccountDescribing, parentShell: AccountShell ) {
//   const service = yield select(
//     ( state ) => state.accounts[ parentShell.primarySubAccount.sourceKind ].service
//   )

//   let res
//   switch( secondarySubAccount.serviceAccountKind ){
//       case ServiceAccountKind.FAST_BITCOINS:
//         const fastBitcoinsDetails = {
//           accountName: secondarySubAccount.customDisplayName,
//           accountDescription: secondarySubAccount.customDescription,
//         }
//         res = yield call(
//           ( service as BaseAccount|SecureAccount ).setupDerivativeAccount,
//           DerivativeAccountTypes.FAST_BITCOINS,
//           fastBitcoinsDetails
//         )
//         break
//   }

//   if ( res && res.status === 200 ) {
//     const secondarySubAccountId = res.data.accountId
//     const secondarySubAccountInstanceNum = res.data.accountNumber

//     secondarySubAccount.id = secondarySubAccountId
//     secondarySubAccount.balances = {
//       confirmed: 0,
//       unconfirmed: 0,
//     }
//     secondarySubAccount.transactions = []

//     AccountShell.addSecondarySubAccount(
//       parentShell,
//       secondarySubAccountId,
//       secondarySubAccount,
//     )

//     const { SERVICES } = yield select( ( state ) => state.storage.database )
//     const updatedSERVICES = {
//       ...SERVICES,
//       [ parentShell.primarySubAccount.sourceKind ]: JSON.stringify( service ),
//     }
//     yield call( insertDBWorker, {
//       payload: {
//         SERVICES: updatedSERVICES
//       }
//     } )
//   } else {
//     throw new Error( 'Failed to generate secondary sub-account(service)' )
//   }
// }

// function* addNewSecondarySubAccount( { payload }: {payload: {  secondarySubAccount: SubAccountDescribing,
//   parentShell: AccountShell, contactInfo?: ContactInfo }} ) {

//   const { secondarySubAccount, parentShell, contactInfo } = payload
//   switch ( secondarySubAccount.kind ) {
//       case SubAccountKind.SERVICE:
//         yield call( createServiceSecondarySubAccount, ( secondarySubAccount as ExternalServiceSubAccountDescribing ), parentShell )
//         break
//   }
// }

// export const addNewSecondarySubAccountWatcher = createWatcher(
//   addNewSecondarySubAccount,
//   ADD_NEW_SECONDARY_SUBACCOUNT
// )

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

  // TODO: insert the new accounts & wallet into Realm
  yield call( dbManager.createAccounts, accounts )
  yield call( dbManager.createWallet, wallet )

  if( testcoinsToAccount ) yield put( getTestcoins( testcoinsToAccount ) ) // pre-fill test-account w/ testcoins
}

export const addNewAccountShellsWatcher = createWatcher(
  addNewAccountShellsWorker,
  ADD_NEW_ACCOUNT_SHELLS
)

function* updateAccountSettings( { payload: account, }: {
  payload: SubAccountDescribing;
} ) {
  try {
    const service = yield select(
      ( state ) => state.accounts[ account.sourceKind ].service
    )
    const result = yield call(
      service.updateAccountDetails,
      {
        // for accounts of subAccountKind as SERVICE we need to know which specific
        // service the account belongs to, this is serviceAccountKind of ExternalServiceSubAccountDescribing
        kind: account.kind === SubAccountKind.SERVICE ? ( ( account as ExternalServiceSubAccountDescribing ).serviceAccountKind ) : account.kind,
        instanceNumber: account.instanceNumber,
        customDisplayName: account.customDisplayName,
        customDescription: account.customDescription,
        visibility: account.visibility,
      }
    )
    console.log( 'result', result )
    if ( result.status === 200 ) {
      const { SERVICES } = yield select( ( state ) => state.storage.database )
      const updatedSERVICES = {
        ...SERVICES,
        [ account.sourceKind ]: JSON.stringify( service ),
      }
      yield call( insertDBWorker, {
        payload: {
          SERVICES: updatedSERVICES
        }
      } )

      yield put( accountSettingsUpdated( {
        account
      } ) )
    }
  } catch ( error ) {
    yield put( accountSettingsUpdateFailed( {
      account, error
    } ) )
  }
}

export const updateAccountSettingsWatcher = createWatcher(
  updateAccountSettings,
  UPDATE_SUB_ACCOUNT_SETTINGS
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


function* getAllAccountsData() {
  try {
    const accountShells: AccountShell[] = yield select(
      ( state ) => state.accounts.accountShells
    )
    const accountState: AccountsState = yield select(
      ( state ) => state.accounts
    )
    const accounts = []
    let derivativeAccountKind
    if ( accountShells ) {
      accountShells.forEach( ( shell ) => {
        switch ( shell.primarySubAccount.kind ) {
            case SubAccountKind.DONATION_ACCOUNT:
              derivativeAccountKind = DerivativeAccountTypes.DONATION_ACCOUNT
              break
            case SubAccountKind.REGULAR_ACCOUNT:
            case SubAccountKind.SECURE_ACCOUNT:
              if ( shell.primarySubAccount.instanceNumber )
                derivativeAccountKind = DerivativeAccountTypes.SUB_PRIMARY_ACCOUNT
              else derivativeAccountKind = shell.primarySubAccount.kind
              break

            case SubAccountKind.SERVICE:
              derivativeAccountKind = ( shell.primarySubAccount as ExternalServiceSubAccountDescribing ).serviceAccountKind
              break

            default:
              derivativeAccountKind = shell.primarySubAccount.kind
        }
        const derivativeAccountDetails: {
        type: string;
        number: number;
      } = config.EJECTED_ACCOUNTS.includes( derivativeAccountKind ) ?
        {
          type: derivativeAccountKind,
          number: shell.primarySubAccount.instanceNumber,
        }
        : null

        const service: TestAccount | RegularAccount | SecureAccount = accountState[ shell.primarySubAccount.sourceKind ].service

        const accountData = {
          accountName: shell.primarySubAccount.customDisplayName ? shell.primarySubAccount.customDisplayName : shell.primarySubAccount.defaultTitle,
          balance: shell.primarySubAccount.balances.confirmed,
          receivingAddress: service.getReceivingAddress(
            derivativeAccountDetails ? derivativeAccountDetails.type : null,
            derivativeAccountDetails ? derivativeAccountDetails.number : null ),
          accountImage: getAvatarForSubAccount( shell.primarySubAccount ),
          shell: shell
        }

        // Dont Add Test Account to drop down
        if( !( shell.primarySubAccount.sourceKind===SourceAccountKind.TEST_ACCOUNT ) )
          accounts.push( accountData )
      } )
      yield put( setAllAccountsData( accounts ) )
    }
  } catch ( error ) {
    // do nothing
  }
}

export const getAllAccountsDataWatcher = createWatcher(
  getAllAccountsData,
  GET_ALL_ACCOUNTS_DATA
)

// UI should send shell.primarySubAccount
function* fetchReceiveAddressWorker( { payload }: { payload: { subAccountInfo: SubAccountDescribing } } ) {
  const { subAccountInfo } = payload
  let accountType: DerivativeAccountTypes

  switch ( subAccountInfo.kind ) {
      case SubAccountKind.DONATION_ACCOUNT:
        accountType = DerivativeAccountTypes.DONATION_ACCOUNT
        break

      case SubAccountKind.REGULAR_ACCOUNT:
      case SubAccountKind.SECURE_ACCOUNT:
        if ( subAccountInfo.instanceNumber )
          accountType = DerivativeAccountTypes.SUB_PRIMARY_ACCOUNT
        break

      case SubAccountKind.SERVICE:
        switch ( ( subAccountInfo as ExternalServiceSubAccountDescribing ).serviceAccountKind ) {
            case ServiceAccountKind.WYRE:
              accountType = DerivativeAccountTypes.WYRE
              break
            case ServiceAccountKind.RAMP:
              accountType = DerivativeAccountTypes.RAMP
              break
            case ServiceAccountKind.FAST_BITCOINS:
              accountType = DerivativeAccountTypes.FAST_BITCOINS
              break
        }
        break
  }


  const accountState: AccountsState = yield select(
    ( state ) => state.accounts
  )
  const service: TestAccount | RegularAccount | SecureAccount = accountState[ subAccountInfo.sourceKind ].service

  const receiveAddress =  service.getReceivingAddress( accountType, subAccountInfo.instanceNumber )
  yield put( fetchReceiveAddressSucceeded( receiveAddress ) )
}

// TODO: Consider moving the receive address watcher and worker
// to sending saga or another appropriate saga
export const fetchReceiveAddressWatcher = createWatcher(
  fetchReceiveAddressWorker,
  FETCH_RECEIVE_ADDRESS
)

function* createSmNResetTFAOrXPrivWorker( { payload }: { payload: { qrdata: string, QRModalHeader: string, serviceType: string } } ) {
  try {
    const { qrdata, QRModalHeader } = payload
    const { DECENTRALIZED_BACKUP, WALLET_SETUP } = yield select( ( state ) => state.storage.database )
    const s3Service = yield select( ( state ) => state.health.service )
    const walletId = s3Service.levelhealth.walletId
    const trustedContacts: TrustedContactsService = yield select( ( state ) => state.trustedContacts.service )
    let secondaryMnemonic
    const sharesArray = [ DECENTRALIZED_BACKUP.SM_SHARE ]
    const contacts: Trusted_Contacts = trustedContacts.tc.trustedContacts
    const qrDataObj = JSON.parse( qrdata )
    let currentContact: TrustedContact
    let channelKey: string
    if( contacts ){
      for( const ck of Object.keys( contacts ) ){
        channelKey=ck
        currentContact = contacts[ ck ]
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
      secondaryMnemonic = LevelHealth.getSecondaryMnemonics( sharesArray, WALLET_SETUP.security.answer )
    }
    if ( QRModalHeader === 'Reset 2FA' ) {
      yield put( resetTwoFA( secondaryMnemonic.mnemonic ) )
    } else if ( QRModalHeader === 'Sweep Funds' ) {
      yield put( generateSecondaryXpriv( SECURE_ACCOUNT, secondaryMnemonic.mnemonic ) )
    }
  } catch ( error ) {
    console.log( 'error', error )
  }
}

export const createSmNResetTFAOrXPrivWatcher = createWatcher(
  createSmNResetTFAOrXPrivWorker,
  CREATE_SM_N_RESETTFA_OR_XPRIV
)
