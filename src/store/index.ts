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
import keeper from './reducers/keeper';


import swanIntegrationReducer from './reducers/SwanIntegration'
import wyreIntegrationReducer from './reducers/WyreIntegration'
import rampIntegrationReducer from './reducers/RampIntegration'
import VersionHistoryReducer from './reducers/versionHistory'


const config = {
  key: 'root', // key is required
  storage, // storage is now required
  blacklist: [ 'setupAndAuth', 'loaders' ],
}

import {
  initDBWatcher,
  fetchDBWatcher,
  insertDBWatcher,
  servicesEnricherWatcher,
} from './sagas/storage'

import {
  initSetupWatcher,
  initRecoveryWatcher,
  credentialStorageWatcher,
  credentialsAuthWatcher,
  changeAuthCredWatcher,
} from './sagas/setupAndAuth'

import {
  fetchTransactionsWatcher,
  transferST1Watcher,
  transferST2Watcher,
  testcoinsWatcher,
  transferST3Watcher,
  accumulativeTxAndBalWatcher,
  fetchBalanceTxWatcher,
  alternateTransferST2Watcher,
  generateSecondaryXprivWatcher,
  resetTwoFAWatcher,
  fetchDerivativeAccXpubWatcher,
  fetchDerivativeAccBalanceTxWatcher,
  validateTwoFAWatcher,
  removeTwoFAWatcher,
  setupDonationAccountWatcher,
  updateDonationPreferencesWatcher,
  addNewAccountShellWatcher,
  syncViaXpubAgentWatcher,
  updateAccountSettingsWatcher,
  reassignTransactionsWatcher,
  mergeAccountShellsWatcher,
  refreshAccountShellWatcher,
  feeAndExchangeRatesWatcher,
  addNewSecondarySubAccountWatcher,
  autoSyncShellsWatcher,
  blindRefreshWatcher
} from './sagas/accounts'

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
} from './sagas/sss'

import {
  accountSyncWatcher,
  getQuoteWatcher,
  executeOrderWatcher,
  getBalancesWatcher,
} from './sagas/fbtc'

import {
  updateFCMTokensWatcher,
  fetchNotificationsWatcher,
} from './sagas/notifications'

import {
  initializedTrustedContactWatcher,
  approveTrustedContactWatcher,
  fetchTrustedChannelWatcher,
  fetchEphemeralChannelWatcher,
  updateEphemeralChannelWatcher,
  updateTrustedChannelWatcher,
  trustedChannelsSetupSyncWatcher,
  removeTrustedContactWatcher,
  syncTrustedChannelsWatcher,
  walletCheckInWatcher,
  postRecoveryChannelSyncWatcher,
} from './sagas/trustedContacts'

import nodeSettingsReducer from './reducers/nodeSettings'
import { connectToBitHyveNodeWatcher, restorePersonalNodeConfigurationWatcher, savePersonalNodeConfigurationWatcher } from './sagas/nodeSettings'

import {
  fetchSwanAuthenticationUrlWatcher,
} from './sagas/SwanIntegration'

import {
  fetchWyreReservationWatcher,
  fetchWyreReceiveAddressWatcher
} from './sagas/WyreIntegration'
import {
  fetchRampReservationWatcher,
  fetchRampReceiveAddressWatcher
} from './sagas/RampIntegration'
import { versionHistoryWatcher } from './sagas/versionHistory'
import walletRescanningReducer from './reducers/wallet-rescanning'

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
  uploadEncMetaShareKeeperWatcher,
  sendApprovalRequestWatcher,
  downloadSMShareWatcher,
  recoverMnemonicHealthWatcher,
  reShareWithSameKeeperWatcher,
  autoShareContactWatcher,
  autoDownloadShareContactWatcher,
  getPDFDataWatcher,
  sharePDFWatcher,
  confirmPDFSharedWatcher,
  downloadPdfShareHealthWatcher,
  updatedKeeperInfoWatcher,
  uploadSMShareWatcher,
  updateWalletImageHealthWatcher,
  emptyShareTransferDetailsForContactChangeWatcher,
  removeUnwantedUnderCustodySharesWatcher
} from './sagas/health';

