import { call, put, select, delay, all } from 'redux-saga/effects';
import { createWatcher, requestTimedout } from '../utils/utilities';
import {
  // FETCH_ADDR,
  addressFetched,
  FETCH_BALANCE,
  balanceFetched,
  FETCH_TRANSACTIONS,
  transactionsFetched,
  switchLoader,
  TRANSFER_ST1,
  TRANSFER_ST2,
  executedST1,
  executedST2,
  GET_TESTCOINS,
  fetchBalance,
  TRANSFER_ST3,
  executedST3,
  fetchTransactions,
  ACCUMULATIVE_BAL_AND_TX,
  failedST1,
  failedST2,
  failedST3,
  testcoinsReceived,
  SYNC_ACCOUNTS,
  accountsSynched,
  settedDonationAccount,
  FETCH_BALANCE_TX,
  EXCHANGE_RATE,
  exchangeRatesCalculated,
  ALTERNATE_TRANSFER_ST2,
  secondaryXprivGenerated,
  GENERATE_SECONDARY_XPRIV,
  alternateTransferST2Executed,
  RESET_TWO_FA,
  twoFAResetted,
  RUN_TEST,
  FETCH_DERIVATIVE_ACC_XPUB,
  FETCH_DERIVATIVE_ACC_BALANCE_TX,
  FETCH_DERIVATIVE_ACC_ADDRESS,
  SYNC_DERIVATIVE_ACCOUNTS,
  syncDerivativeAccounts,
  STARTUP_SYNC,
  REMOVE_TWO_FA,
  SETUP_DONATION_ACCOUNT,
  UPDATE_DONATION_PREFERENCES,
  SYNC_VIA_XPUB_AGENT,
} from '../actions/accounts';
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  FAST_BITCOINS,
  TRUSTED_CONTACTS,
  DONATION_ACCOUNT,
} from '../../common/constants/serviceTypes';
import { AsyncStorage, Alert } from 'react-native';
import axios from 'axios';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import { insertDBWorker } from './storage';
import { trustedChannelsSyncWorker } from './trustedContacts';
import config from '../../bitcoin/HexaConfig';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';
import { TrustedContactDerivativeAccountElements } from '../../bitcoin/utilities/Interface';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';

// function* fetchAddrWorker({ payload }) {
//   yield put(switchLoader(payload.serviceType, 'receivingAddress'));
//   const service = yield select(
//     (state) => state.accounts[payload.serviceType].service,
//   );
//   const preFetchAddress =
//     payload.serviceType === SECURE_ACCOUNT
//       ? service.secureHDWallet.receivingAddress
//       : service.hdWallet.receivingAddress;
//   const res = yield call(service.getAddress);
//   const postFetchAddress =
//     res.status === 200 ? res.data.address : preFetchAddress;
//   if (
//     res.status === 200 &&
//     JSON.stringify(preFetchAddress) !== JSON.stringify(postFetchAddress)
//   ) {
//     yield put(addressFetched(payload.serviceType, postFetchAddress));
//     const { SERVICES } = yield select((state) => state.storage.database);
//     const updatedSERVICES = {
//       ...SERVICES,
//       [payload.serviceType]: JSON.stringify(service),
//     };
//     yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
//   } else {
//     if (res.err === 'ECONNABORTED') requestTimedout();
//     yield put(switchLoader(payload.serviceType, 'receivingAddress'));
//   }
// }

// export const fetchAddrWatcher = createWatcher(fetchAddrWorker, FETCH_ADDR);

