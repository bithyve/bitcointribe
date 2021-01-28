import { Action } from 'redux'
import AccountShell from '../../common/data/models/AccountShell'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'

// types and action creators: dispatched by components and sagas
export const FETCH_TRANSACTIONS = 'FETCH_TRANSACTIONS'
export const FETCH_BALANCE_TX = 'FETCH_BALANCE_TX'
export const TRANSFER_ST1 = 'TRANSFER_ST1'
export const TRANSFER_ST2 = 'TRANSFER_ST2'
export const ALTERNATE_TRANSFER_ST2 = 'ALTERNATE_TRANSFER_ST2'
export const TRANSFER_ST3 = 'TRANSFER_ST3'
export const GET_TESTCOINS = 'GET_TESTCOINS'
export const ADD_TRANSFER_DETAILS = 'ADD_TRANSFER_DETAILS'
export const REMOVE_TRANSFER_DETAILS = 'REMOVE_TRANSFER_DETAILS'
export const CLEAR_TRANSFER = 'CLEAR_TRANSFER'
export const ACCUMULATIVE_BAL_AND_TX = 'ACCUMULATIVE_BAL_AND_TX'
export const FETCH_FEE_AND_EXCHANGE_RATES = 'FETCH_FEE_AND_EXCHANGE_RATES'
export const STARTUP_SYNC = 'STARTUP_SYNC'
export const SYNC_ACCOUNTS = 'SYNC_ACCOUNTS'
export const CLEAR_ACCOUNT_SYNC_CACHE = 'CLEAR_ACCOUNT_SYNC_CACHE'
export const SYNC_VIA_XPUB_AGENT = 'SYNC_VIA_XPUB_AGENT'
export const GENERATE_SECONDARY_XPRIV = 'GENERATE_SECONDARY_XPRIV'
export const RESET_TWO_FA = 'RESET_TWO_FA'
export const RUN_TEST = 'RUN_TEST'
export const FETCH_DERIVATIVE_ACC_XPUB = 'FETCH_DERIVATIVE_ACC_XPUB'
export const FETCH_DERIVATIVE_ACC_BALANCE_TX =
  'FETCH_DERIVATIVE_ACC_BALANCE_TX'
export const REMOVE_TWO_FA = 'REMOVE_TWO_FA'
export const VALIDATE_TWO_FA = 'VALIDATE_TWO_FA'
export const AVERAGE_TX_FEE = 'AVERAGE_TX_FEE'
export const SETUP_DONATION_ACCOUNT = 'SETUP_DONATION_ACCOUNT'
export const UPDATE_DONATION_PREFERENCES = 'UPDATE_DONATION_PREFERENCES'
export const ADD_NEW_ACCOUNT_SHELL = 'ADD_NEW_ACCOUNT_SHELL'
export const ADD_NEW_SECONDARY_SUBACCOUNT = 'ADD_NEW_SECONDARY_SUBACCOUNT'
export const ADD_NEW_ACCOUNT_SHELL_COMPLETED =
  'ADD_NEW_ACCOUNT_SHELL_COMPLETED'
export const UPDATE_SUB_ACCOUNT_SETTINGS = 'UPDATE_SUB_ACCOUNT_SETTINGS'
export const SUB_ACCOUNT_SETTINGS_UPDATE_COMPLETED =
  'SUB_ACCOUNT_SETTINGS_UPDATE_COMPLETED'
export const REASSIGN_TRANSACTIONS = 'REASSIGN_TRANSACTIONS'
export const TRANSACTION_REASSIGNMENT_COMPLETED =
  'TRANSACTION_REASSIGNMENT_COMPLETED'
export const MERGE_ACCOUNT_SHELLS = 'MERGE_ACCOUNT_SHELLS'
export const ACCOUNT_SHELL_MERGE_COMPLETED = 'ACCOUNT_SHELL_MERGE_COMPLETED'
export const ACCOUNT_SHELLS_ORDER_UPDATED = 'ACCOUNT_SHELLS_ORDER_UPDATED'
export const ACCOUNT_SHELL_ORDERED_TO_FRONT = 'ACCOUNT_SHELL_ORDERED_TO_FRONT'
export const REFRESH_ACCOUNT_SHELL = 'REFRESH_ACCOUNT_SHELL'
export const ACCOUNT_SHELL_REFRESH_COMPLETED =
  'ACCOUNT_SHELL_REFRESH_COMPLETED'
export const REMAP_ACCOUNT_SHELLS = 'REMAP_ACCOUNT_SHELLS'

