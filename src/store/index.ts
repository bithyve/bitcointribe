import { applyMiddleware, createStore, combineReducers } from 'redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
import swanIntegrationReducer from './reducers/SwanIntegration'
import wyreIntegrationReducer from './reducers/WyreIntegration'
import rampIntegrationReducer from './reducers/RampIntegration'
import VersionHistoryReducer from './reducers/versionHistory'
import cloudReducer from './reducers/cloud'
import upgradeToNewBhr from './reducers/upgradeToNewBhr'


const config = {
  key: 'root', // key is required
  storage: AsyncStorage, // storage is now required
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
  removeTrustedContactWatcher,
  walletCheckInWatcher,
  syncPermanentChannelsWatcher,
  initializeTrustedContactWatcher,
  rejectTrustedContactWatcher,
} from './sagas/trustedContacts'

import nodeSettingsReducer from './reducers/nodeSettings'
import { connectToBitHyveNodeWatcher, restorePersonalNodeConfigurationWatcher, savePersonalNodeConfigurationWatcher } from './sagas/nodeSettings'

import {
  fetchSwanAuthenticationUrlWatcher,
  redeemSwanCodeForTokenWatcher,
  createWithdrawalWalletOnSwanWatcher,
  addTempSwanAccountInfoWatcher
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
  updateHealthLevel2Watcher,
  recoverWalletFromIcloudWatcher,
  recoverWalletHealthWatcher,
  downloadMetaShareHealthWatcher,
  cloudMetaShareHealthWatcher,
  fetchWalletImageHealthWatcher,
  recoverMnemonicHealthWatcher,
  getPDFDataWatcher,
  sharePDFWatcher,
  confirmPDFSharedWatcher,
  updatedKeeperInfoWatcher,
  updateWalletImageHealthWatcher,
  emptyShareTransferDetailsForContactChangeWatcher,
  removeUnwantedUnderCustodySharesWatcher,
  generateSMMetaSharesWatcher,
  deletePrivateDataWatcher,
  autoShareLevel2KeepersWatcher,
  setLevelToNotSetupStatusWatcher,
  setHealthStatusWatcher,
  modifyLevelDataWatcher,
  createChannelAssetsWatcher,
  downloadSMShareWatcher,
  createOrChangeGuardianWatcher,
} from './sagas/health'

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
  updateCloudBackupWatcher,
} from './sagas/cloud'

import {
  initLevelsWatcher,
  setCloudDataForLevelWatcher,
  autoShareSecondaryWatcher,
  autoShareContactKeeperWatcher,
  updateAvailableKeeperDataWatcher,
  confirmPDFSharedFromUpgradeWatcher,
} from './sagas/upgradeToNewBhr'

import { calculateCustomFeeWatcher, calculateSendMaxFeeWatcher, executeAlternateSendStage2Watcher, executeSendStage1Watcher, executeSendStage2Watcher, executeSendStage3Watcher, sendTxNotificationWatcher } from './sagas/sending'
import newBHR from './reducers/newBHR'
import { onPressKeeperChannelWatcher } from './sagas/newBHR'
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
    initializeTrustedContactWatcher,
    rejectTrustedContactWatcher,
    removeTrustedContactWatcher,
    walletCheckInWatcher,
    syncPermanentChannelsWatcher,

    // Health
    initHealthWatcher,
    checkSharesHealthWatcher,
    updateSharesHealthWatcher,
    generateMetaSharesWatcher,
    updateHealthLevel2Watcher,
    recoverWalletFromIcloudWatcher,
    recoverWalletHealthWatcher,
    downloadMetaShareHealthWatcher,
    cloudMetaShareHealthWatcher,
    fetchWalletImageHealthWatcher,
    updateWalletImageHealthWatcher,
    recoverMnemonicHealthWatcher,
    getPDFDataWatcher,
    sharePDFWatcher,
    confirmPDFSharedWatcher,
    updatedKeeperInfoWatcher,
    emptyShareTransferDetailsForContactChangeWatcher,
    removeUnwantedUnderCustodySharesWatcher,
    generateSMMetaSharesWatcher,
    deletePrivateDataWatcher,
    autoShareLevel2KeepersWatcher,
    setLevelToNotSetupStatusWatcher,
    setHealthStatusWatcher,
    modifyLevelDataWatcher,
    createChannelAssetsWatcher,
    downloadSMShareWatcher,
    createOrChangeGuardianWatcher,

    // Swan Integration
    fetchSwanAuthenticationUrlWatcher,
    redeemSwanCodeForTokenWatcher,
    createWithdrawalWalletOnSwanWatcher,
    addTempSwanAccountInfoWatcher,

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
    updateCloudBackupWatcher,
    // Sending
    executeSendStage1Watcher,
    executeSendStage2Watcher,
    executeAlternateSendStage2Watcher,
    executeSendStage3Watcher,
    calculateSendMaxFeeWatcher,
    calculateCustomFeeWatcher,
    sendTxNotificationWatcher,

    // upgrade
    initLevelsWatcher,
    setCloudDataForLevelWatcher,
    autoShareSecondaryWatcher,
    autoShareContactKeeperWatcher,
    updateAvailableKeeperDataWatcher,

    //newBHR
    onPressKeeperChannelWatcher,
    confirmPDFSharedFromUpgradeWatcher,
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
  swanIntegration: swanIntegrationReducer,
  walletRescanning: walletRescanningReducer,
  wyreIntegration: wyreIntegrationReducer,
  rampIntegration: rampIntegrationReducer,
  versionHistory: VersionHistoryReducer,
  cloud: cloudReducer,
  upgradeToNewBhr: upgradeToNewBhr,
  newBHR: newBHR
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
