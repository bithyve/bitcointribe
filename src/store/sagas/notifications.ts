import { call, put, select } from 'redux-saga/effects'
import Relay from '../../bitcoin/utilities/Relay'
import {
  fetchNotificationStarted, FETCH_NOTIFICATIONS, GET_MESSAGES, messageFetched, notificationsFetched, NOTIFICATION_PRESSED, storeMessagesTimeStamp, UPDATE_FCM_TOKENS, UPDATE_MESSAGES_STATUS, UPDATE_MESSAGES_STATUS_INAPP
} from '../actions/notifications'
import { createWatcher } from '../utils/utilities'


function* updateFCMTokensWorker( { payload } ) {
  try{
    const { FCMs } = payload
    if ( FCMs.length === 0 ) {
      throw new Error( 'No FCM token found' )
    }
    const { walletId } = yield select(
      ( state ) => state.storage.wallet,
    )
    const { updated } = yield call(
      Relay.updateFCMTokens,
      walletId,
      payload.FCMs,
    )
  } catch( err ){
    //
  }
}

export const updateFCMTokensWatcher = createWatcher(
  updateFCMTokensWorker,
  UPDATE_FCM_TOKENS,
)

export function* fetchNotificationsWorker() {
  yield put( fetchNotificationStarted( true ) )
  const { walletId } = yield select(
    ( state ) => state.storage.wallet,
  )
  const { notifications } = yield call( Relay.fetchNotifications, walletId )
  yield call( notificationsFetched, notifications )
  //yield call( setupNotificationListWorker )
  yield put( fetchNotificationStarted( false ) )
}

export const fetchNotificationsWatcher = createWatcher(
  fetchNotificationsWorker,
  FETCH_NOTIFICATIONS,
)


export function* getMessageWorker() {
  yield put( fetchNotificationStarted( true ) )
  const storedMessages = yield select(
    ( state ) => state.notifications.messages,
  )
  const walletId = yield select( ( state ) => state.preferences.walletId, )
  const timeStamp = yield select(
    ( state ) => state.notifications.timeStamp,
  )

  const { messages } = yield call( Relay.getMessages, walletId, timeStamp )
  if( !storedMessages ) return
  const newMessageArray = storedMessages.concat( messages.filter( ( { notificationId } ) => !storedMessages.find( f => f.notificationId == notificationId ) ) )

  yield put( messageFetched( newMessageArray ) )
  yield put( storeMessagesTimeStamp() )

  yield put( fetchNotificationStarted( false ) )
}

export const getMessageWatcher = createWatcher(
  getMessageWorker,
  GET_MESSAGES,
)


export function* updateMessageStatusInAppWorker( { payload } ) {
  const { messageNotificationId } = payload
  const messages = yield select(
    ( state ) => state.notifications.messages,
  )
  const messageArray = messages.map( message => (
    message.notificationId === messageNotificationId? {
      ...message, 'status': 'read',
    }: message
  ) )
  yield put( messageFetched( messageArray ) )
}

export const updateMessageStatusInAppWatcher = createWatcher(
  updateMessageStatusInAppWorker,
  UPDATE_MESSAGES_STATUS_INAPP,
)


export function* updateMessageStatusWorker( { payload } ) {
  try{
    const { data } = payload
    if ( data.length === 0 ) {
      throw new Error( 'No data found' )
    }
    const walletId = yield select( ( state ) => state.preferences.walletId, )
    const { updated } = yield call(
      Relay.updateMessageStatus,
      walletId,
      data,
    )

  } catch( err ){
    // error
  }
}

export const updateMessageStatusWatcher = createWatcher(
  updateMessageStatusWorker,
  UPDATE_MESSAGES_STATUS,
)

export function* pushNotificationPressedWorker( { payload } ) {
  yield call( getMessageWorker )
  const data = yield select( ( state ) => state.notifications.messages )

  const msg = []
  for ( const k of data ) {
    if ( k.notificationId === payload.notificationId ) {
      msg.push( k )
    }
  }

  payload.handleClick( msg[ 0 ] )
}

export const pushNotificationPressedWatcher = createWatcher(
  pushNotificationPressedWorker,
  NOTIFICATION_PRESSED
)
