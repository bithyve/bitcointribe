import axios, { AxiosInstance, AxiosResponse } from 'axios';
import config from '../Config';
import { INotification } from './Interface';

const { RELAY, HEXA_ID, REQUEST_TIMEOUT } = config;
const BH_AXIOS: AxiosInstance = axios.create({
  baseURL: RELAY,
  timeout: REQUEST_TIMEOUT,
});

export default class Relay {
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

    const { releases } = res.data;
    console.log({ releases });
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
    notification: INotification,
  ): Promise<{
    delivered: Boolean;
  }> => {
    try {
      let res: AxiosResponse;
      try {
        res = await BH_AXIOS.post('sendNotification', {
          HEXA_ID,
          receiverWalletID, // walletId to which notification needs to be delivered
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
      throw new Error('Failed to deliver notifications');
    }
  };
}
