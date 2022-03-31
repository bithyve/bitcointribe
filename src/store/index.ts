import { applyMiddleware, createStore, combineReducers } from 'redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import { call, all, spawn } from 'redux-saga/effects'
import { composeWithDevTools } from 'redux-devtools-extension'

import storageReducer from './reducers/storage'
import setupAndAuthReducer from './reducers/setupAndAuth'
import accountsReducer from './reducers/accounts'
import bhr from './reducers/BHR'
import fBTCReducers from './reducers/fbtc'
import notificationsReducer from './reducers/notifications'
import sendingReducer from './reducers/sending'
import trustedContactsReducer from './reducers/trustedContacts'
import { persistStore, persistReducer, createMigrate } from 'redux-persist'
import preferencesReducer from './reducers/preferences'
import swanIntegrationReducer from './reducers/SwanIntegration'
import wyreIntegrationReducer from './reducers/WyreIntegration'
import rampIntegrationReducer from './reducers/RampIntegration'
import VersionHistoryReducer from './reducers/versionHistory'
import cloudReducer from './reducers/cloud'
import upgradeToNewBhr from './reducers/upgradeToNewBhr'
import reduxPersistMigrations from './redux-persist-migrations'

const config = {
  key: 'root', // key is required
  // version: 0, // redux persist migration version code(initiate to a version once the corresponding migration state is implemented)
  storage: AsyncStorage, // storage is now required
  blacklist: [ 'setupAndAuth', 'loaders' ],
  migrate: createMigrate( reduxPersistMigrations, {
    debug: true
  } )
}

import {
  setupWalletWatcher,
  credentialStorageWatcher,
  credentialsAuthWatcher,
  changeAuthCredWatcher,
  applicationUpdateWatcher,
  resetPinCredWatcher,
} from './sagas/setupAndAuth'

import {
  testcoinsWatcher,
  syncAccountsWatcher,
  generateSecondaryXprivWatcher,
  resetTwoFAWatcher,
  updateDonationPreferencesWatcher,
  addNewAccountShellsWatcher,
  reassignTransactionsWatcher,
  mergeAccountShellsWatcher,
  refreshAccountShellsWatcher,
  feeAndExchangeRatesWatcher,
  autoSyncShellsWatcher,
  validateTwoFAWatcher,
  createSmNResetTFAOrXPrivWatcher,
  updateAccountSettingsWatcher,
  restoreAccountShellsWatcher,
  accountCheckWatcher,
  txnReadWatcher,
  generateGiftsWatcher
} from './sagas/accounts'

import {
  accountSyncWatcher,
  getQuoteWatcher,
  executeOrderWatcher,
  getBalancesWatcher,
} from './sagas/fbtc'

import {
  updateFCMTokensWatcher,
  fetchNotificationsWatcher,
  getMessageWatcher,
  updateMessageStatusWatcher,
  updateMessageStatusInAppWatcher
} from './sagas/notifications'

import {
  walletCheckInWatcher,
  syncPermanentChannelsWatcher,
  initializeTrustedContactWatcher,
  editTrustedContactWatcher,
  removeTrustedContactWatcher,
  rejectTrustedContactWatcher,
  restoreTrustedContactsWatcher,
  updateWalletNameToChannelWatcher,
  updateWalletNameWatcher,
  fetchGiftFromChannelWatcher,
  syncGiftsStatusWatcher,
  rejectGiftWatcher,
  associateGiftWatcher,
  reclaimGiftWatcher,
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
} from './sagas/WyreIntegration'
import {
  fetchRampReservationWatcher,
} from './sagas/RampIntegration'
import { versionHistoryWatcher } from './sagas/versionHistory'
import walletRescanningReducer from './reducers/wallet-rescanning'

import {
  initHealthWatcher,
  updateSharesHealthWatcher,
  generateMetaSharesWatcher,
  updateHealthLevel2Watcher,
  recoverWalletFromIcloudWatcher,
  recoverWalletWithoutIcloudWatcher,
  recoverWalletHealthWatcher,
  cloudMetaShareHealthWatcher,
  recoverMnemonicHealthWatcher,
  getPDFDataWatcher,
  sharePDFWatcher,
  confirmPDFSharedWatcher,
  updatedKeeperInfoWatcher,
  updateWalletImageHealthWatcher,
  emptyShareTransferDetailsForContactChangeWatcher,
  deletePrivateDataWatcher,
  autoShareLevel2KeepersWatcher,
  setLevelToNotSetupStatusWatcher,
  setHealthStatusWatcher,
  modifyLevelDataWatcher,
  createChannelAssetsWatcher,
  downloadSMShareWatcher,
  createGuardianWatcher,
  downloadBackupDataWatcher,
  setupHealthWatcher,
  updateKeeperInfoToChannelWatcher,
  acceptExistingContactRequestWatcher,
  setupPasswordWatcher,
  setupLevelHealthWatcher,
  generateLevel1SharesWatcher,
  retrieveMetaSharesWatcher,
  onPressKeeperChannelWatcher,
  updateSecondaryShardWatcher,
  getApprovalFromKeeperWatcher,
  rejectedExistingContactRequestWatcher,
  changeQuestionAnswerWatcher,
  upgradePDFWorkerWatcher,
  upgradeLevelOneKeeperWatcher,
  resetLevelAfterPasswordChangeWatcher,
  changeEncPasswordWatcher
} from './sagas/BHR'

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

