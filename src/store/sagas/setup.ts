import { call, put } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import { INIT_SETUP } from "../actions/setup";
import { fetchFromDB } from "../actions/storage";

function* initSetupWorker(action) {
  try {
    // yield call(); Create Regular, Secure and S3Instance
    const instances = {}; // stringified

    // store into the database and ask reducer to fetch new db

    yield put(fetchFromDB());
  } catch (err) {
    console.log(err);
  }
}

export const initSetupWatcher = createWatcher(initSetupWorker, INIT_SETUP);
