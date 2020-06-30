import TrustedContacts from '../utilities/TrustedContacts';
import config from '../HexaConfig';
import {
  Contacts,
  TrustedData,
  EphemeralData,
  TrustedDataElements,
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
    key?: string,
  ):
    | {
        encryptedPub: string;
        otp: string;
      }
    | {
        encryptedPub: string;
        otp?: undefined;
      } => TrustedContacts.encryptPub(publicKey, key);

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
        data: this.tc.initializeContact(contactName.toLowerCase().trim()),
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
    dataElements: EphemeralData,
    fetch?: Boolean,
  ): Promise<
    | {
        status: number;
        data:
          | {
              updated: any;
              publicKey: string;
              data: EphemeralData;
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
          fetch,
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
    approveTC?: Boolean,
    publicKey?: string,
  ): Promise<
    | {
        status: number;
        data: {
          data: EphemeralData;
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
  ): Promise<
    | {
        status: number;
        data: {
          data: TrustedData;
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
