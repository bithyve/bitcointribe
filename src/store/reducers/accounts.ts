import { ADDR_FETCHED, BALANCE_FETCHED } from "../actions/accounts";

const ACCOUNT_VARS = {
  address: "",
  balances: {
    balance: 0,
    unconfirmedBalance: 0
  }
};

const initialState = {
  REGULAR_ACCOUNT: ACCOUNT_VARS,
  TEST_ACCOUNT: ACCOUNT_VARS,
  SECURE_ACCOUNT: ACCOUNT_VARS
};

export default (state = initialState, action) => {
  const account = action.payload ? action.payload.accountType : null;
  switch (action.type) {
    case ADDR_FETCHED:
      return {
        ...state,
        [account]: {
          ...state[account],
          address: action.payload.address
        }
      };
    case BALANCE_FETCHED:
      return {
        ...state,
        [account]: {
          ...state[account],
          balances: action.payload.balances
        }
      };
  }
  return state;
};
