import KeeperService from '../../bitcoin/services/KeeperService';
import { FETCH_KEEPER_TRUSTED_CHANNEL, keeperLoading, DOWNLOAD_SM_SHARES } from '../actions/keeper';
import { call, delay, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utils/utilities';
import { insertDBWorker } from './storage';
import { TrustedDataElements } from '../../bitcoin/utilities/Interface';
import S3Service from '../../bitcoin/services/sss/S3Service';

function* fetchKeeperTrustedChannelWorker({ payload }) {
  try {
    yield put(keeperLoading('fetchKeeperTC'));
    let { shareId, walletName, type } = payload;
    const keeper: KeeperService = yield select((state) => state.keeper.service);
    const res = yield call(keeper.fetchTrustedChannel, shareId, walletName);
    if (res.status == 200) {
      let data: TrustedDataElements = res.data.data;
      let {encryptedKey, otp} = data.shareTransferDetails;
      switch (type) {
        case 'pkShard':
          const result = yield call(S3Service.downloadSMShare, encryptedKey, otp);
          const { DECENTRALIZED_BACKUP } = yield select(
            (state) => state.storage.database,
          );
          const updatedDECENTRALIZED_BACKUP = {
            ...DECENTRALIZED_BACKUP,
            PK_SHARE: result.data.metaShare,
          };
          yield call(insertDBWorker, {
            payload: { DECENTRALIZED_BACKUP: updatedDECENTRALIZED_BACKUP },
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
  console.log('downloadShareWorker', payload);
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