import { call, put, select, delay } from 'redux-saga/effects';
import {
  createWatcher,
  serviceGenerator,
  requestTimedout,
} from '../utils/utilities';
import {
  INIT_HEALTH_CHECK,
  switchS3Loader,
  healthCheckInitialized,
  PREPARE_MSHARES,
  UPLOAD_ENC_MSHARE,
  DOWNLOAD_MSHARE,
  UPDATE_MSHARES_HEALTH,
  CHECK_MSHARES_HEALTH,
  UPLOAD_REQUESTED_SHARE,
  REQUEST_SHARE,
  RECOVER_MNEMONIC,
  mnemonicRecovered,
  UPDATE_DYNAMINC_NONPMDD,
  DOWNLOAD_DYNAMIC_NONPMDD,
  RECOVER_WALLET,
  RESTORE_DYNAMIC_NONPMDD,
  requestedShareUploaded,
  downloadedMShare,
  OVERALL_HEALTH,
  calculateOverallHealth,
  overallHealthCalculated,
  CHECK_PDF_HEALTH,
  RESTORE_SHARE_FROM_QR,
  updateMSharesHealth,
  UPDATE_SHARE_HISTORY,
  updateShareHistory,
  pdfHealthChecked,
  UnableRecoverShareFromQR,
  walletRecoveryFailed,
  ErrorSending,
  UploadSuccessfully,
  ErrorReceiving,
  UPDATE_WALLET_IMAGE,
  FETCH_WALLET_IMAGE,
  fetchWalletImage,
  walletImageChecked,
  GENERATE_PERSONAL_COPY,
  SHARE_PERSONAL_COPY,
  personalCopyShared,
  pdfHealthCheckFailed,
  personalCopyGenerated,
} from '../actions/sss';
import S3Service from '../../bitcoin/services/sss/S3Service';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import {
  SECURE_ACCOUNT,
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../common/constants/serviceTypes';
import {
  EncDynamicNonPMDD,
  MetaShare,
  EphemeralDataElements,
  DerivativeAccounts,
  DerivativeAccount,
  TrustedDataElements,
  WalletImage,
  ShareUploadables,
} from '../../bitcoin/utilities/Interface';
import generatePDF from '../utils/generatePDF';
import HealthStatus from '../../bitcoin/utilities/sss/HealthStatus';
import { AsyncStorage, Platform, NativeModules, Alert } from 'react-native';
import {
  updateEphemeralChannel,
  trustedContactApproved,
  updateTrustedChannel,
  updateTrustedContactInfoLocally,
} from '../actions/trustedContacts';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import crypto from 'crypto';
import DeviceInfo from 'react-native-device-info';
import { insertDBWorker } from './storage';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';
import Toast from '../../components/Toast';
var Mailer = require('NativeModules').RNMail;
import config from '../../bitcoin/HexaConfig';
import idx from 'idx';

function* generateMetaSharesWorker() {
  const s3Service: S3Service = yield select((state) => state.sss.service);
  const { walletName } = yield select(
    (state) => state.storage.database.WALLET_SETUP,
  );
  const secureAccount: SecureAccount = yield select(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );

  const secondaryMnemonic = secureAccount.secureHDWallet.secondaryMnemonic;
  const twoFASecret = secureAccount.secureHDWallet.twoFASetup.secret;
  if (!secondaryMnemonic || !twoFASecret) {
    throw new Error('secure assets missing; staticNonPMDD');
  }
  const { secondary, bh } = secureAccount.secureHDWallet.xpubs;

  const secureAssets = {
    secondaryMnemonic,
    twoFASecret,
    secondaryXpub: secondary,
    bhXpub: bh,
  };

  const appVersion = DeviceInfo.getVersion();

  if (s3Service.sss.metaShares.length) return;
  const res = yield call(
    s3Service.createMetaShares,
    secureAssets,
    walletName,
    appVersion,
  );
  if (res.status === 200) {
    return s3Service;
    // const { SERVICES } = yield select(state => state.storage.database);
    // const updatedSERVICES = {
    //   ...SERVICES,
    //   S3_SERVICE: JSON.stringify(s3Service)
    // };
    // yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error(res.err);
  }
}

export const generateMetaSharesWatcher = createWatcher(
  generateMetaSharesWorker,
  PREPARE_MSHARES,
);

function* initHCWorker() {
  let s3Service: S3Service = yield select((state) => state.sss.service);
  const initialized = s3Service.sss.healthCheckInitialized;
  if (initialized) return;

  yield put(switchS3Loader('initHC'));
  if (!s3Service.sss.metaShares.length) {
    s3Service = yield call(generateMetaSharesWorker); // executes once (during initial setup)
  }
  const res = yield call(s3Service.initializeHealthcheck);
  if (res.status === 200) {
    yield put(healthCheckInitialized());

    // walletID globalization (in-app)
    const walletID = yield call(AsyncStorage.getItem, 'walletID');
    if (!walletID) {
      yield call(AsyncStorage.setItem, 'walletID', s3Service.sss.walletId);
    }

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      S3_SERVICE: JSON.stringify(s3Service),
    };
    console.log('Health Check Initialized');
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log({ err: res.err });
    yield put(switchS3Loader('initHC'));
  }
}

export const initHCWatcher = createWatcher(initHCWorker, INIT_HEALTH_CHECK);

