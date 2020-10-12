import { call, put, select, delay } from 'redux-saga/effects';
import { createWatcher, requestTimedout } from '../utils/utilities';
import {
  INIT_HEALTH_SETUP,
  UPDATE_HEALTH,
  CHECK_SHARES_HEALTH,
  UPDATE_SHARES_HEALTH,
  updateMSharesLoader,
  CREATE_N_UPLOAD_ON_EF_CHANNEL,
  updateLevelTwoMetaShareStatus,
  updateLevelThreeMetaShareStatus,
  INIT_LEVEL_TWO,
  initLevelTwo,
  checkMSharesHealth
} from '../actions/health';
import S3Service from '../../bitcoin/services/sss/S3Service';
import { updateHealth } from '../actions/health';
import {
  INIT_HEALTH_CHECK,
  switchS3LoadingStatus,
  initLoader,
  healthCheckInitialized,
  GENERATE_META_SHARE,
} from '../actions/health';
import { insertDBWorker } from './storage';
import { AsyncStorage, Platform, NativeModules, Alert } from 'react-native';
import { generateRandomString } from '../../common/CommonFunctions/index';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import DeviceInfo from 'react-native-device-info';
import config from '../../bitcoin/HexaConfig';
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../common/constants/serviceTypes';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import Keeper from '../../bitcoin/utilities/Keeper';
import KeeperService from '../../bitcoin/services/KeeperService';
import { EphemeralDataElementsForKeeper } from '../../bitcoin/utilities/Interface';
import TrustedContacts from '../../bitcoin/utilities/TrustedContacts';
import { encrypt } from '../../common/encryption/index';
import LevelHealth from '../../bitcoin/utilities/LevelHealth/LevelHealth';

function* initHealthWorker() {
  let s3Service: S3Service = yield select((state) => state.sss.service);
  const initialized = s3Service.levelhealth.healthCheckInitialized;
  if (initialized) return;

  yield put(initLoader(true));
  const res = yield call(s3Service.initializeHealth);
  if (res.status === 200) {
    // Update Initial Health to reducer
    yield put(checkMSharesHealth());
    // Update status
    yield put(healthCheckInitialized());

    // walletID globalization (in-app)
    const walletID = yield call(AsyncStorage.getItem, 'walletID');
    if (!walletID) {
      yield call(
        AsyncStorage.setItem,
        'walletID',
        s3Service.levelhealth.walletId,
      );
    }

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      S3_SERVICE: JSON.stringify(s3Service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log({ err: res.err });
    yield put(initLoader(false));
  }
}

export const initHealthWatcher = createWatcher(
  initHealthWorker,
  INIT_HEALTH_SETUP,
);

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
  let serviceCall = null;
  if (level == 2) {
    serviceCall = s3Service.generateLevel1Shares;
    yield put(initLevelTwo());
    yield put(updateLevelTwoMetaShareStatus(true));
  } else if (level == 3) {
    serviceCall = s3Service.generateLevel2Shares;
    yield put(updateLevelThreeMetaShareStatus(true));
  }
  if (serviceCall != null) {
    const res = yield call(serviceCall, answer, walletName, appVersion, level);
    if (res.status === 200) {
      let s3Service: S3Service = yield select((state) => state.sss.service);
      const { SERVICES } = yield select((state) => state.storage.database);
      const updatedSERVICES = {
        ...SERVICES,
        S3_SERVICE: JSON.stringify(s3Service),
      };
      yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    } else {
      if (res.err === 'ECONNABORTED') requestTimedout();
      throw new Error(res.err);
    }
  }
}

export const generateMetaSharesWatcher = createWatcher(
  generateMetaSharesWorker,
  GENERATE_META_SHARE,
);

