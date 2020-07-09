import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utils/utilities';
import {
  INIT_DB,
  dbInitialized,
  FETCH_FROM_DB,
  dbFetched,
  INSERT_INTO_DB,
  dbInserted,
  ENRICH_SERVICES,
  servicesEnriched,
} from '../actions/storage';
import dataManager from '../../storage/database-manager';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import S3Service from '../../bitcoin/services/sss/S3Service';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import { AsyncStorage } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import semver from 'semver';

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
    const key = yield select((state) => state.storage.key);
    const database = yield call(dataManager.fetch, key);
    if (key && database) {
      yield put(dbFetched(database));
      yield call(servicesEnricherWorker, { payload: { database } });
    } else {
      console.log(
        'Failed to fetch the database; either key is missing or database is empty',
      );
    }
  } catch (err) {
    console.log(err);
  }
}

export const fetchDBWatcher = createWatcher(fetchDBWorker, FETCH_FROM_DB);

export function* insertDBWorker({ payload }) {
  try {
    const storage = yield select((state) => state.storage);
    const { database, insertedIntoDB, key } = storage;
    if (!key) {
      // dispatch failure
      console.log('Key missing');
      return;
    }

    const updatedDB = {
      ...database,
      ...payload,
    };

    const inserted = yield call(
      dataManager.insert,
      updatedDB,
      key,
      insertedIntoDB,
    );
    if (!inserted) {
      // dispatch failure
      console.log('Failed to insert into DB');
      return;
    }
    yield put(dbInserted(payload));
    // !insertedIntoDB ? yield put( enrichServices( updatedDB ) ) : null; // enriching services post initial insertion
    yield call(servicesEnricherWorker, { payload: { database: updatedDB } });
  } catch (err) {
    console.log(err);
  }
}
export const insertDBWatcher = createWatcher(insertDBWorker, INSERT_INTO_DB);

function* servicesEnricherWorker({ payload }) {
  try {
    const database = payload.database
      ? payload.database
      : yield select((state) => state.storage.database);
    if (!database) {
      throw new Error('Database missing; services encrichment failed');
    }

    const {
      REGULAR_ACCOUNT,
      TEST_ACCOUNT,
      SECURE_ACCOUNT,
      S3_SERVICE,
      TRUSTED_CONTACTS,
    } = database.SERVICES;

    let services;
    let migrated = false;
    if (!semver.valid(database.VERSION)) {
      // handling exceptions: off standard versioning
      if (!database.VERSION) database.VERSION = '0.7.0';
      else if (database.VERSION === '0.9') database.VERSION = '0.9.0';
      else if (database.VERSION === '1.0') database.VERSION = '1.0.0';
    }

    if (semver.gt(DeviceInfo.getVersion(), database.VERSION)) {
      if (
        database.VERSION == '0.7.0' &&
        semver.gte(DeviceInfo.getVersion(), '0.9.0')
      ) {
        // version 0.7.0 support
        console.log('Migration running for 0.7.0');
        services = {
          REGULAR_ACCOUNT: RegularAccount.fromJSON(REGULAR_ACCOUNT),
          TEST_ACCOUNT: TestAccount.fromJSON(TEST_ACCOUNT),
          SECURE_ACCOUNT: SecureAccount.fromJSON(SECURE_ACCOUNT),
          S3_SERVICE: S3Service.fromJSON(S3_SERVICE),
          TRUSTED_CONTACTS: new TrustedContactsService(),
        };
        // hydrating new/missing async storage variables
        yield call(
          AsyncStorage.setItem,
          'walletID',
          services.S3_SERVICE.sss.walletId,
        );

        migrated = true;
      } else {
        // default enrichment (when database versions are different but migration is not available)
        services = {
          REGULAR_ACCOUNT: RegularAccount.fromJSON(REGULAR_ACCOUNT),
          TEST_ACCOUNT: TestAccount.fromJSON(TEST_ACCOUNT),
          SECURE_ACCOUNT: SecureAccount.fromJSON(SECURE_ACCOUNT),
          S3_SERVICE: S3Service.fromJSON(S3_SERVICE),
          TRUSTED_CONTACTS: TRUSTED_CONTACTS
            ? TrustedContactsService.fromJSON(TRUSTED_CONTACTS)
            : new TrustedContactsService(),
        };
      }

      if (semver.eq(DeviceInfo.getVersion(), '1.0.1')) {
        // vsersion 1.0 and lower support

        // re-derive primary extended keys (standardization)
        const secureAccount: SecureAccount = services.SECURE_ACCOUNT;
        if (secureAccount.secureHDWallet.rederivePrimaryXKeys()) {
          console.log('Standardized Primary XKeys for secure a/c');
          migrated = true;
        }
      }
    } else {
      services = {
        REGULAR_ACCOUNT: RegularAccount.fromJSON(REGULAR_ACCOUNT),
        TEST_ACCOUNT: TestAccount.fromJSON(TEST_ACCOUNT),
        SECURE_ACCOUNT: SecureAccount.fromJSON(SECURE_ACCOUNT),
        S3_SERVICE: S3Service.fromJSON(S3_SERVICE),
        TRUSTED_CONTACTS: TRUSTED_CONTACTS
          ? TrustedContactsService.fromJSON(TRUSTED_CONTACTS)
          : new TrustedContactsService(),
      };
    }

    yield put(servicesEnriched(services));
    if (migrated) {
      database.VERSION = DeviceInfo.getVersion();
      yield call(insertDBWorker, { payload: database });
    }
  } catch (err) {
    console.log(err);
  }
}

export const servicesEnricherWatcher = createWatcher(
  servicesEnricherWorker,
  ENRICH_SERVICES,
);
