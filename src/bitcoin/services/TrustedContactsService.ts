import TrustedContacts from '../utilities/TrustedContacts';
import config from '../Config';
import { Contacts } from '../utilities/Interface';

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
        data: this.tc.initializeContact(contactName.toLowerCase()),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to setup trusted contact',
      };
    }
  };

  public finalizeContact = (
    contactName: string,
    encodedPublicKey: string,
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
          contactName.toLowerCase(),
          encodedPublicKey,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to finalize trusted contact',
      };
    }
  };

  public updateEphemeralChannel = async (
    contactName: string,
    dataPacket: any,
    fetch?: Boolean,
  ): Promise<
    | {
        status: number;
        data: {
          updated: Boolean;
          data: any;
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
          contactName.toLowerCase(),
          dataPacket,
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
  ): Promise<
    | {
        status: number;
        data: {
          data: any;
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
        data: await this.tc.fetchEphemeralChannel(contactName.toLowerCase()),
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
    dataPacket: any,
    fetch?: Boolean,
  ): Promise<
    | {
        status: number;
        data: {
          updated: Boolean;
          data: any;
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
          contactName.toLowerCase(),
          dataPacket,
          fetch,
        ),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to update trusted channel',
      };
    }
  };

  public fetchTrustedChannel = async (
    contactName: string,
  ): Promise<
    | {
        status: number;
        data: {
          data: any;
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
        data: await this.tc.fetchTrustedChannel(contactName.toLowerCase()),
      };
    } catch (err) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch from trusted channel',
      };
    }
  };
}
