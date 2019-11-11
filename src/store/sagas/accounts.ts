import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import { FETCH_ADDR, addressFetched } from "../actions/accounts";
import { Services } from "../../common/interfaces/Interfaces";

function* fetchAddrWorker({ payload }) {
  const services: Services = yield select(state => state.storage.services);
  const res = yield call(services[payload.accountType].getAddress);
  res.status === 200
    ? yield put(addressFetched(payload.accountType, res.data.address))
    : null;
}

export const fetchAddrWatcher = createWatcher(fetchAddrWorker, FETCH_ADDR);
