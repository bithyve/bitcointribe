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
  TRUSTED_CHANNELS_SYNC,
} from '../actions/trustedContacts';
import { createWatcher } from '../utils/utilities';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import {
  EphemeralData,
  DerivativeAccount,
  Contacts,
  TrustedData,
  TrustedDataElements,
  TrustedContactDerivativeAccountElements,
} from '../../bitcoin/utilities/Interface';
import { downloadMShare } from '../actions/sss';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import {
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../common/constants/serviceTypes';
import { insertDBWorker } from './storage';

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
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
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

  const { contactName, contactsPublicKey, contactsWalletName } = payload;

  const res = yield call(
    trustedContacts.finalizeContact,
    contactName,
    contactsPublicKey,
    contactsWalletName,
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
          true,
        ),
      );
    } else {
      const { SERVICES } = yield select((state) => state.storage.database);
      const updatedSERVICES = {
        ...SERVICES,
        TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
      };
      yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
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
  const regularService: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );

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

    if (payload.uploadXpub) {
      console.log('Uploading xpub for: ', contactName);
      const res = yield call(
        regularService.getDerivativeAccXpub,
        TRUSTED_CONTACTS,
        null,
        contactName,
      );

      if (res.status === 200) {
        const xpub = res.data;
        const data: TrustedDataElements = {
          xpub,
        };
        const updateRes = yield call(
          trustedContacts.updateTrustedChannel,
          contactName,
          data,
          true,
        );

        if (updateRes.status === 200)
          console.log('Xpub updated to TC for: ', contactName);
        else console.log('Xpub updation to TC failed for: ', contactName);
      } else {
        console.log('Derivative xpub generation failed for: ', contactName);
      }
    }

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      REGULAR_ACCOUNT: JSON.stringify(regularService),
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });

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
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
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
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
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
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else {
    console.log(res.err);
  }
}

export const fetchTrustedChannelWatcher = createWatcher(
  fetchTrustedChannelWorker,
  FETCH_TRUSTED_CHANNEL,
);

export function* trustedChannelsSyncWorker() {
  // TODO: simplify and optimise the saga
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );
  const regularService: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );

  const contacts: Contacts = trustedContacts.tc.trustedContacts;
  for (const contactName of Object.keys(contacts)) {
    let { trustedChannel } = contacts[contactName];

    if (!trustedChannel) {
      // trusted channel not setup; probably need to still get the counter party's pubKey
      const res = yield call(
        trustedContacts.fetchEphemeralChannel,
        contactName,
        true,
      );

      if (res.status !== 200) {
        console.log(
          `Failed to setup channel for trusted contact ${contactName}`,
        );
        continue;
      } else {
        // refresh the trustedChannel object
        trustedChannel =
          trustedContacts.tc.trustedContacts[contactName].trustedChannel;
      }
    }

    if (trustedChannel.data) {
      if (trustedChannel.data.length !== 2) {
        // implies missing trusted data from the counter party
        const res = yield call(
          trustedContacts.fetchTrustedChannel,
          contactName,
        );
        console.log({ res });
        if (res.status === 200) {
          console.log('Attempted a fetch from TC with: ', contactName);
          const { data } = res.data;
          if (data) console.log('Received data from TC with: ', contactName);

          // update the xpub to the trusted contact derivative acc if contact's xpub is received
          trustedChannel =
            trustedContacts.tc.trustedContacts[contactName].trustedChannel; // refresh trusted channel
          if (trustedChannel.data.length === 2) {
            const contactsData = trustedChannel.data[1].data;
            if (contactsData && contactsData.xpub) {
              const accountNumber =
                regularService.hdWallet.trustedContactToDA[contactName];
              if (accountNumber) {
                (regularService.hdWallet.derivativeAccounts[TRUSTED_CONTACTS][
                  accountNumber
                ] as TrustedContactDerivativeAccountElements).contactDetails = {
                  xpub: contactsData.xpub,
                };

                console.log(
                  `Updated ${contactName}'s xpub to TrustedContact Derivative Account`,
                );
              } else {
                console.log(
                  'Failed to find account number corersponding to contact: ',
                  contactName,
                );
              }
            } else {
              console.log(
                'Missing xpub corresponding to contact: ',
                contactName,
              );
            }
          }

          const { SERVICES } = yield select((state) => state.storage.database);
          const updatedSERVICES = {
            ...SERVICES,
            REGULAR_ACCOUNT: JSON.stringify(regularService),
            TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
          };
          yield call(insertDBWorker, {
            payload: { SERVICES: updatedSERVICES },
          });
        }
      }
    } else {
      // generate a corresponding derivative acc and assign xpub
      const res = yield call(
        regularService.getDerivativeAccXpub,
        TRUSTED_CONTACTS,
        null,
        contactName,
      );

      if (res.status === 200) {
        const xpub = res.data;

        const data: TrustedDataElements = {
          xpub,
        };
        const updateRes = yield call(
          trustedContacts.updateTrustedChannel,
          contactName,
          data,
          true,
        );

        if (updateRes.status === 200) {
          console.log('Xpub updated to TC for: ', contactName);

          if (updateRes.data.data) {
            // received some data back from the channel; probably contact's xpub
            console.log('Received data from TC with: ', contactName);

            // update the xpub to the trusted contact derivative acc if contact's xpub is received
            const trustedChannel =
              trustedContacts.tc.trustedContacts[contactName].trustedChannel; // refresh trusted channel
            console.log({ trustedChannel });
            if (trustedChannel.data.length === 2) {
              const contactsData = trustedChannel.data[1].data;
              if (contactsData && contactsData.xpub) {
                const accountNumber =
                  regularService.hdWallet.trustedContactToDA[contactName];
                if (accountNumber) {
                  (regularService.hdWallet.derivativeAccounts[TRUSTED_CONTACTS][
                    accountNumber
                  ] as TrustedContactDerivativeAccountElements).contactDetails = {
                    xpub: contactsData.xpub,
                  };

                  console.log(
                    `Updated ${contactName}'s xpub to TrustedContact Derivative Account`,
                  );
                } else {
                  console.log(
                    'Failed to find account number corersponding to contact: ',
                    contactName,
                  );
                }
              } else {
                console.log(
                  'Missing xpub corresponding to contact: ',
                  contactName,
                );
              }
            }
          }

          const { SERVICES } = yield select((state) => state.storage.database);
          const updatedSERVICES = {
            ...SERVICES,
            REGULAR_ACCOUNT: JSON.stringify(regularService),
            TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
          };
          yield call(insertDBWorker, {
            payload: { SERVICES: updatedSERVICES },
          });
        }
      } else {
        console.log(`Failed to generate xpub for ${contactName}`);
      }
    }
  }
}

export const trustedChannelsSyncWatcher = createWatcher(
  trustedChannelsSyncWorker,
  TRUSTED_CHANNELS_SYNC,
);
