import {
  ACCOUNT_SYNC_CLEAR, ACCOUNT_SYNC_FAIL,
  ACCOUNT_SYNC_SUCCESS, CLEAR_FBTC_VOUCHER, CLEAR_ORDER_DETAILS, CLEAR_QUOTE_DETAILS, EXECUTE_ORDER_FAIL,
  EXECUTE_ORDER_SUCCESS, FBTC_VOUCHER, GET_BALANCES_FAIL,
  GET_BALANCES_SUCCESS, GET_QUOTE_FAIL,
  GET_QUOTE_SUCCESS, STORE_FBTC_ACC_DATA
} from '../actions/fbtc'

const INITIAL_STATE = {
  accountSyncRequest: false,
  accountSyncDetails: null,
  getQuoteRequest: false,
  getQuoteDetails: null,
  executeOrderRequest: false,
  executeOrderDetails: null,
  getBalancesRequest: false,
  getBalancesDetails: null,
  accountSyncFail: false,
  accountSyncFailMessage: null,
  getQuoteFail: false,
  getQuoteFailMessage: null,
  executeOrderFail: false,
  executeOrderFailMessage: null,
  FBTCAccountData: null,
  FBTCVoucher: null,
}

const reducer = ( state = INITIAL_STATE, action ) => {
  //const { payload } = action;
  switch ( action.type ) {
      case ACCOUNT_SYNC_FAIL:
        return {
          ...state,
          accountSyncRequest: false,
          accountSyncFail: action.payload.data.accountSyncFail,
          accountSyncFailMessage: action.payload.data.accountSyncFailMessage,
        }
      case ACCOUNT_SYNC_SUCCESS:
        return {
          ...state,
          accountSyncRequest: false,
          accountSyncDetails: action.payload.accountSyncDetails,
        }
      case ACCOUNT_SYNC_CLEAR:
        return {
          ...state,
          accountSyncRequest: false,
          accountSyncDetails: null,
        }
      case GET_QUOTE_FAIL:
        return {
          ...state,
          getQuoteRequest: false,
          getQuoteDetails: null,
          getQuoteFail: action.payload.data.getQuoteFail,
          getQuoteFailMessage: action.payload.data.getQuoteFailMessage,
        }
      case GET_QUOTE_SUCCESS:
        return {
          ...state,
          getQuoteRequest: false,
          getQuoteDetails: action.payload.getQuoteDetails,
        }
      case CLEAR_QUOTE_DETAILS:
        return {
          ...state,
          getQuoteRequest: false,
          getQuoteDetails: null,
        }
      case EXECUTE_ORDER_FAIL:
        return {
          ...state,
          executeOrderRequest: false,
          getQuoteDetails: null,
          executeOrderDetails: null,
          executeOrderFail: action.payload.data.executeOrderFail,
          executeOrderFailMessage: action.payload.data.executeOrderFailMessage,
        }
      case EXECUTE_ORDER_SUCCESS:
        return {
          ...state,
          executeOrderRequest: false,
          executeOrderDetails: action.payload.executeOrderDetails,
        }
      case CLEAR_ORDER_DETAILS:
        return {
          ...state,
          executeOrderRequest: false,
          executeOrderDetails: null,
        }
      case GET_BALANCES_FAIL:
        return {
          ...state,
          getBalancesRequest: false,
        }
      case GET_BALANCES_SUCCESS:
        return {
          ...state,
          getBalancesRequest: false,
          getBalancesDetails: action.payload.getBalancesDetails,
        }
      case STORE_FBTC_ACC_DATA:
        return {
          ...state,
          FBTCAccountData: action.payload.FBTCAccountData,
        }
      case FBTC_VOUCHER:
        return {
          ...state,
          FBTCVoucher: action.payload.FBTCVoucher,
        }
      case CLEAR_FBTC_VOUCHER:
        return {
          ...state,
          FBTCVoucher: null,
        }
      default:
        return state
  }
}
export default reducer
