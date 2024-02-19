import { Account, Accounts, Gift } from '../../bitcoin/utilities/Interface'
import AccountVisibility from '../../common/data/enums/AccountVisibility'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import SyncStatus from '../../common/data/enums/SyncStatus'
import AccountShell from '../../common/data/models/AccountShell'
import {
  ACCOUNTS_SYNCHED,
  ACCOUNT_CHECKED,
  ACCOUNT_SETTINGS_UPDATED,
  ACCOUNT_SETTINGS_UPDATE_FAILED,
  ACCOUNT_SHELLS_ORDER_UPDATED,
  ACCOUNT_SHELLS_REFRESH_COMPLETED,
  ACCOUNT_SHELLS_REFRESH_STARTED,
  ACCOUNT_SHELL_MERGE_COMPLETED,
  ACCOUNT_SHELL_MERGE_FAILED,
  ACCOUNT_SHELL_MERGE_SUCCEEDED,
  ACCOUNT_SHELL_ORDERED_TO_FRONT,
  ADD_NEW_ACCOUNT_SHELLS,
  ADD_NEW_ACCOUNT_SHELL_COMPLETED,
  AVERAGE_TX_FEE,
  BLIND_REFRESH_STARTED,
  CLEAR_RECEIVE_ADDRESS,
  EXCHANGE_RATE_CALCULATED,
  FETCH_RECEIVE_ADDRESS_SUCCEEDED,
  GENERATE_GIFTS,
  GENERATE_SECONDARY_XPRIV,
  GIFT_ACCEPTED,
  GIFT_ADDED,
  GIFT_CREATION_STATUS,
  MERGE_ACCOUNT_SHELLS,
  NEW_ACCOUNT_ADD_FAILED,
  NEW_ACCOUNT_SHELLS_ADDED,
  READ_TRANSACTION,
  REASSIGN_TRANSACTIONS,
  RECOMPUTE_NET_BALANCE,
  REMAP_ACCOUNT_SHELLS,
  RESET_ACCOUNT_UPDATE_FLAG,
  RESET_TWO_FA,
  RESET_TWO_FA_LOADER,
  SECONDARY_XPRIV_GENERATED,
  SET_ALL_ACCOUNTS_DATA,
  SET_GIFTS,
  SET_SHOW_ALL_ACCOUNT,
  SUB_ACCOUNT_SETTINGS_UPDATE_COMPLETED,
  TESTCOINS_RECEIVED,
  TRANSACTION_REASSIGNMENT_COMPLETED,
  TRANSACTION_REASSIGNMENT_FAILED,
  TRANSACTION_REASSIGNMENT_SUCCEEDED,
  TWO_FA_RESETTED,
  TWO_FA_VALID,
  UPDATE_ACCOUNTS,
  UPDATE_ACCOUNT_SHELLS,
  UPDATE_GIFT,
  VALIDATE_TWO_FA
} from '../actions/accounts'

export type AccountsState = {
  accountsSynched: boolean;
  accounts: Accounts,
  accountShells: AccountShell[];
  netBalance: number;
  exchangeRates?: any;
  averageTxFees: any;
  twoFAHelpFlags: {
      xprivGenerated: boolean | null;
      twoFAValid: boolean | null;
      twoFAResetted: boolean | null;
  };
  gifts : {
    [id: string]: Gift
  },
  exclusiveGiftCodes: {
    [exclusiveGiftCode: string]: boolean
  },
  selectedGiftId: string,
  giftCreationStatus: boolean,
  acceptedGiftId: string,
  addedGift: string,
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

  refreshed: boolean;
  testCoinsReceived: boolean,

  receiveAddress: string| null;
  hasReceiveAddressSucceeded: boolean | null;
  showAllAccount: boolean | null;
  resetTwoFALoader: boolean;
};

export const initialState: AccountsState = {
  accountsSynched: false,
  exchangeRates: null,

  averageTxFees: null,
  accounts: {
  },
  accountShells: [],
  netBalance: 0,
  twoFAHelpFlags: {
    xprivGenerated: null,
    twoFAValid: null,
    twoFAResetted: null,
  },
  gifts: {
  },
  exclusiveGiftCodes: {
  },
  selectedGiftId: null,
  giftCreationStatus: null,
  acceptedGiftId: '',
  addedGift: '',
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

  // currentWyreSubAccount: null,
  // currentRampSubAccount: null,
  // currentSwanSubAccount: null,

  refreshed: false,
  testCoinsReceived: false,

  receiveAddress: null,
  hasReceiveAddressSucceeded: false,
  showAllAccount: false,
  resetTwoFALoader: false,
}

