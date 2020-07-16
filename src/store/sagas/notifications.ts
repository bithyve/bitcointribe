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
import { INotification, Contacts } from '../../bitcoin/utilities/Interface';
import { AsyncStorage, Alert } from 'react-native';
import RelayServices from '../../bitcoin/services/RelayService';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';

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
  const service: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );
  const { data } = yield call(service.getWalletId);
  console.log({ walletId: data.walletId });

  const res = yield call(RelayServices.fetchNotifications, data.walletId);
  if (res.status === 200) {
    const { notifications, DHInfos } = res.data;
    console.log({ notifications });
    yield call(AsyncStorage.setItem, 'DHInfos', JSON.stringify(DHInfos));
    yield put(notificationsFetched(notifications));
  } else {
    console.log('Failed to fetch notification');
  }
}

export const fetchNotificationsWatcher = createWatcher(
  fetchNotificationsWorker,
  FETCH_NOTIFICATIONS,
);
