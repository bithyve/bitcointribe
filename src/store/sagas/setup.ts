import { call, put } from 'redux-saga/effects';

import { createWatcher, createMnemonic } from '../utils/watcher-creator';
import { INIT_SETUP } from '../actions/setup';
import { insertIntoDB } from '../actions/storage';

import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import S3Service from '../../bitcoin/services/sss/S3Service';

function* initSetupWorker({ payload }) {
  try {
    // yield call(); Create Regular, Secure and S3Instance
    const mnemonic = yield call(createMnemonic);

    const regularAcc = new RegularAccount(mnemonic);
    const secureAcc = new SecureAccount(mnemonic);
    const s3Service = new S3Service(mnemonic);

    const instances = {
      regularAcc: regularAcc.toString(),
      secureAcc: secureAcc.toString(),
      s3Service: s3Service.toString(),
    }; // stringified

    const databaseSnap = {
      ...payload,
      ...instances,
    };
    // store into the database
    yield put(insertIntoDB(databaseSnap));
  } catch (err) {
    console.log(err);
  }
}

export const initSetupWatcher = createWatcher(initSetupWorker, INIT_SETUP);
