import { call, put, select, spawn } from 'redux-saga/effects'
import { createWatcher, requestTimedout } from '../utils/utilities'
import {
  FETCH_TRANSACTIONS,
  transactionsFetched,
  switchLoader,
  TRANSFER_ST1,
  TRANSFER_ST2,
  executedST1,
  executedST2,
  GET_TESTCOINS,
  TRANSFER_ST3,
  executedST3,
  ACCUMULATIVE_BAL_AND_TX,
  failedST1,
  failedST2,
  failedST3,
  testcoinsReceived,
  accountsSynched,
  settedDonationAccount,
  FETCH_BALANCE_TX,
  ALTERNATE_TRANSFER_ST2,
  secondaryXprivGenerated,
  GENERATE_SECONDARY_XPRIV,
  alternateTransferST2Executed,
  RESET_TWO_FA,
  twoFAResetted,
  FETCH_DERIVATIVE_ACC_XPUB,
  FETCH_DERIVATIVE_ACC_BALANCE_TX,
  REMOVE_TWO_FA,
  SETUP_DONATION_ACCOUNT,
  UPDATE_DONATION_PREFERENCES,
  SYNC_VIA_XPUB_AGENT,
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
  clearAccountSyncCache,
} from '../actions/accounts'
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TRUSTED_CONTACTS,
  DONATION_ACCOUNT,
} from '../../common/constants/serviceTypes'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import { insertDBWorker } from './storage'
import config from '../../bitcoin/HexaConfig'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import {
  DerivativeAccountTypes,
  TrustedContactDerivativeAccountElements,
} from '../../bitcoin/utilities/Interface'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { setAutoAccountSync } from '../actions/loaders'
import SubAccountDescribing, { DonationSubAccountDescribing, ExternalServiceSubAccountDescribing } from '../../common/data/models/SubAccountInfo/Interfaces'
import AccountShell from '../../common/data/models/AccountShell'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import RelayServices from '../../bitcoin/services/RelayService'
import { AccountsState } from '../reducers/accounts'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import BaseAccount from '../../bitcoin/utilities/accounts/BaseAccount'
import SyncStatus from '../../common/data/enums/SyncStatus'
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces'
import { rescanSucceeded } from '../actions/wallet-rescanning'
import { RescannedTransactionData } from '../reducers/wallet-rescanning'

const delay = time => new Promise( resolve => setTimeout( resolve, time ) )

function* fetchDerivativeAccXpubWorker( { payload } ) {
  const { accountType, accountNumber } = payload
  const serivceType = REGULAR_ACCOUNT
  const service: RegularAccount = yield select(
    ( state ) => state.accounts[ serivceType ].service
  )

  const { derivativeAccounts } = service.hdWallet
  if ( derivativeAccounts[ accountType ][ accountNumber ] ) return // xpub already exists

  const res = yield call(
    service.getDerivativeAccXpub,
    accountType,
    accountNumber
  )

  if ( res.status === 200 ) {
    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const updatedSERVICES = {
      ...SERVICES,
      [ serivceType ]: JSON.stringify( service ),
    }
    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    throw new Error( 'Failed to generate derivative acc xpub' )
  }
}

export const fetchDerivativeAccXpubWatcher = createWatcher(
  fetchDerivativeAccXpubWorker,
  FETCH_DERIVATIVE_ACC_XPUB
)

function* fetchTransactionsWorker( { payload } ) {
  yield put( switchLoader( payload.serviceType, 'transactions' ) )
  const service = payload.service
    ? payload.service
    : yield select( ( state ) => state.accounts[ payload.serviceType ].service )

  const preFetchTransactions =
    payload.serviceType === SECURE_ACCOUNT
      ? service.secureHDWallet.transactions
      : service.hdWallet.transactions
  const res = yield call( service.getTransactions )
  const postFetchTransactions =
    res.status === 200 ? res.data.transactions : preFetchTransactions

  if (
    res.status === 200 &&
    JSON.stringify( preFetchTransactions ) !==
      JSON.stringify( postFetchTransactions )
  ) {
    yield put( transactionsFetched( payload.serviceType, postFetchTransactions ) )
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
  } else {
    yield put( switchLoader( payload.serviceType, 'transactions' ) )
  }
}

