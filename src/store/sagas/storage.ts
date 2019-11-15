import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import {
  INIT_DB,
  dbInitialized,
  FETCH_FROM_DB,
  dbFetched,
  INSERT_INTO_DB,
  dbInserted,
  enrichServices,
  ENRICH_SERVICES,
  servicesEnriched
} from "../actions/storage";
import dataManager from "../../storage/database-manager";
import RegularAccount from "../../bitcoin/services/accounts/RegularAccount";
import TestAccount from "../../bitcoin/services/accounts/TestAccount";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import S3Service from "../../bitcoin/services/sss/S3Service";

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
      yield put(enrichServices(database));
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
    !insertedIntoDB ? yield put(enrichServices(updatedDB)) : null; // enriching services post initial insertion
  } catch (err) {
    console.log(err);
  }
}

export const insertDBWatcher = createWatcher(insertDBWorker, INSERT_INTO_DB);

function* servicesEnricherWorker() {
  try {
    const { database } = yield select(state => state.storage);
    if (!database) {
      return;
    }

    const services = {
      REGULAR_ACCOUNT: RegularAccount.fromJSON(database.REGULAR_ACCOUNT),
      TEST_ACCOUNT: TestAccount.fromJSON(database.TEST_ACCOUNT),
      SECURE_ACCOUNT: SecureAccount.fromJSON(database.SECURE_ACCOUNT),
      S3_SERVICE: S3Service.fromJSON(database.S3_SERVICE)
    };

    yield put(servicesEnriched(services));
  } catch (err) {
    console.log(err);
  }
}

export const servicesEnricherWatcher = createWatcher(
  servicesEnricherWorker,
  ENRICH_SERVICES
);
