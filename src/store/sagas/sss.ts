import { call, put, select } from 'redux-saga/effects';
import { createWatcher, serviceGenerator } from '../utils/utilities';
import {
  INIT_HEALTH_CHECK,
  switchS3Loader,
  healthCheckInitialized,
  PREPARE_MSHARES,
  UPLOAD_ENC_MSHARE,
  DOWNLOAD_MSHARE,
  UPDATE_MSHARES_HEALTH,
  CHECK_MSHARES_HEALTH,
  UPLOAD_REQUESTED_SHARE,
  REQUEST_SHARE,
  RECOVER_MNEMONIC,
  mnemonicRecovered,
  UPDATE_DYNAMINC_NONPMDD,
  DOWNLOAD_DYNAMIC_NONPMDD,
  RECOVER_WALLET,
  RESTORE_DYNAMIC_NONPMDD,
  GENERATE_PDF,
  requestedShareUploaded,
  downloadedMShare,
  OVERALL_HEALTH,
  calculateOverallHealth,
  overallHealthCalculated,
  CHECK_PDF_HEALTH,
  RESTORE_SHARE_FROM_QR,
  updateMSharesHealth,
  UPDATE_SHARE_HISTORY,
  updateShareHistory,
  pdfHealthChecked,
  QRChecked,
  UnableRecoverShareFromQR,
  walletRecoveryFailed,
  ErrorSending,
  UploadSuccessfully,
  ErrorReceiving,
} from '../actions/sss';
import { dbInsertedSSS } from '../actions/storage';

import S3Service from '../../bitcoin/services/sss/S3Service';
import { insertIntoDB } from '../actions/storage';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import { SECURE_ACCOUNT } from '../../common/constants/serviceTypes';
import {
  EncDynamicNonPMDD,
  MetaShare,
} from '../../bitcoin/utilities/Interface';
import generatePDF from '../utils/generatePDF';
import HealthStatus from '../../bitcoin/utilities/sss/HealthStatus';
import { AsyncStorage } from 'react-native';
import { Alert } from 'react-native';

function* generateMetaSharesWorker() {
  const s3Service: S3Service = yield select(state => state.sss.service);
  const { walletName } = yield select(
    state => state.storage.database.WALLET_SETUP,
  );
  const secureAccount: SecureAccount = yield select(
    state => state.accounts[SECURE_ACCOUNT].service,
  );

  const secondaryMnemonic = secureAccount.secureHDWallet.secondaryMnemonic;
  const twoFASecret = secureAccount.secureHDWallet.twoFASetup.secret;
  const { secondary, bh } = secureAccount.secureHDWallet.xpubs;

  const secureAssets = {
    secondaryMnemonic,
    twoFASecret,
    secondaryXpub: secondary,
    bhXpub: bh,
  };

  if (s3Service.sss.metaShares.length) return;
  const res = yield call(s3Service.createMetaShares, secureAssets, walletName);
  if (res.status === 200) {
    return s3Service;
    // const { SERVICES } = yield select(state => state.storage.database);
    // const updatedSERVICES = {
    //   ...SERVICES,
    //   S3_SERVICE: JSON.stringify(s3Service)
    // };
    // yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    throw new Error(res.err);
  }
}

export const generateMetaSharesWatcher = createWatcher(
  generateMetaSharesWorker,
  PREPARE_MSHARES,
);

function* initHCWorker() {
  let s3Service: S3Service = yield select(state => state.sss.service);
  const initialized = s3Service.sss.healthCheckInitialized;
  if (initialized) return;

  yield put(switchS3Loader('initHC'));
  if (!s3Service.sss.metaShares.length) {
    s3Service = yield call(generateMetaSharesWorker);
  }

  const res = yield call(s3Service.initializeHealthcheck);
  if (res.status === 200) {
    yield put(healthCheckInitialized());
    const { SERVICES } = yield select(state => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      S3_SERVICE: JSON.stringify(s3Service),
    };
    console.log('Health Check Initialized');
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    console.log({ err: res.err });
    yield put(switchS3Loader('initHC'));
  }
}

export const initHCWatcher = createWatcher(initHCWorker, INIT_HEALTH_CHECK);

