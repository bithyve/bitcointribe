import { call, put } from 'redux-saga/effects';

import {
  accountSyncSuccess,
  accountSyncFail,
  getQuoteSuccess,
  getQuoteFail,
  executeOrderSuccess,
  executeOrderFail,
  getBalancesSuccess,
  getBalancesFail,
  ACCOUNT_SYNC,
  GET_QUOTE,
  EXECUTE_ORDER,
  GET_BALANCES,
} from '../actions/fbtc';

import fbcApiService from '../../services/fbtc';

import { createWatcher } from '../utils/utilities';

function* accountSyncWorker({ payload }) {
  const result = yield call(fbcApiService, 'accountSync', payload);
  if (!result || result.status !== 200) {
    yield put(accountSyncFail());
  } else {
    // the return type is not json in this instance and
    // has a trailing comma.
    // probably a bug but for now will use a simple method to parse it
    // this can be removed once this is verified by fast Bitcoins
    if (typeof result.data == 'string') {
      result.data = string2Json(result.data);
    }
    yield put(accountSyncSuccess(result.data));
  }
}

export const accountSyncWatcher = createWatcher(
  accountSyncWorker,
  ACCOUNT_SYNC,
);

function* getQuoteWorker({ params }) {
  const result = yield call(fbcApiService, 'getQuote', params);
  if (!result || result.status !== 200) {
    yield put(getQuoteFail());
  } else {
    yield put(getQuoteSuccess(result.data));
  }
}

export const getQuoteWatcher = createWatcher(getQuoteWorker, GET_QUOTE);

function* executeOrderWorker({ payload }) {
  const result = yield call(fbcApiService, 'executeOrder', payload);
  if (!result || result.status !== 200) {
    yield put(executeOrderFail());
  } else {
    yield put(executeOrderSuccess(result.data));
  }
}

export const executeOrderWatcher = createWatcher(
  executeOrderWorker,
  EXECUTE_ORDER,
);

function* getBalancesWorker({ payload }) {
  const result = yield call(fbcApiService, 'getBalances', payload);
  if (!result || result.status !== 200) {
    yield put(getBalancesFail());
  } else {
    yield put(getBalancesSuccess(result.data));
  }
}

export const getBalancesWatcher = createWatcher(
  executeOrderWatcher,
  GET_BALANCES,
);

// temperory utility function may be removed later

const string2Json = (string) => {
  console.log(' I am being used!!!!!');
  if (!string) {
    return null;
  }
  let json = {};

  string = string.replace('}', '').replace('{', '');
  string = string.split(',').filter((a) => a && a.trim());

  for (let i of string) {
    let x = i.split(':').map((a) => a.replace(/\"/g, '').trim());
    if (x[1] == 'true' || x[1] == 'false') {
      x[1] = x[1] === 'true';
    }
    json[x[0]] = x[1];
  }
  return json;
};
