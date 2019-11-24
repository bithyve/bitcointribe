import { call, put } from "redux-saga/effects";
import { createWatcher, serviceGenerator } from "../utils/utilities";
import AsyncStorage from "@react-native-community/async-storage";

import * as Cipher from "../../common/encryption";
import * as SecureStore from "../../storage/secure-store";
import {
  INIT_SETUP,
  CREDS_AUTH,
  STORE_CREDS,
  credsStored,
  credsAuthenticated,
  setupInitialized
} from "../actions/setupAndAuth";
import { insertIntoDB, keyFetched, fetchFromDB } from "../actions/storage";
import { Database } from "../../common/interfaces/Interfaces";

function* initSetupWorker({ payload }) {
  try {
    const { walletName, securityAns } = payload;
    const { regularAcc, testAcc, secureAcc, s3Service } = yield call(
      serviceGenerator,
      securityAns
    );

    const initialDatabase: Database = {
      WALLET_SETUP: { walletName, securityAns },
      DECENTRALIZED_BACKUP: {
        RECOVERY_SHARES: [],
        SHARES_TRANSFER_DETAILS: {},
        UNDER_CUSTODY: {},
        DYNAMIC_NONPMDD: {}
      },
      SERVICES: {
        REGULAR_ACCOUNT: JSON.stringify(regularAcc),
        TEST_ACCOUNT: JSON.stringify(testAcc),
        SECURE_ACCOUNT: JSON.stringify(secureAcc),
        S3_SERVICE: JSON.stringify(s3Service)
      }
    };

    yield put(insertIntoDB(initialDatabase));
    yield call(AsyncStorage.setItem, "walletExists", "true");
    yield put(setupInitialized());
  } catch (err) {
    console.log(err);
  }
}

export const initSetupWatcher = createWatcher(initSetupWorker, INIT_SETUP);

function* credentialsStorageWorker({ payload }) {
  //hash the pin
  const hash = yield call(Cipher.hash, payload.passcode);

  //generate an AES key and ecnrypt it with
  const AES_KEY = yield call(Cipher.generateKey);
  const encryptedKey = yield call(Cipher.encrypt, AES_KEY, hash);

  //store the AES key against the hash
  if (!(yield call(SecureStore.store, hash, encryptedKey))) {
    yield call(AsyncStorage.setItem, "hasCreds", "false");
    return;
  }

  yield put(keyFetched(AES_KEY));
  yield call(AsyncStorage.setItem, "hasCreds", "true");
  yield put(credsStored());
}

export const credentialStorageWatcher = createWatcher(
  credentialsStorageWorker,
  STORE_CREDS
);

function* credentialsAuthWorker({ payload }) {
  // hash the pin and fetch AES from secure store

  const hash = yield call(Cipher.hash, payload.passcode);
  const encryptedKey = yield call(SecureStore.fetch, hash);
  const key = yield call(Cipher.decrypt, encryptedKey, hash);

  if (!key) {
    yield put(credsAuthenticated(false));
    return;
  }
  yield put(keyFetched(key));
  yield put(fetchFromDB());
  yield put(credsAuthenticated(true));
}

export const credentialsAuthWatcher = createWatcher(
  credentialsAuthWorker,
  CREDS_AUTH
);
