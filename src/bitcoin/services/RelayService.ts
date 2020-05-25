import Relay from '../utilities/Relay';
import config from '../HexaConfig';
import { INotification } from '../utilities/Interface';

export default class RelayServices {
  public static fetchReleases = async (
    build: string,
  ): Promise<
    | {
        status: number;
        data: {
          releases: any[];
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await Relay.fetchReleases(build),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch release notes',
      };
    }
  };

  public static updateFCMTokens = async (
    walletID: string,
    FCMs: string[],
  ): Promise<
    | {
        status: number;
        data: {
          updated: Boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await Relay.updateFCMTokens(walletID, FCMs),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to update the FCMs on the server',
      };
    }
  };

  public static fetchNotifications = async (
    walletID: string,
  ): Promise<
    | {
        status: number;
        data: { notifications: INotification[] };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await Relay.fetchNotifications(walletID),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch notifications',
      };
    }
  };

  public static sendNotification = async (
    receiverWalletID: string,
    notification: INotification,
  ): Promise<
    | {
        status: number;
        data: {
          delivered: Boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await Relay.sendNotification(receiverWalletID, notification),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to deliver notifications',
      };
    }
  };
}