function* uploadEncMetaShareWorker({ payload }) {
  // Transfer: User >>> Guardian
  yield put(switchS3Loader('uploadMetaShare'));

  const s3Service: S3Service = yield select((state) => state.sss.service);
  if (!s3Service.sss.metaShares.length) return;
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );
  const regularService: RegularAccount = yield select(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );

  const { DECENTRALIZED_BACKUP, SERVICES } = yield select(
    (state) => state.storage.database,
  );

  if (payload.changingGuardian) {
    if (payload.contactInfo.contactName === 'Secondary Device') {
      delete trustedContacts.tc.trustedContacts[
        payload.contactInfo.contactName
      ]; // removing secondary device's TC
      const accountNumber =
        regularService.hdWallet.trustedContactToDA[
        payload.contactInfo.contactName
        ];
      if (accountNumber) {
        delete regularService.hdWallet.derivativeAccounts[TRUSTED_CONTACTS][
          accountNumber
        ].contactDetails; // removing previous SDs xpub
      }
    }

    yield call(s3Service.reshareMetaShare, payload.shareIndex);
    if (payload.previousGuardianName) {
      trustedContacts.tc.trustedContacts[
        payload.previousGuardianName
      ].isGuardian = false;
    }
  } else {
    // preventing re-uploads till expiry
    if (DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[payload.shareIndex]) {
      if (
        Date.now() -
        DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS[payload.shareIndex]
          .UPLOADED_AT <
        config.TC_REQUEST_EXPIRY
      ) {
        // re-upload after 10 minutes (removal sync w/ relayer)
        yield put(switchS3Loader('uploadMetaShare'));

        return;
      }
    }
  }

  // TODO: reactivate DNP Transportation for Hexa Premium
  // const { DYNAMIC_NONPMDD } = DECENTRALIZED_BACKUP;
  // let dynamicNonPMDD;
  // if (Object.keys(DYNAMIC_NONPMDD).length) dynamicNonPMDD = DYNAMIC_NONPMDD; // Nothing in DNP

  // const res = yield call(
  //   s3Service.uploadShare,
  //   payload.shareIndex,
  //   dynamicNonPMDD,
  // );

  const res = yield call(
    s3Service.prepareShareUploadables,
    payload.shareIndex,
    payload.contactInfo.contactName,
  ); // contact injection (requires database insertion)

  if (res.status === 200) {
    const {
      otp,
      encryptedKey,
      encryptedMetaShare,
      messageId,
      encryptedDynamicNonPMDD,
    } = res.data;

    const shareUploadables: ShareUploadables = {
      encryptedMetaShare,
      messageId,
      encryptedDynamicNonPMDD,
    };
    const updatedSERVICES = {
      ...SERVICES,
      REGULAR_ACCOUNT: JSON.stringify(regularService),
      S3_SERVICE: JSON.stringify(s3Service),
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };

    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      SHARES_TRANSFER_DETAILS: {
        ...DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
        [payload.shareIndex]: {
          OTP: otp,
          ENCRYPTED_KEY: encryptedKey,
          UPLOADED_AT: Date.now(),
        },
      },
    };

    // yield call(insertDBWorker, {
    //   payload: {
    //     DECENTRALIZED_BACKUP: updatedBackup,
    //     SERVICES: updatedSERVICES,
    //   },
    // });

    const updatedDB = {
      DECENTRALIZED_BACKUP: updatedBackup,
      SERVICES: updatedSERVICES,
    };

    const contact =
      trustedContacts.tc.trustedContacts[payload.contactInfo.contactName];
    if (contact && contact.symmetricKey) {
      // has trusted channel
      const data: TrustedDataElements = {
        // won't include elements from payload.data
        shareTransferDetails: {
          otp,
          encryptedKey,
        },
      };
      yield put(
        updateTrustedChannel(
          payload.contactInfo,
          data,
          null,
          shareUploadables,
          updatedDB,
        ),
      );
    } else {
      // adding transfer details to he ephemeral data
      const data: EphemeralDataElements = {
        ...payload.data,
        shareTransferDetails: {
          otp,
          encryptedKey,
        },
      };

      yield put(
        updateEphemeralChannel(
          payload.contactInfo,
          data,
          null,
          null,
          null,
          shareUploadables,
          updatedDB,
        ),
      );
    }
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(ErrorSending(true));
    // Alert.alert('Upload Failed!', res.err);
    console.log({ err: res.err });
  }
  yield put(switchS3Loader('uploadMetaShare'));
}

export const uploadEncMetaShareWatcher = createWatcher(
  uploadEncMetaShareWorker,
  UPLOAD_ENC_MSHARE,
);

function* requestShareWorker({ payload }) {
  const { DECENTRALIZED_BACKUP, WALLET_SETUP } = yield select(
    (state) => state.storage.database,
  );

  // if (Object.keys(DECENTRALIZED_BACKUP.RECOVERY_SHARES).length >= 3) {
  //   console.log(DECENTRALIZED_BACKUP.RECOVERY_SHARES);
  //   return;
  // } // capping to 3 shares reception

  const { key } = yield call(S3Service.generateRequestCreds);

  const updatedBackup = {
    ...DECENTRALIZED_BACKUP,
    RECOVERY_SHARES: {
      ...DECENTRALIZED_BACKUP.RECOVERY_SHARES,
      [payload.shareIndex]: {
        REQUEST_DETAILS: {
          TAG: WALLET_SETUP.walletName,
          KEY: key,
        },
      },
    },
  };

  yield call(insertDBWorker, {
    payload: { DECENTRALIZED_BACKUP: updatedBackup },
  });
}

export const requestShareWatcher = createWatcher(
  requestShareWorker,
  REQUEST_SHARE,
);

function* uploadRequestedShareWorker({ payload }) {
  // Transfer: Guardian >>> User
  const { tag, encryptedKey, otp } = payload;
  const { DECENTRALIZED_BACKUP } = yield select(
    (state) => state.storage.database,
  );
  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP;

  if (!UNDER_CUSTODY[tag]) {
    yield put(ErrorSending(true));
    // Alert.alert('Upload failed!', 'No share under custody for this wallet.');
  }

  const { META_SHARE, ENC_DYNAMIC_NONPMDD, TRANSFER_DETAILS } = UNDER_CUSTODY[
    tag
  ];

  // // preventing re-uploads till expiry
  // if (TRANSFER_DETAILS) {
  //   if (Date.now() - TRANSFER_DETAILS.UPLOADED_AT < config.TC_REQUEST_EXPIRY) {
  //     return;
  //   }
  // }

  // TODO: 10 min removal strategy
  yield put(switchS3Loader('uploadRequestedShare'));

  const res = yield call(
    S3Service.uploadRequestedShare,
    encryptedKey,
    otp,
    META_SHARE,
    ENC_DYNAMIC_NONPMDD,
  );

  if (res.status === 200 && res.data.success === true) {
    // yield success
    console.log('Upload successful!');
    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      UNDER_CUSTODY: {
        ...DECENTRALIZED_BACKUP.UNDER_CUSTODY,
        [tag]: {
          ...DECENTRALIZED_BACKUP.UNDER_CUSTODY[tag],
          TRANSFER_DETAILS: {
            KEY: encryptedKey,
            UPLOADED_AT: Date.now(),
          },
        },
      },
    };

    yield call(insertDBWorker, {
      payload: { DECENTRALIZED_BACKUP: updatedBackup },
    });

    yield put(requestedShareUploaded(tag, true));
    yield put(UploadSuccessfully(true));
    // Alert.alert(
    //   'Upload successful!',
    //   "Requester's share has been uploaded to the relay.",
    // );
    Toast(`${tag}'s Recovery Key sent.`);
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(requestedShareUploaded(tag, false, res.err));
  }
  yield put(switchS3Loader('uploadRequestedShare'));
}

export const uploadRequestedShareWatcher = createWatcher(
  uploadRequestedShareWorker,
  UPLOAD_REQUESTED_SHARE,
);

