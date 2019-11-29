import { call, put, select } from "redux-saga/effects";
import { createWatcher, serviceGenerator } from "../utils/utilities";
import {
  INIT_HEALTH_CHECK,
  switchS3Loader,
  healthCheckInitialized,
  PREPARE_MSHARES,
  UPLOAD_ENC_MSHARES,
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
  GENERATE_PDF
} from "../actions/sss";
import S3Service from "../../bitcoin/services/sss/S3Service";
import { insertIntoDB } from "../actions/storage";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import { SECURE_ACCOUNT } from "../../common/constants/serviceTypes";
import {
  EncDynamicNonPMDD,
  MetaShare
} from "../../bitcoin/utilities/Interface";
import generatePDF from "../utils/generatePDF";

function* generateMetaSharesWorker() {
  const s3Service: S3Service = yield select(state => state.sss.service);
  const { walletName } = yield select(
    state => state.storage.database.WALLET_SETUP
  );
  const secureAccount: SecureAccount = yield select(
    state => state.accounts[SECURE_ACCOUNT].service
  );

  const secondaryMnemonic = secureAccount.secureHDWallet.secondaryMnemonic;
  const twoFASecret = secureAccount.secureHDWallet.twoFASetup.secret;
  const { secondary, bh } = secureAccount.secureHDWallet.xpubs;

  const secureAssets = {
    secondaryMnemonic,
    twoFASecret,
    secondaryXpub: secondary,
    bhXpub: bh
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
  PREPARE_MSHARES
);

function* initHCWorker() {
  yield put(switchS3Loader("initHC"));
  let s3Service: S3Service = yield select(state => state.sss.service);
  const initialized = s3Service.sss.healthCheckInitialized;
  if (initialized) {
    yield put(switchS3Loader("initHC"));
    return;
  }
  if (!s3Service.sss.metaShares.length) {
    s3Service = yield call(generateMetaSharesWorker);
  }

  const res = yield call(s3Service.initializeHealthcheck);
  if (res.status === 200) {
    yield put(healthCheckInitialized());
    const { SERVICES } = yield select(state => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      S3_SERVICE: JSON.stringify(s3Service)
    };
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    console.log({ err: res.err });
    yield put(switchS3Loader("initHC"));
  }
}

export const initHCWatcher = createWatcher(initHCWorker, INIT_HEALTH_CHECK);

function* uploadEncMetaShareWorker({ payload }) {
  // Transfer: User >>> Guardian
  const s3Service: S3Service = yield select(state => state.sss.service);
  if (!s3Service.sss.metaShares.length) return;

  const { DECENTRALIZED_BACKUP } = yield select(
    state => state.storage.database
  );
  const { shareId } = s3Service.sss.metaShares[payload.shareIndex];

  // preventing re-uploads till expiry
  if (DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[shareId]) {
    console.log(DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[shareId]);
    return;
  }

  // TODO: 10 min removal strategy
  yield put(switchS3Loader("uploadMetaShare"));

  const res = yield call(s3Service.uploadShare, payload.shareIndex);
  console.log({ otp: res.data.otp, encryptedKey: res.data.encryptedKey });
  if (res.status === 200) {
    const { otp, encryptedKey } = res.data;

    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      SHARES_TRANSFER_DETAILS: {
        ...DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
        [shareId]: { OTP: otp, ENCRYPTED_KEY: encryptedKey }
      }
    };
    yield put(insertIntoDB({ DECENTRALIZED_BACKUP: updatedBackup }));
  } else {
    console.log({ err: res.err });
  }
  yield put(switchS3Loader("uploadMetaShare"));
}

export const uploadEncMetaShareWatcher = createWatcher(
  uploadEncMetaShareWorker,
  UPLOAD_ENC_MSHARES
);

