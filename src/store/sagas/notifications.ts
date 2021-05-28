import { call, put, select } from 'redux-saga/effects'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import { REGULAR_ACCOUNT } from '../../common/constants/wallet-service-types'
import { createWatcher } from '../utils/utilities'
import {
  UPDATE_FCM_TOKENS,
  SEND_NOTIFICATION,
  FETCH_NOTIFICATIONS,
  notificationsFetched,
  setupNotificationList,
  SETUP_NOTIFICATION_LIST,
  updateNotificationList,
  fetchNotificationStarted,
} from '../actions/notifications'
import { INotification, Contacts, MetaShare } from '../../bitcoin/utilities/Interface'
import { Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RelayServices from '../../bitcoin/services/RelayService'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { getEnvReleaseTopic } from '../../utils/geEnvSpecificParams'
import moment from 'moment'
import S3Service from '../../bitcoin/services/sss/S3Service'
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter'
import { getKeeperInfoFromShareId } from '../../common/CommonFunctions'

function* updateFCMTokensWorker( { payload } ) {
  try{
    const { FCMs } = payload
    if ( FCMs.length === 0 ) {
      throw new Error( 'No FCM token found' )
    }

    const service: RegularAccount = yield select(
      ( state ) => state.accounts[ REGULAR_ACCOUNT ].service,
    )
    const { data } = yield call( service.getWalletId )

    const res = yield call(
      RelayServices.updateFCMTokens,
      data.walletId,
      payload.FCMs,
    )

    if ( res.status === 200 ) {
      const { updated } = res.data
      console.log( {
        updated
      } )
    } else {
      console.log( 'Failed to update FCMs on the server' )
    }
  } catch( err ){
    console.log( 'err', err )
  }
}

export const updateFCMTokensWatcher = createWatcher(
  updateFCMTokensWorker,
  UPDATE_FCM_TOKENS,
)

// function* sendNotificationWorker({ payload }) {
//   const { contactName, notificationType, title, body, data, tag } = payload;

//   const notification: INotification = {
//     notificationType,
//     title,
//     body,
//     data: {
//       ...data,
//     },
//     tag,
//   };

//   const trustedContacts: TrustedContactsService = yield select(
//     (state) => state.trustedContacts.service,
//   );
//   const contacts: Contacts = trustedContacts.tc.trustedContacts;
//   if (
//     !contacts[contactName] ||
//     !contactName[contactName].walletId ||
//     !contactName[contactName].FCMs
//   )
//     throw new Error('Failed to send notification; contact assets missing');

//   const receiverWalletID = contactName[contactName].walletId;
//   const receiverFCMs = contactName[contactName].FCMs;

//   const res = yield call(
//     RelayServices.sendNotification,
//     receiverWalletID,
//     receiverFCMs,
//     notification,
//   );
//   if (res.status === 200) {
//     const { delivered } = res.data;
//     console.log({ delivered });
//   } else {
//     console.log('Failed to deliver notification');
//   }
// }

// export const sendNotificationWatcher = createWatcher(
//   sendNotificationWorker,
//   SEND_NOTIFICATION,
// );

export function* fetchNotificationsWorker() {
  yield put( fetchNotificationStarted( true ) )
  const service: RegularAccount = yield select(
    ( state ) => state.accounts[ REGULAR_ACCOUNT ].service,
  )
  const { data } = yield call( service.getWalletId )

  const res = yield call( RelayServices.fetchNotifications, data.walletId )
  if ( res.status === 200 ) {
    const { notifications, DHInfos } = res.data
    yield call( AsyncStorage.setItem, 'DHInfos', JSON.stringify( DHInfos ) )
    const payload = {
      notifications
    }
    yield call( setupNotificationListWorker, {
      payload
    } )
    yield put( notificationsFetched( notifications ) )
    yield put( fetchNotificationStarted( false ) )

  } else {
    console.log( 'Failed to fetch notification' )
  }
}

export const fetchNotificationsWatcher = createWatcher(
  fetchNotificationsWorker,
  FETCH_NOTIFICATIONS,
)

export function* setupNotificationListWorker( { payload } ) {
  const keeperApproveStatus = yield select( ( state ) => state.health.keeperApproveStatus, )
  const s3Service = yield select( ( state ) => state.health.service )
  const levelHealth = yield select( ( state ) => state.health.levelHealth )
  const notificationList = yield select( ( state ) => state.notifications )
  const UNDER_CUSTODY = yield select( ( state ) => state.storage.database.DECENTRALIZED_BACKUP.UNDER_CUSTODY )
  const database = yield select( ( state ) => state.storage.database )
  const asyncNotification = yield select( ( state ) => state.notifications.updatedNotiifcationList )
  const {
    onApprovalStatusChange,
    fetchKeeperTrustedChannel,
    updateKeeperInfoToUnderCustody
  } = this.props

  //const ListOfNotification = yield call( AsyncStorage.getItem, 'notificationList' )
  //const asyncNotification = JSON.parse( updatedNotificationList )
  const releaseNotificationTopic = getEnvReleaseTopic()

  // const asyncNotification = JSON.parse(
  //   await AsyncStorage.getItem( 'notificationList' )
  // )
  let asyncNotificationList = []
  if ( asyncNotification ) {
    asyncNotificationList = []
    for ( let i = 0; i < asyncNotification.length; i++ ) {
      asyncNotificationList.push( asyncNotification[ i ] )
    }
  }
  const tmpList = asyncNotificationList
  if ( notificationList ) {
    // console.log(
    //   "notificationList['notifications']",
    //   notificationList["notifications"]
    // );
    for ( let i = 0; i < notificationList[ 'notifications' ].length; i++ ) {
      const element = notificationList[ 'notifications' ][ i ]
      // console.log("element", element);
      let readStatus = false
      if ( element.notificationType == releaseNotificationTopic ) {
        const releaseCases = this.props.releaseCasesValue
        // JSON.parse(
        //   await AsyncStorage.getItem('releaseCases'),
        // );
        if (
          element.body &&
          element.body.split( ' ' )[ 1 ] == releaseCases.build
        ) {
          if ( releaseCases.remindMeLaterClick ) {
            readStatus = false
          }
          if ( releaseCases.ignoreClick ) {
            readStatus = true
          }
        } else {
          readStatus = true
        }
      }

      if ( element.notificationType == 'newKeeperInfo' ) {
        const data = JSON.parse( element.data )
        if ( data.walletName && data.walletId ) {
          yield call( updateKeeperInfoToUnderCustody, data.walletName, data.walletId )
        }
      }
      if ( element.notificationType == 'uploadSecondaryShare' ) {
        const data = JSON.parse( element.data )
        if ( data.shareID == keeperApproveStatus.shareId ) {
          yield put( onApprovalStatusChange( {
            status: true,
            initiatedAt: moment( new Date() ).valueOf(),
            shareId: data.shareID,
          } ) )
        }
      }
      if (
        element.notificationType == 'secureXpub' &&
        !database.DECENTRALIZED_BACKUP.PK_SHARE
      ) {
        const shareId = s3Service.levelhealth.metaSharesKeeper[ 1 ].shareId
        const share = yield call( getKeeperInfoFromShareId, levelHealth, shareId )
        yield put( fetchKeeperTrustedChannel(
          shareId,
          element.notificationType,
          share.name
        ) )
      }
      if ( element.notificationType == 'reShare' ) {
        // console.log('element.notificationType', element.notificationType)
        // console.log('UNDER_CUSTODY', UNDER_CUSTODY)

        let existingShares: MetaShare[]
        if ( Object.keys( UNDER_CUSTODY ).length ) {
          existingShares = Object.keys( UNDER_CUSTODY ).map( ( tag ) => {
            console.log( tag )
            return UNDER_CUSTODY[ tag ].META_SHARE
          } )
        }
        if ( existingShares.length ) {
          console.log(
            'existingShares.length',
            existingShares.length,
            existingShares
          )
          if (
            existingShares.findIndex(
              ( value ) =>
                value.shareId === JSON.parse( element.data ).selectedShareId
            ) == -1
          ) {
            console.log(
              'element.notificationType 1',
              element.notificationType
            )
            this.props.autoDownloadShareContact(
              JSON.parse( element.data ).selectedShareId,
              JSON.parse( element.data ).walletId
            )
          }
        }
      }
      if ( element.notificationType == 'smUploadedForPK' ) {
        if (
          keeperApproveStatus.shareId == 'PK_recovery' &&
          keeperApproveStatus.transferDetails &&
          keeperApproveStatus.transferDetails.key
        ) {
          const result = yield call( S3Service.downloadSMShare,
            keeperApproveStatus.transferDetails.key
          )
          if ( result && result.data ) {
            yield put( onApprovalStatusChange( {
              status: true,
              initiatedAt: moment( new Date() ).valueOf(),
              shareId: 'PK_recovery',
              secondaryShare: result.data.metaShare,
            } ) )
          }
        }

        let existingShares: MetaShare[]
        if ( Object.keys( UNDER_CUSTODY ).length ) {
          existingShares = Object.keys( UNDER_CUSTODY ).map( ( tag ) => {
            console.log( tag )
            return UNDER_CUSTODY[ tag ].META_SHARE
          } )
        }

        if ( existingShares.length ) {
          console.log(
            'existingShares.length',
            existingShares.length,
            existingShares
          )
          if (
            existingShares.findIndex(
              ( value ) =>
                value.shareId === JSON.parse( element.data ).selectedShareId
            ) == -1
          ) {
            console.log(
              'element.notificationType 1',
              element.notificationType
            )
            this.props.autoDownloadShareContact(
              JSON.parse( element.data ).selectedShareId,
              JSON.parse( element.data ).walletId
            )
          }
        }
      }

      if (
        asyncNotificationList.findIndex(
          ( value ) => value.notificationId == element.notificationId
        ) > -1
      ) {
        const temp =
          asyncNotificationList[
            asyncNotificationList.findIndex(
              ( value ) => value.notificationId == element.notificationId
            )
          ]
        if ( element.notificationType != releaseNotificationTopic ) {
          readStatus = temp.read
        }

        const obj = {
          ...temp,
          read: readStatus,
          type: element.notificationType,
          title: element.title,
          info: element.body,
          isMandatory: element.tag == 'mandatory' ? true : false,
          time: timeFormatter(
            moment( new Date() ),
            moment( element.date ).valueOf()
          ),
          date: new Date( element.date ),
        }
        tmpList[
          tmpList.findIndex(
            ( value ) => value.notificationId == element.notificationId
          )
        ] = obj
      } else {
        const obj = {
          type: element.notificationType,
          isMandatory: element.tag == 'mandatory' ? true : false,
          read: readStatus,
          title: element.title,
          time: timeFormatter(
            moment( new Date() ),
            moment( element.date ).valueOf()
          ),
          date: new Date( element.date ),
          info: element.body,
          notificationId: element.notificationId,
        }
        tmpList.push( obj )
      }
    }
    yield put( updateNotificationList( tmpList ) )
    // yield call(
    //   AsyncStorage.setItem,
    //   'notificationList',
    //   JSON.stringify( tmpList )
    // )
    //this.props.notificationsUpdated(tmpList);
    // tmpList.sort( function ( left, right ) {
    //   return moment.utc( right.date ).unix() - moment.utc( left.date ).unix()
    // } )

    // this.setState( {
    //   notificationData: tmpList,
    //   notificationDataChange: !this.state.notificationDataChange,
    // } )
  }
}

export const setupNotificationListWatcher = createWatcher(
  setupNotificationListWorker,
  SETUP_NOTIFICATION_LIST,
)