function* uploadEncMetaShareWorker({ payload }) {
  // Transfer: User >>> Guardian
  const s3Service: S3Service = yield select(state => state.sss.service);
  if (!s3Service.sss.metaShares.length) return;

  const { DECENTRALIZED_BACKUP } = yield select(
    state => state.storage.database,
  );
  // preventing re-uploads till expiry
  if (DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[payload.shareIndex]) {
    if (
      Date.now() -
        DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[payload.shareIndex]
          .UPLOADED_AT <
      600000
    ) {
      // re-upload after 10 minutes (removal sync w/ relayer)
      return;
    }
  }
  yield put(switchS3Loader('uploadMetaShare'));

  const res = yield call(s3Service.uploadShare, payload.shareIndex);
  if (res.status === 200) {
    console.log('Uploaded share: ', payload.shareIndex);
    const { otp, encryptedKey } = res.data;
    console.log({ otp, encryptedKey });

    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      SHARES_TRANSFER_DETAILS: {
        ...DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
        [payload.shareIndex]: {
          OTP: otp,
          ENCRYPTED_KEY: encryptedKey,
          UPLOADED_AT: Date.now(),
        },
      },
    };
    yield put(insertIntoDB({ DECENTRALIZED_BACKUP: updatedBackup }));
  } else {
    yield put(ErrorSending(true));
    // Alert.alert('Upload Failed!', res.err);
    console.log({ err: res.err });
  }
  yield put(switchS3Loader('uploadMetaShare'));
}

export const uploadEncMetaShareWatcher = createWatcher(
  uploadEncMetaShareWorker,
  UPLOAD_ENC_MSHARE,
);

function* requestShareWorker({ payload }) {
  const { DECENTRALIZED_BACKUP, WALLET_SETUP } = yield select(
    state => state.storage.database,
  );

  if (Object.keys(DECENTRALIZED_BACKUP.RECOVERY_SHARES).length >= 3) {
    console.log(DECENTRALIZED_BACKUP.RECOVERY_SHARES);
    return;
  } // capping to 3 shares reception

  const { otp, encryptedKey } = yield call(S3Service.generateRequestCreds);

  const updatedBackup = {
    ...DECENTRALIZED_BACKUP,
    RECOVERY_SHARES: {
      ...DECENTRALIZED_BACKUP.RECOVERY_SHARES,
      [payload.shareIndex]: {
        REQUEST_DETAILS: {
          TAG: WALLET_SETUP.walletName,
          OTP: otp,
          ENCRYPTED_KEY: encryptedKey,
        },
      },
    },
  };

  yield put(insertIntoDB({ DECENTRALIZED_BACKUP: updatedBackup }));
}

export const requestShareWatcher = createWatcher(
  requestShareWorker,
  REQUEST_SHARE,
);

function* uploadRequestedShareWorker({ payload }) {
  // Transfer: Guardian >>> User
  const { tag, encryptedKey, otp } = payload;
  const { UNDER_CUSTODY } = yield select(
    state => state.storage.database.DECENTRALIZED_BACKUP,
  );

  if (!UNDER_CUSTODY[tag]) {
    yield put(ErrorSending(true));
    // Alert.alert('Upload failed!', 'No share under custody for this wallet.');
  }

  const { META_SHARE, ENC_DYNAMIC_NONPMDD } = UNDER_CUSTODY[tag];

  // TODO: 10 min removal strategy
  yield put(switchS3Loader('uploadRequestedShare'));

  const res = yield call(
    S3Service.uploadRequestedShare,
    encryptedKey,
    otp,
    META_SHARE,
    ENC_DYNAMIC_NONPMDD,
  );

  if (res.status === 200 && res.data.success === true) {
    // yield success
    console.log('Upload successful!');
    yield put(requestedShareUploaded(tag, true));
    yield put(UploadSuccessfully(true));
    // Alert.alert(
    //   'Upload successful!',
    //   "Requester's share has been uploaded to the relay.",
    // );
  } else {
    yield put(requestedShareUploaded(tag, false, res.err));
  }
  yield put(switchS3Loader('uploadRequestedShare'));
}

export const uploadRequestedShareWatcher = createWatcher(
  uploadRequestedShareWorker,
  UPLOAD_REQUESTED_SHARE,
);

