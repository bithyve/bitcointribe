import { call, fork, put, select } from 'redux-saga/effects'
import {
  createWatcher,
  requestTimedout,
  serviceGeneratorForNewBHR,
} from '../utils/utilities'
import * as bip39 from 'bip39'
import {
  INIT_HEALTH_SETUP,
  CHECK_SHARES_HEALTH,
  UPDATE_SHARES_HEALTH,
  updateLevelTwoMetaShareStatus,
  updateLevelThreeMetaShareStatus,
  INIT_LEVEL_TWO,
  initLevelTwo,
  checkMSharesHealth,
  isLevel2InitializedStatus,
  updateMSharesHealth,
  updatedKeeperInfo,
  walletRecoveryFailed,
  RECOVER_WALLET_USING_ICLOUD,
  walletImageChecked,
  DOWNLOAD_MSHARE_HEALTH,
  ErrorReceiving,
  fetchWalletImage,
  RECOVER_WALLET_HEALTH,
  CLOUD_MSHARE,
  FETCH_WALLET_IMAGE_HEALTH,
  switchS3LoaderKeeper,
  isLevel3InitializedStatus,
  GENERATE_PDF,
  pdfGenerated,
  RECOVER_MNEMONIC_HEALTH,
  mnemonicRecoveredHealth,
  GET_PDF_DATA,
  setPDFInfo,
  SHARE_PDF,
  CONFIRM_PDF_SHARED,
  KEEPER_INFO,
  putKeeperInfo,
  UPDATE_WALLET_IMAGE_HEALTH,
  EMPTY_SHARE_TRANSFER_DETAILS,
  removeUnwantedUnderCustodyShares,
  REMOVE_UNWANTED_UNDER_CUSTODY,
  GENERATE_SM_META_SHARE,
  isSmMetaSharesCreated,
  UploadSMSuccessfully,
  DELETE_SM_AND_SMSHARES,
  AUTO_SHARE_LEVEL2_KEEPER,
  pdfSuccessfullyCreated,
  SET_LEVEL_TO_NOT_SETUP,
  setIsLevelToNotSetupStatus,
  SET_HEALTH_STATUS,
  MODIFY_LEVELDATA,
  updateLevelData,
  setChannelAssets,
  CREATE_CHANNEL_ASSETS,
  setApprovalStatus,
  DOWNLOAD_SM_SHARE,
  secondaryShareDownloaded,
  downloadSMShare,
  CREATE_OR_CHANGE_GUARDIAN,
  createChannelAssets,
  setDownloadedBackupData,
  DOWNLOAD_BACKUP_DATA,
  SETUP_HEALTH_FOR_RESTORE,
  setupHealth,
  UPDATE_KEEPER_INFO_TO_CHANNEL,
  setIsKeeperInfoUpdated,
  ACCEPT_EC_REQUEST,
  SETUP_PASSWORD,
  initializeHealthSetup,
  SETUP_LEVEL_HEALTH
} from '../actions/health'
import S3Service from '../../bitcoin/services/sss/S3Service'
import { updateHealth } from '../actions/health'
import {
  switchS3LoadingStatus,
  healthCheckInitialized,
  GENERATE_META_SHARE,
} from '../actions/health'
import { insertDBWorker } from './storage'
import { NativeModules, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import DeviceInfo from 'react-native-device-info'
import config from '../../bitcoin/HexaConfig'
import {
  SECURE_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import {
  BackupStreamData,
  ContactDetails,
  INotification,
  KeeperInfoInterface,
  LevelData,
  LevelHealthInterface,
  LevelInfo,
  MetaShare,
  notificationTag,
  notificationType,
  PrimaryStreamData,
  QRCodeTypes,
  SecondaryStreamData,
  StreamData,
  TrustedContact,
  TrustedContactRelationTypes,
  Trusted_Contacts,
  UnecryptedStreamData,
  VersionHistory,
  Wallet,
  WalletImage,
  NewWalletImage,
  cloudDataInterface
} from '../../bitcoin/utilities/Interface'
import LevelHealth from '../../bitcoin/utilities/LevelHealth/LevelHealth'
import moment from 'moment'
import crypto from 'crypto'
import { Alert } from 'react-native'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import generatePDFKeeper from '../utils/generatePDFKeeper'
import { generateRandomString } from '../../common/CommonFunctions'
import Mailer from 'react-native-mail'
import Share from 'react-native-share'
import RNPrint from 'react-native-print'
import idx from 'idx'
import AccountShell from '../../common/data/models/AccountShell'
import { remapAccountShells, restoreAccountShells } from '../actions/accounts'
import PersonalNode from '../../common/data/models/PersonalNode'
import { personalNodeConfigurationSet } from '../actions/nodeSettings'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import { restoredVersionHistory } from '../actions/versionHistory'
import { getVersions } from '../../common/utilities'
import { initLevels } from '../actions/upgradeToNewBhr'
import { checkLevelHealth, getLevelInfoStatus, getModifiedData } from '../../common/utilities'
import TrustedContacts from '../../bitcoin/utilities/TrustedContacts'
import { ChannelAssets } from '../../bitcoin/utilities/Interface'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'
import { initializeTrustedContact, InitTrustedContactFlowKind, PermanentChannelsSyncKind, restoreContacts, restoreTrustedContacts, syncPermanentChannels } from '../actions/trustedContacts'
import { syncPermanentChannelsWorker } from '../sagas/trustedContacts'

import SSS from '../../bitcoin/utilities/sss/SSS'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import Relay from '../../bitcoin/utilities/Relay'
import { updateWallet } from '../actions/storage'
import dbManager from '../../storage/realm/dbManager'
import { setWalletId } from '../actions/preferences'
import BHROperations from '../../bitcoin/utilities/BHROperations'

function* initHealthWorker() {
  const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
  const wallet: Wallet = yield select(
    ( state ) => state.storage.wallet
  )
  const { security } = wallet
  if ( levelHealth && levelHealth.length ) return
  yield put( switchS3LoaderKeeper( 'initLoader' ) )
  const randomIdForSecurityQ = generateRandomString( 8 )
  const randomIdForCloud = generateRandomString( 8 )
  const levelInfo = [
    {
      shareType: 'securityQuestion',
      updatedAt: security && security.answer ? moment( new Date() ).valueOf() : 0,
      status: security && security.answer ? 'accessible' : 'notSetup',
      shareId: randomIdForSecurityQ,
      reshareVersion: 0,
      name: security && security.answer ? 'Encryption Password' : 'Set Password',
    },
    {
      shareType: 'cloud',
      updatedAt: 0,
      status: 'notSetup',
      shareId: randomIdForCloud,
      reshareVersion: 0,
    },
  ]
  const obj: KeeperInfoInterface = {
    shareId: randomIdForSecurityQ,
    name: security && security.answer ? 'Encryption Password' : 'Set Password',
    type: 'securityQuestion',
    scheme: '1of1',
    currentLevel: 0,
    createdAt: moment( new Date() ).valueOf(),
    sharePosition: null,
    data: {
    }
  }
  yield put( updatedKeeperInfo( obj ) )
  // Update status
  yield put( healthCheckInitialized() )
  // Update Initial Health to reducer
  yield put( updateHealth( [ {
    level: 1,
    levelInfo: levelInfo,
  } ], 0, 'checkSharesHealthWatcher' ) )
  yield put( switchS3LoaderKeeper( 'initLoader' ) )
  yield call( modifyLevelDataWorker )
}

export const initHealthWatcher = createWatcher(
  initHealthWorker,
  INIT_HEALTH_SETUP
)

function* generateMetaSharesWorker( { payload } ) {
  const s3Service: S3Service = yield select( ( state ) => state.health.service )
  const { walletName } = yield select(
    ( state ) => state.storage.wallet
  )
  const appVersion = DeviceInfo.getVersion()
  const { level, SM, isUpgrade } = payload
  const { answer, questionId, question } = yield select(
    ( state ) => state.storage.wallet.security
  )
  const wallet: Wallet = yield select(
    ( state ) => state.storage.wallet
  )
  const secondaryMnemonic = SM && SM ? SM : wallet.secondaryMnemonic ? wallet.secondaryMnemonic : ''

  const secureAssets = {
    secondaryMnemonic: secondaryMnemonic,
    twoFASecret: '',
    secondaryXpub: '',
    bhXpub: wallet.details2FA && wallet.details2FA.bithyveXpub ? wallet.details2FA.bithyveXpub : '',
  }

  let serviceCall = null
  if ( level == 2 ) {
    serviceCall = s3Service.generateLevel1Shares
  } else if ( level == 3 ) {
    serviceCall = s3Service.generateLevel2Shares
  }
  if ( serviceCall != null ) {
    const res = yield call(
      serviceCall,
      secureAssets,
      answer,
      walletName,
      questionId,
      appVersion,
      questionId === '0' ? question: '',
      level
    )
    if ( res.status === 200 ) {
      if ( level == 2 ) {
        const isLevel2Initialized = yield select(
          ( state ) => state.health.isLevel2Initialized
        )
        if ( !isLevel2Initialized ) {
          yield put( updateLevelTwoMetaShareStatus( true ) )
          if( isUpgrade ) yield put( initLevels( level ) )
          else yield put( initLevelTwo( level ) )
        }
      }
      if ( level == 3 ) {
        const isLevel3Initialized = yield select(
          ( state ) => state.health.isLevel3Initialized
        )
        if ( !isLevel3Initialized ) {
          yield put( updateLevelThreeMetaShareStatus( true ) )
          if( isUpgrade ) yield put( initLevels( level ) )
          else yield put( initLevelTwo( level ) )
        }
      }

      const { SERVICES, DECENTRALIZED_BACKUP } = yield select( ( state ) => state.storage.database )
      const updatedSERVICES = {
        ...SERVICES,
        S3_SERVICE: JSON.stringify( s3Service ),
      }
      if( level == 2 ) {
        const updatedDECENTRALIZED_BACKUP = {
          ...DECENTRALIZED_BACKUP,
          SM_SHARE: res.data.encryptedSMSecrets[ 0 ]
        }
        dbManager.updateWallet( {
          smShare: res.data.encryptedSMSecrets[ 0 ]
        } )
        yield call( insertDBWorker, {
          payload: {
            SERVICES: updatedSERVICES, DECENTRALIZED_BACKUP: updatedDECENTRALIZED_BACKUP
          }
        } )
      } else  if( level == 3 ) {
        yield call( insertDBWorker, {
          payload: {
            SERVICES: updatedSERVICES
          }
        } )
      }
    } else {
      if ( res.err === 'ECONNABORTED' ) requestTimedout()
      throw new Error( res.err )
    }
  }
}

export const generateMetaSharesWatcher = createWatcher(
  generateMetaSharesWorker,
  GENERATE_META_SHARE
)

function* checkSharesHealthWorker() {
  try {
    yield put( switchS3LoadingStatus( true ) )
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const res = yield call( s3Service.checkHealthKeeper )
    if ( res.status === 200 ) {
      yield put( updateHealth( res.data.levels, res.data.currentLevel, 'checkSharesHealthWatcher' ) )
    } else {
      if ( res.err === 'ECONNABORTED' ) requestTimedout()
    }
    yield put( switchS3LoadingStatus( false ) )
  } catch ( error ) {
    console.log( 'error', error )
  }
}

export const checkSharesHealthWatcher = createWatcher(
  checkSharesHealthWorker,
  CHECK_SHARES_HEALTH
)

function* updateSharesHealthWorker( { payload } ) {
  console.log( 'UPDATE SHARE started', payload )
  // // set a timelapse for auto update and enable instantaneous manual update
  try {
    yield put( switchS3LoaderKeeper( 'updateMSharesHealth' ) )
    payload.shares
    let currentLevel = yield select( ( state ) => state.health.currentLevel )
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    for ( let i = 0; i < levelHealth.length; i++ ) {
      const levelInfo = levelHealth[ i ].levelInfo
      for ( let j = 0; j < levelInfo.length; j++ ) {
        const element = levelInfo[ j ]
        if( element.shareId === payload.shares.shareId ){
          levelHealth[ i ].levelInfo[ j ].updatedAt = payload.shares.updatedAt ? moment( new Date() ).valueOf() : levelHealth[ i ].levelInfo[ j ].updatedAt
          levelHealth[ i ].levelInfo[ j ].name = payload.shares.name ? payload.shares.name : levelHealth[ i ].levelInfo[ j ].name ? levelHealth[ i ].levelInfo[ j ].name : ''
          levelHealth[ i ].levelInfo[ j ].reshareVersion = payload.shares.reshareVersion ? payload.shares.reshareVersion : levelHealth[ i ].levelInfo[ j ].reshareVersion ? levelHealth[ i ].levelInfo[ j ].reshareVersion : 0
          levelHealth[ i ].levelInfo[ j ].shareType = payload.shares.shareType ? payload.shares.shareType : levelHealth[ i ].levelInfo[ j ].shareType ? levelHealth[ i ].levelInfo[ j ].shareType : ''
          if( payload.shares.status ){
            levelHealth[ i ].levelInfo[ j ].status = payload.shares.status
          }
          break
        }
      }
    }
    const tempLevelHealth = []
    const levelHealthForCurrentLevel = []
    levelHealthForCurrentLevel[ 0 ] = levelHealth[ 0 ]
    if( levelHealth[ 0 ] && levelHealth[ 1 ] ) {
      if( levelHealth[ 1 ].levelInfo.findIndex( value=>value.updatedAt == 0 ) == -1 ) {
        tempLevelHealth[ 0 ] = levelHealth[ 1 ]
        levelHealthForCurrentLevel[ 0 ] = levelHealth[ 1 ]
      }
    }
    if( levelHealthForCurrentLevel[ 0 ].levelInfo.findIndex( value=>value.updatedAt == 0 ) == -1 ) {
      if( levelHealthForCurrentLevel[ 0 ].levelInfo.length == 6 ) currentLevel = 3
      else if( levelHealthForCurrentLevel[ 0 ].levelInfo.length == 4 ) currentLevel = 2
      else currentLevel = 1
    }

    yield put(
      updateHealth(
        tempLevelHealth.length ? tempLevelHealth : levelHealth,
        currentLevel,
        'updateSharesHealthWatcher'
      )
    )
    yield put( switchS3LoaderKeeper( 'updateMSharesHealth' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'updateMSharesHealth' ) )
    console.log( 'inside UPDATE_SHARES_HEALTH', error )
  }
}

export const updateSharesHealthWatcher = createWatcher(
  updateSharesHealthWorker,
  UPDATE_SHARES_HEALTH
)

function* updateHealthLevel2Worker( { payload } ) {
  const { level } = payload
  let isLevelInitialized = yield select(
    ( state ) => state.health.isLevel3Initialized
  )
  if ( level == 2 ) {
    isLevelInitialized = yield select(
      ( state ) => state.health.isLevel2Initialized
    )
  }
  if ( !isLevelInitialized ) {
    yield put( switchS3LoaderKeeper( 'initLoader' ) )
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const metaShares: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
    const Health: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    const wallet: Wallet = yield select(
      ( state ) => state.storage.wallet
    )
    const { security } = wallet
    const levelHealth: LevelHealthInterface[] = [ ...Health ]
    console.log( 'INIT_LEVEL_TWO levelHealth', levelHealth )
    let SecurityQuestionHealth
    const randomIdForSecurityQ = generateRandomString( 8 )
    if( Health[ 0 ] && Health[ 0 ].levelInfo && Health[ 0 ].levelInfo[ 0 ] ){
      SecurityQuestionHealth = {
        ...Health[ 0 ].levelInfo[ 0 ], shareId: randomIdForSecurityQ,
      }
    }
    else {
      SecurityQuestionHealth = {
        shareType: 'securityQuestion',
        updatedAt: security && security.answer ? moment( new Date() ).valueOf() : 0,
        status: security && security.answer ? 'accessible' : 'notSetup',
        shareId: randomIdForSecurityQ,
        reshareVersion: 0,
        name: security && security.answer ? 'Encryption Password' : 'Set Password',
      }
    }
    const levelInfo = []
    levelInfo[ 1 ] = {
      shareType: 'cloud',
      updatedAt: 0,
      status: 'notSetup',
      shareId: metaShares[ 0 ].shareId,
      reshareVersion: 0,
    }
    levelInfo[ 0 ] = SecurityQuestionHealth
    for ( let i = 1; i < metaShares.length; i++ ) {
      const element = metaShares[ i ]
      let shareType = ''
      if ( i == 1 ) shareType = 'cloud'
      const obj = {
        shareType: shareType,
        updatedAt: 0,
        status: 'notSetup',
        shareId: element.shareId,
        reshareVersion: 0,
      }
      levelInfo.push( obj )
    }
    levelHealth.push( {
      levelInfo, level
    } )
    console.log( 'INIT_LEVEL_TWO levelHealth', levelHealth )
    yield put( updateHealth( levelHealth, currentLevel, 'updateHealthLevel2Watcher' ) )
    if ( level == 2 ) yield put( isLevel2InitializedStatus() )
    if ( level == 3 ) yield put( isLevel3InitializedStatus() )
    yield put( switchS3LoaderKeeper( 'initLoader' ) )
  }
}

export const updateHealthLevel2Watcher = createWatcher(
  updateHealthLevel2Worker,
  INIT_LEVEL_TWO
)

const sha256 = crypto.createHash( 'sha256' )
const hash = ( element ) => {
  return sha256.update( JSON.stringify( element ) ).digest( 'hex' )
}

function* recoverWalletFromIcloudWorker( { payload } ) {
  try {
    yield put( switchS3LoadingStatus( 'restoreWallet' ) )
    const { icloudData, selectedBackup, answer }: { icloudData: NewWalletImage, selectedBackup: cloudDataInterface, answer: string } = payload
    console.log( 'payload.icloudData', payload.icloudData )
    console.log( 'payload.selectedBackup', payload.selectedBackup )
    console.log( 'payload.answer', payload.answer )
    const primaryMnemonic = LevelHealth.decryptWithAnswer ( selectedBackup.seed, answer ).decryptedString
    const secondaryMnemonics = LevelHealth.decryptWithAnswer ( selectedBackup.secondaryShare, answer ).decryptedString
    const image: NewWalletImage = icloudData
    yield call( recoverWalletWorker, {
      payload: {
        level: selectedBackup.levelStatus, answer, selectedBackup, image, primaryMnemonic, secondaryMnemonics
      }
    } )
    yield put( switchS3LoadingStatus( 'restoreWallet' ) )
  } catch ( err ) {
    yield put( switchS3LoadingStatus( 'restoreWallet' ) )
    console.log( {
      err: err.message
    } )
    yield put( walletRecoveryFailed( true ) )
    // Alert.alert('Wallet recovery failed!', err.message);
  }
  yield put( switchS3LoadingStatus( 'restoreWallet' ) )
}

export const recoverWalletFromIcloudWatcher = createWatcher(
  recoverWalletFromIcloudWorker,
  RECOVER_WALLET_USING_ICLOUD
)

export function* downloadMetaShareWorker( { payload } ) {
  console.log( 'downloadMetaShareWorker payload', payload )
  yield put( switchS3LoadingStatus( 'downloadMetaShare' ) )

  const { encryptedKey, otp, walletName, walletID } = payload // OTP is missing when the encryptedKey isn't OTP encrypted
  const s3Service: S3Service = yield select( ( state ) => state.health.service )

  const { DECENTRALIZED_BACKUP } = yield select(
    ( state ) => state.storage.database
  )

  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP

  let res
  if ( payload.downloadType !== 'recovery' ) {
    let existingShares = []
    if ( Object.keys( UNDER_CUSTODY ).length ) {
      existingShares = Object.keys( UNDER_CUSTODY ).map(
        ( tag ) => UNDER_CUSTODY[ tag ].META_SHARE
      )
    }

    res = yield call(
      S3Service.downloadAndValidateShare,
      encryptedKey,
      otp,
      existingShares,
      s3Service.levelhealth.walletId
    )
  } else {
    res = yield call( S3Service.downloadAndValidateShare, encryptedKey, otp )
  }

  const pkShare = {
  }
  let result
  // if ( DECENTRALIZED_BACKUP && payload.downloadType !== 'recovery' ) {
  //   result = yield call( S3Service.downloadSMShare, encryptedKey, otp )
  //   console.log( 'result', result )
  //   if ( result && result.data ) {
  //     pkShare = result.data.metaShare
  //   }
  // }


  if ( res.status === 200 ) {
    const { metaShare, encryptedDynamicNonPMDD } = res.data
    let updatedBackup
    if ( payload.downloadType !== 'recovery' ) {
      updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        UNDER_CUSTODY: {
          ...DECENTRALIZED_BACKUP.UNDER_CUSTODY,
          [ metaShare.meta.tag ]: {
            META_SHARE: metaShare,
            ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
            SECONDARY_SHARE: pkShare
          },
        },
      }

      console.log( {
        updatedBackup
      } )
      yield call( insertDBWorker, {
        payload: {
          DECENTRALIZED_BACKUP: updatedBackup,
        },
      } )

      if ( payload.downloadType !== 'recovery' ) {
        const shareObj = {
          walletId: walletID,
          shareId: metaShare.shareId,
          reshareVersion: metaShare.meta.reshareVersion,
          updatedAt: moment( new Date() ).valueOf(),
          status: 'accessible',
        }
        yield put( updateMSharesHealth( shareObj, false ) )
      }
      // yield call(updateDynamicNonPMDDWorker, { payload: { dynamicNonPMDD } }); // upload updated dynamic nonPMDD (TODO: time-based?)
      //yield put(updateMSharesHealth());
    } else {
      let updatedRecoveryShares = {
      }
      //let updated = false;
      if ( payload.replaceIndex === 0 || payload.replaceIndex ) {
        // replacing stored key w/ scanned from Guardian's help-restore
        updatedRecoveryShares = {
          ...DECENTRALIZED_BACKUP.RECOVERY_SHARES,
          [ payload.replaceIndex ]: {
            REQUEST_DETAILS: {
              KEY: encryptedKey
            },
            META_SHARE: metaShare,
            ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
          },
        }
      } else {
        Object.keys( DECENTRALIZED_BACKUP.RECOVERY_SHARES ).forEach(
          ( objectKey ) => {
            const recoveryShare =
              DECENTRALIZED_BACKUP.RECOVERY_SHARES[ objectKey ]
            console.log( 'recoveryShare', recoveryShare, objectKey )
            if (
              recoveryShare.REQUEST_DETAILS &&
              recoveryShare.REQUEST_DETAILS.KEY === encryptedKey
            ) {
              updatedRecoveryShares[ objectKey ] = {
                REQUEST_DETAILS: recoveryShare.REQUEST_DETAILS,
                META_SHARE: metaShare,
                ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
              }
              // updated = true;
            } else {
              updatedRecoveryShares[ objectKey ] = recoveryShare
            }
          }
        )
      }
      console.log( 'updatedRecoveryShares', updatedRecoveryShares )
      updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        RECOVERY_SHARES: updatedRecoveryShares,
      }
      console.log( 'updatedBackup', updatedBackup )
      yield call( insertDBWorker, {
        payload: {
          DECENTRALIZED_BACKUP: updatedBackup
        },
      } )
    }
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    console.log( {
      res
    } )
    yield put( ErrorReceiving( true ) )
    // Alert.alert('Download Failed!', res.err);
  }
  yield put( switchS3LoadingStatus( 'downloadMetaShare' ) )
}

