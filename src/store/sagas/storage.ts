import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import {
  INIT_DB,
  dbInitialized,
  FETCH_FROM_DB,
  dbFetched,
  INSERT_INTO_DB,
  dbInserted
} from "../actions/storage";
import dataManager from "../../storage/database-manager";

function* initDBWorker() {
  try {
    yield call(dataManager.initialize);
    yield put(dbInitialized(true));
  } catch (err) {
    console.log(err);
    yield put(dbInitialized(false));
  }
}

export const initDBWatcher = createWatcher(initDBWorker, INIT_DB);

function* fetchDBWorker() {
  try {
    const key = yield select(state => state.storage.key);
    const database = yield call(dataManager.fetch, key);
    if (database) {
      yield put(dbFetched(database));
    }
  } catch (err) {
    console.log(err);
  }
}

export const fetchDBWatcher = createWatcher(fetchDBWorker, FETCH_FROM_DB);

function* insertDBWorker({ payload }) {
  try {
    const storage = yield select(state => state.storage);
    const { database, insertedIntoDB, key } = storage;
    if (!key) {
      // dispatch failure
      return;
    }
    const updatedDB = {
      ...database,
      ...payload
    };

    const inserted = yield call(
      dataManager.insert,
      updatedDB,
      key,
      insertedIntoDB
    );
    if (!inserted) {
      // dispatch failure
    }

    yield put(dbInserted(payload));
  } catch (err) {
    console.log(err);
  }
}

export const insertDBWatcher = createWatcher(insertDBWorker, INSERT_INTO_DB);