function* downloadMetaShareWorker({ payload }) {
  yield put(switchS3Loader('downloadMetaShare'));

  const { encryptedKey, otp } = payload; // OTP is missing when the encryptedKey isn't OTP encrypted
  const s3Service: S3Service = yield select((state) => state.sss.service);

  const { DECENTRALIZED_BACKUP } = yield select(
    (state) => state.storage.database,
  );

  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP;

  let res;
  if (payload.downloadType !== 'recovery') {
    let existingShares = [];
    if (Object.keys(UNDER_CUSTODY).length) {
      existingShares = Object.keys(UNDER_CUSTODY).map(
        (tag) => UNDER_CUSTODY[tag].META_SHARE,
      );
    }

    res = yield call(
      S3Service.downloadAndValidateShare,
      encryptedKey,
      otp,
      existingShares,
      s3Service.sss.walletId,
    );
  } else {
    res = yield call(S3Service.downloadAndValidateShare, encryptedKey);
  }

  console.log({ res });
  if (res.status === 200) {
    const { metaShare, encryptedDynamicNonPMDD } = res.data;
    let updatedBackup;
    if (payload.downloadType !== 'recovery') {
      //TODO: activate DNP Transportation Layer for Hexa Premium
      // const dynamicNonPMDD = {
      //   ...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD,
      //   META_SHARES: DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD.META_SHARES
      //     ? [...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD.META_SHARES, metaShare]
      //     : [metaShare],
      // };

      updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        UNDER_CUSTODY: {
          ...DECENTRALIZED_BACKUP.UNDER_CUSTODY,
          [metaShare.meta.tag]: {
            META_SHARE: metaShare,
            ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
          },
        },
        // DYNAMIC_NONPMDD: dynamicNonPMDD,
      };

      console.log({ updatedBackup });

      // yield call(updateDynamicNonPMDDWorker, { payload: { dynamicNonPMDD } }); // upload updated dynamic nonPMDD (TODO: time-based?)
      yield put(downloadedMShare(otp, true));
      yield put(updateMSharesHealth(updatedBackup));
    } else {
      let updatedRecoveryShares = {};
      let updated = false;

      if (payload.replaceIndex === 0 || payload.replaceIndex) {
        // replacing stored key w/ scanned from Guardian's help-restore
        updatedRecoveryShares = {
          ...DECENTRALIZED_BACKUP.RECOVERY_SHARES,
          [payload.replaceIndex]: {
            REQUEST_DETAILS: { KEY: encryptedKey },
            META_SHARE: metaShare,
            ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
          },
        };
      } else {
        Object.keys(DECENTRALIZED_BACKUP.RECOVERY_SHARES).forEach(
          (objectKey) => {
            const recoveryShare =
              DECENTRALIZED_BACKUP.RECOVERY_SHARES[objectKey];
            if (
              recoveryShare.REQUEST_DETAILS &&
              recoveryShare.REQUEST_DETAILS.KEY === encryptedKey
            ) {
              updatedRecoveryShares[objectKey] = {
                REQUEST_DETAILS: recoveryShare.REQUEST_DETAILS,
                META_SHARE: metaShare,
                ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
              };
              updated = true;
            } else {
              updatedRecoveryShares[objectKey] = recoveryShare;
            }
          },
        );
      }

      // if (!updated) {
      //   if (DECENTRALIZED_BACKUP.RECOVERY_SHARES[metaShare.shareId]) {
      //     Alert.alert(
      //       'Key Exists',
      //       'Following key already exists for recovery',
      //     );
      //     return;
      //   }
      //   updatedRecoveryShares[metaShare.shareId] = {
      //     META_SHARE: metaShare,
      //     ENC_DYNAMIC_NONPMDD: encryptedDynamicNonPMDD,
      //   };
      //   Toast('Share Downloaded');
      // }

      updatedBackup = {
        ...DECENTRALIZED_BACKUP,
        RECOVERY_SHARES: updatedRecoveryShares,
      };
      // yield put(downloadedMShare(otp, true));
      yield call(insertDBWorker, {
        payload: { DECENTRALIZED_BACKUP: updatedBackup },
      });
    }
    // yield put(
    //   insertIntoDB({
    //     DECENTRALIZED_BACKUP: updatedBackup,
    //   }),
    // ); // connecting insertion at updateMSharesHealth
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log({ res });
    yield put(ErrorReceiving(true));
    // Alert.alert('Download Failed!', res.err);
    yield put(downloadedMShare(otp, false, res.err));
  }
  yield put(switchS3Loader('downloadMetaShare'));
}

export const downloadMetaShareWatcher = createWatcher(
  downloadMetaShareWorker,
  DOWNLOAD_MSHARE,
);

function* generatePersonalCopyWorker({ payload }) {
  // yield put(switchS3Loader('generatePDF'));
  const { selectedPersonalCopy } = payload; // corresponds to metaShare index (3/4)
  const shareIndex = selectedPersonalCopy.type === 'copy1' ? 3 : 4;
  const s3Service: S3Service = yield select((state) => state.sss.service);
  const res = yield call(s3Service.createQR, shareIndex);
  if (res.status !== 200) {
    console.log({ err: res.err });
    return;
  }

  const secureAccount: SecureAccount = yield select(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );
  const secondaryMnemonic = secureAccount.secureHDWallet.secondaryMnemonic;
  if (!secondaryMnemonic) {
    throw new Error(
      'Personal copies generation failed; secondary mnemonic missing',
    );
  }
  const { secondary, bh } = secureAccount.secureHDWallet.xpubs;
  const secureAssets = {
    secondaryMnemonic,
    secondaryXpub: secondary,
    bhXpub: bh,
  };

  const pdfData = {
    qrData: res.data.qrData,
    ...secureAssets,
  };

  const { security, walletName } = yield select(
    (state) => state.storage.database.WALLET_SETUP,
  );

  try {
    const pdfPath = yield call(
      generatePDF,
      pdfData,
      `Hexa_Recovery_Key_${walletName}_${shareIndex - 2}.pdf`,
      // `Hexa_${walletName}_Recovery_Secret_Personal_Copy${shareIndex - 2}.pdf`,
      // `Hexa Share ${shareIndex + 1}`,
      `Hexa Recovery Key for ${walletName}'s Wallet`,
      security.answer,
    );

    let personalCopyDetails = yield call(
      AsyncStorage.getItem,
      'personalCopyDetails',
    );

    if (!personalCopyDetails) {
      personalCopyDetails = {
        [selectedPersonalCopy.type]: {
          path: pdfPath,
          shared: false,
          sharingDetails: {},
        },
      };
    } else {
      personalCopyDetails = JSON.parse(personalCopyDetails);
      personalCopyDetails = {
        ...personalCopyDetails,
        [selectedPersonalCopy.type]: {
          path: pdfPath,
          shared: false,
          sharingDetails: {},
        },
      };
    }

    yield call(
      AsyncStorage.setItem,
      'personalCopyDetails',
      JSON.stringify(personalCopyDetails),
    );

    // reset PDF health (if present) post reshare
    let storedPDFHealth = yield call(AsyncStorage.getItem, 'PDF Health');
    if (storedPDFHealth) {
      const { pdfHealth } = s3Service.sss;
      storedPDFHealth = JSON.parse(storedPDFHealth);
      storedPDFHealth = {
        ...storedPDFHealth,
        [shareIndex]: { shareId: pdfHealth[shareIndex].shareId, updatedAt: 0 },
      };

      yield call(
        AsyncStorage.setItem,
        'PDF Health',
        JSON.stringify(storedPDFHealth),
      );
    }

    yield put(personalCopyGenerated({ [selectedPersonalCopy.type]: true }));

    // if (Object.keys(personalCopyDetails).length == 2) {
    //   // remove sec-mne once both the personal copies are generated
    //   const { removed } = secureAccount.removeSecondaryMnemonic();
    //   if (!removed) console.log('Failed to remove sec-mne');
    // }

    // remove secondary mnemonic (if the secondary menmonic has been removed and re-injected)
    const blockPCShare = yield call(AsyncStorage.getItem, 'blockPCShare');
    if (blockPCShare) {
      if (secureAccount.secureHDWallet.secondaryMnemonic) {
        const { removed } = secureAccount.removeSecondaryMnemonic();
        if (!removed) {
          console.log('Failed to remove the secondary mnemonic');
        }
      }
    }

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      SECURE_ACCOUNT: JSON.stringify(secureAccount),
      S3_SERVICE: JSON.stringify(s3Service),
    };

    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } catch (err) {
    console.log({ err });
    yield put(personalCopyGenerated({ [selectedPersonalCopy.type]: false }));
  }
  //yield put(switchS3Loader('generatePDF'));
}

