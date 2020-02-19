import {
  ADDR_FETCHED,
  BALANCE_FETCHED,
  TRANSACTIONS_FETCHED,
  TRANSFER_ST1_EXECUTED,
  TRANSFER_ST2_EXECUTED,
  CLEAR_TRANSFER,
  TRANSFER_ST3_EXECUTED,
  ACCOUNTS_LOADING,
  TRANSFER_ST1_FAILED,
  TRANSFER_ST2_FAILED,
  TRANSFER_ST3_FAILED,
  TESTCOINS_RECEIVED,
  ACCOUNTS_SYNCHED,
} from '../actions/accounts';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import { SERVICES_ENRICHED } from '../actions/storage';
import {
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/serviceTypes';

const ACCOUNT_VARS: {
  service: RegularAccount | TestAccount | SecureAccount;
  receivingAddress: String;
  balances: {
    balance: Number;
    unconfirmedBalance: Number;
  };
  transactions: any;
  transfer: {
    executed: string;
    stage1: any;
    stage2: any;
    stage3: any;
    txid: String;
  };
  loading: {
    receivingAddress: Boolean;
    balances: Boolean;
    transactions: Boolean;
    balanceTx: Boolean;
    transfer: Boolean;
    testcoins: Boolean;
  };
} = {
  service: null,
  receivingAddress: '',
  balances: {
    balance: 0,
    unconfirmedBalance: 0,
  },
  transactions: {},
  transfer: {
    executed: '',
    stage1: {},
    stage2: {},
    stage3: {},
    txid: '',
  },
  loading: {
    receivingAddress: false,
    balances: false,
    transactions: false,
    balanceTx: false,
    transfer: false,
    testcoins: false,
  },
};

const initialState: {
  servicesEnriched: Boolean;
  accountsSynched: Boolean;
  REGULAR_ACCOUNT: any;
  TEST_ACCOUNT: any;
  SECURE_ACCOUNT: any;
} = {
  servicesEnriched: false,
  accountsSynched: false,
  REGULAR_ACCOUNT: ACCOUNT_VARS,
  TEST_ACCOUNT: ACCOUNT_VARS,
  SECURE_ACCOUNT: ACCOUNT_VARS,
};

export default (state = initialState, action) => {
  const account = action.payload ? action.payload.serviceType : null;
  switch (action.type) {
    case ADDR_FETCHED:
      return {
        ...state,
        [account]: {
          ...state[account],
          receivingAddress: action.payload.address,
          loading: {
            ...state[account].loading,
            receivingAddress: false,
          },
        },
      };

    case TESTCOINS_RECEIVED:
      return {
        ...state,
        [account]: {
          ...state[account],
          service: action.payload.service,
        },
      };

    case BALANCE_FETCHED:
      return {
        ...state,
        [account]: {
          ...state[account],
          balances: action.payload.balances,
          loading: {
            ...state[account].loading,
            balances: false,
          },
        },
      };

    case TRANSACTIONS_FETCHED:
      return {
        ...state,
        [account]: {
          ...state[account],
          transactions: action.payload.transactions,
          loading: {
            ...state[account].loading,
            transactions: false,
          },
        },
      };

    case TRANSFER_ST1_EXECUTED:
      return {
        ...state,
        [account]: {
          ...state[account],
          transfer: {
            ...state[account].transfer,
            stage1: { ...action.payload.result },
            executed: 'ST1',
          },
          loading: {
            ...state[account].loading,
            transfer: false,
          },
        },
      };

    case TRANSFER_ST1_FAILED:
      return {
        ...state,
        [account]: {
          ...state[account],
          transfer: {
            ...state[account].transfer,
            stage1: { ...state[account].transfer.stage1, failed: true },
          },
          loading: {
            ...state[account].loading,
            transfer: false,
          },
        },
      };

    case CLEAR_TRANSFER:
      return {
        ...state,
        [account]: {
          ...state[account],
          transfer: {
            ...initialState[account].transfer,
          },
        },
      };

    case TRANSFER_ST2_EXECUTED:
      switch (action.payload.serviceType) {
        case REGULAR_ACCOUNT || TEST_ACCOUNT:
          return {
            ...state,
            [account]: {
              ...state[account],
              transfer: {
                ...state[account].transfer,
                txid: action.payload.result,
                executed: 'ST2',
              },
              loading: {
                ...state[account].loading,
                transfer: false,
              },
            },
          };

        case SECURE_ACCOUNT:
          return {
            ...state,
            [account]: {
              ...state[account],
              transfer: {
                ...state[account].transfer,
                stage2: { ...action.payload.result },
                executed: 'ST2',
              },
              loading: {
                ...state[account].loading,
                transfer: false,
              },
            },
          };
      }

    // case TRANSFER_ST2_FAILED:
    //   return {
    //     ...state,
    //     [account]: {
    //       ...state[account],
    //       transfer: {
    //         ...state[account].transfer,
    //         stage2: { ...state[account].transfer.stage2, failed: true },
    //       },
    //       loading: {
    //         ...state[account].loading,
    //         transfer: false,
    //       },
    //     },
    //   };

    case TRANSFER_ST3_EXECUTED:
      return {
        ...state,
        [account]: {
          ...state[account],
          transfer: {
            ...state[account].transfer,
            txid: action.payload.result,
            executing: false,
          },
          loading: {
            ...state[account].loading,
            transfer: false,
          },
        },
      };

    case TRANSFER_ST3_FAILED:
      return {
        ...state,
        [account]: {
          ...state[account],
          transfer: {
            ...state[account].transfer,
            stage3: { ...state[account].transfer.stage3, failed: true },
          },
          loading: {
            ...state[account].loading,
            transfer: false,
          },
        },
      };

    case SERVICES_ENRICHED:
      return {
        ...state,
        [REGULAR_ACCOUNT]: {
          ...state[REGULAR_ACCOUNT],
          service: action.payload.services[REGULAR_ACCOUNT],
        },
        [TEST_ACCOUNT]: {
          ...state[TEST_ACCOUNT],
          service: action.payload.services[TEST_ACCOUNT],
        },
        [SECURE_ACCOUNT]: {
          ...state[SECURE_ACCOUNT],
          service: action.payload.services[SECURE_ACCOUNT],
        },
        servicesEnriched: true,
      };

    case ACCOUNTS_LOADING:
      return {
        ...state,
        [account]: {
          ...state[account],
          loading: {
            ...state[account].loading,
            [action.payload.beingLoaded]: !state[account].loading[
              action.payload.beingLoaded
            ],
          },
        },
      };

    case ACCOUNTS_SYNCHED:
      return {
        ...state,
        accountsSynched: action.payload.synched,
      };
  }
  return state;
};