import { calculateCustomFeeWatcher, calculateSendMaxFeeWatcher, executeSendStage1Watcher, executeSendStage2Watcher, sendTxNotificationWatcher } from './sagas/sending'
import { updateUserNameWatcher } from './sagas/storage'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import { recreateMissingAccountsWatcher, sweepMissingAccountsWatcher, syncMissingAccountsWatcher } from './sagas/upgrades'
import upgrades from './reducers/upgrades'
const rootSaga = function* () {
  const sagas = [
    // wallet setup watcher
    setupWalletWatcher,
    credentialStorageWatcher,
    credentialsAuthWatcher,
    changeAuthCredWatcher,
    applicationUpdateWatcher,
    resetPinCredWatcher,

    // accounts watchers
    syncAccountsWatcher,
    testcoinsWatcher,
    generateSecondaryXprivWatcher,
    resetTwoFAWatcher,
    feeAndExchangeRatesWatcher,
    updateDonationPreferencesWatcher,
    refreshAccountShellsWatcher,
    addNewAccountShellsWatcher,
    restoreAccountShellsWatcher,
    accountCheckWatcher,
    txnReadWatcher,
    reassignTransactionsWatcher,
    mergeAccountShellsWatcher,
    autoSyncShellsWatcher,
    validateTwoFAWatcher,
    createSmNResetTFAOrXPrivWatcher,
    updateAccountSettingsWatcher,
    generateGiftsWatcher,

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
    getMessageWatcher,
    updateMessageStatusWatcher,
    updateMessageStatusInAppWatcher,

    // Trusted Contacts
    initializeTrustedContactWatcher,
    rejectTrustedContactWatcher,
    editTrustedContactWatcher,
    removeTrustedContactWatcher,
    walletCheckInWatcher,
    syncPermanentChannelsWatcher,
    restoreTrustedContactsWatcher,
    updateWalletNameToChannelWatcher,
    updateWalletNameWatcher,
    associateGiftWatcher,
    fetchGiftFromChannelWatcher,
    syncGiftsStatusWatcher,
    rejectGiftWatcher,
    reclaimGiftWatcher,

    // bhr
    initHealthWatcher,
    updateSharesHealthWatcher,
    generateMetaSharesWatcher,
    updateHealthLevel2Watcher,
    recoverWalletFromIcloudWatcher,
    recoverWalletWithoutIcloudWatcher,
    recoverWalletHealthWatcher,
    cloudMetaShareHealthWatcher,
    updateWalletImageHealthWatcher,
    recoverMnemonicHealthWatcher,
    getPDFDataWatcher,
    sharePDFWatcher,
    confirmPDFSharedWatcher,
    updatedKeeperInfoWatcher,
    emptyShareTransferDetailsForContactChangeWatcher,
    deletePrivateDataWatcher,
    autoShareLevel2KeepersWatcher,
    setLevelToNotSetupStatusWatcher,
    setHealthStatusWatcher,
    modifyLevelDataWatcher,
    createChannelAssetsWatcher,
    downloadSMShareWatcher,
    createGuardianWatcher,
    downloadBackupDataWatcher,
    setupHealthWatcher,
    updateKeeperInfoToChannelWatcher,
    acceptExistingContactRequestWatcher,
    setupPasswordWatcher,
    setupLevelHealthWatcher,
    generateLevel1SharesWatcher,
    retrieveMetaSharesWatcher,
    onPressKeeperChannelWatcher,
    confirmPDFSharedFromUpgradeWatcher,
    updateSecondaryShardWatcher,
    getApprovalFromKeeperWatcher,
    rejectedExistingContactRequestWatcher,
    changeQuestionAnswerWatcher,
    upgradePDFWorkerWatcher,
    upgradeLevelOneKeeperWatcher,

    resetLevelAfterPasswordChangeWatcher,
    changeEncPasswordWatcher,
    // Swan Integration
    fetchSwanAuthenticationUrlWatcher,
    redeemSwanCodeForTokenWatcher,
    createWithdrawalWalletOnSwanWatcher,
    addTempSwanAccountInfoWatcher,

    // Wyre Integration
    fetchWyreReservationWatcher,

    // Ramp Integration
    fetchRampReservationWatcher,

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
    calculateSendMaxFeeWatcher,
    calculateCustomFeeWatcher,
    sendTxNotificationWatcher,

    // upgrade
    initLevelsWatcher,
    setCloudDataForLevelWatcher,
    autoShareSecondaryWatcher,
    autoShareContactKeeperWatcher,
    updateAvailableKeeperDataWatcher,

    // storage
    updateUserNameWatcher,

    // upgrade scripts
    recreateMissingAccountsWatcher,
    syncMissingAccountsWatcher,
    sweepMissingAccountsWatcher
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
  bhr: bhr,
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
  upgrades: upgrades
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
