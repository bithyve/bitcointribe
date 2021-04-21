import { call, fork, put, select } from 'redux-saga/effects'
import {
  createWatcher,
} from '../utils/utilities'
import {
  switchUpgradeLoader,
  INIT_LEVELS,
  AUTO_UPLOAD_SECONDARY,
  SET_CLOUD_FOR_LEVEL,
  AUTO_UPLOAD_CONTACT,
  UPDATE_AVAILABLE_KEEPER_DATA,
  setAvailableKeeperData,
  updateAvailableKeeperData,
  isUpgradeLevelInitializedStatus,
} from '../actions/upgradeToNewBhr'
import { checkMSharesHealth, healthCheckInitialized, isLevel2InitializedStatus, isLevel3InitializedStatus, updatedKeeperInfo, updateMSharesHealth } from '../actions/health'
import { generateRandomString } from '../../common/CommonFunctions'
import moment from 'moment'
import S3Service from '../../bitcoin/services/sss/S3Service'
import { insertDBWorker } from './storage'
import { INotification, Keepers, LevelHealthInterface, MetaShare, notificationTag, notificationType, TrustedDataElements } from '../../bitcoin/utilities/Interface'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import RelayServices from '../../bitcoin/services/RelayService'
import { setCloudData } from '../actions/cloud'
import semver from 'semver'

function* initLevelsWorker( { payload } ) {
  try {
    const { level } = payload
    yield put( switchUpgradeLoader( 'initLevels' ) )
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const randomIdForSecurityQ = generateRandomString( 8 )
    const SecurityQuestionHealth = {
      shareType: 'securityQuestion',
      updatedAt: moment( new Date() ).valueOf(),
      status: 'accessible',
      shareId: randomIdForSecurityQ,
      reshareVersion: 0,
    }
    console.log( 'SecurityQuestionHealth', SecurityQuestionHealth )
    const res = yield call(
      s3Service.initLevels,
      SecurityQuestionHealth,
      level
    )
    if ( res.data.success ) {
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
      // Update Health to reducer
      yield put( checkMSharesHealth() )
      yield put( isUpgradeLevelInitializedStatus() )
      if ( level == 2 ) yield put( isLevel2InitializedStatus() )
      if ( level == 3 ) yield put( isLevel2InitializedStatus() ); yield put( isLevel3InitializedStatus() )
    }
    yield put( switchUpgradeLoader( 'initLevels' ) )
  } catch ( error ) {
    yield put( switchUpgradeLoader( 'initLevels' ) )
  }
}

export const initLevelsWatcher = createWatcher(
  initLevelsWorker,
  INIT_LEVELS,
)

function* setCloudDataForLevelWorker( { payload } ) {
  try {
    const { level } = payload
    yield put( switchUpgradeLoader( 'cloudDataForLevel' ) )
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const metaShares: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
    const levelHealth: LevelHealthInterface[] = yield select( ( state ) => state.health.levelHealth )
    const keeperInfo = yield select( ( state ) => state.health.keeperInfo )
    const currentLevel = yield select( ( state ) => state.health.currentLevel )
    console.log( 'levelHealth', levelHealth )
    console.log( 'level', level )
    let share: MetaShare
    if( level > 0 ){
      share = metaShares.find( value => value.shareId == levelHealth[ level-1 ].levelInfo[ 0 ].shareId )
    }
    yield put( setCloudData(
      keeperInfo,
      currentLevel,
      share
    ) )
    yield put( switchUpgradeLoader( 'cloudDataForLevel' ) )
  } catch ( error ) {
    yield put( switchUpgradeLoader( 'cloudDataForLevel' ) )
  }
}

export const setCloudDataForLevelWatcher = createWatcher(
  setCloudDataForLevelWorker,
  SET_CLOUD_FOR_LEVEL,
)

