import { select, put } from 'redux-saga/effects';
import { S3Service, RegularAccount, SecureAccount } from 'hexaBitcoin';
import { createMnemonic, sagaWatcherHelper } from '../utils';

// Types
const SETUP_ACCOUNTS = 'SETUP_ACCOUNTS';
const SETUP_ACCOUNTS_SUCCESS = 'SETUP_ACCOUNTS_SUCCESS';
const CREATE_REGULAR_ACCOUNT = 'CREATE_REGULAR_ACCOUNT';
const UPDATE_REGULAR_ACCOUNT = 'UPDATE_REGULAR_ACCOUNT';
const CREATE_SECURE_ACCOUNT = 'CREATE_SECURE_ACCOUNT';
const UPDATE_SECURE_ACCOUNT = 'UPDATE_SECURE_ACCOUNT';
const CREATE_SSS = 'CREATE_SSS';
const UPDATE_SSS = 'UPDATE_SSS';

// types
// regular balance
// update regular balance

// secure balance
// update secure balance

// regular address
// update regular address
// secure address
// update secure address

const INITIAL_STATE = {
  mnemonic: undefined,
  regularAccount: undefined,
  secureAccount: undefined,
  sss: undefined,
};

// Actions
export const setupAccounts = () => {
  return {
    type: SETUP_ACCOUNTS,
  };
};

export const createRegularAccount = () => {
  return {
    type: CREATE_REGULAR_ACCOUNT,
  };
};

export const createSecureAccount = () => {
  return {
    type: CREATE_SECURE_ACCOUNT,
  };
};

export const createSSS = () => {
  return {
    type: CREATE_SSS,
  };
};

// Reducers
export const walletReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case SETUP_ACCOUNTS_SUCCESS:
    case UPDATE_REGULAR_ACCOUNT:
    case UPDATE_SECURE_ACCOUNT:
    case UPDATE_SSS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// Sagas

function* workerSetupAccounts() {
  try {
    const mnemonic = yield createMnemonic();
    const regularAccount = new RegularAccount(mnemonic);
    const secureAccount = new SecureAccount(mnemonic);
    const sss = new S3Service(mnemonic);
    yield put({
      type: SETUP_ACCOUNTS_SUCCESS,
      payload: { mnemonic, regularAccount, secureAccount, sss },
    });
  } catch (e) {
    console.log('error', e);
  }
}

function* workerRegularAccount() {
  const { walletReducer } = yield select(state => state);
  try {
    const { mnemonic } = walletReducer;
    const regularAccount = new RegularAccount(mnemonic);
    console.log({ regularAccount });
    yield put({
      type: UPDATE_REGULAR_ACCOUNT,
      payload: { regularAccount },
    });
  } catch (e) {
    console.log('error', e);
  }
}

function* workerSecureAccount() {
  const { walletReducer } = yield select(state => state);
  try {
    const { mnemonic } = walletReducer;
    const secureAccount = new SecureAccount(mnemonic);
    yield put({
      type: UPDATE_SECURE_ACCOUNT,
      payload: { secureAccount },
    });
  } catch (e) {
    console.log('error', e);
  }
}

function* workerSSS() {
  const { walletReducer } = yield select(state => state);
  try {
    const { mnemonic } = walletReducer;
    const sss = new S3Service(mnemonic);
    yield put({
      type: UPDATE_SSS,
      payload: { sss },
    });
  } catch (e) {
    console.log('error', e);
  }
}

export const watcherSetupAccounts = sagaWatcherHelper(
  workerSetupAccounts,
  SETUP_ACCOUNTS,
);
export const watcherRegularAccount = sagaWatcherHelper(
  workerRegularAccount,
  CREATE_REGULAR_ACCOUNT,
);
export const watcherSecureAccount = sagaWatcherHelper(
  workerSecureAccount,
  CREATE_SECURE_ACCOUNT,
);
export const watcherSSS = sagaWatcherHelper(workerSSS, CREATE_SSS);
