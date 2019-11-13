import { WALLET_NAME, SECURITY_ANS } from "../actions/wallet-setup";

const initialState = {
  walletName: "",
  securityAns: ""
};

export default (state = initialState, action) => {
  switch (action.type) {
    case WALLET_NAME:
      return {
        ...state,
        walletName: action.payload.walletName
      };
    case SECURITY_ANS:
      return {
        ...state,
        securityAns: action.payload.securityAns
      };
  }
  return state;
};
