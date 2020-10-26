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
  TRUSTED_CHANNELS_SETUP_SYNC,
  paymentDetailsFetched,
  switchTCLoading,
  REMOVE_TRUSTED_CONTACT,
  updateTrustedContactInfoLocally,
  SYNC_TRUSTED_CHANNELS,
  syncTrustedChannels,
  SYNC_LAST_SEENS_AND_HEALTH,
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
import { downloadMetaShareWorker } from './sss';
import { SYNC_LAST_SEENS } from '../actions/trustedContacts';
import S3Service from '../../bitcoin/services/sss/S3Service';

const sendNotification = (recipient, notification) => {
  const receivers = [];
  if (recipient.walletID && recipient.FCMs.length)
    receivers.push({
      walletId: recipient.walletID,
      FCMs: recipient.FCMs,
    });

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

  const {
    contactInfo,
    contactsPublicKey,
    contactsWalletName,
    isGuardian,
  } = payload;

  let encKey;
  if (contactInfo.info) encKey = SSS.strechKey(contactInfo.info);
  const res = yield call(
    trustedContacts.finalizeContact,
    contactInfo.contactName,
    contactsPublicKey,
    encKey,
    contactsWalletName,
    isGuardian,
  );
  if (res.status === 200) {
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
  const trustedContactsInfo = yield select(
    (state) => state.trustedContacts.trustedContactsInfo,
  );
  const s3Service: S3Service = yield select((state) => state.sss.service);
  const { DECENTRALIZED_BACKUP } = yield select(
    (state) => state.storage.database,
  );
  const shareTransferDetails = {
    ...DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
  };

  let { contactName, shareIndex } = payload; // shareIndex is passed in case of Guardian
  contactName = contactName.toLowerCase().trim();

  const {
    walletID,
    FCMs,
    isGuardian,
    trustedChannel,
  } = trustedContactsService.tc.trustedContacts[contactName];

  let dataElements: TrustedDataElements = {
    remove: true,
  };
  // if (isGuardian) dataElements = { removeGuardian: true }; // deprecates guardian to trusted contact
  // else
  //   dataElements = {
  //     remove: true,
  //   };

  if (trustedChannel) {
    // removing established trusted contacts
    yield call(
      trustedContactsService.updateTrustedChannel,
      contactName,
      dataElements,
    );
  }

  if (isGuardian && !trustedChannel) {
    // Guardians gets removed post request expiry
    trustedContactsService.tc.trustedContacts[contactName].isGuardian = false;
    // if (shareIndex !== null && shareIndex <= 2)
    //   s3Service.resetSharesHealth(shareIndex);
    delete shareTransferDetails[shareIndex]; // enables createGuardian on manage backup

    // resets the highlight flag for manage backup
    let autoHighlightFlags = yield call(
      AsyncStorage.getItem,
      'AutoHighlightFlags',
    );
    if (autoHighlightFlags) {
      autoHighlightFlags = JSON.parse(autoHighlightFlags);
      if (shareIndex === 0)
        autoHighlightFlags = { ...autoHighlightFlags, secondaryDevice: false };
      else if (shareIndex === 1)
        autoHighlightFlags = { ...autoHighlightFlags, trustedContact1: false };
      else if (shareIndex === 2)
        autoHighlightFlags = { ...autoHighlightFlags, trustedContact2: false };

      AsyncStorage.setItem(
        'AutoHighlightFlags',
        JSON.stringify(autoHighlightFlags),
      );
    }
  }
  delete trustedContactsService.tc.trustedContacts[contactName];

  const tcInfo = trustedContactsInfo ? [...trustedContactsInfo] : null;
  if (tcInfo) {
    for (let itr = 0; itr < tcInfo.length; itr++) {
      const trustedContact = tcInfo[itr];
      if (trustedContact) {
        const presentContactName = `${trustedContact.firstName} ${
          trustedContact.lastName ? trustedContact.lastName : ''
        }`
          .toLowerCase()
          .trim();

        if (presentContactName === contactName) {
          if (itr < 3) {
            // let found = false;
            // for (let i = 3; i < tcInfo.length; i++) {
            //   if (tcInfo[i] && tcInfo[i].name == tcInfo[itr].name) {
            //     found = true;
            //     break;
            //   }
            // }
            // // push if not already present in TC list
            // if (!found) tcInfo.push(tcInfo[itr]);
            tcInfo[itr] = null; // Guardian position nullified
          } else tcInfo.splice(itr, 1);
          // yield call(
          //   AsyncStorage.setItem,
          //   'TrustedContactsInfo',
          //   JSON.stringify(tcInfo),
          // );
          yield put(updateTrustedContactInfoLocally(tcInfo));
          break;
        }
      }
    }
  }

  let dbPayload = {};
  const { SERVICES } = yield select((state) => state.storage.database);
  const updatedSERVICES = {
    ...SERVICES,
    TRUSTED_CONTACTS: JSON.stringify(trustedContactsService),
  };
  dbPayload = { SERVICES: updatedSERVICES };

  if (isGuardian) {
    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      SHARES_TRANSFER_DETAILS: shareTransferDetails,
    };
    dbPayload = { ...dbPayload, DECENTRALIZED_BACKUP: updatedBackup };
  }

  yield call(insertDBWorker, {
    payload: dbPayload,
  });

  if (walletID && FCMs) {
    const recipient = {
      walletID,
      FCMs,
    };
    const { walletName } = yield select(
      (state) => state.storage.database.WALLET_SETUP,
    );

    const notification: INotification = {
      notificationType: notificationType.contact,
      title: 'Friends and Family notification',
      body: `Trusted Contact removed by ${walletName}`,
      data: {},
      tag: notificationTag.IMP,
    };
    sendNotification(recipient, notification);
  }
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
        // send acceptance notification
        const { walletName } = yield select(
          (state) => state.storage.database.WALLET_SETUP,
        );

        const xpub = res.data;
        const tpub = testService.getTestXpub();
        const walletID = yield call(AsyncStorage.getItem, 'walletID');
        const FCM = yield call(AsyncStorage.getItem, 'fcmToken');

        const data: TrustedDataElements = {
          xpub,
          tpub,
          walletID,
          FCM,
          walletName,
        };
        const updateRes = yield call(
          trustedContacts.updateTrustedChannel,
          contactInfo.contactName,
          data,
          true,
        );
        if (updateRes.status === 200) {
          console.log('Xpub updated to TC for: ', contactInfo.contactName);

          const notification: INotification = {
            notificationType: notificationType.contact,
            title: 'Friends and Family notification',
            body: `Trusted Contact request accepted by ${walletName}`,
            data: {},
            tag: notificationTag.IMP,
          };

          const { walletID, FCMs } = trustedContacts.tc.trustedContacts[
            contactInfo.contactName.toLowerCase().trim()
          ];
          const recipient = {
            walletID,
            FCMs,
          };
          sendNotification(recipient, notification);
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
          SERVICES: {
            ...payload.updatedDB.SERVICES,
            REGULAR_ACCOUNT: updatedSERVICES.REGULAR_ACCOUNT,
            TRUSTED_CONTACTS: updatedSERVICES.TRUSTED_CONTACTS,
          },
        },
      });
    } else {
      yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    }

    const data: EphemeralDataElements = res.data.data;
    if (data && data.shareTransferDetails) {
      const { otp, encryptedKey } = data.shareTransferDetails;
      // yield delay(1000); // introducing delay in order to evade database insertion collision
      yield call(downloadMetaShareWorker, { payload: { encryptedKey, otp } });
      Toast('You have been successfully added as a Keeper');
      yield put(trustedContactApproved(contactInfo.contactName, true));
    } else if (payload.uploadXpub) {
      Toast('Contact successfully added to Friends and Family');
      yield put(trustedContactApproved(contactInfo.contactName, true));
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

export function* trustedChannelsSetupSyncWorker() {
  // TODO: simplify and optimise the saga
  yield put(switchTCLoading('trustedChannelsSetupSync'));

  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );
  const regularService: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );
  const preSyncReg = JSON.stringify(regularService);
  const testService: TestAccount = yield select(
    (state) => state.accounts[TEST_ACCOUNT].service,
  );

  const contacts: Contacts = trustedContacts.tc.trustedContacts;
  let DHInfos;
  for (const contactName of Object.keys(contacts)) {
    let { trustedChannel, ephemeralChannel, encKey } = contacts[contactName];

    if (!trustedChannel) {
      // trusted channel not setup; probably need to still get the counter party's pubKey

      // update DHInfos(once) only if there's a contact w/ trusted channel pending
      if (!DHInfos) {
        yield call(fetchNotificationsWorker); // refreshes DHInfos
        DHInfos = yield call(AsyncStorage.getItem, 'DHInfos');
        if (DHInfos) {
          DHInfos = JSON.parse(DHInfos);
        } else {
          DHInfos = [];
        }
      }

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
        // ECDH pub not available for this contact
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
        // updating trusted derivative acc(from trusted-channel) in case of non-updation(handles recovery failures)
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
      // generate a corresponding derivative acc and assign xpub(uploading info to trusted channel)
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

  const preSyncTC = yield call(AsyncStorage.getItem, 'preSyncTC');
  const postSyncTC = JSON.stringify(trustedContacts.tc.trustedContacts);
  const postSyncReg = JSON.stringify(regularService);

  if (
    Object.keys(trustedContacts.tc.trustedContacts).length &&
    (!preSyncTC || preSyncTC !== postSyncTC || preSyncReg !== postSyncReg)
  ) {
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      REGULAR_ACCOUNT: JSON.stringify(regularService),
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };
    yield call(insertDBWorker, {
      payload: { SERVICES: updatedSERVICES },
    });

    // console.log('Updating WI...');
    // yield put(updateWalletImage()); // TODO: re-enable once the WI updation is refactored and optimised

    yield call(AsyncStorage.setItem, 'preSyncTC', postSyncTC);
  }

  yield put(switchTCLoading('trustedChannelsSetupSync'));

  // synching trusted channel data
  yield put(syncTrustedChannels());
}

