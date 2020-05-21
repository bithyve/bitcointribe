import { call, put, select, delay } from 'redux-saga/effects';
import {
  INITIALIZE_TRUSTED_CONTACT,
  trustedContactInitialized,
  APPROVE_TRUSTED_CONTACT,
  trustedContactApproved,
  UPDATE_EPHEMERAL_CHANNEL,
  ephemeralChannelFetched,
  ephemeralChannelUpdated,
  UPDATE_TRUSTED_CHANNEL,
  FETCH_TRUSTED_CHANNEL,
  trustedChannelUpdated,
  trustedChannelFetched,
  FETCH_EPHEMERAL_CHANNEL,
  updateEphemeralChannel,
  TRUSTED_CHANNEL_XPUBS_UPLOAD,
} from '../actions/trustedContacts';
import { createWatcher } from '../utils/utilities';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import { insertIntoDB } from '../actions/storage';
import {
  EphemeralData,
  DerivativeAccount,
  Contacts,
  TrustedData,
  TrustedDataElements,
} from '../../bitcoin/utilities/Interface';
import { downloadMShare } from '../actions/sss';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import {
  REGULAR_ACCOUNT,
  TRUSTED_ACCOUNTS,
} from '../../common/constants/serviceTypes';

function* initializedTrustedContactWorker({ payload }) {
  const service: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactName } = payload;
  const res = yield call(service.initializeContact, contactName);
  if (res.status === 200) {
    const { publicKey } = res.data;
    yield put(trustedContactInitialized(contactName, publicKey));

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify(service),
    };
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
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
    if (payload.updateEphemeralChannel) {
      yield put(
        updateEphemeralChannel(
          contactName,
          { publicKey: res.data.publicKey },
          true,
          trustedContacts,
        ),
      );
    } else {
      const { SERVICES } = yield select((state) => state.storage.database);
      const updatedSERVICES = {
        ...SERVICES,
        TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
      };
      yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
    }
  } else {
    console.log(res.err);
  }
}

export const approveTrustedContactWatcher = createWatcher(
  approveTrustedContactWorker,
  APPROVE_TRUSTED_CONTACT,
);

function* updateEphemeralChannelWorker({ payload }) {
  let trustedContacts: TrustedContactsService = payload.trustedContacts;

  if (!trustedContacts)
    trustedContacts = yield select((state) => state.trustedContacts.service);

  const { contactName, data, fetch } = payload;

  const res = yield call(
    trustedContacts.updateEphemeralChannel,
    contactName,
    data,
    fetch,
  );
  console.log({ res });
  if (res.status === 200) {
    yield put(ephemeralChannelUpdated(contactName, res.updated, res.data));

    console.log({ trustedContacts });
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));

    const data: EphemeralData = res.data.data;
    if (data && data.shareTransferDetails) {
      const { otp, encryptedKey } = data.shareTransferDetails;
      yield delay(1000); // introducing delay in order to evade database insertion collision
      yield put(downloadMShare(encryptedKey, otp));
    }
  } else {
    console.log(res.err);
  }
}

export const updateEphemeralChannelWatcher = createWatcher(
  updateEphemeralChannelWorker,
  UPDATE_EPHEMERAL_CHANNEL,
);

function* fetchEphemeralChannelWorker({ payload }) {
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactName } = payload;

  const res = yield call(trustedContacts.fetchEphemeralChannel, contactName);
  if (res.status === 200) {
    const data: EphemeralData = res.data.data;
    if (data && data.shareTransferDetails) {
      const { otp, encryptedKey } = data.shareTransferDetails;
      downloadMShare(encryptedKey, otp);
    }

    yield put(ephemeralChannelFetched(contactName, data));
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    console.log(res.err);
  }
}

export const fetchEphemeralChannelWatcher = createWatcher(
  fetchEphemeralChannelWorker,
  FETCH_EPHEMERAL_CHANNEL,
);

function* updateTrustedChannelWorker({ payload }) {
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactName, data, fetch } = payload;

  const res = yield call(
    trustedContacts.updateTrustedChannel,
    contactName,
    data,
    fetch,
  );
  if (res.status === 200) {
    const { updated, data } = res.data;
    yield put(trustedChannelUpdated(contactName, updated, data));
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    console.log(res.err);
  }
}

export const updateTrustedChannelWatcher = createWatcher(
  updateTrustedChannelWorker,
  UPDATE_TRUSTED_CHANNEL,
);

function* fetchTrustedChannelWorker({ payload }) {
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactName } = payload;

  const res = yield call(trustedContacts.fetchTrustedChannel, contactName);
  if (res.status === 200) {
    const { data } = res.data;
    yield put(trustedChannelFetched(contactName, data));
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    console.log(res.err);
  }
}

export const fetchTrustedChannelWatcher = createWatcher(
  fetchTrustedChannelWorker,
  FETCH_TRUSTED_CHANNEL,
);

function* trustedChannelXpubsUploadWorker({ payload }) {
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );
  const regularService: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );

  const contacts: Contacts = trustedContacts.tc.trustedContacts;
  for (const contactName of Object.keys(contacts)) {
    const { trustedChannel } = contacts[contactName];
    if (trustedChannel) {
      if (trustedChannel.data) {
        if (trustedChannel.data.length !== 2) {
          // implies missing trusted data from the counter party
          const res = yield call(
            trustedContacts.fetchTrustedChannel,
            contactName,
          );

          if (res === 200) {
            console.log('Attempted a fetch from TC of: ', contactName);
            const { data } = res.data;
            if (data) {
              console.log('Received data from TC of: ', contactName);
            }
          }
        }
      } else {
        // generate a corresponding derivative acc and assign xpub
        const trustedAccounts: DerivativeAccount =
          regularService.hdWallet.derivativeAccounts[TRUSTED_ACCOUNTS];
        const accountNumber = trustedAccounts.instance.using + 1;
        const additional = {
          contactName,
        };
        yield call(
          regularService.getDerivativeAccXpub,
          TRUSTED_ACCOUNTS,
          accountNumber,
          additional,
        );

        const data: TrustedDataElements = {
          xpub: trustedAccounts[accountNumber].xpub,
        };
        const res = yield call(
          trustedContacts.updateTrustedChannel,
          contactName,
          data,
          true,
        );

        if (res.status === 200) {
          console.log('Xpub updated to TC for: ', contactName);
        }
      }
    }

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      REGULAR_ACCOUNT: JSON.stringify(regularService),
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  }
}

export const trustedChannelXpubsUploadWatcher = createWatcher(
  trustedChannelXpubsUploadWorker,
  TRUSTED_CHANNEL_XPUBS_UPLOAD,
);
