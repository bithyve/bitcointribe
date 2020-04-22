import { call, put, select, delay, all } from 'redux-saga/effects';
import { createWatcher, requestTimedout } from '../utils/utilities';
import {
  FETCH_ADDR,
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
} from '../actions/accounts';
import { insertIntoDB } from '../actions/storage';
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/serviceTypes';
import { AsyncStorage, Alert } from 'react-native';
import axios from 'axios';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';

function* fetchAddrWorker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'receivingAddress'));
  const service = yield select(
    (state) => state.accounts[payload.serviceType].service,
  );
  const preFetchAddress =
    payload.serviceType === SECURE_ACCOUNT
      ? service.secureHDWallet.receivingAddress
      : service.hdWallet.receivingAddress;
  const res = yield call(service.getAddress);
  const postFetchAddress =
    res.status === 200 ? res.data.address : preFetchAddress;
  if (
    res.status === 200 &&
    JSON.stringify(preFetchAddress) !== JSON.stringify(postFetchAddress)
  ) {
    yield put(addressFetched(payload.serviceType, postFetchAddress));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(switchLoader(payload.serviceType, 'receivingAddress'));
  }
}

export const fetchAddrWatcher = createWatcher(fetchAddrWorker, FETCH_ADDR);

function* fetchDerivativeAccXpubWorker({ payload }) {
  const { accountType, accountNumber } = payload;
  const serivceType = REGULAR_ACCOUNT;
  const service: RegularAccount = yield select(
    (state) => state.accounts[serivceType].service,
  );

  const { derivativeAccount } = service.hdWallet;
  if (derivativeAccount[accountType][accountNumber]) return; // xpub already exists

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
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
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
  const { accountType, accountNumber } = payload;

  const serviceType = SECURE_ACCOUNT;
  const service: SecureAccount = yield select(
    (state) => state.accounts[serviceType].service,
  );

  const { derivativeAccount } = service.secureHDWallet;
  if (!derivativeAccount[accountType])
    throw new Error('Invalid derivative account type');

  console.log({ derivativeAccount });
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
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
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
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
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
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    yield put(switchLoader(payload.serviceType, 'transactions'));
  }
}

export const fetchTransactionsWatcher = createWatcher(
  fetchTransactionsWorker,
  FETCH_TRANSACTIONS,
);

function* fetchBalanceTxWorker({ payload }) {
  if (payload.options && payload.options.loader)
    yield put(switchLoader(payload.serviceType, 'balanceTx'));
  const service =
    payload.options && payload.options.service
      ? payload.options.service
      : yield select((state) => state.accounts[payload.serviceType].service);

  const preFetchBalances =
    payload.serviceType === SECURE_ACCOUNT
      ? service.secureHDWallet.balances
      : service.hdWallet.balances;
  const preFetchTransactions =
    payload.serviceType === SECURE_ACCOUNT
      ? service.secureHDWallet.transactions
      : service.hdWallet.transactions;

  const res = yield call(service.getBalanceTransactions, {
    restore: payload.options.restore,
  });

  const postFetchBalances =
    res.status === 200 ? res.data.balances : preFetchBalances;
  const postFetchTransactions =
    res.status === 200 ? res.data.transactions : preFetchTransactions;

  if (
    res.status === 200 &&
    JSON.stringify({ preFetchBalances, preFetchTransactions }) !==
      JSON.stringify({ postFetchBalances, postFetchTransactions })
  ) {
    if (!payload.options.shouldNotInsert) {
      const { SERVICES } = yield select((state) => state.storage.database);
      const updatedSERVICES = {
        ...SERVICES,
        [payload.serviceType]: JSON.stringify(service),
      };
      yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
    }
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error('Failed to fetch balance/transactions from the indexer');
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

  if (!accountNumber) accountNumber = 0;

  const { derivativeAccount } =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;
  if (
    !derivativeAccount[accountType] ||
    !derivativeAccount[accountType][accountNumber].xpub
  ) {
    throw new Error('Following derivative account does not exists');
  }

  const preFetchBalances =
    derivativeAccount[accountType][accountNumber].balances;
  const preFetchTransactions =
    derivativeAccount[accountType][accountNumber].transactions;

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
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [serviceType]: JSON.stringify(service),
    };
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error('Failed to fetch balance/transactions from the indexer');
  }
}

export const fetchDerivativeAccBalanceTxWatcher = createWatcher(
  fetchDerivativeAccBalanceTxWorker,
  FETCH_DERIVATIVE_ACC_BALANCE_TX,
);

function* transferST1Worker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'transfer'));
  const {
    recipientAddress,
    amount,
    priority,
    averageTxFees,
  } = payload.transferInfo;
  const service = yield select(
    (state) => state.accounts[payload.serviceType].service,
  );
  const res = yield call(
    service.transferST1,
    recipientAddress,
    amount,
    priority,
    averageTxFees,
  );
  if (res.status === 200) yield put(executedST1(payload.serviceType, res.data));
  else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(failedST1(payload.serviceType));
    // yield put(switchLoader(payload.serviceType, 'transfer'));
  }
}

export const transferST1Watcher = createWatcher(
  transferST1Worker,
  TRANSFER_ST1,
);

function* transferST2Worker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'transfer'));
  const { service, transfer } = yield select(
    (state) => state.accounts[payload.serviceType],
  );

  const { inputs, txb } = transfer.stage1;
  if (!inputs && !txb) {
    console.log('Transaction object missing');
    return;
  }
  const res = yield call(service.transferST2, inputs, txb);
  if (res.status === 200) {
    if (payload.serviceType === SECURE_ACCOUNT) {
      console.log({ res });
      yield put(executedST2(payload.serviceType, res.data));
    } else yield put(executedST2(payload.serviceType, res.data.txid));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(failedST2(payload.serviceType));
    // yield put(switchLoader(payload.serviceType, 'transfer'));
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
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
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
  if (payload.serviceType !== SECURE_ACCOUNT) return;

  yield put(switchLoader(payload.serviceType, 'transfer'));
  const { service, transfer } = yield select(
    (state) => state.accounts[payload.serviceType],
  );

  const { inputs, txb } = transfer.stage1;
  if (!inputs && !txb) {
    console.log('Transaction object missing');
    return;
  }
  const res = yield call(service.alternateTransferST2, inputs, txb);
  console.log({ res });
  if (res.status === 200) {
    yield put(alternateTransferST2Executed(payload.serviceType, res.data.txid));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(failedST2(payload.serviceType));
    // yield put(switchLoader(payload.serviceType, 'transfer'));
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
    console.log('testcoins received');
    yield call(AsyncStorage.setItem, 'Received Testcoins', 'true');
    // yield delay(3000); // 3 seconds delay for letting the transaction get broadcasted in the network
    // yield call(fetchBalance, payload.serviceType); // synchronising calls for efficiency
    // yield put(fetchTransactions(payload.serviceType, service));
    yield put(testcoinsReceived(payload.serviceType, service));

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [payload.serviceType]: JSON.stringify(service),
    };
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
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

    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
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

function* testWorker({ payload }) {
  console.log('---------Executing Test Saga---------');

  const service: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );

  const res = yield call(service.getDerivativeAccXpub, 'GET_BITTR');
  console.log({ res });

  const res2 = yield call(
    service.getDerivativeAccBalanceTransactions,
    'GET_BITTR',
  );
  console.log({ res2 });
  console.log('---------Executed Test Saga---------');
}

export const testWatcher = createWatcher(testWorker, RUN_TEST);
