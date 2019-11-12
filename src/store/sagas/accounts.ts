import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import {
  FETCH_ADDR,
  addressFetched,
  FETCH_BALANCE,
  balanceFetched,
  FETCH_TRANSACTIONS,
  transactionsFetched
} from "../actions/accounts";
import { Services } from "../../common/interfaces/Interfaces";

function* fetchAddrWorker({ payload }) {
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(services[payload.accountType].getAddress);
  res.status === 200
    ? yield put(addressFetched(payload.accountType, res.data.address))
    : null;
}

export const fetchAddrWatcher = createWatcher(fetchAddrWorker, FETCH_ADDR);

function* fetchBalanceWorker({ payload }) {
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(services[payload.accountType].getBalance);
  res.status === 200
    ? yield put(balanceFetched(payload.accountType, res.data))
    : null;
}

export const fetchBalanceWatcher = createWatcher(
  fetchBalanceWorker,
  FETCH_BALANCE
);

function* fetchTransactionsWorker({ payload }) {
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(services[payload.accountType].getTransactions);
  res.status === 200
    ? yield put(transactionsFetched(payload.accountType, res.data.transactions))
    : null;
}

export const fetchTransactionsWatcher = createWatcher(
  fetchTransactionsWorker,
  FETCH_TRANSACTIONS
);
