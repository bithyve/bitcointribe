import { applyMiddleware, createStore, combineReducers } from 'redux'
import { AsyncStorage as storage } from 'react-native'
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import { call, all, spawn } from 'redux-saga/effects'
import { composeWithDevTools } from 'redux-devtools-extension'

import storageReducer from './reducers/storage'
import setupAndAuthReducer from './reducers/setupAndAuth'
import accountsReducer from './reducers/accounts'
import sssReducer from './reducers/sss'
import healthReducer from './reducers/health'
import fBTCReducers from './reducers/fbtc'
import notificationsReducer from './reducers/notifications'
import sendingReducer from './reducers/sending'
import trustedContactsReducer from './reducers/trustedContacts'
import { persistStore, persistReducer } from 'redux-persist'
import preferencesReducer from './reducers/preferences'
import keeper from './reducers/keeper'
import swanIntegrationReducer from './reducers/SwanIntegration'
import wyreIntegrationReducer from './reducers/WyreIntegration'
import rampIntegrationReducer from './reducers/RampIntegration'
import VersionHistoryReducer from './reducers/versionHistory'
import cloudReducer from './reducers/cloud'
import upgradeToNewBhr from './reducers/upgradeToNewBhr'


const config = {
  key: 'root', // key is required
  storage, // storage is now required
  blacklist: [ 'setupAndAuth', 'loaders' ],
}

import {
  initDBWatcher,
  initServicesWatcher,
  fetchDBWatcher,
  insertDBWatcher,
  servicesEnricherWatcher,
} from './sagas/storage'

import {
  setupWalletWatcher,
  initRecoveryWatcher,
  credentialStorageWatcher,
  credentialsAuthWatcher,
  changeAuthCredWatcher,
} from './sagas/setupAndAuth'

import {
  testcoinsWatcher,
  accumulativeTxAndBalWatcher,
  fetchBalanceTxWatcher,
  generateSecondaryXprivWatcher,
  resetTwoFAWatcher,
  fetchDerivativeAccBalanceTxWatcher,
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
  blindRefreshWatcher,
  getAllAccountsDataWatcher,
  fetchReceiveAddressWatcher,
  validateTwoFAWatcher,
  createSmNResetTFAOrXPrivWatcher
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
  multiUpdateTrustedChannelsWatcher,
  sendVersionUpdateNotificationWatcher
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
  removeUnwantedUnderCustodySharesWatcher,
  uploadSecondaryShareForPKWatcher,
  generateSMMetaSharesWatcher,
  uploadSMShareKeeperWatcher,
  uploadRequestedSMShareWatcher,
  deletePrivateDataWatcher,
  updateKeeperInfoToTrustedChannelWatcher,
  updateKeeperInfoToUnderCustodyWatcher,
  autoShareLevel2KeepersWatcher,
  downloadSmShareForApprovalWatcher,
  setLevelToNotSetupStatusWatcher,
} from './sagas/health'

import {
  fetchKeeperTrustedChannelWatcher,
  updateNewFCMWatcher
} from './sagas/keeper'

import {
  cloudWatcher,
  updateHealthForCloudStatusWatcher,
  updateHealthForCloudWatcher,
  getCloudBackupRecoveryWatcher,
  checkCloudBackupWatcher,
  GoogleDriveLoginWatcher,
  updateDataWatcher,
  createFileWatcher,
  checkFileIsAvailableWatcher,
  readFileWatcher,
  uplaodFileWatcher,
} from './sagas/cloud'

import { initLevelsWatcher, setCloudDataForLevelWatcher, autoShareSecondaryWatcher, autoShareContactKeeperWatcher } from './sagas/upgradeToNewBhr'

import { fromPrivateKey } from 'bip32'
import reducer from './reducers/fbtc'

import { calculateCustomFeeWatcher, calculateSendMaxFeeWatcher, executeAlternateSendStage2Watcher, executeSendStage1Watcher, executeSendStage2Watcher, executeSendStage3Watcher, sendDonationNoteWatcher, sendTxNotificationWatcher } from './sagas/sending'
const rootSaga = function* () {
  const sagas = [
    // database watchers
    initDBWatcher,
    fetchDBWatcher,
    insertDBWatcher,
    servicesEnricherWatcher,

    // wallet setup watcher
    initServicesWatcher,
    setupWalletWatcher,
    initRecoveryWatcher,
    credentialStorageWatcher,
    credentialsAuthWatcher,
    changeAuthCredWatcher,

    // accounts watchers
    fetchBalanceTxWatcher,
    testcoinsWatcher,
    accumulativeTxAndBalWatcher,
    generateSecondaryXprivWatcher,
    resetTwoFAWatcher,
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
    getAllAccountsDataWatcher,
    fetchReceiveAddressWatcher,
    validateTwoFAWatcher,
    createSmNResetTFAOrXPrivWatcher,

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
    sendVersionUpdateNotificationWatcher,
    multiUpdateTrustedChannelsWatcher,

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
    uploadSecondaryShareForPKWatcher,
    generateSMMetaSharesWatcher,
    uploadSMShareKeeperWatcher,
    uploadRequestedSMShareWatcher,
    deletePrivateDataWatcher,
    updateKeeperInfoToTrustedChannelWatcher,
    updateKeeperInfoToUnderCustodyWatcher,
    autoShareLevel2KeepersWatcher,
    downloadSmShareForApprovalWatcher,
    setLevelToNotSetupStatusWatcher,
    // Keeper saga
    fetchKeeperTrustedChannelWatcher,
    updateNewFCMWatcher,

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

    //cloud Integration
    cloudWatcher,
    updateHealthForCloudStatusWatcher,
    updateHealthForCloudWatcher,
    getCloudBackupRecoveryWatcher,
    checkCloudBackupWatcher,
    GoogleDriveLoginWatcher,
    updateDataWatcher,
    createFileWatcher,
    checkFileIsAvailableWatcher,
    readFileWatcher,
    uplaodFileWatcher,
    // Sending
    executeSendStage1Watcher,
    executeSendStage2Watcher,
    executeAlternateSendStage2Watcher,
    executeSendStage3Watcher,
    calculateSendMaxFeeWatcher,
    calculateCustomFeeWatcher,
    sendTxNotificationWatcher,
    sendDonationNoteWatcher,
    // upgrade
    initLevelsWatcher,
    setCloudDataForLevelWatcher,
    autoShareSecondaryWatcher,
    autoShareContactKeeperWatcher
  ]

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
  sending: sendingReducer,
  trustedContacts: trustedContactsReducer,
  preferences: preferencesReducer,
  keeper,
  swanIntegration: swanIntegrationReducer,
  walletRescanning: walletRescanningReducer,
  wyreIntegration: wyreIntegrationReducer,
  rampIntegration: rampIntegrationReducer,
  versionHistory: VersionHistoryReducer,
  cloud: cloudReducer,
  upgradeToNewBhr: upgradeToNewBhr,
} )

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
