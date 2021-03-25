import moment from 'moment'
import { NativeModules, Platform } from 'react-native'
import { call, fork, put, select, spawn } from 'redux-saga/effects'
import { CloudData } from '../../common/CommonFunctions'
import CloudBackup from '../../common/CommonFunctions/CloudBackup'
import { REGULAR_ACCOUNT } from '../../common/constants/wallet-service-types'
import { UPDATE_HEALTH_FOR_CLOUD, SET_CLOUD_DATA, UPDATE_CLOUD_HEALTH, CHECK_CLOUD_BACKUP, UPDATE_DATA, CREATE_FILE, CHECK_IF_FILE_AVAILABLE, READ_FILE, UPLOAD_FILE, GOOGLE_DRIVE_LOGIN, setGoogleCloudLoginSuccess, GET_CLOUD_DATA_RECOVERY, setCloudDataRecovery, setIsCloudBackupUpdated, setIsCloudBackupSuccess, GOOGLE_LOGIN, setIsFileReading, setGoogleCloudLoginFailure, DataBackupStatus } from '../actions/cloud'
import { updateMSharesHealth } from '../actions/health'
import { setCloudBackupStatus } from '../actions/preferences'
import { createWatcher } from '../utils/utilities'
const GoogleDrive = NativeModules.GoogleDrive
const iCloud = NativeModules.iCloud

function* cloudWorker( { payload } ) {
  try{
    const cloudBackupStatus = yield select( ( state ) => state.preferences.cloudBackupStatus )
    if ( cloudBackupStatus === false ) {
      yield put( setCloudBackupStatus( true ) )
      const { kpInfo, level, share } = payload
      const walletName = yield select( ( state ) => state.storage.database.WALLET_SETUP.walletName )
      const questionId = yield select( ( state ) => state.storage.database.WALLET_SETUP.security.questionId )
      const question = yield select( ( state ) => state.storage.database.WALLET_SETUP.security.question )
      const regularAccount = yield select( ( state ) => state.accounts[ REGULAR_ACCOUNT ].service )
      const database = yield select( ( state ) => state.storage.database )
      const accountShells = yield select( ( state ) => state.accounts.accountShells )
      const activePersonalNode = yield select( ( state ) => state.nodeSettings.activePersonalNode )
      const versionHistory = yield select( ( state ) => state.versionHistory.versions )
      const trustedContactsInfo = yield select( ( state ) => state.trustedContacts.trustedContactsInfo )

      let encryptedCloudDataJson
      const shares =
            share &&
                !( Object.keys( share ).length === 0 && share.constructor === Object )
              ? JSON.stringify( share )
              : ''
      encryptedCloudDataJson = yield call( CloudData,
        database,
        accountShells,
        activePersonalNode,
        versionHistory,
        trustedContactsInfo
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
        question: questionId === '0' ? question: '',
        regularAccount: regularAccount,
        keeperData: kpInfo ? JSON.stringify( kpInfo ) : JSON.stringify( keeperData ),
      }

      const isCloudBackupCompleted = yield call ( checkCloudBackupWorker, {
        payload: {
          data, share
        }
      } )

      if( isCloudBackupCompleted ) {
        yield put( DataBackupStatus( true ) )
        yield call( updateHealthForCloudStatusWorker, {
          payload : {
            share
          }
        } )
      } else{
        yield put( DataBackupStatus( false ) )
        yield put( setCloudBackupStatus( false ) )
      }

    }
  }
  catch ( error ) {
    yield put( DataBackupStatus( false ) )
    yield put( setCloudBackupStatus( false ) )
    console.log( 'ERROR cloudWorker', error )
  }
}

export const cloudWatcher = createWatcher(
  cloudWorker,
  SET_CLOUD_DATA,
)