export const downloadMetaShareHealthWatcher = createWatcher(
  downloadMetaShareWorker,
  DOWNLOAD_MSHARE_HEALTH
)

function* recoverWalletWorker( { payload } ) {
  yield put( switchS3LoadingStatus( 'restoreWallet' ) )
  let { level, answer, selectedBackup, image, primaryMnemonic, secondaryMnemonics, shares }: { level: number, answer: string, selectedBackup: cloudDataInterface, image: NewWalletImage, primaryMnemonic?: string, secondaryMnemonics?: string, shares?: {
    primaryData?: PrimaryStreamData;
    backupData?: BackupStreamData;
    secondaryData?: SecondaryStreamData;
  }[] } = payload
  try {
    if( shares ){
      const pmShares = []
      const smShares = []
      for ( let i = 0; i < shares.length; i++ ) {
        const element = shares[ i ]
        pmShares.push( element.backupData.primaryMnemonicShard.encryptedShare.pmShare )
        smShares.push( element.secondaryData.secondaryMnemonicShard )
      }
      secondaryMnemonics = LevelHealth.getMnemonics( smShares, answer ).mnemonic
      primaryMnemonic = LevelHealth.getMnemonics( pmShares, answer, true ).mnemonic
    }

    const getWI = yield call( S3Service.fetchWalletImage, image.walletId )
    if( getWI.status == 200 ) {
      image = getWI.data.walletImage
    }

    const contactsChannelKeys = image.contacts
    const accounts = image.accounts
    const acc = []
    const accountData = {
    }
    const decKey = LevelHealth.getDerivedKey(
      bip39.mnemonicToSeedSync( primaryMnemonic ).toString( 'hex' ),
    )
    Object.keys( accounts ).forEach( ( key ) => {
      const decipher = crypto.createDecipheriv(
        LevelHealth.cipherSpec.algorithm,
        decKey,
        LevelHealth.cipherSpec.iv,
      )
      const account = accounts[ key ]
      let decryptedAccData = decipher.update( account.encryptedData, 'hex', 'utf8' )
      decryptedAccData += decipher.final( 'utf8' )
      accountData[ JSON.parse( decryptedAccData ).type ] = JSON.parse( decryptedAccData ).id
      acc.push( JSON.parse( decryptedAccData ) )
    } )
    // restore Accounts
    yield put( restoreAccountShells( acc ) )

    // Update Wallet
    const wallet: Wallet = {
      walletId: image.walletId,
      walletName: image.name,
      security: {
        question: selectedBackup.question,
        questionId: selectedBackup.questionId,
        answer: answer
      },
      primaryMnemonic: primaryMnemonic,
      accounts: accountData,
      version: DeviceInfo.getVersion(),
      secondaryMnemonic: secondaryMnemonics,
    }
    yield put( updateWallet( wallet ) )
    yield put( setWalletId( wallet.walletId ) )
    yield call( setupLevelHealthWorker, {
      payload: {
        level: level, keeperInfo: JSON.parse( selectedBackup.keeperData )
      }
    } )
    // restore Contacts
    yield put( restoreTrustedContacts( {
      walletId: wallet.walletId, channelKeys: contactsChannelKeys
    } ) )
    yield put( switchS3LoadingStatus( 'restoreWallet' ) )
  } catch ( err ) {
    console.log( {
      err: err.message
    } )
    yield put( switchS3LoadingStatus( 'restoreWallet' ) )
    yield put( walletRecoveryFailed( true ) )
  }


}

