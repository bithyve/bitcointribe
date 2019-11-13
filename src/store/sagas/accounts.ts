import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
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
  executedST2
} from "../actions/accounts";
import { Services } from "../../common/interfaces/Interfaces";

function* fetchAddrWorker({ payload }) {
  yield put(switchLoader(payload.accountType, "address"));
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(services[payload.accountType].getAddress);
  res.status === 200
    ? yield put(addressFetched(payload.accountType, res.data.address))
    : yield put(switchLoader(payload.accountType, "address"));
}

export const fetchAddrWatcher = createWatcher(fetchAddrWorker, FETCH_ADDR);

function* fetchBalanceWorker({ payload }) {
  yield put(switchLoader(payload.accountType, "balances"));
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(services[payload.accountType].getBalance);
  res.status === 200
    ? yield put(balanceFetched(payload.accountType, res.data))
    : yield put(switchLoader(payload.accountType, "balances"));
}

export const fetchBalanceWatcher = createWatcher(
  fetchBalanceWorker,
  FETCH_BALANCE
);

function* fetchTransactionsWorker({ payload }) {
  yield put(switchLoader(payload.accountType, "transactions"));
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(services[payload.accountType].getTransactions);
  res.status === 200
    ? yield put(transactionsFetched(payload.accountType, res.data.transactions))
    : yield put(switchLoader(payload.accountType, "transactions"));
}

export const fetchTransactionsWatcher = createWatcher(
  fetchTransactionsWorker,
  FETCH_TRANSACTIONS
);

function* transferST1Worker({ payload }) {
  yield put(switchLoader(payload.accountType, "transfer"));
  const { recipientAddress, amount, priority } = payload.transferInfo;
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(
    services[payload.accountType].transferST1,
    recipientAddress,
    amount,
    priority
  );
  res.status === 200
    ? yield put(executedST1(payload.accountType, res.data))
    : yield put(switchLoader(payload.accountType, "transfer"));
}

export const transferST1Watcher = createWatcher(
  transferST1Worker,
  TRANSFER_ST1
);

function* transferST2Worker({ payload }) {
  yield put(switchLoader(payload.accountType, "transfer"));
  const { inputs, txb } = payload.transferInfo;
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(
    services[payload.accountType].transferST2,
    inputs,
    txb
  );
  res.status === 200
    ? yield put(executedST2(payload.accountType, res.data.txid))
    : yield put(switchLoader(payload.accountType, "transfer"));
}

export const transferST2Watcher = createWatcher(
  transferST2Worker,
  TRANSFER_ST2
);