function* downloadMetaShareWorker({ payload }) {
  yield put(switchS3Loader('downloadMetaShare'));

  const { otp, encryptedKey } = payload;
  const { DECENTRALIZED_BACKUP } = yield select(
    state => state.storage.database,
  );

  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP;

  let res;
  if (payload.downloadType !== 'recovery') {
    let existingShares = [];
    if (Object.keys(UNDER_CUSTODY).length) {
      existingShares = Object.keys(UNDER_CUSTODY).map(
        tag => UNDER_CUSTODY[tag].META_SHARE,
      );
    }

    res = yield call(
      S3Service.downloadAndValidateShare,
      encryptedKey,
      otp,
      existingShares,
    );
  } else {
    res = yield call(S3Service.downloadAndValidateShare, encryptedKey, otp);
    console.log({ res });
  }

  console.log({ res });
  if (res.status === 200) {
    const { metaShare, dynamicNonPMDD } = res.data;
    let updatedBackup;
    if (payload.downloadType !== 'recovery') {
      updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        UNDER_CUSTODY: {
          ...DECENTRALIZED_BACKUP.UNDER_CUSTODY,
          [metaShare.meta.tag]: {
            META_SHARE: metaShare,
            ENC_DYNAMIC_NONPMDD: dynamicNonPMDD,
          },
        },
        DYNAMIC_NONPMDD: {
          ...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD,
          META_SHARES: DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD.META_SHARES
            ? [...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD.META_SHARES, metaShare]
            : [metaShare],
        },
      };
      yield put(downloadedMShare(otp, true));
      yield put(updateMSharesHealth(updatedBackup));
    } else {
      const updatedRecoveryShares = {};
      Object.keys(DECENTRALIZED_BACKUP.RECOVERY_SHARES).forEach(key => {
        const recoveryShare = DECENTRALIZED_BACKUP.RECOVERY_SHARES[key];
        if (!recoveryShare.REQUEST_DETAILS) {
          updatedRecoveryShares[key] = recoveryShare;
        } else {
          if (recoveryShare.REQUEST_DETAILS.OTP === otp) {
            updatedRecoveryShares[key] = {
              REQUEST_DETAILS: recoveryShare.REQUEST_DETAILS,
              META_SHARE: metaShare,
              ENC_DYNAMIC_NONPMDD: dynamicNonPMDD,
            };
          } else {
            updatedRecoveryShares[key] = recoveryShare;
          }
        }
      });

      updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        RECOVERY_SHARES: updatedRecoveryShares,
      };
      yield put(downloadedMShare(otp, true));
      yield put(insertIntoDB({ DECENTRALIZED_BACKUP: updatedBackup }));
    }
    // yield put(
    //   insertIntoDB({
    //     DECENTRALIZED_BACKUP: updatedBackup,
    //   }),
    // ); // connecting insertion at updateMSharesHealth
  } else {
    console.log({ res });
    yield put(ErrorReceiving(true));
    // Alert.alert('Download Failed!', res.err);
    yield put(downloadedMShare(otp, false, res.err));
  }
  yield put(switchS3Loader('downloadMetaShare'));
}

export const downloadMetaShareWatcher = createWatcher(
  downloadMetaShareWorker,
  DOWNLOAD_MSHARE,
);

