// types and action creators: dispatched by components and sagas
export const SETUP_SECUREACCOUNT =  "SETUP_SECUREACCOUNT";
export const CHECK_HEALTH = "CHECK_HEALTH";
export const IS_ACTIVE = "IS_ACTIVE";
export const SECURE_FETCH_ADDR = "FETCHSECURE_FETCH_ADDR_ADDR";
export const SECURE_FETCH_BALANCE = "SECURE_FETCH_BALANCE";
export const SECURE_FETCH_TRANSACTIONS = "SECURE_FETCH_TRANSACTIONS";

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

// types and action creators (saga): dispatched by saga workers
export const SECUREACCOUNT_SETUP = "SECUREACCOUNT_SETUP";
export const HEALTH_CHECK = "HEALTH_CHECK";
export const ACTIVATED = "ACTIVATED";
export const SECURE_ADDR_FETCHED = "SECURE_ADDR_FETCHED";
export const SECURE_BALANCE_FETCHED = "SECURE_BALANCE_FETCHED";
export const SECURE_TRANSACTIONS_FETCHED = "SECURE_TRANSACTIONS_FETCHED";

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