export const recoverWalletHealthWatcher = createWatcher(
  recoverWalletWorker,
  RECOVER_WALLET_HEALTH
)

export function* cloudMetaShareWorker( { payload } ) {
  yield put( switchS3LoadingStatus( 'downloadMetaShare' ) )

  const { metaShare } = payload

  const { DECENTRALIZED_BACKUP } = yield select(
    ( state ) => state.storage.database
  )

  let updatedBackup
  console.log( 'PAYLOAD', payload )
  let updatedRecoveryShares = {
  }
  const updated = false
  console.log( 'INSIDE ELSE' )
  if ( payload.replaceIndex === 0 || payload.replaceIndex ) {
    // replacing stored key w/ scanned from Guardian's help-restore
    updatedRecoveryShares = {
      ...DECENTRALIZED_BACKUP.RECOVERY_SHARES,
      [ payload.replaceIndex ]: {
        //REQUEST_DETAILS: { KEY: encryptedKey },
        META_SHARE: metaShare,
        //ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
      },
    }
  }
  console.log( 'updatedRecoveryShares', updatedRecoveryShares )
  updatedBackup = {
    ...DECENTRALIZED_BACKUP,
    RECOVERY_SHARES: updatedRecoveryShares,
  }
  console.log( 'updatedBackup', updatedBackup )
  let InsertDBData
  // if(payload.walletImage.SERVICES){
  //   InsertDBData = { DECENTRALIZED_BACKUP: updatedBackup, SERVICES: payload.walletImage.SERVICES}
  // }
  // else{
  InsertDBData = {
    DECENTRALIZED_BACKUP: updatedBackup
  }
  // }
  console.log( 'InsertDBData', InsertDBData )

  yield call( insertDBWorker, {
    payload: InsertDBData,
  } )

  yield put( switchS3LoadingStatus( 'downloadMetaShare' ) )
}

export const cloudMetaShareHealthWatcher = createWatcher(
  cloudMetaShareWorker,
  CLOUD_MSHARE
)


function* stateDataToBackup() {
  // state data to backup
  const accountShells = yield select( ( state ) => state.accounts.accountShells )
  // const trustedContactsInfo = yield select( ( state ) => state.trustedContacts.trustedContactsInfo )
  const activePersonalNode = yield select( ( state ) => state.nodeSettings.activePersonalNode )

  const versionHistory = yield select(
    ( ( state ) => idx( state, ( _ ) => _.versionHistory.versions ) )
  )
  const restoreVersions = yield select(
    ( ( state ) => idx( state, ( _ ) => _.versionHistory.restoreVersions ) ) )

  const versions = getVersions( versionHistory, restoreVersions )

  const STATE_DATA = {
  }

  if ( accountShells && accountShells.length )
    STATE_DATA[ 'accountShells' ] = JSON.stringify( accountShells )

  // if ( trustedContactsInfo && trustedContactsInfo.length )
  //   STATE_DATA[ 'trustedContactsInfo' ] = JSON.stringify( trustedContactsInfo )

  if ( activePersonalNode )
    STATE_DATA[ 'activePersonalNode' ] = JSON.stringify( activePersonalNode )

  if ( versions && versions.length )
    STATE_DATA[ 'versionHistory' ] = JSON.stringify( versions )

  return STATE_DATA
}

const asyncDataToBackup = async () => {
  const [
    [ , personalCopyDetails ],
    [ , FBTCAccount ],
    [ , PersonalNode ]
  ] = await AsyncStorage.multiGet( [
    'personalCopyDetails',
    'FBTCAccount',
    'PersonalNode'
  ] )
  const ASYNC_DATA = {
  }

  if ( personalCopyDetails )
    ASYNC_DATA[ 'personalCopyDetails' ] = personalCopyDetails
  if ( FBTCAccount ) ASYNC_DATA[ 'FBTCAccount' ] = FBTCAccount
  if ( PersonalNode ) ASYNC_DATA[ 'PersonalNode' ] = PersonalNode

  return ASYNC_DATA
}

function* updateWalletImageWorker() {
  //console.log( 'Update Wallet Image' )
  yield put( switchS3LoadingStatus( 'updateWIStatus' ) )
  const s3Service: S3Service = yield select( ( state ) => state.health.service )
  const wallet = yield call( dbManager.getWallet )
  const contacts = yield call( dbManager.getTrustedContacts )
  const accounts = yield call( dbManager.getAccounts )
  const encKey = LevelHealth.getDerivedKey(
    bip39.mnemonicToSeedSync( wallet.primaryMnemonic ).toString( 'hex' ),
  )
  const acc = {
  }
  accounts.forEach( account => {
    const cipher = crypto.createCipheriv(
      LevelHealth.cipherSpec.algorithm,
      encKey,
      LevelHealth.cipherSpec.iv,
    )
    let encrypted = cipher.update(
      JSON.stringify( account ),
      'utf8',
      'hex',
    )
    encrypted += cipher.final( 'hex' )
    acc[ account.id ] = {
      encryptedData: encrypted
    }
  } )
  const channelIds = []
  contacts.forEach( contact => {
    channelIds.push( contact.channelKey )
  } )
  const STATE_DATA = yield call( stateDataToBackup )
  const image : NewWalletImage = {
    name: wallet.walletName,
    walletId : wallet.walletId,
    contacts : channelIds,
    accounts : acc,
    versionHistory: STATE_DATA.versionHistory,
    SM_share: wallet.smShare,
    details2FA: wallet.details2FA
  }
  //console.log( image )
  /*let walletImage: WalletImage = {
  }
  const { DECENTRALIZED_BACKUP, SERVICES } = yield select(
    ( state ) => state.storage.database,
  )

  const walletImageHashes = yield call( AsyncStorage.getItem, 'WI_HASHES' )
  let hashesWI = JSON.parse( walletImageHashes )

  if ( walletImageHashes ) {
    const currentDBHash = hash( DECENTRALIZED_BACKUP )
    console.log( {
      previousDBHash: hashesWI.DECENTRALIZED_BACKUP,
      currentDBHash,
    } )
    if (
      !hashesWI.DECENTRALIZED_BACKUP ||
      currentDBHash !== hashesWI.DECENTRALIZED_BACKUP
    ) {
      walletImage[ 'DECENTRALIZED_BACKUP' ] = DECENTRALIZED_BACKUP
      hashesWI.DECENTRALIZED_BACKUP = currentDBHash
    }

    const currentSHash = hash( SERVICES )
    console.log( {
      previousSHash: hashesWI.SERVICES,
      currentSHash,
    } )
    if ( !hashesWI.SERVICES || currentSHash !== hashesWI.SERVICES ) {
      walletImage[ 'SERVICES' ] = SERVICES
      hashesWI.SERVICES = currentSHash
    }

    const ASYNC_DATA = yield call( asyncDataToBackup )
    if ( Object.keys( ASYNC_DATA ).length ) {
      const currentAsyncHash = hash( ASYNC_DATA )
      console.log( {
        previousAsyncHash: hashesWI.ASYNC_DATA,
        currentAsyncHash,
      } )
      if ( !hashesWI.ASYNC_DATA || currentAsyncHash !== hashesWI.ASYNC_DATA ) {
        walletImage[ 'ASYNC_DATA' ] = ASYNC_DATA
        hashesWI.ASYNC_DATA = currentAsyncHash
      }
    }

    const STATE_DATA = yield call( stateDataToBackup )
    if ( Object.keys( STATE_DATA ).length ) {
      const currentStateHash = hash( STATE_DATA )
      if ( !hashesWI.STATE_DATA || currentStateHash !== hashesWI.STATE_DATA ) {
        walletImage[ 'STATE_DATA' ] = STATE_DATA
        hashesWI.STATE_DATA = currentStateHash
      }
    }
  } else {
    walletImage = {
      DECENTRALIZED_BACKUP,
      SERVICES,
    }

    hashesWI = {
      DECENTRALIZED_BACKUP: hash( DECENTRALIZED_BACKUP ),
      SERVICES: hash( SERVICES ),
    }

    const ASYNC_DATA = yield call( asyncDataToBackup )
    if ( Object.keys( ASYNC_DATA ).length ) {
      walletImage[ 'ASYNC_DATA' ] = ASYNC_DATA
      hashesWI[ 'ASYNC_DATA' ] = hash( ASYNC_DATA )
    }

    const STATE_DATA = yield call( stateDataToBackup )

    if ( Object.keys( STATE_DATA ).length ) {
      walletImage[ 'STATE_DATA' ] = STATE_DATA
      hashesWI[ 'STATE_DATA' ] = hash( STATE_DATA )
    }
  }

  if ( Object.keys( walletImage ).length === 0 ) {
    console.log( 'WI: nothing to update' )
    return
  }
  // console.log( 'walletImage', walletImage )
*/
  const res = yield call( Relay.updateWalletImage, image )
  // const getWI = yield call( S3Service.fetchWalletImage, wallet.walletId )
  if ( res.status === 200 ) {
    if ( res.data ) console.log( 'Wallet Image updated' )
    yield put( switchS3LoadingStatus( 'updateWIStatus' ) )
    //yield call( AsyncStorage.setItem, 'WI_HASHES', JSON.stringify( hashesWI ) )
  } else {
    console.log( {
      err: res.err
    } )
    yield put( switchS3LoadingStatus( 'updateWIStatus' ) )
    throw new Error( 'Failed to update Wallet Image' )
  }
}

export const updateWalletImageHealthWatcher = createWatcher(
  updateWalletImageWorker,
  UPDATE_WALLET_IMAGE_HEALTH,
)

