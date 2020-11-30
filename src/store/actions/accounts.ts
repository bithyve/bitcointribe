import { Action } from "redux";
import AccountShell from "../../common/data/models/AccountShell";
// types and action creators: dispatched by components and sagas

import SubAccountDescribing from "../../common/data/models/SubAccountInfo/Interfaces";

export const FETCH_TRANSACTIONS = 'FETCH_TRANSACTIONS';
export const FETCH_BALANCE_TX = 'FETCH_BALANCE_TX';
export const TRANSFER_ST1 = 'TRANSFER_ST1';
export const TRANSFER_ST2 = 'TRANSFER_ST2';
export const ALTERNATE_TRANSFER_ST2 = 'ALTERNATE_TRANSFER_ST2';
export const TRANSFER_ST3 = 'TRANSFER_ST3';
export const GET_TESTCOINS = 'GET_TESTCOINS';
export const ADD_TRANSFER_DETAILS = 'ADD_TRANSFER_DETAILS';
export const REMOVE_TRANSFER_DETAILS = 'REMOVE_TRANSFER_DETAILS';
export const CLEAR_TRANSFER = 'CLEAR_TRANSFER';
export const ACCUMULATIVE_BAL_AND_TX = 'ACCUMULATIVE_BAL_AND_TX';
export const STARTUP_SYNC = 'STARTUP_SYNC';
export const SYNC_ACCOUNTS = 'SYNC_ACCOUNTS';
export const SYNC_VIA_XPUB_AGENT = 'SYNC_VIA_XPUB_AGENT';
export const GENERATE_SECONDARY_XPRIV = 'GENERATE_SECONDARY_XPRIV';
export const RESET_TWO_FA = 'RESET_TWO_FA';
export const RUN_TEST = 'RUN_TEST';
export const FETCH_DERIVATIVE_ACC_XPUB = 'FETCH_DERIVATIVE_ACC_XPUB';
export const FETCH_DERIVATIVE_ACC_ADDRESS = 'FETCH_DERIVATIVE_ACC_ADDRESS';
export const FETCH_DERIVATIVE_ACC_BALANCE_TX =
  'FETCH_DERIVATIVE_ACC_BALANCE_TX';
export const REMOVE_TWO_FA = 'REMOVE_TWO_FA';
export const AVERAGE_TX_FEE = 'AVERAGE_TX_FEE';
export const SETUP_DONATION_ACCOUNT = 'SETUP_DONATION_ACCOUNT';
export const UPDATE_DONATION_PREFERENCES = 'UPDATE_DONATION_PREFERENCES';
export const ADD_NEW_ACCOUNT = 'ADD_NEW_ACCOUNT';
export const ADD_NEW_ACCOUNT_COMPLETED = 'ADD_NEW_ACCOUNT_COMPLETED';
export const UPDATE_ACCOUNT_SETTINGS = 'UPDATE_ACCOUNT_SETTINGS';
export const ACCOUNT_SETTINGS_UPDATE_COMPLETED = 'ACCOUNT_SETTINGS_UPDATE_COMPLETED';
export const REASSIGN_TRANSACTIONS = 'REASSIGN_TRANSACTIONS';
export const TRANSACTION_REASSIGNMENT_COMPLETED = 'TRANSACTION_REASSIGNMENT_COMPLETED';

export const fetchTransactions = (serviceType, service?) => {
  return { type: FETCH_TRANSACTIONS, payload: { serviceType, service } };
};

export const fetchBalanceTx = (
  serviceType,
  options: {
    service?;
    loader?;
    restore?;
    shouldNotInsert?;
    syncTrustedDerivative?;
  } = {},
) => {
  return { type: FETCH_BALANCE_TX, payload: { serviceType, options } };
};

export const transferST1 = (
  serviceType,
  recipients,
  averageTxFees,
  derivativeAccountDetails?: { type: string; number: number },
) => {
  return {
    type: TRANSFER_ST1,
    payload: {
      serviceType,
      recipients,
      averageTxFees,
      derivativeAccountDetails,
    },
  };
};

