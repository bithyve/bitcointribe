// types and action creators: dispatched by components and sagas
export const INIT_SETUP = "INIT_SETUP";

export const initializeSetup = (walletName, securityAns) => {
  return { type: INIT_SETUP, payload: { walletName, securityAns } };
};

// authentication
export const SETUP_CREDS = "SETUP_CREDS";
export const CREDS_AUTH = "CREDS_AUTH";

export const setupCreds = passcode => {
  return { type: SETUP_CREDS, payload: { passcode } };
};

export const credsAuth = passcode => {
  return { type: CREDS_AUTH, payload: { passcode } };
};
