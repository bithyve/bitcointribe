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
  paymentDetailsFetched,
  switchTCLoading,
  REMOVE_TRUSTED_CONTACT,
} from '../actions/trustedContacts';
import { createWatcher } from '../utils/utilities';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import {
  EphemeralDataElements,
  DerivativeAccount,
  Contacts,
  TrustedData,
  TrustedDataElements,
  TrustedContactDerivativeAccountElements,
  INotification,
  notificationType,
  notificationTag,
  trustedChannelActions,
} from '../../bitcoin/utilities/Interface';
import { downloadMShare, updateWalletImage } from '../actions/sss';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import {
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
  TEST_ACCOUNT,
} from '../../common/constants/serviceTypes';
import { insertDBWorker } from './storage';
import { AsyncStorage } from 'react-native';
import { fetchNotificationsWorker } from './notifications';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';
import RelayServices from '../../bitcoin/services/RelayService';
import SSS from '../../bitcoin/utilities/sss/SSS';
import Toast from '../../components/Toast';

const sendNotification = (trustedContacts, contactName, walletName) => {
  const receivers = [];
  const recipient = trustedContacts.tc.trustedContacts[contactName];
  if (recipient.walletID && recipient.FCMs.length)
    receivers.push({
      walletId: recipient.walletID,
      FCMs: recipient.FCMs,
    });

  const notification: INotification = {
    notificationType: notificationType.contact,
    title: 'Friends and Family notification',
    body: `Trusted Contact request accepted by ${walletName}`,
    data: {},
    tag: notificationTag.IMP,
  };
  if (receivers.length)
    RelayServices.sendNotifications(receivers, notification).then(console.log);
};

