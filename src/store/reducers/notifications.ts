import { FETCH_NOTIFICATION_STARTED, NOTIFICATIONS_FETCHED, NOTIFICATION_UPDATED, UPDATED_NOTIFICATION_LIST } from '../actions/notifications'
import { INotification } from '../../bitcoin/utilities/Interface'

const initialState: {
  notifications: INotification[];
  notificationListNew: any;
  updatedNotificationList: [];
  fetchStarted: boolean;

} = {
  notifications: [],
  notificationListNew: null,
  updatedNotificationList: [],
  fetchStarted: false,
}

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case NOTIFICATIONS_FETCHED:
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
  }

  return state
}