function* generatePDFWorker({ payload }) {
  // yield put(switchS3Loader('generatePDF'));
  const s3Service: S3Service = yield select(state => state.sss.service);
  const resQRPersonalCopy1 = yield call(
    s3Service.createQR,
    payload.personalcopy1 - 1,
  );
  if (resQRPersonalCopy1.status !== 200) {
    console.log({ err: resQRPersonalCopy1.err });
    return;
  }
  const resQRPersonalCopy2 = yield call(
    s3Service.createQR,
    payload.personalcopy2 - 1,
  );
  if (resQRPersonalCopy2.status !== 200) {
    console.log({ err: resQRPersonalCopy2.err });
    return;
  }

  const { SERVICES } = yield select(state => state.storage.database);
  const updatedSERVICES = {
    ...SERVICES,
    S3_SERVICE: JSON.stringify(s3Service),
  };

  yield put(insertIntoDB({ SERVICES: updatedSERVICES }));

  const secureAccount: SecureAccount = yield select(
    state => state.accounts[SECURE_ACCOUNT].service,
  );
  const secondaryMnemonic = secureAccount.secureHDWallet.secondaryMnemonic;
  const { qrData, secret } = secureAccount.secureHDWallet.twoFASetup;
  const { secondary, bh } = secureAccount.secureHDWallet.xpubs;
  const secureAssets = {
    secondaryMnemonic,
    twoFASecret: secret,
    twoFAQR: qrData,
    secondaryXpub: secondary,
    bhXpub: bh,
  };
  const pdfDataPersonalCopy1 = {
    qrData: resQRPersonalCopy1.data.qrData,
    ...secureAssets,
  };
  const pdfDataPersonalCopy2 = {
    qrData: resQRPersonalCopy2.data.qrData,
    ...secureAssets,
  };
  const { security, walletName } = yield select(
    state => state.storage.database.WALLET_SETUP,
  );
  try {
    const personalCopy1PdfPath = yield call(
      generatePDF,
      pdfDataPersonalCopy1,
      `Hexa_${walletName}_Recovery_Secret_Personal_Copy_1.pdf`,
      `Hexa Share ${payload.personalcopy1}`,
      security.answer,
    );
    const personalCopy2PdfPath = yield call(
      generatePDF,
      pdfDataPersonalCopy2,
      `Hexa_${walletName}_Recovery_Secret_Personal_Copy_2.pdf`,
      `Hexa Share  ${payload.personalcopy2}`,
      security.answer,
    );
    let path = {
      copy1: { path: personalCopy1PdfPath, flagShare: false, shareDetails: {} },
      copy2: { path: personalCopy2PdfPath, flagShare: false, shareDetails: {} },
    };
    // console.log({ path });
    yield put(dbInsertedSSS(path));
  } catch (err) {
    console.log({ err });
  }
  //yield put(switchS3Loader('generatePDF'));
}

export const generatePDFWatcher = createWatcher(
  generatePDFWorker,
  GENERATE_PDF,
);

function* updateMSharesHealthWorker({ payload }) {
  // set a timelapse for auto update and enable instantaneous manual update
  yield put(switchS3Loader('updateMSharesHealth'));

  let DECENTRALIZED_BACKUP = payload.DECENTRALIZED_BACKUP;
  if (!DECENTRALIZED_BACKUP) {
    DECENTRALIZED_BACKUP = yield select(
      state => state.storage.database.DECENTRALIZED_BACKUP,
    );
  }

  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP;
  const metaShares = Object.keys(UNDER_CUSTODY).map(
    tag => UNDER_CUSTODY[tag].META_SHARE,
  );

  const res = yield call(S3Service.updateHealth, metaShares);
  if (res.status === 200) {
    // TODO: Use during selective updation
    const { updationInfo } = res.data;
    Object.keys(UNDER_CUSTODY).forEach(tag => {
      for (let info of updationInfo) {
        if (info.updated) {
          if (info.walletId === UNDER_CUSTODY[tag].META_SHARE.meta.walletId) {
            UNDER_CUSTODY[tag].LAST_HEALTH_UPDATE = info.updatedAt;
            if (info.dynamicNonPMDD)
              UNDER_CUSTODY[tag].DYNAMIC_NONPMDD = info.dynamicNonPMDD;
          }
        }
      }
    });
    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      UNDER_CUSTODY,
    };
    yield put(insertIntoDB({ DECENTRALIZED_BACKUP: updatedBackup }));
  } else {
    console.log({ err: res.err });
  }
  yield put(switchS3Loader('updateMSharesHealth'));
}

export const updateMSharesHealthWatcher = createWatcher(
  updateMSharesHealthWorker,
  UPDATE_MSHARES_HEALTH,
);

function* checkMSharesHealthWorker() {
  yield put(switchS3Loader('checkMSharesHealth'));
  const s3Service: S3Service = yield select(state => state.sss.service);

  // const preInstance = JSON.stringify(s3Service);
  const res = yield call(s3Service.checkHealth);
  // const postInstance = JSON.stringify(s3Service);
  yield put(calculateOverallHealth(s3Service));

  if (res.status === 200) {
    // if (preInstance !== postInstance) {
    //   const { SERVICES } = yield select(state => state.storage.database);
    //   const updatedSERVICES = {
    //     ...SERVICES,
    //     S3_SERVICE: JSON.stringify(s3Service),
    //   };
    //   yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
    // }
  } else {
    console.log({ err: res.err });
  }

  yield put(switchS3Loader('checkMSharesHealth'));
}

export const checkMSharesHealthWatcher = createWatcher(
  checkMSharesHealthWorker,
  CHECK_MSHARES_HEALTH,
);