function* updateHealthForCloudStatusWorker( { payload } ) {
  console.log( 'setCloudBackupStatusWorker', payload )
  try {
    yield put( setCloudBackupStatus( false ) )

    const currentLevel = yield select( ( state ) => state.health.currentLevel )

    if ( currentLevel == 0 ) {
      yield call( updateHealthForCloudWorker, {
        payload: {
        }
      } )
    } else if ( currentLevel == 1 || currentLevel == 2 ) {
      const { share } = payload
      yield call( updateHealthForCloudWorker, {
        payload: {
          share
        }
      } )
    }
    yield put( setCloudBackupStatus( false ) )
  }
  catch ( error ) {
    yield put( setCloudBackupStatus( false ) )
    console.log( 'ERRORsf', error )
  }
}

export const updateHealthForCloudStatusWatcher = createWatcher(
  updateHealthForCloudStatusWorker,
  UPDATE_HEALTH_FOR_CLOUD,
)


function* updateHealthForCloudWorker( { payload } ) {
  try {
    const { share } = payload
    const levelHealth = yield select( ( state ) => state.health.levelHealth )
    const isLevel2Initialized = yield select( ( state ) => state.health.isLevel2Initialized )
    const s3Service = yield select( ( state ) => state.health.service )

    let levelHealthVar = levelHealth[ 0 ].levelInfo[ 0 ]
    if (
      share &&
      !( Object.keys( share ).length === 0 && share.constructor === Object ) &&
      levelHealth.length > 0
    ) {
      levelHealthVar = levelHealth[ levelHealth.length - 1 ].levelInfo[ 0 ]
    }
    // health update for 1st upload to cloud
    if (
      levelHealth.length &&
      levelHealthVar.status != 'accessible'
    ) {
      if ( levelHealthVar.shareType == 'cloud' ) {
        levelHealthVar.updatedAt = moment( new Date() ).valueOf()
        levelHealthVar.status = 'accessible'
        levelHealthVar.reshareVersion = 0
        levelHealthVar.name = 'Cloud'
      }
      const shareArray = [
        {
          walletId: s3Service.getWalletId().data.walletId,
          shareId: levelHealthVar.shareId,
          reshareVersion: levelHealthVar.reshareVersion,
          updatedAt: moment( new Date() ).valueOf(),
          status: 'accessible',
          shareType: 'cloud',
        },
      ]
      yield put( updateMSharesHealth( shareArray ) )
    }
  }
  catch ( error ) {
    yield put( setCloudBackupStatus( false ) )
    console.log( 'ERRORsf', error )
    throw error
  }
}

export const updateHealthForCloudWatcher = createWatcher(
  updateHealthForCloudWorker,
  UPDATE_CLOUD_HEALTH,
)

function* getCloudBackupRecoveryWorker () {
  try {
    if ( Platform.OS == 'ios' ) {
      const backedJson = yield call( iCloud.downloadBackup )
      if ( backedJson ) {
        yield put( setCloudDataRecovery( backedJson ) )
      }
    } else {
      const checkDataIsBackedup = true
      yield call ( GoogleDriveLoginWorker, {
        payload: {
          checkDataIsBackedup
        }
      } )
    }
  } catch ( error ) {
    throw new Error( error )
  }
}

export const getCloudBackupRecoveryWatcher = createWatcher(
  getCloudBackupRecoveryWorker,
  GET_CLOUD_DATA_RECOVERY,
)

function* checkCloudBackupWorker ( { payload } ) {
  try {
    const { data, share } = payload
    console.log( 'CloudDataBackup STARTED' )
    if ( Platform.OS == 'ios' ) {
      const backedJson = yield call( iCloud.downloadBackup )
      console.log( 'backedJson', backedJson )
      if ( backedJson ) {
        const isCloudBackupUpdated = yield call( updateDataWorker, {
          payload: {
            result1: backedJson,
            googleData: '',
            share: share,
            data
          }
        } )
        yield put( setIsCloudBackupUpdated( isCloudBackupUpdated ) )
        return isCloudBackupUpdated
      } else {
        console.log( 'createFile' )
        const isCloudBackupSuccess = yield call( createFileWorker, {
          payload:{
            data, share
          }
        } )
        yield put( setIsCloudBackupSuccess( isCloudBackupSuccess ) )
        return isCloudBackupSuccess
      }
    } else {
      const isDataBackedUp =  yield call ( GoogleDriveLoginWorker, {
        payload: {
          share, data
        }
      } )
      console.log( 'isDataBackedUp', isDataBackedUp )
      if( isDataBackedUp === 'successFullyUpdate' || isDataBackedUp === 'successFullyUpload' ){
        return true
      } else{
        return false
      }

    }
  } catch( error ){
    console.log( 'CloudDataBackup error', error )
    throw new Error( error )
  }
}

