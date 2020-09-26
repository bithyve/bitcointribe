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
  EXCHANGE_RATE_CALCULATED,
  SECONDARY_XPRIV_GENERATED,
  ALTERNATE_TRANSFER_ST2_EXECUTED,
  TWO_FA_RESETTED,
  ADD_TRANSFER_DETAILS,
  REMOVE_TRANSFER_DETAILS,
  AVERAGE_TX_FEE,
  SETTED_DONATION_ACC,
  SETUP_DONATION_ACCOUNT,
  ADD_NEW_ACCOUNT,
  NEW_ACCOUNT_ADDED,
  NEW_ACCOUNT_ADD_FAILED,
  ADD_NEW_ACCOUNT_COMPLETED,
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
import BaseAccount from '../../bitcoin/utilities/accounts/BaseAccount';
import { stat } from 'react-native-fs';

const ACCOUNT_VARS: {
  service: RegularAccount | TestAccount | SecureAccount;
  receivingAddress: String;
  balances: {
    balance: Number;
    unconfirmedBalance: Number;
  };
  transactions: any;
  transfer: {
    details: any[];
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
    derivativeBalanceTx: Boolean;
    transfer: Boolean;
    testcoins: Boolean;
  };
  averageTxFees: any;
  donationAccount: {
    settedup: Boolean,
    loading: Boolean
  }
} = {
  service: null,
  receivingAddress: '',
  balances: {
    balance: 0,
    unconfirmedBalance: 0,
  },
  transactions: {},
  transfer: {
    details: [],
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
    derivativeBalanceTx: false,
    transfer: false,
    testcoins: false,
  },
  averageTxFees: null,
  donationAccount: {
    settedup: false,
    loading: false
  },
};

const initialState: {
  servicesEnriched: Boolean;
  accountsSynched: Boolean;
  exchangeRates: any;
  REGULAR_ACCOUNT: any;
  TEST_ACCOUNT: any;
  SECURE_ACCOUNT: any;
  additional?: {
    regular?: any;
    test?: any;
    secure?: any;
  };
  isGeneratingNewAccount: Boolean;
  hasNewAccountGenerationSucceeded: Boolean;
  hasNewAccountGenerationFailed: Boolean;
  addedAccounts: BaseAccount[],
} = {
  servicesEnriched: false,
  accountsSynched: false,
  exchangeRates: null,
  REGULAR_ACCOUNT: ACCOUNT_VARS,
  TEST_ACCOUNT: ACCOUNT_VARS,
  SECURE_ACCOUNT: ACCOUNT_VARS,
  isGeneratingNewAccount: false,
  hasNewAccountGenerationSucceeded: false,
  hasNewAccountGenerationFailed: false,
  addedAccounts: [],
};