export const generatePersonalCopyWatcher = createWatcher(
  generatePersonalCopyWorker,
  GENERATE_PERSONAL_COPY,
);

function* sharePersonalCopyWorker({ payload }) {
  const { shareVia, selectedPersonalCopy, isEmailOtherOptions } = payload;

  try {
    let personalCopyDetails = yield call(
      AsyncStorage.getItem,
      'personalCopyDetails',
    );
    if (!personalCopyDetails)
      throw new Error('Personal copy not found/generated');
    personalCopyDetails = JSON.parse(personalCopyDetails);
    if (!personalCopyDetails[selectedPersonalCopy.type])
      throw new Error('Personal copy not found/generated');

    const { security } = yield select(
      (state) => state.storage.database.WALLET_SETUP,
    );

    switch (shareVia) {
      case 'Email':
        if (!isEmailOtherOptions) {
          yield call(
            Mailer.mail,
            {
              subject: selectedPersonalCopy.title,
              body: `<b>Please find attached the personal copy ${
                selectedPersonalCopy.type === 'copy1' ? '1' : '2'
                } share pdf, it is password protected by the answer to the security question.</b>`,
              isHTML: true,
              attachment: {
                path:
                  Platform.OS == 'android'
                    ? 'file://' +
                    personalCopyDetails[selectedPersonalCopy.type].path
                    : personalCopyDetails[selectedPersonalCopy.type].path, // The absolute path of the file from which to read data.
                type: 'pdf', // Mime Type: jpg, png, doc, ppt, html, pdf, csv
                name: selectedPersonalCopy.title, // Optional: Custom filename for attachment
              },
            },
            (err, event) => {
              console.log({ event, err });
              // on delayed error (rollback the changes that happened post switch case)
              setTimeout(() => {
                AsyncStorage.setItem(
                  'personalCopyDetails',
                  JSON.stringify(personalCopyDetails),
                );
              }, 1000);
            },
          );
        } else {
          let shareOptions = {
            title: selectedPersonalCopy.title,
            message: `Please find attached the personal copy ${
              selectedPersonalCopy.type === 'copy1' ? '1' : '2'
              } share pdf, it is password protected by the answer to the security question.`,
            url:
              Platform.OS == 'android'
                ? 'file://' +
                personalCopyDetails[selectedPersonalCopy.type].path
                : personalCopyDetails[selectedPersonalCopy.type].path,
            type: 'application/pdf',
            showAppsToView: true,
            subject: selectedPersonalCopy.title,
          };

          try {
            yield call(Share.open, shareOptions);
          } catch (err) {
            let errorMessage = idx(err, _ => _.message)
            if (errorMessage !== "User did not share") {
              throw new Error(`Share failed: ${err}`);
            }
          }
        }
        break;

      case 'Print':
        let pdfDecr = {
          path: personalCopyDetails[selectedPersonalCopy.type].path,
          filename:
            selectedPersonalCopy.type === 'copy1'
              ? 'PersonalCopy1.pdf'
              : 'PersonalCopy2.pdf',
          password: security.answer,
        };
        if (Platform.OS == 'android') {
          var PdfPassword = yield NativeModules.PdfPassword;
          yield call(
            PdfPassword.print,
            JSON.stringify(pdfDecr),
            (err: any) => {
              console.log({ err });
              // on delayed error (rollback the changes that happened post switch case)
              setTimeout(() => {
                AsyncStorage.setItem(
                  'personalCopyDetails',
                  JSON.stringify(personalCopyDetails),
                );
              }, 1000);
            },
            async (res: any) => {
              await RNPrint.print({
                filePath: 'file://' + res,
              });
              console.log({ res });
            },
          );
        } else {
          try {
            yield call(RNPrint.print, {
              filePath: personalCopyDetails[selectedPersonalCopy.type].path,
            });
          } catch (err) {
            console.log(err);
            throw new Error(`Print failed: ${err}`);
          }
        }
        break;

      case 'Other':
        let shareOptions = {
          title: selectedPersonalCopy.title,
          message: `Please find attached the personal copy ${
            selectedPersonalCopy.type === 'copy1' ? '1' : '2'
            } share pdf, it is password protected by the answer to the security question.`,
          url:
            Platform.OS == 'android'
              ? 'file://' + personalCopyDetails[selectedPersonalCopy.type].path
              : personalCopyDetails[selectedPersonalCopy.type].path,
          type: 'application/pdf',
          showAppsToView: true,
          subject: selectedPersonalCopy.title,
        };

        try {
          yield call(Share.open, shareOptions);
        } catch (err) {
          let errorMessage = idx(err, _ => _.message)
          if (errorMessage !== "User did not share") {
            throw new Error(`Share failed: ${err}`);
          }
        }
        break;

      default:
        throw new Error('Invalid sharing option');
    }

    const updatedPersonalCopyDetails = {
      ...personalCopyDetails,
      [selectedPersonalCopy.type]: {
        ...personalCopyDetails[selectedPersonalCopy.type],
        // shared: true,
        sharingDetails: { shareVia, sharedAt: Date.now() },
      },
    };

    yield call(
      AsyncStorage.setItem,
      'personalCopyDetails',
      JSON.stringify(updatedPersonalCopyDetails),
    );

    yield put(personalCopyShared({ [selectedPersonalCopy.type]: true }));
  } catch (err) {
    console.log({ err });
    yield put(personalCopyShared({ [selectedPersonalCopy.type]: false }));
  }
}

export const sharePersonalCopyWatcher = createWatcher(
  sharePersonalCopyWorker,
  SHARE_PERSONAL_COPY,
);