function* fetchWalletImageWorker( { payload } ) {
  try {
    const s3Service: S3Service = payload.s3Service

    const res = yield call( s3Service.fetchWalletImageKeeper )
    console.log( {
      res
    } )
    //const { walletImage } = payload
    if ( res.status === 200 ) {
      const walletImage: WalletImage = res.data.walletImage
      console.log( {
        walletImage
      } )

      if ( !Object.keys( walletImage ).length )
        console.log( 'Failed fetch: Empty Wallet Image' )

      // restore DB, Async and State data
      const {
        DECENTRALIZED_BACKUP,
        SERVICES,
        ASYNC_DATA,
        STATE_DATA,
      } = walletImage

      const payload = {
        SERVICES, DECENTRALIZED_BACKUP
      }
      yield call( insertDBWorker, {
        payload
      } ) // synchronously update db

      // re-mapping account shells (supports restoration of an app(via WI) < 1.4.0)
      const {
        REGULAR_ACCOUNT,
        TEST_ACCOUNT,
        SECURE_ACCOUNT,
        S3_SERVICE,
        TRUSTED_CONTACTS,
      } = SERVICES
      const services = {
        REGULAR_ACCOUNT: RegularAccount.fromJSON( REGULAR_ACCOUNT ),
        TEST_ACCOUNT: TestAccount.fromJSON( TEST_ACCOUNT ),
        SECURE_ACCOUNT: SecureAccount.fromJSON( SECURE_ACCOUNT ),
        S3_SERVICE: S3Service.fromJSON( S3_SERVICE ),
        TRUSTED_CONTACTS: TRUSTED_CONTACTS
          ? TrustedContactsService.fromJSON( TRUSTED_CONTACTS )
          : new TrustedContactsService(),
      }
      yield put( remapAccountShells( services ) )
      console.log( 'services', services )

      if ( ASYNC_DATA ) {
        for ( const key of Object.keys( ASYNC_DATA ) ) {
          console.log( 'restoring to async: ', key )
          yield call( AsyncStorage.setItem, key, ASYNC_DATA[ key ] )

          // if ( key === 'TrustedContactsInfo' && ASYNC_DATA[ key ] ) {
          //   const trustedContactsInfo = JSON.parse( ASYNC_DATA[ key ] )
          //   yield put( updateTrustedContactsInfoLocally( trustedContactsInfo ) )
          // }
        }
      }

      if ( STATE_DATA ) {
        for ( const key of Object.keys( STATE_DATA ) ) {
          if( !STATE_DATA[ key ] ) continue

          switch( key ){
              case 'accountShells':
                const accountShells: AccountShell[] = JSON.parse( STATE_DATA[ key ] )
                yield put( restoredAccountShells( {
                  accountShells
                } ) )
                break

                // case 'trustedContactsInfo':
                //   const trustedContactsInfo = JSON.parse( STATE_DATA[ key ] )
                //   yield put( updateTrustedContactsInfoLocally( trustedContactsInfo ) )
                //   break

              case 'activePersonalNode':
                const activePersonalNode: PersonalNode = JSON.parse( STATE_DATA[ key ] )
                yield put( personalNodeConfigurationSet(
                  activePersonalNode
                ) )
                break

              case 'versionHistory':
                const versions: VersionHistory[] = JSON.parse( STATE_DATA[ key ] )
                yield put( restoredVersionHistory( {
                  versions
                } ) )
                break
          }
        }
      }

      // update hashes
      const hashesWI = {
      }
      Object.keys( walletImage ).forEach( ( key ) => {
        hashesWI[ key ] = hash( walletImage[ key ] )
      } )
      yield call( AsyncStorage.setItem, 'WI_HASHES', JSON.stringify( hashesWI ) )
      yield put( walletImageChecked( true ) )
    }else {
      console.log( {
        err: res.err
      } )
      yield put( walletImageChecked( false ) )
      yield put( ErrorReceiving( true ) )
      console.log( 'Failed to fetch Wallet Image' )
    }
  } catch ( error ) {
    console.log( 'ERROR', error )
  }
}

export const fetchWalletImageHealthWatcher = createWatcher(
  fetchWalletImageWorker,
  FETCH_WALLET_IMAGE_HEALTH
)

function* generatePDFWorker( { payload } ) {
  // yield put(switchS3Loader('generatePDF'));
  const { selectedPersonalCopy } = payload // corresponds to metaShare index (3/4)
  //const shareIndex = selectedPersonalCopy.type === 'copy1' ? 3 : 4;
  const s3Service: S3Service = yield select( ( state ) => state.sss.service )
  // const res = yield call(s3Service.createQRKeeper, shareIndex);
  // if (res.status !== 200) {
  //   console.log({ err: res.err });
  //   return;
  // }
  const secureAccount: SecureAccount = yield select(
    ( state ) => state.accounts[ SECURE_ACCOUNT ].service
  )
  const qrData = {
    secondaryMnemonic: '',
    secondaryXpub: '',
    bhXpub: '',
  }

  const pdfData = {
    qrData: qrData,
  }

  const { security, walletName } = yield select(
    ( state ) => state.storage.wallet
  )

  try {
    const pdfPath = yield call(
      generatePDFKeeper,
      pdfData,
      `Hexa_Recovery_Key_${walletName}.pdf`,
      `Hexa Recovery Key for ${walletName}'s Wallet`
    )

    let personalCopyDetails = yield call(
      AsyncStorage.getItem,
      'personalCopyDetails'
    )
    // console.log('/sagas/sss ', {personalCopyDetails})
    if ( !personalCopyDetails ) {
      personalCopyDetails = {
        [ selectedPersonalCopy.type ]: {
          path: pdfPath,
          shared: false,
          sharingDetails: {
          },
        },
      }
    } else {
      personalCopyDetails = JSON.parse( personalCopyDetails )
      const originalSharedStatus = personalCopyDetails[
        selectedPersonalCopy.type
      ]
        ? personalCopyDetails[ selectedPersonalCopy.type ].shared
        : false
      const originalSharingDetails =
        personalCopyDetails[ selectedPersonalCopy.type ] &&
        personalCopyDetails[ selectedPersonalCopy.type ].sharingDetails
          ? personalCopyDetails[ selectedPersonalCopy.type ].sharingDetails
          : {
          }
      personalCopyDetails = {
        ...personalCopyDetails,
        [ selectedPersonalCopy.type ]: {
          path: pdfPath,
          shared: !!originalSharedStatus,
          sharingDetails: originalSharingDetails,
        },
      }
    }
    // console.log('/sagas/sss ', {personalCopyDetails})
    yield call(
      AsyncStorage.setItem,
      'personalCopyDetails',
      JSON.stringify( personalCopyDetails )
    )

    // reset PDF health (if present) post reshare
    let storedPDFHealth = yield call( AsyncStorage.getItem, 'PDF Health' )
    // console.log('/sagas/sss ', {storedPDFHealth})
    if ( storedPDFHealth ) {
      const { pdfHealthKeeper } = s3Service.levelhealth
      storedPDFHealth = JSON.parse( storedPDFHealth )
      storedPDFHealth = {
        ...storedPDFHealth,
        // [shareIndex]: { shareId: pdfHealth[shareIndex].shareId, updatedAt: 0 },
      }
      // console.log('/sagas/sss ', {storedPDFHealth})
      yield call(
        AsyncStorage.setItem,
        'PDF Health',
        JSON.stringify( storedPDFHealth )
      )
    }

    yield put( pdfGenerated( true ) )

    // if (Object.keys(personalCopyDetails).length == 2) {
    //   // remove sec-mne once both the personal copies are generated
    //   const { removed } = secureAccount.removeSecondaryMnemonic();
    //   if (!removed) console.log('Failed to remove sec-mne');
    // }

    // remove secondary mnemonic (if the secondary menmonic has been removed and re-injected)
    const blockPCShare = yield call( AsyncStorage.getItem, 'blockPCShare' )
    // if (blockPCShare) {
    //   if (secureAccount.secureHDWallet.secondaryMnemonic) {
    //     const { removed } = secureAccount.removeSecondaryMnemonic();
    //     if (!removed) {
    //       console.log('Failed to remove the secondary mnemonic');
    //     }
    //   }
    // }

    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const updatedSERVICES = {
      ...SERVICES,
      SECURE_ACCOUNT: JSON.stringify( secureAccount ),
      S3_SERVICE: JSON.stringify( s3Service ),
    }

    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )
  } catch ( err ) {
    console.log( {
      err
    } )
    yield put( pdfGenerated( false ) )
  }
  //yield put(switchS3Loader('generatePDF'));
}

export const generatePDFWatcher = createWatcher(
  generatePDFWorker,
  GENERATE_PDF
)

function* recoverMnemonicHealthWorker( { payload } ) {
  const { securityAns, metaShares } = payload
  // if (metaShares.length !== 3) return;

  const encryptedSecrets: string[] = metaShares.map(
    ( metaShare ) => metaShare.encryptedSecret
  )

  const res = yield call(
    S3Service.recoverFromSecretsKeeper,
    encryptedSecrets,
    securityAns,
    2
  )
  console.log( 'RECOVER_MNEMONIC_HEALTH res', res )
  if ( res.status === 200 ) {
    // TODO: recreate accounts and write to database
    yield put( mnemonicRecoveredHealth( res.data.mnemonic ) ) // storing in redux state (for demo)
  } else {
    console.log( {
      err: res.err
    } )
  }
}

export const recoverMnemonicHealthWatcher = createWatcher(
  recoverMnemonicHealthWorker,
  RECOVER_MNEMONIC_HEALTH
)

function* getPDFDataWorker( { payload } ) {
  try {
    const { shareId, Contact, channelKey } = payload
    yield put( switchS3LoaderKeeper( 'pdfDataProcess' ) )
    const contacts: Trusted_Contacts = yield select(
      ( state ) => state.trustedContacts.contacts
    )
    const appVersion = DeviceInfo.getVersion()
    const pdfInfo: {
      filePath: string;
      shareId: string;
      updatedAt: number;
    } = yield select( ( state ) => state.health.pdfInfo )
    const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const walletId = s3Service.levelhealth.walletId
    let pdfPath = pdfInfo.filePath
    let currentContact: TrustedContact
    let channelKeyFromCH: string

    if( contacts )
      for( const ck of Object.keys( contacts ) ){
        if ( contacts[ ck ].contactDetails.id === Contact.id ){
          currentContact = contacts[ ck ]
          channelKeyFromCH = ck
          break
        }
      }
    if( channelKeyFromCH && channelKeyFromCH == channelKey && currentContact ) {
      const recoveryData = {
        type: QRCodeTypes.RECOVERY_REQUEST,
        walletName: wallet.walletName,
        channelId: currentContact.permanentChannelAddress,
        streamId: TrustedContacts.getStreamId( walletId ),
        channelKey: channelKey,
        secondaryChannelKey: currentContact.secondaryChannelKey,
        version: appVersion,
        walletId,
        encryptedKey: LevelHealth.encryptWithAnswer(
          shareId,
          wallet.security.answer
        ).encryptedString,
      }
      const secondaryData = {
        type: QRCodeTypes.RECOVERY_REQUEST,
        walletName: wallet.walletName,
        channelId: currentContact.permanentChannelAddress,
        streamId: TrustedContacts.getStreamId( walletId ),
        secondaryChannelKey: currentContact.secondaryChannelKey,
        version: appVersion,
        walletId
      }

      const qrData = [
        JSON.stringify( recoveryData ),
        JSON.stringify( secondaryData ),
      ]
      console.log( 'PDF recoveryData', JSON.stringify( recoveryData ) )
      const pdfData = {
        qrData: qrData,
      }
      pdfPath = yield call(
        generatePDFKeeper,
        pdfData,
        `Hexa_Recovery_Key_${wallet.walletName}.pdf`,
        `Hexa Recovery Key for ${wallet.walletName}'s Wallet`
      )
      yield put( setPDFInfo( {
        filePath: pdfPath, updatedAt: moment( new Date() ).valueOf(), shareId
      } ) )
    }

    yield put( pdfSuccessfullyCreated( true ) )
    yield put( switchS3LoaderKeeper( 'pdfDataProcess' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'pdfDataProcess' ) )
    yield put( pdfSuccessfullyCreated( false ) )
    console.log( 'Error EF channel', error )
  }
}

export const getPDFDataWatcher = createWatcher( getPDFDataWorker, GET_PDF_DATA )