export const transferST2 = (
  serviceType,
  txnPriority,
  customTxPrerequisites?,
  derivativeAccountDetails?: { type: string; number: number },
  nSequence?,
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
  };
};

export const alternateTransferST2 = (
  serviceType,
  txnPriority,
  customTxPrerequisites?,
  derivativeAccountDetails?: { type: string; number: number },
  nSequence?,
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
  };
};

export const transferST3 = (serviceType, token) => {
  //Secure account specific
  return { type: TRANSFER_ST3, payload: { serviceType, token } };
};

export const getTestcoins = (serviceType) => {
  // Test account specific
  // console.log("Called getTestcoins", new Date())
  return { type: GET_TESTCOINS, payload: { serviceType } };
};

export const addTransferDetails = (serviceType, recipientData) => {
  return {
    type: ADD_TRANSFER_DETAILS,
    payload: { serviceType, recipientData },
  };
};

export const removeTransferDetails = (serviceType, recipientData) => {
  return {
    type: REMOVE_TRANSFER_DETAILS,
    payload: { serviceType, recipientData },
  };
};

export const clearTransfer = (serviceType, stage?) => {
  return { type: CLEAR_TRANSFER, payload: { serviceType, stage } };
};

export const accumulativeBalAndTx = () => {
  return { type: ACCUMULATIVE_BAL_AND_TX };
};

export const startupSync = (restore?) => {
  return { type: STARTUP_SYNC, payload: { restore } };
};

export const syncAccounts = (restore?) => {
  return { type: SYNC_ACCOUNTS, payload: { restore } };
};

export const syncViaXpubAgent = (
  serviceType,
  derivativeAccountType,
  accountNumber,
) => {
  return {
    type: SYNC_VIA_XPUB_AGENT,
    payload: { serviceType, derivativeAccountType, accountNumber },
  };
};

export const removeTwoFA = () => {
  return {
    type: REMOVE_TWO_FA,
  };
};
// export const calculateExchangeRate = () => {
//   return { type: EXCHANGE_RATE };
// };

export const generateSecondaryXpriv = (serviceType, secondaryMnemonic) => {
  return {
    type: GENERATE_SECONDARY_XPRIV,
    payload: { serviceType, secondaryMnemonic },
  };
};

export const resetTwoFA = (secondaryMnemonic) => {
  return {
    type: RESET_TWO_FA,
    payload: { secondaryMnemonic },
  };
};

export const runTest = () => {
  return { type: RUN_TEST };
};

export const fetchDerivativeAccXpub = (accountType, accountNumber?) => {
  return {
    type: FETCH_DERIVATIVE_ACC_XPUB,
    payload: { accountType, accountNumber },
  };
};

export const fetchDerivativeAccAddress = (
  serviceType,
  accountType,
  accountNumber?,
  accountName?,
) => {
  return {
    type: FETCH_DERIVATIVE_ACC_ADDRESS,
    payload: { serviceType, accountType, accountNumber, accountName },
  };
};

export const fetchDerivativeAccBalTx = (
  serviceType,
  accountType,
  accountNumber?,
) => {
  return {
    type: FETCH_DERIVATIVE_ACC_BALANCE_TX,
    payload: { serviceType, accountType, accountNumber },
  };
};

export const setAverageTxFee = (averageTxFees) => {
  return {
    type: AVERAGE_TX_FEE,
    payload: { averageTxFees },
  };
};

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
  disableAccount?: boolean,
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
  };
};

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
  },
) => {
  return {
    type: UPDATE_DONATION_PREFERENCES,
    payload: { serviceType, accountNumber, preferences },
  };
};

export interface AddNewAccountAction extends Action {
  type: typeof ADD_NEW_ACCOUNT;
  payload: SubAccountDescribing;
};

