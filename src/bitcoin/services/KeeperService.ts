import {
  EphemeralDataElementsForKeeper,
  ShareUploadables
} from '../utilities/Interface';
import config from '../HexaConfig';
import Keeper from '../utilities/Keeper';

export default class KeeperService {

  public keeper: Keeper;

  constructor() {
    this.keeper = new Keeper();
  }

  // public initializeKeeper = (
  //   uuid: string,
  //   privateKey: string,
  //   publicKey: string,
  //   encKey: string,
  //   ephemeralAddress: string
  // ):
  //   | {
  //     status: number;
  //     result: boolean;
  //     err?: undefined;
  //     message?: undefined;
  //   }
  //   | {
  //     status: number;
  //     err: any;
  //     message: string;
  //     result?: undefined;
  //   } => {
  //   try {

  //     // Use this to add data to service for later use. This data will come from QR.
  //     return {
  //       status: config.STATUS.SUCCESS,
  //       result: this.keeper.initializeKeeper(
  //         uuid,
  //         privateKey,
  //         publicKey,
  //         encKey,
  //         ephemeralAddress
  //       ),
  //     };
  //   } catch (err) {
  //     return {
  //       status: 0o1,
  //       err: err.message,
  //       message: 'Failed to setup keeper',
  //     };
  //   }
  // };

  public updateEphemeralChannel = async (
    shareId: string,
    shareType: string,
    publicKey: string,
    ephemeralAddress: string,
    dataElements: EphemeralDataElementsForKeeper,
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
        data: EphemeralDataElementsForKeeper;
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
}
