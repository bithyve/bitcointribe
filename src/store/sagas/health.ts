import { call, delay, fork, put, select } from 'redux-saga/effects'
import {
  createWatcher,
  requestTimedout,
  serviceGenerator2,
  serviceGeneratorForNewBHR,
} from '../utils/utilities'
import {
  INIT_HEALTH_SETUP,
  CHECK_SHARES_HEALTH,
  UPDATE_SHARES_HEALTH,
  updateMSharesLoader,
  CREATE_N_UPLOAD_ON_EF_CHANNEL,
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
  shareReceived,
  DOWNLOAD_SHARES,
  DOWNLOAD_MSHARE_HEALTH,
  downloadedMShare,
  ErrorReceiving,
  fetchWalletImage,
  RECOVER_WALLET_HEALTH,
  CLOUD_MSHARE,
  FETCH_WALLET_IMAGE_HEALTH,
  switchS3LoaderKeeper,
  UPLOAD_ENC_MSHARE_KEEPER,
  SEND_APPROVAL_REQUEST,
  UPLOAD_SECONDARY_SHARE,
  isLevel3InitializedStatus,
  GENERATE_PDF,
  pdfGenerated,
  onApprovalStatusChange,
  UPLOAD_PDF_SHARE,
  RECOVER_MNEMONIC_HEALTH,
  DOWNLOAD_SM_SHARES,
  secondaryShareDownloaded,
  mnemonicRecoveredHealth,
  RESHARE_WITH_SAME_KEEPER,
  AUTO_SHARE_CONTACT,
  AUTO_DOWNLOAD_SHARE_CONTACT,
  GET_PDF_DATA,
  setPDFInfo,
  SHARE_PDF,
  CONFIRM_PDF_SHARED,
  DOWNLOAD_PDFSHARE_HEALTH,
  downloadedPdfShare,
  KEEPER_INFO,
  putKeeperInfo,
  UPDATE_WALLET_IMAGE_HEALTH,
  EMPTY_SHARE_TRANSFER_DETAILS,
  removeUnwantedUnderCustodyShares,
  REMOVE_UNWANTED_UNDER_CUSTODY,
  UPLOAD_SM_SHARE_FOR_PK,
  GENERATE_SM_META_SHARE,
  isSmMetaSharesCreated,
  UPLOAD_SMSHARE_KEEPER,
  UPLOAD_REQUESTED_SMSHARE,
  UploadSMSuccessfully,
  DELETE_SM_AND_SMSHARES,
  UPDATE_KEEPERINFO_TO_TC,
  UPDATE_KEEPERINFO_UNDER_CUSTODY,
  AUTO_SHARE_LEVEL2_KEEPER,
  DOWNLOAD_SMSHARE_FOR_APPROVAL,
  pdfSuccessfullyCreated,
  SET_LEVEL_TO_NOT_SETUP,
  setIsLevelToNotSetupStatus,
  SET_HEALTH_STATUS,
} from '../actions/health'
import S3Service from '../../bitcoin/services/sss/S3Service'
import { updateHealth } from '../actions/health'
import {
  switchS3LoadingStatus,
  initLoader,
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
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../common/constants/wallet-service-types'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import KeeperService from '../../bitcoin/services/KeeperService'
import {
  EphemeralDataElements,
  INotification,
  Keepers,
  LevelHealthInterface,
  LevelInfo,
  MetaShare,
  notificationTag,
  notificationType,
  ShareUploadables,
  TrustedDataElements,
  VersionHistory,
  WalletImage,
} from '../../bitcoin/utilities/Interface'
import LevelHealth from '../../bitcoin/utilities/LevelHealth/LevelHealth'
import moment from 'moment'
import {
  updateEphemeralChannel,
  updateTrustedChannel,
  updateTrustedContactsInfoLocally,
} from '../actions/trustedContacts'
import crypto from 'crypto'
import { Alert } from 'react-native'
import { ErrorSending } from '../actions/health'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import RelayServices from '../../bitcoin/services/RelayService'
import generatePDFKeeper from '../utils/generatePDFKeeper'
import { generateRandomString, getKeeperInfoFromShareId } from '../../common/CommonFunctions'
import Keeper from '../../bitcoin/utilities/Keeper'
import { ec as EC } from 'elliptic'
const ec = new EC( 'curve25519' )
import Mailer from 'react-native-mail'
import Share from 'react-native-share'
import RNPrint from 'react-native-print'
import idx from 'idx'
import AccountShell from '../../common/data/models/AccountShell'
import { remapAccountShells, restoredAccountShells } from '../actions/accounts'
import PersonalNode from '../../common/data/models/PersonalNode'
import { personalNodeConfigurationSet } from '../actions/nodeSettings'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import Toast from '../../components/Toast'
import { restoredVersionHistory } from '../actions/versionHistory'
import { getVersions } from '../../common/utilities'
import { initLevels } from '../actions/upgradeToNewBhr'

function* initHealthWorker() {
  const s3Service: S3Service = yield select( ( state ) => state.health.service )
  const initialized = s3Service.levelhealth.healthCheckInitializedKeeper

  if ( initialized ) return
  yield put( initLoader( true ) )
  const res = yield call( s3Service.initializeHealthKeeper )
  console.log( 'health initHealthWorker', res )
  if ( res.status === 200 ) {

    // Update status
    yield put( healthCheckInitialized() )
    const { SERVICES } = yield select( ( state ) => state.storage.database )
    const updatedSERVICES = {
      ...SERVICES,
      S3_SERVICE: JSON.stringify( s3Service ),
    }
    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )
    // Update Initial Health to reducer
    const obj = [
      {
        level: 1,
        levelInfo: res.data.levelInfo,
      },
    ]
    yield put( updateHealth( obj, 0 ) )
    yield put( initLoader( false ) )
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    yield put( initLoader( false ) )
  }
}

export const initHealthWatcher = createWatcher(
  initHealthWorker,
  INIT_HEALTH_SETUP
)

function* generateMetaSharesWorker( { payload } ) {
  const s3Service: S3Service = yield select( ( state ) => state.health.service )
  const { walletName } = yield select(
    ( state ) => state.storage.database.WALLET_SETUP
  )
  const appVersion = DeviceInfo.getVersion()
  const { level, isUpgrade } = payload
  const { answer, questionId, question } = yield select(
    ( state ) => state.storage.database.WALLET_SETUP.security
  )

  const secureAssets = {
    secondaryMnemonic: '',
    twoFASecret: '',
    secondaryXpub: '',
    bhXpub: '',
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

      const { SERVICES } = yield select( ( state ) => state.storage.database )
      const updatedSERVICES = {
        ...SERVICES,
        S3_SERVICE: JSON.stringify( s3Service ),
      }
      yield call( insertDBWorker, {
        payload: {
          SERVICES: updatedSERVICES
        }
      } )
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
      yield put( updateHealth( res.data.levels, res.data.currentLevel ) )
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
  // // set a timelapse for auto update and enable instantaneous manual update
  try {
    yield put( updateMSharesLoader( true ) )
    const res = yield call( S3Service.updateHealthKeeper, payload.shares, payload.isNeedToUpdateCurrentLevel )
    if ( res.status === 200 ) {
      if ( res.data.updationResult ) {
        const s3Service: S3Service = yield select(
          ( state ) => state.health.service
        )
        for ( let i = 0; i < res.data.updationResult.length; i++ ) {
          const element = res.data.updationResult[ i ]
          if ( element.walletId == s3Service.getWalletId().data.walletId ) {
            yield put(
              updateHealth(
                res.data.updationResult[ i ].levels,
                res.data.updationResult[ i ].currentLevel
              )
            )
            break
          }
        }
      }
    } else {
      if ( res.err === 'ECONNABORTED' ) requestTimedout()
    }
    yield put( updateMSharesLoader( false ) )
  } catch ( error ) {
    console.log( 'inside UPDATE_SHARES_HEALTH', error )
  }
}

export const updateSharesHealthWatcher = createWatcher(
  updateSharesHealthWorker,
  UPDATE_SHARES_HEALTH
)

function* createAndUploadOnEFChannelWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'keeperSetupStatus' ) )
    const {
      isReshare,
      featuresList,
      isPrimaryKeeper,
      scannedData,
      selectedShareId,
      level,
      isChange,
    } = payload
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const metaShare: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
    const keeperApproveStatus = yield select( ( state ) => state.health.keeperApproveStatus )
    console.log( 'metaShare createAndUploadOnEFChannelWorker', metaShare )
    let shareIndex = level == 2 ? 1 : 3
    if ( selectedShareId && s3Service.levelhealth.metaSharesKeeper.length ) {
      if (
        metaShare.findIndex( ( value ) => value.shareId == selectedShareId ) > -1
      ) {
        shareIndex = metaShare.findIndex(
          ( value ) => value.shareId == selectedShareId
        )
      }
    }
    if ( isReshare || isChange ) {
      yield call( s3Service.reshareMetaShareKeeper, shareIndex )
    }
    const share = metaShare[ shareIndex ]
    const fcmTokenValue = yield select(
      ( state ) => state.preferences.fcmTokenValue
    )
    const type = isPrimaryKeeper ? 'primaryKeeper' : payload.type

    const keeper: KeeperService = yield select( ( state ) => state.keeper.service )

    const securityQuestion = yield select(
      ( state ) => state.storage.database.WALLET_SETUP
    )
    const { DECENTRALIZED_BACKUP, SERVICES } = yield select(
      ( state ) => state.storage.database
    )

    console.log( 's3Service', s3Service.levelhealth.metaSharesKeeper )

    const s3ServiceTest: S3Service = yield select(
      ( state ) => state.accounts[ TEST_ACCOUNT ].service
    )
    const s3ServiceRegular: S3Service = yield select(
      ( state ) => state.accounts[ REGULAR_ACCOUNT ].service
    )
    const s3ServiceSecure: SecureAccount = yield select(
      ( state ) => state.accounts[ SECURE_ACCOUNT ].service
    )
    // All acoount Xpubs
    const testXpub = s3ServiceTest.hdWallet.getTestXPub()
    const regularXpub = s3ServiceRegular.hdWallet.getXpub()
    const secureXpub = s3ServiceSecure.getXpubsForAccount()

    const ScannedData = JSON.parse( scannedData )
    console.log( 'ScannedData', ScannedData )

    let encKey
    if ( ScannedData.uuid ) encKey = LevelHealth.strechKey( ScannedData.uuid )
    const { otpEncryptedData, otp } = LevelHealth.encryptViaOTP( ScannedData.uuid )
    const encryptedKey = otpEncryptedData

    const walletID = s3Service.getWalletId().data.walletId
    let hexaPublicKey = ''
    let trustedChannelAddress = ''
    let EfChannelAddress = ScannedData.ephemeralAddress
    const result = yield call(
      keeper.finalizeKeeper,
      share.shareId,
      ScannedData.publicKey,
      encryptedKey,
      otp,
      ScannedData.uuid,
      featuresList,
      isPrimaryKeeper,
      ScannedData.walletName,
      EfChannelAddress
    )
    console.log( 'result finalizeKeeper', result )

    if ( result.status === 200 ) {
      hexaPublicKey = result.data.publicKey
      trustedChannelAddress = result.data.channelAddress
      EfChannelAddress = result.data.ephemeralAddress

      const dataElements: EphemeralDataElements = {
        publicKey: ScannedData.publicKey, //Keeper scanned public key
        FCM: fcmTokenValue,
        walletID,
        shareTransferDetails: {
          otp,
          encryptedKey,
        },
        DHInfo: {
          publicKey: hexaPublicKey,
        },
        trustedAddress: trustedChannelAddress,
      }
      if ( isReshare ) dataElements.restoreOf = walletID

      const shareUploadables = LevelHealth.encryptMetaShare(
        share,
        ScannedData.uuid
      )

      const res = yield call(
        keeper.updateEphemeralChannel,
        share.shareId,
        type,
        hexaPublicKey,
        EfChannelAddress,
        dataElements,
        ScannedData.uuid,
        shareUploadables
      )
      console.log( 'updateEphemeralChannel saga res', res )
      if ( res.status == 200 ) {
        // Create trusted channel
        const data: TrustedDataElements = {
          xPub: {
            testXpub, regularXpub, secureXpub: secureXpub
          },
          walletID,
          FCM: fcmTokenValue,
          walletName: ScannedData.walletName,
          version: DeviceInfo.getVersion(),
          shareTransferDetails: {
            otp,
            encryptedKey,
          },
          isPrimary: isPrimaryKeeper,
          featuresList,
          securityQuestion,
        }
        if ( isReshare ) {
          data.secondaryShare = [ DECENTRALIZED_BACKUP.PK_SHARE ]
          if( keeperApproveStatus.secondaryShare && keeperApproveStatus.shareId == 'PK_recovery' )
          {
            data.secondaryShare.push( keeperApproveStatus.secondaryShare )
          }
        }
        console.log( 'data TrustedDataElements', data )
        if( isPrimaryKeeper && s3ServiceSecure.secureHDWallet.secondaryMnemonic && s3ServiceSecure.secureHDWallet.twoFASetup.secret ) {
          data.secondaryMnemonics = s3ServiceSecure.secureHDWallet.secondaryMnemonic
          data.twoFASetup = s3ServiceSecure.secureHDWallet.twoFASetup
        }
        const updateRes = yield call(
          keeper.updateTrustedChannel,
          share.shareId,
          data,
          false
        )
        if ( updateRes.status == 200 ) {
          const updatedSERVICES = {
            ...SERVICES,
            S3_SERVICE: JSON.stringify( s3Service ),
            KEEPERS_INFO: JSON.stringify( keeper ),
          }
          yield call( insertDBWorker, {
            payload: {
              SERVICES: updatedSERVICES
            },
          } )
          const shareArray = [
            {
              walletId: s3Service.getWalletId().data.walletId,
              shareId: share.shareId,
              reshareVersion: 0,
              updatedAt: moment( new Date() ).valueOf(),
              name: ScannedData.walletName,
              shareType: type,
              status: 'notAccessible',
            },
          ]
          yield put( updateMSharesHealth( shareArray, false ) )
          const obj = {
            shareId: share.shareId,
            name: ScannedData.walletName,
            uuid: ScannedData.uuid,
            publicKey: ScannedData.publicKey,
            ephemeralAddress: ScannedData.ephemeralAddress,
            type: type,
            data: {
            }
          }
          yield put( updatedKeeperInfo( obj ) )
          yield put( onApprovalStatusChange( {
            status: false,
            initiatedAt: 0,
            shareId: '',
          } ) )
        }
      }
    }
    yield put( switchS3LoaderKeeper( 'keeperSetupStatus' ) )
  } catch ( error ) {
    console.log( 'Error EF channel', error )
    yield put( switchS3LoaderKeeper( 'keeperSetupStatus' ) )
  }
}

