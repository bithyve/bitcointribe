import { call, put, select } from 'redux-saga/effects';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import { REGULAR_ACCOUNT } from '../../common/constants/serviceTypes';
import { createWatcher } from '../utils/utilities';
import {
  UPDATE_FCM_TOKENS,
  SEND_NOTIFICATION,
  FETCH_NOTIFICATIONS,
  notificationsFetched,
} from '../actions/notifications';
import { INotification } from '../../bitcoin/utilities/Interface';
import { AsyncStorage, Alert } from 'react-native';
import RelayServices from '../../bitcoin/services/RelayService';
import { FETCH_GET_BITTR_DETAILS } from '../actions/accounts';

function* fetchGetBittrDetailsWorker({ payload }) {
  const res = yield call(RelayServices.getBittrDetails);
  if (res.status === 200) {
    const { details } = res.data;
    console.log({ details });
    yield call(
      AsyncStorage.setItem,
      'getBittrDetails',
      JSON.stringify(details),
    );
  } else {
    console.log('Failed to fetch GetBittr Details');
  }
}

export const fetchGetBittrDetailsWatcher = createWatcher(
  fetchGetBittrDetailsWorker,
  FETCH_GET_BITTR_DETAILS,
);

function* updateFCMTokensWorker({ payload }) {
  const { FCMs } = payload;
  if (FCMs.length === 0) {
    throw new Error('No FCM token found');
  }

  const service: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );
  const { data } = yield call(service.getWalletId);

  const res = yield call(
    RelayServices.updateFCMTokens,
    data.walletId,
    payload.FCMs,
  );
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
    RelayServices.sendNotification,
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

function* fetchNotificationsWorker() {
  const service: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );
  const { data } = yield call(service.getWalletId);

  const res = yield call(RelayServices.fetchNotifications, data.walletId);
  if (res.status === 200) {
    const { notifications } = res.data;
    console.log({ notifications });
    yield put(notificationsFetched(notifications));
  } else {
    console.log('Failed to deliver notification');
  }
}

export const fetchNotificationsWatcher = createWatcher(
  fetchNotificationsWorker,
  FETCH_NOTIFICATIONS,
);
