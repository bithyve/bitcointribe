// types and action creators: dispatched by components and sagas
export const STORE_CREDS = 'STORE_CREDS';
export const CREDS_AUTH = 'CREDS_AUTH';
export const INIT_SETUP = 'INIT_SETUP';
export const INIT_RECOVERY = 'INIT_RECOVERY';
export const RE_LOGIN = 'RE_LOGIN';
export const CHANGE_AUTH_CRED = 'CHANGE_AUTH_CRED';
export const SWITCH_CREDS_CHANGED = 'SWITCH_CREDS_CHANGED';

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

export const changeAuthCred = (oldPasscode, newPasscode) => {
  return { type: CHANGE_AUTH_CRED, payload: { oldPasscode, newPasscode } };
};

export const switchCredsChanged = () => {
  return { type: SWITCH_CREDS_CHANGED };
};

// types and action creators (saga): dispatched by saga workers

export const CREDS_STORED = 'CREDS_STORED';
export const CREDS_AUTHENTICATED = 'CREDS_AUTHENTICATED';
export const SETUP_INITIALIZED = 'SETUP_INITIALIZED';
export const SETUP_LOADING = 'SETUP_LOADING';
export const AUTH_CRED_CHANGED = 'AUTH_CRED_CHANGED';

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

export const credsChanged = changed => {
  return { type: AUTH_CRED_CHANGED, payload: { changed } };
};