function* checkPDFHealthWorker({ payload }) {
  const s3Service: S3Service = yield select(state => state.sss.service);
  const { pdfHealth } = s3Service.sss;
  const { scannedQR, index } = payload;

  if (scannedQR === pdfHealth[index].qrData) {
    let storedPDFHealth = JSON.parse(
      yield call(AsyncStorage.getItem, 'PDF Health'),
    );

    storedPDFHealth = storedPDFHealth ? storedPDFHealth : {};

    let updatedPDFHealth = {
      ...storedPDFHealth,
      [index]: { shareId: pdfHealth[index].shareId, updatedAt: Date.now() },
    };

    if (!updatedPDFHealth[3]) {
      updatedPDFHealth = {
        ...updatedPDFHealth,
        [3]: { shareId: pdfHealth[3].shareId, updatedAt: 0 },
      };
    }
    if (!updatedPDFHealth[4]) {
      updatedPDFHealth = {
        ...updatedPDFHealth,
        [4]: { shareId: pdfHealth[4].shareId, updatedAt: 0 },
      };
    }

    console.log({ updatedPDFHealth });
    yield call(
      AsyncStorage.setItem,
      'PDF Health',
      JSON.stringify(updatedPDFHealth),
    );
    yield put(pdfHealthChecked('pdfHealthChecked'));
  } else {
    console.log({ pdfHealth, payload });
    yield put(QRChecked(true));
    //Alert.alert('Invalid QR!', 'The scanned QR is wrong, please try again.');
  }

  // if (res.status === 200) {
  //   if (preInstance !== postInstance) {
  //     const { SERVICES } = yield select(state => state.storage.database);
  //     const updatedSERVICES = {
  //       ...SERVICES,
  //       S3_SERVICE: JSON.stringify(s3Service),
  //     };

  //     yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  //   }
  // } else {
  //   console.log({ err: res.err });
  // }

  // yield put(switchS3Loader('checkMSharesHealth'));
}

export const checkPDFHealthWatcher = createWatcher(
  checkPDFHealthWorker,
  CHECK_PDF_HEALTH,
);

function* shareHistoryUpdateWorker({ payload }) {
  const { overallHealth } = payload;
  const shareHistory = JSON.parse(
    yield call(AsyncStorage.getItem, 'shareHistory'),
  );

  if (shareHistory) {
    const updatedShareHistory = [...shareHistory];
    for (let index = 0; index < overallHealth.sharesInfo.length; index++) {
      if (
        overallHealth.sharesInfo[index] &&
        overallHealth.sharesInfo[index].updatedAt
      ) {
        if (overallHealth.sharesInfo[index].shareStage !== 'Ugly') {
          updatedShareHistory[index] = {
            ...updatedShareHistory[index],
            accessible: Date.now(),
          };
        } else {
          updatedShareHistory[index] = {
            ...updatedShareHistory[index],
            notAccessible: Date.now(),
          };
        }
      }
    }
    console.log({ updatedShareHistory });
    yield call(
      AsyncStorage.setItem,
      'shareHistory',
      JSON.stringify(updatedShareHistory),
    );
  }

  const securityQuestionHistory = JSON.parse(
    yield call(AsyncStorage.getItem, 'securityQuestionHistory'),
  ); //TODO: use multiGet on async storage

  if (securityQuestionHistory) {
    if (overallHealth.qaStatus.stage === 'Ugly') {
      const updatedSecurityQuestionHistory = {
        ...securityQuestionHistory,
        unconfirmed: Date.now(),
      };

      yield call(
        AsyncStorage.setItem,
        'securityQuestionHistory',
        JSON.stringify(updatedSecurityQuestionHistory),
      );
    }
  }
}

export const shareHistoryUpdateWatcher = createWatcher(
  shareHistoryUpdateWorker,
  UPDATE_SHARE_HISTORY,
);

