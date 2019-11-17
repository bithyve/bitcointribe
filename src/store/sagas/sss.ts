import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import {
  INIT_HEALTH_CHECK,
  switchS3Loader,
  healthCheckInitialized,
  PREPARE_MSHARES,
  UPLOAD_ENC_MSHARES,
  DOWNLOAD_MSHARE,
  UPDATE_MSHARES_HEALTH,
  CHECK_MSHARES_HEALTH
} from "../actions/sss";
import S3Service from "../../bitcoin/services/sss/S3Service";
import { insertIntoDB } from "../actions/storage";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import { SECURE_ACCOUNT } from "../../common/constants/serviceTypes";

function* initHCWorker() {
  const s3Service: S3Service = yield select(state => state.sss.service);
  const initialized = s3Service.sss.healthCheckInitialized;

  if (initialized || !s3Service.sss.metaShares.length) return;

  yield put(switchS3Loader("initHC"));
  const res = yield call(s3Service.initializeHealthcheck);
  if (res.status === 200) {
    yield put(healthCheckInitialized());
    yield put(insertIntoDB({ S3_SERVICE: JSON.stringify(s3Service) }));
  } else {
    yield put(switchS3Loader("initHC"));
  }
}

export const initHCWatcher = createWatcher(initHCWorker, INIT_HEALTH_CHECK);

function* generateMetaSharesWorker() {
  const s3Service: S3Service = yield select(state => state.sss.service);
  const { walletName } = yield select(
    state => state.storage.database.WALLET_SETUP
  );
  // const secureAccount: SecureAccount = yield select(
  //   state => state.accounts[SECURE_ACCOUNT].service
  // );

  // mocking till the availability of secure account
  const secondaryMnemonic =
    "unique issue slogan party van unfair assault warfare then rubber satisfy snack";
  const twoFASecret = "some_secret";
  const bhXpub =
    "tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ";
  const secondaryXpub =
    "tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ";

  const secureAssets = {
    secondaryMnemonic,
    twoFASecret,
    secondaryXpub,
    bhXpub
  };

  if (s3Service.sss.metaShares.length) return;
  const res = yield call(s3Service.createMetaShares, secureAssets, walletName);
  if (res.status === 200) {
    yield put(insertIntoDB({ S3_SERVICE: JSON.stringify(s3Service) }));
  }
}

export const generateMetaSharesWatcher = createWatcher(
  generateMetaSharesWorker,
  PREPARE_MSHARES
);

function* uploadEncMetaShareWorker({ payload }) {
  yield put(switchS3Loader("uploadMetaShare"));

  const s3Service: S3Service = yield select(state => state.sss.service);
  if (!s3Service.sss.metaShares.length) return;

  // const transferAsset =
  //   s3Service.sss.metaShareTransferAssets[payload.shareIndex];
  // if (transferAsset) return; // TODO: 10 min removal strategy

  const res = yield call(s3Service.uploadShare, payload.shareIndex);
  console.log({ otp: res.data.otp, encryptedKey: res.data.encryptedKey });
  if (res.status === 200) {
    yield put(insertIntoDB({ S3_SERVICE: JSON.stringify(s3Service) }));
  }
  yield put(switchS3Loader("uploadMetaShare"));
}

export const uploadEncMetaShareWatcher = createWatcher(
  uploadEncMetaShareWorker,
  UPLOAD_ENC_MSHARES
);

function* downloadMetaShareWorker({ payload }) {
  yield put(switchS3Loader("downloadMetaShare"));

  const { otp, encryptedKey } = payload;
  const { UNDER_CUSTODY } = yield select(state => state.storage.database);

  let existingShares = [];
  if (Object.keys(UNDER_CUSTODY).length) {
    existingShares = Object.keys(UNDER_CUSTODY).map(
      tag => UNDER_CUSTODY[tag].metaShare
    );
  }

  const res = yield call(
    S3Service.downloadAndValidateShare,
    encryptedKey,
    otp,
    existingShares
  );
  if (res.status === 200) {
    const { metaShare, dynamicNonPMDD } = res.data;
    const updatedCustodyAssets = {
      ...UNDER_CUSTODY,
      [metaShare.meta.tag]: {
        metaShare,
        dynamicNonPMDD
      }
    };

    if (JSON.stringify(UNDER_CUSTODY) !== JSON.stringify(updatedCustodyAssets))
      yield put(insertIntoDB({ UNDER_CUSTODY: updatedCustodyAssets }));
  }
  yield put(switchS3Loader("downloadMetaShare"));
}

export const downloadMetaShareWatcher = createWatcher(
  downloadMetaShareWorker,
  DOWNLOAD_MSHARE
);

function* updateMSharesHealthWorker() {
  // set a timelapse for auto update and enable instantaneous manual update
  yield put(switchS3Loader("updateMSharesHealth"));

  const { UNDER_CUSTODY } = yield select(state => state.storage.database);
  const metaShares = Object.keys(UNDER_CUSTODY).map(
    tag => UNDER_CUSTODY[tag].metaShare
  );

  const res = yield call(S3Service.updateHealth, metaShares);
  if (res.status === 200) {
    const { updationInfo } = res.data;
    Object.keys(UNDER_CUSTODY).forEach(tag => {
      for (let info of updationInfo) {
        if (info.updated) {
          if (info.walletId === UNDER_CUSTODY[tag].metaShare.meta.walletId) {
            UNDER_CUSTODY[tag].lastHealthUpdate = info.updatedAt;
          }
        }
      }
    });
    yield put(insertIntoDB({ UNDER_CUSTODY }));
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

  const res = yield call(s3Service.checkHealth);
  if (res.status === 200) {
  }

  yield put(switchS3Loader("checkMSharesHealth"));
}

export const checkMSharesHealthWatcher = createWatcher(
  checkMSharesHealthWorker,
  CHECK_MSHARES_HEALTH
);
