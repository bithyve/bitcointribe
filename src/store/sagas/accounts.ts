import { call, put, select, delay } from 'redux-saga/effects';
import { createWatcher } from '../utils/utilities';
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
} from '../actions/accounts';
import { insertIntoDB } from '../actions/storage';
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/serviceTypes';
import AsyncStorage from '@react-native-community/async-storage';

function* fetchAddrWorker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'receivingAddress'));
  const service = yield select(
    state => state.accounts[payload.serviceType].service,
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
    yield put(switchLoader(payload.serviceType, 'receivingAddress'));
  }
}

export const fetchAddrWatcher = createWatcher(fetchAddrWorker, FETCH_ADDR);

function* fetchBalanceWorker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'balances'));
  const service = yield select(
    state => state.accounts[payload.serviceType].service,
  );

  const preFetchBalances =
    payload.serviceType === SECURE_ACCOUNT
      ? service.secureHDWallet.balances
      : service.hdWallet.balances;
  const res = yield call(service.getBalance);
  const postFetchBalances = res.status === 200 ? res.data : preFetchBalances;

  if (
    res.status === 200 &&
    JSON.stringify(preFetchBalances) !== JSON.stringify(postFetchBalances)
  ) {
    yield put(balanceFetched(payload.serviceType, postFetchBalances));
    // const { SERVICES } = yield select(state => state.storage.database);
    // const updatedSERVICES = {
    //   ...SERVICES,
    //   [payload.serviceType]: JSON.stringify(service),
    // };
    // yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
    yield put(fetchTransactions(payload.serviceType, service));
  } else {
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
    : yield select(state => state.accounts[payload.serviceType].service);

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
    const { SERVICES } = yield select(state => state.storage.database);
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

function* transferST1Worker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'transfer'));
  const { recipientAddress, amount, priority } = payload.transferInfo;
  const service = yield select(
    state => state.accounts[payload.serviceType].service,
  );
  const res = yield call(
    service.transferST1,
    recipientAddress,
    amount,
    priority,
  );
  res.status === 200
    ? yield put(executedST1(payload.serviceType, res.data))
    : yield put(switchLoader(payload.serviceType, 'transfer'));
}

export const transferST1Watcher = createWatcher(
  transferST1Worker,
  TRANSFER_ST1,
);

function* transferST2Worker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'transfer'));
  const { service, transfer } = yield select(
    state => state.accounts[payload.serviceType],
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
    yield put(switchLoader(payload.serviceType, 'transfer'));
  }
}

export const transferST2Watcher = createWatcher(
  transferST2Worker,
  TRANSFER_ST2,
);

function* transferST3Worker({ payload }) {
  if (payload.serviceType !== SECURE_ACCOUNT) return;

  yield put(switchLoader(payload.serviceType, 'transfer'));
  const { token } = payload;
  const { service, transfer } = yield select(
    state => state.accounts[payload.serviceType],
  );

  const { txHex, childIndexArray } = transfer.stage2;
  if (!txHex && !childIndexArray) {
    console.log('TxHex and childindex array missing');
  }

  const res = yield call(service.transferST3, token, txHex, childIndexArray);
  if (res.status === 200) {
    yield put(executedST3(payload.serviceType, res.data.txid));
  } else {
    yield put(switchLoader(payload.serviceType, 'transfer'));
  }
}

export const transferST3Watcher = createWatcher(
  transferST3Worker,
  TRANSFER_ST3,
);

function* testcoinsWorker({ payload }) {
  yield put(switchLoader(payload.serviceType, 'testcoins'));

  const service = yield select(
    state => state.accounts[payload.serviceType].service,
  );
  const res = yield call(service.getTestcoins);
  if (res.status === 200) {
    console.log('testcoins received');
    yield delay(3000); // 3 seconds delay for letting the transaction get broadcasted in the network
    yield call(AsyncStorage.setItem, 'Received Testcoins', 'true');
    yield put(fetchBalance(payload.serviceType));
  } else console.log('Failed to get testcoins');
  yield put(switchLoader(payload.serviceType, 'testcoins'));
}

export const testcoinsWatcher = createWatcher(testcoinsWorker, GET_TESTCOINS);

function* accumulativeTxAndBalWorker() {
  const accounts = yield select(state => state.accounts);
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
