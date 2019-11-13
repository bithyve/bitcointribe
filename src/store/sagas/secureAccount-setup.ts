import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import {
    SETUP_SECUREACCOUNT,
    secureAccountSetup,
  } from "../actions/secureAccount-setup";

  import { Services } from "../../common/interfaces/Interfaces";
  function* setupSecureAccountWorker({ payload }) {
    const services: Services = yield select(state => state.storage.services);
    const res = yield call(services[payload.accountType].setupSecureAccount);
    res.status === 200
      ? yield put(secureAccountSetup(res.setupData))
      : null;
  }
  
  export const fetchAddrWatcher = createWatcher(setupSecureAccountWorker, SETUP_SECUREACCOUNT);