import { TransactionBuilder } from "bitcoinjs-lib";

// types and action creators: dispatched by components and sagas
export const FETCH_ADDR = "FETCH_ADDR";
export const FETCH_BALANCE = "FETCH_BALANCE";
export const FETCH_TRANSACTIONS = "FETCH_TRANSACTIONS";
export const TRANSFER_ST1 = "TRANSFER_ST1";
export const TRANSFER_ST2 = "TRANSFER_ST2";
export const TRANSFER_ST3 = "TRANSFER_ST3";
export const GET_TESTCOINS = "GET_TESTCOINS";
export const CLEAR_TRANSFER = "CLEAR_TRANSFER";
export const LOADING = "LOADING";

export const fetchAddress = serviceType => {
  return { type: FETCH_ADDR, payload: { serviceType } };
};

export const fetchBalance = serviceType => {
  return { type: FETCH_BALANCE, payload: { serviceType } };
};

export const fetchTransactions = serviceType => {
  return { type: FETCH_TRANSACTIONS, payload: { serviceType } };
};

export const transferST1 = (serviceType, transferInfo) => {
  return { type: TRANSFER_ST1, payload: { serviceType, transferInfo } };
};

export const transferST2 = (serviceType, transferInfo) => {
  return { type: TRANSFER_ST2, payload: { serviceType, transferInfo } };
};

export const transferST3 = (serviceType, transferInfo) => {
  //Secure account specific
  return { type: TRANSFER_ST3, payload: { serviceType, transferInfo } };
};

export const getTestcoins = serviceType => {
  // Test account specific
  return { type: GET_TESTCOINS, payload: { serviceType } };
};

export const clearTransfer = serviceType => {
  return { type: CLEAR_TRANSFER, payload: { serviceType } };
};

export const switchLoader = (serviceType, beingLoaded) => {
  return { type: LOADING, payload: { serviceType, beingLoaded } };
};

// types and action creators (saga): dispatched by saga workers
export const ADDR_FETCHED = "ADDR_FETCHED";
export const BALANCE_FETCHED = "BALANCE_FETCHED";
export const TRANSACTIONS_FETCHED = "TRANSACTIONS_FETCHED";
export const TRANSFER_ST1_EXECUTED = "TRANSFER_ST1_EXECUTED";
export const TRANSFER_ST2_EXECUTED = "TRANSFER_ST2_EXECUTED";
export const TRANSFER_ST3_EXECUTED = "TRANSFER_SECURE_ST3_EXECUTED";

export const addressFetched = (serviceType, address) => {
  return { type: ADDR_FETCHED, payload: { serviceType, address } };
};

export const balanceFetched = (serviceType, balances) => {
  return { type: BALANCE_FETCHED, payload: { serviceType, balances } };
};

export const transactionsFetched = (serviceType, transactions) => {
  return { type: TRANSACTIONS_FETCHED, payload: { serviceType, transactions } };
};

export const executedST1 = (serviceType, stage1) => {
  return { type: TRANSFER_ST1_EXECUTED, payload: { serviceType, stage1 } };
};

export const executedST2 = (serviceType, txid) => {
  return { type: TRANSFER_ST2_EXECUTED, payload: { serviceType, txid } };
};

export const executedST3 = (serviceType, txid) => {
  // Secure account specific
  return { type: TRANSFER_ST3_EXECUTED, payload: { serviceType, txid } };
};