function* requestShareWorker() {
  const { WALLET_SETUP, DECENTRALIZED_BACKUP } = yield select(
    state => state.storage.database
  );

  if (DECENTRALIZED_BACKUP.RECOVERY_SHARES.length >= 3) {
    console.log(DECENTRALIZED_BACKUP.RECOVERY_SHARES);
    return;
  } // capping to 3 shares reception

  const { walletName } = WALLET_SETUP;
  const { otp, encryptedKey } = yield call(S3Service.generateRequestCreds);

  const updatedBackup = {
    ...DECENTRALIZED_BACKUP,
    RECOVERY_SHARES: [
      ...DECENTRALIZED_BACKUP.RECOVERY_SHARES,
      { REQUEST_DETAILS: { tag: walletName, otp, encryptedKey } }
    ]
  };

  yield put(insertIntoDB({ DECENTRALIZED_BACKUP: updatedBackup }));
}

export const requestShareWatcher = createWatcher(
  requestShareWorker,
  REQUEST_SHARE
);

function* uploadRequestedShareWorker({ payload }) {
  // Transfer: Guardian >>> User
  const { tag, encryptedKey, otp } = payload;
  const { UNDER_CUSTODY } = yield select(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );
  const { META_SHARE, ENC_DYNAMIC_NONPMDD } = UNDER_CUSTODY[tag];

  // TODO: 10 min removal strategy
  yield put(switchS3Loader("uploadRequestedShare"));

  const res = yield call(
    S3Service.uploadRequestedShare,
    encryptedKey,
    otp,
    META_SHARE,
    ENC_DYNAMIC_NONPMDD
  );

  if (res.status === 200 && res.data.success === true) {
    // yield success
    console.log("Upload successful!");
  } else {
    console.log({ res });
  }
  yield put(switchS3Loader("uploadRequestedShare"));
}

export const uploadRequestedShareWatcher = createWatcher(
  uploadRequestedShareWorker,
  UPLOAD_REQUESTED_SHARE
);

function* downloadMetaShareWorker({ payload }) {
  yield put(switchS3Loader("downloadMetaShare"));

  const { otp, encryptedKey } = payload;
  const { DECENTRALIZED_BACKUP } = yield select(
    state => state.storage.database
  );

  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP;

  let res;
  if (payload.downloadType !== "recovery") {
    let existingShares = [];
    if (Object.keys(UNDER_CUSTODY).length) {
      existingShares = Object.keys(UNDER_CUSTODY).map(
        tag => UNDER_CUSTODY[tag].META_SHARE
      );
    }

    res = yield call(
      S3Service.downloadAndValidateShare,
      encryptedKey,
      otp
      // existingShares
    );
  } else {
    res = yield call(S3Service.downloadAndValidateShare, encryptedKey, otp);
  }

  if (res.status === 200) {
    const { metaShare, dynamicNonPMDD } = res.data;
    let updatedBackup;
    if (payload.downloadType !== "recovery") {
      updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        UNDER_CUSTODY: {
          ...DECENTRALIZED_BACKUP.UNDER_CUSTODY,
          [metaShare.meta.tag]: {
            META_SHARE: metaShare,
            ENC_DYNAMIC_NONPMDD: dynamicNonPMDD
          }
        },
        DYNAMIC_NONPMDD: {
          ...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD,
          META_SHARES: DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD.META_SHARES
            ? [...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD.META_SHARES, metaShare]
            : [metaShare]
        }
      };
    } else {
      const updatedRecoveryShares = DECENTRALIZED_BACKUP.RECOVERY_SHARES.map(
        recoveryShare => {
          if (recoveryShare.REQUEST_DETAILS.otp === otp) {
            return {
              REQUEST_DETAILS: recoveryShare.REQUEST_DETAILS,
              META_SHARE: metaShare,
              ENC_DYNAMIC_NONPMDD: dynamicNonPMDD
            };
          }
          return recoveryShare;
        }
      );

      updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        RECOVERY_SHARES: updatedRecoveryShares
      };
    }

    yield put(insertIntoDB({ DECENTRALIZED_BACKUP: updatedBackup }));
  } else {
    console.log({ err: res.err });
  }
  yield put(switchS3Loader("downloadMetaShare"));
}

export const downloadMetaShareWatcher = createWatcher(
  downloadMetaShareWorker,
  DOWNLOAD_MSHARE
);