function* initializedTrustedContactWorker({ payload }) {
  const service: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactName, encKey } = payload;
  const res = yield call(service.initializeContact, contactName, encKey);
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

  const { contactInfo, contactsPublicKey, contactsWalletName } = payload;

  let encKey;
  if (contactInfo.info) encKey = SSS.strechKey(contactInfo.info);
  const res = yield call(
    trustedContacts.finalizeContact,
    contactInfo.contactName,
    contactsPublicKey,
    encKey,
    contactsWalletName,
  );
  if (res.status === 200) {
    yield put(trustedContactApproved(contactInfo.contactName, true));
    if (payload.updateEphemeralChannel) {
      const uploadXpub = true;
      const data = {
        DHInfo: {
          publicKey: res.data.publicKey,
        },
      };
      yield put(
        updateEphemeralChannel(
          contactInfo,
          data,
          true,
          trustedContacts,
          uploadXpub,
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

function* removeTrustedContactWorker({ payload }) {
  const trustedContactsService: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );
  let { contactName } = payload;
  contactName = contactName.toLowerCase().trim();
  delete trustedContactsService.tc.trustedContacts[contactName];

  let trustedContactsInfo: any = yield call(
    AsyncStorage.getItem,
    'TrustedContactsInfo',
  );
  if (trustedContactsInfo) {
    trustedContactsInfo = JSON.parse(trustedContactsInfo);

    for (let itr = 0; itr < trustedContactsInfo.length; itr++) {
      const trustedContact = trustedContactsInfo[itr];
      if (trustedContact) {
        const presentContactName = `${trustedContact.firstName} ${
          trustedContact.lastName ? trustedContact.lastName : ''
        }`
          .toLowerCase()
          .trim();

        if (presentContactName === contactName) {
          if (itr < 3) trustedContactsInfo[itr] = null;
          // Guardian nullified
          else trustedContactsInfo.splice(itr, 1);
          yield call(
            AsyncStorage.setItem,
            'TrustedContactsInfo',
            JSON.stringify(trustedContactsInfo),
          );
          break;
        }
      }
    }
  }

  const { SERVICES } = yield select((state) => state.storage.database);
  const updatedSERVICES = {
    ...SERVICES,
    TRUSTED_CONTACTS: JSON.stringify(trustedContactsService),
  };
  yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
}

export const removeTrustedContactWatcher = createWatcher(
  removeTrustedContactWorker,
  REMOVE_TRUSTED_CONTACT,
);

function* updateEphemeralChannelWorker({ payload }) {
  yield put(switchTCLoading('updateEphemeralChannel'));

  let trustedContacts: TrustedContactsService = payload.trustedContacts;

  if (!trustedContacts)
    trustedContacts = yield select((state) => state.trustedContacts.service);
  const regularService: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );
  const testService: TestAccount = yield select(
    (state) => state.accounts[TEST_ACCOUNT].service,
  );

  const { contactInfo, data, fetch } = payload;

  let generatedKey = false;
  if (
    !contactInfo.info &&
    contactInfo.contactName == 'Secondary Device'.toLowerCase()
  ) {
    // contact info = null, for secondary device (initially)
    contactInfo.info = SSS.generateKey(SSS.cipherSpec.keyLength);
    generatedKey = true;
  }
  let encKey;
  if (contactInfo.info) encKey = SSS.strechKey(contactInfo.info);

  const res = yield call(
    trustedContacts.updateEphemeralChannel,
    contactInfo.contactName,
    data,
    encKey,
    fetch,
    payload.shareUploadables,
  );

  if (generatedKey) {
    trustedContacts.tc.trustedContacts[
      contactInfo.contactName.toLowerCase().trim()
    ].secondaryKey = contactInfo.info;
  }

  console.log({ res });
  if (res.status === 200) {
    const ephData: EphemeralDataElements = res.data.data;
    if (ephData && ephData.paymentDetails) {
      // using trusted details on TC approval
      const { trusted } = ephData.paymentDetails;
      yield put(paymentDetailsFetched({ ...trusted }));
    }

    yield put(
      ephemeralChannelUpdated(
        contactInfo.contactName,
        res.data.updated,
        res.data.data,
      ),
    );

    if (payload.uploadXpub) {
      console.log('Uploading xpub for: ', contactInfo.contactName);
      const res = yield call(
        regularService.getDerivativeAccXpub,
        TRUSTED_CONTACTS,
        null,
        contactInfo.contactName,
      );

      if (res.status === 200) {
        const xpub = res.data;
        const tpub = testService.getTestXpub();
        const walletID = yield call(AsyncStorage.getItem, 'walletID');
        const FCM = yield call(AsyncStorage.getItem, 'fcmToken');

        const data: TrustedDataElements = {
          xpub,
          tpub,
          walletID,
          FCM,
        };
        const updateRes = yield call(
          trustedContacts.updateTrustedChannel,
          contactInfo.contactName,
          data,
          true,
        );
        if (updateRes.status === 200) {
          console.log('Xpub updated to TC for: ', contactInfo.contactName);

          // send acceptance notification
          const { walletName } = yield select(
            (state) => state.storage.database.WALLET_SETUP,
          );
          sendNotification(
            trustedContacts,
            contactInfo.contactName.toLowerCase().trim(),
            walletName,
          );
        } else
          console.log(
            'Xpub updation to TC failed for: ',
            contactInfo.contactName,
          );
      } else {
        console.log(
          'Derivative xpub generation failed for: ',
          contactInfo.contactName,
        );
      }
    }

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      REGULAR_ACCOUNT: JSON.stringify(regularService),
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };

    if (payload.updatedDB) {
      yield call(insertDBWorker, {
        payload: {
          ...payload.updatedDB,
          SERVICES: { ...payload.updatedDB.SERVICES, ...updatedSERVICES },
        },
      });
    } else {
      yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    }

    const data: EphemeralDataElements = res.data.data;
    if (data && data.shareTransferDetails) {
      const { otp, encryptedKey } = data.shareTransferDetails;
      // yield delay(1000); // introducing delay in order to evade database insertion collision
      yield put(downloadMShare(encryptedKey, otp));
    }
  } else {
    console.log(res.err);
  }
  yield put(switchTCLoading('updateEphemeralChannel'));
}

export const updateEphemeralChannelWatcher = createWatcher(
  updateEphemeralChannelWorker,
  UPDATE_EPHEMERAL_CHANNEL,
);

function* fetchEphemeralChannelWorker({ payload }) {
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactInfo, approveTC, publicKey } = payload; // if publicKey: fetching just the payment details
  const encKey = SSS.strechKey(contactInfo.info);
  const res = yield call(
    trustedContacts.fetchEphemeralChannel,
    contactInfo.contactName,
    encKey,
    approveTC,
    publicKey,
  );
  if (res.status === 200) {
    const data: EphemeralDataElements = res.data.data;
    if (publicKey) {
      if (data && data.paymentDetails) {
        // using alternate details on TC rejection
        const { alternate } = data.paymentDetails;
        yield put(paymentDetailsFetched({ ...alternate }));
      }

      return;
    }

    if (data && data.shareTransferDetails) {
      const { otp, encryptedKey } = data.shareTransferDetails;
      downloadMShare(encryptedKey, otp);
    }

    yield put(ephemeralChannelFetched(contactInfo.contactName, data));
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
  yield put(switchTCLoading('updateTrustedChannel'));

  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactInfo, data, fetch } = payload;
  const res = yield call(
    trustedContacts.updateTrustedChannel,
    contactInfo.contactName,
    data,
    fetch,
    payload.shareUploadables,
  );

  if (res.status === 200) {
    const { updated, data } = res.data;
    yield put(trustedChannelUpdated(contactInfo.contactName, updated, data));
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };

    if (payload.updatedDB) {
      yield call(insertDBWorker, {
        payload: {
          ...payload.updatedDB,
          SERVICES: { ...payload.updatedDB.SERVICES, ...updatedSERVICES },
        },
      });
    } else {
      yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    }
  } else {
    console.log(res.err);
  }
  yield put(switchTCLoading('updateTrustedChannel'));
}