import {
  fetchKeeperTrustedChannelWatcher
} from './sagas/keeper';

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
    fetchTransactionsWatcher,
    fetchBalanceTxWatcher,
    transferST1Watcher,
    transferST2Watcher,
    alternateTransferST2Watcher,
    transferST3Watcher,
    testcoinsWatcher,
    accumulativeTxAndBalWatcher,
    generateSecondaryXprivWatcher,
    resetTwoFAWatcher,
    validateTwoFAWatcher,
    removeTwoFAWatcher,
    fetchDerivativeAccXpubWatcher,
    fetchDerivativeAccBalanceTxWatcher,
    syncViaXpubAgentWatcher,
    feeAndExchangeRatesWatcher,
    setupDonationAccountWatcher,
    updateDonationPreferencesWatcher,
    refreshAccountShellWatcher,
    addNewAccountShellWatcher,
    addNewSecondarySubAccountWatcher,
    updateAccountSettingsWatcher,
    reassignTransactionsWatcher,
    mergeAccountShellsWatcher,
    autoSyncShellsWatcher,
    blindRefreshWatcher,

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

    // Node Settings
    savePersonalNodeConfigurationWatcher,
    connectToBitHyveNodeWatcher,
    restorePersonalNodeConfigurationWatcher,

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
    walletCheckInWatcher,
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
    updateWalletImageHealthWatcher,
    uploadEncMetaShareKeeperWatcher,
    sendApprovalRequestWatcher,
    recoverMnemonicHealthWatcher,
    downloadSMShareWatcher,
    reShareWithSameKeeperWatcher,
    autoShareContactWatcher,
    autoDownloadShareContactWatcher,
    getPDFDataWatcher,
    sharePDFWatcher,
    confirmPDFSharedWatcher,
    downloadPdfShareHealthWatcher,
    updatedKeeperInfoWatcher,
    uploadSMShareWatcher,
    emptyShareTransferDetailsForContactChangeWatcher,
    removeUnwantedUnderCustodySharesWatcher,
    // Keeper saga
    fetchKeeperTrustedChannelWatcher,

    // Swan Integration
    fetchSwanAuthenticationUrlWatcher,

    // Wyre Integration
    fetchWyreReservationWatcher,
    fetchWyreReceiveAddressWatcher,

    // Ramp Integration
    fetchRampReservationWatcher,
    fetchRampReceiveAddressWatcher,

    //VersionHistory integration
    versionHistoryWatcher,
  ];

  yield all(
    sagas.map( ( saga ) =>
      spawn( function* () {
        while ( true ) {
          try {
            yield call( saga )
            break
          } catch ( e ) {
            console.log( e )
          }
        }
      } )
    )
  )
}

const rootReducer = combineReducers( {
  storage: storageReducer,
  setupAndAuth: setupAndAuthReducer,
  accounts: accountsReducer,
  sss: sssReducer,
  health: healthReducer,
  fbtc: fBTCReducers,
  nodeSettings: nodeSettingsReducer,
  notifications: notificationsReducer,
  trustedContacts: trustedContactsReducer,
  preferences: preferencesReducer,
  loaders,
  keeper,
  swanIntegration: swanIntegrationReducer,
  walletRescanning: walletRescanningReducer,
  wyreIntegration: wyreIntegrationReducer,
  rampIntegration: rampIntegrationReducer,
  versionHistory: VersionHistoryReducer,
});

export default function makeStore() {
  const sagaMiddleware = createSagaMiddleware()
  const reducers = persistReducer( config, rootReducer )
  const storeMiddleware = composeWithDevTools(
    applyMiddleware( sagaMiddleware, thunk )
  )

  const store = createStore( reducers, storeMiddleware )

  persistStore( store )
  sagaMiddleware.run( rootSaga )

  return store
}
