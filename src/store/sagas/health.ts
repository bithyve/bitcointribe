import { call, delay, put, select } from 'redux-saga/effects';
import {
  createWatcher,
  requestTimedout,
  serviceGenerator,
  serviceGenerator2,
} from '../utils/utilities';
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
  DOWNLOAD_MSHARE_HEALTH,
  downloadedMShare,
  ErrorReceiving,
  fetchWalletImage,
  RECOVER_WALLET_HEALTH,
  CLOUD_MSHARE,
  FETCH_WALLET_IMAGE_HEALTH,
  switchS3LoaderKeeper,
  UPLOAD_ENC_MSHARE_KEEPER,
  SEND_APPROVAL_REQUEST,
  UPLOAD_SECONDARY_SHARE,
  isLevel3InitializedStatus,
  GENERATE_PDF,
  pdfGenerated,
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
  TRUSTED_CONTACTS,
} from '../../common/constants/serviceTypes';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import KeeperService from '../../bitcoin/services/KeeperService';
import {
  EphemeralDataElements,
  INotification,
  Keepers,
  MetaShare,
  notificationTag,
  notificationType,
  ShareUploadables,
  TrustedDataElements,
  WalletImage,
} from '../../bitcoin/utilities/Interface';
import LevelHealth from '../../bitcoin/utilities/LevelHealth/LevelHealth';
import moment from 'moment';
import {
  updateEphemeralChannel,
  updateTrustedChannel,
  updateTrustedContactInfoLocally,
} from '../actions/trustedContacts';
import crypto from 'crypto';
import { Alert } from 'react-native';
import { ErrorSending } from '../actions/sss';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import RelayServices from '../../bitcoin/services/RelayService';
import generatePDFKeeper from '../utils/generatePDFKeeper';

