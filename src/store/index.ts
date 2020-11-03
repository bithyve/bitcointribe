import { applyMiddleware, createStore, combineReducers } from 'redux';
import { AsyncStorage as storage } from 'react-native';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { call, all, spawn } from 'redux-saga/effects';
import { composeWithDevTools } from 'redux-devtools-extension';

import storageReducer from './reducers/storage';
import setupAndAuthReducer from './reducers/setupAndAuth';
import accountsReducer from './reducers/accounts';
import sssReducer from './reducers/sss';
import healthReducer from './reducers/health';
import fBTCReducers from './reducers/fbtc';
import notificationsReducer from './reducers/notifications';
import trustedContactsReducer from './reducers/trustedContacts';
import { persistStore, persistReducer } from 'redux-persist';
import preferencesReducer from './reducers/preferences';
import loaders from './reducers/loaders';

const config = {
  key: 'root', // key is required
  storage, // storage is now required
  blacklist: ['setupAndAuth', 'loaders'],
};

import {
  initDBWatcher,
  fetchDBWatcher,
  insertDBWatcher,
  servicesEnricherWatcher,
} from './sagas/storage';

import {
  initSetupWatcher,
  initRecoveryWatcher,
  credentialStorageWatcher,
  credentialsAuthWatcher,
  changeAuthCredWatcher,
} from './sagas/setupAndAuth';

import {
  fetchBalanceWatcher,
  fetchTransactionsWatcher,
  transferST1Watcher,
  transferST2Watcher,
  testcoinsWatcher,
  transferST3Watcher,
  accumulativeTxAndBalWatcher,
  accountsSyncWatcher,
  fetchBalanceTxWatcher,
  exchangeRateWatcher,
  alternateTransferST2Watcher,
  generateSecondaryXprivWatcher,
  resetTwoFAWatcher,
  fetchDerivativeAccXpubWatcher,
  fetchDerivativeAccBalanceTxWatcher,
  fetchDerivativeAccAddressWatcher,
  syncDerivativeAccountsWatcher,
  startupSyncWatcher,
  removeTwoFAWatcher,
  setupDonationAccountWatcher,
  updateDonationPreferencesWatcher,
  syncViaXpubAgentWatcher,
} from './sagas/accounts';

import {
  initHCWatcher,
  uploadEncMetaShareWatcher,
  downloadMetaShareWatcher,
  updateMSharesHealthWatcher,
  checkMSharesHealthWatcher,
  overallHealthWatcher,
  uploadRequestedShareWatcher,
  requestShareWatcher,
  updateDynamicNonPMDDWatcher,
  downloadDynamicNonPMDDWatcher,
  recoverMnemonicWatcher,
  recoverWalletWatcher,
  restoreDynamicNonPMDDWatcher,
  generatePersonalCopyWatcher,
  checkPDFHealthWatcher,
  restoreShareFromQRWatcher,
  shareHistoryUpdateWatcher,
  updateWalletImageWatcher,
  fetchWalletImageWatcher,
  sharePersonalCopyWatcher,
} from './sagas/sss';

import {
  accountSyncWatcher,
  getQuoteWatcher,
  executeOrderWatcher,
  getBalancesWatcher,
} from './sagas/fbtc';

import {
  updateFCMTokensWatcher,
  fetchNotificationsWatcher,
} from './sagas/notifications';

import {
  initializedTrustedContactWatcher,
  approveTrustedContactWatcher,
  fetchTrustedChannelWatcher,
  fetchEphemeralChannelWatcher,
  updateEphemeralChannelWatcher,
  updateTrustedChannelWatcher,
  trustedChannelsSetupSyncWatcher,
  removeTrustedContactWatcher,
  syncLastSeensWatcher,
  syncTrustedChannelsWatcher,
  syncLastSeensAndHealthWatcher,
  postRecoveryChannelSyncWatcher,
} from './sagas/trustedContacts';

import {
  initHealthWatcher,
  checkSharesHealthWatcher,
  updateSharesHealthWatcher,
  generateMetaSharesWatcher,
  createAndUploadOnEFChannelWatcher,
  updateHealthLevel2Watcher,
  recoverWalletFromIcloudWatcher,
  downloadShareWatcher,
  recoverWalletHealthWatcher,
  downloadMetaShareHealthWatcher,
  cloudMetaShareHealthWatcher,
  fetchWalletImageHealthWatcher,
  uploadEncMetaShareKeeperWatcher
} from './sagas/health';