function* sharePDFWorker( { payload } ) {
  yield put( switchS3LoaderKeeper( 'pdfShare' ) )
  const { shareVia, isEmailOtherOptions } = payload
  const pdfInfo: {
    filePath: string;
    publicKey: string;
    privateKey: string;
  } = yield select( ( state ) => state.health.pdfInfo )
  try {
    console.log( 'pdfInfo', pdfInfo )
    if ( !pdfInfo.filePath ) throw new Error( 'Personal copy not found/generated' )

    const { security, walletName } = yield select(
      ( state ) => state.storage.wallet
    )

    switch ( shareVia ) {
        case 'Email':
          if ( !isEmailOtherOptions ) {
            yield call(
              Mailer.mail,
              {
                subject: 'Recovery Key  '+walletName,
                body: `<b>A Personal Copy of one of your Recovery Keys is attached as a pdf. The answer to your security question (${security.question}) is used to password protect the PDF.</b>`,
                isHTML: true,
                attachments: [ {
                  path:
                  Platform.OS == 'android'
                    ? pdfInfo.filePath
                    : pdfInfo.filePath, // The absolute path of the file from which to read data.
                  type: 'pdf', // Mime Type: jpg, png, doc, ppt, html, pdf, csv
                  name: 'Recovery Key  '+walletName, // Optional: Custom filename for attachment
                } ],
              },
              ( err, event ) => {
                console.log( {
                  event, err
                } )
              // on delayed error (rollback the changes that happened post switch case)
              }
            )
          } else {
            const shareOptions = {
              title: 'Recovery Key  '+walletName,
              message: `A Personal Copy of one of your Recovery Keys is attached as a pdf. The answer to your security question (${security.question}) is used to password protect the PDF.`,
              url:
              Platform.OS == 'android'
                ? 'file://' + pdfInfo.filePath
                : pdfInfo.filePath,
              type: 'application/pdf',
              showAppsToView: true,
              subject: 'Recovery Key  '+walletName,
            }

            try {
              yield call( Share.open, shareOptions )
            } catch ( err ) {
              const errorMessage = idx( err, ( _ ) => _.message )
              if ( errorMessage !== 'User did not share' ) {
                throw new Error( `Share failed: ${err}` )
              }
            }
          }
          break

        case 'Print':
          const pdfDecr = {
            path: pdfInfo.filePath,
            filename: 'PersonalCopy2.pdf',
            password: security.answer,
          }
          if ( Platform.OS == 'android' ) {
            const PdfPassword = yield NativeModules.PdfPassword
            yield call(
              PdfPassword.print,
              JSON.stringify( pdfDecr ),
              ( err: any ) => {
                console.log( {
                  err
                } )
              // on delayed error (rollback the changes that happened post switch case)
              },
              async ( res: any ) => {
                await RNPrint.print( {
                  filePath: 'file://' + res,
                } )
                console.log( {
                  res
                } )
              }
            )
          } else {
            try {
              yield call( RNPrint.print, {
                filePath: pdfInfo.filePath,
              } )
            } catch ( err ) {
              console.log( err )
              throw new Error( `Print failed: ${err}` )
            }
          }
          break

        case 'Other':
          const shareOptions = {
            title: 'Recovery Key  '+walletName,
            message: `A Personal Copy of one of your Recovery Keys is attached as a pdf. The answer to your security question (${security.question}) is used to password protect the PDF.`,
            url:
            Platform.OS == 'android'
              ? 'file://' + pdfInfo.filePath
              : pdfInfo.filePath,
            type: 'application/pdf',
            showAppsToView: true,
            subject: 'Recovery Key  '+walletName,
          }

          try {
            yield call( Share.open, shareOptions )
          } catch ( err ) {
            const errorMessage = idx( err, ( _ ) => _.message )
            if ( errorMessage !== 'User did not share' ) {
              throw new Error( `Share failed: ${err}` )
            }
          }
          break

        default:
          throw new Error( 'Invalid sharing option' )
    }

    yield put( switchS3LoaderKeeper( 'pdfShare' ) )
  } catch ( err ) {
    console.log( {
      err
    } )
    yield put( switchS3LoaderKeeper( 'pdfShare' ) )
  }
}

export const sharePDFWatcher = createWatcher( sharePDFWorker, SHARE_PDF )

function* confirmPDFSharedWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'pdfDataConfirm' ) )
    const { shareId, scannedData } = payload
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const metaShare: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
    const walletId = s3Service.levelhealth.walletId
    const answer = yield select( ( state ) => state.storage.wallet.security.answer )
    let shareIndex = 3
    if (
      shareId &&
      s3Service.levelhealth.metaSharesKeeper.length &&
      metaShare.findIndex( ( value ) => value.shareId == shareId ) > -1
    ) {
      shareIndex = metaShare.findIndex( ( value ) => value.shareId == shareId )
    }

    const scannedObj:  {
      type: string,
      walletName: string,
      channelId: string,
      streamId: string,
      channelKey: string,
      channelKey2: string,
      version: string,
      encryptedKey: string,
    } = JSON.parse( scannedData )
    const decryptedData = LevelHealth.decryptWithAnswer( scannedObj.encryptedKey, answer ).decryptedString
    if( decryptedData == shareId ){
      const shareObj = {
        walletId: walletId,
        shareId: shareId,
        reshareVersion: metaShare[ shareIndex ].meta.reshareVersion,
        updatedAt: moment( new Date() ).valueOf(),
        name: 'Personal Copy',
        shareType: 'pdf',
        status: 'accessible',
      }
      yield put( updateMSharesHealth( shareObj, false ) )
    }
    yield put( switchS3LoaderKeeper( 'pdfDataConfirm' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'pdfDataConfirm' ) )
    console.log( 'Error EF channel', error )
  }
}

export const confirmPDFSharedWatcher = createWatcher(
  confirmPDFSharedWorker,
  CONFIRM_PDF_SHARED
)

function* updatedKeeperInfoWorker( { payload } ) {
  try {
    const { keeperData } = payload
    const keeperInfo: KeeperInfoInterface[] = [ ...yield select( ( state ) => state.health.keeperInfo ) ]
    if( keeperInfo && keeperInfo.length > 0 ) {
      if( keeperInfo.find( value=>value && value.shareId == keeperData.shareId ) && keeperInfo.find( value=>value && value.shareId == keeperData.shareId ).type == 'pdf' && keeperData.type != 'pdf' ) yield put( setPDFInfo( {
        filePath: '', updatedAt: 0, shareId: ''
      } ) )
    }
    let flag = false
    if ( keeperInfo.length > 0 ) {
      for ( let i = 0; i < keeperInfo.length; i++ ) {
        const element = keeperInfo[ i ]
        if ( element.shareId == keeperData.shareId ) {
          flag = false
          keeperInfo[ i ].name = keeperData.name
          keeperInfo[ i ].scheme = keeperData.scheme
          keeperInfo[ i ].currentLevel = keeperData.currentLevel
          keeperInfo[ i ].createdAt = keeperData.createdAt
          keeperInfo[ i ].type = keeperData.type
          keeperInfo[ i ].data = keeperData.data
          keeperInfo[ i ].sharePosition = keeperData.sharePosition
          keeperInfo[ i ].channelKey = keeperData.channelKey
          break
        } else flag = true
      }
    } else flag = true
    if ( flag ) {
      keeperInfo.push( keeperData )
    }
    yield put( putKeeperInfo( keeperInfo ) )
  } catch ( error ) {
    console.log( 'Error updatedKeeperInfoWorker', error )
  }
}

export const updatedKeeperInfoWatcher = createWatcher(
  updatedKeeperInfoWorker,
  KEEPER_INFO
)

function* emptyShareTransferDetailsForContactChangeWorker( { payload } ) {
  const { index } = payload
  const { DECENTRALIZED_BACKUP } = yield select( ( state ) => state.storage.database )
  const shareTransferDetails = {
    ...DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
  }
  delete shareTransferDetails[ index ]
  const updatedBackup = {
    ...DECENTRALIZED_BACKUP,
    SHARES_TRANSFER_DETAILS: shareTransferDetails,
  }
  yield call( insertDBWorker, {
    payload: {
      DECENTRALIZED_BACKUP: updatedBackup,
    },
  } )
}

export const emptyShareTransferDetailsForContactChangeWatcher = createWatcher(
  emptyShareTransferDetailsForContactChangeWorker,
  EMPTY_SHARE_TRANSFER_DETAILS
)

function* removeUnwantedUnderCustodySharesWorker( { payload } ) {
  // set a timelapse for auto update and enable instantaneous manual update
  yield put( switchS3LoaderKeeper( 'updateMSharesHealth' ) )

  const Contacts: Trusted_Contacts = yield select(
    ( state ) => state.trustedContacts.contacts,
  )

  const DECENTRALIZED_BACKUP = yield select(
    ( state ) => state.storage.database.DECENTRALIZED_BACKUP,
  )

  const SERVICES = yield select( ( state ) => state.storage.database.SERVICES )

  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP
  const metaShares = Object.keys( UNDER_CUSTODY ).map(
    ( tag ) => UNDER_CUSTODY[ tag ].META_SHARE,
  )

  if ( !metaShares.length ) return
  const res = yield call( S3Service.removeUnwantedUnderCustody, metaShares )
  if ( res.status === 200 ) {
    // TODO: Use during selective updation
    const { updationInfo } = res.data
    console.log( {
      updationInfo
    } )

    let removed = false
    Object.keys( UNDER_CUSTODY ).forEach( ( tag ) => {
      for ( const info of updationInfo ) {
        if ( info.removeShare ) {
          if ( info.removeShare ) {
            if ( info.walletId === UNDER_CUSTODY[ tag ].META_SHARE.meta.walletId ) {
              delete UNDER_CUSTODY[ tag ]
              removed = true
              for ( const contactName of Object.keys( Contacts ) ) {
                const contact = Contacts[ contactName ]
                if ( contact.walletID === info.walletId ) {
                  contact.isWard = false
                }
              }
            }
          }
        }
      }
    } )

    if ( removed ) {
      // update db post share removal
      const updatedSERVICES = {
        ...SERVICES,
        TRUSTED_CONTACTS: JSON.stringify( trustedContactsService ),
      }

      const updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        UNDER_CUSTODY,
      }
      yield call( insertDBWorker, {
        payload: {
          DECENTRALIZED_BACKUP: updatedBackup,
          SERVICES: updatedSERVICES,
        },
      } )
    }
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    console.log( {
      err: res.err
    } )
  }
  yield put( switchS3LoaderKeeper( 'updateMSharesHealth' ) )
}

export const removeUnwantedUnderCustodySharesWatcher = createWatcher(
  removeUnwantedUnderCustodySharesWorker,
  REMOVE_UNWANTED_UNDER_CUSTODY
)

function* generateSMMetaSharesWorker( { payload } ) {
  const { SM } = payload
  console.log( 'PAYLOAD SM', SM )
  const s3Service: S3Service = yield select( ( state ) => state.health.service )
  const { walletName } = yield select(
    ( state ) => state.storage.wallet
  )
  const appVersion = DeviceInfo.getVersion()
  const { answer, questionId, question } = yield select(
    ( state ) => state.storage.wallet.security
  )

  const wallet: Wallet = yield select(
    ( state ) => state.storage.wallet
  )
  const secondaryMnemonic = SM && SM ? SM : wallet.secondaryMnemonic ? wallet.secondaryMnemonic : ''
  const res = yield call(
    s3Service.generateSMShares,
    secondaryMnemonic,
    answer,
    walletName,
    questionId,
    appVersion,
    questionId === '0' ? question: '',
  )
  if ( res.status === 200 ) {
    if( res.data.metaShares && res.data.metaShares.length ){
      yield put( isSmMetaSharesCreated() )
    }
    const { SERVICES, DECENTRALIZED_BACKUP } = yield select( ( state ) => state.storage.database )
    const updatedDECENTRALIZED_BACKUP = {
      ...DECENTRALIZED_BACKUP,
      PK_SHARE: res.data.metaShares[ 0 ]
    }
    const updatedSERVICES = {
      ...SERVICES,
      S3_SERVICE: JSON.stringify( s3Service ),
    }
    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES, DECENTRALIZED_BACKUP: updatedDECENTRALIZED_BACKUP
      }
    } )
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    throw new Error( res.err )
  }
}

export const generateSMMetaSharesWatcher = createWatcher(
  generateSMMetaSharesWorker,
  GENERATE_SM_META_SHARE
)

function* deletePrivateDataWorker() {
  try {
    // Transfer: Guardian >>> User
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const s3ServiceSecure: SecureAccount = yield select(
      ( state ) => state.accounts[ SECURE_ACCOUNT ].service
    )
    // Delete Sm shares and Primary Mnemonics
    s3Service.deletePrivateData()

    // Delete Sm
    s3ServiceSecure.deleteSecondaryMnemonics()

    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const updatedSERVICES = {
      ...SERVICES,
      SECURE_ACCOUNT: JSON.stringify( s3ServiceSecure ),
      S3_SERVICE: JSON.stringify( s3Service ),
    }
    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )
  } catch ( error ) {
    console.log( 'RECOVERY error', error )
  }
}

export const deletePrivateDataWatcher = createWatcher(
  deletePrivateDataWorker,
  DELETE_SM_AND_SMSHARES,
)