function* fetchDerivativeAccXpubWorker({ payload }) {
  const { accountType, accountNumber } = payload;
  const serivceType = REGULAR_ACCOUNT;
  const service: RegularAccount = yield select(
    (state) => state.accounts[serivceType].service,
  );

  const { derivativeAccounts } = service.hdWallet;
  if (derivativeAccounts[accountType][accountNumber]) return; // xpub already exists

  const res = yield call(
    service.getDerivativeAccXpub,
    accountType,
    accountNumber,
  );

  if (res.status === 200) {
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [serivceType]: JSON.stringify(service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error('Failed to generate derivative acc xpub');
  }
}

export const fetchDerivativeAccXpubWatcher = createWatcher(
  fetchDerivativeAccXpubWorker,
  FETCH_DERIVATIVE_ACC_XPUB,
);

function* fetchDerivativeAccAddressWorker({ payload }) {
  const { serviceType, accountType, accountNumber } = payload;

  const service = yield select((state) => state.accounts[serviceType].service);

  const { derivativeAccounts } =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;

  if (!derivativeAccounts[accountType])
    throw new Error(
      `Invalid derivative account: ${accountType} does not exists`,
    );

  console.log({ derivativeAccounts });
  const res = yield call(
    service.getDerivativeAccAddress,
    accountType,
    accountNumber,
  );
  console.log({ res });

  if (res.status === 200) {
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [serviceType]: JSON.stringify(service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error('Failed to generate derivative acc address');
  }
}

export const fetchDerivativeAccAddressWatcher = createWatcher(
  fetchDerivativeAccAddressWorker,
  FETCH_DERIVATIVE_ACC_ADDRESS,
);

function* fetchBalanceWorker({ payload }) {
  if (payload.options && payload.options.loader)
    yield put(switchLoader(payload.serviceType, 'balances'));
  const service = yield select(
    (state) => state.accounts[payload.serviceType].service,
  );

  const preFetchBalances =
    payload.serviceType === SECURE_ACCOUNT
      ? service.secureHDWallet.balances
      : service.hdWallet.balances;
  const res = yield call(service.getBalance, {
    restore: payload.options.restore,
  });
  const postFetchBalances = res.status === 200 ? res.data : preFetchBalances;

  if (
    res.status === 200 &&
    payload.options &&
    payload.options.fetchTransactionsSync
  ) {
    yield call(fetchTransactionsWorker, {
      payload: {
        serviceType: payload.serviceType,
        service,
      },
    }); // have to dispatch everytime (if selected) as the tx confirmations increments
  } else if (
    res.status === 200 &&
    JSON.stringify(preFetchBalances) !== JSON.stringify(postFetchBalances)
  ) {
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [payload.serviceType]: JSON.stringify(service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  }

  if (payload.options.loader) {
    // yield delay(1000); // introducing delay for a sec to let the fetchTx/insertIntoDB finish
    yield put(switchLoader(payload.serviceType, 'balances'));
  }
}

export const fetchBalanceWatcher = createWatcher(
  fetchBalanceWorker,
  FETCH_BALANCE,
);

function* fetchTransactionsWorker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'transactions'));
  const service = payload.service
    ? payload.service
    : yield select((state) => state.accounts[payload.serviceType].service);

  const preFetchTransactions =
    payload.serviceType === SECURE_ACCOUNT
      ? service.secureHDWallet.transactions
      : service.hdWallet.transactions;
  const res = yield call(service.getTransactions);
  const postFetchTransactions =
    res.status === 200 ? res.data.transactions : preFetchTransactions;

  if (
    res.status === 200 &&
    JSON.stringify(preFetchTransactions) !==
      JSON.stringify(postFetchTransactions)
  ) {
    yield put(transactionsFetched(payload.serviceType, postFetchTransactions));
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [payload.serviceType]: JSON.stringify(service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else {
    yield put(switchLoader(payload.serviceType, 'transactions'));
  }
}

export const fetchTransactionsWatcher = createWatcher(
  fetchTransactionsWorker,
  FETCH_TRANSACTIONS,
);

function* fetchBalanceTxWorker({ payload }) {
  if (payload.options.loader)
    yield put(switchLoader(payload.serviceType, 'balanceTx'));
  const service = payload.options.service
    ? payload.options.service
    : yield select((state) => state.accounts[payload.serviceType].service);

  const preFetchBalances = JSON.stringify(
    payload.serviceType === SECURE_ACCOUNT
      ? service.secureHDWallet.balances
      : service.hdWallet.balances,
  );

  const preFetchTransactions = JSON.stringify(
    payload.serviceType === SECURE_ACCOUNT
      ? service.secureHDWallet.transactions
      : service.hdWallet.transactions,
  );

  const res = yield call(service.getBalanceTransactions, {
    restore: payload.options.restore,
  });

  const postFetchBalances =
    res.status === 200 ? JSON.stringify(res.data.balances) : preFetchBalances;
  const postFetchTransactions =
    res.status === 200
      ? JSON.stringify(res.data.transactions)
      : preFetchTransactions;

  let parentSynched = false;
  if (
    res.status === 200 &&
    (preFetchBalances !== postFetchBalances ||
      preFetchTransactions !== postFetchTransactions)
  ) {
    parentSynched = true;
    if (
      !payload.options.shouldNotInsert &&
      !payload.options.syncTrustedDerivative
    ) {
      const { SERVICES } = yield select((state) => state.storage.database);
      const updatedSERVICES = {
        ...SERVICES,
        [payload.serviceType]: JSON.stringify(service),
      };
      yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    }
  } else if (res.status !== 200) {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log('Failed to fetch balance/transactions from the indexer');
  }

  if (
    payload.options.syncTrustedDerivative &&
    (payload.serviceType === REGULAR_ACCOUNT ||
      payload.serviceType === SECURE_ACCOUNT)
  ) {
    try {
      yield call(syncDerivativeAccountsWorker, {
        payload: { serviceTypes: [payload.serviceType], parentSynched },
      });
    } catch (err) {
      console.log({ err });
    }
  }

  if (payload.options.loader) {
    // yield delay(1000); // introducing delay for a sec to let the fetchTx/insertIntoDB finish
    yield put(switchLoader(payload.serviceType, 'balanceTx'));
  }
}

export const fetchBalanceTxWatcher = createWatcher(
  fetchBalanceTxWorker,
  FETCH_BALANCE_TX,
);

function* fetchDerivativeAccBalanceTxWorker({ payload }) {
  let { serviceType, accountNumber, accountType } = payload;

  const service = yield select((state) => state.accounts[serviceType].service);

  if (!accountNumber) accountNumber = 1;

  const { derivativeAccounts } =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;
  if (
    !derivativeAccounts[accountType] ||
    !derivativeAccounts[accountType][accountNumber].xpub
  ) {
    throw new Error('Following derivative account does not exists');
  }

  const preFetchBalances =
    derivativeAccounts[accountType][accountNumber].balances;
  const preFetchTransactions =
    derivativeAccounts[accountType][accountNumber].transactions;

  const res = yield call(
    service.getDerivativeAccBalanceTransactions,
    accountType,
    accountNumber,
  );

  const postFetchBalances =
    res.status === 200 ? res.data.balances : preFetchBalances;
  const postFetchTransactions =
    res.status === 200 ? res.data.transactions : preFetchTransactions;

  if (
    res.status === 200 &&
    JSON.stringify({ preFetchBalances, preFetchTransactions }) !==
      JSON.stringify({ postFetchBalances, postFetchTransactions })
  ) {
    console.log({ balanceTx: res.data });
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [serviceType]: JSON.stringify(service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else if (res.status !== 200) {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error('Failed to fetch balance/transactions from the indexer');
  }
}

export const fetchDerivativeAccBalanceTxWatcher = createWatcher(
  fetchDerivativeAccBalanceTxWorker,
  FETCH_DERIVATIVE_ACC_BALANCE_TX,
);

function* syncDerivativeAccountsWorker({ payload }) {
  for (const serviceType of payload.serviceTypes) {
    console.log('Syncing DAs for: ', serviceType);

    // yield put(switchLoader(serviceType, 'derivativeBalanceTx'));
    const service = yield select(
      (state) => state.accounts[serviceType].service,
    );

    const preFetchDerivativeAccounts = JSON.stringify(
      serviceType === REGULAR_ACCOUNT
        ? service.hdWallet.derivativeAccounts
        : service.secureHDWallet.derivativeAccounts,
    );

    const res = yield call(
      service.syncDerivativeAccountsBalanceTxs,
      config.DERIVATIVE_ACC_TO_SYNC,
    );

    const postFetchDerivativeAccounts = JSON.stringify(
      serviceType === REGULAR_ACCOUNT
        ? service.hdWallet.derivativeAccounts
        : service.secureHDWallet.derivativeAccounts,
    );

    if (res.status === 200) {
      if (
        postFetchDerivativeAccounts !== preFetchDerivativeAccounts ||
        payload.parentSynched
      ) {
        const { SERVICES } = yield select((state) => state.storage.database);
        const updatedSERVICES = {
          ...SERVICES,
          [serviceType]: JSON.stringify(service),
        };
        yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
      }
    } else {
      if (res.err === 'ECONNABORTED') requestTimedout();
      console.log('Failed to sync derivative account');
    }

    // yield put(switchLoader(serviceType, 'derivativeBalanceTx'));
  }
}

export const syncDerivativeAccountsWatcher = createWatcher(
  syncDerivativeAccountsWorker,
  SYNC_DERIVATIVE_ACCOUNTS,
);

function* syncViaXpubAgentWorker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'balanceTx'));

  const { serviceType, derivativeAccountType, accountNumber } = payload;
  const service = yield select((state) => state.accounts[serviceType].service);

  const preFetchDerivativeAccount = JSON.stringify(
    serviceType === REGULAR_ACCOUNT
      ? service.hdWallet.derivativeAccounts[derivativeAccountType][
          accountNumber
        ]
      : service.secureHDWallet.derivativeAccounts[derivativeAccountType][
          accountNumber
        ],
  );

  const res = yield call(
    service.syncViaXpubAgent,
    derivativeAccountType,
    accountNumber,
  );

  const postFetchDerivativeAccount = JSON.stringify(
    serviceType === REGULAR_ACCOUNT
      ? service.hdWallet.derivativeAccounts[derivativeAccountType][
          accountNumber
        ]
      : service.secureHDWallet.derivativeAccounts[derivativeAccountType][
          accountNumber
        ],
  );

  if (res.status === 200) {
    if (postFetchDerivativeAccount !== preFetchDerivativeAccount) {
      const { SERVICES } = yield select((state) => state.storage.database);
      const updatedSERVICES = {
        ...SERVICES,
        [serviceType]: JSON.stringify(service),
      };
      yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    }
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log('Failed to sync derivative account');
  }

  yield put(switchLoader(payload.serviceType, 'balanceTx'));
}

export const syncViaXpubAgentWatcher = createWatcher(
  syncViaXpubAgentWorker,
  SYNC_VIA_XPUB_AGENT,
);

function* processRecipients(
  recipients: [{ id: string; address: string; amount: number }],
  serviceType: string,
) {
  const addressedRecipients = [];
  const testAccount: TestAccount = yield select(
    (state) => state.accounts[TEST_ACCOUNT].service,
  );
  const regularAccount: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );
  const secureAccount: SecureAccount = yield select(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );

  const trustedContactsServices: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  for (const recipient of recipients) {
    if (recipient.address) addressedRecipients.push(recipient);
    // recipient: explicit address
    else {
      if (!recipient.id) throw new Error('Invalid recipient');
      if (recipient.id === REGULAR_ACCOUNT || recipient.id === SECURE_ACCOUNT) {
        // recipient: sibling account
        const subInstance =
          recipient.id === REGULAR_ACCOUNT
            ? regularAccount.hdWallet
            : secureAccount.secureHDWallet;
        let { receivingAddress } = subInstance; // available based on serviceType
        if (!receivingAddress) {
          throw new Error(
            `Failed to generate receiving address for recipient: ${recipient.id}`,
          );
        }
        recipient.address = receivingAddress;
        addressedRecipients.push(recipient);
      } else {
        // recipient: Trusted Contact
        const contactName = recipient.id;
        let res;

        const accountNumber =
          regularAccount.hdWallet.trustedContactToDA[
            contactName.toLowerCase().trim()
          ];
        if (accountNumber) {
          const { contactDetails } = regularAccount.hdWallet.derivativeAccounts[
            TRUSTED_CONTACTS
          ][accountNumber] as TrustedContactDerivativeAccountElements;

          if (serviceType !== TEST_ACCOUNT) {
            if (contactDetails && contactDetails.xpub) {
              res = yield call(
                regularAccount.getDerivativeAccAddress,
                TRUSTED_CONTACTS,
                null,
                contactName,
              );
            } else {
              const {
                trustedAddress,
              } = trustedContactsServices.tc.trustedContacts[
                contactName.toLowerCase().trim()
              ];
              if (trustedAddress)
                res = { status: 200, data: { address: trustedAddress } };
              else
                throw new Error('Failed fetch contact address, xpub missing');
            }
          } else {
            if (contactDetails && contactDetails.tpub) {
              res = yield call(
                testAccount.deriveReceivingAddress,
                contactDetails.tpub,
              );
            } else {
              const {
                trustedTestAddress,
              } = trustedContactsServices.tc.trustedContacts[
                contactName.toLowerCase().trim()
              ];
              if (trustedTestAddress)
                res = { status: 200, data: { address: trustedTestAddress } };
              else
                throw new Error(
                  'Failed fetch contact testnet address, tpub missing',
                );
            }
          }
        } else {
          throw new Error(
            'Failed fetch testnet address, accountNumber missing',
          );
        }

        console.log({ res });
        if (res.status === 200) {
          const receivingAddress = res.data.address;
          recipient.address = receivingAddress;
          addressedRecipients.push(recipient);
        } else {
          throw new Error(
            `Failed to generate receiving address for recipient: ${recipient.id}`,
          );
        }
      }
    }
  }

  return addressedRecipients;
}

