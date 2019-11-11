import { call, put } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import { INIT_SETUP } from "../actions/wallet-setup";
import { insertIntoDB } from "../actions/storage";

import RegularAccount from "../../bitcoin/services/accounts/RegularAccount";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import S3Service from "../../bitcoin/services/sss/S3Service";
import TestAccount from "../../bitcoin/services/accounts/TestAccount";

function* initSetupWorker({ payload }) {
  try {
    // initiate the accounts

    // Regular account
    const regularAcc = new RegularAccount();
    const res = yield call(regularAcc.getMnemonic);
    const primaryMnemonic = res.data.mnemonic;

    // Test account
    const testAcc = new TestAccount();

    // Secure account
    const secureAcc = new SecureAccount(primaryMnemonic);

    // share generation
    const s3Service = new S3Service(primaryMnemonic);
    yield call(s3Service.generateShares, payload.securityAns);

    const accounts = {
      regularAccount: JSON.stringify(regularAcc),
      testAccount: JSON.stringify(testAcc),
      secureAccount: JSON.stringify(secureAcc),
      s3Service: JSON.stringify(s3Service)
    };

    const toBeInserted = {
      ...payload,
      accounts
    };

    yield put(insertIntoDB(toBeInserted));
  } catch (err) {
    console.log(err);
  }
}

export const initSetupWatcher = createWatcher(initSetupWorker, INIT_SETUP);