export const fetchTransactions = ( serviceType, service? ) => {
  return {
    type: FETCH_TRANSACTIONS, payload: {
      serviceType, service
    }
  }
}

export const fetchBalanceTx = (
  serviceType,
  options: {
    service?;
    loader?;
    restore?;
    shouldNotInsert?;
    syncTrustedDerivative?;
  } = {
  }
) => {
  return {
    type: FETCH_BALANCE_TX, payload: {
      serviceType, options
    }
  }
}

export const transferST1 = (
  serviceType,
  recipients,
  averageTxFees,
  derivativeAccountDetails?: { type: string; number: number }
) => {
  return {
    type: TRANSFER_ST1,
    payload: {
      serviceType,
      recipients,
      averageTxFees,
      derivativeAccountDetails,
    },
  }
}

export const transferST2 = (
  serviceType,
  txnPriority,
  customTxPrerequisites?,
  derivativeAccountDetails?: { type: string; number: number },
  nSequence?
) => {
  return {
    type: TRANSFER_ST2,
    payload: {
      serviceType,
      txnPriority,
      customTxPrerequisites,
      derivativeAccountDetails,
      nSequence,
    },
  }
}

export const alternateTransferST2 = (
  serviceType,
  txnPriority,
  customTxPrerequisites?,
  derivativeAccountDetails?: { type: string; number: number },
  nSequence?
) => {
  return {
    type: ALTERNATE_TRANSFER_ST2,
    payload: {
      serviceType,
      txnPriority,
      customTxPrerequisites,
      derivativeAccountDetails,
      nSequence,
    },
  }
}

export const transferST3 = ( serviceType, token ) => {
  //Secure account specific
  return {
    type: TRANSFER_ST3, payload: {
      serviceType, token
    }
  }
}

export const getTestcoins = ( serviceType ) => {
  // Test account specific
  // console.log("Called getTestcoins", new Date())
  return {
    type: GET_TESTCOINS, payload: {
      serviceType
    }
  }
}

export const addTransferDetails = ( serviceType, recipientData ) => {
  return {
    type: ADD_TRANSFER_DETAILS,
    payload: {
      serviceType, recipientData
    },
  }
}

export const removeTransferDetails = ( serviceType, recipientData ) => {
  return {
    type: REMOVE_TRANSFER_DETAILS,
    payload: {
      serviceType, recipientData
    },
  }
}

export const clearTransfer = ( serviceType, stage? ) => {
  return {
    type: CLEAR_TRANSFER, payload: {
      serviceType, stage
    }
  }
}

export const accumulativeBalAndTx = () => {
  return {
    type: ACCUMULATIVE_BAL_AND_TX
  }
}

export const startupSync = ( restore? ) => {
  return {
    type: STARTUP_SYNC, payload: {
      restore
    }
  }
}

// To reset hasAccountSyncCompleted status of all shells
export const clearAccountSyncCache = () => {
  return {
    type: CLEAR_ACCOUNT_SYNC_CACHE
  }
}

export const syncAccounts = ( restore? ) => {
  return {
    type: SYNC_ACCOUNTS, payload: {
      restore
    }
  }
}

export const syncViaXpubAgent = (
  serviceType,
  derivativeAccountType,
  accountNumber
) => {
  return {
    type: SYNC_VIA_XPUB_AGENT,
    payload: {
      serviceType, derivativeAccountType, accountNumber
    },
  }
}

export const validateTwoFA = ( token: number ) => {
  return {
    type: VALIDATE_TWO_FA,
    payload: {
      token
    }
  }
}

export const removeTwoFA = () => {
  return {
    type: REMOVE_TWO_FA,
  }
}
export const fetchFeeAndExchangeRates = () => {
  return {
    type: FETCH_FEE_AND_EXCHANGE_RATES
  }
}

export const generateSecondaryXpriv = ( serviceType, secondaryMnemonic ) => {
  return {
    type: GENERATE_SECONDARY_XPRIV,
    payload: {
      serviceType, secondaryMnemonic
    },
  }
}

export const resetTwoFA = ( secondaryMnemonic ) => {
  return {
    type: RESET_TWO_FA,
    payload: {
      secondaryMnemonic
    },
  }
}

export const runTest = () => {
  return {
    type: RUN_TEST
  }
}

export const fetchDerivativeAccXpub = ( accountType, accountNumber? ) => {
  return {
    type: FETCH_DERIVATIVE_ACC_XPUB,
    payload: {
      accountType, accountNumber
    },
  }
}