function* overallHealthWorker({ payload }) {
  const service = payload.s3Service
    ? payload.s3Service
    : yield select(state => state.sss.service);

  const { healthCheckStatus } = service.sss;
  let shareStatus = new Array(5);
  Object.keys(healthCheckStatus).map(key => {
    shareStatus[key] = {
      shareId: healthCheckStatus[key].shareId,
      updatedAt: healthCheckStatus[key].updatedAt,
    };
  });

  const securityTimestamp = yield call(
    AsyncStorage.getItem,
    'SecurityAnsTimestamp',
  );

  let storedPDFHealth = JSON.parse(
    yield call(AsyncStorage.getItem, 'PDF Health'),
  );

  if (!storedPDFHealth) {
    storedPDFHealth = {
      3: { shareId: 'placeHolderID3', updatedAt: 0 },
      4: { shareId: 'placeHolderID4', updatedAt: 0 },
    };
  }
  shareStatus[3] = storedPDFHealth[3];
  shareStatus[4] = storedPDFHealth[4];

  const healthStatus = new HealthStatus();
  const overallHealth = yield call(
    healthStatus.appHealthStatus,
    JSON.parse(securityTimestamp) ? JSON.parse(securityTimestamp) : 0,
    shareStatus,
  );

  if (overallHealth) {
    // overallHealth.overallStatus = parseInt(overallHealth.overallStatus) * 20; // Conversion: stages to percentage
    overallHealth.overallStatus = parseInt(overallHealth.overallStatus); // Conversion: stages to percentage

    yield put(updateShareHistory(overallHealth));

    yield call(
      AsyncStorage.setItem,
      'overallHealth',
      JSON.stringify(overallHealth),
    );
    console.log({ overallHealth });
    yield put(overallHealthCalculated(overallHealth));
  } else {
    throw new Error('Failed to calculate overall health');
  }
}

export const overallHealthWatcher = createWatcher(
  overallHealthWorker,
  OVERALL_HEALTH,
);

function* updateDynamicNonPMDDWorker() {
  yield put(switchS3Loader('updateDynamicNonPMDD'));

  const { DYNAMIC_NONPMDD } = yield select(
    state => state.storage.database.DECENTRALIZED_BACKUP,
  );

  if (!Object.keys(DYNAMIC_NONPMDD).length) return; // Nothing in DNP

  const s3Service: S3Service = yield select(state => state.sss.service);
  const res = yield call(s3Service.updateDynamicNonPMDD, DYNAMIC_NONPMDD);

  if (res.status === 200) {
  } // yield success
  else console.log({ err: res.err }); // yield failure

  yield put(switchS3Loader('updateDynamicNonPMDD'));
}

export const updateDynamicNonPMDDWatcher = createWatcher(
  updateDynamicNonPMDDWorker,
  UPDATE_DYNAMINC_NONPMDD,
);

function* downloadDynamicNonPMDDWorker({ payload }) {
  yield put(switchS3Loader('downloadDynamicNonPMDD'));
  const res = yield call(S3Service.downloadDynamicNonPMDD, payload.walletId);
  if (res.status === 200) {
    // TODO: add functionality as per the requirements
  } else console.log({ err: res.err });
  yield put(switchS3Loader('downloadDynamicNonPMDD'));
}

export const downloadDynamicNonPMDDWatcher = createWatcher(
  downloadDynamicNonPMDDWorker,
  DOWNLOAD_DYNAMIC_NONPMDD,
);

function* restoreDynamicNonPMDDWorker() {
  yield put(switchS3Loader('restoreDynamicNonPMDD'));

  const { DECENTRALIZED_BACKUP } = yield select(
    state => state.storage.database,
  );

  const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;
  const dynamicNonPMDDs: EncDynamicNonPMDD[] = Object.keys(RECOVERY_SHARES).map(
    key => {
      if (RECOVERY_SHARES.ENC_DYNAMIC_NONPMDD)
        return RECOVERY_SHARES[key].ENC_DYNAMIC_NONPMDD;
    },
  );

  if (!dynamicNonPMDDs.length) {
    console.log('DynamicNonPMDD not available');
    return;
  }
  const s3Service: S3Service = yield select(state => state.sss.service);
  const res = yield call(s3Service.restoreDynamicNonPMDD, dynamicNonPMDDs);

  if (res.status === 200) {
    const metaShares: MetaShare[] = res.data.latestDynamicNonPMDD; // sync the DNP structure across redux-saga and nodeAlpha
    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      DYNAMIC_NONPMDD: {
        ...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD,
        META_SHARES: metaShares,
      },
    };
    yield put(insertIntoDB({ DECENTRALIZED_BACKUP: updatedBackup }));
  } else {
    console.log({ err: res.err });
  }
  yield put(switchS3Loader('restoreDynamicNonPMDD'));
}

