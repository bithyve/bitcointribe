// types and action creators: dispatched by components and sagas
export const STORE_CREDS = "STORE_CREDS";
export const CREDS_AUTH = "CREDS_AUTH";
export const INIT_SETUP = "INIT_SETUP";

export const storeCreds = passcode => {
  return { type: STORE_CREDS, payload: { passcode } };
};

export const credsAuth = passcode => {
  return { type: CREDS_AUTH, payload: { passcode } };
};

export const initializeSetup = (walletName, securityAns) => {
  return { type: INIT_SETUP, payload: { walletName, securityAns } };
};

// types and action creators (saga): dispatched by saga workers

export const CREDS_STORED = "CREDS_STORED";
export const CREDS_AUTHENTICATED = "CREDS_AUTHENTICATED";
export const SETUP_INITIALIZED = "SETUP_INITIALIZED";

export const credsStored = () => {
  return { type: CREDS_STORED };
};

export const credsAuthenticated = isAuthenticated => {
  return { type: CREDS_AUTHENTICATED, payload: { isAuthenticated } };
};

export const setupInitialized = () => {
  return { type: SETUP_INITIALIZED };
};
