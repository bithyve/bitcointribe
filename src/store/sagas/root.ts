import { fork, all } from "redux-saga/effects";
import { initDBWatcher, fetchDBWatcher, insertDBWatcher } from "./storage";

export const rootSaga = function*() {
  yield all([
    // database watchers
    fork(initDBWatcher),
    fork(fetchDBWatcher),
    fork(insertDBWatcher)
  ]);
};