export const createAndUploadOnEFChannelWatcher = createWatcher(
  createAndUploadOnEFChannelWorker,
  CREATE_N_UPLOAD_ON_EF_CHANNEL
)

function* uploadSecondaryShareWorker( { payload } ) {
  const { encryptedKey, metaShare, otp } = payload
  console.log( 'uploadSecondaryShareWorker payload', payload )
  const keeper: KeeperService = yield select( ( state ) => state.keeper.service )
  const result = yield call(
    keeper.uploadSecondaryShare,
    encryptedKey,
    metaShare,
    otp
  )
  console.log( 'result', result )
  if ( result.status === 200 ) {
    yield put( secondaryShareDownloaded( null ) )
  }
  yield put( updateMSharesLoader( false ) )
}

export const uploadSecondaryShareWatcher = createWatcher(
  uploadSecondaryShareWorker,
  UPLOAD_SECONDARY_SHARE
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
  console.log( 'isLevelInitialized', isLevelInitialized )
  if ( !isLevelInitialized ) {
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const Health = yield select( ( state ) => state.health.levelHealth )
    let SecurityQuestionHealth
    const randomIdForSecurityQ = generateRandomString( 8 )
    if( Health[ 0 ] && Health[ 0 ].levelInfo && Health[ 0 ].levelInfo[ 1 ] ){
      SecurityQuestionHealth = {
        ...Health[ 0 ].levelInfo[ 1 ], shareId: randomIdForSecurityQ,
      }
    }
    else {
      SecurityQuestionHealth = {
        shareType: 'securityQuestion',
        updatedAt: moment( new Date() ).valueOf(),
        status: 'accessible',
        shareId: randomIdForSecurityQ,
        reshareVersion: 0,
      }
    }
    console.log( 'SecurityQuestionHealth', SecurityQuestionHealth )
    yield put( initLoader( true ) )
    const res = yield call(
      s3Service.updateHealthLevel2,
      SecurityQuestionHealth,
      level
    )
    if ( res.data.success ) {
      // Update Health to reducer
      yield put( checkMSharesHealth() )
      if ( level == 2 ) yield put( isLevel2InitializedStatus() )
      if ( level == 3 ) yield put( isLevel3InitializedStatus() )
    }
    yield put( initLoader( false ) )
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
  yield put( switchS3LoadingStatus( 'restoreWallet' ) )
  const {
    SERVICES,
    WALLET_SETUP,
    DECENTRALIZED_BACKUP,
    ASYNC_DATA,
  } = payload.icloudData.walletImage
  const restorationShares: MetaShare[] = []
  const mnemonics = JSON.parse( SERVICES.S3_SERVICE ).levelhealth.mnemonic
  console.log( 'mnemonics', mnemonics )
  try {
    const { s3Service, } = yield call(
      serviceGeneratorForNewBHR,
      mnemonics,
      restorationShares,
      payload.icloudData
    )
    console.log( 's3Service', s3Service )

    yield put( fetchWalletImage( s3Service, payload.icloudData.walletImage ) )

    yield call(
      AsyncStorage.setItem,
      'walletID',
      s3Service.levelhealth.walletId
    )
    const current = Date.now()
    AsyncStorage.setItem( 'SecurityAnsTimestamp', JSON.stringify( current ) )
    const securityQuestionHistory = {
      confirmed: current,
    }
    AsyncStorage.setItem(
      'securityQuestionHistory',
      JSON.stringify( securityQuestionHistory )
    )
  } catch ( err ) {
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

function* downloadShareWorker( { payload } ) {
  console.log( 'downloadShareWorker', payload )
  const { encryptedKey } = payload

  if ( !encryptedKey ) return
  const res = yield call( S3Service.downloadShare, encryptedKey )

  if ( res.status === 200 ) {
    console.log( 'SHARES DOWNLOAD', res.data )
    // TODO: recreate accounts and write to database
    yield put( shareReceived( res.data ) ) // storing in redux state (for demo)
  } else {
    console.log( {
      err: res.err
    } )
  }
}

export const downloadShareWatcher = createWatcher(
  downloadShareWorker,
  DOWNLOAD_SHARES
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

  let pkShare = {
  }
  let result
  if ( DECENTRALIZED_BACKUP && payload.downloadType !== 'recovery' ) {
    result = yield call( S3Service.downloadSMShare, encryptedKey, otp )
    console.log( 'result', result )
    if ( result && result.data ) {
      pkShare = result.data.metaShare
    }
  }


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
        const shareArray = [
          {
            walletId: walletID,
            shareId: metaShare.shareId,
            reshareVersion: metaShare.meta.reshareVersion,
            updatedAt: moment( new Date() ).valueOf(),
            status: 'accessible',
          },
        ]
        yield put( updateMSharesHealth( shareArray, false ) )
      }
      // yield call(updateDynamicNonPMDDWorker, { payload: { dynamicNonPMDD } }); // upload updated dynamic nonPMDD (TODO: time-based?)
      yield put( downloadedMShare( otp, true ) )
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
      // yield put(downloadedMShare(otp, true));
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
    yield put( downloadedMShare( otp, false, res.err ) )
  }
  yield put( switchS3LoadingStatus( 'downloadMetaShare' ) )
}

export const downloadMetaShareHealthWatcher = createWatcher(
  downloadMetaShareWorker,
  DOWNLOAD_MSHARE_HEALTH
)


export function* downloadPdfShareWorker( { payload } ) {
  yield put( switchS3LoadingStatus( 'downloadPdfShare' ) )

  const { encryptedKey, otp } = payload // OTP is missing when the encryptedKey isn't OTP encrypted

  const s3Service: S3Service = yield select( ( state ) => state.health.service )

  const { DECENTRALIZED_BACKUP } = yield select(
    ( state ) => state.storage.database
  )

  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP
  const data = yield LevelHealth.decryptWithAnswer( encryptedKey, otp )
  const data1 = JSON.parse( data.decryptedString )
  const res = yield call( S3Service.downloadPdfShare, data1.messageId, data1.key )

  console.log( {
    res
  } )
  if ( res.status === 200 ) {
    const { metaShare, encryptedDynamicNonPMDD } = res.data
    let updatedBackup
    if ( payload.downloadType !== 'recovery' ) {
      //TODO: activate DNP Transportation Layer for Hexa Premium
      // const dynamicNonPMDD = {
      //   ...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD,
      //   META_SHARES: DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD.META_SHARES
      //     ? [...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD.META_SHARES, metaShare]
      //     : [metaShare],
      // };

      updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        UNDER_CUSTODY: {
          ...DECENTRALIZED_BACKUP.UNDER_CUSTODY,
          [ metaShare.meta.tag ]: {
            META_SHARE: metaShare,
            ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
          },
        },
        // DYNAMIC_NONPMDD: dynamicNonPMDD,
      }

      console.log( {
        updatedBackup
      } )
      yield call( insertDBWorker, {
        payload: {
          DECENTRALIZED_BACKUP: updatedBackup,
        },
      } )

      // if (payload.downloadType !== "recovery") {
      //   let shareArray = [
      //     {
      //       walletId: walletID,
      //       shareId: metaShare.shareId,
      //       reshareVersion: metaShare.meta.reshareVersion,
      //       updatedAt: moment(new Date()).valueOf(),
      //       shareType: "contact",
      //       status: "accessible",
      //     },
      //   ];
      //   yield put(updateMSharesHealth(shareArray));
      // }
      // yield call(updateDynamicNonPMDDWorker, { payload: { dynamicNonPMDD } }); // upload updated dynamic nonPMDD (TODO: time-based?)
      yield put( downloadedPdfShare( otp, true ) )
      //yield put(updateMSharesHealth());
      yield put( removeUnwantedUnderCustodyShares() )
    } else {
      let updatedRecoveryShares = {
      }
      let updated = false
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
              updated = true
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
      // yield put(downloadedMShare(otp, true));
      yield call( insertDBWorker, {
        payload: {
          DECENTRALIZED_BACKUP: updatedBackup
        },
      } )
    }
  } else {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    yield put( ErrorReceiving( true ) )
    // Alert.alert('Download Failed!', res.err);
    yield put( downloadedPdfShare( otp, false, res.err ) )
  }
  yield put( switchS3LoadingStatus( 'downloadPdfShare' ) )
}

export const downloadPdfShareHealthWatcher = createWatcher(
  downloadPdfShareWorker,
  DOWNLOAD_PDFSHARE_HEALTH
)