function* generatePDFWorker({ payload }) {
  yield put(switchS3Loader("generatePDF"));
  const s3Service: S3Service = yield select(state => state.sss.service);
  const res = yield call(s3Service.createQR, payload.shareIndex - 1);
  if (res.status !== 200) {
    console.log({ err: res.err });
    return;
  }

  const secureAccount: SecureAccount = yield select(
    state => state.accounts[SECURE_ACCOUNT].service
  );
  const secondaryMnemonic = secureAccount.secureHDWallet.secondaryMnemonic;
  const { qrData, secret } = secureAccount.secureHDWallet.twoFASetup;
  const { secondary, bh } = secureAccount.secureHDWallet.xpubs;

  const secureAssets = {
    secondaryMnemonic,
    twoFASecret: secret,
    twoFAQR: qrData,
    secondaryXpub: secondary,
    bhXpub: bh
  };

  const pdfData = {
    qrData: res.data.qrData,
    ...secureAssets
  };

  const { securityAns } = yield select(
    state => state.storage.database.WALLET_SETUP
  );

  try {
    const generatedPDFPath = yield call(
      generatePDF,
      pdfData,
      `HexaShare${payload.shareIndex}`,
      `Hexa Share ${payload.shareIndex}`,
      securityAns
    );
    console.log({ generatedPDFPath });
  } catch (err) {
    console.log({ err });
  }

  yield put(switchS3Loader("generatePDF"));
}

export const generatePDFWatcher = createWatcher(
  generatePDFWorker,
  GENERATE_PDF
);

function* updateMSharesHealthWorker() {
  // set a timelapse for auto update and enable instantaneous manual update
  yield put(switchS3Loader("updateMSharesHealth"));

  const { DECENTRALIZED_BACKUP } = yield select(
    state => state.storage.database
  );
  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP;
  const metaShares = Object.keys(UNDER_CUSTODY).map(
    tag => UNDER_CUSTODY[tag].META_SHARE
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
      UNDER_CUSTODY
    };
    yield put(insertIntoDB({ DECENTRALIZED_BACKUP: updatedBackup }));
  } else {
    console.log({ err: res.err });
  }
  yield put(switchS3Loader("updateMSharesHealth"));
}

export const updateMSharesHealthWatcher = createWatcher(
  updateMSharesHealthWorker,
  UPDATE_MSHARES_HEALTH
);

function* checkMSharesHealthWorker() {
  yield put(switchS3Loader("checkMSharesHealth"));
  const s3Service: S3Service = yield select(state => state.sss.service);

  const preInstance = JSON.stringify(s3Service);
  const res = yield call(s3Service.checkHealth);
  const postInstance = JSON.stringify(s3Service);

  if (res.status === 200) {
    if (preInstance !== postInstance) {
      const { SERVICES } = yield select(state => state.storage.database);
      const updatedSERVICES = {
        ...SERVICES,
        S3_SERVICE: JSON.stringify(s3Service)
      };
      yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
    }
  } else {
    console.log({ err: res.err });
  }

  yield put(switchS3Loader("checkMSharesHealth"));
}

export const checkMSharesHealthWatcher = createWatcher(
  checkMSharesHealthWorker,
  CHECK_MSHARES_HEALTH
);

function* updateDynamicNonPMDDWorker() {
  yield put(switchS3Loader("updateDynamicNonPMDD"));

  const { DYNAMIC_NONPMDD } = yield select(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );

  if (!Object.keys(DYNAMIC_NONPMDD).length) return; // Nothing in DNP

  const s3Service: S3Service = yield select(state => state.sss.service);
  const res = yield call(s3Service.updateDynamicNonPMDD, DYNAMIC_NONPMDD);

  if (res.status === 200) {
  } // yield success
  else console.log({ err: res.err }); // yield failure

  yield put(switchS3Loader("updateDynamicNonPMDD"));
}

export const updateDynamicNonPMDDWatcher = createWatcher(
  updateDynamicNonPMDDWorker,
  UPDATE_DYNAMINC_NONPMDD
);

