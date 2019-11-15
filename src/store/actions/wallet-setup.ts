// types and action creators: dispatched by components and sagas
export const INIT_SETUP = "INIT_SETUP";

export const initializeSetup = (walletName, securityAns) => {
  return { type: INIT_SETUP, payload: { walletName, securityAns } };
};