export const trustedChannelsSetupSyncWatcher = createWatcher(
  trustedChannelsSetupSyncWorker,
  TRUSTED_CHANNELS_SETUP_SYNC,
);

function* syncLastSeensWorker({ payload }) {
  // updates and fetches last seen for all trusted channels
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  if (Object.keys(trustedContacts.tc.trustedContacts).length) {
    const preSyncTC = JSON.stringify(trustedContacts.tc.trustedContacts);

    const res = yield call(trustedContacts.syncLastSeens);
    console.log({ res });
    if (res.status === 200) {
      const postSyncTC = JSON.stringify(trustedContacts.tc.trustedContacts);

      if (preSyncTC !== postSyncTC) {
        const { SERVICES } = yield select((state) => state.storage.database);
        const updatedSERVICES = {
          ...SERVICES,
          TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
        };
        yield call(insertDBWorker, {
          payload: { SERVICES: updatedSERVICES },
        });
      }
    } else {
      console.log('Failed to sync last seens', res.err);
    }
  }
}

export const syncLastSeensWatcher = createWatcher(
  syncLastSeensWorker,
  SYNC_LAST_SEENS,
);

function* syncLastSeensAndHealthWorker({ payload }) {
  // updates and fetches last seen for all trusted channels
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );
  const s3Service: S3Service = yield select((state) => state.sss.service);

  if (Object.keys(trustedContacts.tc.trustedContacts).length) {
    const preSyncTC = JSON.stringify(trustedContacts.tc.trustedContacts);

    const { metaShares, healthCheckStatus } = s3Service.sss;
    const preSyncHCStatus = JSON.stringify({ healthCheckStatus });

    const res = yield call(
      trustedContacts.syncLastSeensAndHealth,
      metaShares.slice(0, 3),
      healthCheckStatus,
    );
    console.log({ res });
    if (res.status === 200) {
      const postSyncTC = JSON.stringify(trustedContacts.tc.trustedContacts);
      const { healthCheckStatus } = res.data;
      const postSyncHCStatus = JSON.stringify({ healthCheckStatus });

      if (preSyncTC !== postSyncTC || preSyncHCStatus !== postSyncHCStatus) {
        const { SERVICES } = yield select((state) => state.storage.database);
        let updatedSERVICES = {
          ...SERVICES,
          TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
        };

        if (preSyncHCStatus !== postSyncHCStatus) {
          s3Service.sss.healthCheckStatus = healthCheckStatus;
          updatedSERVICES = {
            ...updatedSERVICES,
            S3_SERVICE: JSON.stringify(s3Service),
          };
        }

        yield call(insertDBWorker, {
          payload: { SERVICES: updatedSERVICES },
        });
      }
    } else {
      console.log('Failed to sync last seens', res.err);
    }
  }
}

