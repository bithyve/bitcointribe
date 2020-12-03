import {
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
  ADD_NEW_ACCOUNT_SHELL,
  NEW_ACCOUNT_SHELL_ADDED,
  NEW_ACCOUNT_ADD_FAILED,
  ADD_NEW_ACCOUNT_SHELL_COMPLETED,
  ACCOUNT_SETTINGS_UPDATED,
  ACCOUNT_SETTINGS_UPDATE_FAILED,
  SUB_ACCOUNT_SETTINGS_UPDATE_COMPLETED,
  REASSIGN_TRANSACTIONS,
  TRANSACTION_REASSIGNMENT_SUCCEEDED,
  TRANSACTION_REASSIGNMENT_FAILED,
  TRANSACTION_REASSIGNMENT_COMPLETED,
  MERGE_ACCOUNT_SHELLS,
  ACCOUNT_SHELL_MERGE_COMPLETED,
  ACCOUNT_SHELL_MERGE_SUCCEEDED,
  ACCOUNT_SHELL_MERGE_FAILED,
  ACCOUNT_SHELLS_ORDER_UPDATED,
  ACCOUNT_SHELL_ORDERED_TO_FRONT,
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
import AccountShell from '../../common/data/models/AccountShell';
import { updateAccountShells } from '../utils/accountShellMapping';

// TODO: Remove this in favor of using the generalized `SubAccountDescribing` interface.
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
    settedup: Boolean;
    loading: Boolean;
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
    loading: false,
  },
};

export type AccountsState = {
  servicesEnriched: boolean;
  accountsSynched: boolean;

  // TODO: Consider separating this into another reducer -- I'm not
  // sure it's really a concern of the "Accounts state".
  exchangeRates?: any;

  accountShells: AccountShell[];

  // TODO: Consider removing these in favor of just looking
  // up account data from `activeAccounts` using a UUID.
  REGULAR_ACCOUNT: any;
  TEST_ACCOUNT: any;
  SECURE_ACCOUNT: any;

  // TODO: How does this differ from ANY added account? (See `activeAccounts`)
  // Perhaps we should consolidate the items here into that array?
  additional?: {
    regular?: any;
    test?: any;
    secure?: any;
  };

  isGeneratingNewAccountShell: boolean;
  hasNewAccountShellGenerationSucceeded: boolean;
  hasNewAccountShellGenerationFailed: boolean;

  isUpdatingAccountSettings: boolean;
  hasAccountSettingsUpdateSucceeded: boolean;
  hasAccountSettingsUpdateFailed: boolean;

  isTransactionReassignmentInProgress: boolean;
  hasTransactionReassignmentSucceeded: boolean;
  hasTransactionReassignmentFailed: boolean;
  transactionReassignmentDestinationID: string | null;

  isAccountShellMergeInProgress: boolean;
  hasAccountShellMergeSucceeded: boolean;
  hasAccountShellMergeFailed: boolean;
  accountShellMergeSource: AccountShell | null;
  accountShellMergeDestination: AccountShell | null;
};

const initialState: AccountsState = {
  servicesEnriched: false,
  accountsSynched: false,
  exchangeRates: null,

  REGULAR_ACCOUNT: ACCOUNT_VARS,
  TEST_ACCOUNT: ACCOUNT_VARS,
  SECURE_ACCOUNT: ACCOUNT_VARS,

  accountShells: [],

  isGeneratingNewAccountShell: false,
  hasNewAccountShellGenerationSucceeded: false,
  hasNewAccountShellGenerationFailed: false,

  isUpdatingAccountSettings: false,
  hasAccountSettingsUpdateSucceeded: false,
  hasAccountSettingsUpdateFailed: false,

  isTransactionReassignmentInProgress: false,
  hasTransactionReassignmentSucceeded: false,
  hasTransactionReassignmentFailed: false,
  transactionReassignmentDestinationID: null,

  isAccountShellMergeInProgress: false,
  hasAccountShellMergeSucceeded: false,
  hasAccountShellMergeFailed: false,
  accountShellMergeSource: null,
  accountShellMergeDestination: null,
};

