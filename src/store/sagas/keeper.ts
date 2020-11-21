import KeeperService from '../../bitcoin/services/KeeperService';
import {
  FETCH_KEEPER_TRUSTED_CHANNEL,
  keeperLoading,
  DOWNLOAD_SM_SHARES,
} from '../actions/keeper';
import { call, delay, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utils/utilities';
import { insertDBWorker } from './storage';
import { TrustedDataElements } from '../../bitcoin/utilities/Interface';
import S3Service from '../../bitcoin/services/sss/S3Service';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import { SECURE_ACCOUNT } from '../../common/constants/serviceTypes';
import { DecentralizedBackup } from '../../common/interfaces/Interfaces';

function* fetchKeeperTrustedChannelWorker({ payload }) {
  try {
    yield put(keeperLoading('fetchKeeperTC'));
    let { shareId, walletName, type } = payload;
    const keeper: KeeperService = yield select((state) => state.keeper.service);
    const { DECENTRALIZED_BACKUP, SERVICES } = yield select(
      (state) => state.storage.database,
    );
    const res = yield call(keeper.fetchTrustedChannel, shareId, walletName);
    if (res.status == 200) {
      let data: TrustedDataElements = res.data.data;
      let { encryptedKey, otp } = data.shareTransferDetails;
      let { bh, secondary } = data.xPub.secureXpub;
      switch (type) {
        case 'secureXpub':
          let s3ServiceSecure: SecureAccount = yield select(
            (state) => state.accounts[SECURE_ACCOUNT].service,
          );
          let secureXpubs = s3ServiceSecure.getXpubsForAccount();
          if (secureXpubs.secondary == '' && secureXpubs.bh == '') {
            let response = s3ServiceSecure.setSecureXpubsAccount(secondary, bh);
          }
          let result;
          if (DECENTRALIZED_BACKUP && !DECENTRALIZED_BACKUP.PK_SHARE) {
            result = yield call(S3Service.downloadSMShare, encryptedKey, otp);
          }

          const updatedSERVICES = {
            ...SERVICES,
            [SECURE_ACCOUNT]: JSON.stringify(s3ServiceSecure),
          };
          let updatedDECENTRALIZED_BACKUP: DecentralizedBackup;
          if (result) {
            updatedDECENTRALIZED_BACKUP = {
              ...DECENTRALIZED_BACKUP,
              PK_SHARE: result.data.metaShare,
            };
          } else updatedDECENTRALIZED_BACKUP = DECENTRALIZED_BACKUP;
          yield call(insertDBWorker, {
            payload: {
              DECENTRALIZED_BACKUP: updatedDECENTRALIZED_BACKUP,
              SERVICES: updatedSERVICES,
            },
          });
          break;

        default:
          break;
      }
    }
    yield put(keeperLoading('fetchKeeperTC'));
  } catch (error) {
    yield put(keeperLoading('fetchKeeperTC'));
  }
}

export const fetchKeeperTrustedChannelWatcher = createWatcher(
  fetchKeeperTrustedChannelWorker,
  FETCH_KEEPER_TRUSTED_CHANNEL,
);

function* downloadSMShareWorker({ payload }) {
  const { encryptedKey, otp } = payload;

  if (!encryptedKey) return;
  const res = yield call(S3Service.downloadSMShare, encryptedKey, otp);

  if (res.status === 200) {
    console.log('SHARES DOWNLOAD', res.data);
    // TODO: recreate accounts and write to database
  } else {
    console.log({ err: res.err });
  }
}

export const downloadSMShareWatcher = createWatcher(
  downloadSMShareWorker,
  DOWNLOAD_SM_SHARES,
);