export const checkCloudBackupWatcher = createWatcher(
  checkCloudBackupWorker,
  CHECK_CLOUD_BACKUP,
)

function* GoogleDriveLoginWorker ( { payload } ) {
  try {
    const { checkDataIsBackedup, share, googlePermissionCall, data } = payload
    const result = yield call ( GoogleDrive.setup )
    let googleLoginResult
    if( result ){
      googleLoginResult = yield call( GoogleDrive.login )
      console.log( 'googleLoginResult', googleLoginResult )
      if( googleLoginResult ){
        const result = googleLoginResult
        if ( !googlePermissionCall ){
          if ( result.eventName == 'onLogin' ) {
            yield put( setGoogleCloudLoginSuccess( true ) )
            const fileAvailabelStatus =  yield call( checkFileIsAvailableWorker, {
              payload: {
                checkDataIsBackedup: checkDataIsBackedup,
                share,
                data
              }
            } )
            return fileAvailabelStatus
          } else{
            console.log( 'GOOGLE SetupFail else', result )
            yield put( setGoogleCloudLoginFailure( true ) )
            throw new Error( 'Google LoginFail' )
          }
        }
        else{
          console.log( 'GOOGLE ReSULT GoogleDriveLogin', result )
          if ( result.eventName === 'onLogin' ) {
            yield put( setGoogleCloudLoginSuccess( true ) )
          } else{
            console.log( 'GOOGLE SetupFail else', result )
            yield put( setGoogleCloudLoginFailure( true ) )
            throw new Error( result.eventName )
          }
        }
      }
      console.log( 'googleLoginResult', googleLoginResult )
    }
  } catch ( error ) {
    console.log( 'LOGIN error', error )
    throw new Error( error )
  }
}

export const GoogleDriveLoginWatcher = createWatcher(
  GoogleDriveLoginWorker,
  GOOGLE_DRIVE_LOGIN,
)

function* updateDataWorker( { payload } ) {
  try {
    const { result1, googleData, share, data } = payload
    const walletId  = data.regularAccount.getWalletId().data.walletId

    let arr = []
    const newArray = []
    if ( result1 ) {
      arr = JSON.parse( result1 )
      if ( arr && arr.length ) {
        for ( let i = 0; i < arr.length; i++ ) {
          newArray.push( arr[ i ] )
        }
      }
      const index = newArray.findIndex( ( x ) => x.walletId == walletId )
      if ( index === -1 ) {
        const tempData = {
          levelStatus: data.levelStatus,
          walletName: data.walletName,
          questionId: data.questionId,
          question: data.question,
          walletId: walletId,
          data: data.encryptedCloudDataJson,
          shares: data.shares,
          keeperData: data.keeperData,
          dateTime: moment( new Date() ),
        }
        newArray.push( tempData )
      } else {
        newArray[ index ].questionId = data.questionId,
        newArray[ index ].question = data.question,
        newArray[ index ].levelStatus = data.levelStatus
        newArray[ index ].data = data.encryptedCloudDataJson
        newArray[ index ].shares = data.shares ? data.shares : newArray[ index ].shares
        newArray[ index ].keeperData = data.keeperData
        newArray[ index ].dateTime = moment( new Date() )
      }
      //console.log( 'ARR', newArray )
      if ( Platform.OS == 'ios' ) {
        if( newArray.length ) {
          const result = yield call( iCloud.startBackup, JSON.stringify( newArray )  )
          return result
        }

      }
      // console.log('Platform.OS share', share)
    } else {
      const metaData = {
        name: googleData.name,
        mimeType: googleData.mimeType,
        data: JSON.stringify( newArray ),
        id: googleData.id,
      }
      const result = yield call( GoogleDrive.updateFile, JSON.stringify( metaData )  )
      console.log( 'GoogleDrive.updateFile result', result )
      if ( result.eventName == 'successFullyUpdate' ) {
        return 'successFullyUpdate'
        //this.callBack( share )
      }
      else if( result.eventName == 'failure' ){
        throw new Error( result.eventName )
      }
      console.log( 'GoogleDrive.updateFile', result )

    }
  }
  catch ( error ) {
    yield put( setCloudBackupStatus( false ) )
    console.log( 'ERRORsf', error )
    throw error
  }
}

