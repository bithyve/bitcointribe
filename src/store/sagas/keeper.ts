import KeeperService from "../../bitcoin/services/KeeperService";
import {
  FETCH_KEEPER_TRUSTED_CHANNEL,
  isUpdateNewFcm,
  keeperLoading,
  UPDATE_NEW_FCM,
} from "../actions/keeper";
import { call, delay, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/utilities";
import { insertDBWorker } from "./storage";
import {
  INotification,
  Keepers,
  LevelHealthInterface,
  notificationTag,
  notificationType,
  TrustedDataElements,
} from "../../bitcoin/utilities/Interface";
import S3Service from "../../bitcoin/services/sss/S3Service";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import { SECURE_ACCOUNT } from "../../common/constants/serviceTypes";
import { DecentralizedBackup } from "../../common/interfaces/Interfaces";
import RelayServices from "../../bitcoin/services/RelayService";

function* fetchKeeperTrustedChannelWorker({ payload }) {
  try {
    yield put(keeperLoading("fetchKeeperTC"));
    let { shareId, walletName, type } = payload;
    const keeper: KeeperService = yield select((state) => state.keeper.service);
    const { DECENTRALIZED_BACKUP, SERVICES } = yield select(
      (state) => state.storage.database
    );
    const res = yield call(keeper.fetchTrustedChannel, shareId, walletName);
    if (res.status == 200) {
      let data: TrustedDataElements = res.data.data;
      let { encryptedKey, otp } = data.shareTransferDetails;
      let { bh, secondary } = data.xPub.secureXpub;
      switch (type) {
        case "secureXpub":
          let s3ServiceSecure: SecureAccount = yield select(
            (state) => state.accounts[SECURE_ACCOUNT].service
          );
          let secureXpubs = s3ServiceSecure.getXpubsForAccount();
          if (secureXpubs.secondary == "" && secureXpubs.bh == "") {
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
    yield put(keeperLoading("fetchKeeperTC"));
  } catch (error) {
    yield put(keeperLoading("fetchKeeperTC"));
  }
}

export const fetchKeeperTrustedChannelWatcher = createWatcher(
  fetchKeeperTrustedChannelWorker,
  FETCH_KEEPER_TRUSTED_CHANNEL
);

function* updateNewFCMWorker() {
  try {
    const keeper: KeeperService = yield select((state) => state.keeper.service);
    const levelHealth: LevelHealthInterface[] = yield select(
      (state) => state.health.levelHealth
    );
    const currentLevel: Number = yield select(
      (state) => state.health.currentLevel
    );
    const keeperInfo2: {
      shareId: string;
      name: string;
      uuid: string;
      publicKey: string;
      ephemeralAddress: string;
      type: string;
      data?: any;
    }[] = yield select(
      (state) => state.health.keeperInfo
    );
    const fcmTokenValue = yield select(
      (state) => state.preferences.fcmTokenValue
    );
    if (currentLevel == 2 && levelHealth[1]) {
      if(keeperInfo2.findIndex(value => value.shareId == levelHealth[1].levelInfo[2].shareId) > -1){
        let uuid2 = keeperInfo2[keeperInfo2.findIndex(value => value.shareId == levelHealth[1].levelInfo[2].shareId)].uuid;
        if(uuid2){
          const notification: INotification = {
            notificationType: notificationType.newFCM,
            title: "New FCM updated",
            body: "New FCM updated",
            data: JSON.stringify({ fmc: fcmTokenValue }),
            tag: notificationTag.IMP,
            date: new Date(),
          };
          let res = yield call(
            RelayServices.sendKeeperNotifications,
            [uuid2],
            notification
          );
          if(res.status == 200 && res.data.sent){
            yield put(isUpdateNewFcm(true));
          }
        }
      }
    }
  } catch (error) {}
}

export const updateNewFCMWatcher = createWatcher(
  updateNewFCMWorker,
  UPDATE_NEW_FCM
);