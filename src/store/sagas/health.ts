import { call, put, select, delay } from 'redux-saga/effects';
import {
  createWatcher,
  serviceGenerator,
  requestTimedout,
} from '../utils/utilities';
import {
  healthInitialize,
  healthInitialized,
  INIT_HEALTH_SETUP,
  UPDATE_HEALTH,
} from '../actions/health';
import S3Service from '../../bitcoin/services/sss/S3Service';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import {
  SECURE_ACCOUNT,
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../common/constants/serviceTypes';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import {
  updateHealth,
} from '../actions/health';
import {
  INIT_HEALTH_CHECK,
  switchS3Loader,
  healthCheckInitialized,
  PREPARE_MSHARES,
} from '../actions/health';
import { insertDBWorker } from './storage';
import { AsyncStorage, Platform, NativeModules, Alert } from 'react-native';
import {generateRandomString} from '../../common/CommonFunctions/index';

function* updateHealthToRelay() {
  let healthArray = [
  {
    "shareType": "cloud",
    "updatedAt": 0,
    "status": "notAccessible",
    "shareId": "randomIdForCloud",
    "reshareVersion": 0
},
{
    "shareType": "securityQuestion",
    "updatedAt": 0,
    "status": "accessible",
    "shareId": "randomIdForSecurityQ",
    "reshareVersion": 0 
}];
  yield put(updateHealth(healthArray));
}

export const updateHealthToRelayWatcher = createWatcher(
  updateHealthToRelay,
  UPDATE_HEALTH,
);


function* initHealthWorker() {
  let s3Service: S3Service = yield select((state) => state.sss.service);
  const initialized = s3Service.levelhealth.healthCheckInitialized;
  if (initialized) return;

  yield put(switchS3Loader('initHC'));
  // Call this at level 2
  // if (!s3Service.levelhealth.metaShares.length) {
  //   s3Service = yield call(generateMetaSharesWorker); // executes once (during initial setup)
  // }
  const res = yield call(s3Service.initializeHealth);
  console.log('res initializeHealth', res)
  if (res.status === 200) {
    yield put(updateHealth(res.data.levelInfo));
    yield put(healthCheckInitialized());

    // walletID globalization (in-app)
    const walletID = yield call(AsyncStorage.getItem, 'walletID');
    if (!walletID) {
      yield call(AsyncStorage.setItem, 'walletID', s3Service.levelhealth.walletId);
    }

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      S3_SERVICE: JSON.stringify(s3Service),
    };
    console.log('Health Check Initialized');
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log({ err: res.err });
    yield put(switchS3Loader('initHC'));
  }
}

export const initHealthWatcher = createWatcher(initHealthWorker, INIT_HEALTH_SETUP);

function* generateMetaSharesWorker() {
  const s3Service: S3Service = yield select((state) => state.sss.service);
  const { walletName } = yield select(
    (state) => state.storage.database.WALLET_SETUP,
  );
  const secureAccount: SecureAccount = yield select(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );

  const secondaryMnemonic = secureAccount.secureHDWallet.secondaryMnemonic;
  const twoFASecret = secureAccount.secureHDWallet.twoFASetup.secret;
  if (!secondaryMnemonic || !twoFASecret) {
    throw new Error('secure assets missing; staticNonPMDD');
  }
  const { secondary, bh } = secureAccount.secureHDWallet.xpubs;

  const secureAssets = {
    secondaryMnemonic,
    twoFASecret,
    secondaryXpub: secondary,
    bhXpub: bh,
  };

  const appVersion = DeviceInfo.getVersion();

  if (s3Service.levelhealth.metaShares.length) return;
  const res = yield call(
    s3Service.createMetaShares,
    secureAssets,
    walletName,
    appVersion,
  );
  if (res.status === 200) {
    return s3Service;
    // const { SERVICES } = yield select(state => state.storage.database);
    // const updatedSERVICES = {
    //   ...SERVICES,
    //   S3_SERVICE: JSON.stringify(s3Service)
    // };
    // yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error(res.err);
  }
}

export const generateMetaSharesWatcher = createWatcher(
  generateMetaSharesWorker,
  PREPARE_MSHARES,
);