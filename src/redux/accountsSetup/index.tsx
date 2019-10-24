import { put } from 'redux-saga/effects';
import { createMnemonic, sagaWatcherHelper } from '../utils';

import { S3Service, RegularAccount, SecureAccount } from 'hexaBitcoin';

//  Types
const SETUP_ACCOUNTS = 'SETUP_ACCOUNTS';
const SETUP_ACCOUNTS_SUCCESS = 'SETUP_ACCOUNTS_SUCCESS';

const INITIAL_STATE = {
  mnemonic: undefined,
  regularAccount: undefined,
  secureAccount: undefined,
  sss: undefined,
};

//  Actions
export const setupAccounts = () => {
  return {
    type: SETUP_ACCOUNTS,
  };
};

//  Reducers
export const accountsSetupReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case SETUP_ACCOUNTS_SUCCESS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

//  Sagas
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

export const watcherSetupAccounts = sagaWatcherHelper(
  workerSetupAccounts,
  SETUP_ACCOUNTS,
);