export const updateTrustedChannelWatcher = createWatcher(
  updateTrustedChannelWorker,
  UPDATE_TRUSTED_CHANNEL,
);

function* fetchTrustedChannelWorker({ payload }) {
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactInfo, action, contactsWalletName } = payload;

  const res = yield call(
    trustedContacts.fetchTrustedChannel,
    contactInfo.contactName,
    contactsWalletName,
  );

  console.log({ res });
  if (res.status === 200) {
    const data: TrustedDataElements = res.data.data;
    yield put(trustedChannelFetched(contactInfo.contactName, data));
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });

    if (action === trustedChannelActions.downloadShare) {
      if (data && data.shareTransferDetails) {
        Toast('You have been successfully added as a Keeper');
        const { otp, encryptedKey } = data.shareTransferDetails;
        // yield delay(1000); // introducing delay in order to evade database insertion collision
        yield put(downloadMShare(encryptedKey, otp));
      }
    }
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
  yield put(switchTCLoading('trustedChannelsSync'));

  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );
  const regularService: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );
  const testService: TestAccount = yield select(
    (state) => state.accounts[TEST_ACCOUNT].service,
  );

  yield call(fetchNotificationsWorker); // refreshes DHInfos
  let DHInfos = yield call(AsyncStorage.getItem, 'DHInfos');
  if (DHInfos) {
    DHInfos = JSON.parse(DHInfos);
  } else {
    DHInfos = [];
  }

  const preSyncTC = JSON.stringify(trustedContacts.tc.trustedContacts);

  const contacts: Contacts = trustedContacts.tc.trustedContacts;
  for (const contactName of Object.keys(contacts)) {
    let { trustedChannel, ephemeralChannel, encKey } = contacts[contactName];

    if (!trustedChannel) {
      // trusted channel not setup; probably need to still get the counter party's pubKey

      let contactsPublicKey;
      DHInfos.forEach((dhInfo: { address: string; publicKey: string }) => {
        if (dhInfo.address === ephemeralChannel.address) {
          contactsPublicKey = dhInfo.publicKey;
        }
      });

      if (contactsPublicKey) {
        const res = yield call(
          trustedContacts.finalizeContact,
          contactName,
          contactsPublicKey,
          encKey,
        );

        if (res.status !== 200) {
          console.log(
            `Failed to setup trusted channel with contact ${contactName}`,
          );
          continue;
        } else {
          // refresh the trustedChannel object
          trustedChannel =
            trustedContacts.tc.trustedContacts[contactName.trim()]
              .trustedChannel;
        }
      } else {
        continue;
      }
    }

    if (trustedChannel.data && trustedChannel.data.length) {
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
          if (data)
            console.log('Received data from TC with: ', contactName, data);

          // update the xpub to the trusted contact derivative acc if contact's xpub is received
          trustedChannel =
            trustedContacts.tc.trustedContacts[contactName.trim()]
              .trustedChannel; // refresh trusted channel
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
                  tpub: contactsData.tpub,
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
      } else {
        const accountNumber =
          regularService.hdWallet.trustedContactToDA[contactName];
        if (accountNumber) {
          const { contactDetails } = regularService.hdWallet.derivativeAccounts[
            TRUSTED_CONTACTS
          ][accountNumber] as TrustedContactDerivativeAccountElements;
          if (!contactDetails || !contactDetails.xpub) {
            const contactsData = trustedChannel.data[1].data;
            if (contactsData && contactsData.xpub) {
              (regularService.hdWallet.derivativeAccounts[TRUSTED_CONTACTS][
                accountNumber
              ] as TrustedContactDerivativeAccountElements).contactDetails = {
                xpub: contactsData.xpub,
                tpub: contactsData.tpub,
              };

              console.log(
                `Updated ${contactName}'s xpub to TrustedContact Derivative Account`,
              );
            } else {
              console.log(
                'Missing xpub corresponding to contact: ',
                contactName,
              );
            }
          }
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
        const tpub = testService.getTestXpub();
        const data: TrustedDataElements = {
          xpub,
          tpub,
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
              trustedContacts.tc.trustedContacts[contactName.trim()]
                .trustedChannel; // refresh trusted channel
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
                    tpub: contactsData.tpub,
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
        }
      } else {
        console.log(`Failed to generate xpub for ${contactName}`);
      }
    }
  }

  const postSyncTC = JSON.stringify(trustedContacts.tc.trustedContacts);

  if (preSyncTC !== postSyncTC) {
    console.log('Updating WI...');
    yield put(updateWalletImage());
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

  yield put(switchTCLoading('trustedChannelsSync'));
}

export const trustedChannelsSyncWatcher = createWatcher(
  trustedChannelsSyncWorker,
  TRUSTED_CHANNELS_SYNC,
);