function* updateMSharesHealthWorker({ payload }) {
  // set a timelapse for auto update and enable instantaneous manual update
  yield put(switchS3Loader('updateMSharesHealth'));

  const trustedContactsService: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  let DECENTRALIZED_BACKUP = payload.DECENTRALIZED_BACKUP;
  if (!DECENTRALIZED_BACKUP) {
    DECENTRALIZED_BACKUP = yield select(
      (state) => state.storage.database.DECENTRALIZED_BACKUP,
    );
  }

  const SERVICES = yield select((state) => state.storage.database.SERVICES);

  const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP;
  const metaShares = Object.keys(UNDER_CUSTODY).map(
    (tag) => UNDER_CUSTODY[tag].META_SHARE,
  );

  if (!metaShares.length) return;
  const res = yield call(S3Service.updateHealth, metaShares);
  if (res.status === 200) {
    // TODO: Use during selective updation
    const { updationInfo } = res.data;
    console.log({ updationInfo });
    Object.keys(UNDER_CUSTODY).forEach((tag) => {
      for (let info of updationInfo) {
        if (info.updated) {
          if (info.walletId === UNDER_CUSTODY[tag].META_SHARE.meta.walletId) {
            // UNDER_CUSTODY[tag].LAST_HEALTH_UPDATE = info.updatedAt;
            if (info.encryptedDynamicNonPMDD)
              UNDER_CUSTODY[tag].ENC_DYNAMIC_NONPMDD =
                info.encryptedDynamicNonPMDD;
          }
        } else {
          if (info.removeShare) {
            if (info.walletId === UNDER_CUSTODY[tag].META_SHARE.meta.walletId) {
              delete UNDER_CUSTODY[tag];

              for (const contactName of Object.keys(
                trustedContactsService.tc.trustedContacts,
              )) {
                const contact =
                  trustedContactsService.tc.trustedContacts[contactName];
                if (contact.walletID === info.walletId) {
                  contact.isWard = false;
                }
              }
            }
          }
        }
      }
    });

    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify(trustedContactsService),
    };

    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      UNDER_CUSTODY,
    };
    yield call(insertDBWorker, {
      payload: {
        DECENTRALIZED_BACKUP: updatedBackup,
        SERVICES: updatedSERVICES,
      },
    });
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log({ err: res.err });
  }
  yield put(switchS3Loader('updateMSharesHealth'));
}

export const updateMSharesHealthWatcher = createWatcher(
  updateMSharesHealthWorker,
  UPDATE_MSHARES_HEALTH,
);

function* checkMSharesHealthWorker() {
  yield put(switchS3Loader('checkMSharesHealth'));
  const s3Service: S3Service = yield select((state) => state.sss.service);
  const preFetchHealth = JSON.stringify(s3Service.sss.healthCheckStatus);
  const res = yield call(s3Service.checkHealth);
  const postFetchHealth = JSON.stringify(s3Service.sss.healthCheckStatus);

  yield put(calculateOverallHealth(s3Service));

  if (res.status === 200) {
    if (preFetchHealth != postFetchHealth) {
      const { SERVICES } = yield select((state) => state.storage.database);
      const updatedSERVICES = {
        ...SERVICES,
        S3_SERVICE: JSON.stringify(s3Service),
      };
      console.log('Health Check updated');
      yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    }
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log({ err: res.err });
  }

  yield put(switchS3Loader('checkMSharesHealth'));
}

export const checkMSharesHealthWatcher = createWatcher(
  checkMSharesHealthWorker,
  CHECK_MSHARES_HEALTH,
);

function* checkPDFHealthWorker({ payload }) {
  const s3Service: S3Service = yield select((state) => state.sss.service);
  const { pdfHealth } = s3Service.sss;
  const { scannedQR, index } = payload;

  if (scannedQR === pdfHealth[index].qrData) {
    let storedPDFHealth = JSON.parse(
      yield call(AsyncStorage.getItem, 'PDF Health'),
    );

    storedPDFHealth = storedPDFHealth ? storedPDFHealth : {};

    let updatedPDFHealth = {
      ...storedPDFHealth,
      [index]: { shareId: pdfHealth[index].shareId, updatedAt: Date.now() },
    };

    if (!updatedPDFHealth[3]) {
      updatedPDFHealth = {
        ...updatedPDFHealth,
        [3]: {
          shareId: pdfHealth[3] ? pdfHealth[3].shareId : 'placeHolderID3',
          updatedAt: 0,
        },
      };
    }
    if (!updatedPDFHealth[4]) {
      updatedPDFHealth = {
        ...updatedPDFHealth,
        [4]: {
          shareId: pdfHealth[4] ? pdfHealth[4].shareId : 'placeHolderID4',
          updatedAt: 0,
        },
      };
    }

    console.log({ updatedPDFHealth });
    yield call(
      AsyncStorage.setItem,
      'PDF Health',
      JSON.stringify(updatedPDFHealth),
    );
    yield put(pdfHealthChecked('pdfHealthChecked'));
  } else {
    console.log({ pdfHealth, payload });
    yield put(pdfHealthCheckFailed(true));
    //Alert.alert('Invalid QR!', 'The scanned QR is wrong, please try again.');
  }

  // if (res.status === 200) {
  //   if (preInstance !== postInstance) {
  //     const { SERVICES } = yield select(state => state.storage.database);
  //     const updatedSERVICES = {
  //       ...SERVICES,
  //       S3_SERVICE: JSON.stringify(s3Service),
  //     };

  //     yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  //   }
  // } else {
  //   console.log({ err: res.err });
  // }

  // yield put(switchS3Loader('checkMSharesHealth'));
}

export const checkPDFHealthWatcher = createWatcher(
  checkPDFHealthWorker,
  CHECK_PDF_HEALTH,
);

function* shareHistoryUpdateWorker({ payload }) {
  const { overallHealth } = payload;
  const shareHistory = JSON.parse(
    yield call(AsyncStorage.getItem, 'shareHistory'),
  );

  if (shareHistory) {
    const updatedShareHistory = [...shareHistory];
    for (let index = 0; index < overallHealth.sharesInfo.length; index++) {
      if (
        overallHealth.sharesInfo[index] &&
        overallHealth.sharesInfo[index].updatedAt
      ) {
        if (overallHealth.sharesInfo[index].shareStage !== 'Ugly') {
          updatedShareHistory[index] = {
            ...updatedShareHistory[index],
            accessible: Date.now(),
          };
        } else {
          updatedShareHistory[index] = {
            ...updatedShareHistory[index],
            notAccessible: Date.now(),
          };
        }
      }
    }
    yield call(
      AsyncStorage.setItem,
      'shareHistory',
      JSON.stringify(updatedShareHistory),
    );
  }

  const securityQuestionHistory = JSON.parse(
    yield call(AsyncStorage.getItem, 'securityQuestionHistory'),
  ); //TODO: use multiGet on async storage

  if (securityQuestionHistory) {
    if (overallHealth.qaStatus.stage === 'Ugly') {
      const updatedSecurityQuestionHistory = {
        ...securityQuestionHistory,
        unconfirmed: Date.now(),
      };

      yield call(
        AsyncStorage.setItem,
        'securityQuestionHistory',
        JSON.stringify(updatedSecurityQuestionHistory),
      );
    }
  }
}