function* transferST1Worker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'transfer'));
  let { recipients, averageTxFees } = payload;
  console.log({ recipients });

  try {
    recipients = yield call(processRecipients, recipients, payload.serviceType);
  } catch (err) {
    yield put(failedST1(payload.serviceType, { err }));
    return;
  }
  console.log({ recipients });
  const service = yield select(
    (state) => state.accounts[payload.serviceType].service,
  );
  const res = yield call(service.transferST1, recipients, averageTxFees);
  if (res.status === 200) yield put(executedST1(payload.serviceType, res.data));
  else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(failedST1(payload.serviceType, { ...res }));
    // yield put(switchLoader(payload.serviceType, 'transfer'));
  }
}

export const transferST1Watcher = createWatcher(
  transferST1Worker,
  TRANSFER_ST1,
);

function* transferST2Worker({ payload }) {
  const {
    serviceType,
    txnPriority,
    customTxPrerequisites,
    nSequence,
  } = payload;

  yield put(switchLoader(serviceType, 'transfer'));
  const { service, transfer } = yield select(
    (state) => state.accounts[serviceType],
  );

  const { txPrerequisites } = transfer.stage1;
  if (!txPrerequisites) {
    console.log('Transaction prerequisites missing');
    return;
  }
  const res = yield call(
    service.transferST2,
    txPrerequisites,
    txnPriority,
    customTxPrerequisites,
    nSequence,
  );
  if (res.status === 200) {
    if (serviceType === SECURE_ACCOUNT) {
      console.log({ res });
      yield put(executedST2(serviceType, res.data));
    } else yield put(executedST2(serviceType, res.data.txid));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(failedST2(serviceType));
    // yield put(switchLoader(serviceType, 'transfer'));
  }
}