export const addNewAccount = (payload: SubAccountDescribing): AddNewAccountAction => {
  return {
    type: ADD_NEW_ACCOUNT,
    payload,
  }
}
export interface AddNewAccountCompletionAction extends Action {
  type: typeof ADD_NEW_ACCOUNT_COMPLETED;
};

export const newAccountAddCompleted = (): AddNewAccountCompletionAction => {
  return { type: ADD_NEW_ACCOUNT_COMPLETED };
};

export interface UpdateAccountSettingsAction extends Action {
  type: typeof UPDATE_ACCOUNT_SETTINGS;
  payload: SubAccountDescribing;
};

export const updateAccountSettings = (payload: SubAccountDescribing): UpdateAccountSettingsAction => {
  return { type: UPDATE_ACCOUNT_SETTINGS, payload };
};

export interface UpdateAccountSettingsCompletionAction extends Action {
  type: typeof ACCOUNT_SETTINGS_UPDATE_COMPLETED;
};

export const accountSettingsUpdateCompleted = (): UpdateAccountSettingsCompletionAction => {
  return { type: ACCOUNT_SETTINGS_UPDATE_COMPLETED };
};

export type ReassignTransactionsActionPayload = {
  transactionIDs: string[];
  sourceID: string;
  destinationID: string;
};

export interface ReassignTransactionsAction extends Action {
  type: typeof REASSIGN_TRANSACTIONS;
  payload: ReassignTransactionsActionPayload;
};

export const reassignTransactions = (payload: ReassignTransactionsActionPayload): ReassignTransactionsAction => {
  return { type: REASSIGN_TRANSACTIONS, payload };
};

export interface TransactionReassignmentCompletionAction extends Action {
  type: typeof TRANSACTION_REASSIGNMENT_COMPLETED;
};

export const transactionReassignmentCompleted = (): TransactionReassignmentCompletionAction => {
  return { type: TRANSACTION_REASSIGNMENT_COMPLETED };
};


// types and action creators (saga): dispatched by saga workers
export const TESTCOINS_RECEIVED = 'TESTCOINS_RECEIVED';
export const TRANSACTIONS_FETCHED = 'TRANSACTIONS_FETCHED';
export const TRANSFER_ST1_EXECUTED = 'TRANSFER_ST1_EXECUTED';
export const TRANSFER_ST1_FAILED = 'TRANSFER_ST1_FAILED';
export const TRANSFER_ST2_EXECUTED = 'TRANSFER_ST2_EXECUTED';
export const TRANSFER_ST2_FAILED = 'TRANSFER_ST2_FAILED';
export const TRANSFER_ST3_EXECUTED = 'TRANSFER_SECURE_ST3_EXECUTED';
export const TRANSFER_ST3_FAILED = 'TRANSFER_ST3_FAILED';
export const ACCOUNTS_LOADING = 'ACCOUNTS_LOADING';
export const ACCOUNTS_SYNCHED = 'ACCOUNTS_SYNCHED';
export const EXCHANGE_RATE_CALCULATED = 'EXCHANGE_RATE_CALCULATED';
export const ALTERNATE_TRANSFER_ST2_EXECUTED =
  'ALTERNATE_TRANSFER_ST2_EXECUTED';
export const SECONDARY_XPRIV_GENERATED = 'SECONDARY_XPRIV_GENERATED';
export const TWO_FA_RESETTED = 'TWO_FA_RESETTED';
export const SETTED_DONATION_ACC = 'SETTED_DONATION_ACC';
export const NEW_ACCOUNT_ADDED = 'NEW_ACCOUNT_ADDED';
export const NEW_ACCOUNT_ADD_FAILED = 'NEW_ACCOUNT_ADD_FAILED';
export const ACCOUNT_SETTINGS_UPDATED = 'ACCOUNT_SETTINGS_UPDATED';
export const ACCOUNT_SETTINGS_UPDATE_FAILED = 'ACCOUNT_SETTINGS_UPDATE_FAILED';
export const TRANSACTION_REASSIGNMENT_SUCCEEDED = 'TRANSACTION_REASSIGNMENT_SUCCEEDED';
export const TRANSACTION_REASSIGNMENT_FAILED = 'TRANSACTION_REASSIGNMENT_FAILED';

