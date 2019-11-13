import {
  ADDR_FETCHED,
  BALANCE_FETCHED,
  TRANSACTIONS_FETCHED,
  LOADING,
  TRANSFER_ST1_EXECUTED,
  TRANSFER_ST2_EXECUTED,
  CLEAR_TRANSFER
} from "../actions/accounts";

const ACCOUNT_VARS: {
  address: String;
  balances: {
    balance: Number;
    unconfirmedBalance: Number;
  };
  transactions: any;
  transfer: {
    executing: Boolean;
    stage1: any;
    txid: String;
  };
  loading: {
    address: Boolean;
    balances: Boolean;
    transactions: Boolean;
    transfer: Boolean;
  };
} = {
  address: "",
  balances: {
    balance: 0,
    unconfirmedBalance: 0
  },
  transactions: {},
  transfer: {
    executing: false,
    stage1: {},
    txid: ""
  },
  loading: {
    address: false,
    balances: false,
    transactions: false,
    transfer: false
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

    case TRANSFER_ST1_EXECUTED:
      return {
        ...state,
        [account]: {
          ...state[account],
          transfer: {
            ...action.payload.stage1,
            executing: true
          },
          loading: {
            ...state[account].loading,
            transfer: false
          }
        }
      };

    case CLEAR_TRANSFER:
      return {
        ...state,
        [account]: {
          ...state[account],
          transfer: {
            ...initialState[account].transfer
          }
        }
      };

    case TRANSFER_ST2_EXECUTED:
      return {
        ...state,
        [account]: {
          ...state[account],
          transfer: {
            txid: action.payload.txid,
            executing: false
          },
          loading: {
            ...state[account].loading,
            transfer: false
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
            [action.payload.beingLoaded]: !state[account].loading[
              action.payload.beingLoaded
            ]
          }
        }
      };
  }
  return state;
};