export const transferST2Watcher = createWatcher(
  transferST2Worker,
  TRANSFER_ST2,
);

function* generateSecondaryXprivWorker({ payload }) {
  const service = yield select(
    (state) => state.accounts[payload.serviceType].service,
  );

  const { generated } = service.generateSecondaryXpriv(
    payload.secondaryMnemonic,
  );

  if (generated) {
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [payload.serviceType]: JSON.stringify(service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    yield put(secondaryXprivGenerated(true));
  } else {
    yield put(secondaryXprivGenerated(false));
  }
}

export const generateSecondaryXprivWatcher = createWatcher(
  generateSecondaryXprivWorker,
  GENERATE_SECONDARY_XPRIV,
);

function* alternateTransferST2Worker({ payload }) {
  const {
    serviceType,
    txnPriority,
    customTxPrerequisites,
    nSequence,
  } = payload;
  if (serviceType !== SECURE_ACCOUNT) return;

  yield put(switchLoader(serviceType, 'transfer'));
  const { service, transfer } = yield select(
    (state) => state.accounts[serviceType],
  );

  const { txPrerequisites } = transfer.stage1;
  if (!txPrerequisites) {
    console.log('Transaction prerequisites missing');
    return;
  }

  const res = yield call(
    service.alternateTransferST2,
    txPrerequisites,
    txnPriority,
    customTxPrerequisites,
    nSequence,
  );
  if (res.status === 200) {
    yield put(alternateTransferST2Executed(serviceType, res.data.txid));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(failedST2(serviceType));
    // yield put(switchLoader(serviceType, 'transfer'));
  }
}

export const alternateTransferST2Watcher = createWatcher(
  alternateTransferST2Worker,
  ALTERNATE_TRANSFER_ST2,
);

function* transferST3Worker({ payload }) {
  if (payload.serviceType !== SECURE_ACCOUNT) return;

  yield put(switchLoader(payload.serviceType, 'transfer'));
  const { token } = payload;
  const { service, transfer } = yield select(
    (state) => state.accounts[payload.serviceType],
  );

  const { txHex, childIndexArray } = transfer.stage2;
  if (!txHex && !childIndexArray) {
    console.log('TxHex and childindex array missing');
  }

  const res = yield call(service.transferST3, token, txHex, childIndexArray);
  if (res.status === 200) {
    yield put(executedST3(payload.serviceType, res.data.txid));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(failedST3(payload.serviceType));
    // yield put(switchLoader(payload.serviceType, 'transfer'));
  }
}

export const transferST3Watcher = createWatcher(
  transferST3Worker,
  TRANSFER_ST3,
);

function* testcoinsWorker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'testcoins'));

  const service = yield select(
    (state) => state.accounts[payload.serviceType].service,
  );
  const res = yield call(service.getTestcoins);
  console.log({ res });
  if (res.status === 200) {
    // console.log('testcoins received');
    // yield call(AsyncStorage.setItem, 'Received Testcoins', 'true');
    // yield delay(3000); // 3 seconds delay for letting the transaction get broadcasted in the network
    // yield call(fetchBalance, payload.serviceType); // synchronising calls for efficiency
    // yield put(fetchTransactions(payload.serviceType, service));
    yield put(testcoinsReceived(payload.serviceType, service));

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [payload.serviceType]: JSON.stringify(service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });

    yield put(accountsSynched(true)); // initial sync: test-acc only (turns the amount text to black)
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error('Failed to get testcoins');
  }
  yield put(switchLoader(payload.serviceType, 'testcoins'));
}

