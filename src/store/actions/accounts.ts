// types and action creators: dispatched by components and sagas
export const FETCH_ADDR = 'FETCH_ADDR';
export const FETCH_BALANCE = 'FETCH_BALANCE';
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
export const SYNC_TRUSTED_DERIVATIVE_ACCOUNTS =
  'SYNC_TRUSTED_DERIVATIVE_ACCOUNTS';
export const EXCHANGE_RATE = 'EXCHANGE_RATE';
export const GENERATE_SECONDARY_XPRIV = 'GENERATE_SECONDARY_XPRIV';
export const RESET_TWO_FA = 'RESET_TWO_FA';
export const RUN_TEST = 'RUN_TEST';
export const FETCH_DERIVATIVE_ACC_XPUB = 'FETCH_DERIVATIVE_ACC_XPUB';
export const FETCH_DERIVATIVE_ACC_ADDRESS = 'FETCH_DERIVATIVE_ACC_ADDRESS';
export const FETCH_DERIVATIVE_ACC_BALANCE_TX =
  'FETCH_DERIVATIVE_ACC_BALANCE_TX';

export const fetchAddress = (serviceType) => {
  return { type: FETCH_ADDR, payload: { serviceType } };
};

export const fetchBalance = (
  serviceType,
  options?: { loader?; fetchTransactionsSync?; restore? },
) => {
  return { type: FETCH_BALANCE, payload: { serviceType, options } };
};

export const fetchTransactions = (serviceType, service?) => {
  return { type: FETCH_TRANSACTIONS, payload: { serviceType, service } };
};

export const fetchBalanceTx = (
  serviceType,
  options?: {
    service?;
    loader?;
    restore?;
    shouldNotInsert?;
    syncTrustedDerivative?;
  },
) => {
  return { type: FETCH_BALANCE_TX, payload: { serviceType, options } };
};

export const transferST1 = (serviceType, recipients, averageTxFees?) => {
  return {
    type: TRANSFER_ST1,
    payload: { serviceType, recipients, averageTxFees },
  };
};

export const transferST2 = (serviceType, txnPriority, nSequence?) => {
  return {
    type: TRANSFER_ST2,
    payload: { serviceType, txnPriority, nSequence },
  };
};

export const alternateTransferST2 = (serviceType, txnPriority, nSequence?) => {
  return {
    type: ALTERNATE_TRANSFER_ST2,
    payload: { serviceType, txnPriority, nSequence },
  };
};

export const transferST3 = (serviceType, token) => {
  //Secure account specific
  return { type: TRANSFER_ST3, payload: { serviceType, token } };
};

export const getTestcoins = (serviceType) => {
  // Test account specific
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

export const clearTransfer = (serviceType) => {
  return { type: CLEAR_TRANSFER, payload: { serviceType } };
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

export const syncTrustedDerivativeAccounts = (service) => {
  return { type: SYNC_TRUSTED_DERIVATIVE_ACCOUNTS, payload: { service } };
};

export const calculateExchangeRate = () => {
  return { type: EXCHANGE_RATE };
};

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
) => {
  return {
    type: FETCH_DERIVATIVE_ACC_ADDRESS,
    payload: { serviceType, accountType, accountNumber },
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

// types and action creators (saga): dispatched by saga workers
export const ADDR_FETCHED = 'ADDR_FETCHED';
export const BALANCE_FETCHED = 'BALANCE_FETCHED';
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

export const testcoinsReceived = (serviceType, service) => {
  return { type: TESTCOINS_RECEIVED, payload: { serviceType, service } };
};

export const addressFetched = (serviceType, address) => {
  return { type: ADDR_FETCHED, payload: { serviceType, address } };
};

export const balanceFetched = (serviceType, balances) => {
  return { type: BALANCE_FETCHED, payload: { serviceType, balances } };
};

export const transactionsFetched = (serviceType, transactions) => {
  return { type: TRANSACTIONS_FETCHED, payload: { serviceType, transactions } };
};

export const executedST1 = (serviceType, result) => {
  return { type: TRANSFER_ST1_EXECUTED, payload: { serviceType, result } };
};

export const failedST1 = (serviceType) => {
  return { type: TRANSFER_ST1_FAILED, payload: { serviceType } };
};

export const executedST2 = (serviceType, result) => {
  return { type: TRANSFER_ST2_EXECUTED, payload: { serviceType, result } };
};

export const failedST2 = (serviceType) => {
  return { type: TRANSFER_ST2_FAILED, payload: { serviceType } };
};

export const executedST3 = (serviceType, result) => {
  // Secure account specific
  return { type: TRANSFER_ST3_EXECUTED, payload: { serviceType, result } };
};

export const failedST3 = (serviceType) => {
  return { type: TRANSFER_ST3_FAILED, payload: { serviceType } };
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
