import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import {
  INIT_HEALTH_CHECK,
  switchS3Loader,
  healthCheckInitialized,
  PREPARE_MSHARES
} from "../actions/sss";
import S3Service from "../../bitcoin/services/sss/S3Service";
import { insertIntoDB } from "../actions/storage";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import { SECURE_ACCOUNT } from "../../common/constants/serviceTypes";
import {
  ISocialStaticNonPMDD,
  IBuddyStaticNonPMDD
} from "../../bitcoin/utilities/Interface";

const prepareStaticNonPMDD = s3Service => {
  // mocking till the availability of secure account
  const secondaryMnemonic =
    "unique issue slogan party van unfair assault warfare then rubber satisfy snack";
  const twoFASecret = "some_secret";
  const dummyBHXpub =
    "tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ";
  const dummySecoundryXpub =
    "tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ";

  const socialStaticNonPMDD: ISocialStaticNonPMDD = {
    secondaryXpub: dummySecoundryXpub,
    bhXpub: dummyBHXpub
  };
  const buddyStaticNonPMDD: IBuddyStaticNonPMDD = {
    secondaryMnemonic,
    twoFASecret,
    secondaryXpub: dummySecoundryXpub,
    bhXpub: dummyBHXpub
  };

  const encryptedSocialStaticNonPMDD = s3Service.encryptStaticNonPMDD(
    socialStaticNonPMDD
  );
  const encryptedBuddyStaticNonPMDD = s3Service.encryptStaticNonPMDD(
    buddyStaticNonPMDD
  );

  return {
    encryptedSocialStaticNonPMDD,
    encryptedBuddyStaticNonPMDD
  };
};

const generateMetaShares = (
  s3Service,
  encryptedSocialStaticNonPMDD,
  encryptedBuddyStaticNonPMDD
) => {
  let index = 0;
  const metaShares = [];
  const tag = "Random";
  for (const encryptedShare of s3Service.sss.encryptedShares) {
    let res;
    if (index !== 2) {
      res = s3Service.createMetaShare(
        index + 1,
        encryptedShare,
        encryptedSocialStaticNonPMDD,
        tag
      );
    } else {
      res = s3Service.createMetaShare(
        index + 1,
        encryptedShare,
        encryptedBuddyStaticNonPMDD,
        tag
      );
    }
    const { metaShare } = res.data;
    metaShares.push(metaShare);
  }
  if (metaShares.length !== 5) {
    throw new Error("Something went wrong while generating metaShares");
  }
  return { metaShares };
};

function* initHCWorker() {
  const s3Service: S3Service = yield select(state => state.sss.service);
  const initialized = s3Service.sss.healthCheckInitialized;
  if (initialized) {
    return;
  }

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

function* prepareMShareWorker() {
  const s3Service: S3Service = yield select(state => state.sss.service);
  // const secureAccount: SecureAccount = yield select(
  //   state => state.accounts[SECURE_ACCOUNT].service
  // );

  const {
    encryptedSocialStaticNonPMDD,
    encryptedBuddyStaticNonPMDD
  } = yield call(prepareStaticNonPMDD, s3Service);

  const { metaShares } = yield call(
    generateMetaShares,
    s3Service,
    encryptedSocialStaticNonPMDD,
    encryptedBuddyStaticNonPMDD
  );

  console.log({ metaShares });
  // if (res.status === 200) {
  //   yield put(healthCheckInitialized());
  //   yield put(insertIntoDB({ S3_SERVICE: JSON.stringify(s3Service) }));
  // }
}

export const prepareMShareWatcher = createWatcher(
  prepareMShareWorker,
  PREPARE_MSHARES
);