function* initHealthWorker() {
  let s3Service: S3Service = yield select((state) => state.health.service);
  const initialized = s3Service.levelhealth.healthCheckInitialized;

  if (initialized) return;
  yield put(initLoader(true));
  const res = yield call(s3Service.initializeHealth);

  if (res.status === 200) {
    // Update Initial Health to reducer
    let obj = [
      {
        level: 1,
        levelInfo: res.data.levelInfo,
      },
    ];
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
  let s3Service: S3Service = yield select((state) => state.health.service);
  const { walletName } = yield select(
    (state) => state.storage.database.WALLET_SETUP,
  );
  const appVersion = DeviceInfo.getVersion();
  const { level } = payload;
  const { answer } = yield select(
    (state) => state.storage.database.WALLET_SETUP.security,
  );

  const secureAssets = {
    secondaryMnemonic: '',
    twoFASecret: '',
    secondaryXpub: '',
    bhXpub: '',
  };

  let serviceCall = null;
  if (level == 2) {
    serviceCall = s3Service.generateLevel1Shares;
  } else if (level == 3) {
    serviceCall = s3Service.generateLevel2Shares;
  }
  if (serviceCall != null) {
    const res = yield call(
      serviceCall,
      secureAssets,
      answer,
      walletName,
      appVersion,
      level,
    );
    if (res.status === 200) {
      if (level == 2) {
        let isLevel2Initialized = yield select(
          (state) => state.health.isLevel2Initialized,
        );
        if (!isLevel2Initialized) {
          yield put(initLevelTwo(level));
        }
        yield put(updateLevelTwoMetaShareStatus(true));
      }
      if (level == 3) {
        let isLevel3Initialized = yield select(
          (state) => state.health.isLevel3Initialized,
        );
        if (!isLevel3Initialized) {
          yield put(initLevelTwo(level));
        }
        yield put(updateLevelThreeMetaShareStatus(true));
      }
      let s3Service: S3Service = yield select((state) => state.health.service);
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
  const s3Service: S3Service = yield select((state) => state.health.service);
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

  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP;

  const res = yield call(S3Service.updateHealth, payload.shares);
  if (res.status === 200) {
    if (res.data.updationResult) {
      let s3Service: S3Service = yield select((state) => state.health.service);
      for (let i = 0; i < res.data.updationResult.length; i++) {
        const element = res.data.updationResult[i];
        if (element.walletId == s3Service.getWalletId().data.walletId) {
          yield put(
            updateHealth(
              res.data.updationResult[i].levels,
              res.data.updationResult[i].currentLevel,
            ),
          );
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

    const SERVICES = yield select((state) => state.storage.database.SERVICES);
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
  try {
    let {
      isReshare,
      featuresList,
      isPrimaryKeeper,
      scannedData,
      selectedShareId,
      level
    } = payload;
    console.log("level", level);
    let s3Service: S3Service = yield select((state) => state.health.service);
    let share = level == 2 ? s3Service.levelhealth.metaShares[1] : s3Service.levelhealth.metaShares[3];
    if (selectedShareId) {
      share = payload.share;
    }
    const fcmTokenValue = yield select(
      (state) => state.preferences.fcmTokenValue,
    );
    let type = isPrimaryKeeper ? 'primaryKeeper' : payload.type;

    yield put(updateMSharesLoader(true));
    const keeper: KeeperService = yield select((state) => state.keeper.service);

    let securityQuestion = yield select(
      (state) => state.storage.database.WALLET_SETUP,
    );
    let { DECENTRALIZED_BACKUP } = yield select(
      (state) => state.storage.database,
    );

    if (isReshare) {
      let shareIndex = 1;
      if (share.shareId && s3Service.levelhealth.metaShares.length) {
        let metaShare: MetaShare[] = s3Service.levelhealth.metaShares;
        if (
          metaShare.findIndex((value) => value.shareId == share.shareId) > -1
        ) {
          shareIndex = metaShare.findIndex(
            (value) => value.shareId == share.shareId,
          );
        }
      }
      yield call(s3Service.reshareMetaShare, shareIndex);
    }

    let s3ServiceTest: S3Service = yield select(
      (state) => state.accounts[TEST_ACCOUNT].service,
    );
    let s3ServiceRegular: S3Service = yield select(
      (state) => state.accounts[REGULAR_ACCOUNT].service,
    );
    let s3ServiceSecure: SecureAccount = yield select(
      (state) => state.accounts[SECURE_ACCOUNT].service,
    );
    // All acoount Xpubs
    let testXpub = s3ServiceTest.hdWallet.getTestXPub();
    let regularXpub = s3ServiceRegular.hdWallet.getXpub();
    let secureXpub = s3ServiceSecure.getXpubsForAccount();

    let ScannedData = JSON.parse(scannedData);

    let encKey;
    if (ScannedData.uuid) encKey = LevelHealth.strechKey(ScannedData.uuid);
    let { otpEncryptedData, otp } = LevelHealth.encryptViaOTP(ScannedData.uuid);
    const encryptedKey = otpEncryptedData;

    let walletID = s3Service.getWalletId().data.walletId;
    let hexaPublicKey = '';
    let trustedChannelAddress = '';
    let EfChannelAddress = ScannedData.ephemeralAddress;
    const result = yield call(
      keeper.finalizeKeeper,
      share.shareId,
      ScannedData.publicKey,
      encKey,
      ScannedData.uuid,
      featuresList,
      isPrimaryKeeper,
      ScannedData.walletName,
      EfChannelAddress,
    );
    if (result.status === 200) {
      hexaPublicKey = result.data.publicKey;
      trustedChannelAddress = result.data.channelAddress;
      EfChannelAddress = result.data.ephemeralAddress;

      let dataElements: EphemeralDataElements = {
        publicKey: ScannedData.publicKey, //Keeper scanned public key
        FCM: fcmTokenValue,
        walletID,
        shareTransferDetails: {
          otp,
          encryptedKey,
        },
        DHInfo: {
          publicKey: hexaPublicKey,
        },
        trustedAddress: trustedChannelAddress,
      };
      if (isReshare) dataElements.restoreOf = walletID;

      const shareUploadables = LevelHealth.encryptMetaShare(
        share,
        ScannedData.uuid,
      );
      console.log('ScannedData.publicKey', ScannedData.publicKey,dataElements);

      let res = yield call(
        keeper.updateEphemeralChannel,
        share.shareId,
        type,
        hexaPublicKey,
        EfChannelAddress,
        dataElements,
        ScannedData.uuid,
        shareUploadables,
      );
      console.log('updateEphemeralChannel saga res', res);
      if (res.status == 200) {
        // Create trusted channel
        const data: TrustedDataElements = {
          xPub: { testXpub, regularXpub, secureXpub: secureXpub },
          walletID,
          FCM: fcmTokenValue,
          walletName: ScannedData.walletName,
          version: DeviceInfo.getVersion(),
          shareTransferDetails: {
            otp,
            encryptedKey,
          },
          isPrimary: isPrimaryKeeper,
          featuresList,
          securityQuestion,
        };
        const updateRes = yield call(
          keeper.updateTrustedChannel,
          share.shareId,
          data,
          false,
        );
        if (updateRes.status == 200) {
          if (isReshare) {
            yield call(uploadSecondaryShareWorker, {
              payload: {
                encryptedKey: dataElements.shareTransferDetails.encryptedKey,
                metaShare: DECENTRALIZED_BACKUP.PK_SHARE,
                otp: dataElements.shareTransferDetails.otp,
              },
            });
          }
          let shareArray = [
            {
              walletId: s3Service.getWalletId().data.walletId,
              shareId: share.shareId,
              reshareVersion: 0,
              updatedAt: moment(new Date()).valueOf(),
              name: ScannedData.walletName,
              shareType: type,
            },
          ];
          yield put(updateMSharesHealth(shareArray));
          let keeperInfo = yield select((state) => state.health.keeperInfo);
          let flag = false;
          if (keeperInfo.length > 0) {
            for (let i = 0; i < keeperInfo.length; i++) {
              const element = keeperInfo[i];
              if (element.shareId == share.shareId) {
                keeperInfo[i].name = ScannedData.walletName;
                keeperInfo[i].uuid = ScannedData.uuid;
                keeperInfo[i].publicKey = ScannedData.publicKey;
                keeperInfo[i].ephemeralAddress = ScannedData.ephemeralAddress;
                keeperInfo[i].type = type;
                break;
              } else {
                flag = true;
                break;
              }
            }
          } else {
            flag = true;
          }
          if (flag) {
            let obj = {
              shareId: share.shareId,
              name: ScannedData.walletName,
              uuid: ScannedData.uuid,
              publicKey: ScannedData.publicKey,
              ephemeralAddress: ScannedData.ephemeralAddress,
              type,
            };
            keeperInfo.push(obj);
          }
          yield put(updatedKeeperInfo(keeperInfo));
          const { SERVICES } = yield select((state) => state.storage.database);
          const updatedSERVICES = {
            ...SERVICES,
            S3_SERVICE: JSON.stringify(s3Service),
            KEEPERS_INFO: JSON.stringify(keeper),
          };
          yield call(insertDBWorker, {
            payload: { SERVICES: updatedSERVICES },
          });
        }
      }
    }
    yield put(updateMSharesLoader(false));
  } catch (error) {
    console.log('Error EF channel', error);
  }
}

export const createAndUploadOnEFChannelWatcher = createWatcher(
  createAndUploadOnEFChannelWorker,
  CREATE_N_UPLOAD_ON_EF_CHANNEL,
);

function* uploadSecondaryShareWorker({ payload }) {
  let { encryptedKey, metaShare, otp } = payload;
  const keeper: KeeperService = yield select((state) => state.keeper.service);
  const result = yield call(
    keeper.uploadSecondaryShare,
    encryptedKey,
    metaShare,
    otp,
  );
  if (result.status === 200) {
  }
  yield put(updateMSharesLoader(false));
}

export const uploadSecondaryShareWatcher = createWatcher(
  uploadSecondaryShareWorker,
  UPLOAD_SECONDARY_SHARE,
);

function* updateHealthLevel2Worker({ payload }) {
  let { level } = payload;
  console.log('INIT_LEVEL_TWO workes');
  let isLevelInitialized = yield select(
    (state) => state.health.isLevel3Initialized,
  );
  if (level == 2) {
    isLevelInitialized = yield select(
      (state) => state.health.isLevel2Initialized,
    );
  }
  console.log('INIT_LEVEL_TWO isLevel2Initialized', isLevelInitialized);
  if (!isLevelInitialized) {
    let s3Service: S3Service = yield select((state) => state.health.service);
    let Health = yield select((state) => state.health.levelHealth);
    let SecurityQuestionHealth = Health[0].levelInfo[1];
    yield put(initLoader(true));
    const res = yield call(
      s3Service.updateHealthLevel2,
      SecurityQuestionHealth,
      level
    );
    if (res.data.success) {
      // Update Health to reducer
      yield put(checkMSharesHealth());
      if (level == 2) yield put(isLevel2InitializedStatus());
      if (level == 3) yield put(isLevel3InitializedStatus());
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
  const {
    SERVICES,
    WALLET_SETUP,
    DECENTRALIZED_BACKUP,
    ASYNC_DATA,
  } = payload.icloudData.walletImage;

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
    yield call(
      AsyncStorage.setItem,
      'walletID',
      s3Service.levelhealth.walletId,
    );
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
  console.log('downloadShareWorker', payload);
  const { encryptedKey } = payload;

  if (!encryptedKey) return;
  const res = yield call(S3Service.downloadShare, encryptedKey);

  if (res.status === 200) {
    console.log('SHARES DOWNLOAD', res.data);
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

export function* downloadMetaShareWorker({ payload }) {
  yield put(switchS3LoadingStatus('downloadMetaShare'));

  const { encryptedKey, otp, walletName, walletID } = payload; // OTP is missing when the encryptedKey isn't OTP encrypted
  const s3Service: S3Service = yield select((state) => state.health.service);

  const { DECENTRALIZED_BACKUP } = yield select(
    (state) => state.storage.database,
  );

  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP;

  let res;
  if (payload.downloadType !== 'recovery') {
    let existingShares = [];
    if (Object.keys(UNDER_CUSTODY).length) {
      existingShares = Object.keys(UNDER_CUSTODY).map(
        (tag) => UNDER_CUSTODY[tag].META_SHARE,
      );
    }

    res = yield call(
      S3Service.downloadAndValidateShare,
      encryptedKey,
      otp,
      existingShares,
      s3Service.levelhealth.walletId,
    );
  } else {
    res = yield call(S3Service.downloadAndValidateShare, encryptedKey, otp);
  }

  console.log({ res });
  if (res.status === 200) {
    const { metaShare, encryptedDynamicNonPMDD } = res.data;
    let updatedBackup;
    if (payload.downloadType !== 'recovery') {
      //TODO: activate DNP Transportation Layer for Hexa Premium
      // const dynamicNonPMDD = {
      //   ...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD,
      //   META_SHARES: DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD.META_SHARES
      //     ? [...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD.META_SHARES, metaShare]
      //     : [metaShare],
      // };

      updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        UNDER_CUSTODY: {
          ...DECENTRALIZED_BACKUP.UNDER_CUSTODY,
          [metaShare.meta.tag]: {
            META_SHARE: metaShare,
            ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
          },
        },
        // DYNAMIC_NONPMDD: dynamicNonPMDD,
      };

      console.log({ updatedBackup });
      yield call(insertDBWorker, {
        payload: {
          DECENTRALIZED_BACKUP: updatedBackup,
        },
      });

      if (payload.downloadType !== 'recovery') {
        let shareArray = [
          {
            walletId: walletID,
            shareId: metaShare.shareId,
            reshareVersion: metaShare.meta.reshareVersion,
            updatedAt: moment(new Date()).valueOf(),
            name: walletName,
            shareType: 'contact',
            status: 'accessible',
          },
        ];
        yield put(updateMSharesHealth(shareArray));
      }
      // yield call(updateDynamicNonPMDDWorker, { payload: { dynamicNonPMDD } }); // upload updated dynamic nonPMDD (TODO: time-based?)
      yield put(downloadedMShare(otp, true));
      //yield put(updateMSharesHealth());
    } else {
      let updatedRecoveryShares = {};
      let updated = false;
      if (payload.replaceIndex === 0 || payload.replaceIndex) {
        // replacing stored key w/ scanned from Guardian's help-restore
        updatedRecoveryShares = {
          ...DECENTRALIZED_BACKUP.RECOVERY_SHARES,
          [payload.replaceIndex]: {
            REQUEST_DETAILS: { KEY: encryptedKey },
            META_SHARE: metaShare,
            ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
          },
        };
      } else {
        Object.keys(DECENTRALIZED_BACKUP.RECOVERY_SHARES).forEach(
          (objectKey) => {
            const recoveryShare =
              DECENTRALIZED_BACKUP.RECOVERY_SHARES[objectKey];
            console.log('recoveryShare', recoveryShare, objectKey);
            if (
              recoveryShare.REQUEST_DETAILS &&
              recoveryShare.REQUEST_DETAILS.KEY === encryptedKey
            ) {
              updatedRecoveryShares[objectKey] = {
                REQUEST_DETAILS: recoveryShare.REQUEST_DETAILS,
                META_SHARE: metaShare,
                ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
              };
              updated = true;
            } else {
              updatedRecoveryShares[objectKey] = recoveryShare;
            }
          },
        );
      }
      console.log('updatedRecoveryShares', updatedRecoveryShares);
      updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        RECOVERY_SHARES: updatedRecoveryShares,
      };
      console.log('updatedBackup', updatedBackup);
      // yield put(downloadedMShare(otp, true));
      yield call(insertDBWorker, {
        payload: { DECENTRALIZED_BACKUP: updatedBackup },
      });
    }
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log({ res });
    yield put(ErrorReceiving(true));
    // Alert.alert('Download Failed!', res.err);
    yield put(downloadedMShare(otp, false, res.err));
  }
  yield put(switchS3LoadingStatus('downloadMetaShare'));
}

export const downloadMetaShareHealthWatcher = createWatcher(
  downloadMetaShareWorker,
  DOWNLOAD_MSHARE_HEALTH,
);

function* recoverWalletWorker({ payload }) {
  yield put(switchS3LoadingStatus('restoreWallet'));

  try {
    const { WALLET_SETUP, DECENTRALIZED_BACKUP } = yield select(
      (state) => state.storage.database,
    );

    const { security } = WALLET_SETUP;
    const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;

    let encDynamicNonPMDD;
    const mappedMetaShares: { [walletId: string]: MetaShare[] } = {};
    Object.keys(RECOVERY_SHARES).forEach((key) => {
      const { META_SHARE, ENC_DYNAMIC_NONPMDD } = RECOVERY_SHARES[key];
      if (META_SHARE) {
        // metaShares[key] = META_SHARE; //mapping metaShares according to their shareIndex so that they can be aptly used at ManageBackup
        const shares = mappedMetaShares[META_SHARE.meta.walletId]
          ? mappedMetaShares[META_SHARE.meta.walletId]
          : [];
        let insert = true;
        shares.forEach((share) => {
          if (share.shareId === META_SHARE.shareId) insert = false;
        }, []);

        if (insert) {
          shares.push(META_SHARE);
          mappedMetaShares[META_SHARE.meta.walletId] = shares;
        }
      }
      // if (!encDynamicNonPMDD) { // retired due to wallet image
      //   encDynamicNonPMDD = ENC_DYNAMIC_NONPMDD;
      // } else {
      //   if (encDynamicNonPMDD.updatedAt < ENC_DYNAMIC_NONPMDD.updatedAt) {
      //     encDynamicNonPMDD = ENC_DYNAMIC_NONPMDD;
      //   }
      // }
    });

    console.log({ mappedMetaShares });
    let restorationShares: MetaShare[] = [];
    Object.keys(mappedMetaShares).forEach((walletId) => {
      if (mappedMetaShares[walletId].length >= payload.level)
        restorationShares = mappedMetaShares[walletId];
    });

    console.log('restorationShares', restorationShares);
    if (Object.keys(restorationShares).length !== payload.level) {
      Alert.alert('Insufficient compatible shares to recover the wallet');
      yield put(walletRecoveryFailed(true));
      throw new Error(`Insufficient compatible shares to recover the wallet`);
    }

    const encryptedSecrets: string[] = restorationShares.map(
      (share) => share.encryptedSecret,
    );

    const res = yield call(
      S3Service.recoverFromSecrets,
      encryptedSecrets,
      security.answer,
      payload.level,
    );

    if (res.status === 200) {
      const { mnemonic } = res.data;
      console.log('mnemonic', mnemonic);
      const {
        regularAcc,
        testAcc,
        secureAcc,
        s3Service,
        trustedContacts,
        keepersInfo,
      } = yield call(
        serviceGenerator2,
        security.answer,
        mnemonic,
        restorationShares,
      );

      const UNDER_CUSTODY = {};
      let DYNAMIC_NONPMDD = {};
      if (encDynamicNonPMDD) {
        // decentralized restoration of Wards
        const res = s3Service.decryptDynamicNonPMDD(encDynamicNonPMDD);

        if (res.status !== 200)
          console.log('Failed to decrypt dynamic nonPMDD');
        const dynamicNonPMDD = res.data.decryptedDynamicNonPMDD;
        dynamicNonPMDD.META_SHARES.forEach((metaShare) => {
          UNDER_CUSTODY[metaShare.meta.tag] = {
            META_SHARE: metaShare,
          };
        });
        DYNAMIC_NONPMDD = dynamicNonPMDD;
      }

      const DECENTRALIZED_BACKUP = {
        RECOVERY_SHARES: {},
        SHARES_TRANSFER_DETAILS: {},
        UNDER_CUSTODY: {},
        DYNAMIC_NONPMDD: {},
        PK_SHARE: {},
      };
      console.log({ DECENTRALIZED_BACKUP });

      const SERVICES = {
        REGULAR_ACCOUNT: JSON.stringify(regularAcc),
        TEST_ACCOUNT: JSON.stringify(testAcc),
        SECURE_ACCOUNT: JSON.stringify(secureAcc),
        S3_SERVICE: JSON.stringify(s3Service),
        TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
        KEEPERS_INFO: JSON.stringify(keepersInfo),
      };
      const payload = { SERVICES, DECENTRALIZED_BACKUP };
      yield call(insertDBWorker, { payload });
      //yield delay(2000); // seconds delay prior to Wallet Image check
      yield put(fetchWalletImage());

      yield call(
        AsyncStorage.setItem,
        'walletID',
        s3Service.levelhealth.walletId,
      );
      const current = Date.now();
      AsyncStorage.setItem('SecurityAnsTimestamp', JSON.stringify(current));
      const securityQuestionHistory = {
        confirmed: current,
      };
      AsyncStorage.setItem(
        'securityQuestionHistory',
        JSON.stringify(securityQuestionHistory),
      );

      // personal copy health restoration
      // let updatedPDFHealth = {};
      // for (const share of restorationShares) {
      //   if (share.meta.index > 2) {
      //     updatedPDFHealth = {
      //       ...updatedPDFHealth,
      //       [share.meta.index]: {
      //         shareId: `placeHolderID${share.meta.index}`,
      //         updatedAt: Date.now(),
      //       },
      //     };
      //   }
      // }

      // if (!updatedPDFHealth[3]) {
      //   updatedPDFHealth = {
      //     ...updatedPDFHealth,
      //     [3]: {
      //       shareId: 'placeHolderID3',
      //       updatedAt: 0,
      //     },
      //   };
      // }
      // if (!updatedPDFHealth[4]) {
      //   updatedPDFHealth = {
      //     ...updatedPDFHealth,
      //     [4]: {
      //       shareId: 'placeHolderID4',
      //       updatedAt: 0,
      //     },
      //   };
      // }
      // if (Object.keys(updatedPDFHealth).length)
      //   yield call(
      //     AsyncStorage.setItem,
      //     'PDF Health',
      //     JSON.stringify(updatedPDFHealth),
      //   );
    } else {
      throw new Error(res.err);
    }
  } catch (err) {
    console.log({ err: err.message });
    yield put(walletRecoveryFailed(true));
    // Alert.alert('Wallet recovery failed!', err.message);
  }

  yield put(switchS3LoadingStatus('restoreWallet'));
}

export const recoverWalletHealthWatcher = createWatcher(
  recoverWalletWorker,
  RECOVER_WALLET_HEALTH,
);

export function* cloudMetaShareWorker({ payload }) {
  yield put(switchS3LoadingStatus('downloadMetaShare'));

  const { metaShare } = payload;

  const { DECENTRALIZED_BACKUP } = yield select(
    (state) => state.storage.database,
  );

  let updatedBackup;
  console.log('PAYLOAD', payload);
  let updatedRecoveryShares = {};
  let updated = false;
  console.log('INSIDE ELSE');
  if (payload.replaceIndex === 0 || payload.replaceIndex) {
    // replacing stored key w/ scanned from Guardian's help-restore
    updatedRecoveryShares = {
      ...DECENTRALIZED_BACKUP.RECOVERY_SHARES,
      [payload.replaceIndex]: {
        //REQUEST_DETAILS: { KEY: encryptedKey },
        META_SHARE: metaShare,
        //ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
      },
    };
  }
  console.log('updatedRecoveryShares', updatedRecoveryShares);
  updatedBackup = {
    ...DECENTRALIZED_BACKUP,
    RECOVERY_SHARES: updatedRecoveryShares,
  };
  console.log('updatedBackup', updatedBackup);
  let InsertDBData;
  // if(payload.walletImage.SERVICES){
  //   InsertDBData = { DECENTRALIZED_BACKUP: updatedBackup, SERVICES: payload.walletImage.SERVICES}
  // }
  // else{
  InsertDBData = { DECENTRALIZED_BACKUP: updatedBackup };
  // }
  console.log('InsertDBData', InsertDBData);

  // yield put(downloadedMShare(otp, true));
  yield call(insertDBWorker, {
    payload: InsertDBData,
  });

  yield put(switchS3LoadingStatus('downloadMetaShare'));
}

export const cloudMetaShareHealthWatcher = createWatcher(
  cloudMetaShareWorker,
  CLOUD_MSHARE,
);

function* fetchWalletImageWorker({ payload }) {
  const s3Service: S3Service = yield select((state) => state.health.service);

  const res = yield call(s3Service.fetchWalletImage);
  console.log({ res });
  if (res.status === 200) {
    const walletImage: WalletImage = res.data.walletImage;
    console.log({ walletImage });

    if (!Object.keys(walletImage).length)
      console.log('Failed fetch: Empty Wallet Image');

    // update DB and Async
    const { DECENTRALIZED_BACKUP, SERVICES, ASYNC_DATA } = walletImage;

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
    yield call(insertDBWorker, { payload }); // synchronously update db

    // update hashes
    const hashesWI = {};
    Object.keys(walletImage).forEach((key) => {
      hashesWI[key] = hash(walletImage[key]);
    });
    yield call(AsyncStorage.setItem, 'WI_HASHES', JSON.stringify(hashesWI));
  } else {
    console.log({ err: res.err });
    console.log('Failed to fetch Wallet Image');
  }
  yield put(walletImageChecked(true));
}

export const fetchWalletImageHealthWatcher = createWatcher(
  fetchWalletImageWorker,
  FETCH_WALLET_IMAGE_HEALTH,
);

function* uploadEncMetaShareKeeperWorker({ payload }) {
  // Transfer: User >>> Guardian
  yield put(switchS3LoaderKeeper('uploadMetaShare'));

  const s3Service: S3Service = yield select((state) => state.health.service);
  if (!s3Service.levelhealth.metaShares.length) return;
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );
  const keepersInfo: KeeperService = yield select(
    (state) => state.keeper.service,
  );
  const regularService: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );
  const { DECENTRALIZED_BACKUP, SERVICES } = yield select(
    (state) => state.storage.database,
  );
  let shareIndex = 2;
  if (payload.shareId && s3Service.levelhealth.metaShares.length) {
    let metaShare: MetaShare[] = s3Service.levelhealth.metaShares;
    if (metaShare.findIndex((value) => value.shareId == payload.shareId) > -1) {
      shareIndex = metaShare.findIndex(
        (value) => value.shareId == payload.shareId,
      );
    }
  }

  if (payload.changingGuardian) {
    if (payload.contactInfo.contactName === 'secondary device') {
      delete trustedContacts.tc.trustedContacts[
        payload.contactInfo.contactName
      ]; // removing secondary device's TC
      const accountNumber =
        regularService.hdWallet.trustedContactToDA[
          payload.contactInfo.contactName
        ];
      if (accountNumber) {
        delete regularService.hdWallet.derivativeAccounts[TRUSTED_CONTACTS][
          accountNumber
        ].contactDetails; // removing previous SDs xpub
      }
    }

    yield call(s3Service.reshareMetaShare, shareIndex);
    if (payload.previousGuardianName) {
      trustedContacts.tc.trustedContacts[
        payload.previousGuardianName
      ].isGuardian = false;
    }
  } else {
    // preventing re-uploads till expiry
    if (DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[shareIndex]) {
      if (
        Date.now() -
          DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[shareIndex].UPLOADED_AT <
        config.TC_REQUEST_EXPIRY
      ) {
        // re-upload after 10 minutes (removal sync w/ relayer)
        yield put(switchS3LoaderKeeper('uploadMetaShare'));

        return;
      }
    }
  }

  // TODO: reactivate DNP Transportation for Hexa Premium
  // const { DYNAMIC_NONPMDD } = DECENTRALIZED_BACKUP;
  // let dynamicNonPMDD;
  // if (Object.keys(DYNAMIC_NONPMDD).length) dynamicNonPMDD = DYNAMIC_NONPMDD; // Nothing in DNP

  // const res = yield call(
  //   s3Service.uploadShare,
  //   shareIndex,
  //   dynamicNonPMDD,
  // );

  const res = yield call(
    s3Service.prepareShareUploadables,
    shareIndex,
    payload.contactInfo.contactName,
  ); // contact injection (requires database insertion)

  if (res.status === 200) {
    const {
      otp,
      encryptedKey,
      encryptedMetaShare,
      messageId,
      encryptedDynamicNonPMDD,
    } = res.data;

    const shareUploadables: ShareUploadables = {
      encryptedMetaShare,
      messageId,
      encryptedDynamicNonPMDD,
    };
    const updatedSERVICES = {
      ...SERVICES,
      REGULAR_ACCOUNT: JSON.stringify(regularService),
      S3_SERVICE: JSON.stringify(s3Service),
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
      KEEPERS_INFO: JSON.stringify(keepersInfo),
    };

    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      SHARES_TRANSFER_DETAILS: {
        ...DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
        [shareIndex]: {
          OTP: otp,
          ENCRYPTED_KEY: encryptedKey,
          UPLOADED_AT: Date.now(),
        },
      },
    };

    // yield call(insertDBWorker, {
    //   payload: {
    //     DECENTRALIZED_BACKUP: updatedBackup,
    //     SERVICES: updatedSERVICES,
    //   },
    // });

    const updatedDB = {
      DECENTRALIZED_BACKUP: updatedBackup,
      SERVICES: updatedSERVICES,
    };

    const contact =
      trustedContacts.tc.trustedContacts[payload.contactInfo.contactName];
    if (contact && contact.symmetricKey) {
      // has trusted channel
      const data: TrustedDataElements = {
        // won't include elements from payload.data
        shareTransferDetails: {
          otp,
          encryptedKey,
        },
      };
      yield put(
        updateTrustedChannel(
          payload.contactInfo,
          data,
          null,
          shareUploadables,
          updatedDB,
        ),
      );
    } else {
      // adding transfer details to he ephemeral data

      const data: EphemeralDataElements = {
        ...payload.data,
        shareTransferDetails: {
          otp,
          encryptedKey,
        },
      };

      yield put(
        updateEphemeralChannel(
          payload.contactInfo,
          data,
          null,
          null,
          null,
          shareUploadables,
          updatedDB,
        ),
      );
    }
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(ErrorSending(true));
    // Alert.alert('Upload Failed!', res.err);
    console.log({ err: res.err });
  }
  yield put(switchS3LoaderKeeper('uploadMetaShare'));
}

export const uploadEncMetaShareKeeperWatcher = createWatcher(
  uploadEncMetaShareKeeperWorker,
  UPLOAD_ENC_MSHARE_KEEPER,
);

function* sendApprovalRequestWorker({ payload }) {
  yield put(switchS3LoaderKeeper('approvalRequest'));
  let { shareID, PkShareId } = payload;
  let keeper = yield select((state) => state.keeper.service);
  let keeperInfo: Keepers = keeper.keeper.keepers[PkShareId];
  if (keeperInfo.keeperUUID) {
    const notification: INotification = {
      notificationType: notificationType.approveKeeper,
      title: 'Approval Request for Keeper',
      body: 'Approval Keeper setup',
      data: JSON.stringify({ shareID }),
      tag: notificationTag.IMP,
      date: new Date(),
    };
    let res = yield call(
      RelayServices.sendKeeperNotifications,
      [keeperInfo.keeperUUID],
      notification,
    );
  }
  yield put(switchS3LoaderKeeper('approvalRequest'));
}

export const sendApprovalRequestWatcher = createWatcher(
  sendApprovalRequestWorker,
  SEND_APPROVAL_REQUEST,
);

function* generatePDFWorker({ payload }) {
  // yield put(switchS3Loader('generatePDF'));
  const { selectedPersonalCopy } = payload; // corresponds to metaShare index (3/4)
  //const shareIndex = selectedPersonalCopy.type === 'copy1' ? 3 : 4;
  const s3Service: S3Service = yield select((state) => state.sss.service);
  // const res = yield call(s3Service.createQR, shareIndex);
  // if (res.status !== 200) {
  //   console.log({ err: res.err });
  //   return;
  // }
  const secureAccount: SecureAccount = yield select(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );
  const qrData = {
    secondaryMnemonic: '',
    secondaryXpub: '',
    bhXpub: '',
  };

  const pdfData = {
    qrData: qrData
  };

  const { security, walletName } = yield select(
    (state) => state.storage.database.WALLET_SETUP,
  );

  try {
    const pdfPath = yield call(
      generatePDFKeeper,
      pdfData,
      `Hexa_Recovery_Key_${walletName}.pdf`,
      `Hexa Recovery Key for ${walletName}'s Wallet`
    );

    let personalCopyDetails = yield call(
      AsyncStorage.getItem,
      'personalCopyDetails',
    );
    // console.log('/sagas/sss ', {personalCopyDetails})
    if (!personalCopyDetails) {
      personalCopyDetails = {
        [selectedPersonalCopy.type]: {
          path: pdfPath,
          shared: false,
          sharingDetails: {},
        },
      };
    } else {
      personalCopyDetails = JSON.parse(personalCopyDetails);
      const originalSharedStatus = personalCopyDetails[
        selectedPersonalCopy.type
      ]
        ? personalCopyDetails[selectedPersonalCopy.type].shared
        : false;
      const originalSharingDetails =
        personalCopyDetails[selectedPersonalCopy.type] &&
        personalCopyDetails[selectedPersonalCopy.type].sharingDetails
          ? personalCopyDetails[selectedPersonalCopy.type].sharingDetails
          : {};
      personalCopyDetails = {
        ...personalCopyDetails,
        [selectedPersonalCopy.type]: {
          path: pdfPath,
          shared: !!originalSharedStatus,
          sharingDetails: originalSharingDetails,
        },
      };
    }
    // console.log('/sagas/sss ', {personalCopyDetails})
    yield call(
      AsyncStorage.setItem,
      'personalCopyDetails',
      JSON.stringify(personalCopyDetails),
    );

    // reset PDF health (if present) post reshare
    let storedPDFHealth = yield call(AsyncStorage.getItem, 'PDF Health');
    // console.log('/sagas/sss ', {storedPDFHealth})
    if (storedPDFHealth) {
      const { pdfHealth } = s3Service.levelhealth;
      storedPDFHealth = JSON.parse(storedPDFHealth);
      storedPDFHealth = {
        ...storedPDFHealth,
       // [shareIndex]: { shareId: pdfHealth[shareIndex].shareId, updatedAt: 0 },
      };
      // console.log('/sagas/sss ', {storedPDFHealth})
      yield call(
        AsyncStorage.setItem,
        'PDF Health',
        JSON.stringify(storedPDFHealth),
      );
    }

    yield put(pdfGenerated(true));

    // if (Object.keys(personalCopyDetails).length == 2) {
    //   // remove sec-mne once both the personal copies are generated
    //   const { removed } = secureAccount.removeSecondaryMnemonic();
    //   if (!removed) console.log('Failed to remove sec-mne');
    // }

    // remove secondary mnemonic (if the secondary menmonic has been removed and re-injected)
    const blockPCShare = yield call(AsyncStorage.getItem, 'blockPCShare');
    // if (blockPCShare) {
    //   if (secureAccount.secureHDWallet.secondaryMnemonic) {
    //     const { removed } = secureAccount.removeSecondaryMnemonic();
    //     if (!removed) {
    //       console.log('Failed to remove the secondary mnemonic');
    //     }
    //   }
    // }

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      SECURE_ACCOUNT: JSON.stringify(secureAccount),
      S3_SERVICE: JSON.stringify(s3Service),
    };

    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } catch (err) {
    console.log({ err });
    yield put(pdfGenerated(false));
  }
  //yield put(switchS3Loader('generatePDF'));
}

export const generatePDFWatcher = createWatcher(
  generatePDFWorker,
  GENERATE_PDF,
);
