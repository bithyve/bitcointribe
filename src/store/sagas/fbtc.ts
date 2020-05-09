import { all, call, takeLatest, put } from "redux-saga/effects"
import * as types from "../actions/fbtc"

import {
	accountSyncSuccess,
	accountSyncFail,
	getQuoteSuccess,
	getQuoteFail,
	executeOrderSuccess,
	executeOrderFail,
	getBalancesSuccess,
	getBalancesFail	
} from "../actions/fbtc"

import fbcApiService from "../../services/fbc_api.tsx";
import stringToJson from "../../utils/string_to_json.tsx"


export function* accountSyncSaga({ params }) {
	const result = yield call(fbcApiService, 'accountSync', params);
	if (!result || result.status !== 200) {
		yield put(accountSyncFail());
	} else {
		console.log("1Result", result)
		if (typeof(result.data) == "string") {
			result.data = stringToJson(result.data)
		}
		yield put(accountSyncSuccess(result.data));
	}
}

export function* getQuoteSaga({ params }) {
	const result = yield call(fbcApiService, 'getQuote', params);
	console.log("RESULT", result)
	if (!result || result.status !== 200) {
		yield put(getQuoteFail());
	} else {
		console.log("2Result", result)
		yield put(getQuoteSuccess(result.data));
	}
}

export function* executeOrderSaga({ params }) {
	const result = yield call(fbcApiService, 'executeOrder', params);
	if (!result || result.status !== 200) {
		yield put(executeOrderFail());
	} else {
		console.log('3RESULT', result)
		yield put(executeOrderSuccess(result.data));
	}
}

export function* getBalancesSaga({ params }) {
	const result = yield call(fbcApiService, 'getBalances', params);
	if (!result || result.status !== 200) {
		yield put(getBalancesFail());
	} else {
		console.log("4RESULT", result.data)
		yield put(getBalancesSuccess(result.data));
	}
}

export default function* rootSaga() {
	yield all([
		takeLatest(types.ACCOUNT_SYNC, accountSyncSaga),
		takeLatest(types.GET_QUOTE, getQuoteSaga),
		takeLatest(types.EXECUTE_ORDER, executeOrderSaga),
		takeLatest(types.GET_BALANCES, getBalancesSaga)
	])
}