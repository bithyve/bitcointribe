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
  executedST2,
  GET_TESTCOINS,
  fetchBalance
} from "../actions/accounts";
import { Services } from "../../common/interfaces/Interfaces";
import { insertIntoDB } from "../actions/storage";

function* fetchAddrWorker({ payload }) {
  yield put(switchLoader(payload.serviceType, "address"));
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(services[payload.serviceType].getAddress);
  res.status === 200
    ? yield put(addressFetched(payload.serviceType, res.data.address))
    : yield put(switchLoader(payload.serviceType, "address"));
}

export const fetchAddrWatcher = createWatcher(fetchAddrWorker, FETCH_ADDR);

function* fetchBalanceWorker({ payload }) {
  yield put(switchLoader(payload.serviceType, "balances"));
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(services[payload.serviceType].getBalance);
  if (res.status === 200) {
    yield put(balanceFetched(payload.serviceType, res.data));
    yield put(
      insertIntoDB({
        [payload.serviceType]: JSON.stringify(services[payload.serviceType])
      })
    );
  } else {
    yield put(switchLoader(payload.serviceType, "balances"));
  }
}

export const fetchBalanceWatcher = createWatcher(
  fetchBalanceWorker,
  FETCH_BALANCE
);

function* fetchTransactionsWorker({ payload }) {
  yield put(switchLoader(payload.serviceType, "transactions"));
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(services[payload.serviceType].getTransactions);
  res.status === 200
    ? yield put(transactionsFetched(payload.serviceType, res.data.transactions))
    : yield put(switchLoader(payload.serviceType, "transactions"));
}

export const fetchTransactionsWatcher = createWatcher(
  fetchTransactionsWorker,
  FETCH_TRANSACTIONS
);

function* transferST1Worker({ payload }) {
  yield put(switchLoader(payload.serviceType, "transfer"));
  const { recipientAddress, amount, priority } = payload.transferInfo;
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(
    services[payload.serviceType].transferST1,
    recipientAddress,
    amount,
    priority
  );
  res.status === 200
    ? yield put(executedST1(payload.serviceType, res.data))
    : yield put(switchLoader(payload.serviceType, "transfer"));
}

export const transferST1Watcher = createWatcher(
  transferST1Worker,
  TRANSFER_ST1
);

function* transferST2Worker({ payload }) {
  yield put(switchLoader(payload.serviceType, "transfer"));
  const { inputs, txb } = payload.transferInfo;
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(
    services[payload.serviceType].transferST2,
    inputs,
    txb
  );
  res.status === 200
    ? yield put(executedST2(payload.serviceType, res.data.txid))
    : yield put(switchLoader(payload.serviceType, "transfer"));
}

export const transferST2Watcher = createWatcher(
  transferST2Worker,
  TRANSFER_ST2
);

function* testcoinsWorker({ payload }) {
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(services[payload.serviceType].getTestcoins);
  console.log({ res });
  res.status === 200 ? yield put(fetchBalance(payload.serviceType)) : null;
}

export const testcoinsWatcher = createWatcher(testcoinsWorker, GET_TESTCOINS);