export const fetchDerivativeAccBalTx = (
  serviceType,
  accountType,
  accountNumber?
) => {
  return {
    type: FETCH_DERIVATIVE_ACC_BALANCE_TX,
    payload: {
      serviceType, accountType, accountNumber
    },
  }
}

export const setAverageTxFee = ( averageTxFees ) => {
  return {
    type: AVERAGE_TX_FEE,
    payload: {
      averageTxFees
    },
  }
}

export const setupDonationAccount = (
  serviceType: string,
  donee: string,
  subject: string,
  description: string,
  configuration: {
    displayBalance: boolean;
    displayTransactions: boolean;
    displayTxDetails: boolean;
  },
  disableAccount?: boolean
) => {
  return {
    type: SETUP_DONATION_ACCOUNT,
    payload: {
      serviceType,
      donee,
      subject,
      description,
      configuration,
      disableAccount,
    },
  }
}

export const updateDonationPreferences = (
  serviceType: string,
  accountNumber: number,
  preferences: {
    disableAccount?: boolean;
    configuration?: {
      displayBalance: boolean;
      displayTransactions: boolean;
      displayTxDetails: boolean;
    };
    accountDetails?: {
      donee: string;
      subject: string;
      description: string;
    };
  }
) => {
  return {
    type: UPDATE_DONATION_PREFERENCES,
    payload: {
      serviceType, accountNumber, preferences
    },
  }
}

export const remapAccountShells = ( services ) => {
  return {
    type: REMAP_ACCOUNT_SHELLS, payload: {
      services
    }
  }
}

export const refreshAccountShell = (
  shell: AccountShell,
  options?: { autoSync?: boolean }
) => {
  return {
    type: REFRESH_ACCOUNT_SHELL, payload: {
      shell, options
    }
  }
}

export const accountShellRefreshCompleted = ( payload: AccountShell ) => {
  return {
    type: ACCOUNT_SHELL_REFRESH_COMPLETED,
    payload,
  }
}

export interface AddNewAccountShellAction extends Action {
  type: typeof ADD_NEW_ACCOUNT_SHELL;
  payload: SubAccountDescribing;
}

export const addNewAccountShell = (
  payload: SubAccountDescribing
): AddNewAccountShellAction => {
  return {
    type: ADD_NEW_ACCOUNT_SHELL,
    payload,
  }
}

export const addNewSecondarySubAccount = (
  secondarySubAccount: SubAccountDescribing,
  parentShell: AccountShell
) => {
  return {
    type: ADD_NEW_SECONDARY_SUBACCOUNT,
    payload: {
      secondarySubAccount, parentShell
    },
  }
}

export interface AddNewAccountShellCompletionAction extends Action {
  type: typeof ADD_NEW_ACCOUNT_SHELL_COMPLETED;
}

export const newAccountShellCreationCompleted = (): AddNewAccountShellCompletionAction => {
  return {
    type: ADD_NEW_ACCOUNT_SHELL_COMPLETED
  }
}

export interface UpdateSubAccountSettingsAction extends Action {
  type: typeof UPDATE_SUB_ACCOUNT_SETTINGS;
  payload: SubAccountDescribing;
}

export const updateSubAccountSettings = (
  payload: SubAccountDescribing
): UpdateSubAccountSettingsAction => {
  return {
    type: UPDATE_SUB_ACCOUNT_SETTINGS, payload
  }
}

export interface UpdateSubAccountSettingsCompletionAction extends Action {
  type: typeof SUB_ACCOUNT_SETTINGS_UPDATE_COMPLETED;
}

export const subAccountSettingsUpdateCompleted = (): UpdateSubAccountSettingsCompletionAction => {
  return {
    type: SUB_ACCOUNT_SETTINGS_UPDATE_COMPLETED
  }
}

export type ReassignTransactionsActionPayload = {
  transactionIDs: string[];
  sourceID: string;
  destinationID: string;
};

export interface ReassignTransactionsAction extends Action {
  type: typeof REASSIGN_TRANSACTIONS;
  payload: ReassignTransactionsActionPayload;
}

export const reassignTransactions = (
  payload: ReassignTransactionsActionPayload
): ReassignTransactionsAction => {
  return {
    type: REASSIGN_TRANSACTIONS, payload
  }
}

export interface TransactionReassignmentCompletionAction extends Action {
  type: typeof TRANSACTION_REASSIGNMENT_COMPLETED;
}

export const transactionReassignmentCompleted = (): TransactionReassignmentCompletionAction => {
  return {
    type: TRANSACTION_REASSIGNMENT_COMPLETED
  }
}

export type MergeAccountShellsActionPayload = {
  source: AccountShell;
  destination: AccountShell;
};

