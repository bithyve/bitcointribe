import moment from 'moment'
import { NativeModules, Platform } from 'react-native'
import { call, put, select } from 'redux-saga/effects'
import { CloudData, getLevelInfo } from '../../common/CommonFunctions'
import { REGULAR_ACCOUNT, SECURE_ACCOUNT } from '../../common/constants/wallet-service-types'
import { UPDATE_HEALTH_FOR_CLOUD, SET_CLOUD_DATA, UPDATE_CLOUD_HEALTH, CHECK_CLOUD_BACKUP, UPDATE_DATA, CREATE_FILE, CHECK_IF_FILE_AVAILABLE, READ_FILE, UPLOAD_FILE, GOOGLE_DRIVE_LOGIN, setGoogleCloudLoginSuccess, GET_CLOUD_DATA_RECOVERY, setCloudDataRecovery, setIsCloudBackupUpdated, setIsCloudBackupSuccess, GOOGLE_LOGIN, setIsFileReading, setGoogleCloudLoginFailure, setCloudBackupStatus, setCloudBackupHistory, UPDATE_CLOUD_BACKUP } from '../actions/cloud'
import { putKeeperInfo, updatedKeeperInfo, updateMSharesHealth } from '../actions/health'
import { createWatcher } from '../utils/utilities'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { KeeperInfoInterface, LevelHealthInterface, LevelInfo, MetaShare, Wallet } from '../../bitcoin/utilities/Interface'
import S3Service from '../../bitcoin/services/sss/S3Service'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'

const GoogleDrive = NativeModules.GoogleDrive
const iCloud = NativeModules.iCloud

const saveConfirmationHistory = async ( title: string, cloudBackupHistory: any[] ) => {

  console.log( 'cloudBackupHistory', cloudBackupHistory )
  const obj ={
    title,
    confirmed: Date.now(),
    date: Date.now(),
  }
  const updatedCloudBackupHistory = cloudBackupHistory
  updatedCloudBackupHistory.push( obj )
  console.log( 'updatedCloudBackupHistory', updatedCloudBackupHistory )
  return updatedCloudBackupHistory
}


