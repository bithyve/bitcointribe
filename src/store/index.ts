import { applyMiddleware, combineReducers, createStore } from 'redux'
import { createMigrate, persistReducer, persistStore } from 'redux-persist'
import { all, call, spawn } from 'redux-saga/effects'
import {
  acceptExistingContactRequestWatcher,
  autoShareLevel2KeepersWatcher,
  changeEncPasswordWatcher,
  changeQuestionAnswerWatcher,
  cloudMetaShareHealthWatcher,
  confirmPDFSharedWatcher,
  createChannelAssetsWatcher,
  createGuardianWatcher,
  deletePrivateDataWatcher,
  downloadBackupDataWatcher,
  downloadSMShareWatcher,
  emptyShareTransferDetailsForContactChangeWatcher,
  generateLevel1SharesWatcher,
  generateMetaSharesWatcher,
  getApprovalFromKeeperWatcher,
  getPDFDataWatcher,
  initHealthWatcher,
  modifyLevelDataWatcher,
  onPressKeeperChannelWatcher,
  recoverMnemonicHealthWatcher,
  recoverWalletFromIcloudWatcher,
  recoverWalletHealthWatcher,
  recoverWalletWithMnemonicWatcher,
  recoverWalletWithoutIcloudWatcher,
  rejectedExistingContactRequestWatcher,
  resetLevelAfterPasswordChangeWatcher,
  retrieveMetaSharesWatcher,
  setHealthStatusWatcher,
  setLevelToNotSetupStatusWatcher,
  setupHealthWatcher,
  setupLevelHealthWatcher,
  setupPasswordWatcher,
  sharePDFWatcher,
  updateHealthLevel2Watcher,
  updateKeeperInfoToChannelWatcher,
  updateSecondaryShardWatcher,
  updateSeedHealthWatcher,
  updateSharesHealthWatcher,
  updateWalletImageHealthWatcher,
  updatedKeeperInfoWatcher,
  upgradeLevelOneKeeperWatcher,
  upgradePDFWorkerWatcher
} from './sagas/BHR'
import {
  addTempSwanAccountInfoWatcher,
  createWithdrawalWalletOnSwanWatcher,
  fetchSwanAuthenticationUrlWatcher,
  redeemSwanCodeForTokenWatcher
} from './sagas/SwanIntegration'
import {
  accountCheckWatcher,
  addNewAccountShellsWatcher,
  autoSyncShellsWatcher,
  createBorderWalletWatcher,
  createSmNResetTFAOrXPrivWatcher,
  fetchExchangeRatesWatcher,
  fetchFeeRatesWatcher,
  generateGiftsWatcher,
  generateSecondaryXprivWatcher,
  mergeAccountShellsWatcher,
  reassignTransactionsWatcher,
  refreshAccountShellsWatcher,
  resetTwoFAWatcher,
  restoreAccountShellsWatcher,
  syncAccountsWatcher,
  testcoinsWatcher,
  txnReadWatcher,
  updateAccountSettingsWatcher,
  updateDonationPreferencesWatcher,
  validateTwoFAWatcher,
} from './sagas/accounts'
import {
  GoogleDriveLoginWatcher,
  checkCloudBackupWatcher,
  checkFileIsAvailableWatcher,
  cloudWatcher,
  createFileWatcher,
  getCloudBackupRecoveryWatcher,
  readFileWatcher,
  updateCloudBackupWatcher,
  updateDataWatcher,
  updateHealthForCloudStatusWatcher,
  updateHealthForCloudWatcher,
  uplaodFileWatcher,
} from './sagas/cloud'
import {
  accountSyncWatcher,
  executeOrderWatcher,
  getBalancesWatcher,
  getQuoteWatcher,
} from './sagas/fbtc'
import { connectToBitHyveNodeWatcher, connectToNodeWatcher, restorePersonalNodeConfigurationWatcher, savePersonalNodeConfigurationWatcher } from './sagas/nodeSettings'
import {
  fetchNotificationsWatcher,
  getMessageWatcher,
  pushNotificationPressedWatcher,
  updateFCMTokensWatcher,
  updateMessageStatusInAppWatcher,
  updateMessageStatusWatcher
} from './sagas/notifications'
import {
  receiveRgbAssetWatcher,
  rgbSyncWatcher
} from './sagas/rgb'
import { calculateCustomFeeWatcher, calculateSendMaxFeeWatcher, executeSendStage1Watcher, executeSendStage2Watcher, sendTxNotificationWatcher } from './sagas/sending'
import {
  applicationUpdateWatcher,
  changeAuthCredWatcher,
  credentialStorageWatcher,
  credentialsAuthWatcher,
  resetPinCredWatcher,
  setupWalletWatcher,
} from './sagas/setupAndAuth'
import {
  associateGiftWatcher,
  editTrustedContactWatcher,
  fetchGiftFromChannelWatcher,
  initializeTrustedContactWatcher,
  reclaimGiftWatcher,
  rejectGiftWatcher,
  rejectTrustedContactWatcher,
  removeTrustedContactWatcher,
  restoreTrustedContactsWatcher,
  syncGiftsStatusWatcher,
  syncPermanentChannelsWatcher,
  updateWalletNameToChannelWatcher,
  updateWalletNameWatcher,
  walletCheckInWatcher,
} from './sagas/trustedContacts'
import {
  autoShareContactKeeperWatcher,
  autoShareSecondaryWatcher,
  confirmPDFSharedFromUpgradeWatcher,
  initLevelsWatcher,
  setCloudDataForLevelWatcher,
  updateAvailableKeeperDataWatcher,
} from './sagas/upgradeToNewBhr'
import { recreateMissingAccountsWatcher, sweepMissingAccountsWatcher, syncMissingAccountsWatcher } from './sagas/upgrades'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { composeWithDevTools } from 'redux-devtools-extension'
import createDebugger from 'redux-flipper'
import createSagaMiddleware from 'redux-saga'
import thunk from 'redux-thunk'
import bhr from './reducers/BHR'
import rampIntegrationReducer from './reducers/RampIntegration'
import swanIntegrationReducer from './reducers/SwanIntegration'
import wyreIntegrationReducer from './reducers/WyreIntegration'
import accountsReducer from './reducers/accounts'
import cloudReducer from './reducers/cloud'
import doNotStoreReducer from './reducers/doNotStore'
import fBTCReducers from './reducers/fbtc'
import misc from './reducers/misc'
import nodeSettingsReducer from './reducers/nodeSettings'
import notificationsReducer from './reducers/notifications'
import preferencesReducer from './reducers/preferences'
import rgbReducer from './reducers/rgb'
import sendingReducer from './reducers/sending'
import setupAndAuthReducer from './reducers/setupAndAuth'
import storageReducer from './reducers/storage'
import trustedContactsReducer from './reducers/trustedContacts'
import upgradeToNewBhr from './reducers/upgradeToNewBhr'
import upgrades from './reducers/upgrades'
import VersionHistoryReducer from './reducers/versionHistory'
import walletRescanningReducer from './reducers/wallet-rescanning'
import reduxPersistMigrations from './redux-persist-migrations'
import {
  fetchRampReservationWatcher,
} from './sagas/RampIntegration'
import {
  fetchWyreReservationWatcher,
} from './sagas/WyreIntegration'
import { satCardAcountWatcher } from './sagas/satCardAccount'
import { updateUserNameWatcher } from './sagas/storage'
import { versionHistoryWatcher } from './sagas/versionHistory'