export const updateDataWatcher = createWatcher(
  updateDataWorker,
  UPDATE_DATA,
)


function* createFileWorker( { payload } ) {
  try {
    const { share, data } = payload
    const WalletData = []
    const walletId  = data.regularAccount.getWalletId().data.walletId
    const tempData = {
      levelStatus: data.levelStatus,
      walletName: data.walletName,
      questionId: data.questionId,
      question: data.question,
      walletId: walletId,
      data: data.encryptedCloudDataJson,
      shares: data.shares,
      keeperData: data.keeperData,
      dateTime: moment( new Date() ),
    }
    WalletData.push( tempData )

    if ( Platform.OS === 'ios' ) {
      const result = yield call( iCloud.startBackup, JSON.stringify( WalletData )  )
      return result
      // this.callBack( share )
    } else {
      const metaData = {
        name: 'HexaWalletBackup.json',
        description: 'Backup data for my app',
        mimeType: 'application/json',
        data: JSON.stringify( WalletData ),
      }

      const result = yield call( GoogleDrive.uploadFile, JSON.stringify( metaData ) )
      console.log( 'result GoogleDrive.uploadFile', result )
      if ( result && result.eventName == 'successFullyUpload' ) {
        return result.eventName
        // this.callBack( share )
      } else if ( result && result.eventName === 'UseUserRecoverableAuthIOException' ) {
        const fileAvailabelStatus = yield call( checkFileIsAvailableWorker, {
          payload: {
            share,
            data
          }
        } )
        return fileAvailabelStatus
      }
    }
  } catch ( error ) {
    throw new Error( error )
  }
}

export const createFileWatcher = createWatcher(
  createFileWorker,
  CREATE_FILE,
)


function* checkFileIsAvailableWorker( { payload } ) {
  try {
    const { checkDataIsBackedup, share, data } = payload
    const metaData = {
      name: 'HexaWalletBackup.json',
      description: 'Backup data for my app',
      mimeType: 'application/json',
    }
    const result = yield call ( GoogleDrive.checkIfFileExist, JSON.stringify( metaData ) )

    console.log( 'result checkFileIsAvailableWorker', result )
    if( !result ) return null
    if ( !checkDataIsBackedup ) {
      if ( result && result.eventName == 'listEmpty' ) {
        console.log( 'createFile' )
        const createFileStatus = yield call ( createFileWorker, {
          payload: {
            share, data
          }
        } )
        return createFileStatus
      } else if ( result.eventName == 'failure' ) {
        console.log( 'FAILURE' )
        throw new Error( result.eventName )
      } else if( result.eventName === 'UseUserRecoverableAuthIOException' )
      {
        console.log( 'UseUserRecoverableAuthIOException Failure' )
        const fileAvailabelStatus = yield call( checkFileIsAvailableWorker, {
          payload: {
            share,
            data
          }
        } )
        return fileAvailabelStatus
      } else {
        const readStatus = yield call ( readFileWorker, {
          payload: {
            result, share, data
          }
        } )
        return readStatus
      }
    } else {
      const readStatus = yield call ( readFileWorker, {
        payload: {
          result, checkDataIsBackedup, share, data
        }
      } )
      return readStatus
    }
  } catch ( error ) {
    throw new Error( error )
  }
}

