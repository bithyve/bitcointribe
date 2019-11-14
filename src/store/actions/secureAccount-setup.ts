// types and action creators: dispatched by components and sagas
export const SETUP_SECUREACCOUNT =  "SETUP_SECUREACCOUNT";

export const setupSecureAccount = accountType => {
    return { type: SETUP_SECUREACCOUNT, payload: {accountType} };
  };

export const CHECK_HEALTH = "CHECK_HEALTH";
export const checkHealth = (accountType)=> {
    return {type: CHECK_HEALTH, payload: {accountType}};
};
// types and action creators (saga): dispatched by saga workers
export const SECUREACCOUNT_SETUP = "SECUREACCOUNT_SETUP";

export const secureAccountSetup = (
  accountType,
  setupData:
  {qrData: string;
  secret: string;
  bhXpub: string;}
  ) => {
    return {type: SECUREACCOUNT_SETUP, payload: {accountType,setupData}};
  };

export const HEALTH_CHECK = "HEALTH_CHECK";

export const healthCheck = (accountType,data:{isValid: boolean}) => {
        return {type : HEALTH_CHECK, payload: {accountType,data}};
  };