export const testcoinsWatcher = createWatcher(testcoinsWorker, GET_TESTCOINS);

function* accumulativeTxAndBalWorker() {
  const accounts = yield select((state) => state.accounts);
  console.log({ accounts });

  const testBalance = accounts[TEST_ACCOUNT].service
    ? accounts[TEST_ACCOUNT].service.hdWallet.balances.balance +
      accounts[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
    : 0;
  const regularBalance = accounts[REGULAR_ACCOUNT].service
    ? accounts[REGULAR_ACCOUNT].service.hdWallet.balances.balance +
      accounts[REGULAR_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
    : 0;
  const secureBalance = accounts[SECURE_ACCOUNT].service
    ? accounts[SECURE_ACCOUNT].service.secureHDWallet.balances.balance +
      accounts[SECURE_ACCOUNT].service.secureHDWallet.balances
        .unconfirmedBalance
    : 0;
  const accumulativeBalance = regularBalance + secureBalance;

  const testTransactions = accounts[TEST_ACCOUNT].service
    ? accounts[TEST_ACCOUNT].service.hdWallet.transactions.transactionDetails
    : [];
  const regularTransactions = accounts[REGULAR_ACCOUNT].service
    ? accounts[REGULAR_ACCOUNT].service.hdWallet.transactions.transactionDetails
    : [];
  const secureTransactions = accounts[SECURE_ACCOUNT].service
    ? accounts[SECURE_ACCOUNT].service.secureHDWallet.transactions
        .transactionDetails
    : [];
  const accumulativeTransactions = [
    ...testTransactions,
    ...regularTransactions,
    ...secureTransactions,
  ];
  console.log({ accumulativeBalance, accumulativeTransactions });
}

export const accumulativeTxAndBalWatcher = createWatcher(
  accumulativeTxAndBalWorker,
  ACCUMULATIVE_BAL_AND_TX,
);

function* exchangeRateWorker() {
  try {
    const storedExchangeRates = yield call(
      AsyncStorage.getItem,
      'exchangeRates',
    );

    if (storedExchangeRates) {
      const exchangeRates = JSON.parse(storedExchangeRates);
      if (Date.now() - exchangeRates.lastFetched < 1800000) {
        yield put(exchangeRatesCalculated(exchangeRates));
        return;
      } // maintaining half an hour difference b/w fetches
    }
    const exchangeAxios = axios.create({
      baseURL: 'https://blockchain.info/',
      timeout: 15000, // 15 seconds
    });
    const res = yield call(exchangeAxios.get, 'ticker');
    if (res.status == 200) {
      const exchangeRates = res.data;
      exchangeRates.lastFetched = Date.now();
      yield put(exchangeRatesCalculated(exchangeRates));
      yield call(
        AsyncStorage.setItem,
        'exchangeRates',
        JSON.stringify(exchangeRates),
      );
    } else {
      if (res.err === 'ECONNABORTED') requestTimedout();
      console.log('Failed to retrieve exchange rates', res);
    }
  } catch (err) {
    console.log({ err });
  }
}

export const exchangeRateWatcher = createWatcher(
  exchangeRateWorker,
  EXCHANGE_RATE,
);

function* resetTwoFAWorker({ payload }) {
  const service = yield select(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );

  const res = yield call(service.resetTwoFA, payload.secondaryMnemonic);

  if (res.status == 200) {
    yield put(twoFAResetted(true));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log('Failed to reset twoFA', res.err);
    yield put(twoFAResetted(false));
  }
}

export const resetTwoFAWatcher = createWatcher(resetTwoFAWorker, RESET_TWO_FA);

function* removeTwoFAWorker() {
  const service: SecureAccount = yield select(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );

  const { removed } = yield call(service.removeTwoFADetails);

  if (removed) {
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [SECURE_ACCOUNT]: JSON.stringify(service),
    };

    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else {
    console.log('Failed to remove 2FA details');
  }
}

export const removeTwoFAWatcher = createWatcher(
  removeTwoFAWorker,
  REMOVE_TWO_FA,
);

function* accountsSyncWorker({ payload }) {
  try {
    const accounts = yield select((state) => state.accounts);

    const testService = accounts[TEST_ACCOUNT].service;
    const regularService = accounts[REGULAR_ACCOUNT].service;
    const secureService = accounts[SECURE_ACCOUNT].service;

    yield all([
      fetchBalanceTxWorker({
        payload: {
          serviceType: TEST_ACCOUNT,
          options: {
            service: testService,
            restore: payload.restore,
            shouldNotInsert: true,
          },
        },
      }),
      fetchBalanceTxWorker({
        payload: {
          serviceType: REGULAR_ACCOUNT,
          options: {
            service: regularService,
            restore: payload.restore,
            shouldNotInsert: true,
          },
        },
      }),
      fetchBalanceTxWorker({
        payload: {
          serviceType: SECURE_ACCOUNT,
          options: {
            service: secureService,
            restore: payload.restore,
            shouldNotInsert: true,
          },
        },
      }),
    ]);

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [TEST_ACCOUNT]: JSON.stringify(testService),
      [REGULAR_ACCOUNT]: JSON.stringify(regularService),
      [SECURE_ACCOUNT]: JSON.stringify(secureService),
    };

    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    yield put(accountsSynched(true));
  } catch (err) {
    console.log({ err });
    yield put(accountsSynched(false));
  }
}

export const accountsSyncWatcher = createWatcher(
  accountsSyncWorker,
  SYNC_ACCOUNTS,
);

function* startupSyncWorker({ payload }) {
  try {
    console.log('Synching accounts...');
    yield call(accountsSyncWorker, { payload });
  } catch (err) {
    console.log('Accounts sync failed: ', err);
  }

  try {
    console.log('Synching derivative accounts...');
    yield call(syncDerivativeAccountsWorker, {
      payload: { serviceTypes: [REGULAR_ACCOUNT, SECURE_ACCOUNT] },
    });
  } catch (err) {
    console.log('Trusted Derivative accounts sync failed: ', err);
  }

  try {
    console.log('Synching trusted channels...');
    yield call(trustedChannelsSyncWorker);
  } catch (err) {
    console.log('Trusted Channels sync failed: ', err);
  }
}

export const startupSyncWatcher = createWatcher(
  startupSyncWorker,
  STARTUP_SYNC,
);

function* setupDonationAccountWorker({ payload }) {
  const { serviceType, donee, subject, description, configuration } = payload;
  const service = yield select((state) => state.accounts[serviceType].service);

  const res = yield call(
    service.setupDonationAccount,
    donee,
    subject,
    description,
    configuration,
  );

  if (res.status === 200) {
    console.log({ res });
    if (!res.data.setupSuccessful) {
      yield put(settedDonationAccount(serviceType, false));
      throw new Error('Donation account setup failed');
    }

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [serviceType]: JSON.stringify(service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    yield put(settedDonationAccount(serviceType, true));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error(res.err);
  }
}

export const setupDonationAccountWatcher = createWatcher(
  setupDonationAccountWorker,
  SETUP_DONATION_ACCOUNT,
);

function* updateDonationPreferencesWorker({ payload }) {
  const { serviceType, accountNumber, configuration } = payload;
  const service = yield select((state) => state.accounts[serviceType].service);

  const res = yield call(
    service.updateDonationPreferences,
    accountNumber,
    configuration,
  );

  if (res.status === 200) {
    console.log({ res });

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [serviceType]: JSON.stringify(service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error(res.err);
  }
}

export const updateDonationPreferencesWatcher = createWatcher(
  updateDonationPreferencesWorker,
  UPDATE_DONATION_PREFERENCES,
);