import { fromPrivateKey } from 'bip32';
import reducer from './reducers/fbtc';

const rootSaga = function* () {
  const sagas = [
    // database watchers
    initDBWatcher,
    fetchDBWatcher,
    insertDBWatcher,
    servicesEnricherWatcher,

    // wallet setup watcher
    initSetupWatcher,
    initRecoveryWatcher,
    credentialStorageWatcher,
    credentialsAuthWatcher,
    changeAuthCredWatcher,

    // accounts watchers
    fetchBalanceWatcher,
    fetchTransactionsWatcher,
    fetchBalanceTxWatcher,
    transferST1Watcher,
    transferST2Watcher,
    alternateTransferST2Watcher,
    transferST3Watcher,
    testcoinsWatcher,
    accumulativeTxAndBalWatcher,
    accountsSyncWatcher,
    exchangeRateWatcher,
    generateSecondaryXprivWatcher,
    resetTwoFAWatcher,
    removeTwoFAWatcher,
    fetchDerivativeAccXpubWatcher,
    fetchDerivativeAccAddressWatcher,
    fetchDerivativeAccBalanceTxWatcher,
    syncDerivativeAccountsWatcher,
    syncViaXpubAgentWatcher,
    startupSyncWatcher,
    setupDonationAccountWatcher,
    updateDonationPreferencesWatcher,

    // sss watchers
    initHCWatcher,
    uploadEncMetaShareWatcher,
    downloadMetaShareWatcher,
    generatePersonalCopyWatcher,
    sharePersonalCopyWatcher,
    updateMSharesHealthWatcher,
    checkMSharesHealthWatcher,
    checkPDFHealthWatcher,
    overallHealthWatcher,
    uploadRequestedShareWatcher,
    requestShareWatcher,
    updateDynamicNonPMDDWatcher,
    downloadDynamicNonPMDDWatcher,
    restoreDynamicNonPMDDWatcher,
    recoverMnemonicWatcher,
    recoverWalletWatcher,
    restoreShareFromQRWatcher,
    shareHistoryUpdateWatcher,
    updateWalletImageWatcher,
    fetchWalletImageWatcher,

    //fBTC
    accountSyncWatcher,
    getQuoteWatcher,
    executeOrderWatcher,
    getBalancesWatcher,

    // Notifications
    updateFCMTokensWatcher,
    fetchNotificationsWatcher,

    // Trusted Contacts
    initializedTrustedContactWatcher,
    approveTrustedContactWatcher,
    removeTrustedContactWatcher,
    updateEphemeralChannelWatcher,
    fetchEphemeralChannelWatcher,
    updateTrustedChannelWatcher,
    fetchTrustedChannelWatcher,
    trustedChannelsSetupSyncWatcher,
    syncLastSeensWatcher,
    syncLastSeensAndHealthWatcher,
    syncTrustedChannelsWatcher,
    postRecoveryChannelSyncWatcher,
    
    // Health 
    initHealthWatcher,
    checkSharesHealthWatcher,
    updateSharesHealthWatcher,
    generateMetaSharesWatcher,
    createAndUploadOnEFChannelWatcher,
    updateHealthLevel2Watcher,
    recoverWalletFromIcloudWatcher,
    downloadShareWatcher,
    recoverWalletHealthWatcher,
    downloadMetaShareHealthWatcher,
    cloudMetaShareHealthWatcher,
    fetchWalletImageHealthWatcher,
    uploadEncMetaShareKeeperWatcher
  ];

  yield all(
    sagas.map((saga) =>
      spawn(function* () {
        while (true) {
          try {
            yield call(saga);
            break;
          } catch (e) {
            console.log(e);
          }
        }
      }),
    ),
  );
};

const rootReducer = combineReducers({
  storage: storageReducer,
  setupAndAuth: setupAndAuthReducer,
  accounts: accountsReducer,
  sss: sssReducer,
  health: healthReducer,
  fbtc: fBTCReducers,
  notifications: notificationsReducer,
  trustedContacts: trustedContactsReducer,
  preferences: preferencesReducer,
  loaders,
});


export default function makeStore() {
  const sagaMiddleware = createSagaMiddleware();
  const reducers = persistReducer(config, rootReducer);
  const storeMiddleware = composeWithDevTools(applyMiddleware(sagaMiddleware, thunk));

  const store = createStore(
    reducers,
    storeMiddleware
  );

  persistStore(store);
  sagaMiddleware.run(rootSaga);

  return store;
};