function* checkSharesHealthWorker() {
  yield put(switchS3LoadingStatus(true));
  const s3Service: S3Service = yield select((state) => state.sss.service);
  const res = yield call(s3Service.checkHealth);
  console.log("RES", res);
  if (res.status === 200) {
    yield put(
      updateHealth(res.data.data.data.levels, res.data.data.data.currentLevel),
    );
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
  // // set a timelapse for auto update and enable instantaneous manual update
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
  if (res.status === 200) {
    // TODO: Use during selective updation
    const { updationInfo } = res.data;
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

function* createAndUploadOnEFChannelWorker({ payload }) {
  let featuresList = payload.featuresList;
  yield put(updateMSharesLoader(true));
  let s3Service: S3Service = yield select((state) => state.sss.service);
  let s3ServiceTest: S3Service = yield select(
    (state) => state.accounts[TEST_ACCOUNT].service,
  );
  let testXpub = s3ServiceTest.hdWallet.getTestXPub();
  let s3ServiceRegular: S3Service = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );
  let regularXpub = s3ServiceRegular.hdWallet.getXpub();
  let s3ServiceSecure: SecureAccount = yield select(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );
  let secureXpub = s3ServiceSecure.getXpubsForAccount();
  let EFChannelData = {
    ...JSON.parse(payload.scannedData),
    xPubs: { testXpub, regularXpub, secureXpub },
    walletID: s3Service.getWalletId().data.walletId,
    hexaId: config.HEXA_ID,
    secondaryMnemonics: payload.isPrimaryKeeper
      ? s3ServiceSecure.getSecondaryMnemonics()
      : null,
    featuresList,
  };
  let otp = TrustedContacts.generateOTP(parseInt(config.SSS_OTP_LENGTH, 10));
  let encryptedKey = encrypt(s3Service.levelhealth.metaShares[1], otp);
  let dataElements: EphemeralDataElementsForKeeper = {
    publicKey: EFChannelData.publicKey,
    walletID: EFChannelData.walletID,
    shareTransferDetails: {
      otp,
      encryptedKey,
    },
    xPub: EFChannelData.xPubs,
    securityQuestion: {},
  };
  const shareUploadables = LevelHealth.encryptMetaShare(
    s3Service.levelhealth.metaShares[1],
    encryptedKey
  );
  let object = {
    shareId: s3Service.levelhealth.metaShares[1]
      ? s3Service.levelhealth.metaShares[1].shareId
      : '',
    shareType: 'device',
    publicKey: EFChannelData.publicKey,
    ephemeralAddress: EFChannelData.ephemeralAddress,
    dataElements: dataElements,
    encKey: EFChannelData.uuid,
    shareUploadables: shareUploadables
  };
  
  let Kp = new KeeperService();
  let res = yield call(
    Kp.updateEphemeralChannel,
    object.shareId,
    object.shareType,
    object.publicKey,
    object.ephemeralAddress,
    object.dataElements,
    object.encKey,
    object.shareUploadables
  );
  yield put(updateMSharesLoader(false));
}

export const createAndUploadOnEFChannelWatcher = createWatcher(
  createAndUploadOnEFChannelWorker,
  CREATE_N_UPLOAD_ON_EF_CHANNEL,
);

function* updateHealthLevel2Worker() {
  let s3Service: S3Service = yield select((state) => state.sss.service);
  let Health = yield select((state) => state.health.levelHealth);
  let SecurityQuestionHealth = {};
  if(Health && !Health[1] && Health[0]){
    if(Health[0].levelInfo[1].shareType == "securityQuestion"){
      SecurityQuestionHealth = Health[0].levelInfo[1];
    }
  }
  else if(Health && Health[1] && !Health[2]){
    if(Health[1].levelInfo[1].shareType == "securityQuestion"){
      SecurityQuestionHealth = Health[1].levelInfo[1];
    }
  }
  else if( Health && Health[2]){
    if(Health[2].levelInfo[1].shareType == "securityQuestion"){
      SecurityQuestionHealth = Health[2].levelInfo[1];
    }
  }
  yield put(initLoader(true));
  const res = yield call(s3Service.updateHealthLevel2, SecurityQuestionHealth);
  if(res.success){
    // Update Health to reducer
    yield put(checkMSharesHealth());
  }
  yield put(initLoader(false));
}

export const updateHealthLevel2Watcher = createWatcher(
  updateHealthLevel2Worker,
  INIT_LEVEL_TWO,
);
