// types and action creators: dispatched by components and sagas
export const SETUP_SECUREACCOUNT =  "SETUP_SECUREACCOUNT";
export const CHECK_HEALTH = "CHECK_HEALTH";
export const IS_ACTIVE = "IS_ACTIVE";


export const setupSecureAccount = accountType => {
    return { type: SETUP_SECUREACCOUNT, payload: {accountType} };
  };

export const checkHealth = (accountType)=> {
    return {type: CHECK_HEALTH, payload: {accountType}};
};

export const isActive = (accountType) => {
return {type:IS_ACTIVE, payload: {accountType} };
};

// types and action creators (saga): dispatched by saga workers
export const SECUREACCOUNT_SETUP = "SECUREACCOUNT_SETUP";
export const HEALTH_CHECK = "HEALTH_CHECK";
export const ACTIVATED = "ACTIVATED";

export const secureAccountSetup = (
  accountType,
  setupData:
  {qrData: string;
  secret: string;
  bhXpub: string;}
  ) => {
    return {type: SECUREACCOUNT_SETUP, payload: {accountType,setupData}};
  };

export const healthCheck = (
  accountType,
  data:{isValid: boolean}
  ) => {
        return {type : HEALTH_CHECK, payload: {accountType,data}};
  };

export const activated =(
  accountType, 
  saStatus:{isActive: boolean}
  )=>{
  return {type: ACTIVATED, payload:{accountType,saStatus}};
};

