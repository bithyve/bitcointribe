import { call, put } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import { INIT_SETUP } from "../actions/setup";
import { insertIntoDB } from "../actions/storage";

import RegularAccount from "../../bitcoin/services/accounts/RegularAccount";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import S3Service from "../../bitcoin/services/sss/S3Service";

function* initSetupWorker({ payload }) {
  try {
    // initiate the accounts
    const regularAcc = new RegularAccount();
    const res = yield call(regularAcc.getMnemonic);
    const primaryMnemonic = res.data.mnemonic;
    const secureAcc = new SecureAccount(primaryMnemonic);

    // share generation
    const s3Service = new S3Service(primaryMnemonic);
    yield call(s3Service.generateShares, payload.securityAns);

    const instances = {
      regularAcc: JSON.stringify(regularAcc),
      secureAcc: JSON.stringify(secureAcc),
      s3Service: JSON.stringify(s3Service)
    };

    const toBeInserted = {
      ...payload,
      ...instances
    };

    yield put(insertIntoDB(toBeInserted));
  } catch (err) {
    console.log(err);
  }
}

export const initSetupWatcher = createWatcher(initSetupWorker, INIT_SETUP);