export default ( state: AccountsState = initialState, action ): AccountsState => {

  switch ( action.type ) {
      case TESTCOINS_RECEIVED:
        return {
          ...state,
          testCoinsReceived: true
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
            twoFAValid: false,
          },
        }

        // TODO: I don't think averageTxFees should be a wallet-wide concern.
      case AVERAGE_TX_FEE:
        return {
          ...state,
          averageTxFees: action.payload.averageTxFees,
        }

      case ADD_NEW_ACCOUNT_SHELLS:
        return {
          ...state,
          isGeneratingNewAccountShell: true,
          hasNewAccountShellGenerationSucceeded: false,
          hasNewAccountShellGenerationFailed: false,
        }

      case NEW_ACCOUNT_SHELLS_ADDED:
        const newAccountShells = []
        const existingAccountShells = state.accountShells

        for( const shellToAdd of action.payload.accountShells ){
          let exists = false
          for( const existingShell of existingAccountShells ){
            if( existingShell.id === shellToAdd.id ){
              existingShell.primarySubAccount = shellToAdd.primarySubAccount
              exists = true
              break
            }
          }
          if( !exists ) newAccountShells.push( shellToAdd )
        }


        return {
          ...state,
          isGeneratingNewAccountShell: false,
          hasNewAccountShellGenerationSucceeded: true,
          accountShells: [ ...existingAccountShells, ...newAccountShells ],
          accounts: {
            ...state.accounts,
            ...action.payload.accounts
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

      case UPDATE_ACCOUNTS:
        return {
          ...state,
          accounts: {
            ...state.accounts,
            ...action.payload.accounts,
          },
        }

      case READ_TRANSACTION: {
        const { accountShells, accounts } = action.payload
        return {
          ...state,
          accountShells: accountShells,
          accounts: accounts,
        }
      }

      case ACCOUNT_CHECKED: {
        const { accountShells, accounts } = action.payload
        return {
          ...state,
          accountShells: accountShells,
          accounts: accounts,
        }
      }

      case UPDATE_ACCOUNT_SHELLS:
        const accounts = action.payload.accounts
        const shells = state.accountShells
        shells.forEach( ( shell )=>{
          const account: Account = accounts[ shell.primarySubAccount.id ]
          if( !account ) return shell

          const accountDetails = {
            accountName: account.accountName,
            accountDescription: account.accountDescription,
            accountXpub: account.xpub,
            accountVisibility: account.accountVisibility,
            hasNewTxn: account.hasNewTxn,
          }
          AccountShell.updatePrimarySubAccountDetails(
            shell,
            account.isUsable,
            account.balances,
            account.transactions,
            accountDetails
          )
          return shell
        } )

        return {
          ...state,
          accounts: {
            ...state.accounts,
            ...action.payload.accounts,
          },
          accountShells: shells,
        }

      case RECOMPUTE_NET_BALANCE:
        let netBalance = 0
        state.accountShells.forEach( ( accountShell: AccountShell ) => {
          if (
            accountShell.primarySubAccount.sourceKind !==
          SourceAccountKind.TEST_ACCOUNT && accountShell.primarySubAccount.visibility !== AccountVisibility.HIDDEN
          )
            netBalance += AccountShell.getTotalBalance( accountShell )
        } )
        return {
          ...state,
          netBalance
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
        }

      case ACCOUNT_SHELLS_REFRESH_STARTED:
        const shellsRefreshing: AccountShell[] = action.payload
        shellsRefreshing.forEach( refreshingShell => {
          state.accountShells.forEach(
            ( shell ) => {
              if( shell.id == refreshingShell.id ) shell.syncStatus = SyncStatus.IN_PROGRESS
              else shell.syncStatus = SyncStatus.COMPLETED
            }
          )
        } )
        return {
          ...state,
        }

      case ACCOUNT_SHELLS_REFRESH_COMPLETED:
        // Updating Account Sync State to shell data model
        // This will be used to display sync icon on Home Screen
        const shellsRefreshed: AccountShell[] = action.payload
        shellsRefreshed.forEach( refreshedShell => {
          state.accountShells.find(
            ( shell ) => shell.id == refreshedShell.id
          ).syncStatus = SyncStatus.COMPLETED
        } )
        return {
          ...state,
        }

        // case CLEAR_ACCOUNT_SYNC_CACHE:
        //   // This will clear the sync state at the start of each login session
        //   // This is required in order to ensure sync icon is shown again for each session
        //   state.accountShells.map(
        //     ( shell ) => shell.syncStatus = SyncStatus.PENDING )
        //   return {
        //     ...state,
        //   }

      case BLIND_REFRESH_STARTED:
        return {
          ...state,
          refreshed: action.payload.refreshed,
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

      case SET_SHOW_ALL_ACCOUNT:
        return {
          ...state,
          showAllAccount: action.payload.showAllAccount,
        }

      case RESET_ACCOUNT_UPDATE_FLAG:
        return {
          ...state,
          isUpdatingAccountSettings: false,
          hasAccountSettingsUpdateSucceeded: false,
          hasAccountSettingsUpdateFailed: false,
        }

      case RESET_TWO_FA_LOADER:
        return {
          ...state,
          resetTwoFALoader: action.payload.flag,
        }

      case GENERATE_GIFTS:
        return {
          ...state,
          selectedGiftId: null,
          giftCreationStatus: null
        }

      case GIFT_CREATION_STATUS:
        return {
          ...state,
          giftCreationStatus: action.payload.flag,
        }

      case UPDATE_GIFT:
        const gift: Gift = action.payload.gift
        const exclusiveGiftCodes = state.exclusiveGiftCodes? {
          ...state.exclusiveGiftCodes
        }: {
        }
        if( gift.exclusiveGiftCode ) exclusiveGiftCodes[ gift.exclusiveGiftCode ] = true

        return {
          ...state,
          gifts: {
            ...state.gifts,
            [ gift.id ]: gift
          },
          exclusiveGiftCodes,
          selectedGiftId: gift.id
        }

      case GIFT_ACCEPTED:
        return{
          ...state,
          acceptedGiftId: action.payload
        }

      case GIFT_ADDED:
        return{
          ...state,
          addedGift: action.payload
        }

      case SET_GIFTS:
        return {
          ...state,
          gifts: action.payload.gifts,
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