export const fetchTransactionsWatcher = createWatcher(
  fetchTransactionsWorker,
  FETCH_TRANSACTIONS
)

function* fetchBalanceTxWorker( { payload }: {payload: {
  serviceType: string,
  options: {
    service?;
    loader?: boolean;
    hardRefresh?: boolean;
    shouldNotInsert?: boolean;
    syncTrustedDerivative?: boolean;
  }}} ) {
  // delta txs(hard refresh)
  const txsFound : TransactionDescribing[] = []

  if ( payload.options.loader )
    yield put( switchLoader( payload.serviceType, 'balanceTx' ) )
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

  const res = yield call( ( service as BaseAccount | SecureAccount ).getBalanceTransactions, payload.options.hardRefresh )
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
    if( res.data.txsFound && res.data.txsFound.length ) txsFound.push( ...res.data.txsFound )

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
          hardRefresh: payload.options.hardRefresh
        },
      } )
      if( dervTxsFound && dervTxsFound.length ) txsFound.push( ...dervTxsFound )
    } catch ( err ) {
      console.log( {
        err
      } )
    }
  }

  if ( payload.options.loader ) {
    // yield delay(1000); // introducing delay for a sec to let the fetchTx/insertIntoDB finish
    yield put( switchLoader( payload.serviceType, 'balanceTx' ) )
  }

  return txsFound
}

export const fetchBalanceTxWatcher = createWatcher(
  fetchBalanceTxWorker,
  FETCH_BALANCE_TX
)

function* fetchDerivativeAccBalanceTxWorker( { payload } ) {
  let { serviceType, accountNumber, accountType, hardRefresh } = payload
  const dervTxsFound : TransactionDescribing[] = []

  yield put( switchLoader( serviceType, 'derivativeBalanceTx' ) )
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
    hardRefresh
  )

  if (
    res.status === 200
  ) {
    const { txsFound } = res.data
    if( txsFound && txsFound.length ) dervTxsFound.push( ...txsFound )

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
    yield put( switchLoader( serviceType, 'derivativeBalanceTx' ) )
  } else if ( res.status !== 200 ) {
    yield put( switchLoader( serviceType, 'derivativeBalanceTx' ) )

    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    throw new Error( 'Failed to fetch balance/transactions from the indexer' )
  }

  return dervTxsFound
}

export const fetchDerivativeAccBalanceTxWatcher = createWatcher(
  fetchDerivativeAccBalanceTxWorker,
  FETCH_DERIVATIVE_ACC_BALANCE_TX
)

