import { call, put } from 'redux-saga/effects'

import {
  accountSyncFail, accountSyncSuccess, ACCOUNT_SYNC, executeOrderFail, executeOrderSuccess, EXECUTE_ORDER, getBalancesFail, getBalancesSuccess, getQuoteFail, getQuoteSuccess, GET_BALANCES, GET_QUOTE
} from '../actions/fbtc'

import { accountSync, executeOrder, getQuote } from '../../services/fbtc'

import { createWatcher } from '../utils/utilities'

export function* accountSyncWorker( { payload } ) {
  try{
    const result = yield call( accountSync, payload.data )
    //   let result = {
    //     "data":{
    //     "redeem_vouchers": true,
    //       "exchange_balances": true,
    //       "sell_bitcoins": true
    //     }
    // }
    if ( !result || result.status !== 200 ) {
      const data={
        accountSyncFail: true,
        accountSyncFailMessage: 'Account sync fail'
      }
      yield put( accountSyncFail( data ) )
    } else {
      //   // the return type is not json in this instance and
      //   // has a trailing comma.
      //   // probably a bug but for now will use a simple method to parse it
      //   // this can be removed once this is verified by fast Bitcoins
      if ( typeof result.data == 'string' ) {
        result.data = string2Json( result.data )
      }
      yield put( accountSyncSuccess( result.data ) )
      if( result.error ){
        const data={
          accountSyncFail: true,
          accountSyncFailMessage: result.message ? result.message : 'The wallet account does not exist'
        }
        yield put( accountSyncFail( data ) )
      }
    }
  }
  catch( err ){
    const data={
      accountSyncFail: true,
      accountSyncFailMessage: 'Account sync fail'
    }
    yield put( accountSyncFail( data ) )
  }
}

export const accountSyncWatcher = createWatcher(
  accountSyncWorker,
  ACCOUNT_SYNC,
)

function* getQuoteWorker( { payload } ) {
  try{
    const result = yield call( getQuote, payload.data )
    result.status = 200
    if ( !result || result.status !== 200 ) {
      const data={
        getQuoteFail: true,
        getQuoteFailMessage: 'Get Quote fail'
      }
      yield put( getQuoteFail( data ) )
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
      if( result.data )
        yield put( getQuoteSuccess( result.data ) )
      if( result.error ){
        const data={
          getQuoteFail: true,
          getQuoteFailMessage: result.message ? result.message : 'Invalid voucher code'
        }
        yield put( getQuoteFail( data ) )
      }
    }
  }
  catch( err ){
    const data={
      getQuoteFail: true,
      getQuoteFailMessage: 'Get Quote fail'
    }
    yield put( getQuoteFail( data ) )
  }
}

export const getQuoteWatcher = createWatcher( getQuoteWorker, GET_QUOTE )

export function* executeOrderWorker( { payload } ) {
  try{
    const result = yield call( executeOrder, payload.data )
    if ( !result || result.status !== 200 ) {
      const data={
        executeOrderFail: true,
        executeOrderFailMessage: 'Order execution fail'
      }
      yield put( executeOrderFail( data ) )
    } else {
      // let result = {
      //   'data': {
      //     "quote_token": "qwertyu",
      //     "estimated_delivery": 1586698948,
      //     "login_required": false
      //   }
      // }
      yield put( executeOrderSuccess( result.data ) )
      if( result.error ){
        const data={
          executeOrderFail: true,
          executeOrderFailMessage: result.message ? result.message : 'Order execution fail'
        }
        yield put( executeOrderFail( data ) )
      }
    }
  }
  catch( err ){
    const data={
      executeOrderFail: true,
      executeOrderFailMessage: 'Order execution fail'
    }
    yield put( executeOrderFail( data ) )
  }
}

export const executeOrderWatcher = createWatcher(
  executeOrderWorker,
  EXECUTE_ORDER,
)

export function* getBalancesWorker( { payload } ) {
  const result = yield call( fbcApiService, 'getBalances', payload )
  if ( !result || result.status !== 200 ) {
    yield put( getBalancesFail() )
  } else {
    yield put( getBalancesSuccess( result.data ) )
  }
}

export const getBalancesWatcher = createWatcher(
  executeOrderWatcher,
  GET_BALANCES,
)

// temperory utility function may be removed later

const string2Json = ( string ) => {
  if ( !string ) {
    return null
  }
  const json = {
  }

  string = string.replace( '}', '' ).replace( '{', '' )
  string = string.split( ',' ).filter( ( a ) => a && a.trim() )

  for ( const i of string ) {
    const x = i.split( ':' ).map( ( a ) => a.replace( /\"/g, '' ).trim() )
    if ( x[ 1 ] == 'true' || x[ 1 ] == 'false' ) {
      x[ 1 ] = x[ 1 ] === 'true'
    }
    json[ x[ 0 ] ] = x[ 1 ]
  }
  return json
}