export interface MergeAccountShellsAction extends Action {
  type: typeof MERGE_ACCOUNT_SHELLS;
  payload: MergeAccountShellsActionPayload;
}

export const mergeAccountShells = (
  payload: MergeAccountShellsActionPayload
): MergeAccountShellsAction => {
  return {
    type: MERGE_ACCOUNT_SHELLS, payload
  }
}

export interface AccountShellMergeCompletionAction extends Action {
  type: typeof ACCOUNT_SHELL_MERGE_COMPLETED;
}

export const accountShellMergeCompleted = (): AccountShellMergeCompletionAction => {
  return {
    type: ACCOUNT_SHELL_MERGE_COMPLETED
  }
}

export interface AccountShellsOrderUpdatedAction extends Action {
  type: typeof ACCOUNT_SHELLS_ORDER_UPDATED;
  payload: AccountShell[];
}

export const accountShellsOrderUpdated = (
  payload: AccountShell[]
): AccountShellsOrderUpdatedAction => {
  return {
    type: ACCOUNT_SHELLS_ORDER_UPDATED,
    payload,
  }
}

export interface AccountShellOrderedToFrontAction extends Action {
  type: typeof ACCOUNT_SHELL_ORDERED_TO_FRONT;
  payload: AccountShell;
}

export const accountShellOrderedToFront = (
  payload: AccountShell
): AccountShellOrderedToFrontAction => {
  return {
    type: ACCOUNT_SHELL_ORDERED_TO_FRONT,
    payload,
  }
}

// types and action creators (saga): dispatched by saga workers
export const TESTCOINS_RECEIVED = 'TESTCOINS_RECEIVED'
export const TRANSACTIONS_FETCHED = 'TRANSACTIONS_FETCHED'
export const TRANSFER_ST1_EXECUTED = 'TRANSFER_ST1_EXECUTED'
export const TRANSFER_ST1_FAILED = 'TRANSFER_ST1_FAILED'
export const TRANSFER_ST2_EXECUTED = 'TRANSFER_ST2_EXECUTED'
export const TRANSFER_ST2_FAILED = 'TRANSFER_ST2_FAILED'
export const TRANSFER_ST3_EXECUTED = 'TRANSFER_SECURE_ST3_EXECUTED'
export const TRANSFER_ST3_FAILED = 'TRANSFER_ST3_FAILED'
export const ACCOUNTS_LOADING = 'ACCOUNTS_LOADING'
export const ACCOUNTS_SYNCHED = 'ACCOUNTS_SYNCHED'
export const EXCHANGE_RATE_CALCULATED = 'EXCHANGE_RATE_CALCULATED'
export const ALTERNATE_TRANSFER_ST2_EXECUTED =
  'ALTERNATE_TRANSFER_ST2_EXECUTED'
export const SECONDARY_XPRIV_GENERATED = 'SECONDARY_XPRIV_GENERATED'
export const TWO_FA_VALID = 'TWO_FA_VALID'
export const TWO_FA_RESETTED = 'TWO_FA_RESETTED'
export const SETTED_DONATION_ACC = 'SETTED_DONATION_ACC'
export const NEW_ACCOUNT_SHELL_ADDED = 'NEW_ACCOUNT_SHELL_ADDED'
export const NEW_ACCOUNT_ADD_FAILED = 'NEW_ACCOUNT_ADD_FAILED'
export const RESTORED_ACCOUNT_SHELLS = 'RESTORED_ACCOUNT_SHELLS'
export const ACCOUNT_SETTINGS_UPDATED = 'ACCOUNT_SETTINGS_UPDATED'
export const ACCOUNT_SETTINGS_UPDATE_FAILED = 'ACCOUNT_SETTINGS_UPDATE_FAILED'
export const TRANSACTION_REASSIGNMENT_SUCCEEDED =
  'TRANSACTION_REASSIGNMENT_SUCCEEDED'
export const TRANSACTION_REASSIGNMENT_FAILED =
  'TRANSACTION_REASSIGNMENT_FAILED'
export const ACCOUNT_SHELL_MERGE_SUCCEEDED = 'ACCOUNT_SHELL_MERGE_SUCCEEDED'
export const ACCOUNT_SHELL_MERGE_FAILED = 'ACCOUNT_SHELL_MERGE_FAILED'

export const testcoinsReceived = ( serviceType, service ) => {
  return {
    type: TESTCOINS_RECEIVED, payload: {
      serviceType, service
    }
  }
}

export const transactionsFetched = ( serviceType, transactions ) => {
  return {
    type: TRANSACTIONS_FETCHED, payload: {
      serviceType, transactions
    }
  }
}