function* recoverWalletWorker( { payload } ) {
  yield put( switchS3LoadingStatus( 'restoreWallet' ) )
  const { keeperData, decryptedCloudDataJson } = payload
  console.log( 'KEEPERDATA', keeperData )
  try {
    const { WALLET_SETUP, DECENTRALIZED_BACKUP } = yield select(
      ( state ) => state.storage.database
    )

    const { security } = WALLET_SETUP
    const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP

    let encDynamicNonPMDD
    const mappedMetaShares: { [walletId: string]: MetaShare[] } = {
    }
    Object.keys( RECOVERY_SHARES ).forEach( ( key ) => {
      const { META_SHARE, ENC_DYNAMIC_NONPMDD } = RECOVERY_SHARES[ key ]
      if ( META_SHARE ) {
        // metaShares[key] = META_SHARE; //mapping metaShares according to their shareIndex so that they can be aptly used at ManageBackup
        const shares = mappedMetaShares[ META_SHARE.meta.walletId ]
          ? mappedMetaShares[ META_SHARE.meta.walletId ]
          : []
        let insert = true
        shares.forEach( ( share ) => {
          if ( share.shareId === META_SHARE.shareId ) insert = false
        }, [] )

        if ( insert ) {
          shares.push( META_SHARE )
          mappedMetaShares[ META_SHARE.meta.walletId ] = shares
        }
      }

    } )

    console.log( {
      mappedMetaShares
    } )
    let restorationShares: MetaShare[] = []
    Object.keys( mappedMetaShares ).forEach( ( walletId ) => {
      if ( mappedMetaShares[ walletId ].length >= payload.level )
        restorationShares = mappedMetaShares[ walletId ]
    } )

    console.log( 'restorationShares', restorationShares )
    if ( Object.keys( restorationShares ).length !== payload.level ) {
      Alert.alert( 'Insufficient compatible shares to recover the wallet' )
      yield put( walletRecoveryFailed( true ) )
      throw new Error( 'Insufficient compatible shares to recover the wallet' )
    }

    const encryptedSecrets: string[] = restorationShares.map(
      ( share ) => share.encryptedSecret
    )

    const res = yield call(
      S3Service.recoverFromSecretsKeeper,
      encryptedSecrets,
      security.answer,
      payload.level
    )

    if ( res.status === 200 ) {
      const { mnemonic } = res.data
      console.log( 'mnemonic', mnemonic )
      // const {
      //   regularAcc,
      //   testAcc,
      //   secureAcc,
      //   s3Service,
      //   trustedContacts,
      //   keepersInfo,
      // } = yield call(
      //   serviceGenerator2,
      //   security.answer,
      //   mnemonic,
      //   restorationShares,
      //   decryptedCloudDataJson
      // );
      const { s3Service, } = yield call(
        serviceGeneratorForNewBHR,
        mnemonic,
        restorationShares,
        decryptedCloudDataJson
      )
      console.log( 's3Service', s3Service )
      // const UNDER_CUSTODY = {};
      // let DYNAMIC_NONPMDD = {};
      // if (encDynamicNonPMDD) {
      //   // decentralized restoration of Wards
      //   const res = s3Service.decryptDynamicNonPMDD(encDynamicNonPMDD);

      //   if (res.status !== 200)
      //     console.log("Failed to decrypt dynamic nonPMDD");
      //   const dynamicNonPMDD = res.data.decryptedDynamicNonPMDD;
      //   dynamicNonPMDD.META_SHARES.forEach((metaShare) => {
      //     UNDER_CUSTODY[metaShare.meta.tag] = {
      //       META_SHARE: metaShare,
      //     };
      //   });
      //   DYNAMIC_NONPMDD = dynamicNonPMDD;
      // }

      // const DECENTRALIZED_BACKUP = {
      //   RECOVERY_SHARES: {},
      //   SHARES_TRANSFER_DETAILS: {},
      //   UNDER_CUSTODY: {},
      //   DYNAMIC_NONPMDD: {},
      //   PK_SHARE: {},
      // };
      // console.log({ DECENTRALIZED_BACKUP });

      // const SERVICES = {
      //   REGULAR_ACCOUNT: JSON.stringify(regularAcc),
      //   TEST_ACCOUNT: JSON.stringify(testAcc),
      //   SECURE_ACCOUNT: JSON.stringify(secureAcc),
      //   S3_SERVICE: JSON.stringify(s3Service),
      //   TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
      //   KEEPERS_INFO: JSON.stringify(keepersInfo),
      // };
      // const payload = { SERVICES, DECENTRALIZED_BACKUP };
      // yield call(insertDBWorker, { payload });
      //yield delay(2000); // seconds delay prior to Wallet Image check
      yield put( fetchWalletImage( s3Service ) )

      yield call(
        AsyncStorage.setItem,
        'walletID',
        s3Service.levelhealth.walletId
      )
      const current = Date.now()
      AsyncStorage.setItem( 'SecurityAnsTimestamp', JSON.stringify( current ) )
      const securityQuestionHistory = {
        confirmed: current,
      }
      AsyncStorage.setItem(
        'securityQuestionHistory',
        JSON.stringify( securityQuestionHistory )
      )
      yield put( putKeeperInfo( keeperData ) )
      // yield put(updatedKeeperInfo(keeperData));

    } else {
      throw new Error( res.err )
    }
  } catch ( err ) {
    console.log( {
      err: err.message
    } )
    yield put( walletRecoveryFailed( true ) )
    // Alert.alert('Wallet recovery failed!', err.message);
  }

  yield put( switchS3LoadingStatus( 'restoreWallet' ) )
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

  // yield put(downloadedMShare(otp, true));
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
  const trustedContactsInfo = yield select( ( state ) => state.trustedContacts.trustedContactsInfo )
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

  if ( trustedContactsInfo && trustedContactsInfo.length )
    STATE_DATA[ 'trustedContactsInfo' ] = JSON.stringify( trustedContactsInfo )

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
  const s3Service: S3Service = yield select( ( state ) => state.health.service )
  console.log( 's3SERVICE', s3Service )
  let walletImage: WalletImage = {
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

  const res = yield call( s3Service.updateWalletImageKeeper, walletImage )
  if ( res.status === 200 ) {
    if ( res.data.updated ) console.log( 'Wallet Image updated' )
    yield call( AsyncStorage.setItem, 'WI_HASHES', JSON.stringify( hashesWI ) )
  } else {
    console.log( {
      err: res.err
    } )
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
    const WITemp: WalletImage = payload.WI
    let walletImage: WalletImage
    const res = yield call( s3Service.fetchWalletImageKeeper )
    console.log( {
      res
    } )
    //const { walletImage } = payload
    if ( res.status === 200 && res.data ) {
      walletImage = res.data.walletImage
      console.log( {
        walletImage
      } )

      if ( !Object.keys( walletImage ).length )
        console.log( 'Failed fetch: Empty Wallet Image' )
    } else if( WITemp ){
      walletImage = WITemp
    }
    if( walletImage ){
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
        KEEPERS_INFO
      } = SERVICES
      const services = {
        REGULAR_ACCOUNT: RegularAccount.fromJSON( REGULAR_ACCOUNT ),
        TEST_ACCOUNT: TestAccount.fromJSON( TEST_ACCOUNT ),
        SECURE_ACCOUNT: SecureAccount.fromJSON( SECURE_ACCOUNT ),
        S3_SERVICE: S3Service.fromJSON( S3_SERVICE ),
        TRUSTED_CONTACTS: TRUSTED_CONTACTS
          ? TrustedContactsService.fromJSON( TRUSTED_CONTACTS )
          : new TrustedContactsService(),
        KEEPERS_INFO: KeeperService.fromJSON( KEEPERS_INFO )
      }
      yield put( remapAccountShells( services ) )
      console.log( 'services', services )

      if ( ASYNC_DATA ) {
        for ( const key of Object.keys( ASYNC_DATA ) ) {
          console.log( 'restoring to async: ', key )
          yield call( AsyncStorage.setItem, key, ASYNC_DATA[ key ] )

          if ( key === 'TrustedContactsInfo' && ASYNC_DATA[ key ] ) {
            const trustedContactsInfo = JSON.parse( ASYNC_DATA[ key ] )
            yield put( updateTrustedContactsInfoLocally( trustedContactsInfo ) )
          }
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

              case 'trustedContactsInfo':
                const trustedContactsInfo = JSON.parse( STATE_DATA[ key ] )
                yield put( updateTrustedContactsInfoLocally( trustedContactsInfo ) )
                break

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
    yield put( walletImageChecked( false ) )
    console.log( 'ERROR', error )
  }
}

export const fetchWalletImageHealthWatcher = createWatcher(
  fetchWalletImageWorker,
  FETCH_WALLET_IMAGE_HEALTH
)

function* uploadEncMetaShareKeeperWorker( { payload } ) {
  try {
  // Transfer: User >>> Guardian
    yield put( switchS3LoaderKeeper( 'uploadMetaShare' ) )
    const { index } = payload

    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    if ( !s3Service.levelhealth.metaSharesKeeper.length ) return
    const trustedContacts: TrustedContactsService = yield select(
      ( state ) => state.trustedContacts.service
    )
    const keepersInfo: KeeperService = yield select(
      ( state ) => state.keeper.service
    )
    const regularService: RegularAccount = yield select(
      ( state ) => state.accounts[ REGULAR_ACCOUNT ].service
    )
    const { DECENTRALIZED_BACKUP, SERVICES } = yield select(
      ( state ) => state.storage.database
    )
    const keeperInfoData = yield select(
      ( state ) => state.health.keeperInfo
    )
    const answer = yield select( ( state ) => state.storage.database.WALLET_SETUP.security.answer )
    const secondaryShareDownloaded = yield select( ( state ) => state.health.secondaryShareDownloaded )

    let shareIndex = 2
    if ( payload.shareId && s3Service.levelhealth.metaSharesKeeper.length ) {
      const metaShare: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
      if ( metaShare.findIndex( ( value ) => value.shareId == payload.shareId ) > -1 ) {
        shareIndex = metaShare.findIndex(
          ( value ) => value.shareId == payload.shareId
        )
      }
    }
    const response = yield call( s3Service.updateKeeperInfoToMetaShare, keeperInfoData, answer )
    console.log( 'updateKeeperInfoToMetaShare response', response )
    if( payload.changingGuardian ){
      yield call( s3Service.reshareMetaShareKeeper, shareIndex )
      console.log( 'updateKeeperInfoToMetaShare s3Service', s3Service.levelhealth.metaSharesKeeper )
    }
    console.log( 'updateKeeperInfoToMetaShare payload.previousGuardianName', payload.previousGuardianName )
    console.log( 'updateKeeperInfoToMetaShare trustedContacts.tc.trustedContacts', trustedContacts.tc.trustedContacts )
    if( trustedContacts.tc.trustedContacts[ payload.previousGuardianName ] ) {
      if ( payload.previousGuardianName && trustedContacts.tc.trustedContacts[ payload.previousGuardianName ] ) {
        trustedContacts.tc.trustedContacts[
          payload.previousGuardianName
        ].isGuardian = false
      } else {
      // preventing re-uploads till expiry
        if ( DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[ index ] ) {
          if (
            Date.now() -
            DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[ index ].UPLOADED_AT <
          config.TC_REQUEST_EXPIRY
          ) {
          // re-upload after 10 minutes (removal sync w/ relayer)
            yield put( switchS3LoaderKeeper( 'uploadMetaShare' ) )

            return
          }
        }
      }
    }

    // TODO: reactivate DNP Transportation for Hexa Premium
    // const { DYNAMIC_NONPMDD } = DECENTRALIZED_BACKUP;
    // let dynamicNonPMDD;
    // if (Object.keys(DYNAMIC_NONPMDD).length) dynamicNonPMDD = DYNAMIC_NONPMDD; // Nothing in DNP

    // const res = yield call(
    //   s3Service.uploadShare,
    //   shareIndex,
    //   dynamicNonPMDD,
    // );

    const res = yield call(
      s3Service.prepareShareUploadablesKeeper,
      shareIndex,
      payload.contactInfo.contactName
    ) // contact injection (requires database insertion)

    console.log( 'prepareShareUploadablesKeeper s3Service', s3Service )
    console.log( 'prepareShareUploadablesKeeper res', res )

    if ( res.status === 200 ) {
      const {
        otp,
        encryptedKey,
        encryptedMetaShare,
        messageId,
        encryptedDynamicNonPMDD,
      } = res.data

      const shareUploadables: ShareUploadables = {
        encryptedMetaShare,
        messageId,
        encryptedDynamicNonPMDD,
      }
      const updatedSERVICES = {
        ...SERVICES,
        REGULAR_ACCOUNT: JSON.stringify( regularService ),
        S3_SERVICE: JSON.stringify( s3Service ),
        TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
        KEEPERS_INFO: JSON.stringify( keepersInfo ),
      }

      const updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        SHARES_TRANSFER_DETAILS: {
          ...DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
          [ index ]: {
            OTP: otp,
            ENCRYPTED_KEY: encryptedKey,
            UPLOADED_AT: Date.now(),
          },
        },
      }
      console.log( 'Upload STD updatedBackup', updatedBackup )
      // yield call(insertDBWorker, {
      //   payload: {
      //     DECENTRALIZED_BACKUP: updatedBackup,
      //     SERVICES: updatedSERVICES,
      //   },
      // });

      const updatedDB = {
        DECENTRALIZED_BACKUP: updatedBackup,
        SERVICES: updatedSERVICES,
      }

      const contact =
      trustedContacts.tc.trustedContacts[ payload.contactInfo.contactName ]
      console.log( 'updateKeeperInfoToMetaShare contact', contact )
      if ( contact && contact.symmetricKey ) {
      // Upload secondary share
        if( s3Service.levelhealth.SMMetaSharesKeeper.length ){
          yield call( uploadSecondaryShareWorker, {
            payload: {
              encryptedKey, metaShare: s3Service.levelhealth.SMMetaSharesKeeper[ 1 ], otp
            }
          } )
        } else {
          if( secondaryShareDownloaded ) {
            yield call( uploadSecondaryShareWorker, {
              payload: {
                encryptedKey, metaShare: secondaryShareDownloaded, otp
              }
            } )
          } else {
            const response = yield call( uploadSMShareWorker, {
              payload: {
                otp, encryptedKey
              }
            } )
          }
        }

        // has trusted channel
        const data: TrustedDataElements = {
        // won't include elements from payload.data
          shareTransferDetails: {
            otp,
            encryptedKey,
          },
        }
        console.log( 'TrustedDataElements data', data )
        yield put(
          updateTrustedChannel(
            payload.contactInfo,
            data,
            null,
            shareUploadables,
            updatedDB
          )
        )
      } else {
      // Upload secondary share
        if( s3Service.levelhealth.SMMetaSharesKeeper.length ){
          yield call( uploadSecondaryShareWorker, {
            payload: {
              encryptedKey, metaShare: s3Service.levelhealth.SMMetaSharesKeeper[ 1 ], otp
            }
          } )
        } else {
          if( secondaryShareDownloaded ) {
            yield call( uploadSecondaryShareWorker, {
              payload: {
                encryptedKey, metaShare: secondaryShareDownloaded, otp
              }
            } )
          } else {
            const response = yield call( uploadSMShareWorker, {
              payload: {
                otp, encryptedKey
              }
            } )
          }
        }
        // adding transfer details to he ephemeral data
        const data: EphemeralDataElements = {
          ...payload.data,
          shareTransferDetails: {
            otp,
            encryptedKey,
          },
        }

        console.log( 'EphemeralDataElements data', data )

        yield put(
          updateEphemeralChannel(
            payload.contactInfo,
            data,
            null,
            null,
            null,
            shareUploadables,
            updatedDB,
            true
          )
        )
      }
    } else {
      if ( res.err === 'ECONNABORTED' ) requestTimedout()
      yield put( ErrorSending( true ) )
      // Alert.alert('Upload Failed!', res.err);
      console.log( {
        err: res.err
      } )
    }
    yield put( switchS3LoaderKeeper( 'uploadMetaShare' ) )
  } catch ( error ) {
    console.log( 'uploadMetaShare error', error )
    yield put( switchS3LoaderKeeper( 'uploadMetaShare' ) )
  }
}

export const uploadEncMetaShareKeeperWatcher = createWatcher(
  uploadEncMetaShareKeeperWorker,
  UPLOAD_ENC_MSHARE_KEEPER
)

function* sendApprovalRequestWorker( { payload } ) {
  yield put( switchS3LoaderKeeper( 'approvalRequest' ) )
  const { shareID, PkShareId, notificationType } = payload
  const keeper = yield select( ( state ) => state.keeper.service )
  const keeperInfo: Keepers = keeper.keeper.keepers
  let keeperTCData
  if( !keeperInfo[ PkShareId ] ){
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    keeperTCData = keeperInfo[ levelHealth[ 1 ].levelInfo[ 2 ].shareId ]
  }
  else keeperTCData = keeperInfo[ PkShareId ]
  console.log( 'keeperTCData', keeperTCData )
  if ( keeperTCData && keeperTCData.keeperUUID ) {
    const title =
      notificationType == 'uploadSecondaryShare'
        ? 'Approval Request for Keeper'
        : 'Approval Request for Keeper'
    const notification: INotification = {
      notificationType: notificationType,
      title: title,
      body: 'Approval Keeper setup',
      data: JSON.stringify( {
        shareID
      } ),
      tag: notificationTag.IMP,
      date: new Date(),
    }
    const res = yield call(
      RelayServices.sendKeeperNotifications,
      [ keeperTCData.keeperUUID ],
      notification
    )
  }
  yield put( switchS3LoaderKeeper( 'approvalRequest' ) )
}

export const sendApprovalRequestWatcher = createWatcher(
  sendApprovalRequestWorker,
  SEND_APPROVAL_REQUEST
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
    ( state ) => state.storage.database.WALLET_SETUP
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

function* uploadPdfShareWorker( { payload } ) {
  try {
    const { isReshare, selectedShareId } = payload
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const levelHealth = yield select( ( state ) => state.health.levelHealth )
    const share = getKeeperInfoFromShareId( levelHealth, selectedShareId )
    const type = 'pdf'

    yield put( updateMSharesLoader( true ) )
    const keeper: KeeperService = yield select( ( state ) => state.keeper.service )

    const securityQuestion = yield select(
      ( state ) => state.storage.database.WALLET_SETUP
    )
    const { DECENTRALIZED_BACKUP, SERVICES } = yield select(
      ( state ) => state.storage.database
    )

    if ( isReshare ) {
      let shareIndex = 1
      if ( share.shareId && s3Service.levelhealth.metaSharesKeeper.length ) {
        const metaShare: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
        if (
          metaShare.findIndex( ( value ) => value.shareId == share.shareId ) > -1
        ) {
          shareIndex = metaShare.findIndex(
            ( value ) => value.shareId == share.shareId
          )
        }
      }
      yield call( s3Service.reshareMetaShareKeeper, shareIndex )
    }

    const s3ServiceTest: S3Service = yield select(
      ( state ) => state.accounts[ TEST_ACCOUNT ].service
    )
    const s3ServiceRegular: S3Service = yield select(
      ( state ) => state.accounts[ REGULAR_ACCOUNT ].service
    )
    const s3ServiceSecure: SecureAccount = yield select(
      ( state ) => state.accounts[ SECURE_ACCOUNT ].service
    )

    // let encKey;
    // if (ScannedData.uuid) encKey = LevelHealth.strechKey(ScannedData.uuid);
    // let { otpEncryptedData, otp } = LevelHealth.encryptViaOTP(ScannedData.uuid);
    // const encryptedKey = otpEncryptedData;

    // let walletID = s3Service.getWalletId().data.walletId;
    // let hexaPublicKey = '';
    // let trustedChannelAddress = '';
    // let EfChannelAddress = ScannedData.ephemeralAddress;
    // const result = yield call(
    //   keeper.finalizeKeeper,
    //   share.shareId,
    //   ScannedData.publicKey,
    //   encKey,
    //   ScannedData.uuid,
    //   featuresList,
    //   isPrimaryKeeper,
    //   ScannedData.walletName,
    // );
    // if (result.status === 200) {
    //   hexaPublicKey = result.data.publicKey;
    //   trustedChannelAddress = result.data.channelAddress;
    //   EfChannelAddress = result.data.ephemeralAddress;

    //   let dataElements: EphemeralDataElements = {
    //     publicKey: ScannedData.publicKey, //Keeper scanned public key
    //     FCM: fcmTokenValue,
    //     walletID,
    //     shareTransferDetails: {
    //       otp,
    //       encryptedKey,
    //     },
    //     DHInfo: {
    //       publicKey: hexaPublicKey,
    //     },
    //     trustedAddress: trustedChannelAddress,
    //   };
    //   if (isReshare) dataElements.restoreOf = walletID;

    //   const shareUploadables = LevelHealth.encryptMetaShare(
    //     share,
    //     ScannedData.uuid,
    //   );
    //   console.log('ScannedData.publicKey', ScannedData.publicKey,dataElements);

    //   let res = yield call(
    //     keeper.updateEphemeralChannel,
    //     share.shareId,
    //     type,
    //     hexaPublicKey,
    //     EfChannelAddress,
    //     dataElements,
    //     ScannedData.uuid,
    //     shareUploadables,
    //   );
    //   console.log('updateEphemeralChannel saga res', res);
    //   if (res.status == 200) {
    //     // Create trusted channel
    // const data: TrustedDataElements = {
    //   walletID,
    //   // FCM: fcmTokenValue,
    //   walletName: ScannedData.walletName,
    //   version: DeviceInfo.getVersion(),
    //   shareTransferDetails: {
    //     otp,
    //     encryptedKey,
    //   },
    //   // isPrimary: isPrimaryKeeper,
    //   // featuresList,
    //   securityQuestion,
    // };
    // const updateRes = yield call(
    //   keeper.updateTrustedChannel,
    //   share.shareId,
    //   data,
    //   false,
    // );
    //     if (updateRes.status == 200) {
    //       const updatedSERVICES = {
    //         ...SERVICES,
    //         S3_SERVICE: JSON.stringify(s3Service),
    //         KEEPERS_INFO: JSON.stringify(keeper),
    //       };
    //       console.log('updatedSERVICES UPDATE_SHARES_HEALTH EF CHANNEL', updatedSERVICES);
    //       yield call(insertDBWorker, {
    //         payload: { SERVICES: updatedSERVICES },
    //       });
    //       if (isReshare) {
    //         yield call(uploadSecondaryShareWorker, {
    //           payload: {
    //             encryptedKey: dataElements.shareTransferDetails.encryptedKey,
    //             metaShare: DECENTRALIZED_BACKUP.PK_SHARE,
    //             otp: dataElements.shareTransferDetails.otp,
    //           },
    //         });
    //       }
    //       let shareArray = [
    //         {
    //           walletId: s3Service.getWalletId().data.walletId,
    //           shareId: share.shareId,
    //           reshareVersion: 0,
    //           updatedAt: moment(new Date()).valueOf(),
    //           name: ScannedData.walletName,
    //           shareType: type,
    //         },
    //       ];
    //       yield put(updateMSharesHealth(shareArray));
    //       let keeperInfo = yield select((state) => state.health.keeperInfo);
    //       let flag = false;
    //       if (keeperInfo.length > 0) {
    //         for (let i = 0; i < keeperInfo.length; i++) {
    //           const element = keeperInfo[i];
    //           if (element.shareId == share.shareId) {
    //  flag = false;
    //             keeperInfo[i].name = ScannedData.walletName;
    //             keeperInfo[i].uuid = ScannedData.uuid;
    //             keeperInfo[i].publicKey = ScannedData.publicKey;
    //             keeperInfo[i].ephemeralAddress = ScannedData.ephemeralAddress;
    //             keeperInfo[i].type = type;
    //             break;
    //           } else {
    //             flag = true;
    //           }
    //         }
    //       } else {
    //         flag = true;
    //       }
    //       if (flag) {
    //         let obj = {
    //           shareId: share.shareId,
    //           name: ScannedData.walletName,
    //           uuid: ScannedData.uuid,
    //           publicKey: ScannedData.publicKey,
    //           ephemeralAddress: ScannedData.ephemeralAddress,
    //           type,
    //         };
    //         keeperInfo.push(obj);
    //       }
    //       yield put(updatedKeeperInfo(keeperInfo));
    //       yield put(onApprovalStatusChange({
    //   status: false,
    //   initiatedAt: 0,
    //   shareId: '',
    // });
    //     }
    //   }
    // }
    yield put( updateMSharesLoader( false ) )
  } catch ( error ) {
    console.log( 'Error EF channel', error )
  }
}

export const uploadPdfShareWatcher = createWatcher(
  uploadPdfShareWorker,
  UPLOAD_PDF_SHARE
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

function* downloadSMShareWorker( { payload } ) {
  const { encryptedKey, otp } = payload

  if ( !encryptedKey ) return
  const res = yield call( S3Service.downloadSMShare, encryptedKey, otp )
  console.log( 'Keeper Shares', res )
  if ( res.status === 200 ) {
    console.log( 'SHARES DOWNLOAD', res.data )
    yield put( secondaryShareDownloaded( res.data.metaShare ) )
    // TODO: recreate accounts and write to database
  } else {
    console.log( {
      err: res.err
    } )
  }
}

export const downloadSMShareWatcher = createWatcher(
  downloadSMShareWorker,
  DOWNLOAD_SM_SHARES
)

function* reShareWithSameKeeperWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'reshareWithSameKeeper' ) )
    const { deviceLevelInfo } = payload
    const levelHealth: LevelHealthInterface[] = yield select(
      ( state ) => state.health.levelHealth
    )

    for ( let i = 0; i < deviceLevelInfo.length; i++ ) {
      const element = deviceLevelInfo[ i ]
      if ( levelHealth[ 2 ].levelInfo[ element.index ].status != 'accessible' ) {
        const type = element.shareType
        const oldShareId = element.shareId
        const selectedShareId = element.newShareId
        const name = element.name
        console.log( 'deviceLevelInfo', element )
        const { SERVICES } = yield select( ( state ) => state.storage.database )
        const keeper: KeeperService = yield select(
          ( state ) => state.keeper.service
        )
        const keeperInfo: Keepers = keeper.keeper.keepers

        const s3Service: S3Service = yield select(
          ( state ) => state.health.service
        )
        const metaShare: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
        let shareIndex = 3
        if ( selectedShareId && s3Service.levelhealth.metaSharesKeeper.length ) {
          if (
            metaShare.findIndex( ( value ) => value.shareId == selectedShareId ) >
            -1
          ) {
            shareIndex = metaShare.findIndex(
              ( value ) => value.shareId == selectedShareId
            )
          }
        }
        console.log( 'oldShareId', oldShareId )
        console.log( 'keeperInfo', keeperInfo )
        const share = metaShare[ shareIndex ]
        const oldKeeperInfo = keeperInfo[ oldShareId ]
        console.log( 'oldKeeperInfo oldShareId', oldKeeperInfo )
        const result = yield call(
          keeper.initKeeperFromOldKeeper,
          oldShareId,
          selectedShareId
        )
        console.log(
          'keeper after finalize selectedShareId',
          keeper.keeper.keepers[ selectedShareId ]
        )
        if ( result.status === 200 ) {
          const data: TrustedDataElements = {
            metaShare: share
          }
          const updateRes = yield call(
            keeper.updateTrustedChannel,
            share.shareId,
            data,
            false
          )
          if ( updateRes.status == 200 ) {
            const keeperInfo: any[] = yield select(
              ( state ) => state.health.keeperInfo
            )
            if ( keeperInfo.length > 0 ) {
              const index = keeperInfo.findIndex(
                ( value ) => value.shareId == oldShareId
              )
              let object
              if ( index > -1 ) {
                object = {
                  ...keeperInfo[ index ]
                }
                object.shareId = selectedShareId
              }
              if ( object ) {
                const obj = {
                  shareId: selectedShareId,
                  name: object.name,
                  uuid: object.uuid,
                  publicKey: object.publicKey,
                  ephemeralAddress: object.ephemeralAddress,
                  type: object.type,
                  data: {
                  }
                }
                yield put( updatedKeeperInfo( obj ) )
              }
            }
            const updatedSERVICES = {
              ...SERVICES,
              S3_SERVICE: JSON.stringify( s3Service ),
              KEEPERS_INFO: JSON.stringify( keeper ),
            }
            yield call( insertDBWorker, {
              payload: {
                SERVICES: updatedSERVICES
              },
            } )

            const shareArray = [
              {
                walletId: s3Service.getWalletId().data.walletId,
                shareId: selectedShareId,
                reshareVersion: share.meta.reshareVersion,
                updatedAt: moment( new Date() ).valueOf(),
                shareType: type,
                name,
                status: 'accessible',
              },
            ]
            yield put( updateMSharesHealth( shareArray, false ) )
          }

          if ( oldKeeperInfo.keeperUUID ) {
            const notification: INotification = {
              notificationType: notificationType.reShare,
              title: 'New share uploaded',
              body: 'New share uploaded. Please download the share.',
              data: JSON.stringify( {
                selectedShareId
              } ),
              tag: notificationTag.IMP,
              date: new Date(),
            }
            const ress = yield call(
              RelayServices.sendKeeperNotifications,
              [ oldKeeperInfo.keeperUUID ],
              notification
            )
          }
        }
      }
    }
    yield put( switchS3LoaderKeeper( 'reshareWithSameKeeper' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'reshareWithSameKeeper' ) )
    console.log( 'Error EF channel', error )
  }
}

