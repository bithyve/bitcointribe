import { applyMiddleware, createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import createSagaMiddleware from "redux-saga";
import { fork, all } from "redux-saga/effects";
import { composeWithDevTools } from "redux-devtools-extension";

import {
  initDBWatcher,
  fetchDBWatcher,
  insertDBWatcher
} from "./sagas/storage";
import { initSetupWatcher } from "./sagas/wallet-setup";
import storageReducer from "./reducers/storage";
import accountsReducer from "./reducers/accounts";
import {
  fetchAddrWatcher,
  fetchBalanceWatcher,
  fetchTransactionsWatcher
} from "./sagas/accounts";

const rootSaga = function*() {
  yield all([
    // database watchers
    fork(initDBWatcher),
    fork(fetchDBWatcher),
    fork(insertDBWatcher),

    // wallet setup watchers
    fork(initSetupWatcher),

    // accounts watchers
    fork(fetchAddrWatcher),
    fork(fetchBalanceWatcher),
    fork(fetchTransactionsWatcher)
  ]);
};

const rootReducer = combineReducers({
  storage: storageReducer,
  accounts: accountsReducer
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);
sagaMiddleware.run(rootSaga);

export { store, Provider };