export default (state: AccountsState = initialState, action): AccountsState => {
  const accountType = action.payload ? action.payload.serviceType : null;

  switch (action.type) {
    case TESTCOINS_RECEIVED:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          service: action.payload.service,
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
            stage2: {
              ...state[accountType].transfer.stage2,
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
            stage3: {
              ...state[accountType].transfer.stage3,
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

    case SERVICES_ENRICHED:
      const { services } = action.payload;

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
        accountShells: updateAccountShells(services, state.accountShells),
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

    // TODO: I don't think averageTxFees should be a wallet-wide concern.
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
        },
      };

    case SETTED_DONATION_ACC:
      return {
        ...state,
        [accountType]: {
          ...state[accountType],
          donationAccount: {
            ...state[accountType].donationAccount,
            settedup: action.payload.successful,
            loading: false,
          },
        },
      };

    case ADD_NEW_ACCOUNT_SHELL:
      return {
        ...state,
        isGeneratingNewAccountShell: true,
        hasNewAccountShellGenerationSucceeded: false,
        hasNewAccountShellGenerationFailed: false,
      };

    case NEW_ACCOUNT_SHELL_ADDED:
      return {
        ...state,
        isGeneratingNewAccountShell: false,
        hasNewAccountShellGenerationSucceeded: true,
        accountShells: state.accountShells.concat(action.payload),
      };

    case NEW_ACCOUNT_ADD_FAILED:
      return {
        ...state,
        isGeneratingNewAccountShell: false,
        hasNewAccountShellGenerationSucceeded: false,
        hasNewAccountShellGenerationFailed: true,
      };

    case ADD_NEW_ACCOUNT_SHELL_COMPLETED:
      return {
        ...state,
        isGeneratingNewAccountShell: false,
        hasNewAccountShellGenerationSucceeded: false,
        hasNewAccountShellGenerationFailed: false,
      };

    case ACCOUNT_SETTINGS_UPDATED:
      // TODO: Implement Logic for updating the list of account payloads
      return {
        ...state,
        isUpdatingAccountSettings: false,
        hasAccountSettingsUpdateSucceeded: true,
        hasAccountSettingsUpdateFailed: false,
      };

    case ACCOUNT_SETTINGS_UPDATE_FAILED:
      return {
        ...state,
        isUpdatingAccountSettings: false,
        hasAccountSettingsUpdateSucceeded: false,
        hasAccountSettingsUpdateFailed: true,
      };

    case SUB_ACCOUNT_SETTINGS_UPDATE_COMPLETED:
      return {
        ...state,
        isUpdatingAccountSettings: false,
        hasAccountSettingsUpdateSucceeded: false,
        hasAccountSettingsUpdateFailed: false,
      };

    case REASSIGN_TRANSACTIONS:
      return {
        ...state,
        transactionReassignmentDestinationID: action.payload.destinationID,
        isTransactionReassignmentInProgress: true,
        hasTransactionReassignmentSucceeded: false,
        hasTransactionReassignmentFailed: false,
      };

    case TRANSACTION_REASSIGNMENT_SUCCEEDED:
      return {
        ...state,
        isTransactionReassignmentInProgress: false,
        hasTransactionReassignmentSucceeded: true,
        hasTransactionReassignmentFailed: false,
      };

    case TRANSACTION_REASSIGNMENT_FAILED:
      return {
        ...state,
        isTransactionReassignmentInProgress: false,
        hasTransactionReassignmentSucceeded: false,
        hasTransactionReassignmentFailed: true,
      };

    case TRANSACTION_REASSIGNMENT_COMPLETED:
      return {
        ...state,
        transactionReassignmentDestinationID: null,
        isTransactionReassignmentInProgress: false,
        hasTransactionReassignmentSucceeded: false,
        hasTransactionReassignmentFailed: false,
      };

    case MERGE_ACCOUNT_SHELLS:
      return {
        ...state,
        accountShellMergeSource: action.payload.source,
        accountShellMergeDestination: action.payload.destination,
        isAccountShellMergeInProgress: true,
        hasAccountShellMergeSucceeded: false,
        hasAccountShellMergeFailed: false,
      };

    case ACCOUNT_SHELL_MERGE_SUCCEEDED:
      return {
        ...state,
        isAccountShellMergeInProgress: false,
        hasAccountShellMergeSucceeded: true,
        hasAccountShellMergeFailed: false,
      };

    case ACCOUNT_SHELL_MERGE_FAILED:
      return {
        ...state,
        isAccountShellMergeInProgress: false,
        hasAccountShellMergeSucceeded: false,
        hasAccountShellMergeFailed: true,
      };

    case ACCOUNT_SHELL_MERGE_COMPLETED:
      return {
        ...state,
        accountShellMergeSource: null,
        accountShellMergeDestination: null,
        isAccountShellMergeInProgress: false,
        hasAccountShellMergeSucceeded: false,
        hasAccountShellMergeFailed: false,
      };

    case ACCOUNT_SHELLS_ORDER_UPDATED:
      return {
        ...state,
        accountShells: action.payload.map(updateDisplayOrderForSortedShell),
      };

    case ACCOUNT_SHELL_ORDERED_TO_FRONT:
      const index = state
        .accountShells
        .findIndex(shell => shell.id == action.payload.id);

      const shellToMove = state.accountShells.splice(index);

      return {
        ...state,
        accountShells: [...shellToMove, ...state.accountShells].map(updateDisplayOrderForSortedShell),
      };

    default:
      return state;
  }
};


function updateDisplayOrderForSortedShell(
  accountShell: AccountShell,
  sortedIndex: number,
): AccountShell {
  accountShell.displayOrder = sortedIndex + 1;

  return accountShell;
}