export const reShareWithSameKeeperWatcher = createWatcher(
  reShareWithSameKeeperWorker,
  RESHARE_WITH_SAME_KEEPER
)

function* autoShareContactWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'autoShareContact' ) )
    const { contactLevelInfo } = payload
    const levelHealth: LevelHealthInterface[] = yield select(
      ( state ) => state.health.levelHealth
    )


    for ( let i = 0; i < contactLevelInfo.length; i++ ) {
      const element = contactLevelInfo[ i ]
      if ( levelHealth[ 2 ].levelInfo[ element.index ].status != 'accessible' ) {
        const type = element.shareType
        const oldShareId = element.shareId
        const selectedShareId = element.newShareId
        const name: string = element.name
        const { SERVICES } = yield select( ( state ) => state.storage.database )
        const trustedContacts: TrustedContactsService = yield select(
          ( state ) => state.trustedContacts.service
        )
        const trustedContactsInfo: Keepers = trustedContacts.tc.trustedContacts
        const s3Service: S3Service = yield select( ( state ) => state.health.service )
        const metaShare: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
        const walletId = s3Service.getWalletId().data.walletId
        let shareIndex = 3
        if ( selectedShareId && s3Service.levelhealth.metaSharesKeeper.length ) {
          if (
            metaShare.findIndex( ( value ) => value.shareId == selectedShareId ) > -1
          ) {
            shareIndex = metaShare.findIndex(
              ( value ) => value.shareId == selectedShareId
            )
          }
        }
        const share = metaShare[ shareIndex ]
        const oldKeeperInfo = trustedContactsInfo[ name.toLowerCase() ]
        const data: TrustedDataElements = {
          metaShare: share
        }
        const res = yield call(
          trustedContacts.updateTrustedChannel,
          name,
          data,
          false
        )
        if ( res.status == 200 ) {
          const keeperInfo: any[] = yield select(
            ( state ) => state.health.keeperInfo
          )
          if ( keeperInfo.length > 0 ) {
            const index = keeperInfo.findIndex(
              ( value ) => value.shareId == oldShareId
            )
            let object
            if ( index > -1 ) {
              object = {
                ...keeperInfo[ index ]
              }
              object.shareId = selectedShareId
            }
            if ( object ) {
              yield put( updatedKeeperInfo( object ) )
            }
          }
          const updatedSERVICES = {
            ...SERVICES,
            S3_SERVICE: JSON.stringify( s3Service ),
            TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
          }
          yield call( insertDBWorker, {
            payload: {
              SERVICES: updatedSERVICES
            },
          } )

          const shareArray = [
            {
              walletId: walletId,
              shareId: selectedShareId,
              reshareVersion: share.meta.reshareVersion,
              updatedAt: moment( new Date() ).valueOf(),
              shareType: type,
              name,
              status: 'accessible',
            },
          ]
          yield put( updateMSharesHealth( shareArray, false ) )
          const notification: INotification = {
            notificationType: notificationType.reShare,
            title: 'New share uploaded',
            body: 'New share uploaded.',
            data: JSON.stringify( {
              selectedShareId, walletId: walletId
            } ),
            tag: notificationTag.IMP,
            date: new Date(),
          }
          const ress = yield call(
            RelayServices.sendNotifications,
            [ {
              walletId: oldKeeperInfo.walletID, FCMs: oldKeeperInfo.FCMs
            } ],
            notification
          )
        }
      }
    }
    yield put( switchS3LoaderKeeper( 'autoShareContact' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'autoShareContact' ) )
    console.log( 'Error EF channel', error )
  }
}

