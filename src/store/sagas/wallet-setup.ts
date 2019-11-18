import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import { INIT_SETUP } from "../actions/wallet-setup";
import { insertIntoDB } from "../actions/storage";

import RegularAccount from "../../bitcoin/services/accounts/RegularAccount";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import S3Service from "../../bitcoin/services/sss/S3Service";
import TestAccount from "../../bitcoin/services/accounts/TestAccount";

function* initSetupWorker({ payload }) {
  try {
    const { walletName, securityAns } = payload;

    // initiate the accounts
    // Regular account
    const regularAcc = new RegularAccount();
    const res = yield call(regularAcc.getMnemonic);
    const primaryMnemonic = res.data.mnemonic;

    // Test account
    const testAcc = new TestAccount();

    // Secure account
    const secureAcc = new SecureAccount(primaryMnemonic);
    console.log("wallet-setup");
    console.log(secureAcc);
  
    // share generation
    const s3Service = new S3Service(primaryMnemonic);
    yield call(s3Service.generateShares, securityAns);
    
    const accounts = {
      REGULAR_ACCOUNT: JSON.stringify(regularAcc),
      TEST_ACCOUNT: JSON.stringify(testAcc),
      SECURE_ACCOUNT: JSON.stringify(secureAcc),
      S3_SERVICE: JSON.stringify(s3Service)
    };

    const toBeInserted = {
      WALLET_SETUP: { walletName, securityAns },
      DECENTRALIZED_BACKUP: {
        SHARES_TRANSFER_DETAILS: {},
        SHARES_UNDER_CUSTODY: {}
      },
      ...accounts
    };

    yield put(insertIntoDB(toBeInserted));
  } catch (err) {
    console.log(err);
  }
}

export const initSetupWatcher = createWatcher(initSetupWorker, INIT_SETUP);
