import { call, delay, put, select } from 'redux-saga/effects';
import { createWatcher, requestTimedout } from '../utils/utilities';
import {
  INIT_HEALTH_SETUP,
  CHECK_SHARES_HEALTH,
  UPDATE_SHARES_HEALTH,
  updateMSharesLoader,
  CREATE_N_UPLOAD_ON_EF_CHANNEL,
  updateLevelTwoMetaShareStatus,
  updateLevelThreeMetaShareStatus,
  INIT_LEVEL_TWO,
  initLevelTwo,
  checkMSharesHealth,
  isLevel2InitializedStatus,
  updateMSharesHealth,
  updatedKeeperInfo,
  walletRecoveryFailed,
  RECOVER_WALLET_USING_ICLOUD,
  walletImageChecked,
  shareReceived,
  DOWNLOAD_SHARES,
} from '../actions/health';
import S3Service from '../../bitcoin/services/sss/S3Service';
import { updateHealth } from '../actions/health';
import {
  switchS3LoadingStatus,
  initLoader,
  healthCheckInitialized,
  GENERATE_META_SHARE,
} from '../actions/health';
import { insertDBWorker } from './storage';
import { AsyncStorage } from 'react-native';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import DeviceInfo from 'react-native-device-info';
import config from '../../bitcoin/HexaConfig';
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
} from '../../common/constants/serviceTypes';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import KeeperService from '../../bitcoin/services/KeeperService';
import { EphemeralDataElementsForKeeper } from '../../bitcoin/utilities/Interface';
import TrustedContacts from '../../bitcoin/utilities/TrustedContacts';
import LevelHealth from '../../bitcoin/utilities/LevelHealth/LevelHealth';
import moment from 'moment';
import { updateTrustedContactInfoLocally } from '../actions/trustedContacts';
import crypto from 'crypto';

