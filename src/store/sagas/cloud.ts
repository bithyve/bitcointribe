import moment from 'moment'
import { call, put, select } from 'redux-saga/effects'
import { CloudData } from '../../common/CommonFunctions'
import CloudBackup from '../../common/CommonFunctions/CloudBackup'
import { REGULAR_ACCOUNT } from '../../common/constants/wallet-service-types'
import { SET_CLOUD_BACKUP_STATUS, SET_CLOUD_DATA, UPDATE_CLOUD_HEALTH } from '../actions/cloud'
import { updateMSharesHealth } from '../actions/health'
import { setCloudBackupStatus } from '../actions/preferences'
import { createWatcher } from '../utils/utilities'

function* cloudWorker({ payload }) {
  try {
    const cloudBackupStatus = yield select((state) => state.preferences.cloudBackupStatus)
    if (cloudBackupStatus === false) {
      yield put(setCloudBackupStatus({
        status: true
      }))
      const { kpInfo, level, share, callback } = payload
      const walletName = yield select((state) => state.storage.database.WALLET_SETUP.walletName)
      const questionId = yield select((state) => state.storage.database.WALLET_SETUP.security.questionId)
      const question = yield select((state) => state.storage.database.WALLET_SETUP.security.question)
      const regularAccount = yield select((state) => state.accounts[REGULAR_ACCOUNT].service)
      const database = yield select((state) => state.storage.database)
      const accountShells = yield select((state) => state.accounts.accountShells)
      const activePersonalNode = yield select((state) => state.nodeSettings.activePersonalNode)
      const versionHistory = yield select((state) => state.versionHistory.versions)

      console.log('PAYLOAD cloudWorker', payload)
      let encryptedCloudDataJson
      const shares =
        share &&
          !(Object.keys(share).length === 0 && share.constructor === Object)
          ? JSON.stringify(share)
          : ''
      encryptedCloudDataJson = yield call(CloudData,
        database,
        accountShells,
        activePersonalNode,
        versionHistory
      )
      // console.log("encryptedCloudDataJson cloudWorker", encryptedCloudDataJson)

      const keeperData = [
        {
          shareId: '',
          KeeperType: 'cloud',
          updated: '',
          reshareVersion: 0,
        },
      ]
      const data = {
        levelStatus: level ? level : 1,
        shares: shares,
        encryptedCloudDataJson: encryptedCloudDataJson,
        walletName: walletName,
        questionId: questionId,
        question: questionId === '0' ? question : '',
        regularAccount: regularAccount,
        keeperData: kpInfo ? JSON.stringify(kpInfo) : JSON.stringify(keeperData),
      }
      console.log('data cloudWorker', data)
      console.log('cloudBackupStatus cloudWorker', cloudBackupStatus)
      const cloudObject = new CloudBackup({
        dataObject: data,
        callBack: callback,
        share,
      })
      console.log('cloudObject cloudWorker', cloudObject)

      cloudObject.CloudDataBackup(data, callback, share)
    }
  }
  catch (error) {
    yield put(setCloudBackupStatus({
      status: false
    }))
    console.log('ERROR cloudWorker', error)
  }
}

export const cloudWatcher = createWatcher(
  cloudWorker,
  SET_CLOUD_DATA,
)

function* setCloudBackupStatusWorker({ payload }) {
  console.log('setCloudBackupStatusWorker', payload)
  try {
    const { share } = payload
    yield put(setCloudBackupStatus({
      status: true
    }))
    const cloudBackupStatus = yield select((state) => state.preferences.cloudBackupStatus)

    const currentLevel = yield select((state) => state.health.currentLevel)

    if (cloudBackupStatus.status && currentLevel == 0) {
      yield call(updateHealthForCloudWorker, {
        payload: {
        }
      })
    } else if ((cloudBackupStatus.status && currentLevel == 1) || currentLevel == 2) {
      yield call(updateHealthForCloudWorker, {
        payload: {
          share
        }
      })
    }
    yield put(setCloudBackupStatus({
      status: false
    }))
  }
  catch (error) {
    yield put(setCloudBackupStatus({
      status: false
    }))
    console.log('ERRORsf', error)
  }
}

export const setCloudBackupStatusWatcher = createWatcher(
  setCloudBackupStatusWorker,
  SET_CLOUD_BACKUP_STATUS,
)


function* updateHealthForCloudWorker({ payload }) {
  try {
    const { share } = payload
    const levelHealth = yield select((state) => state.health.levelHealth)
    const cloudBackupStatus = yield select((state) => state.preferences.cloudBackupStatus)
    const isLevel2Initialized = yield select((state) => state.health.isLevel2Initialized)
    const s3Service = yield select((state) => state.health.service)

    let levelHealthVar = levelHealth[0].levelInfo[0]
    if (
      share &&
      !(Object.keys(share).length === 0 && share.constructor === Object) &&
      levelHealth.length > 0
    ) {
      levelHealthVar = levelHealth[levelHealth.length - 1].levelInfo[0]
    }
    // health update for 1st upload to cloud
    if (
      cloudBackupStatus &&
      levelHealth.length &&
      levelHealthVar.status != 'accessible'
    ) {
      if (levelHealthVar.shareType == 'cloud') {
        levelHealthVar.updatedAt = moment(new Date()).valueOf()
        levelHealthVar.status = 'accessible'
        levelHealthVar.reshareVersion = 0
        levelHealthVar.name = 'Cloud'
      }
      const shareArray = [
        {
          walletId: s3Service.getWalletId().data.walletId,
          shareId: levelHealthVar.shareId,
          reshareVersion: levelHealthVar.reshareVersion,
          updatedAt: moment(new Date()).valueOf(),
          status: 'accessible',
          shareType: 'cloud',
        },
      ]
      yield put(updateMSharesHealth(shareArray))
    }
  }
  catch (error) {
    yield put(setCloudBackupStatus({
      status: false
    }))
    console.log('ERRORsf', error)
    throw error
  }
}

export const updateHealthForCloudWatcher = createWatcher(
  updateHealthForCloudWorker,
  UPDATE_CLOUD_HEALTH,
)