export const executedST1 = ( serviceType, result ) => {
  return {
    type: TRANSFER_ST1_EXECUTED, payload: {
      serviceType, result
    }
  }
}

export const failedST1 = ( serviceType, errorDetails ) => {
  return {
    type: TRANSFER_ST1_FAILED, payload: {
      serviceType, errorDetails
    }
  }
}

export const executedST2 = ( serviceType, result ) => {
  return {
    type: TRANSFER_ST2_EXECUTED, payload: {
      serviceType, result
    }
  }
}

export const failedST2 = ( serviceType, errorDetails ) => {
  return {
    type: TRANSFER_ST2_FAILED, payload: {
      serviceType, errorDetails
    }
  }
}

export const executedST3 = ( serviceType, result ) => {
  // Secure account specific
  return {
    type: TRANSFER_ST3_EXECUTED, payload: {
      serviceType, result
    }
  }
}

export const failedST3 = ( serviceType, errorDetails ) => {
  return {
    type: TRANSFER_ST3_FAILED, payload: {
      serviceType, errorDetails
    }
  }
}

export const switchLoader = ( serviceType, beingLoaded ) => {
  return {
    type: ACCOUNTS_LOADING, payload: {
      serviceType, beingLoaded
    }
  }
}

export const accountsSynched = ( synched ) => {
  return {
    type: ACCOUNTS_SYNCHED, payload: {
      synched
    }
  }
}

export const exchangeRatesCalculated = ( exchangeRates ) => {
  return {
    type: EXCHANGE_RATE_CALCULATED, payload: {
      exchangeRates
    }
  }
}

export const alternateTransferST2Executed = ( serviceType, result ) => {
  return {
    type: ALTERNATE_TRANSFER_ST2_EXECUTED,
    payload: {
      serviceType, result
    },
  }
}

export const secondaryXprivGenerated = ( generated ) => {
  return {
    type: SECONDARY_XPRIV_GENERATED, payload: {
      generated
    }
  }
}
export const twoFAValid = ( isValid: boolean ) => {
  return {
    type: TWO_FA_VALID,
    payload: {
      isValid
    }
  }
}
export const twoFAResetted = ( resetted ) => {
  return {
    type: TWO_FA_RESETTED, payload: {
      resetted
    }
  }
}

export const settedDonationAccount = ( serviceType, successful ) => {
  return {
    type: SETTED_DONATION_ACC, payload: {
      serviceType, successful
    }
  }
}

export const newAccountShellAddFailed = ( {
  accountShell,
  error,
}: {
  accountShell: AccountShell;
  error: Error;
} ) => {
  return {
    type: NEW_ACCOUNT_ADD_FAILED, payload: {
      accountShell, error
    }
  }
}

export const newAccountShellAdded = ( { accountShell, }: {
  accountShell: AccountShell;
} ) => {
  return {
    type: NEW_ACCOUNT_SHELL_ADDED,
    payload: accountShell
  }
}

export const restoredAccountShells = ( { accountShells, }: {
  accountShells: AccountShell[];
} ) => {
  return {
    type: RESTORED_ACCOUNT_SHELLS, payload: {
      accountShells
    }
  }
}

export const accountSettingsUpdateFailed = ( {
  account,
  error,
}: {
  account: SubAccountDescribing;
  error: Error;
} ) => {
  return {
    type: ACCOUNT_SETTINGS_UPDATE_FAILED, payload: {
      account, error
    }
  }
}

export const accountSettingsUpdated = ( { account, }: {
  account: SubAccountDescribing;
} ) => {
  return {
    type: ACCOUNT_SETTINGS_UPDATED, payload: account
  }
}

export const transactionReassignmentFailed = (
  payload: ReassignTransactionsActionPayload & { error: Error }
) => {
  return {
    type: TRANSACTION_REASSIGNMENT_FAILED,
    payload,
  }
}

export const transactionReassignmentSucceeded = (
  payload: ReassignTransactionsActionPayload
) => {
  return {
    type: TRANSACTION_REASSIGNMENT_SUCCEEDED, payload
  }
}

export const accountShellMergeFailed = (
  payload: MergeAccountShellsActionPayload & { error: Error }
) => {
  return {
    type: ACCOUNT_SHELL_MERGE_FAILED,
    payload,
  }
}

export const accountShellMergeSucceeded = (
  payload: MergeAccountShellsActionPayload
) => {
  return {
    type: ACCOUNT_SHELL_MERGE_SUCCEEDED, payload
  }
}
