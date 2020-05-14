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

import { accountSync, getQuote, executeOrder } from '../../services/fbtc';

import { createWatcher } from '../utils/utilities';

export function* accountSyncWorker({ payload }) {
  console.log("payload",payload.data)
  let result = yield call(accountSync, payload.data);
//   let result = {
//     "data":{
//     "redeem_vouchers": true,
//       "exchange_balances": true,
//       "sell_bitcoins": true
//     }
// }
console.log("result", result);
  if (!result || result.status !== 200) {
    let data={
      accountSyncFail: true,
      accountSyncFailMessage: 'Account sync fail'
    }
    yield put(accountSyncFail(data));
  } else {
  //   // the return type is not json in this instance and
  //   // has a trailing comma.
  //   // probably a bug but for now will use a simple method to parse it
  //   // this can be removed once this is verified by fast Bitcoins
  //   console.log("result.data", result.data);
    if (typeof result.data == 'string') {
      result.data = string2Json(result.data);
    }
    yield put(accountSyncSuccess(result.data));
    if(result.error){
      let data={
        accountSyncFail: true,
        accountSyncFailMessage: result.message ? result.message : 'The wallet account does not exist'
      }
      yield put(accountSyncFail(data));
    }
  }
}

export const accountSyncWatcher = createWatcher(
  accountSyncWorker,
  ACCOUNT_SYNC,
);

function* getQuoteWorker({ payload }) {
  console.log('payload.data', payload.data);
  const result = yield call(getQuote, payload.data);
  result.status = 200;
  console.log('result getQuoteWorker', result);
  if (!result || result.status !== 200) {
    let data={
      getQuoteFail: true,
      getQuoteFailMessage: 'Get Quote fail'
    }
    yield put(getQuoteFail(data));
  } else {
  //  let result = {
  //    "data":{
  //     amount: 100,
  //     bitcoin_amount: 1234567890,
  //     commission_amount: 100,
  //     commission_rate: 2,
  //     currency: 'USD',
  //     exchange_rate: 100,
  //     expiry_time: 1586698948,
  //     quote_token: 'qwertyu',
  //     verified_account_required: false,
  //   }
  // }
  if(result.data)
    yield put(getQuoteSuccess(result.data));
  if(result.error){
      let data={
        getQuoteFail: true,
       getQuoteFailMessage: result.message ? result.message : 'Invalid voucher code'
      }
      yield put(getQuoteFail(data));
    }
  }
}

export const getQuoteWatcher = createWatcher(getQuoteWorker, GET_QUOTE);

export function* executeOrderWorker({ payload }) {
  const result = yield call(executeOrder, payload.data);
  if (!result || result.status !== 200) {
    let data={
      executeOrderFail: true,
      executeOrderFailMessage: 'Order execution fail'
    }
    yield put(executeOrderFail(data));
  } else {
  // let result = {
  //   'data': {
  //     "quote_token": "qwertyu",
  //     "estimated_delivery": 1586698948,
  //     "login_required": false
  //   }
  // }
     yield put(executeOrderSuccess(result.data));
     if(result.error){
      let data={
        executeOrderFail: true,
        executeOrderFailMessage: result.message ? result.message : 'Order execution fail'
      }
      yield put(executeOrderFail(data));
    }
   }
  
}

export const executeOrderWatcher = createWatcher(
  executeOrderWorker,
  EXECUTE_ORDER,
);

export function* getBalancesWorker({ payload }) {
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
