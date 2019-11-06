import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utils/watcher-creator';
import {
  INIT_DB,
  dbInitialized,
  FETCH_FROM_DB,
  dbFetched,
  INSERT_INTO_DB,
  fetchFromDB,
  dbInserted,
} from '../actions/storage';
import dataManager from '../../storage/database-manager';
import { encrypt, decrypt } from '../../storage/encryption';

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
    const data = yield call(dataManager.fetch);
    if (data.rows._array.length === 0) {
      return;
    }
    const encryptedDatabase = data.rows._array[0].encData;
    const key = yield select(state => state.storage.key);
    const database = decrypt(encryptedDatabase, key);
    yield put(dbFetched(database));
  } catch (err) {
    console.log(err);
  }
}

export const fetchDBWatcher = createWatcher(fetchDBWorker, FETCH_FROM_DB);

function* insertDBWorker({ payload }) {
  try {
    const storage = yield select(state => state.storage);
    const { database, insertedIntoDB } = storage;
    const key = yield select(state => state.storage.key);

    if (!key) {
      // dispatch failure
    }
    const updatedDB = {
      ...database,
      titles: database.titles.concat([payload.data]),
    };
    const encryptedDB = encrypt(updatedDB, key);

    if (!insertedIntoDB) {
      yield call(dataManager.insert, encryptedDB);
      yield put(dbInserted(true));
    } else {
      yield call(dataManager.update, encryptedDB);
    }
    yield put(fetchFromDB());
  } catch (err) {
    console.log(err);
  }
}

export const insertDBWatcher = createWatcher(insertDBWorker, INSERT_INTO_DB);