function* autoShareSecondaryWorker( { payload } ) {
  try {
    yield put( switchUpgradeLoader( 'secondarySetupAutoShare' ) )
    const { shareId } = payload
    const name = 'Secondary Device1'
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    yield put( updatedKeeperInfo( {
      shareId: shareId,
      name: name,
      uuid: '',
      publicKey: '',
      ephemeralAddress: '',
      type: 'device',
      data: {
        name: name, index: 0
      }
    } ) )
    const walletId = s3Service.getWalletId().data.walletId
    const { WALLET_SETUP, SERVICES } = yield select( ( state ) => state.storage.database )
    const keeperInfo = yield select( ( state ) => state.health.keeperInfo )
    const response = yield call( s3Service.updateKeeperInfoToMetaShare, keeperInfo, WALLET_SETUP.security.answer )
    const metaShares: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
    const secondaryMetaShares: MetaShare[] = s3Service.levelhealth.SMMetaSharesKeeper
    const trustedContacts: TrustedContactsService = yield select( ( state ) => state.trustedContacts.service )
    const share: MetaShare = metaShares.find( value => value.shareId == shareId )
    const trustedContactsInfo: Keepers = trustedContacts.tc.trustedContacts
    const oldKeeperInfo  = trustedContactsInfo[ 'Secondary Device'.toLowerCase() ]
    const status = oldKeeperInfo.trustedChannel && oldKeeperInfo.trustedChannel.data[ 1 ] && oldKeeperInfo.trustedChannel.data[ 1 ].data && semver.gte( oldKeeperInfo.trustedChannel.data[ 1 ].data.version, '1.5.0' ) ? 'accessible' : 'notAccessible'
    const data: TrustedDataElements = {
      metaShare: share,
      secondaryShare: secondaryMetaShares[ 1 ]
    }
    const ress = yield call( trustedContacts.initTCFromOldTC, 'Secondary Device'.toLowerCase(), name.toLowerCase() )
    console.log( 'autoShareSecondaryWorker trustedContacts', trustedContacts )
    const res = yield call(
      trustedContacts.updateTrustedChannel,
      'Secondary Device',
      data,
      false
    )
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
          shareId: shareId,
          reshareVersion: share.meta.reshareVersion,
          updatedAt: moment( new Date() ).valueOf(),
          shareType: 'device',
          name: name,
          status: status,
        },
      ] ) )
      const notification: INotification = {
        notificationType: notificationType.reShare,
        title: 'New share uploaded',
        body: 'New share uploaded.',
        data: JSON.stringify( {
          selectedShareId: shareId, walletId: walletId
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
      yield put( updateAvailableKeeperData( 'primary' ) )
    }
    yield put( switchUpgradeLoader( 'secondarySetupAutoShare' ) )
  } catch ( error ) {
    console.log( 'error', error )
    yield put( switchUpgradeLoader( 'secondarySetupAutoShare' ) )
  }
}

export const autoShareSecondaryWatcher = createWatcher(
  autoShareSecondaryWorker,
  AUTO_UPLOAD_SECONDARY,
)

