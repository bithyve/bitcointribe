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

import fbcApiService from "../../services/fbtc";


export function* accountSyncSaga({ params }) {
	const result = yield call(fbcApiService, 'accountSync', params);
	if (!result || result.status !== 200) {
		yield put(accountSyncFail());
	} else {
		if (typeof(result.data) == "string") {
			result.data = string2Json(result.data)
		}
		yield put(accountSyncSuccess(result.data));
	}
}

export function* getQuoteSaga({ params }) {
	const result = yield call(fbcApiService, 'getQuote', params);
	if (!result || result.status !== 200) {
		yield put(getQuoteFail());
	} else {
		yield put(getQuoteSuccess(result.data));
	}
}

export function* executeOrderSaga({ params }) {
	const result = yield call(fbcApiService, 'executeOrder', params);
	if (!result || result.status !== 200) {
		yield put(executeOrderFail());
	} else {
		yield put(executeOrderSuccess(result.data));
	}
}

export function* getBalancesSaga({ params }) {
	const result = yield call(fbcApiService, 'getBalances', params);
	if (!result || result.status !== 200) {
		yield put(getBalancesFail());
	} else {
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


// temperory utility functiom

const string2Json = (string) => {
	console.log(' I am being used!!!!!')
	if (!string) {
		return null;
	}
	let json = {};

	string = string.replace("}", "").replace("{", "");
	string = string.split(",").filter(a => a && a.trim());

	for (let i of string) {
		let x = i.split(":").map(a => a.replace(/\"/g, "").trim())
		if (x[1] == "true" || x[1] == "false") {
			x[1] = (x[1] === "true");
		}
		json[x[0]] = x[1]
	}
	return json;
}