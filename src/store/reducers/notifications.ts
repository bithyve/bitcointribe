import { NOTIFICATIONS_FETCHED } from '../actions/notifications';
import { INotification } from '../../bitcoin/utilities/Interface';

const initialState: {
  notifications: INotification[];
} = {
  notifications: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case NOTIFICATIONS_FETCHED:
      return {
        ...state,
        notifications: action.payload.notifications,
      };
  }

  return state;
};