function* autoShareContactKeeperWorker( { payload } ) {
  try {
    yield put( switchUpgradeLoader( 'contactSetupAutoShare' ) )
    const { contactList, shareIds } = payload
    const contactListToMarkDone = []
    for ( let i = 0; i < shareIds.length; i++ ) {
      const element = shareIds[ i ]
      const name =  contactList[ i ] && contactList[ i ].firstName && contactList[ i ].lastName
        ? contactList[ i ].firstName + ' ' + contactList[ i ].lastName
        : contactList[ i ] && contactList[ i ].firstName && !contactList[ i ].lastName
          ? contactList[ i ].firstName
          : contactList[ i ] && !contactList[ i ].firstName && contactList[ i ].lastName
            ? contactList[ i ].lastName
            : ''
      yield put( updatedKeeperInfo(  {
        shareId: element,
        name,
        uuid: '',
        publicKey: '',
        ephemeralAddress: '',
        type: 'contact',
        data: {
          ...contactList[ i ], index: i + 1
        }
      } ) )
    }
    const availableKeeperData: {shareId: string; type: string; count: number; status?: boolean;}[] = yield select( ( state ) => state.upgradeToNewBhr.availableKeeperData )
    const s3Service: S3Service = yield select( ( state ) => state.health.service )
    const walletId = s3Service.getWalletId().data.walletId
    const { WALLET_SETUP, SERVICES } = yield select( ( state ) => state.storage.database )
    const keeperInfo = yield select( ( state ) => state.health.keeperInfo )
    const response = yield call( s3Service.updateKeeperInfoToMetaShare, keeperInfo, WALLET_SETUP.security.answer )
    const metaShares: MetaShare[] = s3Service.levelhealth.metaSharesKeeper
    const secondaryMetaShares: MetaShare[] = s3Service.levelhealth.SMMetaSharesKeeper
    const trustedContacts: TrustedContactsService = yield select( ( state ) => state.trustedContacts.service )
    const trustedContactsInfo: Keepers = trustedContacts.tc.trustedContacts
    for ( let i = 0; i < shareIds.length; i++ ) {
      const name =  contactList[ i ] && contactList[ i ].firstName && contactList[ i ].lastName
        ? contactList[ i ].firstName + ' ' + contactList[ i ].lastName
        : contactList[ i ] && contactList[ i ].firstName && !contactList[ i ].lastName
          ? contactList[ i ].firstName
          : contactList[ i ] && !contactList[ i ].firstName && contactList[ i ].lastName
            ? contactList[ i ].lastName
            : ''
      contactListToMarkDone.push( name )
      const shareId = shareIds[ i ]
      const share: MetaShare = metaShares.find( value => value.shareId == shareId )
      const oldKeeperInfo = trustedContactsInfo[ name.toLowerCase() ]
      const status = oldKeeperInfo.trustedChannel && oldKeeperInfo.trustedChannel.data[ 1 ] && oldKeeperInfo.trustedChannel.data[ 1 ].data && semver.gte( oldKeeperInfo.trustedChannel.data[ 1 ].data.version, '1.5.0' ) ? 'accessible' : 'notAccessible'
      const data: TrustedDataElements = {
        metaShare: share,
        secondaryShare: secondaryMetaShares[ 1 ]
      }
      const res = yield call(
        trustedContacts.updateTrustedChannel,
        name,
        data,
        false
      )
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
            shareId: shareId,
            reshareVersion: share.meta.reshareVersion,
            updatedAt: moment( new Date() ).valueOf(),
            shareType: 'contact',
            name: name,
            status: status,
          },
        ] ) )
        const notification: INotification = {
          notificationType: notificationType.reShare,
          title: 'New share uploaded',
          body: 'New share uploaded.',
          data: JSON.stringify( {
            selectedShareId: shareId, walletId: walletId
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
      const contactCount = availableKeeperData.find( value=>value.type == 'contact' ).count
      for ( let i = 0; i < contactListToMarkDone.length; i++ ) {
        const element = contactListToMarkDone[ i ]
        yield put( updateAvailableKeeperData( 'contact', contactListToMarkDone[ i ] ) )
      }
    }
    yield put( switchUpgradeLoader( 'contactSetupAutoShare' ) )
  } catch ( error ) {
    console.log( 'error', error )
    yield put( switchUpgradeLoader( 'contactSetupAutoShare' ) )
  }
}

export const autoShareContactKeeperWatcher = createWatcher(
  autoShareContactKeeperWorker,
  AUTO_UPLOAD_CONTACT,
)

function* updateAvailableKeeperDataWorker( { payload } ) {
  try {
    yield put( switchUpgradeLoader( 'updateAvailKeeperDataStatus' ) )
    const { type, name } = payload
    const availableKeeperData: {shareId: string; type: string; count: number; status?: boolean; contactDetails: any;}[] = yield select( ( state ) => state.upgradeToNewBhr.availableKeeperData )
    for ( let i = 0; i < availableKeeperData.length; i++ ) {
      const element = availableKeeperData[ i ]
      if( element.type == type && type == 'contact' ) {
        const contactDetails = element.contactDetails
        const Name = contactDetails && contactDetails.firstName && contactDetails.lastName
          ? contactDetails.firstName + ' ' + contactDetails.lastName
          : contactDetails && contactDetails.firstName && !contactDetails.lastName
            ? contactDetails.firstName
            : contactDetails && !contactDetails.firstName && contactDetails.lastName
              ? contactDetails.lastName
              : ''
        if( Name == name ) availableKeeperData[ i ].status = true
      }
      else if( element.type == type && type != 'contact' ) {
        availableKeeperData[ i ].status = true
      }
    }
    yield put( setAvailableKeeperData( availableKeeperData ) )
    yield put( switchUpgradeLoader( 'updateAvailKeeperDataStatus' ) )
  } catch ( error ) {
    console.log( 'error', error )
    yield put( switchUpgradeLoader( 'updateAvailKeeperDataStatus' ) )
  }
}

export const updateAvailableKeeperDataWatcher = createWatcher(
  updateAvailableKeeperDataWorker,
  UPDATE_AVAILABLE_KEEPER_DATA,
)