export const shareHistoryUpdateWatcher = createWatcher(
  shareHistoryUpdateWorker,
  UPDATE_SHARE_HISTORY,
);

function* overallHealthWorker({ payload }) {
  const service = payload.s3Service
    ? payload.s3Service
    : yield select((state) => state.sss.service);

  const { healthCheckStatus } = service.sss;
  let shareStatus = new Array(5);
  Object.keys(healthCheckStatus).map((key) => {
    shareStatus[key] = {
      shareId: healthCheckStatus[key].shareId,
      updatedAt: healthCheckStatus[key].updatedAt,
    };
  });

  const securityTimestamp = yield call(
    AsyncStorage.getItem,
    'SecurityAnsTimestamp',
  );

  let storedPDFHealth = JSON.parse(
    yield call(AsyncStorage.getItem, 'PDF Health'),
  );

  if (!storedPDFHealth) {
    storedPDFHealth = {
      3: { shareId: 'placeHolderID3', updatedAt: 0 },
      4: { shareId: 'placeHolderID4', updatedAt: 0 },
    };
  }
  shareStatus[3] = storedPDFHealth[3];
  shareStatus[4] = storedPDFHealth[4];
  console.log({ shareStatus });
  const healthStatus = new HealthStatus();
  const overallHealth = yield call(
    healthStatus.appHealthStatus,
    JSON.parse(securityTimestamp) ? JSON.parse(securityTimestamp) : 0,
    shareStatus,
  );

  console.log({ overallHealth });
  if (overallHealth) {
    // overallHealth.overallStatus = parseInt(overallHealth.overallStatus) * 20; // Conversion: stages to percentage
    overallHealth.overallStatus = parseInt(overallHealth.overallStatus); // Conversion: stages to percentage

    if (overallHealth.overallStatus === 100) {
      const secureAccount: SecureAccount = yield select(
        (state) => state.accounts[SECURE_ACCOUNT].service,
      );

      // remove sec-mne once health approaches 100 (disable PC share)
      if (secureAccount.secureHDWallet.secondaryMnemonic) {
        const { removed } = secureAccount.removeSecondaryMnemonic();
        if (removed) {
          const { SERVICES } = yield select((state) => state.storage.database);
          const updatedSERVICES = {
            ...SERVICES,
            SECURE_ACCOUNT: JSON.stringify(secureAccount),
          };

          yield call(insertDBWorker, {
            payload: { SERVICES: updatedSERVICES },
          });
          yield call(AsyncStorage.setItem, 'blockPCShare', 'true');
        }
      }
    }

    yield put(updateShareHistory(overallHealth));

    yield call(
      AsyncStorage.setItem,
      'overallHealth',
      JSON.stringify(overallHealth),
    );
    yield put(overallHealthCalculated(overallHealth));
  } else {
    throw new Error('Failed to calculate overall health');
  }
}

export const overallHealthWatcher = createWatcher(
  overallHealthWorker,
  OVERALL_HEALTH,
);

function* updateDynamicNonPMDDWorker({ payload }) {
  yield put(switchS3Loader('updateDynamicNonPMDD'));

  let dynamicNonPMDD = payload.dynamicNonPMDD;
  console.log({ dynamicNonPMDD });

  if (!dynamicNonPMDD) {
    const { DYNAMIC_NONPMDD } = yield select(
      (state) => state.storage.database.DECENTRALIZED_BACKUP,
    );

    if (!Object.keys(DYNAMIC_NONPMDD).length) return; // Nothing in DNP
    dynamicNonPMDD = DYNAMIC_NONPMDD;
  }

  const s3Service: S3Service = yield select((state) => state.sss.service);
  const res = yield call(s3Service.updateDynamicNonPMDD, dynamicNonPMDD);
  console.log({ res });
  if (res.status === 200) {
    const { updated } = res.data;
    if (!updated) {
      yield put(switchS3Loader('updateDynamicNonPMDD'));
      throw new Error('Failed to update dynamic nonPMDD');
    }
  } // yield success
  else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    yield put(switchS3Loader('updateDynamicNonPMDD'));
    throw new Error(res.err);
  } // yield failure
}

export const updateDynamicNonPMDDWatcher = createWatcher(
  updateDynamicNonPMDDWorker,
  UPDATE_DYNAMINC_NONPMDD,
);

function* downloadDynamicNonPMDDWorker({ payload }) {
  yield put(switchS3Loader('downloadDynamicNonPMDD'));
  const res = yield call(S3Service.downloadDynamicNonPMDD, payload.walletId);
  if (res.status === 200) {
    // TODO: add functionality as per the requirements
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error(res.err);
  }
  yield put(switchS3Loader('downloadDynamicNonPMDD'));
}

export const downloadDynamicNonPMDDWatcher = createWatcher(
  downloadDynamicNonPMDDWorker,
  DOWNLOAD_DYNAMIC_NONPMDD,
);

function* restoreDynamicNonPMDDWorker() {
  yield put(switchS3Loader('restoreDynamicNonPMDD'));

  const { DECENTRALIZED_BACKUP } = yield select(
    (state) => state.storage.database,
  );

  const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;
  const dynamicNonPMDDs: EncDynamicNonPMDD[] = Object.keys(RECOVERY_SHARES).map(
    (key) => {
      if (RECOVERY_SHARES.ENC_DYNAMIC_NONPMDD)
        return RECOVERY_SHARES[key].ENC_DYNAMIC_NONPMDD;
    },
  );

  if (!dynamicNonPMDDs.length) {
    console.log('DynamicNonPMDD not available');
    return;
  }
  const s3Service: S3Service = yield select((state) => state.sss.service);
  const res = yield call(s3Service.restoreDynamicNonPMDD, dynamicNonPMDDs);

  if (res.status === 200) {
    const metaShares: MetaShare[] = res.data.latestDynamicNonPMDD; // sync the DNP structure across redux-saga and nodeAlpha
    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      DYNAMIC_NONPMDD: {
        ...DECENTRALIZED_BACKUP.DYNAMIC_NONPMDD,
        META_SHARES: metaShares,
      },
    };
    yield call(insertDBWorker, {
      payload: { DECENTRALIZED_BACKUP: updatedBackup },
    });
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error(res.err);
  }
  yield put(switchS3Loader('restoreDynamicNonPMDD'));
}

export const restoreDynamicNonPMDDWatcher = createWatcher(
  restoreDynamicNonPMDDWorker,
  RESTORE_DYNAMIC_NONPMDD,
);

function* recoverMnemonicWorker({ payload }) {
  const { securityAns, metaShares } = payload;
  if (metaShares.length !== 3) return;

  const encryptedSecrets: string[] = metaShares.map(
    (metaShare) => metaShare.encryptedSecret,
  );

  const res = yield call(
    S3Service.recoverFromSecrets,
    encryptedSecrets,
    securityAns,
  );

  if (res.status === 200) {
    // TODO: recreate accounts and write to database
    yield put(mnemonicRecovered(res.data.mnemonic)); // storing in redux state (for demo)
  } else {
    console.log({ err: res.err });
  }
}

