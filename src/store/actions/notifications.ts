// types and action creators: dispatched by components and sagas

import {
  notificationTag,
  notificationType,
} from '../../bitcoin/utilities/Interface';

export const UPDATE_FCM_TOKENS = 'UPDATE_FCM_TOKENS';
export const SEND_NOTIFICATION = 'SEND_NOTIFICATION';

export const updateFCMTokens = (FCMs: string[]) => {
  return {
    type: UPDATE_FCM_TOKENS,
    payload: { FCMs },
  };
};

export const sendNotification = (
  receiverWalletID: string,
  notificationType: notificationType,
  title: string,
  body: string,
  data: Object,
  tag: notificationTag,
) => {
  return {
    type: SEND_NOTIFICATION,
    payload: { receiverWalletID, notificationType, title, body, data, tag },
  };
};
