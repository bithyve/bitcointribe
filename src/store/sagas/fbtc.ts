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
