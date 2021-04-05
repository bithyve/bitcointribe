import {
  TESTCOINS_RECEIVED,
  ACCOUNTS_SYNCHED,
  EXCHANGE_RATE_CALCULATED,
  SECONDARY_XPRIV_GENERATED,
  TWO_FA_RESETTED,
  AVERAGE_TX_FEE,
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
  ACCOUNT_SHELL_REFRESH_COMPLETED,
  ACCOUNT_SHELL_REFRESH_STARTED,
  CLEAR_ACCOUNT_SYNC_CACHE,
  RESTORED_ACCOUNT_SHELLS,
  REMAP_ACCOUNT_SHELLS,
  TWO_FA_VALID,
  SET_ALL_ACCOUNTS_DATA,
  FETCH_RECEIVE_ADDRESS_SUCCEEDED,
  CLEAR_RECEIVE_ADDRESS,
  GENERATE_SECONDARY_XPRIV,
  RESET_TWO_FA,
  VALIDATE_TWO_FA
} from '../actions/accounts'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import { SERVICES_ENRICHED } from '../actions/storage'
import {
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import AccountShell from '../../common/data/models/AccountShell'
import { updateAccountShells } from '../utils/accountShellMapping'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import SyncStatus from '../../common/data/enums/SyncStatus'

export type AccountVars = {
  service: RegularAccount | TestAccount | SecureAccount;
}

// TODO: Remove this in favor of using the generalized `SubAccountDescribing` interface.
const ACCOUNT_VARS: AccountVars  = {
  service: null,
}

export type AccountsState = {
  servicesEnriched: boolean;
  accountsSynched: boolean;
  testCoinsReceived: boolean,
  accountShells: AccountShell[];

  // TODO: Consider removing these in favor of just looking
  // up account data from `activeAccounts` using a UUID.
  REGULAR_ACCOUNT: AccountVars;
  TEST_ACCOUNT: AccountVars;
  SECURE_ACCOUNT: AccountVars;

  exchangeRates?: any;
  averageTxFees: any;

  twoFAHelpFlags: {
      xprivGenerated: boolean | null;
      twoFAValid: boolean | null;
      twoFAResetted: boolean | null;
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

  currentWyreSubAccount: ExternalServiceSubAccountInfo | null;
  currentRampSubAccount: ExternalServiceSubAccountInfo | null;
  accounts: any,

  receiveAddress: string| null;
  hasReceiveAddressSucceeded: boolean | null;
};

const initialState: AccountsState = {
  servicesEnriched: false,
  accountsSynched: false,
  exchangeRates: null,
  testCoinsReceived: false,

  REGULAR_ACCOUNT: ACCOUNT_VARS,
  TEST_ACCOUNT: ACCOUNT_VARS,
  SECURE_ACCOUNT: ACCOUNT_VARS,

  averageTxFees: null,
  accountShells: [],

  twoFAHelpFlags: {
    xprivGenerated: null,
    twoFAValid: null,
    twoFAResetted: null,
  },

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

  currentWyreSubAccount: null,
  currentRampSubAccount: null,
  accounts: null,

  receiveAddress: null,
  hasReceiveAddressSucceeded: false,
}

export default ( state: AccountsState = initialState, action ): AccountsState => {

  switch ( action.type ) {
      case TESTCOINS_RECEIVED:
        return {
          ...state,
          testCoinsReceived: true
        }

      case SERVICES_ENRICHED:
        const { services } = action.payload
        if ( action.payload.services )
          return {
            ...state,
            [ REGULAR_ACCOUNT ]: {
              ...state[ REGULAR_ACCOUNT ],
              service: action.payload.services[ REGULAR_ACCOUNT ],
            },
            [ TEST_ACCOUNT ]: {
              ...state[ TEST_ACCOUNT ],
              service: action.payload.services[ TEST_ACCOUNT ],
            },
            [ SECURE_ACCOUNT ]: {
              ...state[ SECURE_ACCOUNT ],
              service: action.payload.services[ SECURE_ACCOUNT ],
            },
            servicesEnriched: true,
            accountShells: updateAccountShells( services, state.accountShells ),
          }

      case ACCOUNTS_SYNCHED:
        return {
          ...state,
          accountsSynched: action.payload.synched,
        }

      case EXCHANGE_RATE_CALCULATED:
        return {
          ...state,
          exchangeRates: action.payload.exchangeRates,
        }

      case GENERATE_SECONDARY_XPRIV:
        return {
          ...state,
          twoFAHelpFlags: {
            ...state.twoFAHelpFlags,
            xprivGenerated: null,
          },
        }

      case SECONDARY_XPRIV_GENERATED:
        return {
          ...state,
          twoFAHelpFlags: {
            ...state.twoFAHelpFlags,
            xprivGenerated: action.payload.generated,
          },
        }


      case VALIDATE_TWO_FA:
        return {
          ...state,
          twoFAHelpFlags: {
            ...state.twoFAHelpFlags,
            twoFAValid: null,
          },
        }

      case TWO_FA_VALID:
        return {
          ...state,
          twoFAHelpFlags: {
            ...state.twoFAHelpFlags,
            twoFAValid: action.payload.isValid,
          },
        }

      case RESET_TWO_FA:
        return {
          ...state,
          twoFAHelpFlags: {
            ...state.twoFAHelpFlags,
            twoFAResetted: null,
          },
        }

      case TWO_FA_RESETTED:
        return {
          ...state,
          twoFAHelpFlags: {
            ...state.twoFAHelpFlags,
            twoFAResetted: action.payload.resetted,
          },
        }

        // TODO: I don't think averageTxFees should be a wallet-wide concern.
      case AVERAGE_TX_FEE:
        return {
          ...state,
          averageTxFees: action.payload.averageTxFees,
        }

      case ADD_NEW_ACCOUNT_SHELL:
        return {
          ...state,
          isGeneratingNewAccountShell: true,
          hasNewAccountShellGenerationSucceeded: false,
          hasNewAccountShellGenerationFailed: false,
        }

      case NEW_ACCOUNT_SHELL_ADDED:
        // using temperory variable to assign wyre account
        // need to add the default wyre account to account state
        // for now there is only one wyre account created so the first one is added as default
        // this will need to be modified later elsewhere to add default wyre account to state
        let currentWyreSubAccount: ExternalServiceSubAccountInfo | null
        let currentRampSubAccount: ExternalServiceSubAccountInfo | null
        if (
          ( action.payload.primarySubAccount as ExternalServiceSubAccountInfo ) &&
          ( action.payload.primarySubAccount as ExternalServiceSubAccountInfo ).serviceAccountKind == ServiceAccountKind.WYRE
        ) {
          currentWyreSubAccount = action.payload.primarySubAccount
        }
        if (
          ( action.payload.primarySubAccount as ExternalServiceSubAccountInfo ) &&
          ( action.payload.primarySubAccount as ExternalServiceSubAccountInfo ).serviceAccountKind == ServiceAccountKind.RAMP
        ) {
          currentRampSubAccount = action.payload.primarySubAccount
        }

        return {
          ...state,
          isGeneratingNewAccountShell: false,
          hasNewAccountShellGenerationSucceeded: true,
          accountShells: state.accountShells.concat( action.payload ),
          ...currentWyreSubAccount && {
            currentWyreSubAccount
          },
          ...currentRampSubAccount && {
            currentRampSubAccount
          }
        }

      case NEW_ACCOUNT_ADD_FAILED:
        return {
          ...state,
          isGeneratingNewAccountShell: false,
          hasNewAccountShellGenerationSucceeded: false,
          hasNewAccountShellGenerationFailed: true,
        }

      case ADD_NEW_ACCOUNT_SHELL_COMPLETED:
        return {
          ...state,
          isGeneratingNewAccountShell: false,
          hasNewAccountShellGenerationSucceeded: false,
          hasNewAccountShellGenerationFailed: false,
        }

      case RESTORED_ACCOUNT_SHELLS:
        return {
          ...state,
          accountShells: action.payload.accountShells,
        }

      case ACCOUNT_SETTINGS_UPDATED:
      // TODO: Implement Logic for updating the list of account payloads
        return {
          ...state,
          isUpdatingAccountSettings: false,
          hasAccountSettingsUpdateSucceeded: true,
          hasAccountSettingsUpdateFailed: false,
        }

      case ACCOUNT_SETTINGS_UPDATE_FAILED:
        return {
          ...state,
          isUpdatingAccountSettings: false,
          hasAccountSettingsUpdateSucceeded: false,
          hasAccountSettingsUpdateFailed: true,
        }

      case SUB_ACCOUNT_SETTINGS_UPDATE_COMPLETED:
        return {
          ...state,
          isUpdatingAccountSettings: false,
          hasAccountSettingsUpdateSucceeded: false,
          hasAccountSettingsUpdateFailed: false,
        }

      case REASSIGN_TRANSACTIONS:
        return {
          ...state,
          transactionReassignmentDestinationID: action.payload.destinationID,
          isTransactionReassignmentInProgress: true,
          hasTransactionReassignmentSucceeded: false,
          hasTransactionReassignmentFailed: false,
        }

      case TRANSACTION_REASSIGNMENT_SUCCEEDED:
        return {
          ...state,
          isTransactionReassignmentInProgress: false,
          hasTransactionReassignmentSucceeded: true,
          hasTransactionReassignmentFailed: false,
        }

      case TRANSACTION_REASSIGNMENT_FAILED:
        return {
          ...state,
          isTransactionReassignmentInProgress: false,
          hasTransactionReassignmentSucceeded: false,
          hasTransactionReassignmentFailed: true,
        }

      case TRANSACTION_REASSIGNMENT_COMPLETED:
        return {
          ...state,
          transactionReassignmentDestinationID: null,
          isTransactionReassignmentInProgress: false,
          hasTransactionReassignmentSucceeded: false,
          hasTransactionReassignmentFailed: false,
        }

      case MERGE_ACCOUNT_SHELLS:
        return {
          ...state,
          accountShellMergeSource: action.payload.source,
          accountShellMergeDestination: action.payload.destination,
          isAccountShellMergeInProgress: true,
          hasAccountShellMergeSucceeded: false,
          hasAccountShellMergeFailed: false,
        }

      case ACCOUNT_SHELL_MERGE_SUCCEEDED:
        return {
          ...state,
          isAccountShellMergeInProgress: false,
          hasAccountShellMergeSucceeded: true,
          hasAccountShellMergeFailed: false,
        }

      case ACCOUNT_SHELL_MERGE_FAILED:
        return {
          ...state,
          isAccountShellMergeInProgress: false,
          hasAccountShellMergeSucceeded: false,
          hasAccountShellMergeFailed: true,
        }

      case ACCOUNT_SHELL_MERGE_COMPLETED:
        return {
          ...state,
          accountShellMergeSource: null,
          accountShellMergeDestination: null,
          isAccountShellMergeInProgress: false,
          hasAccountShellMergeSucceeded: false,
          hasAccountShellMergeFailed: false,
        }

      case ACCOUNT_SHELLS_ORDER_UPDATED:
        return {
          ...state,
          accountShells: action.payload.map( updateDisplayOrderForSortedShell ),
        }

      case ACCOUNT_SHELL_ORDERED_TO_FRONT:
        const index = state.accountShells.findIndex(
          ( shell ) => shell.id == action.payload.id
        )

        const shellToMove = state.accountShells.splice( index )

        return {
          ...state,
          accountShells: [ ...shellToMove, ...state.accountShells ].map(
            updateDisplayOrderForSortedShell
          ),
        }

      case REMAP_ACCOUNT_SHELLS:
        return {
          ...state,
          accountShells: updateAccountShells( action.payload.services, [] ),
        }

      case ACCOUNT_SHELL_REFRESH_STARTED:
        state.accountShells.find(
          ( shell ) => shell.id == action.payload.id
        ).syncStatus = SyncStatus.IN_PROGRESS
        return {
          ...state,
        }
      case ACCOUNT_SHELL_REFRESH_COMPLETED:
        // Updating Account Sync State to shell data model
        // This will be used to display sync icon on Home Screen
        state.accountShells.find(
          ( shell ) => shell.id == action.payload.id
        ).syncStatus = SyncStatus.COMPLETED
        return {
          ...state,
        }

      case CLEAR_ACCOUNT_SYNC_CACHE:
        // This will clear the sync state at the start of each login session
        // This is required in order to ensure sync icon is shown again for each session
        state.accountShells.map(
          ( shell ) => shell.syncStatus = SyncStatus.PENDING )
        return {
          ...state,
        }

      case SET_ALL_ACCOUNTS_DATA:
        return {
          ...state,
          accounts: action.payload.accounts,
        }

      case FETCH_RECEIVE_ADDRESS_SUCCEEDED:
        return {
          ...state,
          receiveAddress: action.payload.receiveAddress,
          hasReceiveAddressSucceeded: true
        }

      case CLEAR_RECEIVE_ADDRESS:
        return {
          ...state,
          receiveAddress: null,
          hasReceiveAddressSucceeded: null
        }

      default:
        return state
  }
}

function updateDisplayOrderForSortedShell(
  accountShell: AccountShell,
  sortedIndex: number
): AccountShell {
  accountShell.displayOrder = sortedIndex + 1

  return accountShell
}
