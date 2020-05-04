import { call, put, select } from 'redux-saga/effects';
import {
  INITIALIZE_TRUSTED_CONTACT,
  trustedContactInitialized,
  APPROVE_TRUSTED_CONTACT,
  trustedContactApproved,
} from '../actions/trustedContacts';
import { createWatcher } from '../utils/utilities';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';

function* initializedTrustedContactWorker({ payload }) {
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactName } = payload;
  const res = yield call(trustedContacts.initializeContact, contactName);
  if (res.status === 200) {
    const { publicKey } = res.data;
    yield put(trustedContactInitialized(publicKey));
  } else {
    console.log(res.err);
  }
}

export const initializedTrustedContactWatcher = createWatcher(
  initializedTrustedContactWorker,
  INITIALIZE_TRUSTED_CONTACT,
);

function* approveTrustedContactWorker({ payload }) {
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactName, contactsPublicKey } = payload;

  const res = yield call(
    trustedContacts.finalizeContact,
    contactName,
    contactsPublicKey,
  );
  if (res.status === 200) {
    yield put(trustedContactApproved(contactName, true));
  } else {
    console.log(res.err);
  }
}

export const approveTrustedContactWatcher = createWatcher(
  approveTrustedContactWorker,
  APPROVE_TRUSTED_CONTACT,
);