export const recoverMnemonicWatcher = createWatcher(
  recoverMnemonicWorker,
  RECOVER_MNEMONIC,
);

function* restoreShareFromQRWorker({ payload }) {
  const { qrArray } = payload;
  if (qrArray.length !== 8) {
    throw new Error('QR array is not of appropriate length');
  }
  const { DECENTRALIZED_BACKUP } = yield select(
    (state) => state.storage.database,
  );

  const res = yield call(S3Service.recoverMetaShareFromQR, qrArray);
  if (res.status == 200) {
    const { metaShare } = res.data;
    console.log({ metaShare });
    const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;
    const updatedRecoveryShares = {
      ...RECOVERY_SHARES,
      [metaShare.meta.index]: {
        META_SHARE: metaShare,
      },
    };

    // let storedPDFHealth = yield call(AsyncStorage.getItem, 'PDF Health');
    // if (storedPDFHealth) {
    //   storedPDFHealth = JSON.parse(storedPDFHealth);
    //   storedPDFHealth = {
    //     ...storedPDFHealth,
    //     [metaShare.meta.index]: {
    //       shareId: metaShare.shareId,
    //       updatedAt: Date.now(),
    //     },
    //   };

    //   yield call(
    //     AsyncStorage.setItem,
    //     'PDF Health',
    //     JSON.stringify(storedPDFHealth),
    //   );
    // }

    const updatedBackup = {
      ...DECENTRALIZED_BACKUP,
      RECOVERY_SHARES: updatedRecoveryShares,
    };
    console.log({ updatedBackup });
    yield call(insertDBWorker, {
      payload: { DECENTRALIZED_BACKUP: updatedBackup },
    });
  } else {
    yield put(UnableRecoverShareFromQR(true));
    //Alert.alert('Unable to recover share from QR', res.err);
    console.log({ err: res.err });
  }
}

export const restoreShareFromQRWatcher = createWatcher(
  restoreShareFromQRWorker,
  RESTORE_SHARE_FROM_QR,
);

function* recoverWalletWorker({ payload }) {
  yield put(switchS3Loader('restoreWallet'));

  try {
    const { WALLET_SETUP, DECENTRALIZED_BACKUP } = yield select(
      (state) => state.storage.database,
    );

    const { security } = WALLET_SETUP;
    const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;

    let encDynamicNonPMDD;
    const mappedMetaShares: { [walletId: string]: MetaShare[] } = {};
    Object.keys(RECOVERY_SHARES).forEach((key) => {
      const { META_SHARE, ENC_DYNAMIC_NONPMDD } = RECOVERY_SHARES[key];
      if (META_SHARE) {
        // metaShares[key] = META_SHARE; //mapping metaShares according to their shareIndex so that they can be aptly used at ManageBackup
        const shares = mappedMetaShares[META_SHARE.meta.walletId]
          ? mappedMetaShares[META_SHARE.meta.walletId]
          : [];
        let insert = true;
        shares.forEach((share) => {
          if (share.shareId === META_SHARE.shareId) insert = false;
        }, []);

        if (insert) {
          shares.push(META_SHARE);
          mappedMetaShares[META_SHARE.meta.walletId] = shares;
        }
      }
      // if (!encDynamicNonPMDD) { // retired due to wallet image
      //   encDynamicNonPMDD = ENC_DYNAMIC_NONPMDD;
      // } else {
      //   if (encDynamicNonPMDD.updatedAt < ENC_DYNAMIC_NONPMDD.updatedAt) {
      //     encDynamicNonPMDD = ENC_DYNAMIC_NONPMDD;
      //   }
      // }
    });

    console.log({ mappedMetaShares });
    let restorationShares: MetaShare[] = [];
    Object.keys(mappedMetaShares).forEach((walletId) => {
      if (mappedMetaShares[walletId].length >= 3)
        restorationShares = mappedMetaShares[walletId];
    });

    if (Object.keys(restorationShares).length !== 3) {
      Alert.alert('Insufficient compatible shares to recover the wallet');
      throw new Error(`Insufficient compatible shares to recover the wallet`);
    }

    const encryptedSecrets: string[] = restorationShares.map(
      (share) => share.encryptedSecret,
    );

    const res = yield call(
      S3Service.recoverFromSecrets,
      encryptedSecrets,
      security.answer,
    );

    if (res.status === 200) {
      const { mnemonic } = res.data;
      const {
        regularAcc,
        testAcc,
        secureAcc,
        s3Service,
        trustedContacts,
      } = yield call(
        serviceGenerator,
        security.answer,
        mnemonic,
        restorationShares,
      );

      const UNDER_CUSTODY = {};
      let DYNAMIC_NONPMDD = {};
      if (encDynamicNonPMDD) {
        // decentralized restoration of Wards
        const res = s3Service.decryptDynamicNonPMDD(encDynamicNonPMDD);

        if (res.status !== 200)
          console.log('Failed to decrypt dynamic nonPMDD');
        const dynamicNonPMDD = res.data.decryptedDynamicNonPMDD;
        dynamicNonPMDD.META_SHARES.forEach((metaShare) => {
          UNDER_CUSTODY[metaShare.meta.tag] = {
            META_SHARE: metaShare,
          };
        });
        DYNAMIC_NONPMDD = dynamicNonPMDD;
      }

      const DECENTRALIZED_BACKUP = {
        RECOVERY_SHARES: {},
        SHARES_TRANSFER_DETAILS: {},
        UNDER_CUSTODY,
        DYNAMIC_NONPMDD,
      };
      console.log({ DECENTRALIZED_BACKUP });

      const SERVICES = {
        REGULAR_ACCOUNT: JSON.stringify(regularAcc),
        TEST_ACCOUNT: JSON.stringify(testAcc),
        SECURE_ACCOUNT: JSON.stringify(secureAcc),
        S3_SERVICE: JSON.stringify(s3Service),
        TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
      };
      const payload = { SERVICES, DECENTRALIZED_BACKUP };
      yield call(insertDBWorker, { payload });
      yield delay(2000); // seconds delay prior to Wallet Image check
      yield put(fetchWalletImage());

      yield call(AsyncStorage.setItem, 'walletID', s3Service.sss.walletId);
      const current = Date.now();
      AsyncStorage.setItem('SecurityAnsTimestamp', JSON.stringify(current));
      const securityQuestionHistory = {
        confirmed: current,
      };
      AsyncStorage.setItem(
        'securityQuestionHistory',
        JSON.stringify(securityQuestionHistory),
      );

      // personal copy health restoration
      let updatedPDFHealth = {};
      for (const share of restorationShares) {
        if (share.meta.index > 2) {
          updatedPDFHealth = {
            ...updatedPDFHealth,
            [share.meta.index]: {
              shareId: `placeHolderID${share.meta.index}`,
              updatedAt: Date.now(),
            },
          };
        }
      }

      if (!updatedPDFHealth[3]) {
        updatedPDFHealth = {
          ...updatedPDFHealth,
          [3]: {
            shareId: 'placeHolderID3',
            updatedAt: 0,
          },
        };
      }
      if (!updatedPDFHealth[4]) {
        updatedPDFHealth = {
          ...updatedPDFHealth,
          [4]: {
            shareId: 'placeHolderID4',
            updatedAt: 0,
          },
        };
      }
      if (Object.keys(updatedPDFHealth).length)
        yield call(
          AsyncStorage.setItem,
          'PDF Health',
          JSON.stringify(updatedPDFHealth),
        );
    } else {
      throw new Error(res.err);
    }
  } catch (err) {
    console.log({ err: err.message });
    yield put(walletRecoveryFailed(true));
    // Alert.alert('Wallet recovery failed!', err.message);
  }

  yield put(switchS3Loader('restoreWallet'));
}