function* syncDerivativeAccountsWorker( { payload }: {payload: {serviceTypes: string[], parentSynched: boolean, hardRefresh?: boolean} } ) {
  const dervTxsFound : TransactionDescribing[] = []

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

    const res = yield call(
      ( service as BaseAccount| SecureAccount ).syncDerivativeAccountsBalanceTxs,
      config.DERIVATIVE_ACC_TO_SYNC,
      payload.hardRefresh
    )

    const postFetchDerivativeAccounts = JSON.stringify(
      serviceType === REGULAR_ACCOUNT
        ? service.hdWallet.derivativeAccounts
        : service.secureHDWallet.derivativeAccounts
    )

    if ( res.status === 200 ) {
      // accumulate delta txs(during hard refresh) from derivative accounts(if present)
      if( res.data ){
        const { txsFound } = res.data
        if( txsFound && txsFound.length ) dervTxsFound.push( ...txsFound )
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
  yield put( switchLoader( payload.serviceType, 'balanceTx' ) )

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

  yield put( switchLoader( payload.serviceType, 'balanceTx' ) )
}

export const syncViaXpubAgentWatcher = createWatcher(
  syncViaXpubAgentWorker,
  SYNC_VIA_XPUB_AGENT
)

export const processRecipients = async(
  recipients: [
    {
      id: string;
      address: string;
      amount: number;
      type?: string;
      accountNumber?: number;
    }
  ],
  serviceType: string,
  accounts: AccountsState,
  trustedContactsServices: TrustedContactsService
)  => {
  const addressedRecipients = []
  const testAccount: TestAccount = accounts[ TEST_ACCOUNT ].service
  const regularAccount: RegularAccount = accounts[ REGULAR_ACCOUNT ].service
  const secureAccount: SecureAccount = accounts[ SECURE_ACCOUNT ].service

  for ( const recipient of recipients ) {
    if ( recipient.address ) addressedRecipients.push( recipient )
    // recipient: explicit address
    else {
      if ( !recipient.id ) throw new Error( 'Invalid recipient' )
      if (
        recipient.id === REGULAR_ACCOUNT ||
        recipient.id === SECURE_ACCOUNT ||
        config.EJECTED_ACCOUNTS.includes( recipient.id )
      ) {
        // recipient: account
        const subInstance =
          recipient.type === REGULAR_ACCOUNT
            ? regularAccount.hdWallet
            : secureAccount.secureHDWallet

        let receivingAddress
        if ( config.EJECTED_ACCOUNTS.includes( recipient.id ) ) {
          receivingAddress = subInstance.getReceivingAddress(
            recipient.id,
            recipient.accountNumber
          )
        } else receivingAddress = subInstance.getReceivingAddress() // available based on serviceType
        if ( !receivingAddress ) {
          throw new Error(
            `Failed to generate receiving address for recipient: ${recipient.id}`
          )
        }
        recipient.address = receivingAddress
        addressedRecipients.push( recipient )
      } else {
        // recipient: Trusted Contact
        const contactName = recipient.id
        let res

        const accountNumber =
          regularAccount.hdWallet.trustedContactToDA[
            contactName.toLowerCase().trim()
          ]
        if ( accountNumber ) {
          const { contactDetails } = regularAccount.hdWallet.derivativeAccounts[
            TRUSTED_CONTACTS
          ][ accountNumber ] as TrustedContactDerivativeAccountElements

          if ( serviceType !== TEST_ACCOUNT ) {
            if ( contactDetails && contactDetails.xpub ) {
              res = await
              regularAccount.getDerivativeAccAddress( TRUSTED_CONTACTS,
                null,
                contactName )
            } else {
              const { trustedAddress, } = trustedContactsServices.tc.trustedContacts[
                contactName.toLowerCase().trim()
              ]
              if ( trustedAddress )
                res = {
                  status: 200, data: {
                    address: trustedAddress
                  }
                }
              else
                throw new Error( 'Failed fetch contact address, xpub missing' )
            }
          } else {
            if ( contactDetails && contactDetails.tpub ) {
              res = await testAccount.deriveReceivingAddress( contactDetails.tpub )
            } else {
              const { trustedTestAddress, } = trustedContactsServices.tc.trustedContacts[
                contactName.toLowerCase().trim()
              ]
              if ( trustedTestAddress )
                res = {
                  status: 200, data: {
                    address: trustedTestAddress
                  }
                }
              else
                throw new Error(
                  'Failed fetch contact testnet address, tpub missing'
                )
            }
          }
        } else {
          throw new Error(
            'Failed fetch testnet address, accountNumber missing'
          )
        }

        // console.log( { res } )
        if ( res.status === 200 ) {
          const receivingAddress = res.data.address
          recipient.address = receivingAddress
          addressedRecipients.push( recipient )
        } else {
          throw new Error(
            `Failed to generate receiving address for recipient: ${recipient.id}`
          )
        }
      }
    }
  }

  return addressedRecipients
}

function* transferST1Worker( { payload } ) {
  yield put( switchLoader( payload.serviceType, 'transfer' ) )
  let { recipients, averageTxFees, derivativeAccountDetails } = payload
  console.log( {
    recipients
  } )

  const accounts: AccountsState = yield select(
    ( state ) => state.accounts
  )

  const trustedContactsServices: TrustedContactsService =
  yield select(
    ( state ) => state.trustedContacts.service
  )

  try {
    recipients = yield call( processRecipients, recipients, payload.serviceType, accounts, trustedContactsServices )
  } catch ( err ) {
    yield put( failedST1( payload.serviceType, {
      err
    } ) )
    return
  }
  console.log( {
    recipients
  } )
  const service = accounts[ payload.serviceType ].service

  const res = yield call(
    service.transferST1,
    recipients,
    averageTxFees,
    derivativeAccountDetails
  )
  if ( res.status === 200 ) yield put( executedST1( payload.serviceType, res.data ) )
  else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    yield put( failedST1( payload.serviceType, {
      ...res
    } ) )
    // yield put(switchLoader(payload.serviceType, 'transfer'));
  }
}

export const transferST1Watcher = createWatcher(
  transferST1Worker,
  TRANSFER_ST1
)

function* transferST2Worker( { payload } ) {
  const {
    serviceType,
    txnPriority,
    customTxPrerequisites,
    derivativeAccountDetails,
    nSequence,
  } = payload

  yield put( switchLoader( serviceType, 'transfer' ) )
  const { service, transfer } = yield select(
    ( state ) => state.accounts[ serviceType ]
  )

  const { txPrerequisites } = transfer.stage1? transfer.stage1: {
    txPrerequisites: null
  }
  if ( !txPrerequisites && !customTxPrerequisites ) {
    console.log( 'Transaction prerequisites missing' )
    return
  }
  const res = yield call(
    service.transferST2,
    txPrerequisites,
    txnPriority,
    customTxPrerequisites,
    derivativeAccountDetails,
    nSequence
  )
  if ( res.status === 200 ) {
    if ( serviceType === SECURE_ACCOUNT ) {
      // console.log( { res } )
      yield put( executedST2( serviceType, res.data ) )
    } else yield put( executedST2( serviceType, res.data.txid ) )
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    yield put( failedST2( serviceType, {
      ...res
    } ) )
    // yield put(switchLoader(serviceType, 'transfer'));
  }
}

export const transferST2Watcher = createWatcher(
  transferST2Worker,
  TRANSFER_ST2
)

function* generateSecondaryXprivWorker( { payload } ) {
  const service = yield select(
    ( state ) => state.accounts[ payload.serviceType ].service
  )

  const { generated } = service.generateSecondaryXpriv(
    payload.secondaryMnemonic
  )

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

function* alternateTransferST2Worker( { payload } ) {
  const {
    serviceType,
    txnPriority,
    customTxPrerequisites,
    derivativeAccountDetails,
    nSequence,
  } = payload
  if ( serviceType !== SECURE_ACCOUNT ) return

  yield put( switchLoader( serviceType, 'transfer' ) )
  const { service, transfer } = yield select(
    ( state ) => state.accounts[ serviceType ]
  )

  const { txPrerequisites } = transfer.stage1
  if ( !txPrerequisites ) {
    console.log( 'Transaction prerequisites missing' )
    return
  }

  const res = yield call(
    service.alternateTransferST2,
    txPrerequisites,
    txnPriority,
    customTxPrerequisites,
    derivativeAccountDetails,
    nSequence
  )
  if ( res.status === 200 ) {
    yield put( alternateTransferST2Executed( serviceType, res.data.txid ) )
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    yield put( failedST2( serviceType, {
      ...res
    } ) )
    // yield put(switchLoader(serviceType, 'transfer'));
  }
}

export const alternateTransferST2Watcher = createWatcher(
  alternateTransferST2Worker,
  ALTERNATE_TRANSFER_ST2
)

function* transferST3Worker( { payload } ) {
  if ( payload.serviceType !== SECURE_ACCOUNT ) return

  yield put( switchLoader( payload.serviceType, 'transfer' ) )
  const { token } = payload
  const { service, transfer } = yield select(
    ( state ) => state.accounts[ payload.serviceType ]
  )

  const { txHex, childIndexArray, inputs, derivativeAccountDetails } = transfer.stage2
  if ( !txHex || !childIndexArray || !inputs ) {
    console.log( 'TxHex/child-index/inputs missing' )
  }

  const res = yield call( ( service as SecureAccount ).transferST3, token, txHex, childIndexArray, inputs, derivativeAccountDetails )
  if ( res.status === 200 ) {
    yield put( executedST3( payload.serviceType, res.data.txid ) )
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    yield put( failedST3( payload.serviceType, {
      ...res
    } ) )
    // yield put(switchLoader(payload.serviceType, 'transfer'));
  }
}

export const transferST3Watcher = createWatcher(
  transferST3Worker,
  TRANSFER_ST3
)

function* testcoinsWorker( { payload } ) {
  yield put( switchLoader( payload.serviceType, 'testcoins' ) )

  const service = yield select(
    ( state ) => state.accounts[ payload.serviceType ].service
  )
  const res = yield call( service.getTestcoins )
  // console.log( { res } )
  if ( res.status === 200 ) {
    yield put( testcoinsReceived( payload.serviceType, service ) )

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

    yield put( accountsSynched( true ) ) // initial sync: test-acc only (turns the amount text to black)
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    throw new Error( 'Failed to get testcoins' )
  }
  yield put( switchLoader( payload.serviceType, 'testcoins' ) )
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

      if ( !exchangeRates ) yield put( exchangeRatesCalculated( {
      } ) )
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
  const service = yield select(
    ( state ) => state.accounts[ SECURE_ACCOUNT ].service
  )

  const res = yield call( service.resetTwoFA, payload.secondaryMnemonic )

  if ( res.status == 200 ) {
    yield put( twoFAResetted( true ) )
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    console.log( 'Failed to reset twoFA', res.err )
    yield put( twoFAResetted( false ) )
  }
}

export const resetTwoFAWatcher = createWatcher( resetTwoFAWorker, RESET_TWO_FA )


function* validateTwoFAWorker( { payload } ) {
  const service: SecureAccount = yield select(
    ( state ) => state.accounts[ SECURE_ACCOUNT ].service
  )

  const res = yield call( service.validate2FASetup, payload.token )

  if ( res.status == 200 && res.data.valid ) {
    yield put( twoFAValid( true ) )
    const { removed } = yield call( service.removeTwoFADetails )

    if( removed ){
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

function* removeTwoFAWorker() {
  const service: SecureAccount = yield select(
    ( state ) => state.accounts[ SECURE_ACCOUNT ].service
  )

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
    console.log( 'Failed to remove 2FA details' )
  }
}

export const removeTwoFAWatcher = createWatcher(
  removeTwoFAWorker,
  REMOVE_TWO_FA
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
    const { setupSuccessful, accountId, accountNumber } = res.data
    if ( !setupSuccessful ) {
      yield put( settedDonationAccount( serviceType, false ) )
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
    yield put( settedDonationAccount( serviceType, true ) )
    return {
      accountId, accountNumber
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
  switch( primarySubAccount.kind ){
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

  if ( options && options.autoSync ) {
    // auto-refresh the account-shell once per-session
    const autoAccountSync = yield select(
      ( state ) => state.loaders.autoAccountSync
    )

    if (
      autoAccountSync &&
      autoAccountSync[ `${accountKind + primarySubAccount.instanceNumber}` ]
    ) {
      // account-shell already synched
      yield put( accountShellRefreshCompleted( shell ) )
      return
    }
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

      const rescanTxs : RescannedTransactionData[]= []
      deltaTxs.forEach( ( deltaTx )=>{
        rescanTxs.push( {
          details: deltaTx,
          accountShell: shell,
        } )
      } )
      yield put( rescanSucceeded( rescanTxs ) )
    }

    yield put(
      setAutoAccountSync( `${accountKind + primarySubAccount.instanceNumber}` )
    )
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

    const rescanTxs : RescannedTransactionData[]= []
    deltaTxs.forEach( ( deltaTx )=>{
      rescanTxs.push( {
        details: deltaTx,
        accountShell: shell,
      } )
    } )
    yield put( rescanSucceeded( rescanTxs ) )

    yield put(
      setAutoAccountSync( `${accountKind + primarySubAccount.instanceNumber}` )
    )
  }

  yield put( accountShellRefreshCompleted( shell ) )
}

export const refreshAccountShellWatcher = createWatcher(
  refreshAccountShellWorker,
  REFRESH_ACCOUNT_SHELL
)

function* autoSyncShellsWorker( { payload } ) {
  yield call( clearAccountSyncCache )
  yield call( delay, 3000 )
  const shells = yield select(
    ( state ) => state.accounts.accountShells
  )
  for( const shell of shells )  {
    if( shell.syncStatus===SyncStatus.PENDING ) {
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
    yield call( delay, 4000 )
  }
}
export const autoSyncShellsWatcher = createWatcher(
  autoSyncShellsWorker,
  AUTO_SYNC_SHELLS
)

function* addNewSubAccount( subAccountInfo: SubAccountDescribing ) {
  let subAccountId: string
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
          subAccountInstanceNum = derivativeSetupRes.data.accountNumber
        } else console.log( {
          err: derivativeSetupRes.err
        } )
        break

      case SubAccountKind.SERVICE:
        switch( ( subAccountInfo as ExternalServiceSubAccountDescribing ).serviceAccountKind ){
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
                subAccountInstanceNum = wyreSetupRes.data.accountNumber
              } else {
                console.log( {
                  err: wyreSetupRes.err
                } )
              }
              break
        }
        break
  }

  if ( subAccountId ) return {
    subAccountId, subAccountInstanceNum
  }
  else throw new Error( 'Failed to generate sub-account; subAccountId missing ' )
}


function* addNewSecondarySubAccount( { payload }: {payload: {  secondarySubAccount: SubAccountDescribing,
  parentShell: AccountShell}} ) {
  const { secondarySubAccount, parentShell } = payload

  let secondarySubAccountId: string
  let secondarySubAccountInstanceNum: number

  const service = yield select(
    ( state ) => state.accounts[ parentShell.primarySubAccount.sourceKind ].service
  )

  switch ( secondarySubAccount.kind ) {
      case SubAccountKind.SERVICE:
        switch( ( secondarySubAccount as ExternalServiceSubAccountDescribing ).serviceAccountKind ){
            case ServiceAccountKind.FAST_BITCOINS:
              const fastBitcoinsDetails = {
                accountName: secondarySubAccount.customDisplayName,
                accountDescription: secondarySubAccount.customDescription,
              }
              const fbtcRes = yield call(
                ( service as BaseAccount|SecureAccount ).setupDerivativeAccount,
                DerivativeAccountTypes.FAST_BITCOINS,
                fastBitcoinsDetails
              )

              if ( fbtcRes.status === 200 ) {
                secondarySubAccountId = fbtcRes.data.accountId
                secondarySubAccountInstanceNum = fbtcRes.data.accountNumber

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
                console.log( {
                  err: fbtcRes.err
                } )
              }
              break
        }
        break
  }

  if ( secondarySubAccountId ) return {
    secondarySubAccountId, secondarySubAccountInstanceNum
  }
  else throw new Error( 'Failed to generate secondary sub-account; secondarySubAccountId missing' )
}

export const addNewSecondarySubAccountWatcher = createWatcher(
  addNewSecondarySubAccount,
  ADD_NEW_SECONDARY_SUBACCOUNT
)

function* addNewAccountShell( { payload: subAccountInfo, }: {
  payload: SubAccountDescribing;
} ) {

  const bitcoinUnit =
    subAccountInfo.kind == SubAccountKind.TEST_ACCOUNT
      ? BitcoinUnit.TSATS
      : BitcoinUnit.SATS

  try {
    const { subAccountId, subAccountInstanceNum } = yield call(
      addNewSubAccount,
      subAccountInfo
    )
    subAccountInfo.id = subAccountId
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
        kind: account.kind===SubAccountKind.SERVICE ? ( ( account as ExternalServiceSubAccountDescribing ).serviceAccountKind ) : account.kind,
        instanceNumber: account.instanceNumber,
        customDisplayName :account.customDisplayName,
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
  }catch ( error ) {
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
