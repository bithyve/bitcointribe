// types and action creators: dispatched by components and sagas
export const STORE_CREDS = 'STORE_CREDS';
export const CREDS_AUTH = 'CREDS_AUTH';
export const INIT_SETUP = 'INIT_SETUP';
export const INIT_RECOVERY = 'INIT_RECOVERY';
export const RE_LOGIN = 'RE_LOGIN';

export const storeCreds = passcode => {
  return { type: STORE_CREDS, payload: { passcode } };
};

export const credsAuth = (passcode, reLogin?) => {
  return { type: CREDS_AUTH, payload: { passcode, reLogin } };
};

export const initializeSetup = (walletName, security) => {
  return { type: INIT_SETUP, payload: { walletName, security } };
};

export const initializeRecovery = (walletName, security) => {
  return { type: INIT_RECOVERY, payload: { walletName, security } };
};

export const switchReLogin = (loggedIn, reset?) => {
  return { type: RE_LOGIN, payload: { loggedIn, reset } };
};

// types and action creators (saga): dispatched by saga workers

export const CREDS_STORED = 'CREDS_STORED';
export const CREDS_AUTHENTICATED = 'CREDS_AUTHENTICATED';
export const SETUP_INITIALIZED = 'SETUP_INITIALIZED';
export const SETUP_LOADING = 'SETUP_LOADING';

export const credsStored = () => {
  return { type: CREDS_STORED };
};

export const credsAuthenticated = isAuthenticated => {
  return { type: CREDS_AUTHENTICATED, payload: { isAuthenticated } };
};

export const setupInitialized = () => {
  return { type: SETUP_INITIALIZED };
};

export const switchSetupLoader = beingLoaded => {
  return { type: SETUP_LOADING, payload: { beingLoaded } };
};
