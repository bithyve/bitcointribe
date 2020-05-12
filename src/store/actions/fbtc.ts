export const ACCOUNT_SYNC = 'ACCOUNT_SYNC';
export const ACCOUNT_SYNC_FAIL = 'ACCOUNT_SYNC_FAIL';
export const ACCOUNT_SYNC_SUCCESS = 'ACCOUNT_SYNC_SUCCESS';

export const GET_QUOTE = 'GET_QUOTE';
export const GET_QUOTE_FAIL = 'GET_QUOTE_FAIL';
export const GET_QUOTE_SUCCESS = 'GET_QUOTE_SUCCESS';

export const EXECUTE_ORDER = 'EXECUTE_ORDER';
export const EXECUTE_ORDER_FAIL = 'EXECUTE_ORDER_FAIL';
export const EXECUTE_ORDER_SUCCESS = 'EXECUTE_ORDER_SUCCESS';

export const GET_BALANCES = 'GET_BALANCES';
export const GET_BALANCES_FAIL = 'GET_BALANCES_FAIL';
export const GET_BALANCES_SUCCESS = 'GET_BALANCES_SUCCESS';

export const accountSync = (data) => {
  return {
    type: ACCOUNT_SYNC,
    payload: { data },
  };
};

export const accountSyncSuccess = (data) => {
  return {
    type: ACCOUNT_SYNC_SUCCESS,
    payload: {
      accountSyncDetails: data,
    },
  };
};

export const accountSyncFail = () => {
  return {
    type: ACCOUNT_SYNC_FAIL,
    payload: {
      accountSyncDetails: null,
    },
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
    payload: {
      getQuoteDetails: data,
    },
  };
}

export const getQuoteFail = () => {
  return {
    type: GET_QUOTE_FAIL,
    payload: {
      getQuoteDetails: null,
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

export const executeOrderSuccess = (data) => {
  return {
    type: EXECUTE_ORDER_SUCCESS,
    payload: {
      executeOrderDetails: data,
    },
  };
};

export const executeOrderFail = () => {
  return {
    type: EXECUTE_ORDER_FAIL,
    payload: {
      executeOrderDetails: null,
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
