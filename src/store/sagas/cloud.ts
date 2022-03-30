import moment from 'moment'
import { NativeModules, Platform } from 'react-native'
import { call, delay, put, select, race } from 'redux-saga/effects'
import { WIEncryption, getLevelInfo } from '../../common/CommonFunctions'
import { REGULAR_ACCOUNT, SECURE_ACCOUNT } from '../../common/constants/wallet-service-types'
import { UPDATE_HEALTH_FOR_CLOUD, setCloudErrorMessage, SET_CLOUD_DATA, UPDATE_CLOUD_HEALTH, CHECK_CLOUD_BACKUP, UPDATE_DATA, CREATE_FILE, CHECK_IF_FILE_AVAILABLE, READ_FILE, UPLOAD_FILE, GOOGLE_DRIVE_LOGIN, setGoogleCloudLoginSuccess, GET_CLOUD_DATA_RECOVERY, setCloudDataRecovery, setIsCloudBackupUpdated, setIsCloudBackupSuccess, GOOGLE_LOGIN, setIsFileReading, setGoogleCloudLoginFailure, setCloudBackupStatus, setCloudBackupHistory, UPDATE_CLOUD_BACKUP, setGoogleLoginCancelled } from '../actions/cloud'
import { putKeeperInfo, updatedKeeperInfo, updateMSharesHealth } from '../actions/BHR'
import { createWatcher } from '../utils/utilities'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { Accounts, KeeperInfoInterface, LevelHealthInterface, LevelInfo, MetaShare, Trusted_Contacts, Wallet } from '../../bitcoin/utilities/Interface'
import * as bip39 from 'bip39'
import { getiCloudErrorMessage, getGoogleDriveErrorMessage } from '../../utils/CloudErrorMessage'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import dbManager from '../../storage/realm/dbManager'
import idx from 'idx'
const GoogleDrive = NativeModules.GoogleDrive
const iCloud = NativeModules.iCloud

const saveConfirmationHistory = async ( title: string, cloudBackupHistory: any[] ) => {

  const obj = {
    title,
    confirmed: Date.now(),
    date: Date.now(),
  }
  const updatedCloudBackupHistory = [ ...cloudBackupHistory ]
  updatedCloudBackupHistory.push( obj )
  return updatedCloudBackupHistory
}


