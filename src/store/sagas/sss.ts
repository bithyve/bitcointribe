import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import {
  INIT_HEALTH_CHECK,
  switchS3Loader,
  healthCheckInitialized
} from "../actions/sss";
import S3Service from "../../bitcoin/services/sss/S3Service";
import { S3_SERVICE } from "../../common/constants/serviceTypes";

function* initHCWorker() {
  const s3Service: S3Service = yield select(
    state => state.storage.services[S3_SERVICE]
  );
  const initialized = s3Service.sss.healthCheckInitialized;
  if (initialized) {
    return;
  }

  yield put(switchS3Loader("initHC"));
  const res = yield call(s3Service.initializeHealthcheck);
  console.log({ res });
  res.status === 200
    ? yield put(healthCheckInitialized())
    : yield put(switchS3Loader("initHC"));
}

export const initHCWatcher = createWatcher(initHCWorker, INIT_HEALTH_CHECK);