const config = {
  key: 'root', // key is required
  version: 0, // redux persist migration version code(initiate to a version once the corresponding migration state is implemented)
  storage: AsyncStorage, // storage is now required
  blacklist: [ 'setupAndAuth', 'loaders', 'doNotStore' ],
  migrate: createMigrate( reduxPersistMigrations, {
    debug: true
  } )
}

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
    fetchExchangeRatesWatcher,
    fetchFeeRatesWatcher,
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
    createBorderWalletWatcher,
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
    connectToNodeWatcher,

    // Notifications
    updateFCMTokensWatcher,
    fetchNotificationsWatcher,
    getMessageWatcher,
    updateMessageStatusWatcher,
    updateMessageStatusInAppWatcher,
    pushNotificationPressedWatcher,

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
    updateSeedHealthWatcher,
    recoverWalletWithMnemonicWatcher,

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
    sweepMissingAccountsWatcher,

    // sat card account
    satCardAcountWatcher,
    // rgb
    rgbSyncWatcher,
    receiveRgbAssetWatcher
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
  upgrades: upgrades,
  misc: misc,
  doNotStore: doNotStoreReducer,
  rgb: rgbReducer,
} )

export default function makeStore() {
  const sagaMiddleware = createSagaMiddleware()
  const reducers = persistReducer( config, rootReducer )
  const reduxDebugger = createDebugger()
  const storeMiddleware = composeWithDevTools(
    applyMiddleware( sagaMiddleware, thunk, reduxDebugger )
  )


  const store = createStore( reducers, storeMiddleware )

  persistStore( store )
  sagaMiddleware.run( rootSaga )

  return store
}
