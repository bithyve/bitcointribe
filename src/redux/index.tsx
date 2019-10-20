import { applyMiddleware, createStore, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { all, fork } from 'redux-saga/effects';

// Import from ReduxDucks.

import {
  setupAccounts,
  createRegularAccount,
  createSecureAccount,
  createSSS,
  walletReducer,
  watcherSetupAccounts,
  watcherRegularAccount,
  watcherSecureAccount,
  watcherSSS,
} from './wallet';

const reducers = combineReducers({ walletReducer });

const rootSaga = function*() {
  yield all([
    fork(watcherSetupAccounts),
    fork(watcherRegularAccount),
    fork(watcherSecureAccount),
    fork(watcherSSS),
  ]);
};

const middleWare = [];

// Setup Redux-Saga
const sagaMiddleware = createSagaMiddleware();
middleWare.push(sagaMiddleware);

const store = createStore(
  reducers,
  {},
  composeWithDevTools(applyMiddleware(...middleWare)),
);

// Initiate root saga.
sagaMiddleware.run(rootSaga);

export {
  store,
  setupAccounts,
  createRegularAccount,
  createSecureAccount,
  createSSS,
};
