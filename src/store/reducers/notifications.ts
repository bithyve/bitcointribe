import { NOTIFICATIONS_FETCHED, NOTIFICATION_UPDATED } from '../actions/notifications';
import { INotification } from '../../bitcoin/utilities/Interface';

const initialState: {
  notifications: INotification[];
  notificationListNew: any;
} = {
  notifications: [],
  notificationListNew: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case NOTIFICATIONS_FETCHED:
      return {
        ...state,
        notifications: action.payload.notifications,
      };
    case NOTIFICATION_UPDATED:
      return {
        ...state,
        notificationListNew: action.payload.notifications,
      };
  }

  return state;
};
