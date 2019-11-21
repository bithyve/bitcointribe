import { applyMiddleware, createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import createSagaMiddleware from "redux-saga";
import { call, all, spawn } from "redux-saga/effects";
import { composeWithDevTools } from "redux-devtools-extension";

import storageReducer from "./reducers/storage";
import walletSetupReducer from "./reducers/wallet-setup";
import accountsReducer from "./reducers/accounts";
import sssReducer from "./reducers/sss";
import secureAccountReducer from "./reducers/secureAccount";
import {
  initDBWatcher,
  fetchDBWatcher,
  insertDBWatcher,
  servicesEnricherWatcher
} from "./sagas/storage";
import {
  initSetupWatcher,
  credentialStorageWatcher,
  credentialsAuthWatcher
} from "./sagas/wallet-setup";
import {
  fetchAddrWatcher,
  fetchBalanceWatcher,
  fetchTransactionsWatcher,
  transferST1Watcher,
  transferST2Watcher,
  testcoinsWatcher
} from "./sagas/accounts";
import {
  setupSecureAccountWatcher, 
  checkHealthtWatcher,
  isActiveWatcher,
  secureFetchAddrWatcher,
  secureFetchBalanceWatcher,
  secureFetchTransactionsWatcher,
  secureTransferST1Watcher,
  secureTransferST2Watcher,
  secureTransferST3Watcher}from "./sagas/secureAccount";
import {
  initHCWatcher,
  generateMetaSharesWatcher,
  uploadEncMetaShareWatcher,
  downloadMetaShareWatcher,
  updateMSharesHealthWatcher,
  checkMSharesHealthWatcher,
  uploadRequestedShareWatcher,
  requestShareWatcher,
  recoverMnemonicWatcer
} from "./sagas/sss";

// const rootSaga = function*() {
//   yield all([
//     // database watchers
//     fork(initDBWatcher),
//     fork(fetchDBWatcher),
//     fork(insertDBWatcher),

//     // wallet setup watchers
//     fork(initSetupWatcher),

//     // accounts watchers
//     fork(fetchAddrWatcher),
//     fork(fetchBalanceWatcher),
//     fork(fetchTransactionsWatcher)
//   ]);
// };

const rootSaga = function*() {
  const sagas = [
    // database watchers
    initDBWatcher,
    fetchDBWatcher,
    insertDBWatcher,
    servicesEnricherWatcher,

    // wallet setup watcher
    initSetupWatcher,
    credentialStorageWatcher,
    credentialsAuthWatcher,

    // accounts watchers
    fetchAddrWatcher,
    fetchBalanceWatcher,
    fetchTransactionsWatcher,
    transferST1Watcher,
    transferST2Watcher,
    testcoinsWatcher,

    // sss watchers
    initHCWatcher,
    generateMetaSharesWatcher,
    uploadEncMetaShareWatcher,
    downloadMetaShareWatcher,
    updateMSharesHealthWatcher,
    checkMSharesHealthWatcher,
    uploadRequestedShareWatcher,
    requestShareWatcher,
    recoverMnemonicWatcer,
    secureTransferST1Watcher,
    secureTransferST2Watcher,
    secureTransferST3Watcher,
    //secure account watcher
    setupSecureAccountWatcher,
    checkHealthtWatcher,
    isActiveWatcher,
    secureFetchAddrWatcher,
    secureFetchBalanceWatcher,
    secureFetchTransactionsWatcher
  ];

  yield all(
    sagas.map(saga =>
      spawn(function*() {
        while (true) {
          try {
            yield call(saga);
            break;
          } catch (e) {
            console.log(e);
          }
        }
      })
    )
  );
};

const rootReducer = combineReducers({
  storage: storageReducer,
  walletSetup: walletSetupReducer,
  accounts: accountsReducer,
  secureAccount: secureAccountReducer,
  sss: sssReducer
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);
sagaMiddleware.run(rootSaga);

export { store, Provider };
