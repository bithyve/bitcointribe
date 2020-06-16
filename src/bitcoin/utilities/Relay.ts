import { AxiosResponse } from 'axios';
import config from '../HexaConfig';
import { INotification, EncryptedImage } from './Interface';
import { BH_AXIOS } from '../../services/api';
import idx from 'idx';

const { HEXA_ID } = config;
export default class Relay {
  public static checkCompatibility = async (
    method: string,
    version: string,
  ): Promise<{
    compatible: boolean;
    alternatives: {
      upgrade: boolean;
      message: string;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post('checkCompatibility', {
        HEXA_ID,
        method,
        version,
      });
    } catch (err) {
      if (err.response) console.log(err.response.data.err);
      if (err.code) console.log(err.code);
    }
    const { compatible, alternatives } = res.data;
    return { compatible, alternatives };
  };

  public static fetchReleases = async (
    build: string,
  ): Promise<{
    releases: any[];
  }> => {
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post('fetchReleases', {
        HEXA_ID,
        build,
      });
    } catch (err) {
      if (err.response) console.log(err.response.data.err);
      if (err.code) console.log(err.code);
    }
    const { releases = [] } = idx(res, (_) => _.data) || {};
    return { releases };
  };

  public static updateFCMTokens = async (
    walletID: string,
    FCMs: string[],
  ): Promise<{
    updated: Boolean;
  }> => {
    try {
      let res: AxiosResponse;
      try {
        res = await BH_AXIOS.post('updateFCMTokens', {
          HEXA_ID,
          walletID,
          FCMs,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { updated } = res.data;
      return { updated };
    } catch (err) {
      throw new Error('Failed to fetch GetBittr Details');
    }
  };

  public static fetchNotifications = async (
    walletID: string,
  ): Promise<{
    notifications: INotification[];
  }> => {
    let res: AxiosResponse;

    try {
      res = await BH_AXIOS.post('fetchNotifications', {
        HEXA_ID,
        walletID,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { notifications } = res.data;
    return { notifications };
  };

  public static sendNotification = async (
    receiverWalletID: string,
    receiverFCMs: string[],
    notification: INotification,
  ): Promise<{
    delivered: Boolean;
  }> => {
    try {
      let res: AxiosResponse;

      if (!receiverFCMs.length)
        throw new Error('Failed to deliver notification: FCM missing');

      try {
        res = await BH_AXIOS.post('sendNotification', {
          HEXA_ID,
          receiverWalletID, // walletId to which notification needs to be delivered
          receiverFCMs,
          notification,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { delivered } = res.data;
      if (!delivered) throw new Error();

      return { delivered };
    } catch (err) {
      throw new Error('Failed to deliver notification');
    }
  };
}
