import { call, delay, put, select, spawn } from 'redux-saga/effects'
import { createWatcher, requestTimedout } from '../utils/utilities'
import {
  GET_TESTCOINS,
  ACCUMULATIVE_BAL_AND_TX,
  testcoinsReceived,
  accountsSynched,
  FETCH_BALANCE_TX,
  GENERATE_SECONDARY_XPRIV,
  RESET_TWO_FA,
  twoFAResetted,
  FETCH_DERIVATIVE_ACC_BALANCE_TX,
  SETUP_DONATION_ACCOUNT,
  UPDATE_DONATION_PREFERENCES,
  SYNC_VIA_XPUB_AGENT,
  secondaryXprivGenerated,
  ADD_NEW_ACCOUNT_SHELL,
  newAccountShellAdded,
  newAccountShellAddFailed,
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
  accountShellOrderedToFront,
  accountShellRefreshCompleted,
  accountShellRefreshStarted,
  FETCH_FEE_AND_EXCHANGE_RATES,
  exchangeRatesCalculated,
  setAverageTxFee,
  VALIDATE_TWO_FA,
  twoFAValid,
  ADD_NEW_SECONDARY_SUBACCOUNT,
  ContactInfo,
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
} from '../actions/accounts'
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  DONATION_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import {
  DerivativeAccountTypes,
} from '../../bitcoin/utilities/Interface'
import SubAccountDescribing, { DonationSubAccountDescribing, ExternalServiceSubAccountDescribing } from '../../common/data/models/SubAccountInfo/Interfaces'
import AccountShell from '../../common/data/models/AccountShell'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import RelayServices from '../../bitcoin/services/RelayService'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import BaseAccount from '../../bitcoin/utilities/accounts/BaseAccount'
import TrustedContactsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TrustedContactsSubAccountInfo'
import { createTrustedContactSubAccount } from './trustedContacts'
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
import S3Service from '../../bitcoin/services/sss/S3Service'
import Bitcoin from '../../bitcoin/utilities/accounts/Bitcoin'

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


