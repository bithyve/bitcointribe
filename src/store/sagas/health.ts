import { call, put, select, delay } from 'redux-saga/effects';
import {
  createWatcher,
  requestTimedout,
} from '../utils/utilities';
import {
  INIT_HEALTH_SETUP,
  UPDATE_HEALTH,
  CHECK_SHARES_HEALTH,
  UPDATE_SHARES_HEALTH,
  updateMSharesLoader
} from '../actions/health';
import S3Service from '../../bitcoin/services/sss/S3Service';
import {
  updateHealth,
} from '../actions/health';
import {
  INIT_HEALTH_CHECK,
  switchS3LoadingStatus,
  initLoader,
  healthCheckInitialized,
  GENERATE_META_SHARE,
} from '../actions/health';
import { insertDBWorker } from './storage';
import { AsyncStorage, Platform, NativeModules, Alert } from 'react-native';
import {generateRandomString} from '../../common/CommonFunctions/index';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import DeviceInfo from 'react-native-device-info';

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

  yield put(initLoader(true));
  // Call this at level 2
  // if (!s3Service.levelhealth.metaShares.length) {
  //   s3Service = yield call(generateMetaSharesWorker); // executes once (during initial setup)
  // }
  const res = yield call(s3Service.initializeHealth);
  if (res.status === 200) {
    // Update Initial Health to reducer
    yield put(updateHealth(res.data.levelInfo));
    // Update status
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
    yield put(initLoader(false));
  }
}

export const initHealthWatcher = createWatcher(initHealthWorker, INIT_HEALTH_SETUP);

function* generateMetaSharesWorker({ payload }) {
  let s3Service: S3Service = yield select((state) => state.sss.service);
  const { walletName } = yield select(
    (state) => state.storage.database.WALLET_SETUP,
  );
  const appVersion = DeviceInfo.getVersion();
  const { level } = payload;
  const { answer } = yield select(
    (state) => state.storage.database.WALLET_SETUP.security,
  );
  let serviceCall;
  if(level == 2 ){
    serviceCall = s3Service.generateLevel1Shares;
  } else if(level == 3 ){
    serviceCall = s3Service.generateLevel2Shares;
  }

  const res = yield call(
    serviceCall,
    answer,
    walletName,
    appVersion, 
    level
  );
  if (res.status === 200) {
    let s3Service: S3Service = yield select((state) => state.sss.service);
    //console.log("S#SERVICE", s3Service);
    console.log("shares", res);
    const { SERVICES } = yield select(state => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      S3_SERVICE: JSON.stringify(s3Service)
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    //yield put(sharesGenerated({ shares: res.data.encryptedSecrets }));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error(res.err);
  }
}

export const generateMetaSharesWatcher = createWatcher(
  generateMetaSharesWorker,
  GENERATE_META_SHARE,
);

function* checkSharesHealthWorker() {
  console.log('testing2');
  yield put(switchS3LoadingStatus(true));
  const s3Service: S3Service = yield select((state) => state.sss.service);
  const res = yield call(s3Service.checkHealth);

  if (res.status === 200) {
    if(res.data.data.data.currentLevel == 0 || res.data.data.data.currentLevel == 1 ){
      if(res.data.data.data.levels[0]){
        yield put(updateHealth(res.data.data.data.levels[0].levelInfo));
      }
    }
    else if(res.data.data.data.currentLevel == 2 ){
      if(res.data.data.data.levels[1]) {
        yield put(updateHealth(res.data.data.data.levels[1].levelInfo));
      }
    }
    else{
      if(res.data.data.data.levels[2]){
        yield put(updateHealth(res.data.data.data.levels[2].levelInfo));
      } 
    }
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log({ err: res.err });
  }

  yield put(switchS3LoadingStatus(false));
}

export const checkSharesHealthWatcher = createWatcher(
  checkSharesHealthWorker,
  CHECK_SHARES_HEALTH,
);


function* updateSharesHealthWorker({ payload }) {
  console.log('updateMSharesHealth payload', payload.shares)
  // set a timelapse for auto update and enable instantaneous manual update
  yield put(updateMSharesLoader(true));

  const trustedContactsService: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  let DECENTRALIZED_BACKUP = payload.DECENTRALIZED_BACKUP;
  if (!DECENTRALIZED_BACKUP) {
    DECENTRALIZED_BACKUP = yield select(
      (state) => state.storage.database.DECENTRALIZED_BACKUP,
    );
  }

  const SERVICES = yield select((state) => state.storage.database.SERVICES);

  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP;  

  const res = yield call(S3Service.updateHealth, payload.shares);
  console.log('res updateSharesHealthWorker', res);
  if (res.status === 200) {
    // TODO: Use during selective updation
    const { updationInfo } = res.data;
    console.log({ updationInfo });
    Object.keys(UNDER_CUSTODY).forEach((tag) => {
      for (let info of updationInfo) {
        if (info.updated) {
          if (info.walletId === UNDER_CUSTODY[tag].META_SHARE.meta.walletId) {
            // UNDER_CUSTODY[tag].LAST_HEALTH_UPDATE = info.updatedAt;
            if (info.encryptedDynamicNonPMDD)
              UNDER_CUSTODY[tag].ENC_DYNAMIC_NONPMDD =
                info.encryptedDynamicNonPMDD;
          }
        } else {
          if (info.removeShare) {
            if (info.walletId === UNDER_CUSTODY[tag].META_SHARE.meta.walletId) {
              delete UNDER_CUSTODY[tag];

              for (const contactName of Object.keys(
                trustedContactsService.tc.trustedContacts,
              )) {
                const contact =
                  trustedContactsService.tc.trustedContacts[contactName];
                if (contact.walletID === info.walletId) {
                  contact.isWard = false;
                }
              }
            }
          }
        }
      }
    });

    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify(trustedContactsService),
    };

    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      UNDER_CUSTODY,
    };
    yield call(insertDBWorker, {
      payload: {
        DECENTRALIZED_BACKUP: updatedBackup,
        SERVICES: updatedSERVICES,
      },
    });
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log({ err: res.err });
  }
  yield put(updateMSharesLoader(false));
}

export const updateSharesHealthWatcher = createWatcher(
  updateSharesHealthWorker,
  UPDATE_SHARES_HEALTH,
);
