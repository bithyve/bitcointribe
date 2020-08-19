import TrustedContacts from '../utilities/TrustedContacts';
import config from '../HexaConfig';
import {
  Contacts,
  TrustedData,
  EphemeralDataElements,
  TrustedDataElements,
  trustedChannelActions,
  ShareUploadables,
} from '../utilities/Interface';

export default class TrustedContactsService {
  public static fromJSON = (json: string) => {
    const { tc } = JSON.parse(json);
    const {
      trustedContacts,
    }: {
      trustedContacts: Contacts;
    } = tc;

    return new TrustedContactsService({ trustedContacts });
  };

  public static encryptPub = (
    publicKey: string,
    key: string,
  ): { encryptedPub: string } => TrustedContacts.encryptPub(publicKey, key);

  public static decryptPub = (
    encryptedPub: string,
    key: string,
  ): {
    decryptedPub: string;
  } => TrustedContacts.decryptPub(encryptedPub, key);

  public tc: TrustedContacts;
  constructor(stateVars?) {
    this.tc = new TrustedContacts(stateVars);
  }

  public initializeContact = (
    contactName: string,
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
        data: this.tc.initializeContact(
          contactName.toLowerCase().trim(),
          encKey,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to setup contact',
      };
    }
  };

  public finalizeContact = (
    contactName: string,
    encodedPublicKey: string,
    encKey: string,
    contactsWalletName?: string,
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
        data: this.tc.finalizeContact(
          contactName.toLowerCase().trim(),
          encodedPublicKey,
          encKey,
          contactsWalletName,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to finalize contact',
      };
    }
  };

  public updateEphemeralChannel = async (
    contactName: string,
    dataElements: EphemeralDataElements,
    encKey: string,
    fetch?: Boolean,
    shareUploadables?: ShareUploadables,
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
      return {
        status: config.STATUS.SUCCESS,
        data: await this.tc.updateEphemeralChannel(
          contactName.toLowerCase().trim(),
          dataElements,
          encKey,
          fetch,
          shareUploadables,
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

  public fetchEphemeralChannel = async (
    contactName: string,
    encKey: string,
    approveTC?: Boolean,
    publicKey?: string,
  ): Promise<
    | {
        status: number;
        data: {
          data: EphemeralDataElements;
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
        data: await this.tc.fetchEphemeralChannel(
          contactName ? contactName.toLowerCase().trim() : contactName,
          encKey,
          approveTC,
          publicKey,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch from ephemeral channel',
      };
    }
  };

  public updateTrustedChannel = async (
    contactName: string,
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
        data: await this.tc.updateTrustedChannel(
          contactName.toLowerCase().trim(),
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

  public fetchTrustedChannel = async (
    contactName: string,
    contactsWalletName?: string,
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
        data: await this.tc.fetchTrustedChannel(
          contactName.toLowerCase().trim(),
          contactsWalletName,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch from contact',
      };
    }
  };
}