function* autoShareLevel2KeepersWorker( ) {
  try {
    console.log( 'AUTO SHARE LEVEL 2 STARTED' )
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    const keeperInfo: KeeperInfoInterface[] = yield select( ( state ) => state.health.keeperInfo )
    const service: S3Service = yield select( ( state ) => state.health.service )
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const Contacts: Trusted_Contacts = yield select( ( state ) => state.trustedContacts.contacts )
    const MetaShares: MetaShare[] = service.levelhealth.metaSharesKeeper
    const walletId = service.levelhealth.walletId
    const { walletName } = yield select( ( state ) => state.storage.wallet )
    const shareIds = []
    if( levelHealth[ 1 ] && levelHealth[ 1 ].levelInfo.length == 6 ) {
      for ( let i = 2; i < levelHealth[ 1 ].levelInfo.length - 2; i++ ) {
        const channelKey = keeperInfo.find( value=>value.shareId == levelHealth[ 0 ].levelInfo[ i ].shareId ).channelKey
        const obj: KeeperInfoInterface = {
          shareId: levelHealth[ 1 ].levelInfo[ i ].shareId,
          name: levelHealth[ 0 ].levelInfo[ i ].name,
          type: levelHealth[ 0 ].levelInfo[ i ].shareType,
          scheme: MetaShares.find( value=>value.shareId == levelHealth[ 1 ].levelInfo[ i ].shareId ).meta.scheme,
          currentLevel: currentLevel,
          createdAt: moment( new Date() ).valueOf(),
          sharePosition: MetaShares.findIndex( value=>value.shareId == levelHealth[ 1 ].levelInfo[ i ].shareId ),
          data: keeperInfo.find( value=>value.shareId == levelHealth[ 0 ].levelInfo[ i ].shareId ).data,
          channelKey
        }
        yield put( updatedKeeperInfo( obj ) )

        const contactInfo = {
          channelKey: keeperInfo.find( value=>value.shareId == levelHealth[ 0 ].levelInfo[ i ].shareId ).channelKey,
        }

        const primaryData: PrimaryStreamData = {
          contactDetails: Contacts[ channelKey ].contactDetails,
          walletID: walletId,
          walletName,
          relationType: TrustedContactRelationTypes.KEEPER,
        }
        const backupData: BackupStreamData = {
          primaryMnemonicShard: {
            ...MetaShares.find( value=>value.shareId == levelHealth[ 1 ].levelInfo[ i ].shareId ),
            encryptedShare: {
              pmShare: MetaShares.find( value=>value.shareId == levelHealth[ 1 ].levelInfo[ i ].shareId ).encryptedShare.pmShare,
              smShare: '',
              bhXpub: '',
            }
          },
          keeperInfo
        }
        const streamUpdates: UnecryptedStreamData = {
          streamId: TrustedContacts.getStreamId( walletId ),
          primaryData,
          backupData,
          metaData: {
            flags:{
              active: true,
              newData: true,
              lastSeen: Date.now(),
            },
            version: DeviceInfo.getVersion()
          }
        }
        // initiate permanent channel
        const channelUpdate =  {
          contactInfo, streamUpdates
        }
        shareIds.push( obj )
        const { updated, updatedContacts }: {
          updated: boolean;
          updatedContacts: Trusted_Contacts
        } = yield call(
          TrustedContactsOperations.syncPermanentChannels,
          [ {
            channelKey: contactInfo.channelKey,
            streamId: streamUpdates.streamId,
            contactDetails: Contacts[ channelKey ].contactDetails,
            unEncryptedOutstreamUpdates: streamUpdates,
          } ]
        )
        if ( updated ) {
          const shareObj = {
            walletId: walletId,
            shareId: obj.shareId,
            reshareVersion: MetaShares.find( value=>value.shareId == obj.shareId ).meta.reshareVersion,
            updatedAt: moment( new Date() ).valueOf(),
            status: 'accessible',
            name: obj.name,
            shareType: obj.type
          }
          yield put( updateMSharesHealth( shareObj, false ) )
        }
      }
    }
    yield put( switchS3LoaderKeeper( 'autoShareKeepersData' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'autoShareKeepersData' ) )
    console.log( 'Error autoShareLevel2KeepersWorker', error )
  }
}

export const autoShareLevel2KeepersWatcher = createWatcher(
  autoShareLevel2KeepersWorker,
  AUTO_SHARE_LEVEL2_KEEPER
)

function* setLevelToNotSetupStatusWorker( ) {
  try {
    yield put( switchS3LoaderKeeper( 'setToBaseStatus' ) )
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const service: S3Service = yield select( ( state ) => state.health.service )
    let toDelete:LevelInfo[]
    const shareArray = []
    if( currentLevel > 0 ) {
      if( currentLevel == 1 && service.levelhealth.metaSharesKeeper.length == 3 && levelHealth[ 1 ] ) {
        toDelete = levelHealth[ 1 ].levelInfo
      }
      if( currentLevel == 2 && service.levelhealth.metaSharesKeeper.length == 5 && levelHealth[ 2 ] ) {
        toDelete = levelHealth[ 2 ].levelInfo
      }
    }
    if( toDelete ){
      for ( let i = 0; i < toDelete.length; i++ ) {
        const element = toDelete[ i ]
        if( i != 1 ){
          shareArray.push( {
            walletId: service.getWalletId().data.walletId,
            shareId: element.shareId,
            reshareVersion: element.reshareVersion,
            updatedAt: 0,
            status: 'notAccessible',
            shareType: '',
            name: ''
          } )
        }
      }
    }
    if( shareArray.length ) {
      yield put( updateMSharesHealth( shareArray, false ) )
      yield put( setIsLevelToNotSetupStatus( true ) )
      if ( shareArray.length == 3 ){
        yield put( updateLevelTwoMetaShareStatus( true ) )
        yield put( isLevel2InitializedStatus() )
      }
      if ( shareArray.length == 5 ) {
        yield put( updateLevelThreeMetaShareStatus( true ) )
        yield put( isLevel3InitializedStatus() )
        yield put( updateLevelTwoMetaShareStatus( true ) )
        yield put( isLevel2InitializedStatus() )
      }
    }
    yield put( switchS3LoaderKeeper( 'setToBaseStatus' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'setToBaseStatus' ) )
    console.log( 'Error EF channel', error )
  }
}

export const setLevelToNotSetupStatusWatcher = createWatcher(
  setLevelToNotSetupStatusWorker,
  SET_LEVEL_TO_NOT_SETUP
)

function* setHealthStatusWorker( ) {
  try {
    yield put( switchS3LoaderKeeper( 'healthExpiryStatus' ) )
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const service: S3Service = yield select( ( state ) => state.health.service )
    const TIME_SLOTS = config.HEALTH_STATUS.TIME_SLOTS
    const shareArray = []
    if( currentLevel && levelHealth[ 0 ] && levelHealth[ 0 ].levelInfo ){
      const element = levelHealth[ 0 ]
      for ( let i = 0; i < element.levelInfo.length; i++ ) {
        const element2 = element.levelInfo[ i ]
        if( element2.updatedAt > 0 && element2.status == 'accessible' ) {
          const delta = Math.abs( Date.now() - element2.updatedAt )
          const minutes = Math.round( delta / ( 60 * 1000 ) )
          if ( minutes > TIME_SLOTS.SHARE_SLOT2 && element2.shareType != 'cloud' ) {
            levelHealth[ 0 ].levelInfo[ i ].status = 'notAccessible'
            shareArray.push( {
              walletId: service.getWalletId().data.walletId,
              shareId: element2.shareId,
              reshareVersion: element2.reshareVersion,
              status: 'notAccessible',
            } )
          }
        }
      }
    }

    if( shareArray.length ){
      yield put( updateMSharesHealth( shareArray, true ) )
    }
    yield put( switchS3LoaderKeeper( 'healthExpiryStatus' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'healthExpiryStatus' ) )
    console.log( 'Error EF channel', error )
  }
}

export const setHealthStatusWatcher = createWatcher(
  setHealthStatusWorker,
  SET_HEALTH_STATUS
)

function* createChannelAssetsWorker( { payload } ) {
  try {
    const { shareId } = payload
    const MetaShares: MetaShare[] = yield select( ( state ) => state.health.service.levelhealth.metaSharesKeeper )
    const service: S3Service = yield select( ( state ) => state.health.service )
    const encryptedSecondaryShares: string[] = service.levelhealth.encryptedSMSecretsKeeper
    if( MetaShares && MetaShares.length ){
      yield put( switchS3LoaderKeeper( 'createChannelAssetsStatus' ) )
      const keeperInfo: KeeperInfoInterface[] = yield select( ( state ) => state.health.keeperInfo )
      const secondaryShareDownloadedVar = yield select( ( state ) => state.health.secondaryShareDownloaded )
      const wallet: Wallet = yield select(
        ( state ) => state.storage.wallet
      )
      let secondaryShare: string = encryptedSecondaryShares && encryptedSecondaryShares.length &&  encryptedSecondaryShares[ 1 ] ? encryptedSecondaryShares[ 1 ] : ''
      if( secondaryShareDownloadedVar ) {
        secondaryShare = secondaryShareDownloadedVar
      }
      const channelAssets: ChannelAssets = {
        primaryMnemonicShard: {
          ...MetaShares.find( value=>value.shareId==shareId ),
          encryptedShare: {
            pmShare: MetaShares.find( value=>value.shareId==shareId ).encryptedShare.pmShare,
            smShare: '',
            bhXpub: '',
          }
        },
        secondaryMnemonicShard: secondaryShare,
        keeperInfo: keeperInfo,
        bhXpub: wallet.details2FA && wallet.details2FA.bithyveXpub ? wallet.details2FA.bithyveXpub : '',
        shareId
      }
      yield put( setChannelAssets( channelAssets ) )
      yield put( setApprovalStatus( false ) )
      yield put( secondaryShareDownloaded( null ) )
      yield put( switchS3LoaderKeeper( 'createChannelAssetsStatus' ) )
    }
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'createChannelAssetsStatus' ) )
    console.log( 'Error EF channel', error )
  }
}

export const createChannelAssetsWatcher = createWatcher(
  createChannelAssetsWorker,
  CREATE_CHANNEL_ASSETS
)

function* downloadSMShareWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'downloadSMShareLoader' ) )
    const { scannedData } = payload
    if( scannedData ) {
      const s3Service = yield select( ( state ) => state.health.service )
      const walletId = s3Service.levelhealth.walletId
      const contacts: Trusted_Contacts = yield select( ( state ) => state.trustedContacts.contacts )
      const qrDataObj = JSON.parse( scannedData )
      let currentContact: TrustedContact
      let channelKey: string
      if( contacts ){
        for( const ck of Object.keys( contacts ) ){
          channelKey=ck
          currentContact = contacts[ ck ]
          if( currentContact.permanentChannelAddress == qrDataObj.channelId ){
            break
          }
        }
      }
      const res = yield call( TrustedContacts.retrieveFromStream, {
        walletId, channelKey, options: {
          retrieveSecondaryData: true,
        }, secondaryChannelKey: qrDataObj.secondaryChannelKey
      } )
      if( res.secondaryData.secondaryMnemonicShard ) {
        console.log( 'res.secondaryData.secondaryMnemonicShard', res.secondaryData.secondaryMnemonicShard )
        yield put( secondaryShareDownloaded( res.secondaryData.secondaryMnemonicShard ) )
        yield put( setApprovalStatus( true ) )
      }
    }

    yield put( switchS3LoaderKeeper( 'downloadSMShareLoader' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'downloadSMShareLoader' ) )
    console.log( 'Error EF channel', error )
  }
}

export const downloadSMShareWatcher = createWatcher(
  downloadSMShareWorker,
  DOWNLOAD_SM_SHARE
)

