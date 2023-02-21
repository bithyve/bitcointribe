import { call, put, select } from 'redux-saga/effects'
import { REGULAR_ACCOUNT } from '../../common/constants/wallet-service-types'
import { createWatcher } from '../utils/utilities'
import {
  UPDATE_FCM_TOKENS,
  SEND_NOTIFICATION,
  FETCH_NOTIFICATIONS,
  notificationsFetched,
  fetchNotificationStarted,
  GET_MESSAGES,
  storeMessagesTimeStamp,
  messageFetched,
  UPDATE_MESSAGES_STATUS_INAPP,
  UPDATE_MESSAGES_STATUS,
  NOTIFICATION_PRESSED,
} from '../actions/notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import Relay from '../../bitcoin/utilities/Relay'


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
    if ( !updated ) console.log( 'Failed to update FCMs on the server' )
  } catch( err ){
    console.log( 'err', err )
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
  console.log( 'messageArray', messageArray )
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
    if ( !updated ) console.log( 'Failed to update messageStatus on the server' )

  } catch( err ){
    console.log( 'err', err )
  }
}

export const updateMessageStatusWatcher = createWatcher(
  updateMessageStatusWorker,
  UPDATE_MESSAGES_STATUS,
)

export function* pushNotificationPressedWorker( {payload} ) {
  console.log("PRESED_PAYLOAD", payload);
  yield call(getMessageWorker)
  const data = yield select((state) => state.notifications.messages)

  const msg = []
  for (const k of data) {
    if (k.notificationId === payload.notificationId) {
      msg.push(k)
    }
  }

  payload.handleClick(msg[0]);
}

export const pushNotificationPressedWatcher = createWatcher(
  pushNotificationPressedWorker,
  NOTIFICATION_PRESSED
)