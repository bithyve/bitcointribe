import { select, put } from 'redux-saga/effects';
import { sagaWatcherHelper, getPriority } from '../utils';
import { writeRegularAccount, writeSecureAccount } from 'hexaRedux';

var DataManager = require('hexaDataManager');

var utils = require('hexaUtils');

//  Types
const SEND_AMOUNT_T1 = 'SEND_AMOUNT_T1';
const UPDATE_DATA_T1 = 'UPDATE_DATA_T1';

const SEND_AMOUNT_T2 = 'SEND_AMOUNT_T2';
const UPDATE_DATA_T2 = 'UPDATE_DATA_T2';

const SEND_AMOUNT_T3 = 'SEND_AMOUNT_T3';
const UPDATE_DATA_T3 = 'UPDATE_DATA_T3';

const SEND_AMOUNT_SUCCESS = 'SEND_AMOUNT_SUCCESS';
const UPDATE_AMOUNT_SUCCESS = 'UPDATE_AMOUNT_SUCCESS';

const INITIAL_STATE = {
  sendAmountDataT1: {},
  sendAmountDataT2: {},
  sendAmountDataT3: {},
  sendAmountSuccess: {},
};

//  Actions
export const onSendAmountT1 = args => {
  return {
    type: SEND_AMOUNT_T1,
    ...args,
  };
};

export const onSendAmountT2 = () => {
  return {
    type: SEND_AMOUNT_T2,
  };
};

export const onSendAmountT3 = args => {
  return {
    type: SEND_AMOUNT_T3,
    ...args,
  };
};

export const onSendAmountSuccess = args => {
  return {
    type: SEND_AMOUNT_SUCCESS,
    ...args,
  };
};

// Reducers
export const paymentReducer = (state = INITIAL_STATE, action: any) => {
  console.log(action);
  switch (action.type) {
    case UPDATE_DATA_T1:
      return { ...state, ...action.payload };
    case UPDATE_DATA_T2:
      return { ...state, ...action.payload };
    case UPDATE_DATA_T3:
      return { ...state, ...action.payload };
    case UPDATE_AMOUNT_SUCCESS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// Worker
function* workerOnSendAmountT1(action: any) {
  const { accountsStateReducer } = yield select(state => state);
  try {
    const {
      arr_SelectAccountDetails,
      address,
      amount,
      tranPrio,
      memo,
    } = action;
    const { regularAccount, secureAccount } = accountsStateReducer;
    console.log({ regularAccount, secureAccount });
    let amountFloat = parseFloat(amount);
    let priority = getPriority(tranPrio);
    let walletDetails = yield utils.getWalletDetails();
    var resTransferST;
    if (arr_SelectAccountDetails.accountName == 'Regular Account') {
      resTransferST = yield regularAccount.transferST1(
        address,
        amountFloat,
        priority,
      );
      yield writeRegularAccount({ regularAccount });
      //  yield bitcoinClassState.setRegularClassState( regularAccount );
    } else {
      resTransferST = yield secureAccount.transferST1(
        address,
        amountFloat,
        priority,
      );
      yield writeSecureAccount({ secureAccount });
      // yield bitcoinClassState.setSecureClassState( secureAccount );
    }
    yield put({
      type: UPDATE_DATA_T1,
      payload: {
        sendAmountDataT1: {
          mnemonic: walletDetails.mnemonic,
          amount,
          respAddress: address,
          bal: arr_SelectAccountDetails.balance,
          accountName: arr_SelectAccountDetails.accountName,
          memo,
          priority: priority,
          tranFee: resTransferST.data.fee.toString(),
          selectedAccount: arr_SelectAccountDetails,
          resTransferST: resTransferST,
        },
      },
    });
  } catch (error) {
    console.log('error', error);
  }
}

function* workerOnSendAmountT2() {
  const { accountsStateReducer, paymentReducer } = yield select(state => state);
  try {
    const { regularAccount, secureAccount } = accountsStateReducer;
    const { sendAmountDataT1 } = paymentReducer;
    var resTransferST;
    if (sendAmountDataT1.selectedAccount.accountName == 'Regular Account') {
      resTransferST = yield regularAccount.transferST2(
        sendAmountDataT1.resTransferST.data.inputs,
        sendAmountDataT1.resTransferST.data.txb,
      );
      yield writeRegularAccount({ regularAccount });
      //   yield bitcoinClassState.setRegularClassState( regularAccount );
    } else {
      resTransferST = yield secureAccount.transferST2(
        sendAmountDataT1.resTransferST.data.inputs,
        sendAmountDataT1.resTransferST.data.txb,
      );
      yield writeSecureAccount({ secureAccount });
      // yield bitcoinClassState.setSecureClassState( secureAccount );
    }
    yield put({
      type: UPDATE_DATA_T2,
      payload: {
        sendAmountDataT2: {
          sendAmountDataT1,
          resTransferST,
        },
      },
    });
  } catch (error) {
    console.log('error', error);
  }
}

function* workerOnSendAmountT3(action: any) {
  const { accountsStateReducer, paymentReducer } = yield select(state => state);
  try {
    const { token } = action;
    const { secureAccount } = accountsStateReducer;
    var { sendAmountDataT2 } = paymentReducer;
    sendAmountDataT2 = sendAmountDataT2.resTransferST;
    var resTransferST = yield secureAccount.transferST3(
      token,
      sendAmountDataT2.data.txHex,
      sendAmountDataT2.data.childIndexArray,
    );
    yield writeSecureAccount({ secureAccount });
    yield put({
      type: UPDATE_DATA_T3,
      payload: {
        sendAmountDataT3: {
          resTransferST,
        },
      },
    });
  } catch (error) {
    console.log('error', error);
  }
}

function* workerSendAmountSuccess(action: any) {
  try {
    const { tableName, accountType, totalBal } = action;
    let res = yield DataManager.updateAccountBalance(
      tableName,
      accountType,
      totalBal,
    );
    yield put({
      type: UPDATE_AMOUNT_SUCCESS,
      payload: {
        sendAmountSuccess: {
          res,
        },
      },
    });
  } catch (error) {
    console.log({ error });
  }
}

// Watcher
export const watcherOnSendAmountT1 = sagaWatcherHelper(
  workerOnSendAmountT1,
  SEND_AMOUNT_T1,
);
export const watcherOnSendAmountT2 = sagaWatcherHelper(
  workerOnSendAmountT2,
  SEND_AMOUNT_T2,
);
export const watcherOnSendAmountT3 = sagaWatcherHelper(
  workerOnSendAmountT3,
  SEND_AMOUNT_T3,
);

export const watcherSendAmountSuccess = sagaWatcherHelper(
  workerSendAmountSuccess,
  SEND_AMOUNT_SUCCESS,
);
