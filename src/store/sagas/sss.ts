import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import {
  INIT_HEALTH_CHECK,
  switchS3Loader,
  healthCheckInitialized
} from "../actions/sss";
import S3Service from "../../bitcoin/services/sss/S3Service";

function* initHCWorker() {
  const initialized = yield select(state => state.sss.hcInit);

  if (initialized) return;

  yield put(switchS3Loader("initHC"));
  const s3Service: S3Service = yield select(
    state => state.storage.services.S3_SERVICE
  );

  const res = yield call(s3Service.initializeHealthcheck);
  res.status === 200
    ? yield put(healthCheckInitialized(res.data.success))
    : yield put(switchS3Loader("initHC"));
}

export const initHCWatcher = createWatcher(initHCWorker, INIT_HEALTH_CHECK);
