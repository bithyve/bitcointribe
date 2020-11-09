import {
  EphemeralDataElements,
  ShareUploadables,
  TrustedData,
  TrustedDataElements
} from '../utilities/Interface';
import config from '../HexaConfig';
import Keeper from '../utilities/Keeper';

export default class KeeperService {
  public static fromJSON = (json: string) => {
    const { keeper } = JSON.parse(json);
    const {
      keepers,
    }: {
      keepers: Keeper;
    } = keeper;

    return new KeeperService({
      keeper,
    });
  };

  public keeper: Keeper;
  constructor(stateVars?) {
    this.keeper = new Keeper(stateVars);
  }

  public static encryptPub = (
    publicKey: string,
    key: string,
  ): { encryptedPub: string } => Keeper.encryptPub(publicKey, key);

  public static decryptPub = (
    encryptedPub: string,
    key: string,
  ): {
    decryptedPub: string;
  } => Keeper.decryptPub(encryptedPub, key);

  public initializeKeeper = (
    shareId: string,
    encKey: string,
  ):
    | {
        status: number;
        data: {
          publicKey: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.keeper.initializeKeeper(
          shareId.trim(),
          encKey,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to setup keeper',
      };
    }
  };

  public finalizeKeeper = (
    shareId: string,
    encodedPublicKey: string,
    encKey: string,
    walletName?: string,
    EfChannelAddress?: string,
  ):
    | {
        status: number;
        data: {
          channelAddress: string;
          ephemeralAddress: string;
          publicKey: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.keeper.finalizeKeeper(
          shareId.trim(),
          encodedPublicKey,
          encKey,
          walletName,
          EfChannelAddress,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to finalize keeper',
      };
    }
  };

  public updateEphemeralChannel = async (
    shareId: string,
    shareType: string,
    publicKey: string,
    ephemeralAddress: string,
    dataElements: EphemeralDataElements,
    encKey: string,
    shareUploadables: ShareUploadables,
    fetch?: Boolean,
    privateKey?: string,
  ): Promise<
    | {
      status: number;
      data:
      | {
        updated: any;
        publicKey: string;
        data: EphemeralDataElements;
      }
      | {
        updated: any;
        publicKey: string;
        data?: undefined;
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
      // Use this to create or update ephemeral data. You can see usage of the saga 'UPDATE_EPHEMERAL_CHANNEL' by dispatch of updateEphemeralChannel. (Search in project by 'dispatch(updateEphemeralChannel')
      return {
        status: config.STATUS.SUCCESS,
        data: await this.keeper.updateEphemeralChannel(
          shareId,
          shareType,
          publicKey,
          ephemeralAddress,
          dataElements,
          encKey,
          shareUploadables,
          fetch,
          privateKey,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to update ephemeral channel',
      };
    }
  };

  public updateTrustedChannel = async (
    shareId: string,
    dataElements: TrustedDataElements,
    fetch?: Boolean,
    shareUploadables?: ShareUploadables,
  ): Promise<
    | {
        status: number;
        data:
          | {
              updated: any;
              data: TrustedData;
            }
          | {
              updated: any;
              data?: undefined;
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
        data: await this.keeper.updateTrustedChannel(
          shareId.trim(),
          dataElements,
          fetch,
          shareUploadables,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to update contact',
      };
    }
  };
}
