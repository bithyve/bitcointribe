import {
  ADDR_FETCHED,
  BALANCE_FETCHED,
  TRANSACTIONS_FETCHED,
  LOADING
} from "../actions/accounts";

const ACCOUNT_VARS: {
  address: String;
  balances: {
    balance: Number;
    unconfirmedBalance: Number;
  };
  transactions: any;
  loading: {
    address: Boolean;
    balances: Boolean;
    transactions: Boolean;
  };
} = {
  address: "",
  balances: {
    balance: 0,
    unconfirmedBalance: 0
  },
  transactions: {},
  loading: {
    address: false,
    balances: false,
    transactions: false
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
          address: action.payload.address,
          loading: {
            ...state[account].loading,
            address: false
          }
        }
      };

    case BALANCE_FETCHED:
      return {
        ...state,
        [account]: {
          ...state[account],
          balances: action.payload.balances,
          loading: {
            ...state[account].loading,
            balances: false
          }
        }
      };

    case TRANSACTIONS_FETCHED:
      return {
        ...state,
        [account]: {
          ...state[account],
          transactions: action.payload.transactions,
          loading: {
            ...state[account].loading,
            transactions: false
          }
        }
      };

    case LOADING:
      return {
        ...state,
        [account]: {
          ...state[account],
          loading: {
            ...state[account].loading,
            [action.payload.beingLoaded]: true
          }
        }
      };
  }
  return state;
};
