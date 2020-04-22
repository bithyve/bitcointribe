import { call, select } from 'redux-saga/effects';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import { REGULAR_ACCOUNT } from '../../common/constants/serviceTypes';
import { createWatcher } from '../utils/utilities';
import { UPDATE_FCM_TOKENS, SEND_NOTIFICATION } from '../actions/notifications';
import { INotification } from '../../bitcoin/utilities/Interface';

function* updateFCMTokensWorker({ payload }) {
  const { FCMs } = payload;
  if (FCMs.length === 0) {
    throw new Error('No FCM token found');
  }

  const service: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );

  const res = yield call(service.updateFCMTokens, payload.FCMs);
  if (res.status === 200) {
    const { updated } = res.data;
    console.log({ updated });
  } else {
    console.log('Failed to update FCMs on the server');
  }
}

export const updateFCMTokensWatcher = createWatcher(
  updateFCMTokensWorker,
  UPDATE_FCM_TOKENS,
);

function* sendNotificationWorker({ payload }) {
  const {
    receiverWalletID,
    notificationType,
    title,
    body,
    data,
    tag,
  } = payload;
  const service: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );

  const notification: INotification = {
    notificationType,
    title,
    body,
    data: {
      ...data,
    },
    tag,
  };
  const res = yield call(
    service.sendNotification,
    receiverWalletID,
    notification,
  );
  if (res.status === 200) {
    const { delivered } = res.data;
    console.log({ delivered });
  } else {
    console.log('Failed to deliver notification');
  }
}

export const sendNotificationWatcher = createWatcher(
  sendNotificationWorker,
  SEND_NOTIFICATION,
);