export const restoreDynamicNonPMDDWatcher = createWatcher(
  restoreDynamicNonPMDDWorker,
  RESTORE_DYNAMIC_NONPMDD,
);

function* recoverMnemonicWorker({ payload }) {
  const { securityAns, metaShares } = payload;
  if (metaShares.length !== 3) return;

  const encryptedSecrets: string[] = metaShares.map(
    metaShare => metaShare.encryptedSecret,
  );

  const res = yield call(
    S3Service.recoverFromSecrets,
    encryptedSecrets,
    securityAns,
  );

  if (res.status === 200) {
    // TODO: recreate accounts and write to database
    yield put(mnemonicRecovered(res.data.mnemonic)); // storing in redux state (for demo)
  } else {
    console.log({ err: res.err });
  }
}

export const recoverMnemonicWatcher = createWatcher(
  recoverMnemonicWorker,
  RECOVER_MNEMONIC,
);

function* restoreShareFromQRWorker({ payload }) {
  const { qrArray } = payload;
  if (qrArray.length !== 8) {
    throw new Error('QR array is not of appropriate length');
  }
  const { DECENTRALIZED_BACKUP } = yield select(
    state => state.storage.database,
  );

  const res = yield call(S3Service.recoverMetaShareFromQR, qrArray);
  if (res.status == 200) {
    const { metaShare } = res.data;
    console.log({ metaShare });
    const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;
    RECOVERY_SHARES[metaShare.meta.index] = {
      META_SHARE: metaShare,
    };

    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      RECOVERY_SHARES,
    };
    console.log({ updatedBackup });
    yield put(insertIntoDB({ DECENTRALIZED_BACKUP: updatedBackup }));
  } else {
    yield put(UnableRecoverShareFromQR(true));
    //Alert.alert('Unable to recover share from QR', res.err);
    console.log({ err: res.err });
  }
}

export const restoreShareFromQRWatcher = createWatcher(
  restoreShareFromQRWorker,
  RESTORE_SHARE_FROM_QR,
);

function* recoverWalletWorker({ payload }) {
  yield put(switchS3Loader('restoreWallet'));

  try {
    const { WALLET_SETUP, DECENTRALIZED_BACKUP } = yield select(
      state => state.storage.database,
    );

    const { security } = WALLET_SETUP;
    const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;

    const metaShares = Array(5);
    Object.keys(RECOVERY_SHARES).forEach(key => {
      const { META_SHARE } = RECOVERY_SHARES[key];
      if (META_SHARE) metaShares[key] = META_SHARE; //mapping metaShares according to their shareIndex so that they can be aptly used at ManageBackup
    });

    if (Object.keys(metaShares).length !== 3) {
      throw new Error(
        `Insufficient number of shares to recover the wallet, ${3 -
          metaShares.length} more required`,
      );
    }

    const encryptedSecrets: string[] = Object.keys(metaShares).map(
      key => metaShares[key].encryptedSecret,
    );

    const res = yield call(
      S3Service.recoverFromSecrets,
      encryptedSecrets,
      security.answer,
    );

    if (res.status === 200) {
      const { mnemonic } = res.data;
      const { regularAcc, testAcc, secureAcc, s3Service } = yield call(
        serviceGenerator,
        security.answer,
        mnemonic,
        metaShares,
      );

      const SERVICES = {
        REGULAR_ACCOUNT: JSON.stringify(regularAcc),
        TEST_ACCOUNT: JSON.stringify(testAcc),
        SECURE_ACCOUNT: JSON.stringify(secureAcc),
        S3_SERVICE: JSON.stringify(s3Service),
      };
      yield put(insertIntoDB({ SERVICES }));

      const current = Date.now();
      AsyncStorage.setItem('SecurityAnsTimestamp', JSON.stringify(current));
      const securityQuestionHistory = {
        confirmed: current,
      };
      AsyncStorage.setItem(
        'securityQuestionHistory',
        JSON.stringify(securityQuestionHistory),
      );
    } else {
      throw new Error(res.err);
    }
  } catch (err) {
    console.log({ err: err.message });
    yield put(walletRecoveryFailed(true));
    // Alert.alert('Wallet recovery failed!', err.message);
  }

  yield put(switchS3Loader('restoreWallet'));
}

export const recoverWalletWatcher = createWatcher(
  recoverWalletWorker,
  RECOVER_WALLET,
);