function* createOrChangeGuardianWorker( { payload: data } ) {
  try {
    const { channelKey, shareId, contact, index, isChange, oldChannelKey, existingContact } = data
    const MetaShares: MetaShare[] = yield select(
      ( state ) => state.health.service.levelhealth.metaSharesKeeper,
    )
    const contactInfo = {
      channelKey,
    }
    const channelUpdate =  {
      contactInfo
    }
    const payload = {
      permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
      channelUpdates: [ channelUpdate ],
    }
    yield call( syncPermanentChannelsWorker, {
      payload
    } )
    const channelAssets: ChannelAssets = yield select( ( state ) => state.health.channelAssets )
    const s3Service = yield select( ( state ) => state.health.service )
    const keeperInfo: KeeperInfoInterface[] = yield select( ( state ) => state.health.keeperInfo )
    const contacts: Trusted_Contacts = yield select( ( state ) => state.trustedContacts.contacts )
    const walletId = s3Service.levelhealth.walletId
    const { walletName } = yield select( ( state ) => state.storage.wallet )
    if( MetaShares && MetaShares.length ) {
      yield put( switchS3LoaderKeeper( 'createChannelAssetsStatus' ) )
      if( existingContact ){
        const contactInfo = {
          channelKey: channelKey,
          secondaryChannelKey: BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
        }
        const primaryData: PrimaryStreamData = {
          contactDetails: contacts[ channelKey ].contactDetails,
          walletID: walletId,
          walletName,
          relationType: TrustedContactRelationTypes.KEEPER,
        }
        const secondaryData: SecondaryStreamData = {
          secondaryMnemonicShard: channelAssets.secondaryMnemonicShard,
          bhXpub: channelAssets.bhXpub
        }
        const backupData: BackupStreamData = {
          primaryMnemonicShard: channelAssets.primaryMnemonicShard,
          keeperInfo
        }
        const streamUpdates: UnecryptedStreamData = {
          streamId: TrustedContacts.getStreamId( walletId ),
          primaryData,
          secondaryData,
          backupData,
          metaData: {
            flags:{
              active: true,
              newData: true,
              lastSeen: Date.now(),
            },
            version: DeviceInfo.getVersion()
          }
        }
        // initiate permanent channel
        const channelUpdate =  {
          contactInfo, streamUpdates
        }
        yield put( syncPermanentChannels( {
          permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
          channelUpdates: [ channelUpdate ],
        } ) )
        const temporaryContact: TrustedContact = contacts[ channelKey ] // temporary trusted contact object
        const instream = useStreamFromContact( temporaryContact, walletId, true )
        const fcmToken: string = idx( instream, ( _ ) => _.primaryData.FCM )
        const notification: INotification = {
          notificationType: notificationType.FNF_KEEPER_REQUEST,
          title: 'Friends and Family Request',
          body: `You have new keeper request ${temporaryContact.contactDetails.contactName}`,
          data: {
            walletName: walletName,
            channelKey: channelKey,
            contactsSecondaryChannelKey: temporaryContact.secondaryChannelKey,
          },
          tag: notificationTag.IMP,
        }
        const notifReceivers = []
        notifReceivers.push( {
          walletId: instream.primaryData.walletID,
          FCMs: [ fcmToken ],
        } )
        if( notifReceivers.length )
          yield call(
            Relay.sendNotifications,
            notifReceivers,
            notification,
          )
      } else {
        yield put( initializeTrustedContact( {
          contact: contact,
          flowKind: InitTrustedContactFlowKind.SETUP_TRUSTED_CONTACT,
          isKeeper: true,
          channelKey: keeperInfo.find( value=>value.shareId == shareId ).channelKey,
          shareId: shareId
        } ) )
      }
      if( isChange ) {
        const contactInfo = {
          channelKey: oldChannelKey,
        }
        const primaryData: PrimaryStreamData = {
          contactDetails: contacts[ oldChannelKey ].contactDetails,
          walletID: walletId,
          walletName,
          relationType: TrustedContactRelationTypes.CONTACT,
        }
        const streamUpdates: UnecryptedStreamData = {
          streamId: TrustedContacts.getStreamId( walletId ),
          primaryData,
          secondaryData: null,
          backupData: null,
          metaData: {
            flags:{
              active: true,
              newData: true,
              lastSeen: Date.now(),
            },
            version: DeviceInfo.getVersion()
          }
        }
        // initiate permanent channel
        const channelUpdate =  {
          contactInfo, streamUpdates
        }
        yield put( syncPermanentChannels( {
          permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
          channelUpdates: [ channelUpdate ],
        } ) )
      }
      yield put( switchS3LoaderKeeper( 'createChannelAssetsStatus' ) )
    }
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'createChannelAssetsStatus' ) )
    console.log( 'Error EF channel', error )
  }
}

export const createOrChangeGuardianWatcher = createWatcher(
  createOrChangeGuardianWorker,
  CREATE_OR_CHANGE_GUARDIAN
)

function* modifyLevelDataWorker( ) {
  try {
    yield put( switchS3LoaderKeeper( 'modifyLevelDataStatus' ) )
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const currentLevel: number = yield select( ( state ) => state.health.currentLevel )
    const keeperInfo: KeeperInfoInterface[] = yield select( ( state ) => state.health.keeperInfo )
    let levelData: LevelData[] = yield select( ( state ) => state.health.levelData )
    const contacts: Trusted_Contacts = yield select( ( state ) => state.trustedContacts.contacts )
    const s3Service = yield select( ( state ) => state.health.service )
    let isError = false
    const abc = JSON.stringify( levelHealth )
    const levelHealthVar: LevelHealthInterface[] = [ ...getModifiedData( keeperInfo, JSON.parse( abc ), contacts ) ]
    console.log( 'levelHealthVar', levelHealthVar )
    for ( let i = 0; i < levelHealthVar.length; i++ ) {
      const levelInfo = levelHealthVar[ i ].levelInfo
      for ( let j = 0; j < levelInfo.length; j++ ) {
        const element = levelInfo[ j ]
        const currentContact: TrustedContact = contacts[ element.channelKey ]
        if ( currentContact ) {
          const instream: StreamData = useStreamFromContact( currentContact, s3Service.levelhealth.walletId, true )
          console.log( 'instream', instream )
          if( instream ){
            levelInfo[ j ].status = levelInfo[ j ].updatedAt == 0 ? 'notAccessible' : Math.round( Math.abs( Date.now() - instream.metaData.flags.lastSeen ) / ( 60 * 1000 ) ) > config.HEALTH_STATUS.TIME_SLOTS.SHARE_SLOT2 ? 'notAccessible' : 'accessible'
            levelInfo[ j ].updatedAt = instream.metaData.flags.lastSeen
          }
        }
      }
    }
    levelData = checkLevelHealth( levelData, levelHealthVar )
    if ( levelData.findIndex( ( value ) => value.status == 'bad' ) > -1 ) {
      isError = true
    }
    yield put( updateHealth( levelHealthVar, currentLevel, 'modifyLevelDataWatcher' ) )
    const levelDataUpdated = getLevelInfoStatus( levelData )
    yield put ( updateLevelData( levelDataUpdated, isError ) )
    yield put( switchS3LoaderKeeper( 'modifyLevelDataStatus' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'modifyLevelDataStatus' ) )
    console.log( 'Error EF channel', error )
  }
}

export const modifyLevelDataWatcher = createWatcher(
  modifyLevelDataWorker,
  MODIFY_LEVELDATA
)

function* downloadBackupDataWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'downloadBackupDataStatus' ) )
    const { scannedData, backupData } = payload
    const downloadedBackupData: {
      primaryData?: PrimaryStreamData;
      backupData?: BackupStreamData;
      secondaryData?: SecondaryStreamData;
    }[] = [ ...yield select( ( state ) => state.health.downloadedBackupData ) ]
    if( backupData ) {
      downloadedBackupData.push( backupData )
    } else {
      const qrDataObj = scannedData
      const res = yield call( TrustedContacts.retrieveFromStream, {
        walletId: qrDataObj.walletId,
        channelKey: qrDataObj.channelKey,
        options: {
          retrievePrimaryData: true,
          retrieveBackupData: true,
          retrieveSecondaryData: true,
        },
        secondaryChannelKey: qrDataObj.secondaryChannelKey
      } )
      console.log( 'res', res )
      downloadedBackupData.push( res )
    }
    yield put( setDownloadedBackupData( downloadedBackupData ) )
    yield put( switchS3LoaderKeeper( 'downloadBackupDataStatus' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'downloadBackupDataStatus' ) )
    console.log( 'Error EF channel', error )
  }
}

export const downloadBackupDataWatcher = createWatcher(
  downloadBackupDataWorker,
  DOWNLOAD_BACKUP_DATA
)

function* setupHealthWorker( { payload } ) {
  const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
  const s3Service: S3Service = yield select( ( state ) => state.health.service )
  if ( levelHealth && levelHealth.length ) return
  const downloadedBackupData: {
    primaryData?: PrimaryStreamData;
    backupData?: BackupStreamData;
    secondaryData?: SecondaryStreamData;
  }[] = yield select( ( state ) => state.health.downloadedBackupData )
  const keeperInfo: KeeperInfoInterface[] = yield select( ( state ) => state.health.keeperInfo )
  const initLoader = yield select( ( state ) => state.health.loading.initLoader )
  const wallet: Wallet = yield select(
    ( state ) => state.storage.database
  )
  const { security } = wallet
  if( initLoader ) return
  const { level }: { level: number } = payload
  yield put( switchS3LoaderKeeper( 'initLoader' ) )

  const randomIdForSecurityQ = generateRandomString( 8 )
  const randomIdForCloud = generateRandomString( 8 )
  if( level == 1 ){
    const levelInfo = [
      {
        shareType: 'securityQuestion',
        updatedAt: security && security.answer ? moment( new Date() ).valueOf() : 0,
        status: security && security.answer ? 'accessible' : 'notSetup',
        shareId: keeperInfo.find( value=>value.type == 'securityQuestion' ) ? keeperInfo.find( value=>value.type == 'securityQuestion' ).shareId : randomIdForSecurityQ,
        reshareVersion: 0,
        name: security && security.answer ? 'Encryption Password' : 'Set Password',
      },
      {
        shareType: 'cloud',
        updatedAt: moment( new Date() ).valueOf(),
        status: 'accessible',
        shareId: keeperInfo.find( value=>value.type == 'cloud' ) ? keeperInfo.find( value=>value.type == 'cloud' ).shareId : randomIdForCloud,
        reshareVersion: 0,
        name: Platform.OS == 'ios' ? 'iCloud' : 'Google Drive',
      },
    ]
    yield put( updateHealth( [ {
      level: 1,
      levelInfo: levelInfo,
    } ], level, 'setupHealthWatcher' ) )
  } else {
    const metaShares: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
    let isLevelInitialized = yield select(
      ( state ) => state.health.isLevel3Initialized
    )
    if ( level == 2 ) {
      isLevelInitialized = yield select(
        ( state ) => state.health.isLevel2Initialized
      )
    }
    if ( !isLevelInitialized ) {
      const contacts: Trusted_Contacts = yield select( ( state ) => state.trustedContacts.contacts )
      const s3Service: S3Service = yield select( ( state ) => state.health.service )
      console.log( 'INIT_LEVEL_TWO levelHealth', levelHealth )

      const levelInfo: LevelInfo[] = [
        {
          shareType: 'securityQuestion',
          updatedAt: security && security.answer ? moment( new Date() ).valueOf() : 0,
          status: security && security.answer ? 'accessible' : 'notSetup',
          shareId: keeperInfo.find( value=>value.type == 'securityQuestion' ) ? keeperInfo.find( value=>value.type == 'securityQuestion' ).shareId : randomIdForSecurityQ,
          reshareVersion: 0,
          name: security && security.answer ? 'Encryption Password' : 'Set Password',
        },
        {
          shareType: 'cloud',
          updatedAt: moment( new Date() ).valueOf(),
          status: downloadedBackupData.find( value=>value.backupData.primaryMnemonicShard.shareId == metaShares[ 0 ].shareId ) ? 'accessible': 'notAccessible',
          shareId: metaShares[ 0 ].shareId,
          reshareVersion: 0,
          name: Platform.OS == 'ios' ? 'iCloud' : 'Google Drive'
        },
      ]

      for ( let i = 1; i < metaShares.length; i++ ) {
        const element = metaShares[ i ]
        const status = 'notAccessible'
        let updatedAt = moment( new Date() ).valueOf()
        const channelKey = keeperInfo.find( value => value.shareId == element.shareId ) ? keeperInfo.find( value => value.shareId == element.shareId ).channelKey : ''
        const currentContact: TrustedContact = contacts[ channelKey ]
        if ( currentContact ) {
          const instream: StreamData = useStreamFromContact( currentContact, s3Service.levelhealth.walletId, true )
          if( instream ){
            updatedAt = instream.metaData.flags.lastSeen
          }
        }
        const obj = {
          shareType: keeperInfo.find( value => value.shareId == element.shareId ) ? keeperInfo.find( value => value.shareId == element.shareId ).type : '',
          updatedAt,
          status,
          shareId: element.shareId,
          reshareVersion: 0,
        }
        levelInfo.push( obj )
      }
      levelHealth.push( {
        levelInfo, level
      } )

      console.log( 'INIT_LEVEL_TWO levelHealth', levelHealth )
      yield put( updateHealth( levelHealth, level, 'setupHealthWatcher' ) )
      if ( level == 2 ) yield put( isLevel2InitializedStatus() )
      if ( level == 3 ) {
        yield put( isLevel3InitializedStatus() ); yield put( isLevel2InitializedStatus() )
      }
    }
  }


  // Update status
  yield put( healthCheckInitialized() )
  // Update Initial Health to reduce
  yield put( switchS3LoaderKeeper( 'initLoader' ) )
}

