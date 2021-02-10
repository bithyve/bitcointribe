import {
  EncDynamicNonPMDD,
  EphemeralDataElements,
  MetaShare,
  ShareUploadables,
  TrustedData,
  TrustedDataElements,
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
      keepers,
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
    otp: string,
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
        data: this.keeper.initializeKeeper(shareId.trim(), encKey, otp),
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
    encryptedKey: string,
    otp: string,
    keeperUUID: string,
    keeperFeatureList: any[],
    isPrimary: Boolean,
    walletName?: string,
    EfChannelAddress?: string,
    trustedChannelAddress?: string,
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
          encryptedKey,
          otp,
          keeperUUID,
          keeperFeatureList,
          isPrimary,
          walletName,
          EfChannelAddress,
          trustedChannelAddress,
        ),
      };
    } catch (err) {
      console.log("err",err);
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to finalize keeper',
      };
    }
  };

  public initKeeperFromOldKeeper = (
    oldShareId: string,
    newShareId: string,
  ):
    | {
        status: number;
        data: boolean;
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
        data: this.keeper.initKeeperFromOldKeeper(oldShareId, newShareId)
          .status,
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
          shareId,
          dataElements,
          fetch,
          shareUploadables,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to update keeper',
      };
    }
  };

  public fetchTrustedChannel = async (
    shareId: string,
    walletName?: string,
  ): Promise<
    | {
        status: number;
        data: {
          data: TrustedDataElements;
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
        data: await this.keeper.fetchTrustedChannel(shareId.trim(), walletName),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch from contact',
      };
    }
  };

  public uploadSecondaryShare = async (
    encryptedKey: string,
    metaShare: MetaShare,
    otp?: string,
    encryptedDynamicNonPMDD?: EncDynamicNonPMDD,
  ): Promise<
    | {
        status: number;
        data: { success: boolean };
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
        data: await this.keeper.uploadSecondaryShare(
          encryptedKey,
          metaShare,
          otp,
          encryptedDynamicNonPMDD,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch from Keeper',
      };
    }
  };
}
