// types and action creators: dispatched by components and sagas
export const WALLET_NAME = "WALLET_NAME";
export const SECURITY_ANS = "SECURITY_ANS";
export const INIT_SETUP = "INIT_SETUP";

export const updateWalletName = walletName => {
  return { type: WALLET_NAME, payload: { walletName } };
};

export const updateSecurityAns = securityAns => {
  return { type: SECURITY_ANS, payload: { securityAns } };
};

export const initializeSetup = () => {
  return { type: INIT_SETUP };
};
