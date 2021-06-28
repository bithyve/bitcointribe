import { FETCH_NOTIFICATION_STARTED, MESSAGES_FETCHED, NOTIFICATIONS_FETCHED, NOTIFICATION_UPDATED, STORE_MESSAGE_TIMESTAMP, UPDATED_NOTIFICATION_LIST } from '../actions/notifications'
import { INotification } from '../../bitcoin/utilities/Interface'

const initialState: {
  notifications: any;
  notificationListNew: any;
  updatedNotificationList: [];
  fetchStarted: boolean;
  timeStamp: any;
  messages: [];
} = {
  notifications: [],
  notificationListNew: null,
  updatedNotificationList: [],
  fetchStarted: false,
  timeStamp: null,
  messages: []
}

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case NOTIFICATIONS_FETCHED:
        console.log( 'action.payload.notifications', action.payload.notifications )
        return {
          ...state,
          notifications: action.payload.notifications,
        }
      case NOTIFICATION_UPDATED:
        return {
          ...state,
          notificationListNew: action.payload.notifications,
        }
      case UPDATED_NOTIFICATION_LIST:
        return {
          ...state,
          updatedNotificationList: action.payload.updatedNotificationList,
        }
      case FETCH_NOTIFICATION_STARTED:
        return {
          ...state,
          fetchStarted: action.payload.fetchStarted,
        }
      case STORE_MESSAGE_TIMESTAMP:
        return {
          ...state,
          timeStamp: Date.now()
        }
      case MESSAGES_FETCHED:
        return {
          ...state,
          messages: action.payload.messages,
        }
  }

  return state
}