export const checkFileIsAvailableWatcher = createWatcher(
  checkFileIsAvailableWorker,
  CHECK_IF_FILE_AVAILABLE,
)

function* readFileWorker( { payload } ) {
  const { result, checkDataIsBackedup, share, data } = payload
  const metaData = {
    id: result.id
  }
  const isFileReading = yield select( ( state ) => state.cloud.isFileReading )

  console.log( 'isFileReading readFile', isFileReading )
  try {
    if ( isFileReading === false ) {
      yield put( setIsFileReading( true ) )
      const result1 = yield call ( GoogleDrive.readFile, JSON.stringify( metaData )  )
      const readResult = result1.data
      //console.log( 'readResult', readResult )
      if ( checkDataIsBackedup ) {
        yield put( setIsFileReading( false ) )
        yield put( setCloudDataRecovery( readResult ) )
      } else {
        const updateStatus = yield call ( uplaodFileWorker, {
          payload : {
            readResult, googleData: result, share, data
          }
        } )
        if ( result1 ) yield put( setIsFileReading( false ) )
        return updateStatus
      }

    }
  } catch ( error ) {
    console.log( 'error', error )
    yield put( setIsFileReading( false ) )
    throw new Error( error )
  }
}

export const readFileWatcher = createWatcher(
  readFileWorker,
  READ_FILE,
)


function* uplaodFileWorker( { payload } ) {
  try {
    const { readResult, googleData, share, data } = payload

    const walletId  = data.regularAccount.getWalletId().data.walletId
    let arr = []
    const newArray = []
    if ( readResult ) {
      arr = JSON.parse( readResult )
      console.log( 'arr', arr )
      if ( arr && arr.length ) {
        for ( let i = 0; i < arr.length; i++ ) {
          newArray.push( arr[ i ] )
        }
      }
      const index = newArray.findIndex( ( x ) => x.walletId == walletId )
      if ( index === -1 ) {
        const tempData = {
          levelStatus: data.levelStatus,
          walletName: data.walletName,
          questionId: data.questionId,
          question: data.question,
          walletId: walletId,
          data: data.encryptedCloudDataJson,
          shares: data.shares,
          keeperData: data.keeperData,
          dateTime: moment( new Date() ),
        }
        newArray.push( tempData )
      } else {
        newArray[ index ].questionId = data.questionId,
        newArray[ index ].question = data.question,
        newArray[ index ].levelStatus = data.levelStatus
        newArray[ index ].data = data.encryptedCloudDataJson
        newArray[ index ].shares = data.shares ? data.shares : newArray[ index ].shares
        newArray[ index ].keeperData = data.keeperData
        newArray[ index ].dateTime = moment( new Date() )
      }
      console.log( 'ARR', newArray )
      if ( Platform.OS == 'ios' ) {
        if( newArray.length ) {
          const result = yield call( iCloud.startBackup, JSON.stringify( newArray ) )
          return result
        }
        // console.log('Platform.OS share', share)
      } else {
        const metaData = {
          name: googleData.name,
          mimeType: googleData.mimeType,
          data: JSON.stringify( newArray ),
          id: googleData.id,
        }
        const result = yield call( GoogleDrive.updateFile, JSON.stringify( metaData )  )
        if ( result.eventName == 'successFullyUpdate' ) {
          return 'successFullyUpdate'
          //this.callBack( share )
        }
        else if( result.eventName == 'failure' ){
          throw new Error( result.eventName )
        }
        console.log( 'GoogleDrive.updateFile', result )
      }
    }

  } catch ( error ) {
    yield put( setIsFileReading( false ) )
    throw new Error( error )
  }
}

export const uplaodFileWatcher = createWatcher(
  uplaodFileWorker,
  UPLOAD_FILE,
)

