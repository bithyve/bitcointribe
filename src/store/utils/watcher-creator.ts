import { take, fork } from "redux-saga/effects";

export const createWatcher = (worker, type) => {
  return function*() {
    while (true) {
      const action = yield take(type);
      yield fork(worker, action);
    }
  };
};