export const autoShareContactWatcher = createWatcher(
  autoShareContactWorker,
  AUTO_SHARE_CONTACT
)

function* autoDownloadShareContactWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'autoDownloadShareContact' ) )
    const { shareId, walletId } = payload
    const { DECENTRALIZED_BACKUP } = yield select(
      ( state ) => state.storage.database
    )
    const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP

    let existingShares: MetaShare[]
    if ( Object.keys( UNDER_CUSTODY ).length ) {
      existingShares = Object.keys( UNDER_CUSTODY ).map( ( tag ) => {
        return UNDER_CUSTODY[ tag ].META_SHARE
      } )
    }
    let metaShare: MetaShare
    console.log( 'existingShares autoDownloadShareContactWorker', existingShares )

    if ( existingShares ) {
      for ( let i = 0; i < existingShares.length; i++ ) {
        const element = existingShares[ i ]
        console.log( 'element', element )
        if ( element.shareId != shareId && element.meta.walletId == walletId ) {
          metaShare = element
        }
      }
    }

    if ( metaShare ) {
      let index
      const trustedContactsService: TrustedContactsService = yield select(
        ( state ) => state.trustedContacts.service
      )
      const trustedContacts = trustedContactsService.tc.trustedContacts
      let TContacts
      const contactNameArr = []
      if ( Object.keys( trustedContacts ).length ) {
        TContacts = Object.keys( trustedContacts ).map( ( tag ) => {
          contactNameArr.push( tag )
          return trustedContacts[ tag ]
        } )
      }
      if ( TContacts ) {
        for ( let i = 0; i < TContacts.length; i++ ) {
          const element = TContacts[ i ]
          if ( element.walletID == walletId ) {
            index = i
          }
        }
      }
      if (
        ( index != undefined || index != null ) &&
        TContacts[ index ].trustedChannel &&
        TContacts[ index ].trustedChannel.address
      ) {

        const res = yield call(
          trustedContactsService.fetchTrustedChannel,
          contactNameArr[ index ],
          TContacts[ index ].contactsWalletName
        )
        // console.log("data", res.data.data.metaShare);
        // console.log("underCustody[TContacts[index].contactsWalletName].META_SHARE", UNDER_CUSTODY[TContacts[index].contactsWalletName].META_SHARE);

        const updatedBackup = {
          ...DECENTRALIZED_BACKUP,
          UNDER_CUSTODY: {
            ...DECENTRALIZED_BACKUP.UNDER_CUSTODY,
            [ TContacts[ index ].contactsWalletName ]: {
              META_SHARE: res.data.data.metaShare,
              SECONDARY_SHARE: res.data.data.secondaryShare ? res.data.data.secondaryShare : null,
            },
          },
        }

        console.log( 'updatedBackup', updatedBackup )
        yield call( insertDBWorker, {
          payload: {
            DECENTRALIZED_BACKUP: updatedBackup,
          },
        } )
      }
      const notification: INotification = {
        notificationType: notificationType.reShareResponse,
        title: 'New share downloaded',
        body: 'New share downloaded.',
        data: JSON.stringify( {
          selectedShareId: shareId
        } ),
        tag: notificationTag.IMP,
        date: new Date(),
      }
      const ress = yield call(
        RelayServices.sendNotifications,
        [ {
          walletId: TContacts[ index ].walletID, FCMs: TContacts[ index ].FCMs
        } ],
        notification
      )
    }

    yield put( switchS3LoaderKeeper( 'autoDownloadShareContact' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'autoDownloadShareContact' ) )
    console.log( 'Error EF channel', error )
  }
}

export const autoDownloadShareContactWatcher = createWatcher(
  autoDownloadShareContactWorker,
  AUTO_DOWNLOAD_SHARE_CONTACT
)

