// types and action creators (pure): dispatched from components
export const INIT_SETUP = "INIT_SETUP";

export const initializeSetup = (walletName, securityAns) => {
  return { type: INIT_SETUP, payload: { walletName, securityAns } };
};

// types and action creators (saga): dispatched from saga workers
export const SETUP_INITIALIZED = "SETUP_INITIALIZED";

export const setupInitialized = data => {
  return { type: SETUP_INITIALIZED, payload: { data } };
};