function* testcoinsWorker() {
  const service = yield select(
    ( state ) => state.accounts[ TEST_ACCOUNT ].service
  )
  const res = yield call( service.getTestcoins )

  if ( res.status === 200 )
    yield put( testcoinsReceived( ) )
  else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    throw new Error( 'Failed to get testcoins' )
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

  try {
    const res = yield call( RelayServices.fetchFeeAndExchangeRates )
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


function* validateTwoFAWorker( { payload } ) {
  const service: SecureAccount = yield select(
    ( state ) => state.accounts[ SECURE_ACCOUNT ].service,
  )

  const res = yield call( service.validate2FASetup, payload.token )

  if ( res.status == 200 && res.data.valid ) {
    yield put( twoFAValid( true ) )
    const { removed } = yield call( service.removeTwoFADetails )

    if ( removed ) {
      const { SERVICES } = yield select( ( state ) => state.storage.database )
      const updatedSERVICES = {
        ...SERVICES,
        [ SECURE_ACCOUNT ]: JSON.stringify( service ),
      }

      yield call( insertDBWorker, {
        payload: {
          SERVICES: updatedSERVICES
        }
      } )
    } else {
      console.log( 'Failed to remove 2FA details from the device' )
    }

  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    console.log( 'Failed to validate twoFA', res.err )
    yield put( twoFAValid( false ) )
  }
}

export const validateTwoFAWatcher = createWatcher(
  validateTwoFAWorker,
  VALIDATE_TWO_FA
)

function* setupDonationAccountWorker( { payload } ) {
  const {
    serviceType,
    donee,
    subject,
    description,
    configuration,
    disableAccount,
  } = payload
  const service = yield select( ( state ) => state.accounts[ serviceType ].service )

  const res = yield call(
    service.setupDonationAccount,
    donee,
    subject,
    description,
    configuration,
    disableAccount
  )

  if ( res.status === 200 ) {
    // console.log( { res } )
    const { setupSuccessful, accountId, accountNumber, accountXpub } = res.data
    if ( !setupSuccessful ) {
      throw new Error( 'Donation account setup failed' )
    }

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

    return {
      accountId, accountNumber, accountXpub
    }
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    throw new Error( res.err )
  }
}

export const setupDonationAccountWatcher = createWatcher(
  setupDonationAccountWorker,
  SETUP_DONATION_ACCOUNT
)

function* updateDonationPreferencesWorker( { payload } ) {
  const { serviceType, accountNumber, preferences } = payload
  const service = yield select( ( state ) => state.accounts[ serviceType ].service )

  const res = yield call(
    service.updateDonationPreferences,
    accountNumber,
    preferences
  )

  if ( res.status === 200 ) {
    console.log( {
      res
    } )

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
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    throw new Error( res.err )
  }
}

export const updateDonationPreferencesWatcher = createWatcher(
  updateDonationPreferencesWorker,
  UPDATE_DONATION_PREFERENCES
)

function* refreshAccountShellWorker( { payload } ) {
  const shell: AccountShell = payload.shell
  yield put( accountShellRefreshStarted( shell ) )
  const { primarySubAccount } = shell
  const options: { autoSync?: boolean, hardRefresh?: boolean } = payload.options

  let accountKind
  switch ( primarySubAccount.kind ) {
      case SubAccountKind.REGULAR_ACCOUNT:
      case SubAccountKind.SECURE_ACCOUNT:
        if ( primarySubAccount.instanceNumber )
          accountKind = DerivativeAccountTypes.SUB_PRIMARY_ACCOUNT
        else accountKind = primarySubAccount.kind
        break

      case SubAccountKind.SERVICE:
        accountKind = ( primarySubAccount as ExternalServiceSubAccountDescribing ).serviceAccountKind
        break

      default:
        accountKind = primarySubAccount.kind
  }

  const nonDerivativeAccounts = [
    SubAccountKind.TEST_ACCOUNT,
    SubAccountKind.REGULAR_ACCOUNT,
    SubAccountKind.SECURE_ACCOUNT,
  ]

  if ( !nonDerivativeAccounts.includes( accountKind ) ) {
    if ( accountKind === DONATION_ACCOUNT ) {
      const payload = {
        serviceType: primarySubAccount.sourceKind,
        derivativeAccountType: accountKind,
        accountNumber: primarySubAccount.instanceNumber,
      }
      yield call( syncViaXpubAgentWorker, {
        payload
      } )
    } else {
      const payload = {
        serviceType: primarySubAccount.sourceKind,
        accountType: accountKind,
        accountNumber: primarySubAccount.instanceNumber,
        hardRefresh: options.hardRefresh
      }
      const deltaTxs: TransactionDescribing[] = yield call( fetchDerivativeAccBalanceTxWorker, {
        payload
      } )

      const rescanTxs: RescannedTransactionData[] = []
      deltaTxs.forEach( ( deltaTx ) => {
        rescanTxs.push( {
          details: deltaTx,
          accountShell: shell,
        } )
      } )
      yield put( rescanSucceeded( rescanTxs ) )
    }
  } else {
    const payload = {
      serviceType: accountKind,
      options: {
        loader: true,
        syncTrustedDerivative:
          primarySubAccount.sourceKind === TEST_ACCOUNT ? false : true,
        hardRefresh: options.hardRefresh
      },
    }

    const deltaTxs: TransactionDescribing[] = yield call( fetchBalanceTxWorker, {
      payload
    } )

    const rescanTxs: RescannedTransactionData[] = []
    deltaTxs.forEach( ( deltaTx ) => {
      rescanTxs.push( {
        details: deltaTx,
        accountShell: shell,
      } )
    } )
    yield put( rescanSucceeded( rescanTxs ) )
  }

  yield put( accountShellRefreshCompleted( shell ) )
}

export const refreshAccountShellWatcher = createWatcher(
  refreshAccountShellWorker,
  REFRESH_ACCOUNT_SHELL
)

function* autoSyncShellsWorker( { payload } ) {
  yield spawn( clearAccountSyncCache )
  const shells = yield select(
    ( state ) => state.accounts.accountShells
  )

  for ( const shell of shells ) {
    if ( shell.syncStatus === SyncStatus.PENDING ) {
      yield delay( 3000 )
      yield spawn( refreshAccountShellWorker,
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
  yield put( rescanSucceeded( rescanTxs ) )
  yield put( blindRefreshStarted( false ) )
}

export const blindRefreshWatcher = createWatcher(
  blindRefreshWorker,
  BLIND_REFRESH
)

function* addNewSubAccount( subAccountInfo: SubAccountDescribing ) {
  let subAccountId: string
  let subAccountXpub: string
  let subAccountInstanceNum: number

  const service = yield select(
    ( state ) => state.accounts[ subAccountInfo.sourceKind ].service
  )

  switch ( subAccountInfo.kind ) {
      case SubAccountKind.DONATION_ACCOUNT:
        const donationInstance = yield call( setupDonationAccountWorker, {
          payload: {
            serviceType: subAccountInfo.sourceKind,
            donee: ( subAccountInfo as DonationSubAccountDescribing ).doneeName,
            subject: subAccountInfo.customDisplayName,
            description: subAccountInfo.customDescription,
            configuration: {
              displayBalance: true,
              displayTransactions: true,
              displayTxDetails: true,
            },
          },
        } )

        subAccountId = donationInstance.accountId
        subAccountXpub = donationInstance.accountXpub
        subAccountInstanceNum = donationInstance.accountNumber
        break

      case SubAccountKind.REGULAR_ACCOUNT:
      case SubAccountKind.SECURE_ACCOUNT:
        const accountDetails = {
          accountName: subAccountInfo.customDisplayName,
          accountDescription: subAccountInfo.customDescription,
        }
        const derivativeSetupRes = yield call(
          service.setupDerivativeAccount,
          DerivativeAccountTypes.SUB_PRIMARY_ACCOUNT,
          accountDetails
        )

        if ( derivativeSetupRes.status === 200 ) {
          const { SERVICES } = yield select( ( state ) => state.storage.database )
          const updatedSERVICES = {
            ...SERVICES,
            [ subAccountInfo.kind ]: JSON.stringify( service ),
          }
          yield call( insertDBWorker, {
            payload: {
              SERVICES: updatedSERVICES
            }
          } )

          subAccountId = derivativeSetupRes.data.accountId
          subAccountXpub = derivativeSetupRes.data.accountXpub
          subAccountInstanceNum = derivativeSetupRes.data.accountNumber
        } else console.log( {
          err: derivativeSetupRes.err
        } )
        break

      case SubAccountKind.SERVICE:
        switch ( ( subAccountInfo as ExternalServiceSubAccountDescribing ).serviceAccountKind ) {
            case ServiceAccountKind.WYRE:
              const wyreAccountDetails = {
                accountName: subAccountInfo.customDisplayName,
                accountDescription: subAccountInfo.customDescription,
              }
              const wyreSetupRes = yield call(
                service.setupDerivativeAccount,
                DerivativeAccountTypes.WYRE,
                wyreAccountDetails
              )

              if ( wyreSetupRes.status === 200 ) {
                const { SERVICES } = yield select( ( state ) => state.storage.database )
                const updatedSERVICES = {
                  ...SERVICES,
                  [ subAccountInfo.sourceKind ]: JSON.stringify( service ),
                }
                yield call( insertDBWorker, {
                  payload: {
                    SERVICES: updatedSERVICES
                  }
                } )

                subAccountId = wyreSetupRes.data.accountId
                subAccountXpub = wyreSetupRes.data.accountXpub
                subAccountInstanceNum = wyreSetupRes.data.accountNumber
              } else {
                console.log( {
                  err: wyreSetupRes.err
                } )
              }
              break

            case ServiceAccountKind.RAMP:
              const rampAccountDetails = {
                accountName: subAccountInfo.customDisplayName,
                accountDescription: subAccountInfo.customDescription,
              }
              const rampSetupRes = yield call(
                service.setupDerivativeAccount,
                DerivativeAccountTypes.RAMP,
                rampAccountDetails
              )

              if ( rampSetupRes.status === 200 ) {
                const { SERVICES } = yield select( ( state ) => state.storage.database )
                const updatedSERVICES = {
                  ...SERVICES,
                  [ subAccountInfo.sourceKind ]: JSON.stringify( service ),
                }
                yield call( insertDBWorker, {
                  payload: {
                    SERVICES: updatedSERVICES
                  }
                } )

                subAccountId = rampSetupRes.data.accountId
                subAccountXpub = rampSetupRes.data.accountXpub
                subAccountInstanceNum = rampSetupRes.data.accountNumber
              } else {
                console.log( {
                  err: rampSetupRes.err
                } )
              }
              break

            case ServiceAccountKind.SWAN:
              const swanAccountDetails = {
                accountName: subAccountInfo.customDisplayName,
                accountDescription: subAccountInfo.customDescription,
              }
              const swanSetupRes = yield call(
                service.setupDerivativeAccount,
                DerivativeAccountTypes.SWAN,
                swanAccountDetails
              )

              if ( swanSetupRes.status === 200 ) {
                const { SERVICES } = yield select( ( state ) => state.storage.database )
                const updatedSERVICES = {
                  ...SERVICES,
                  [ subAccountInfo.sourceKind ]: JSON.stringify( service ),
                }
                yield call( insertDBWorker, {
                  payload: {
                    SERVICES: updatedSERVICES
                  }
                } )

                subAccountId = swanSetupRes.data.accountId
                subAccountXpub = swanSetupRes.data.accountXpub
                subAccountInstanceNum = swanSetupRes.data.accountNumber
              } else {
                console.log( {
                  err: swanSetupRes.err
                } )
              }
              break
        }
        break
  }

  if ( subAccountId ) return {
    subAccountId, subAccountInstanceNum, subAccountXpub
  }
  else throw new Error( 'Failed to generate sub-account; subAccountId missing ' )
}


function* createServiceSecondarySubAccount ( secondarySubAccount: ExternalServiceSubAccountDescribing, parentShell: AccountShell ) {
  const service = yield select(
    ( state ) => state.accounts[ parentShell.primarySubAccount.sourceKind ].service
  )

  let res
  switch( secondarySubAccount.serviceAccountKind ){
      case ServiceAccountKind.FAST_BITCOINS:
        const fastBitcoinsDetails = {
          accountName: secondarySubAccount.customDisplayName,
          accountDescription: secondarySubAccount.customDescription,
        }
        res = yield call(
          ( service as BaseAccount|SecureAccount ).setupDerivativeAccount,
          DerivativeAccountTypes.FAST_BITCOINS,
          fastBitcoinsDetails
        )
        break
  }

  if ( res && res.status === 200 ) {
    const secondarySubAccountId = res.data.accountId
    const secondarySubAccountInstanceNum = res.data.accountNumber

    secondarySubAccount.id = secondarySubAccountId
    secondarySubAccount.balances = {
      confirmed: 0,
      unconfirmed: 0,
    }
    secondarySubAccount.transactions = []

    AccountShell.addSecondarySubAccount(
      parentShell,
      secondarySubAccountId,
      secondarySubAccount,
    )

    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const updatedSERVICES = {
      ...SERVICES,
      [ parentShell.primarySubAccount.sourceKind ]: JSON.stringify( service ),
    }
    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )
  } else {
    throw new Error( 'Failed to generate secondary sub-account(service)' )
  }
}

function* addNewSecondarySubAccount( { payload }: {payload: {  secondarySubAccount: SubAccountDescribing,
  parentShell: AccountShell, contactInfo?: ContactInfo }} ) {

  const { secondarySubAccount, parentShell, contactInfo } = payload
  switch ( secondarySubAccount.kind ) {
      case SubAccountKind.TRUSTED_CONTACTS:
        yield call( createTrustedContactSubAccount, ( secondarySubAccount as TrustedContactsSubAccountInfo ), parentShell, contactInfo )
        break

      case SubAccountKind.SERVICE:
        yield call( createServiceSecondarySubAccount, ( secondarySubAccount as ExternalServiceSubAccountDescribing ), parentShell )
        break
  }
}

export const addNewSecondarySubAccountWatcher = createWatcher(
  addNewSecondarySubAccount,
  ADD_NEW_SECONDARY_SUBACCOUNT
)

function* addNewAccountShell( { payload: subAccountInfo, }: {
  payload: SubAccountDescribing;
} ) {
  const accountsState: AccountsState = yield select( state => state.accounts )
  const network = accountsState[ REGULAR_ACCOUNT ].service.hdWallet.network

  const bitcoinUnit =
    subAccountInfo.kind == SubAccountKind.TEST_ACCOUNT
      ? BitcoinUnit.TSATS
      : BitcoinUnit.SATS

  try {
    const { subAccountId, subAccountInstanceNum, subAccountXpub } = yield call(
      addNewSubAccount,
      subAccountInfo
    )
    subAccountInfo.id = subAccountId
    subAccountInfo.xPub = Bitcoin.generateYpub( subAccountXpub, network )
    subAccountInfo.instanceNumber = subAccountInstanceNum
    const newAccountShell = new AccountShell( {
      unit: bitcoinUnit,
      primarySubAccount: subAccountInfo,
      displayOrder: 1,
    } )
    yield put( newAccountShellAdded( {
      accountShell: newAccountShell
    } ) )
    yield put( accountShellOrderedToFront( newAccountShell ) )
  } catch ( error ) {
    console.log( 'addNewAccountShell saga::error: ' + error )
    const newAccountShell = new AccountShell( {
      unit: bitcoinUnit,
      primarySubAccount: subAccountInfo,
      displayOrder: 1,
    } )
    yield put(
      newAccountShellAddFailed( {
        accountShell: newAccountShell, error
      } )
    )
  }
}

export const addNewAccountShellWatcher = createWatcher(
  addNewAccountShell,
  ADD_NEW_ACCOUNT_SHELL
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
        customDescription: account.customDescription
      }
    )

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
    const { qrdata, QRModalHeader, serviceType } = payload
    console.log( 'payload', payload )
    // qrData = '{"requester":"Shivani","publicKey":"M80Nz8hMm6lrce7SADVwapF8","uploadedAt":1616149096398,"type":"ReverseRecoveryQR","ver":"1.5.0"}';
    const { DECENTRALIZED_BACKUP, WALLET_SETUP } = yield select( ( state ) => state.storage.database )
    const s3Service = yield select( ( state ) => state.health.service )
    let secondaryMnemonic
    const sharesArray = [ DECENTRALIZED_BACKUP.PK_SHARE ]
    console.log( 'qrData', qrdata )
    const qrDataObj = JSON.parse( qrdata )
    console.log( 'qrDataObj', qrDataObj )
    if( qrDataObj.type && qrDataObj.type == 'pdf' ) {

      const walletId = s3Service.levelhealth.walletId
      const key = LevelHealth.getDerivedKey( walletId )
      console.log( 'key', key )
      const data = yield LevelHealth.decryptWithAnswer( qrDataObj.encryptedData, WALLET_SETUP.security.answer )
      console.log( 'data', data )
      const data1 = JSON.parse( data.decryptedString )
      console.log( 'data1', data1 )
      const res = yield call( S3Service.downloadSMPDFShare, data1.messageId, key )
      if ( res.status === 200 ) {
        console.log( 'SHARES DOWNLOAD pdf', res.data )
        sharesArray.push( res.data.metaShare )
      }
    } else {
      const res = yield call( S3Service.downloadSMShare, qrDataObj.publicKey )
      if ( res.status === 200 ) {
        console.log( 'SHARES DOWNLOAD', res.data )
        sharesArray.push( res.data.metaShare )
      }
    }
    console.log( 'sharesArray', sharesArray )
    if( sharesArray.length>1 ){
      secondaryMnemonic = LevelHealth.getSecondaryMnemonics( sharesArray, WALLET_SETUP.security.answer )
    }
    console.log( 'secondaryMnemonic', secondaryMnemonic.mnemonic )
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
