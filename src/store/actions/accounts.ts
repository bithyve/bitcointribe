// types and action creators: dispatched by components and sagas
export const FETCH_ADDR = "FETCH_ADDR";
export const FETCH_BALANCE = "FETCH_BALANCE";
export const FETCH_TRANSACTIONS = "FETCH_TRANSACTIONS";
export const TRANSFER_ST1 = "TRANSFER_ST1";
export const TRANSFER_ST2 = "TRANSFER_ST2";

export const LOADING = "LOADING";

export const fetchAddress = accountType => {
  return { type: FETCH_ADDR, payload: { accountType } };
};

export const fetchBalance = accountType => {
  return { type: FETCH_BALANCE, payload: { accountType } };
};

export const fetchTransactions = accountType => {
  return { type: FETCH_TRANSACTIONS, payload: { accountType } };
};

export const transferST1 = (
  accountType,
  transferInfo: { recipientAddress: String; amount: Number; priority?: String }
) => {
  return { type: TRANSFER_ST1, payload: { accountType, transferInfo } };
};

export const activateLoader = (accountType, beingLoaded) => {
  return { type: LOADING, payload: { accountType, beingLoaded } };
};

// types and action creators (saga): dispatched by saga workers
export const ADDR_FETCHED = "ADDR_FETCHED";
export const BALANCE_FETCHED = "BALANCE_FETCHED";
export const TRANSACTIONS_FETCHED = "TRANSACTIONS_FETCHED";
export const TRANSFER_ST1_EXECUTED = "TRANSFER_ST1_EXECUTED";

export const addressFetched = (accountType, address) => {
  return { type: ADDR_FETCHED, payload: { accountType, address } };
};

export const balanceFetched = (accountType, balances) => {
  return { type: BALANCE_FETCHED, payload: { accountType, balances } };
};

export const transactionsFetched = (accountType, transactions) => {
  return { type: TRANSACTIONS_FETCHED, payload: { accountType, transactions } };
};

export const executedST1 = (accountType, dataST1) => {
  return { type: TRANSFER_ST1_EXECUTED, payload: { accountType, dataST1 } };
};
