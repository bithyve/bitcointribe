export const ACCOUNT_SYNC = 'ACCOUNT_SYNC';
export const ACCOUNT_SYNC_FAIL = 'ACCOUNT_SYNC_FAIL';
export const ACCOUNT_SYNC_SUCCESS = 'ACCOUNT_SYNC_SUCCESS';
export const ACCOUNT_SYNC_COMPLETED = 'ACCOUNT_SYNC_CLEAR';

export const GET_QUOTE = 'GET_QUOTE';
export const GET_QUOTE_FAIL = 'GET_QUOTE_FAIL';
export const GET_QUOTE_SUCCESS = 'GET_QUOTE_SUCCESS';
export const CLEAR_QUOTE_DETAILS = 'CLEAR_QUOTE_DETAILS';

export const EXECUTE_ORDER = 'EXECUTE_ORDER';
export const EXECUTE_ORDER_FAIL = 'EXECUTE_ORDER_FAIL';
export const EXECUTE_ORDER_SUCCESS = 'EXECUTE_ORDER_SUCCESS';
export const CLEAR_ORDER_DETAILS = 'CLEAR_ORDER_DETAILS';

export const GET_BALANCES = 'GET_BALANCES';
export const GET_BALANCES_FAIL = 'GET_BALANCES_FAIL';
export const GET_BALANCES_SUCCESS = 'GET_BALANCES_SUCCESS';

export const STORE_FBTC_ACC_DATA = 'STORE_FBTC_ACC_DATA';
export const FBTC_VOUCHER = 'FBTC_VOUCHER';
export const CLEAR_FBTC_VOUCHER = 'CLEAR_FBTC_VOUCHER';

export const accountSync = (data) => {
  return {
    type: ACCOUNT_SYNC,
    payload: { data },
  };
};

export const ClearAccountSyncData = () => {
  return { type: ACCOUNT_SYNC_CLEAR };
};

export const accountSyncSuccess = data => {
  return {
    type: ACCOUNT_SYNC_SUCCESS,
    payload: { accountSyncDetails: data },
  };
};

export const accountSyncFail = (data) => {
  console.log("Account sync fail", data);
  return {type: ACCOUNT_SYNC_FAIL,
    payload: { data }
  };
};

export function getQuote(data) {
  console.log('data getQuote', data);
  return {
    type: GET_QUOTE,
    payload: { data },
  };
}

export function getQuoteSuccess(data) {
  return {
    type: GET_QUOTE_SUCCESS,
    payload: { getQuoteDetails: data },
  };
};

export function ClearQuoteDetails() {
  return {
    type: CLEAR_QUOTE_DETAILS,
    payload: { getQuoteDetails: null },
  };
};

export const getQuoteFail = (data) => {
  return {
    type: GET_QUOTE_FAIL,
    payload: {
      getQuoteDetails: null,
      data
    },
  };
};

export const executeOrder = (data) => {
  console.log('data getQuote', data);
  return {
    type: EXECUTE_ORDER,
    payload: { data },
  };
};

export const ClearOrderDetails = () => {
  return {
    type: CLEAR_ORDER_DETAILS,
  };
};

export const executeOrderSuccess = (data) => {
  return {
    type: EXECUTE_ORDER_SUCCESS,
    payload: {
      executeOrderDetails: data,
    },
  };
};

export const executeOrderFail = (data) => {
  return {
    type: EXECUTE_ORDER_FAIL,
    payload: {
      executeOrderDetails: null,
      data
    },
  };
};

export const getBalancesSuccess = (data) => {
  return {
    type: GET_BALANCES_SUCCESS,
    payload: {
      getBalancesDetails: data,
    },
  };
};

export const getBalancesFail = () => {
  return {
    type: GET_BALANCES_FAIL,
    payload: {
      getBalancesDetails: null,
    },
  };
};

export const storeFbtcData = (FBTCAccount) => {
  //console.log('INSIDE Action FBTC',FBTCAccount)
  return {
    type: STORE_FBTC_ACC_DATA,
    payload: {
      FBTCAccountData: FBTCAccount
    },
  };
};

export const storeFbtcVoucher = (voucher) => {
  //console.log('INSIDE Action storeFbtcVoucher',voucher)
  return {
    type: FBTC_VOUCHER,
    payload: {
      FBTCVoucher: voucher
    },
  };
};

export const clearFbtcVoucher = () => {
  return {
    type: CLEAR_FBTC_VOUCHER,
    payload: {
      FBTCVoucher: null
    },
  };
};