export const recoverWalletWatcher = createWatcher(
  recoverWalletWorker,
  RECOVER_WALLET,
);

const sha256 = crypto.createHash('sha256');
const hash = (element) => {
  return sha256.update(JSON.stringify(element)).digest('hex');
};

const asyncDataToBackup = async () => {
  // ASYNC DATA to backup
  // const FBTCAccount = select(
  //   (state) => state.fbtc.FBTCAccountData,
  // );
  const [
    [, TrustedContactsInfo],
    [, personalCopyDetails],
    [, FBTCAccount],
  ] = await AsyncStorage.multiGet([
    'TrustedContactsInfo',
    'personalCopyDetails',
    'FBTCAccount',
  ]);
  const ASYNC_DATA = {};
  if (TrustedContactsInfo)
    ASYNC_DATA['TrustedContactsInfo'] = TrustedContactsInfo;
  if (personalCopyDetails)
    ASYNC_DATA['personalCopyDetails'] = personalCopyDetails;
  if (FBTCAccount) ASYNC_DATA['FBTCAccount'] = FBTCAccount;

  return ASYNC_DATA;
};

function* updateWalletImageWorker({ payload }) {
  const s3Service: S3Service = yield select((state) => state.sss.service);

  let walletImage: WalletImage = {};
  const { DECENTRALIZED_BACKUP, SERVICES } = yield select(
    (state) => state.storage.database,
  );

  const walletImageHashes = yield call(AsyncStorage.getItem, 'WI_HASHES');
  let hashesWI = JSON.parse(walletImageHashes);

  if (walletImageHashes) {
    const currentDBHash = hash(DECENTRALIZED_BACKUP);
    console.log({
      previousDBHash: hashesWI.DECENTRALIZED_BACKUP,
      currentDBHash,
    });
    if (
      !hashesWI.DECENTRALIZED_BACKUP ||
      currentDBHash !== hashesWI.DECENTRALIZED_BACKUP
    ) {
      walletImage['DECENTRALIZED_BACKUP'] = DECENTRALIZED_BACKUP;
      hashesWI.DECENTRALIZED_BACKUP = currentDBHash;
    }

    const currentSHash = hash(SERVICES);
    console.log({
      previousSHash: hashesWI.SERVICES,
      currentSHash,
    });
    if (!hashesWI.SERVICES || currentSHash !== hashesWI.SERVICES) {
      walletImage['SERVICES'] = SERVICES;
      hashesWI.SERVICES = currentSHash;
    }

    const ASYNC_DATA = yield call(asyncDataToBackup);
    if (Object.keys(ASYNC_DATA).length) {
      const currentAsyncHash = hash(ASYNC_DATA);
      console.log({
        previousAsyncHash: hashesWI.ASYNC_DATA,
        currentAsyncHash,
      });
      if (!hashesWI.ASYNC_DATA || currentAsyncHash !== hashesWI.ASYNC_DATA) {
        walletImage['ASYNC_DATA'] = ASYNC_DATA;
        hashesWI.ASYNC_DATA = currentAsyncHash;
      }
    }
  } else {
    walletImage = {
      DECENTRALIZED_BACKUP,
      SERVICES,
    };

    hashesWI = {
      DECENTRALIZED_BACKUP: hash(DECENTRALIZED_BACKUP),
      SERVICES: hash(SERVICES),
    };

    const ASYNC_DATA = yield call(asyncDataToBackup);
    if (Object.keys(ASYNC_DATA).length) {
      walletImage['ASYNC_DATA'] = ASYNC_DATA;
      hashesWI['ASYNC_DATA'] = hash(ASYNC_DATA);
    }
  }

  console.log({ walletImage });

  if (Object.keys(walletImage).length === 0) {
    console.log('WI: nothing to update');
    return;
  }

  const res = yield call(s3Service.updateWalletImage, walletImage);
  if (res.status === 200) {
    if (res.data.updated) console.log('Wallet Image updated');
    yield call(AsyncStorage.setItem, 'WI_HASHES', JSON.stringify(hashesWI));
  } else {
    console.log({ err: res.err });
    throw new Error('Failed to update Wallet Image');
  }
}

export const updateWalletImageWatcher = createWatcher(
  updateWalletImageWorker,
  UPDATE_WALLET_IMAGE,
);

function* fetchWalletImageWorker({ payload }) {
  const s3Service: S3Service = yield select((state) => state.sss.service);

  const res = yield call(s3Service.fetchWalletImage);
  console.log({ res });
  if (res.status === 200) {
    const walletImage: WalletImage = res.data.walletImage;
    console.log({ walletImage });

    if (!Object.keys(walletImage).length)
      console.log('Failed fetch: Empty Wallet Image');

    // update DB and Async
    const { DECENTRALIZED_BACKUP, SERVICES, ASYNC_DATA } = walletImage;

    if (ASYNC_DATA) {
      for (const key of Object.keys(ASYNC_DATA)) {
        console.log('restoring to async: ', key);
        yield call(AsyncStorage.setItem, key, ASYNC_DATA[key]);

        if (key === 'TrustedContactsInfo' && ASYNC_DATA[key]) {
          const trustedContactsInfo = JSON.parse(ASYNC_DATA[key]);
          yield put(updateTrustedContactInfoLocally(trustedContactsInfo));
        }
      }
    }

    const payload = { SERVICES, DECENTRALIZED_BACKUP };
    yield call(insertDBWorker, { payload }); // synchronously update db

    // update hashes
    const hashesWI = {};
    Object.keys(walletImage).forEach((key) => {
      hashesWI[key] = hash(walletImage[key]);
    });
    yield call(AsyncStorage.setItem, 'WI_HASHES', JSON.stringify(hashesWI));
  } else {
    console.log({ err: res.err });
    console.log('Failed to fetch Wallet Image');
  }
  yield put(walletImageChecked(true));
}

export const fetchWalletImageWatcher = createWatcher(
  fetchWalletImageWorker,
  FETCH_WALLET_IMAGE,
);
