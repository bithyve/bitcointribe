import { TransactionBuilder } from "bitcoinjs-lib";
// types and action creators: dispatched by components and sagas
export const SETUP_SECUREACCOUNT =  "SETUP_SECUREACCOUNT";
export const CHECK_HEALTH = "CHECK_HEALTH";
export const IS_ACTIVE = "IS_ACTIVE";
export const SECURE_FETCH_ADDR = "FETCHSECURE_FETCH_ADDR_ADDR";
export const SECURE_FETCH_BALANCE = "SECURE_FETCH_BALANCE";
export const SECURE_FETCH_TRANSACTIONS = "SECURE_FETCH_TRANSACTIONS";
export const SECURE_TRANSFER_ST1 = "SECURE_TRANSFER_ST1";
export const SECURE_TRANSFER_ST2 = "SECURE_TRANSFER_ST2";
export const SECURE_TRANSFER_ST3 = "SECURE_TRANSFER_ST3";


export const setupSecureAccount = (serviceType) => {
    return { type: SETUP_SECUREACCOUNT, payload: {serviceType} };
  };

export const checkHealth = (serviceType)=> {
    return {type: CHECK_HEALTH, payload: {serviceType}};
};

export const isActive = (serviceType) => {
return {type:IS_ACTIVE, payload: {serviceType} };
};

export const secureFetchAddress = serviceType => {
  return { type: SECURE_FETCH_ADDR, payload: { serviceType } };
};

export const secureFetchBalance = serviceType => {
  return { type: SECURE_FETCH_BALANCE, payload: { serviceType } };
};

export const secureFetchTransactions = serviceType => {
  return { type: SECURE_FETCH_TRANSACTIONS, payload: { serviceType } };
};

export const secureTransferST1 = (
  serviceType,
  transferInfo: { recipientAddress: String; amount: Number; priority?: String }
) => {
  return { type: SECURE_TRANSFER_ST1, payload: { serviceType, transferInfo } };
};

export const secureTransferST2 = (
  serviceType,
  transferInfo: {
    inputs: Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
    }>;
    txb: TransactionBuilder;
  }
) => {
  return { type: SECURE_TRANSFER_ST2, payload: { serviceType, transferInfo } };
};

export const secureTransferST3 = (
  serviceType,
  transferInfo: {
    token: number,
    txHex: string,
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }>
  }
) => {
  return { type: SECURE_TRANSFER_ST3, payload: { serviceType, transferInfo } };
};
export const GA_TOKEN = "GA_TOKEN";

export const getToken = (token) => {
  return { type: GA_TOKEN, payload: { token } };
};



// types and action creators (saga): dispatched by saga workers
export const SECUREACCOUNT_SETUP = "SECUREACCOUNT_SETUP";
export const HEALTH_CHECK = "HEALTH_CHECK";
export const ACTIVATED = "ACTIVATED";
export const SECURE_ADDR_FETCHED = "SECURE_ADDR_FETCHED";
export const SECURE_BALANCE_FETCHED = "SECURE_BALANCE_FETCHED";
export const SECURE_TRANSACTIONS_FETCHED = "SECURE_TRANSACTIONS_FETCHED";
export const SECURE_TRANSFER_ST1_EXECUTED = "SECURE_TRANSFER_ST1_EXECUTED";
export const SECURE_TRANSFER_ST2_EXECUTED = "SECURE_TRANSFER_ST2_EXECUTED";
export const SECURE_TRANSFER_ST3_EXECUTED = "SECURE_TRANSFER_ST3_EXECUTED";

export const secureAccountSetup = (
  serviceType,
  setupData:
  {qrData: string;
  secret: string;
  bhXpub: string;}
  ) => {
    return {type: SECUREACCOUNT_SETUP, payload: {serviceType,setupData}};
  };

export const healthCheck = (
  serviceType,
  data:{isValid: boolean}
  ) => {
        return {type : HEALTH_CHECK, payload: {serviceType,data}};
  };

export const activated =(
  serviceType, 
  saStatus:{isActive: boolean}
  )=>{
  return {type: ACTIVATED, payload:{serviceType,saStatus}};
};

export const secureAddressFetched = (serviceType, address) => {
  return { type: SECURE_ADDR_FETCHED, payload: { serviceType, address } };
};

export const secureBalanceFetched = (serviceType, balances) => {
  return { type: SECURE_BALANCE_FETCHED, payload: { serviceType, balances } };
};

export const secureTransactionsFetched = (serviceType, transactions) => {
  return { type: SECURE_TRANSACTIONS_FETCHED, payload: { serviceType, transactions } };
};

export const secureExecutedST1 = (serviceType, stage1) => {
  return { type: SECURE_TRANSFER_ST1_EXECUTED, payload: { serviceType, stage1 } };
};

export const secureExecutedST2 = (serviceType, stage2) => {
  return { type: SECURE_TRANSFER_ST2_EXECUTED, payload: { serviceType, stage2 } };
};

export const secureExecutedST3 = (serviceType, txid) => {
  return { type: SECURE_TRANSFER_ST3_EXECUTED, payload: { serviceType, txid } };
};