function* getPDFDataWorker( { payload } ) {
  try {
    const { shareId, isReShare } = payload
    let shareIndex = 3
    yield put( switchS3LoaderKeeper( 'pdfDataProcess' ) )
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    if (
      shareId &&
        s3Service.levelhealth.metaSharesKeeper.length &&
        s3Service.levelhealth.metaSharesKeeper.findIndex( ( value ) => value.shareId == shareId ) > -1
    ) {
      shareIndex = s3Service.levelhealth.metaSharesKeeper.findIndex( ( value ) => value.shareId == shareId )
    }
    const primaryShare: MetaShare = s3Service.levelhealth.metaSharesKeeper[ shareIndex ]
    const obj = {
      shareId: primaryShare.shareId,
      name: 'Keeper PDF',
      uuid: '',
      publicKey: '',
      ephemeralAddress: '',
      type: 'pdf',
      data: {
      }
    }
    yield put( updatedKeeperInfo( obj ) )

    const { WALLET_SETUP, SERVICES } = yield select( ( state ) => state.storage.database )
    const keeper: KeeperService = yield select( ( state ) => state.keeper.service )
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const currentLevel: number = yield select( ( state ) => state.health.currentLevel )
    const keeperInfo = yield select( ( state ) => state.health.keeperInfo )
    const secondaryShareDownloaded = yield select( ( state ) => state.health.secondaryShareDownloaded )
    const response = yield call( s3Service.updateKeeperInfoToMetaShare, keeperInfo, WALLET_SETUP.security.answer )
    let secondaryShare
    // TODO get primaryKeeper shareID
    if( s3Service.levelhealth.SMMetaSharesKeeper && s3Service.levelhealth.SMMetaSharesKeeper.length ){
      secondaryShare = s3Service.levelhealth.SMMetaSharesKeeper[ 1 ]
    } else {
      if( secondaryShareDownloaded ) {
        secondaryShare = secondaryShareDownloaded
      } else {
        const PKShareId =
        currentLevel == 2 || currentLevel == 1
          ? levelHealth[ 1 ].levelInfo[ 2 ].shareId
          : levelHealth[ 1 ].levelInfo[ 2 ].shareId
        const res = yield call(
          keeper.fetchTrustedChannel,
          PKShareId,
          WALLET_SETUP.walletName
        )
        if ( res.status == 200 ) {
          const data: TrustedDataElements = res.data.data
          secondaryShare = data.pdfShare
        }
      }
    }

    if ( secondaryShare ) {
      const pdfInfo: {
        filePath: string;
        publicKey: string;
        privateKey: string;
      } = yield select( ( state ) => state.health.pdfInfo )
      const walletId = s3Service.levelhealth.walletId

      if ( isReShare ) {
        yield call( s3Service.reshareMetaShareKeeper, shareIndex )
      }
      let publicKey = pdfInfo.publicKey
      let privateKey = pdfInfo.privateKey
      let pdfPath = pdfInfo.filePath
      if ( pdfInfo.publicKey === '' && pdfInfo.privateKey === '' ) {
        console.log( 'INSIDE IF' )
        const keyPair = ec.genKeyPair()
        publicKey = keyPair.getPublic( 'hex' )
        privateKey = keyPair.getPrivate( 'hex' )
      }
      const primaryShareKey = Keeper.getDerivedKey( privateKey )
      const secondaryShareKey = Keeper.getDerivedKey( walletId )
      const secondaryData = LevelHealth.encryptMetaShare(
        secondaryShare,
        secondaryShareKey
      )
      const primaryData = LevelHealth.encryptMetaShare(
        primaryShare,
        primaryShareKey
      )
      const primaryShareObject = JSON.stringify( {
        key: primaryShareKey,
        messageId: primaryData.messageId,
      } )
      const secondaryShareObject = JSON.stringify( {
        key: secondaryShareKey,
        messageId: secondaryData.messageId,
      } )

      // TODO upload Data
      const res1 = yield call(
        LevelHealth.uploadPDFPrimaryShare,
        primaryData.encryptedMetaShare,
        primaryData.messageId
      )
      const res2 = yield call(
        LevelHealth.uploadPDFSecondaryShare,
        secondaryData.encryptedMetaShare,
        secondaryData.messageId
      )
      const shareArray = [
        {
          walletId: walletId,
          shareId: primaryShare.shareId,
          reshareVersion: primaryShare.meta.reshareVersion,
          updatedAt: moment( new Date() ).valueOf(),
          name: 'Keeper PDF',
          shareType: 'pdf',
          status: 'notAccessible',
        },
      ]
      yield put( updateMSharesHealth( shareArray, false ) )
      const qrData = [
        JSON.stringify( {
          type: 'pdf',
          encryptedData: LevelHealth.encryptWithAnswer(
            primaryShareObject,
            WALLET_SETUP.security.answer
          ).encryptedString,
          encryptedKey: LevelHealth.encryptWithAnswer(
            primaryShare.shareId,
            WALLET_SETUP.security.answer
          ).encryptedString,
        } ),
        JSON.stringify( {
          type: 'pdf',
          encryptedData: LevelHealth.encryptWithAnswer(
            secondaryShareObject,
            WALLET_SETUP.security.answer
          ).encryptedString,
        } ),
      ]
      const pdfData = {
        qrData: qrData,
      }
      pdfPath = yield call(
        generatePDFKeeper,
        pdfData,
        `Hexa_Recovery_Key_${WALLET_SETUP.walletName}.pdf`,
        `Hexa Recovery Key for ${WALLET_SETUP.walletName}'s Wallet`
      )
      yield put( setPDFInfo( {
        filePath: pdfPath, publicKey, privateKey, updatedAt: moment( new Date() ).valueOf()
      } ) )
      yield put( onApprovalStatusChange( {
        status: false,
        initiatedAt: 0,
        shareId: '',
      } ) )
    }
    const updatedSERVICES = {
      ...SERVICES,
      S3_SERVICE: JSON.stringify( s3Service ),
    }

    yield call( insertDBWorker, {
      payload: {
        SERVICES: updatedSERVICES
      }
    } )

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
  const walletName = yield select( ( state ) => state.storage.database.WALLET_SETUP.walletName )
  try {
    console.log( 'pdfInfo', pdfInfo )
    if ( !pdfInfo.filePath ) throw new Error( 'Personal copy not found/generated' )

    const { security } = yield select(
      ( state ) => state.storage.database.WALLET_SETUP
    )

    switch ( shareVia ) {
        case 'Email':
          if ( !isEmailOtherOptions ) {
            yield call(
              Mailer.mail,
              {
                subject: 'Use Recovery Key for '+walletName,
                body: `<b>A Personal Copy of one of your Recovery Keys is attached as a pdf. The answer to your security question (${security.question}) is used to password protect the PDF.</b>`,
                isHTML: true,
                attachment: {
                  path:
                  Platform.OS == 'android'
                    ? 'file://' + pdfInfo.filePath
                    : pdfInfo.filePath, // The absolute path of the file from which to read data.
                  type: 'pdf', // Mime Type: jpg, png, doc, ppt, html, pdf, csv
                  name: 'Use Recovery Key for '+walletName, // Optional: Custom filename for attachment
                },
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
              title: 'Use Recovery Key for '+walletName,
              message: `A Personal Copy of one of your Recovery Keys is attached as a pdf. The answer to your security question (${security.question}) is used to password protect the PDF.`,
              url:
              Platform.OS == 'android'
                ? 'file://' + pdfInfo.filePath
                : pdfInfo.filePath,
              type: 'application/pdf',
              showAppsToView: true,
              subject: 'Use Recovery Key for '+walletName,
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
            title: 'Use Recovery Key for '+walletName,
            message: `A Personal Copy of one of your Recovery Keys is attached as a pdf. The answer to your security question (${security.question}) is used to password protect the PDF.`,
            url:
            Platform.OS == 'android'
              ? 'file://' + pdfInfo.filePath
              : pdfInfo.filePath,
            type: 'application/pdf',
            showAppsToView: true,
            subject: 'Use Recovery Key for '+walletName,
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
    const answer = yield select( ( state ) => state.storage.database.WALLET_SETUP.security.answer )
    let shareIndex = 3
    if (
      shareId &&
      s3Service.levelhealth.metaSharesKeeper.length &&
      metaShare.findIndex( ( value ) => value.shareId == shareId ) > -1
    ) {
      shareIndex = metaShare.findIndex( ( value ) => value.shareId == shareId )
    }
    const scannedObj: {type: string, encryptedKey: string; encryptedData: string} = JSON.parse( scannedData )
    const decryptedData = LevelHealth.decryptWithAnswer( scannedObj.encryptedKey, answer ).decryptedString
    if( decryptedData == shareId ){
      const shareArray = [
        {
          walletId: walletId,
          shareId: shareId,
          reshareVersion: metaShare[ shareIndex ].meta.reshareVersion,
          updatedAt: moment( new Date() ).valueOf(),
          name: 'Keeper PDF',
          shareType: 'pdf',
          status: 'accessible',
        },
      ]
      yield put( updateMSharesHealth( shareArray, true ) )
      yield put( onApprovalStatusChange( {
        status: false,
        initiatedAt: 0,
        shareId: '',
      } ) )
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
    const keeperInfo = [ ...yield select( ( state ) => state.health.keeperInfo ) ]
    let flag = false
    if ( keeperInfo.length > 0 ) {
      for ( let i = 0; i < keeperInfo.length; i++ ) {
        const element = keeperInfo[ i ]
        if ( element.shareId == keeperData.shareId ) {
          flag = false
          keeperInfo[ i ].name = keeperData.name
          keeperInfo[ i ].uuid = keeperData.uuid
          keeperInfo[ i ].publicKey = keeperData.publicKey
          keeperInfo[ i ].ephemeralAddress = keeperData.ephemeralAddress
          keeperInfo[ i ].type = keeperData.type
          keeperInfo[ i ].data = keeperData.data
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

function* uploadSMShareWorker( { payload } ) {
  /** Commented because this is used for KBHR flow*/

  // try {
  //   // yield put(switchS3LoaderKeeper("pdfDataProcess"));
  //   const { encryptedKey, otp } = payload
  //   const { WALLET_SETUP } = yield select( ( state ) => state.storage.database )
  //   const levelHealth: LevelHealthInterface[] = yield select(
  //     ( state ) => state.health.levelHealth
  //   )
  //   const currentLevel: number = yield select(
  //     ( state ) => state.health.currentLevel
  //   )
  //   const keeper: KeeperService = yield select( ( state ) => state.keeper.service )
  //   // TODO get primaryKeeper shareID

  //   const PKShareId =
  //     currentLevel == 2 || currentLevel == 1
  //       ? levelHealth[ 1 ].levelInfo[ 2 ].shareId
  //       : levelHealth[ 1 ].levelInfo[ 2 ].shareId
  //   const res = yield call(
  //     keeper.fetchTrustedChannel,
  //     PKShareId,
  //     WALLET_SETUP.walletName
  //   )
  //   if ( res.status == 200 ) {
  //     const data: TrustedDataElements = res.data.data
  //     const secondaryShare = data.pdfShare
  //     yield call( uploadSecondaryShareWorker, {
  //       payload: {
  //         encryptedKey, metaShare: secondaryShare, otp
  //       }
  //     } )
  //   }
  // } catch ( error ) {
  //   console.log( 'Error updatedKeeperInfoWorker', error )
  // }
}

export const uploadSMShareWatcher = createWatcher(
  uploadSMShareWorker,
  UPLOAD_PDF_SHARE
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

  const trustedContactsService: TrustedContactsService = yield select(
    ( state ) => state.trustedContacts.service,
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
              for ( const contactName of Object.keys(
                trustedContactsService.tc.trustedContacts,
              ) ) {
                const contact =
                    trustedContactsService.tc.trustedContacts[ contactName ]
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

function* uploadSecondaryShareForPKWorker( { payload } ) {
  try {
    // Transfer: Guardian >>> User
    const { tag, encryptedKey, otp } = payload
    const { DECENTRALIZED_BACKUP } = yield select(
      ( state ) => state.storage.database,
    )
    const database = yield select(
      ( state ) => state.storage.database,
    )
    const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP

    if ( !UNDER_CUSTODY[ tag ] ) {
      yield put( ErrorSending( true ) )
    }

    const { SECONDARY_SHARE, META_SHARE }: {SECONDARY_SHARE: MetaShare, META_SHARE: MetaShare} = UNDER_CUSTODY[ tag ]
    if( SECONDARY_SHARE ){
      const trustedContacts: TrustedContactsService = yield select(
        ( state ) => state.trustedContacts.service
      )
      if ( payload.previousGuardianName ) {
        trustedContacts.tc.trustedContacts[
          payload.previousGuardianName
        ].isGuardian = false
      }
      trustedContacts.tc.trustedContacts
      let FCMs = []
      Object.keys( trustedContacts.tc.trustedContacts ).map( ( tag ) => {
        if( META_SHARE.meta.walletId == trustedContacts.tc.trustedContacts[ tag ].walletID ){
          FCMs = trustedContacts.tc.trustedContacts[ tag ].FCMs
        }
      } )
      yield put( switchS3LoadingStatus( 'uploadRequestedShare' ) )
      const keeper: KeeperService = yield select( ( state ) => state.keeper.service )
      const result = yield call(
        keeper.uploadSecondaryShare,
        encryptedKey,
        SECONDARY_SHARE,
        otp
      )
      if ( result.status === 200 ) {
        Toast( `${tag}'s Recovery Key sent.` )
        const notification: INotification = {
          notificationType: notificationType.smUploadedForPK,
          title: 'Request approved from '+ database.WALLET_SETUP.walletName,
          body: 'Request approved from '+ database.WALLET_SETUP.walletName,
          data: JSON.stringify( {
            walletId: META_SHARE.meta.walletId
          } ),
          tag: notificationTag.IMP,
          date: new Date(),
        }
        const ress = yield call(
          RelayServices.sendNotifications,
          [ {
            walletId: META_SHARE.meta.walletId, FCMs
          } ],
          notification
        )
      } else {
        if ( result.err === 'ECONNABORTED' ) requestTimedout()
      }
    }
  } catch ( error ) {
    console.log( 'RECOVERY error', error )
    yield put( switchS3LoadingStatus( 'uploadRequestedShare' ) )
  }
}

export const uploadSecondaryShareForPKWatcher = createWatcher(
  uploadSecondaryShareForPKWorker,
  UPLOAD_SM_SHARE_FOR_PK,
)

function* generateSMMetaSharesWorker( { payload } ) {
  const { SM } = payload
  console.log( 'PAYLOAD SM', SM )
  const s3Service: S3Service = yield select( ( state ) => state.health.service )
  const { walletName } = yield select(
    ( state ) => state.storage.database.WALLET_SETUP
  )
  const appVersion = DeviceInfo.getVersion()
  const { answer, questionId, question } = yield select(
    ( state ) => state.storage.database.WALLET_SETUP.security
  )
  const secureAccount: SecureAccount = yield select(
    ( state ) => state.accounts[ SECURE_ACCOUNT ].service,
  )

  const secondaryMnemonic = SM && SM ? SM : secureAccount.secureHDWallet.secondaryMnemonic ? secureAccount.secureHDWallet.secondaryMnemonic : ''
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

function* uploadSMShareKeeperWorker( { payload } ) {
  const { index } = payload
  const s3Service: S3Service = yield select( ( state ) => state.health.service )
  console.log( 's3Service', s3Service.levelhealth.SMMetaSharesKeeper )

  const { DECENTRALIZED_BACKUP } = yield select(
    ( state ) => state.storage.database
  )
  const { OTP, ENCRYPTED_KEY, UPLOADED_AT } = DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[ index ]
  console.log( 'DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[index]', DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[ index ] )
  yield call( uploadSecondaryShareWorker, {
    payload: {
      encryptedKey: ENCRYPTED_KEY, metaShare: s3Service.levelhealth.SMMetaSharesKeeper[ 1 ], otp: OTP
    }
  } )
}

export const uploadSMShareKeeperWatcher = createWatcher(
  uploadSMShareKeeperWorker,
  UPLOAD_SMSHARE_KEEPER
)

function* uploadRequestedSMShareWorker( { payload } ) {
  try {
    // Transfer: Guardian >>> User
    const { tag, encryptedKey, otp } = payload
    const { DECENTRALIZED_BACKUP } = yield select(
      ( state ) => state.storage.database,
    )
    const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP

    if ( !UNDER_CUSTODY[ tag ] ) {
      yield put( ErrorSending( true ) )
      // Alert.alert('Upload failed!', 'No share under custody for this wallet.');
    }

    const { META_SHARE, ENC_DYNAMIC_NONPMDD, TRANSFER_DETAILS, SECONDARY_SHARE } = UNDER_CUSTODY[ tag ]

    // TODO: 10 min removal strategy
    yield put( switchS3LoaderKeeper( 'uploadRequestedShare' ) )

    const res = yield call(
      S3Service.uploadRequestedSMShare,
      encryptedKey,
      otp,
      SECONDARY_SHARE,
      ENC_DYNAMIC_NONPMDD,
    )

    if ( res.status === 200 && res.data.success === true ) {
      // yield success
      console.log( 'Upload successful!' )
      const updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        UNDER_CUSTODY: {
          ...DECENTRALIZED_BACKUP.UNDER_CUSTODY,
          [ tag ]: {
            ...DECENTRALIZED_BACKUP.UNDER_CUSTODY[ tag ],
            SM_TRANSFER_DETAILS: {
              KEY: encryptedKey,
              UPLOADED_AT: Date.now(),
            },
          },
        },
      }

      yield call( insertDBWorker, {
        payload: {
          DECENTRALIZED_BACKUP: updatedBackup
        },
      } )

      yield put( UploadSMSuccessfully( true ) )
      Toast( `${tag}'s Secondary Key sent.` )
    } else {
      if ( res.err === 'ECONNABORTED' ) requestTimedout()
    }
    yield put( switchS3LoaderKeeper( 'uploadRequestedShare' ) )
  } catch ( error ) {
    console.log( 'RECOVERY error', error )
    yield put( switchS3LoaderKeeper( 'uploadRequestedShare' ) )
  }
}

export const uploadRequestedSMShareWatcher = createWatcher(
  uploadRequestedSMShareWorker,
  UPLOAD_REQUESTED_SMSHARE,
)

function* deletePrivateDataWorker() {
  try {
    // Transfer: Guardian >>> User
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const s3ServiceSecure: SecureAccount = yield select(
      ( state ) => state.accounts[ SECURE_ACCOUNT ].service
    )
    // Delete Sm shares
    s3Service.deletePrivateData()
    console.log( 'deletePrivateDataWorker s3Service', s3Service.levelhealth )

    // Delete Sm
    s3ServiceSecure.deleteSecondaryMnemonics()

    console.log( 's3Service.levelhealth.SMMetaSharesKeeper', s3Service.levelhealth.SMMetaSharesKeeper )
    console.log( 's3Service.levelhealth.encryptedSMSecretsKeeper', s3Service.levelhealth.encryptedSMSecretsKeeper )
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

function* updateKeeperInfoToTrustedChannelWorker() {
  try {
    console.log( 'KEEPER INFO CHANGE updateKeeperInfoToTrustedChannelWorker' )
    // Transfer: Guardian >>> User
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const contactKeeper = []
    const pdfKeeper = []
    const keeperInfoData = yield select(
      ( state ) => state.health.keeperInfo
    )
    const answer = yield select( ( state ) => state.storage.database.WALLET_SETUP.security.answer )
    const response = yield call( s3Service.updateKeeperInfoToMetaShare, keeperInfoData, answer )
    let levelHealthVar
    if( currentLevel == 1 && levelHealth[ 1 ] && levelHealth[ 1 ].levelInfo.length ) {
      levelHealthVar = levelHealth[ 1 ].levelInfo
    }
    else if( currentLevel == 2 && !levelHealth[ 2 ] ) {
      levelHealthVar = levelHealth[ 1 ].levelInfo
    }
    else if( currentLevel == 2 && levelHealth[ 2 ] && levelHealth[ 2 ].levelInfo.length ) {
      levelHealthVar = []
      for ( let i = 0; i < levelHealth[ 2 ].levelInfo.length; i++ ) {
        const element = levelHealth[ 2 ].levelInfo[ i ]
        if( levelHealth[ 1 ].levelInfo[ i ] ){
          levelHealthVar.push( {
            ...levelHealth[ 1 ].levelInfo[ i ],
            oldShareId: levelHealth[ 1 ].levelInfo[ i ].shareId
          } )
        } else{
          levelHealthVar.push( element )
        }
      }
    }
    else if( currentLevel == 3 && levelHealth[ 2 ] && levelHealth[ 2 ].levelInfo.length ) {
      levelHealthVar = levelHealth[ 2 ].levelInfo
    }

    console.log( 'KEEPER INFO CHANGE levelHealthVar', levelHealthVar )

    for ( let i = 0; i < levelHealthVar.length; i++ ) {
      const element = levelHealthVar[ i ]
      if( ( element.shareType == 'contact' || element.shareType == 'device' ) && element.status == 'accessible' ) {
        contactKeeper.push( element )
      }
      if( element.shareType == 'pdf' && element.status == 'accessible' ) {
        pdfKeeper.push( element )
      }
    }

    console.log( 'KEEPER INFO CHANGE contactKeeper', contactKeeper )
    console.log( 'KEEPER INFO CHANGE pdfKeeper', pdfKeeper )

    if( contactKeeper.length ) {
      for ( let i = 0; i < contactKeeper.length; i++ ) {
        const element = contactKeeper[ i ]
        const selectedShareId = element.shareId
        const name: string = element.name
        const { WALLET_SETUP } = yield select( ( state ) => state.storage.database )
        const trustedContacts: TrustedContactsService = yield select(
          ( state ) => state.trustedContacts.service
        )
        const trustedContactsInfo: Keepers = trustedContacts.tc.trustedContacts
        const keeperInfo = yield select( ( state ) => state.health.keeperInfo )
        const walletId = s3Service.getWalletId().data.walletId

        const { encryptedString } = LevelHealth.encryptWithAnswer( JSON.stringify( keeperInfo ), WALLET_SETUP.security.answer )
        console.log( 'oldKeeperInfo', encryptedString )
        const oldKeeperInfo = trustedContactsInfo[ name.toLowerCase() ]
        console.log( 'name.toLowerCase()', name.toLowerCase() )
        console.log( 'oldKeeperInfo', oldKeeperInfo )
        const data: TrustedDataElements = {
          keeperInfo: encryptedString
        }
        const res = yield call(
          trustedContacts.updateTrustedChannel,
          name,
          data,
          false
        )
        console.log( 'res', res )
        if ( res.status == 200 ) {
          const notification: INotification = {
            notificationType: notificationType.newKeeperInfo,
            title: 'New keeper info uploaded',
            body: 'New keeper info uploaded.',
            data: JSON.stringify( {
              selectedShareId, walletId: walletId, walletName: WALLET_SETUP.walletName
            } ),
            tag: notificationTag.IMP,
            date: new Date(),
          }
          const ress = yield fork(
            RelayServices.sendNotifications,
            [ {
              walletId: oldKeeperInfo.walletID, FCMs: oldKeeperInfo.FCMs
            } ],
            notification
          )
        }

      }
    }

    if( pdfKeeper.length ) {
      const pdfKeeperElement = pdfKeeper[ 0 ]
      const pdfInfo: {
          filePath: string;
          publicKey: string;
          privateKey: string;
        } = yield select( ( state ) => state.health.pdfInfo )

      const privateKey = pdfInfo.privateKey
      let shareIndex = 3
      let primaryShare = s3Service.levelhealth.metaSharesKeeper[ shareIndex ]
      if( pdfKeeperElement.oldShareId && response.data && response.data.oldMetaShares.length ) {
        if (
          response.data.oldMetaShares.findIndex( ( value ) => value.shareId == pdfKeeperElement.shareId ) > -1
        ) {
          shareIndex = response.data.oldMetaShares.findIndex(
            ( value ) => value.shareId == pdfKeeperElement.shareId
          )
        }
        primaryShare = response.data.oldMetaShares[ shareIndex ]
      } else {
        if ( pdfKeeperElement.shareId && s3Service.levelhealth.metaSharesKeeper.length ) {
          if (
            s3Service.levelhealth.metaSharesKeeper.findIndex( ( value ) => value.shareId == pdfKeeperElement.shareId ) > -1
          ) {
            shareIndex = s3Service.levelhealth.metaSharesKeeper.findIndex(
              ( value ) => value.shareId == pdfKeeperElement.shareId
            )
          }
          primaryShare = s3Service.levelhealth.metaSharesKeeper[ shareIndex ]
        }
      }
      console.log( 'primaryShare', primaryShare )

      const primaryShareKey = Keeper.getDerivedKey( privateKey )
      const primaryData = LevelHealth.encryptMetaShare(
        primaryShare,
        primaryShareKey
      )

      // TODO upload Data
      const res1 = yield fork(
        LevelHealth.uploadPDFPrimaryShare,
        primaryData.encryptedMetaShare,
        primaryData.messageId
      )
    }

  } catch ( error ) {
    console.log( 'KEEPER INFO CHANGE', error )
  }
}

export const updateKeeperInfoToTrustedChannelWatcher = createWatcher(
  updateKeeperInfoToTrustedChannelWorker,
  UPDATE_KEEPERINFO_TO_TC,
)

function* updateKeeperInfoToUnderCustodyWorker( { payload } ) {
  try {
    const { walletName, walletId } = payload
    // Transfer: Guardian >>> User
    const { DECENTRALIZED_BACKUP } = yield select( ( state ) => state.storage.database )
    const trustedContactsService: TrustedContactsService = yield select(
      ( state ) => state.trustedContacts.service
    )
    const trustedContacts = trustedContactsService.tc.trustedContacts
    let TContacts = []
    const contactNameArr = []
    if ( Object.keys( trustedContacts ).length ) {
      TContacts = Object.keys( trustedContacts ).map( ( tag ) => {
        contactNameArr.push( tag )
        return trustedContacts[ tag ]
      } )
    }

    const index = TContacts.findIndex( value => value.walletID == walletId )

    if (
      index > -1 &&
        TContacts[ index ].trustedChannel &&
        TContacts[ index ].trustedChannel.address
    ) {

      const res = yield call(
        trustedContactsService.fetchTrustedChannel,
        contactNameArr[ index ],
        walletName
      )
      if( res.status == 200 ){
        const data: TrustedDataElements = res.data.data
        const encryptedKeeperInfo = data.keeperInfo
        const underCustody = DECENTRALIZED_BACKUP.UNDER_CUSTODY
        if( underCustody[ walletName ].META_SHARE.meta.encryptedKeeperInfo && ( underCustody[ walletName ].META_SHARE.meta.encryptedKeeperInfo != encryptedKeeperInfo || underCustody[ walletName ].META_SHARE.meta.encryptedKeeperInfo.length < encryptedKeeperInfo.length ) ) {
          const metaShare = {
            ...underCustody[ walletName ].META_SHARE, meta: {
              ...underCustody[ walletName ].META_SHARE.meta, encryptedKeeperInfo
            }
          }
          const updatedBackup = {
            ...DECENTRALIZED_BACKUP,
            UNDER_CUSTODY: {
              ...DECENTRALIZED_BACKUP.UNDER_CUSTODY,
              [ walletName ]: {
                ...underCustody[ walletName ],
                META_SHARE: metaShare,
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
        }
      }
    }

  } catch ( error ) {
    console.log( 'RECOVERY error', error )
  }
}

export const updateKeeperInfoToUnderCustodyWatcher = createWatcher(
  updateKeeperInfoToUnderCustodyWorker,
  UPDATE_KEEPERINFO_UNDER_CUSTODY,
)

function* autoShareLevel2KeepersWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'autoShareContact' ) )
    const { levelHealth } = payload
    const keepersToAutoUpdate = []
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    if (
      levelHealth[ 2 ] &&
      currentLevel == 2 &&
      levelHealth[ 2 ].levelInfo[ 4 ].status == 'accessible' &&
      levelHealth[ 2 ].levelInfo[ 5 ].status == 'accessible'
    ) {
      const keeperInfo: any[] = yield select(
        ( state ) => state.health.keeperInfo
      )
      for ( let i = 2; i < levelHealth[ 2 ].levelInfo.length - 2; i++ ) {
        if (
          levelHealth[ 2 ].levelInfo[ i ].status != 'accessible'
        ) {
          const obj = {
            ...levelHealth[ 1 ].levelInfo[ i ],
            newShareId: levelHealth[ 2 ].levelInfo[ i ].shareId,
            index: i,
          }
          keepersToAutoUpdate.push( obj )
          if ( keeperInfo.length > 0 ) {
            const index = keeperInfo.findIndex(
              ( value ) => value.shareId == obj.shareId
            )
            let object
            if ( index > -1 ) {
              object = {
                ...keeperInfo[ index ]
              }
              object.shareId = obj.newShareId
            }
            if ( object ) {
              yield put( updatedKeeperInfo( object ) )
            }
          }
        }
      }
    }
    console.log( 'keepersToAutoUpdate', keepersToAutoUpdate )
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const walletId = s3Service.getWalletId().data.walletId
    const keeperInfoData = yield select(
      ( state ) => state.health.keeperInfo
    )
    const answer = yield select( ( state ) => state.storage.database.WALLET_SETUP.security.answer )
    const response = yield call( s3Service.updateKeeperInfoToMetaShare, keeperInfoData, answer )
    if( keepersToAutoUpdate.length ) {
      for ( let i = 0; i < keepersToAutoUpdate.length; i++ ) {
        const element = keepersToAutoUpdate[ i ]
        let shareIndex = 3
        if ( element.newShareId && s3Service.levelhealth.metaSharesKeeper.length ) {
          if (
            s3Service.levelhealth.metaSharesKeeper.findIndex( ( value ) => value.shareId == element.newShareId ) > -1
          ) {
            shareIndex = s3Service.levelhealth.metaSharesKeeper.findIndex(
              ( value ) => value.shareId == element.newShareId
            )
          }
        }
        const share = s3Service.levelhealth.metaSharesKeeper[ shareIndex ]
        // Auto share for Contact / Device type
        if( element.shareType == 'contact' || element.shareType == 'device' ) {
          const { SERVICES } = yield select( ( state ) => state.storage.database )
          const trustedContacts: TrustedContactsService = yield select(
            ( state ) => state.trustedContacts.service
          )
          const trustedContactsInfo: Keepers = trustedContacts.tc.trustedContacts
          const oldKeeperInfo = trustedContactsInfo[ element.name.toLowerCase() ]
          const data: TrustedDataElements = {
            metaShare: share
          }
          const res = yield call(
            trustedContacts.updateTrustedChannel,
            element.name,
            data,
            false
          )
          console.log( 'updateTrustedChannel res', res )
          if ( res.status == 200 ) {
            const updatedSERVICES = {
              ...SERVICES,
              S3_SERVICE: JSON.stringify( s3Service ),
              TRUSTED_CONTACTS: JSON.stringify( trustedContacts ),
            }
            yield call( insertDBWorker, {
              payload: {
                SERVICES: updatedSERVICES
              },
            } )
            yield put( updateMSharesHealth( [
              {
                walletId: walletId,
                shareId: element.newShareId,
                reshareVersion: share.meta.reshareVersion,
                updatedAt: moment( new Date() ).valueOf(),
                shareType: element.shareType,
                name: element.name,
                status: 'accessible',
              },
            ], false ) )
            const notification: INotification = {
              notificationType: notificationType.reShare,
              title: 'New share uploaded',
              body: 'New share uploaded.',
              data: JSON.stringify( {
                selectedShareId: element.newShareId, walletId: walletId
              } ),
              tag: notificationTag.IMP,
              date: new Date(),
            }
            const ress = yield fork(
              RelayServices.sendNotifications,
              [ {
                walletId: oldKeeperInfo.walletID, FCMs: oldKeeperInfo.FCMs
              } ],
              notification
            )
          }
        }
        // Auto share for PDF type
        if( element.shareType == 'pdf' ){

          const pdfInfo: {
                filePath: string;
                publicKey: string;
                privateKey: string;
              } = yield select( ( state ) => state.health.pdfInfo )
          const privateKey = pdfInfo.privateKey
          const primaryShareKey = Keeper.getDerivedKey( privateKey )
          const primaryData = LevelHealth.encryptMetaShare(
            share,
            primaryShareKey
          )

          // TODO upload Data
          const res1 = yield call(
            LevelHealth.uploadPDFPrimaryShare,
            primaryData.encryptedMetaShare,
            primaryData.messageId
          )
          if( res1 && res1.success ){
            yield put( updateMSharesHealth( [
              {
                walletId: walletId,
                shareId: element.newShareId,
                reshareVersion: share.meta.reshareVersion,
                updatedAt: moment( new Date() ).valueOf(),
                shareType: 'pdf',
                name: element.name,
                status: 'accessible',
              },
            ], false ) )
          }
        }
      }
    }

    yield put( switchS3LoaderKeeper( 'autoShareContact' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'autoShareContact' ) )
    console.log( 'Error autoShareLevel2KeepersWorker', error )
  }
}

export const autoShareLevel2KeepersWatcher = createWatcher(
  autoShareLevel2KeepersWorker,
  AUTO_SHARE_LEVEL2_KEEPER
)

function* downloadSmShareForApprovalWorker( { payload } ) {
  try {
    yield put( switchS3LoaderKeeper( 'downloadSmShare' ) )
    const { qrData } = payload
    const { WALLET_SETUP } = yield select( ( state ) => state.storage.database )
    const s3Service = yield select( ( state ) => state.health.service )
    const qrDataObj = JSON.parse( qrData )
    if( qrDataObj.type && qrDataObj.type == 'pdf' ) {
      const walletId = s3Service.levelhealth.walletId
      const key = LevelHealth.getDerivedKey( walletId )
      const data = yield LevelHealth.decryptWithAnswer( qrDataObj.encryptedData, WALLET_SETUP.security.answer )
      const data1 = JSON.parse( data.decryptedString )
      const res = yield call( S3Service.downloadSMPDFShare, data1.messageId, key )
      if ( res.status === 200 ) {
        console.log( 'SHARES DOWNLOAD pdf', res.data )
        yield put( secondaryShareDownloaded( res.data.metaShare ) )
      }
    } else {
      const res = yield call( S3Service.downloadSMShare, qrDataObj.publicKey )
      if ( res.status === 200 ) {
        console.log( 'SHARES DOWNLOAD', res.data )
        yield put( secondaryShareDownloaded( res.data.metaShare ) )
      }
    }
    yield put( switchS3LoaderKeeper( 'downloadSmShare' ) )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'downloadSmShare' ) )
    console.log( 'Error EF channel', error )
  }
}

export const downloadSmShareForApprovalWatcher = createWatcher(
  downloadSmShareForApprovalWorker,
  DOWNLOAD_SMSHARE_FOR_APPROVAL
)

function* setLevelToNotSetupStatusWorker( ) {
  try {
    yield put( switchS3LoaderKeeper( 'downloadSmShare' ) )
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
            shareType: i == 2 ? 'primaryKeeper' : '',
            name: ''
          } )
        }
      }
    }
    console.log( 'shareArray', shareArray )
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
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'downloadSmShare' ) )
    console.log( 'Error EF channel', error )
  }
}

export const setLevelToNotSetupStatusWatcher = createWatcher(
  setLevelToNotSetupStatusWorker,
  SET_LEVEL_TO_NOT_SETUP
)

function* setHealthStatusWorker( ) {
  try {
    yield put( switchS3LoaderKeeper( 'downloadSmShare' ) )
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const service: S3Service = yield select( ( state ) => state.health.service )
    const TIME_SLOTS = config.HEALTH_STATUS.TIME_SLOTS
    const shareArray = []
    if( currentLevel && levelHealth[ currentLevel - 1 ] && levelHealth[ currentLevel - 1 ].levelInfo ){
      const element = levelHealth[ currentLevel - 1 ]
      for ( let i = 1; i < element.levelInfo.length; i++ ) {
        const element2 = element.levelInfo[ i ]
        if( element2.updatedAt > 0 && element2.status == 'accessible' ) {
          const delta = Math.abs( Date.now() - element2.updatedAt )
          const minutes = Math.round( delta / ( 60 * 1000 ) )
          if ( minutes > TIME_SLOTS.SHARE_SLOT2 && element2.shareType != 'cloud' ) {
            levelHealth[ currentLevel - 1 ].levelInfo[ i ].status = 'notAccessible'
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

    console.log( 'SET_HEALTH_STATUS shareArray', shareArray )
    if( shareArray.length ){
      yield put( updateMSharesHealth( shareArray, true ) )
    }
    console.log( 'SET_HEALTH_STATUS levelHealth', levelHealth )
  } catch ( error ) {
    yield put( switchS3LoaderKeeper( 'downloadSmShare' ) )
    console.log( 'Error EF channel', error )
  }
}

export const setHealthStatusWatcher = createWatcher(
  setHealthStatusWorker,
  SET_HEALTH_STATUS
)