function* downloadDynamicNonPMDDWorker({ payload }) {
  yield put(switchS3Loader("downloadDynamicNonPMDD"));
  const res = yield call(S3Service.downloadDynamicNonPMDD, payload.walletId);
  if (res.status === 200) {
    // TODO: add functionality as per the requirements
  } else console.log({ err: res.err });
  yield put(switchS3Loader("downloadDynamicNonPMDD"));
}

export const downloadDynamicNonPMDDWatcher = createWatcher(
  downloadDynamicNonPMDDWorker,
  DOWNLOAD_DYNAMIC_NONPMDD
);

function* restoreDynamicNonPMDDWorker() {
  yield put(switchS3Loader("restoreDynamicNonPMDD"));

  const { DECENTRALIZED_BACKUP } = yield select(
    state => state.storage.database
  );

  const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;
  const dyanmicNonPMDDs: EncDynamicNonPMDD[] = RECOVERY_SHARES.map(
    ({ ENC_DYNAMIC_NONPMDD }) => ENC_DYNAMIC_NONPMDD
  );

  if (!dyanmicNonPMDDs.length) {
    console.log("DynamicNonPMDD not available");
    return;
  }
  const s3Service: S3Service = yield select(state => state.sss.service);
  const res = yield call(s3Service.restoreDynamicNonPMDD, dyanmicNonPMDDs);

  if (res.status === 200) {
    const metaShares: MetaShare[] = res.data.latestDynamicNonPMDD; // sync the DNP structure across redux-saga and nodeAlpha
    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      DYNAMIC_NONPMDD: {
        ...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD,
        META_SHARES: metaShares
      }
    };
    yield put(insertIntoDB({ DECENTRALIZED_BACKUP: updatedBackup }));
  } else {
    console.log({ err: res.err });
  }
  yield put(switchS3Loader("restoreDynamicNonPMDD"));
}

export const restoreDynamicNonPMDDWatcher = createWatcher(
  restoreDynamicNonPMDDWorker,
  RESTORE_DYNAMIC_NONPMDD
);

function* recoverMnemonicWorker({ payload }) {
  const { securityAns, metaShares } = payload;
  if (metaShares.length !== 3) return;

  const encryptedSecrets: string[] = metaShares.map(
    metaShare => metaShare.encryptedSecret
  );

  const res = yield call(
    S3Service.recoverFromSecrets,
    encryptedSecrets,
    securityAns
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
  RECOVER_MNEMONIC
);

function* recoverWalletWorker({ payload }) {
  yield put(switchS3Loader("restoreWallet"));

  const { WALLET_SETUP, DECENTRALIZED_BACKUP } = yield select(
    state => state.storage.database
  );

  const { securityAns } = WALLET_SETUP;
  const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;

  const metaShares = [];
  RECOVERY_SHARES.forEach(({ META_SHARE }) => {
    if (META_SHARE) metaShares.push(META_SHARE);
  });
  if (metaShares.length !== 3) {
    console.log(
      `Insufficient number of shares to recover the wallet, ${3 -
        metaShares.length} more required`
    );
    return;
  }

  const encryptedSecrets: string[] = metaShares.map(
    metaShare => metaShare.encryptedSecret
  );

  const res = yield call(
    S3Service.recoverFromSecrets,
    encryptedSecrets,
    securityAns
  );

  if (res.status === 200) {
    const { mnemonic } = res.data;
    const { regularAcc, testAcc, secureAcc, s3Service } = yield call(
      serviceGenerator,
      securityAns,
      mnemonic
    );

    const SERVICES = {
      REGULAR_ACCOUNT: JSON.stringify(regularAcc),
      TEST_ACCOUNT: JSON.stringify(testAcc),
      SECURE_ACCOUNT: JSON.stringify(secureAcc),
      S3_SERVICE: JSON.stringify(s3Service)
    };
    yield put(insertIntoDB({ SERVICES }));
  } else {
    console.log({ err: res.err });
  }
  yield put(switchS3Loader("restoreWallet"));
}

export const recoverWalletWatcher = createWatcher(
  recoverWalletWorker,
  RECOVER_WALLET
);