function* cloudWorker( { payload } ) {
  try{
    const cloudBackupStatus = yield select( ( state ) => state.cloud.cloudBackupStatus )
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.bhr.levelHealth )
    if( levelHealth.length == 0 ) return
    if ( cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS && levelHealth[ 0 ].levelInfo[ 0 ].status != 'notSetup' ) {
      const metaSharesKeeper = yield select( ( state ) => state.bhr.metaSharesKeeper )
      const MetaShares: MetaShare[] = [ ...metaSharesKeeper ]
      yield put( setCloudBackupStatus( CloudBackupStatus.IN_PROGRESS ) )
      const { kpInfo, level, share }: {kpInfo:any, level: any, share: LevelInfo} = payload
      console.log( 'CLOUD CALL PAYLOAD', payload )
      const index: number = MetaShares.findIndex( value=> share ? value.shareId == share.shareId : value.shareId == levelHealth[ 0 ].levelInfo[ 1 ].shareId ) !== null || MetaShares.findIndex( value=> share ? value.shareId == share.shareId : value.shareId == levelHealth[ 0 ].levelInfo[ 1 ].shareId ) !== undefined ? MetaShares.findIndex( value=> share ? value.shareId == share.shareId : value.shareId == levelHealth[ 0 ].levelInfo[ 1 ].shareId ) : null
      const RK: MetaShare = index != null && MetaShares.length ? MetaShares[ index ] : null
      const obj: KeeperInfoInterface = {
        shareId: share ? share.shareId : levelHealth[ 0 ].levelInfo[ 1 ].shareId,
        name: Platform.OS == 'ios' ? 'iCloud' : 'Google Drive',
        type: share ? share.shareType : 'cloud',
        scheme: MetaShares && MetaShares.length && RK && RK.meta.scheme ? RK.meta.scheme : '1of1',
        currentLevel: level,
        createdAt: moment( new Date() ).valueOf(),
        sharePosition: index != null ? index : -1,
        data: {
        }
      }
      const keeperInfo: KeeperInfoInterface[] = [ ...yield select( ( state ) => state.bhr.keeperInfo ) ]
      for ( let i = 0; i < keeperInfo.length; i++ ) {
        if( level == 1 && keeperInfo[ i ].scheme == '1of1' ) keeperInfo[ i ].currentLevel = level
        else if( level == 2 && keeperInfo[ i ].scheme == '2of3' ) keeperInfo[ i ].currentLevel = level
        else if( level == 3 && keeperInfo[ i ].scheme == '3of5' ) keeperInfo[ i ].currentLevel = level
      }
      if ( !keeperInfo.find( value=>value.shareId == obj.shareId ) ) {
        keeperInfo.push( obj )
      }
      yield put( putKeeperInfo( keeperInfo ) )
      const cloudBackupHistory = yield select( ( state ) => state.cloud.cloudBackupHistory )
      const wallet: Wallet = yield select(
        ( state ) => state.storage.wallet
      )
      const accountShells = yield select( ( state ) => state.accounts.accountShells )
      // const trustedContactsInfo = yield select( ( state ) => state.trustedContacts.trustedContactsInfo )
      const activePersonalNode = yield select( ( state ) => state.nodeSettings.activePersonalNode )

      const versionHistory = yield select(
        ( ( state ) => idx( state, ( _ ) => _.versionHistory.versions ) )
      )
      const restoreVersions = yield select(
        ( ( state ) => idx( state, ( _ ) => _.versionHistory.restoreVersions ) ) )

      // Create Updated Wallet Image
      const shares = RK ? JSON.stringify( RK ) : ''
      let encryptedCloudDataJson

      const trustedContacts: Trusted_Contacts = yield select(
        ( state ) => state.trustedContacts.contacts,
      )
      const accounts: Accounts = yield select( state => state.accounts.accounts )

      const encKey = BHROperations.getDerivedKey(
        bip39.mnemonicToSeedSync( wallet.primaryMnemonic ).toString( 'hex' ),
      )

      encryptedCloudDataJson = yield call( WIEncryption, accounts, encKey, trustedContacts, wallet,
        wallet.security.answer, accountShells,
        activePersonalNode,
        versionHistory,
        restoreVersions,
      )
      // console.log("encryptedCloudDataJson cloudWorker", encryptedCloudDataJson)
      const bhXpub = wallet.details2FA && wallet.details2FA.bithyveXpub ? wallet.details2FA.bithyveXpub : ''
      const { encryptedData } = BHROperations.encryptWithAnswer( wallet.primaryMnemonic, wallet.security.answer )
      const data = {
        levelStatus: level ? level : 1,
        shares: shares,
        secondaryShare: wallet.smShare ? wallet.smShare : '',
        encryptedCloudDataJson: encryptedCloudDataJson,
        seed: shares ? '' : encryptedData,
        walletName: wallet.walletName,
        questionId: wallet.security.questionId,
        question: wallet.security.questionId == '0' ? wallet.security.question: '',
        keeperData: JSON.stringify( keeperInfo ),
        bhXpub,
      }

      const { response, timeout } = yield race( {
        response: call( checkCloudBackupWorker, {
          payload: {
            data, share
          }
        } ),
        timeout: delay( 60000 )
      } )
      console.log( 'response', response )
      console.log( 'timeout', timeout )
      if ( !timeout ){
        const isCloudBackupCompleted = response

        if( typeof isCloudBackupCompleted === 'boolean' ) {
          const title = Platform.OS == 'ios' ? 'iCloud backup confirmed' : 'Google Drive backup confirmed'
          const updatedCloudBackupHistory = yield call ( saveConfirmationHistory, title, cloudBackupHistory )
          yield put( setCloudBackupHistory( updatedCloudBackupHistory ) )
          yield put( setCloudBackupStatus( CloudBackupStatus.COMPLETED ) )
          yield call( updateHealthForCloudStatusWorker, {
            payload : {
              share
            }
          } )

          if( isCloudBackupCompleted ) {
            const title = Platform.OS == 'ios' ? 'iCloud backup confirmed' : 'Google Drive backup confirmed'
            const updatedCloudBackupHistory = yield call ( saveConfirmationHistory, title, cloudBackupHistory )
            yield put( setCloudBackupHistory( updatedCloudBackupHistory ) )

            yield put( setCloudBackupStatus( CloudBackupStatus.COMPLETED ) )
            yield call( updateHealthForCloudStatusWorker, {
              payload : {
                share
              }
            } )
          } else {
            const title = Platform.OS == 'ios' ? 'iCloud backup failed' : 'Google Drive backup failed'
            const updatedCloudBackupHistory = yield call ( saveConfirmationHistory, title, cloudBackupHistory )
            yield put( setCloudBackupHistory( updatedCloudBackupHistory ) )
            yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
          }
        } else {
          if( isCloudBackupCompleted.status ) {
            const title = Platform.OS == 'ios' ? 'iCloud backup confirmed' : 'Google Drive backup confirmed'
            const updatedCloudBackupHistory = yield call ( saveConfirmationHistory, title, cloudBackupHistory )
            yield put( setCloudBackupHistory( updatedCloudBackupHistory ) )
            yield put( setCloudBackupStatus( CloudBackupStatus.COMPLETED ) )
            yield call( updateHealthForCloudStatusWorker, {
              payload : {
                share
              }
            } )
          } else {
            const title = Platform.OS == 'ios' ? 'iCloud backup failed' : 'Google Drive backup failed'
            const updatedCloudBackupHistory = yield call ( saveConfirmationHistory, title, cloudBackupHistory )
            yield put( setCloudBackupHistory( updatedCloudBackupHistory ) )
            yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
            yield delay( 200 )
            const message = Platform.OS == 'ios' ? `${getiCloudErrorMessage( isCloudBackupCompleted.errorCode )}` : 'Google Drive backup failed'
            yield put( setCloudErrorMessage( message ) )
          //Alert.alert( 'Error', message )
          }
        }
      } else{
        const title = Platform.OS == 'ios' ? 'iCloud backup failed' : 'Google Drive backup failed'
        const updatedCloudBackupHistory = yield call ( saveConfirmationHistory, title, cloudBackupHistory )
        yield put( setCloudBackupHistory( updatedCloudBackupHistory ) )
        yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
        yield delay( 200 )
        const message = Platform.OS == 'ios' ? `${getiCloudErrorMessage( '' )}` : 'Google Drive backup failed'
        yield put( setCloudErrorMessage( message ) )
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
  try {
    const currentLevel = yield select( ( state ) => state.bhr.currentLevel )
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
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.bhr.levelHealth )
    const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
    let levelHealthVar: LevelInfo = levelHealth[ 0 ].levelInfo[ 1 ]
    if (
      share &&
      !( Object.keys( share ).length === 0 && share.constructor === Object ) &&
      levelHealth.length > 0
    ) {
      levelHealthVar = levelHealth[ levelHealth.findIndex( value=>value.levelInfo.find( temp=>temp.shareId == share.shareId ) ) ].levelInfo[ 1 ]
    }
    if ( levelHealthVar.shareType == 'cloud' ) {
      levelHealthVar.updatedAt = moment( new Date() ).valueOf()
      levelHealthVar.status = 'accessible'
      levelHealthVar.reshareVersion = 0
      levelHealthVar.name = Platform.OS == 'ios' ? 'iCloud' : 'Google Drive'
    }
    const shareObj = {
      walletId: wallet.walletId,
      shareId: levelHealthVar.shareId,
      reshareVersion: levelHealthVar.reshareVersion,
      updatedAt: moment( new Date() ).valueOf(),
      status: 'accessible',
      shareType: 'cloud',
      name: levelHealthVar.name
    }
    yield put( updateMSharesHealth( shareObj ) )
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
    yield put( setCloudBackupStatus( CloudBackupStatus.IN_PROGRESS ) )
    if ( Platform.OS == 'ios' ) {
      const backed = yield call( iCloud.downloadBackup )
      const backedJson = backed !== '' ?  JSON.parse( backed ) : {
      }
      if( backedJson.errorCode ) {
        yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
        const message = Platform.OS == 'ios' ? `${getiCloudErrorMessage( backedJson.errorCode )}` : 'Google Drive backup failed'
        yield put( setCloudErrorMessage( message ) )
        // if( backedJson === 'failure' ) {
        //   yield put( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
        //   return false
        // }

      } else {
        if ( backed ) {
          yield put( setCloudDataRecovery( backed ) )
        }
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
    if ( Platform.OS == 'ios' ) {
      const backedJson = yield call( iCloud.downloadBackup )
      console.log( 'backedJson checkCloudBackupWorker', backedJson )
      const json = backedJson ? JSON.parse( backedJson ) : null
      if( backedJson && json && json.status ){
        return json
      }
      if ( backedJson ) {
        const isCloudBackupUpdated = yield call( updateDataWorker, {
          payload: {
            result1: backedJson,
            googleData: '',
            share: share,
            data
          }
        } )
        const res = JSON.parse( isCloudBackupUpdated )
        yield put( setIsCloudBackupUpdated( res.status ) )
        return res
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
    console.log( 'result', result )

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
            const message = getGoogleDriveErrorMessage( result.code )
            yield put( setCloudErrorMessage( message ) )
            yield put( setGoogleLoginCancelled( true ) )
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
            const message = getGoogleDriveErrorMessage( result.code )
            yield put( setCloudErrorMessage( message ) )
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
          seed: data.seed ? data.seed : '',
          shares: data.shares,
          keeperData: data.keeperData,
          dateTime: moment( new Date() ),
          secondaryShare: data.secondaryShare,
          bhXpub: data.bhXpub
        }
        newArray.push( tempData )
      } else {
        newArray[ index ].questionId = data.questionId
        newArray[ index ].question = data.question
        newArray[ index ].levelStatus = data.levelStatus
        newArray[ index ].data = data.encryptedCloudDataJson
        newArray[ index ].seed = data.seed ? data.seed : '',
        newArray[ index ].shares = data.shares ? data.shares : newArray[ index ].shares
        newArray[ index ].keeperData = data.keeperData
        newArray[ index ].dateTime = moment( new Date() )
        newArray[ index ].secondaryShare = data.secondaryShare
        newArray[ index ].bhXpub = data.bhXpub
        newArray[ index ].walletName = data.walletName
      }
      if ( Platform.OS == 'ios' ) {
        if( newArray.length ) {
          const result = yield call( iCloud.startBackup, JSON.stringify( newArray )  )
          console.log( 'startBackup result', result )
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
      console.log( 'Google Drive.updateFile result', result )
      if ( result.eventName == 'successFullyUpdate' ) {
        return 'successFullyUpdate'
        //this.callBack( share )
      }
      else if( result.eventName == 'failure' ){
        const message = getGoogleDriveErrorMessage( result.code )
        yield put( setCloudErrorMessage( message ) )
        throw new Error( result.eventName )
      }
      console.log( 'Google Drive.updateFile', result )

    }
    console.log( 'newArray', newArray )
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
      seed: data.seed ? data.seed : '',
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
        const message = getGoogleDriveErrorMessage( result.code )
        yield put( setCloudErrorMessage( message ) )
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
          seed: data.seed ? data.seed : '',
          shares: data.shares,
          keeperData: data.keeperData,
          dateTime: moment( new Date() ),
          secondaryShare: data.secondaryShare,
          bhXpub: data.bhXpub
        }
        newArray.push( tempData )
      } else {
        newArray[ index ].questionId = data.questionId
        newArray[ index ].question = data.question
        newArray[ index ].levelStatus = data.levelStatus
        newArray[ index ].data = data.encryptedCloudDataJson
        newArray[ index ].seed = data.seed ? data.seed : '',
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
          const message = getGoogleDriveErrorMessage( result.code )
          yield put( setCloudErrorMessage( message ) )
          throw new Error( result.eventName )
        }
        console.log( 'Google Drive.updateFile', result )
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

export function* updateCloudBackupWorker( ) {
  try{
    const cloudBackupStatus = yield select( ( state ) => state.cloud.cloudBackupStatus )
    if ( cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS ) {
      const levelHealth = yield select( ( state ) => state.bhr.levelHealth )
      let currentLevel = yield select( ( state ) => state.bhr.currentLevel )
      const keeperInfo = yield select( ( state ) => state.bhr.keeperInfo )
      let share = levelHealth[ 0 ].levelInfo[ 1 ]
      if( levelHealth[ 0 ] && !levelHealth[ 1 ] ){
        share = levelHealth[ 0 ].levelInfo[ 1 ]
      } else if( levelHealth[ 0 ] && levelHealth[ 1 ] ){
        if( levelHealth[ 1 ].levelInfo.length == 4 && levelHealth[ 1 ].levelInfo[ 2 ].updatedAt > 0 && levelHealth[ 1 ].levelInfo[ 3 ].updatedAt > 0 ){
          share = levelHealth[ 1 ].levelInfo[ 1 ]
          currentLevel = 2
        } else if( levelHealth[ 1 ].levelInfo.length == 6 && levelHealth[ 1 ].levelInfo[ 2 ].updatedAt > 0 && levelHealth[ 1 ].levelInfo[ 3 ].updatedAt > 0 && levelHealth[ 1 ].levelInfo[ 4 ].updatedAt > 0 && levelHealth[ 1 ].levelInfo[ 5 ].updatedAt > 0 ){
          share = levelHealth[ 1 ].levelInfo[ 1 ]
          currentLevel = 3
        }
      }
      if( levelHealth[ 0 ].levelInfo[ 0 ].status != 'notSetup' ){
        yield call( cloudWorker, {
          payload: {
            kpInfo: keeperInfo, level: currentLevel === 0 ? currentLevel + 1 : currentLevel, share
          }
        } )
      }
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
