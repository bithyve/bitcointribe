import { call, put, select, delay } from 'redux-saga/effects';
import {
  createWatcher,
  serviceGenerator,
  requestTimedout,
} from '../utils/utilities';
import {
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

function* initHealthData() {
  // Call HEALTH_CHECK_INITIALIZE action
  let randomId = 'dsfdsf' //Create Here
  let randomIdForCloud = 'dsfdsf' //Create Here
  // Update Reducer
  let healthArray = [
    {
        "shareType": "cloud",
        "updatedAt": 0,
        "status": "notAccessible",
        "shareId": "string1",
        "reshareVersion": 0
    },
    {
        "shareType": "securityQuestion",
        "updatedAt": 0,
        "status": "accessible",
        "shareId": "string1",
        "reshareVersion": 0 
    }
  ];
  // Call API sharesHealthCheckInit2()
  yield put(updateHealth(healthArray));
  // Call HEALTH_CHECK_INITIALIZED action
}

export const initHealthDataWatcher = createWatcher(
  initHealthData,
  INIT_HEALTH_SETUP,
);

function* updateHealthToRelay() {
  let healthArray = [];
  for (let i = 0; i < 3; i++) {
    let subObj1 = {
      keeperType: null,
      type: 'cloud',
      lastUpdated: null,
      created: null,
      status: 'notAccessible',
      shareId: null,
      reshareVersion: 0
    };
    let subObj2 = {
      keeperType: 'otherKeeper',
      type: null,
      lastUpdated: null,
      created: null,
      status: 'notAccessible',
      shareId: null,
      reshareVersion: 0
    };
    let obj = {
      level: 1,
      levelStatus: 'notSetup',
      levelInfo: [ subObj1, subObj2 ],
    };
    
    if(i == 0){
      obj.level = 1;
      obj.levelInfo = [ subObj1,
        {
          keeperType: null,
          type: 'securityQuestion',
          lastUpdated: moment(new Date()).valueOf(),
          created: moment(new Date()).valueOf(),
          status: 'accessible',
          shareId: null,
          reshareVersion: 1
        },
      ];
    }
    if(i == 1){
      obj.level = 2;
      obj.levelInfo = [ {...subObj1, keeperType: 'primaryKeeper',
        type: 'device', }, 
        subObj2
      ];
    }
    if(i == 2){
      obj.level = 3;
      obj.levelInfo = [ subObj2, subObj2 ];
    }
    healthArray.push(obj);
  }
  yield put(updateHealth(healthArray));
}

export const updateHealthToRelayWatcher = createWatcher(
  updateHealthToRelay,
  UPDATE_HEALTH,
);


function* initHCWorker() {
  let s3Service: S3Service = yield select((state) => state.sss.service);
  const initialized = s3Service.levelhealth.healthCheckInitialized;
  if (initialized) return;

  yield put(switchS3Loader('initHC'));
  if (!s3Service.levelhealth.metaShares.length) {
    s3Service = yield call(generateMetaSharesWorker); // executes once (during initial setup)
  }
  const res = yield call(s3Service.initializeHealth);
  if (res.status === 200) {
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

export const initHCWatcher = createWatcher(initHCWorker, INIT_HEALTH_CHECK);

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