function* initHealthWorker() {
  let s3Service: S3Service = yield select((state) => state.sss.service);
  const initialized = s3Service.levelhealth.healthCheckInitialized;
  
  if (initialized) return;
  yield put(initLoader(true));
  const res = yield call(s3Service.initializeHealth);
  
  if (res.status === 200) {
    // Update Initial Health to reducer
    let obj = [{
      level: 1,
      levelInfo: res.data.levelInfo
    }]
    yield put(updateHealth(obj, 0));
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
    yield put(initLoader(false));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
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
  } else if (level == 3) {
    serviceCall = s3Service.generateLevel2Shares;
    yield put(updateLevelThreeMetaShareStatus(true));
  }
  if (serviceCall != null) {
    const res = yield call(serviceCall, answer, walletName, appVersion, level);
    if (res.status === 200) {
      if(level == 2){
        let isLevel2Initialized = yield select((state) => state.health.isLevel2Initialized);
        if(!isLevel2Initialized){ yield put(initLevelTwo()); }
        yield put(updateLevelTwoMetaShareStatus(true));
      }
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

  if (res.status === 200) {
    yield put(
      updateHealth(res.data.data.data.levels, res.data.data.data.currentLevel),
    );
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
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
    if(res.data.updationResult){
      let s3Service: S3Service = yield select((state) => state.sss.service);
      for (let i = 0; i < res.data.updationResult.length; i++) {
        const element = res.data.updationResult[i];
        if(element.walletId == s3Service.getWalletId().data.walletId){
          yield put(updateHealth(res.data.updationResult[i].levels, res.data.updationResult[i].currentLevel));
          break;
        }
      }
    }
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
  }
  yield put(updateMSharesLoader(false));
}

export const updateSharesHealthWatcher = createWatcher(
  updateSharesHealthWorker,
  UPDATE_SHARES_HEALTH,
);

function* createAndUploadOnEFChannelWorker({ payload }) {
  let featuresList = payload.featuresList;
  let type = payload.isPrimaryKeeper ? 'device' : payload.type;
  
  yield put(updateMSharesLoader(true));
  let s3Service: S3Service = yield select((state) => state.sss.service);
  let securityQuestion = yield select((state) => state.storage.database.WALLET_SETUP);
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
  let {otpEncryptedData, otp} = LevelHealth.encryptViaOTP(EFChannelData.uuid);
  const encryptedKey = otpEncryptedData
  let dataElements: EphemeralDataElementsForKeeper = {
    publicKey: EFChannelData.publicKey,
    walletID: EFChannelData.walletID,
    shareTransferDetails: {
      otp,
      encryptedKey,
    },
    xPub: EFChannelData.xPubs,
    securityQuestion: securityQuestion,
    secondaryMnemonics: EFChannelData.secondaryMnemonics,
    featuresList: EFChannelData.featuresList,
  };
  let share  = s3Service.levelhealth.metaShares[1];
  if(payload.selectedShareId){
    share = payload.share;
  }
  
  const shareUploadables = LevelHealth.encryptMetaShare(
    share,
    EFChannelData.uuid
  );
  let object = {
    shareId: share.shareId ? share.shareId : '',
    shareType: type,
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
  if(res.status == 200){
    let shareArray = [
      {
        walletId: s3Service.getWalletId().data.walletId,
        shareId: share.shareId,
        reshareVersion: 0,
        updatedAt: moment(new Date()).valueOf(),
      }
    ];
    yield put(updateMSharesHealth(shareArray));
    let keeperInfo = yield select((state) => state.health.keeperInfo);
    let flag = false;
    if(keeperInfo.length>0){
      for (let i = 0; i < keeperInfo.length; i++) {
        const element = keeperInfo[i];
        if(element.shareId == share.shareId){
          keeperInfo[i].name = EFChannelData.walletName;
          keeperInfo[i].uuid = EFChannelData.uuid;
          keeperInfo[i].publicKey = EFChannelData.publicKey;
          keeperInfo[i].ephemeralAddress = EFChannelData.ephemeralAddress;
          keeperInfo[i].type = type;
          break;
        }
        else{
          flag = true;
          break;
        }
      }
    }
    else{
      flag = true;
    }
    if(flag){
      let obj = {
        shareId: share.shareId,
        name: EFChannelData.walletName,
        uuid: EFChannelData.uuid,
        publicKey: EFChannelData.publicKey,
        ephemeralAddress: EFChannelData.ephemeralAddress,
        type
      }
      keeperInfo.push(obj);
    }
    yield put(updatedKeeperInfo(keeperInfo));
  }
  yield put(updateMSharesLoader(false));
}

export const createAndUploadOnEFChannelWatcher = createWatcher(
  createAndUploadOnEFChannelWorker,
  CREATE_N_UPLOAD_ON_EF_CHANNEL,
);

function* updateHealthLevel2Worker() {
  let isLevel2Initialized = yield select((state) => state.health.isLevel2Initialized);
  if(!isLevel2Initialized){
    let s3Service: S3Service = yield select((state) => state.sss.service);
    let Health = yield select((state) => state.health.levelHealth);
    let SecurityQuestionHealth = Health[0].levelInfo[1];
    yield put(initLoader(true));
    const res = yield call(s3Service.updateHealthLevel2, SecurityQuestionHealth);
    if(res.data.success){
      // Update Health to reducer
      yield put(checkMSharesHealth());
      yield put(isLevel2InitializedStatus());
    }
    yield put(initLoader(false));
  }
}

export const updateHealthLevel2Watcher = createWatcher(
  updateHealthLevel2Worker,
  INIT_LEVEL_TWO,
);

const sha256 = crypto.createHash('sha256');
const hash = (element) => {
  return sha256.update(JSON.stringify(element)).digest('hex');
};

function* recoverWalletFromIcloudWorker({ payload }) {
  yield put(switchS3LoadingStatus('restoreWallet'));
  console.log("PAYLOAD", payload);
  const {SERVICES, WALLET_SETUP, DECENTRALIZED_BACKUP, ASYNC_DATA } = payload.icloudData.walletImage;
  console.log("SERVICES, WALLET_SETUP, DECENTRALIZED_BACKUP, ASYNC_DATA", SERVICES, WALLET_SETUP, DECENTRALIZED_BACKUP, ASYNC_DATA);

  try {
      if (ASYNC_DATA) {
        for (const key of Object.keys(ASYNC_DATA)) {
          console.log('restoring to async: ', key);
          yield call(AsyncStorage.setItem, key, ASYNC_DATA[key]);
  
          if (key === 'TrustedContactsInfo' && ASYNC_DATA[key]) {
            const trustedContactsInfo = JSON.parse(ASYNC_DATA[key]);
            yield put(updateTrustedContactInfoLocally(trustedContactsInfo));
          }
        }
      }
      
      const payload = { SERVICES, DECENTRALIZED_BACKUP };
      //console.log("payload afshjkfhdfjhf", payload);
      // update hashes
      const hashesWI = {};
      Object.keys(payload).forEach((key) => {
        hashesWI[key] = hash(payload[key]);
      });
      yield call(AsyncStorage.setItem, 'WI_HASHES', JSON.stringify(hashesWI));
      yield call(insertDBWorker, { payload });
      yield delay(2000);
      const s3Service = JSON.parse(SERVICES.S3_SERVICE);
      yield call(AsyncStorage.setItem, 'walletID', s3Service.levelhealth.walletId);
      const current = Date.now();
      AsyncStorage.setItem('SecurityAnsTimestamp', JSON.stringify(current));
      const securityQuestionHistory = {
        confirmed: current,
      };
      AsyncStorage.setItem(
        'securityQuestionHistory',
        JSON.stringify(securityQuestionHistory),
      );

    } catch (err) {
    console.log({ err: err.message });
    yield put(walletRecoveryFailed(true));
    // Alert.alert('Wallet recovery failed!', err.message);
  }
  yield put(walletImageChecked(true));
  yield put(switchS3LoadingStatus('restoreWallet'));
}

export const recoverWalletFromIcloudWatcher = createWatcher(
  recoverWalletFromIcloudWorker,
  RECOVER_WALLET_USING_ICLOUD,
);

function* downloadShareWorker({ payload }) {
  console.log("downloadShareWorker", payload)
  const { encryptedKey } = payload;

  if(!encryptedKey) return;
  const res = yield call(
    S3Service.downloadShare,
    encryptedKey
  );

  if (res.status === 200) {
    console.log("SHARES DOWNLOAD",res.data);
    // TODO: recreate accounts and write to database
    yield put(shareReceived(res.data)); // storing in redux state (for demo)
  } else {
    console.log({ err: res.err });
  }
}

export const downloadShareWatcher = createWatcher(
  downloadShareWorker,
  DOWNLOAD_SHARES,
);