export const syncLastSeensAndHealthWatcher = createWatcher(
  syncLastSeensAndHealthWorker,
  SYNC_LAST_SEENS_AND_HEALTH,
);

function* syncTrustedChannelsWorker({ payload }) {
  // syncs trusted channels
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );
  const { SERVICES, DECENTRALIZED_BACKUP } = yield select(
    (state) => state.storage.database,
  );
  const sharesUnderCustody = { ...DECENTRALIZED_BACKUP.UNDER_CUSTODY };

  const { contacts } = payload;

  if (Object.keys(trustedContacts.tc.trustedContacts).length) {
    const preSyncTC = JSON.stringify(trustedContacts.tc.trustedContacts);

    const res = yield call(trustedContacts.syncTrustedChannels, contacts);
    console.log({ res });

    if (res.status === 200 && res.data && res.data.synched) {
      const { contactsToRemove, guardiansToRemove } = res.data;

      if (contactsToRemove.length || guardiansToRemove.length) {
        const trustedContactsInfo = yield select(
          (state) => state.trustedContacts.trustedContactsInfo,
        );
        const tcInfo = trustedContactsInfo ? [...trustedContactsInfo] : null;

        // downgrade guardians and remove share
        for (const guardianName of guardiansToRemove) {
          trustedContacts.tc.trustedContacts[guardianName].isWard = false;
          delete sharesUnderCustody[
            trustedContacts.tc.trustedContacts[guardianName].contactsWalletName
          ];
        }

        // remove trusted contacts
        for (const contactName of contactsToRemove) {
          delete trustedContacts.tc.trustedContacts[contactName];
          if (tcInfo) {
            for (let itr = 0; itr < tcInfo.length; itr++) {
              const trustedContact = tcInfo[itr];
              if (trustedContact) {
                const presentContactName = `${trustedContact.firstName} ${
                  trustedContact.lastName ? trustedContact.lastName : ''
                }`
                  .toLowerCase()
                  .trim();

                if (presentContactName === contactName) {
                  if (itr < 3) tcInfo[itr] = null;
                  // Guardian nullified
                  else tcInfo.splice(itr, 1);
                  // yield call(
                  //   AsyncStorage.setItem,
                  //   'TrustedContactsInfo',
                  //   JSON.stringify(tcInfo),
                  // );
                  break;
                }
              }
            }
          }
        }
        yield put(updateTrustedContactInfoLocally(tcInfo));
      }

      const postSyncTC = JSON.stringify(trustedContacts.tc.trustedContacts);

      if (preSyncTC !== postSyncTC || guardiansToRemove.length) {
        let payload = {};
        const updatedSERVICES = {
          ...SERVICES,
          TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
        };
        payload = { SERVICES: updatedSERVICES };

        if (guardiansToRemove.length) {
          const updatedBackup = {
            ...DECENTRALIZED_BACKUP,
            UNDER_CUSTODY: sharesUnderCustody,
          };
          payload = { ...payload, DECENTRALIZED_BACKUP: updatedBackup };
        }

        yield call(insertDBWorker, {
          payload,
        });
        console.log('Trusted channels synched');
      }
    } else {
      console.log('Failed to sync trusted channels', res.err);
    }
  }
}

export const syncTrustedChannelsWatcher = createWatcher(
  syncTrustedChannelsWorker,
  SYNC_TRUSTED_CHANNELS,
);