export const setupHealthWatcher = createWatcher(
  setupHealthWorker,
  SETUP_HEALTH_FOR_RESTORE
)

function* updateKeeperInfoToChannelWorker( ) {
  try {
    console.log( 'UPDATE KEEPER INFO' )
    yield put( switchS3LoaderKeeper( 'updateKIToChStatus' ) )
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    const keeperInfo: KeeperInfoInterface[] = yield select( ( state ) => state.health.keeperInfo )
    if ( keeperInfo.length > 0 ) {
      for ( let i = 0; i < keeperInfo.length; i++ ) {
        if( currentLevel == 1 && keeperInfo[ i ].scheme == '1of1' ) keeperInfo[ i ].currentLevel = currentLevel
        else if( currentLevel == 2 && keeperInfo[ i ].scheme == '2of3' ) keeperInfo[ i ].currentLevel = currentLevel
        else if( currentLevel == 3 && keeperInfo[ i ].scheme == '3of5' ) keeperInfo[ i ].currentLevel = currentLevel
      }
    }
    yield put( putKeeperInfo( keeperInfo ) )
    const service: S3Service = yield select( ( state ) => state.health.service )
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const trustedContacts: TrustedContactsService = yield select( ( state ) => state.trustedContacts.service )
    const contacts: Trusted_Contacts = yield select( ( state ) => state.trustedContacts.contacts )
    const MetaShares: MetaShare[] = service.levelhealth.metaSharesKeeper
    const walletId = service.levelhealth.walletId
    const { walletName } = yield select( ( state ) => state.storage.wallet )
    const channelSyncUpdates: {
      channelKey: string,
      streamId: string,
      unEncryptedOutstreamUpdates?: UnecryptedStreamData,
    }[] = []
    if( levelHealth[ 0 ] ) {
      for ( let i = 2; i < levelHealth[ 0 ].levelInfo.length; i++ ) {
        const element = levelHealth[ 0 ].levelInfo[ i ]
        const channelKey = keeperInfo.find( value=>value.shareId == element.shareId ).channelKey
        const primaryData: PrimaryStreamData = {
          contactDetails: contacts[ channelKey ].contactDetails,
          walletID: walletId,
          walletName,
          relationType: TrustedContactRelationTypes.KEEPER,
        }

        const backupData: BackupStreamData = {
          primaryMnemonicShard: {
            ...MetaShares.find( value=>value.shareId == element.shareId ),
            encryptedShare: {
              pmShare: MetaShares.find( value=>value.shareId == element.shareId ).encryptedShare.pmShare,
              smShare: '',
              bhXpub: '',
            }
          },
          keeperInfo
        }

        const streamUpdates: UnecryptedStreamData = {
          streamId: TrustedContacts.getStreamId( walletId ),
          primaryData,
          backupData,
          metaData: {
            flags:{
              active: true,
              newData: true,
              lastSeen: Date.now(),
            },
            version: DeviceInfo.getVersion()
          }
        }

        channelSyncUpdates.push( {
          channelKey,
          streamId: streamUpdates.streamId,
          unEncryptedOutstreamUpdates: streamUpdates,
        } )
      }
    }
    const res = yield call(
      TrustedContactsOperations.syncPermanentChannels,
      channelSyncUpdates
    )
    if ( res.status === 200 ) {
      let temp = {
        isKeeperInfoUpdated2: true,
        isKeeperInfoUpdated3: false
      }
      if( currentLevel == 3 ){
        temp = {
          isKeeperInfoUpdated2: true,
          isKeeperInfoUpdated3: true
        }
      }
      yield put( setIsKeeperInfoUpdated( temp ) )
    }
    yield put( switchS3LoaderKeeper( 'updateKIToChStatus' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'updateKIToChStatus' ) )
    console.log( 'Error autoShareLevel2KeepersWorker', error )
  }
}

export const updateKeeperInfoToChannelWatcher = createWatcher(
  updateKeeperInfoToChannelWorker,
  UPDATE_KEEPER_INFO_TO_CHANNEL
)

function* acceptExistingContactRequestWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'updateKIToChStatus' ) )
    const { channelKey, contactsSecondaryChannelKey } = payload
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    const keeperInfo: KeeperInfoInterface[] = yield select( ( state ) => state.health.keeperInfo )
    if ( keeperInfo.length > 0 ) {
      for ( let i = 0; i < keeperInfo.length; i++ ) {
        if( currentLevel == 1 && keeperInfo[ i ].scheme == '1of1' ) keeperInfo[ i ].currentLevel = currentLevel
        else if( currentLevel == 2 && keeperInfo[ i ].scheme == '2of3' ) keeperInfo[ i ].currentLevel = currentLevel
        else if( currentLevel == 3 && keeperInfo[ i ].scheme == '3of5' ) keeperInfo[ i ].currentLevel = currentLevel
      }
    }
    yield put( putKeeperInfo( keeperInfo ) )
    const service: S3Service = yield select( ( state ) => state.health.service )
    const contacts: Trusted_Contacts = yield select( ( state ) => state.trustedContacts.contacts )
    const walletId = service.levelhealth.walletId
    const { walletName } = yield select( ( state ) => state.storage.wallet )
    const contactInfo = {
      channelKey,
      contactsSecondaryChannelKey
    }
    const primaryData: PrimaryStreamData = {
      contactDetails: contacts[ channelKey ].contactDetails,
      walletID: walletId,
      walletName,
      relationType: TrustedContactRelationTypes.KEEPER,
    }
    const streamUpdates: UnecryptedStreamData = {
      streamId: TrustedContacts.getStreamId( walletId ),
      primaryData,
      metaData: {
        flags:{
          active: true,
          newData: true,
          lastSeen: Date.now(),
        },
        version: DeviceInfo.getVersion()
      }
    }
    // initiate permanent channel
    const channelUpdate =  {
      contactInfo, streamUpdates
    }
    yield put( syncPermanentChannels( {
      permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
      channelUpdates: [ channelUpdate ],
    } ) )
    yield put( switchS3LoaderKeeper( 'updateKIToChStatus' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'updateKIToChStatus' ) )
    console.log( 'Error autoShareLevel2KeepersWorker', error )
  }
}

export const acceptExistingContactRequestWatcher = createWatcher(
  acceptExistingContactRequestWorker,
  ACCEPT_EC_REQUEST
)

function* setupPasswordWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'setupPasswordStatus' ) )
    const { security } = payload
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
    const updatedWallet: Wallet = {
      ...wallet,
      security: security ? security : {
        question: '', answer: ''
      },
    }
    yield put( updateWallet( updatedWallet ) )
    if( security ) {
      // initialize health-check schema on relay
      yield put( initializeHealthSetup() )
    }

    const shareObj =
        {
          walletId: s3Service.getWalletId().data.walletId,
          shareId: levelHealth[ 0 ].levelInfo[ 0 ].shareId,
          reshareVersion: levelHealth[ 0 ].levelInfo[ 0 ].reshareVersion,
          updatedAt: moment( new Date() ).valueOf(),
          status: 'accessible',
          shareType: 'securityQuestion',
          name: 'Encryption Password'
        }
    yield put( updateMSharesHealth( shareObj, true ) )
    yield put( switchS3LoaderKeeper( 'setupPasswordStatus' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'setupPasswordStatus' ) )
    console.log( 'Error setupPasswordStatus', error )
  }
}

export const setupPasswordWatcher = createWatcher(
  setupPasswordWorker,
  SETUP_PASSWORD
)

function* setupLevelHealthWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'initLoader' ) )
    const { level, keeperInfo }: { level: number, keeperInfo: KeeperInfoInterface[] } = payload
    const randomIdForSecurityQ = generateRandomString( 8 )
    const randomIdForCloud = generateRandomString( 8 )
    const scheme = level == 2 ? '2of3': level == 3 ? '3of5' : '1of1'
    const levelHealth = []

    if( level == 1 ){
      const levelInfo = [
        {
          shareType: 'securityQuestion',
          updatedAt: moment( new Date() ).valueOf(),
          status: 'accessible',
          shareId: keeperInfo.find( value=>value.type == 'securityQuestion'  && value.scheme == scheme ) ? keeperInfo.find( value=>value.type == 'securityQuestion'  && value.scheme == scheme ).shareId : randomIdForSecurityQ,
          reshareVersion: 0,
          name: 'Encryption Password',
        },
        {
          shareType: 'cloud',
          updatedAt: moment( new Date() ).valueOf(),
          status: 'accessible',
          shareId: keeperInfo.find( value=>value.type == 'cloud' && value.scheme == scheme ) ? keeperInfo.find( value=>value.type == 'cloud' && value.scheme == scheme ).shareId : randomIdForCloud,
          reshareVersion: 0,
          name: Platform.OS == 'ios' ? 'iCloud' : 'Google Drive',
        },
      ]
      console.log( 'SETUP_LEVEL_HEALTH levelInfo', levelInfo )
      yield put( updateHealth( [ {
        level: 1,
        levelInfo: levelInfo,
      } ], level, 'SETUP_LEVEL_HEALTH' ) )
    } else {
      if ( level == 2 || level == 3 ) {
        const contacts: Trusted_Contacts = yield select( ( state ) => state.trustedContacts.contacts )
        const s3Service: S3Service = yield select( ( state ) => state.health.service )
        const levelInfo: LevelInfo[] = [
          {
            shareType: 'securityQuestion',
            updatedAt: moment( new Date() ).valueOf(),
            status: 'accessible',
            shareId: keeperInfo.find( value=>value.type == 'securityQuestion'  && value.scheme == scheme ) ? keeperInfo.find( value=>value.type == 'securityQuestion'  && value.scheme == scheme ).shareId : randomIdForSecurityQ,
            reshareVersion: 0,
            name: 'Encryption Password',
          },
          {
            shareType: 'cloud',
            updatedAt: moment( new Date() ).valueOf(),
            status: 'accessible',
            shareId: keeperInfo.find( value=>value.type == 'cloud' && value.scheme == scheme ) ? keeperInfo.find( value=>value.type == 'cloud' && value.scheme == scheme ).shareId : '',
            reshareVersion: 0,
            name: Platform.OS == 'ios' ? 'iCloud' : 'Google Drive'
          },
        ]

        for ( let i = 0; i < keeperInfo.length; i++ ) {
          const element = keeperInfo[ i ]
          if( element.scheme == scheme ){
            const obj = {
              shareType: element.type,
              updatedAt: element.createdAt,
              status: 'accessible',
              shareId: element.shareId,
              reshareVersion: 0,
              name: element.name
            }
            if( element.sharePosition == 0 ) levelInfo[ 1 ] = {
              ...levelInfo[ 1 ], shareId: element.shareId
            }
            if( element.sharePosition == 1 ) levelInfo[ 2 ] = {
              ...obj, shareId: element.shareId, name: element.name, shareType: element.type
            }
            if( element.sharePosition == 2 ) levelInfo[ 3 ] = {
              ...obj, shareId: element.shareId, name: element.name, shareType: element.type
            }
            if( element.sharePosition == 3 ) levelInfo[ 4 ] = {
              ...obj, shareId: element.shareId, name: element.name, shareType: element.type
            }
            if( element.sharePosition == 4 ) levelInfo[ 5 ] = {
              ...obj, shareId: element.shareId, name: element.name, shareType: element.type
            }
          }
        }

        levelHealth.push( {
          levelInfo, level
        } )
        console.log( 'SETUP_LEVEL_HEALTH levelInfo', levelInfo )
        yield put( updateHealth( levelHealth, level, 'SETUP_LEVEL_HEALTH' ) )
        if ( level == 2 ) yield put( isLevel2InitializedStatus() )
        if ( level == 3 ) {
          yield put( isLevel3InitializedStatus() ); yield put( isLevel2InitializedStatus() )
        }
      }
    }
    yield put( switchS3LoaderKeeper( 'initLoader' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'initLoader' ) )
    console.log( 'Error setupPasswordStatus', error )
  }
}

export const setupLevelHealthWatcher = createWatcher(
  setupLevelHealthWorker,
  SETUP_LEVEL_HEALTH
)