export default (state = initialState, action) => {
  const accountType = action.payload ? action.payload.serviceType : null;

  switch (action.type) {
    case ADDR_FETCHED:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          receivingAddress: action.payload.address,
          loading: {
            ...state[accountType].loading,
            receivingAddress: false,
          },
        },
      };

    case TESTCOINS_RECEIVED:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          service: action.payload.service,
        },
      };

    case BALANCE_FETCHED:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          balances: action.payload.balances,
          loading: {
            ...state[accountType].loading,
            balances: false,
          },
        },
      };

    case TRANSACTIONS_FETCHED:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          transactions: action.payload.transactions,
          loading: {
            ...state[accountType].loading,
            transactions: false,
          },
        },
      };

    case TRANSFER_ST1_EXECUTED:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          transfer: {
            ...state[accountType].transfer,
            stage1: { ...action.payload.result },
            executed: 'ST1',
          },
          loading: {
            ...state[accountType].loading,
            transfer: false,
          },
        },
      };

    case TRANSFER_ST1_FAILED:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          transfer: {
            ...state[accountType].transfer,
            stage1: {
              ...state[accountType].transfer.stage1,
              failed: true,
              ...action.payload.errorDetails,
            },
          },
          loading: {
            ...state[accountType].loading,
            transfer: false,
          },
        },
      };

    case ADD_TRANSFER_DETAILS:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          transfer: {
            ...state[accountType].transfer,
            details: [
              ...state[accountType].transfer.details,
              action.payload.recipientData,
            ],
          },
        },
      };

    case REMOVE_TRANSFER_DETAILS:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          transfer: {
            ...state[accountType].transfer,
            details: [...state[accountType].transfer.details].filter(
              (item) => item !== action.payload.recipientData,
            ),
          },
        },
      };

    case CLEAR_TRANSFER:
      if (!action.payload.stage)
        return {
          ...state,
          [accountType]: {
            ...state[accountType],
            transfer: {
              ...initialState[accountType].transfer,
            },
          },
        };
      else if (action.payload.stage === 'stage1')
        return {
          ...state,
          [accountType]: {
            ...state[accountType],
            transfer: {
              ...state[accountType].transfer,
              stage1: {},
              stage2: {},
              stage3: {},
              executed: '',
            },
          },
        };
      else if (action.payload.stage === 'stage2')
        return {
          ...state,
          [accountType]: {
            ...state[accountType],
            transfer: {
              ...state[accountType].transfer,
              stage2: {},
              stage3: {},
              executed: 'ST1',
            },
          },
        };
      else if (action.payload.stage === 'stage3')
        return {
          ...state,
          [accountType]: {
            ...state[accountType],
            transfer: {
              ...state[accountType].transfer,
              stage3: {},
              executed: 'ST2',
            },
          },
        };

    case TRANSFER_ST2_EXECUTED:
      switch (action.payload.serviceType) {
        case REGULAR_ACCOUNT || TEST_ACCOUNT:
          return {
            ...state,
            [accountType]: {
              ...state[accountType],
              transfer: {
                ...state[accountType].transfer,
                txid: action.payload.result,
                executed: 'ST2',
              },
              loading: {
                ...state[accountType].loading,
                transfer: false,
              },
            },
          };

        case SECURE_ACCOUNT:
          return {
            ...state,
            [accountType]: {
              ...state[accountType],
              transfer: {
                ...state[accountType].transfer,
                stage2: { ...action.payload.result },
                executed: 'ST2',
              },
              loading: {
                ...state[accountType].loading,
                transfer: false,
              },
            },
          };
      }

    case ALTERNATE_TRANSFER_ST2_EXECUTED:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          transfer: {
            ...state[accountType].transfer,
            txid: action.payload.result,
            executed: 'ST2',
          },
          loading: {
            ...state[accountType].loading,
            transfer: false,
          },
        },
      };

    case TRANSFER_ST2_FAILED:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          transfer: {
            ...state[accountType].transfer,
            stage2: { ...state[accountType].transfer.stage2, failed: true },
          },
          loading: {
            ...state[accountType].loading,
            transfer: false,
          },
        },
      };

    case TRANSFER_ST3_EXECUTED:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          transfer: {
            ...state[accountType].transfer,
            txid: action.payload.result,
            executing: false,
          },
          loading: {
            ...state[accountType].loading,
            transfer: false,
          },
        },
      };

    case TRANSFER_ST3_FAILED:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          transfer: {
            ...state[accountType].transfer,
            stage3: { ...state[accountType].transfer.stage3, failed: true },
          },
          loading: {
            ...state[accountType].loading,
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
        [accountType]: {
          ...state[accountType],
          loading: {
            ...state[accountType].loading,
            [action.payload.beingLoaded]: !state[accountType].loading[
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

    case EXCHANGE_RATE_CALCULATED:
      return {
        ...state,
        exchangeRates: action.payload.exchangeRates,
      };

    case SECONDARY_XPRIV_GENERATED:
      return {
        ...state,
        additional: {
          secure: {
            xprivGenerated: action.payload.generated,
          },
        },
      };

    case TWO_FA_RESETTED:
      return {
        ...state,
        additional: {
          secure: {
            twoFAResetted: action.payload.resetted,
          },
        },
      };

    case AVERAGE_TX_FEE:
      return {
        ...state,
        averageTxFees: action.payload.averageTxFees,
      };

    case SETUP_DONATION_ACCOUNT:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          donationAccount: {
            settedup: false,
            loading: true,
          },
        }
      }

    case SETTED_DONATION_ACC:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          donationAccount: {
            ...state[accountType].donationAccount,
            settedup: action.payload.successful,
            loading: false,
          }
        }
      };

    case ADD_NEW_ACCOUNT:
      return {
        ...state,
        isGeneratingNewAccount: true,
        hasNewAccountGenerationSucceeded: false,
        hasNewAccountGenerationFailed: false,
      };

    case NEW_ACCOUNT_ADDED:
      return {
        ...state,
        isGeneratingNewAccount: false,
        hasNewAccountGenerationSucceeded: true,
        addedAccounts: state.addedAccounts.concat(action.payload),
      };


    case NEW_ACCOUNT_ADD_FAILED:
      return {
        ...state,
        isGeneratingNewAccount: false,
        hasNewAccountGenerationSucceeded: false,
        hasNewAccountGenerationFailed: true,
      };

    case ADD_NEW_ACCOUNT_COMPLETED:
      return {
        ...state,
        isGeneratingNewAccount: false,
        hasNewAccountGenerationSucceeded: false,
        hasNewAccountGenerationFailed: false,
      };

    default:
      return state;
  }
};