function* cloudWorker( { payload } ) {
  try{
    const cloudBackupStatus = yield select( ( state ) => state.cloud.cloudBackupStatus )
    if ( cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ) {
      const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
      const s3Service: S3Service = yield select( ( state ) => state.health.service )
      const MetaShares: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
      yield put( setCloudBackupStatus( CloudBackupStatus.IN_PROGRESS ) )
      const { kpInfo, level, share }: {kpInfo:any, level: any, share: LevelInfo} = payload
      const obj: KeeperInfoInterface = {
        shareId: share ? share.shareId : levelHealth[ 0 ].levelInfo[ 0 ].shareId,
        name: Platform.OS == 'ios' ? 'iCloud' : 'Google Drive',
        type: share ? share.shareType : levelHealth[ 0 ].levelInfo[ 0 ].shareType,
        scheme: MetaShares && MetaShares.length && MetaShares.find( value=> share ? value.shareId == share.shareId : value.shareId == levelHealth[ 0 ].levelInfo[ 0 ].shareId ).meta.scheme ? MetaShares.find( value=> share ? value.shareId == share.shareId : value.shareId == levelHealth[ 0 ].levelInfo[ 0 ].shareId ).meta.scheme : '1of1',
        currentLevel: level,
        createdAt: moment( new Date() ).valueOf(),
        sharePosition: MetaShares && MetaShares.length && MetaShares.findIndex( value=> share ? value.shareId == share.shareId : value.shareId == levelHealth[ 0 ].levelInfo[ 0 ].shareId ) ? MetaShares.findIndex( value=> share ? value.shareId == share.shareId : value.shareId == levelHealth[ 0 ].levelInfo[ 0 ].shareId ) : -1,
        data: {
        }
      }
      console.log( 'CLOUD obj', obj )
      const keeperInfo: KeeperInfoInterface[] = [ ...yield select( ( state ) => state.health.keeperInfo ) ]
      let flag = false
      for ( let i = 0; i < keeperInfo.length; i++ ) {
        const element = keeperInfo[ i ]
        if ( element.shareId != obj.shareId ) {
          flag = flag ? flag : false
          if( level == 1 && keeperInfo[ i ].scheme == '1of1' ) keeperInfo[ i ].currentLevel = level
          else if( level == 2 && keeperInfo[ i ].scheme == '2of3' ) keeperInfo[ i ].currentLevel = level
          else if( level == 3 && keeperInfo[ i ].scheme == '3of5' ) keeperInfo[ i ].currentLevel = level
        } else flag = true
      }
      if ( flag ) {
        keeperInfo.push( obj )
      }
      console.log( 'CLOUD keeperInfo', keeperInfo )
      yield put( putKeeperInfo( keeperInfo ) )
      const walletName = yield select( ( state ) => state.storage.database.WALLET_SETUP.walletName )
      const questionId = yield select( ( state ) => state.storage.database.WALLET_SETUP.security.questionId )
      const question = yield select( ( state ) => state.storage.database.WALLET_SETUP.security.question )
      const regularAccount = yield select( ( state ) => state.accounts[ REGULAR_ACCOUNT ].service )
      const database = yield select( ( state ) => state.storage.database )
      const accountShells = yield select( ( state ) => state.accounts.accountShells )
      const activePersonalNode = yield select( ( state ) => state.nodeSettings.activePersonalNode )
      const versionHistory = yield select( ( state ) => state.versionHistory.versions )
      const trustedContactsInfo = yield select( ( state ) => state.trustedContacts.trustedContactsInfo )
      const cloudBackupHistory = yield select( ( state ) => state.cloud.cloudBackupHistory )
      const { DECENTRALIZED_BACKUP } = yield select( ( state ) => state.storage.database )
      const wallet: Wallet = yield select(
        ( state ) => state.storage.wallet
      )

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
      const bhXpub = wallet.details2FA && wallet.details2FA.bithyveXpub ? wallet.details2FA.bithyveXpub : ''

      const data = {
        levelStatus: level ? level : 1,
        shares: shares,
        secondaryShare: DECENTRALIZED_BACKUP.SM_SHARE ? DECENTRALIZED_BACKUP.SM_SHARE : '',
        encryptedCloudDataJson: encryptedCloudDataJson,
        walletName: walletName,
        questionId: questionId,
        question: questionId === '0' ? question: '',
        regularAccount: regularAccount,
        keeperData: kpInfo ? JSON.stringify( kpInfo ) : JSON.stringify( keeperData ),
        bhXpub,
      }

      const isCloudBackupCompleted = yield call ( checkCloudBackupWorker, {
        payload: {
          data, share
        }
      } )

      if( isCloudBackupCompleted ) {
        yield put( setCloudBackupStatus( CloudBackupStatus.COMPLETED ) )
        yield call( updateHealthForCloudStatusWorker, {
          payload : {
            share
          }
        } )
        const title = Platform.OS == 'ios' ? 'iCloud backup confirmed' : 'GoogleDrive backup confirmed'
        const updatedCloudBackupHistory = yield call ( saveConfirmationHistory, title, cloudBackupHistory )
        console.log( 'updatedCloudBackupHistory******', updatedCloudBackupHistory )

        yield put( setCloudBackupHistory( updatedCloudBackupHistory ) )
      } else {
        const title = Platform.OS == 'ios' ? 'iCloud backup failed' : 'GoogleDrive backup failed'
        const updatedCloudBackupHistory = yield call ( saveConfirmationHistory, title, cloudBackupHistory )
        yield put( setCloudBackupHistory( updatedCloudBackupHistory ) )
        yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
      }

    }
  }
  catch ( error ) {
    yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
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
  }
  catch ( error ) {
    yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
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
        levelHealthVar.name = Platform.OS == 'ios' ? 'iCloud' : 'Google Drive'
      }
      const shareObj = {
        walletId: s3Service.getWalletId().data.walletId,
        shareId: levelHealthVar.shareId,
        reshareVersion: levelHealthVar.reshareVersion,
        updatedAt: moment( new Date() ).valueOf(),
        status: 'accessible',
        shareType: 'cloud',
        name: levelHealthVar.name
      }

      yield put( updateMSharesHealth( shareObj ) )
    }
  }
  catch ( error ) {
    yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
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
      console.log( 'backedJson getCloudBackupRecoveryWorker', backedJson )
      if( backedJson === 'failure' ) {
        yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
        return false
      }
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
    yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
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
      console.log( 'backedJson checkCloudBackupWorker', backedJson )
      if( backedJson === 'failure' ) return false
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
    yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
    yield put( setGoogleCloudLoginFailure( true ) )
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
    const walletId: string = yield select( ( state ) => state.storage.wallet.walletId )

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
          secondaryShare: data.secondaryShare,
          bhXpub: data.bhXpub
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
        newArray[ index ].secondaryShare = data.secondaryShare
        newArray[ index ].bhXpub = data.bhXpub
      }
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
    yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
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
    const walletId: string = yield select( ( state ) => state.storage.wallet.walletId )
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
      secondaryShare: data.secondaryShare,
      bhXpub: data.bhXpub
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
    yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
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
    yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
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
    yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
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
    const walletId: string = yield select( ( state ) => state.storage.wallet.walletId )
    let arr = []
    const newArray = []
    if ( readResult ) {
      arr = JSON.parse( readResult )
      // console.log( 'arr', arr )
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
          secondaryShare: data.secondaryShare,
          bhXpub: data.bhXpub
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
        newArray[ index ].secondaryShare = data.secondaryShare
        newArray[ index ].bhXpub = data.bhXpub
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
    yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
    yield put( setIsFileReading( false ) )
    throw new Error( error )
  }
}

export const uplaodFileWatcher = createWatcher(
  uplaodFileWorker,
  UPLOAD_FILE,
)

function* updateCloudBackupWorker( ) {
  try{
    const cloudBackupStatus = yield select( ( state ) => state.cloud.cloudBackupStatus )
    if ( cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ) {
      const levelHealth = yield select( ( state ) => state.health.levelHealth )
      const currentLevel = yield select( ( state ) => state.health.currentLevel )
      const s3Service = yield select( ( state ) => state.health.service )
      const keeperInfo = yield select( ( state ) => state.health.keeperInfo )

      let secretShare = {
      }
      if ( levelHealth.length > 0 ) {
        const levelInfo = getLevelInfo( levelHealth, currentLevel )
        if ( levelInfo ) {
          if (
            levelInfo[ 2 ] &&
            levelInfo[ 3 ] &&
            levelInfo[ 2 ].status == 'accessible' &&
            levelInfo[ 3 ].status == 'accessible'
          ) {
            for (
              let i = 0;
              i < s3Service.levelhealth.metaSharesKeeper.length;
              i++
            ) {
              const element = s3Service.levelhealth.metaSharesKeeper[ i ]
              if ( levelInfo[ 0 ].shareId == element.shareId ) {
                secretShare = element
                break
              }
            }
          }
        }
      }
      yield call( cloudWorker, {
        payload: {
          kpInfo: keeperInfo, level: currentLevel == 3 ? 3 : currentLevel + 1, share: secretShare
        }
      } )
    }
  }
  catch ( error ) {
    yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
  }
}

export const updateCloudBackupWatcher = createWatcher(
  updateCloudBackupWorker,
  UPDATE_CLOUD_BACKUP,
)