export const testcoinsReceived = (serviceType, service) => {
  return { type: TESTCOINS_RECEIVED, payload: { serviceType, service } };
};

export const transactionsFetched = (serviceType, transactions) => {
  return { type: TRANSACTIONS_FETCHED, payload: { serviceType, transactions } };
};

export const executedST1 = (serviceType, result) => {
  return { type: TRANSFER_ST1_EXECUTED, payload: { serviceType, result } };
};

export const failedST1 = (serviceType, errorDetails) => {
  return { type: TRANSFER_ST1_FAILED, payload: { serviceType, errorDetails } };
};

export const executedST2 = (serviceType, result) => {
  return { type: TRANSFER_ST2_EXECUTED, payload: { serviceType, result } };
};

export const failedST2 = (serviceType, errorDetails) => {
  return { type: TRANSFER_ST2_FAILED, payload: { serviceType, errorDetails } };
};

export const executedST3 = (serviceType, result) => {
  // Secure account specific
  return { type: TRANSFER_ST3_EXECUTED, payload: { serviceType, result } };
};

export const failedST3 = (serviceType, errorDetails) => {
  return { type: TRANSFER_ST3_FAILED, payload: { serviceType, errorDetails } };
};

export const switchLoader = (serviceType, beingLoaded) => {
  return { type: ACCOUNTS_LOADING, payload: { serviceType, beingLoaded } };
};

export const accountsSynched = (synched) => {
  return { type: ACCOUNTS_SYNCHED, payload: { synched } };
};

export const exchangeRatesCalculated = (exchangeRates) => {
  return { type: EXCHANGE_RATE_CALCULATED, payload: { exchangeRates } };
};

export const alternateTransferST2Executed = (serviceType, result) => {
  return {
    type: ALTERNATE_TRANSFER_ST2_EXECUTED,
    payload: { serviceType, result },
  };
};

export const secondaryXprivGenerated = (generated) => {
  return { type: SECONDARY_XPRIV_GENERATED, payload: { generated } };
};

export const twoFAResetted = (resetted) => {
  return { type: TWO_FA_RESETTED, payload: { resetted } };
};

export const settedDonationAccount = (serviceType, successful) => {
  return { type: SETTED_DONATION_ACC, payload: { serviceType, successful } };
};

export const newAccountAddFailed = ({ accountShell, error }: {
  accountShell: AccountShell,
  error: Error,
}) => {
  return { type: NEW_ACCOUNT_ADD_FAILED, payload: { accountShell, error } };
};

export const newAccountAdded = ({ accountShell }: {
  accountShell: AccountShell,
}) => {
  return { type: NEW_ACCOUNT_ADDED, payload: accountShell };
};


export const accountSettingsUpdateFailed = (
  {
    account,
    error
  }: {
    account: SubAccountDescribing,
    error: Error
  }) => {
  return { type: ACCOUNT_SETTINGS_UPDATE_FAILED, payload: { account, error } };
}

export const accountSettingsUpdated = ({ account }: { account: SubAccountDescribing }) => {
  return { type: ACCOUNT_SETTINGS_UPDATED, payload: account };
};


export const transactionReassignmentFailed = (
  payload: ReassignTransactionsActionPayload & { error: Error }
) => {
  return {
    type: TRANSACTION_REASSIGNMENT_FAILED,
    payload,
  };
};

// export const transactionReassignmentSucceeded = ({
export const transactionReassignmentSucceeded = (payload: ReassignTransactionsActionPayload) => {
  // transactionIDs,
  // sourceID,
  // destinationID,
// }: ReassignTransactionsActionPayload) => {
  return { type: TRANSACTION_REASSIGNMENT_SUCCEEDED, payload };
};
