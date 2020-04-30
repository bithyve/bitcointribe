import TrustedContacts from '../utilities/TrustedContacts';
import config from '../Config';

export default class TrustedContactsService {
  public trustedContacts: TrustedContacts;
  constructor() {
    this.trustedContacts = new TrustedContacts();
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
        data: this.trustedContacts.initializeContact(contactName),
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
        data: this.trustedContacts.finalizeContact(
          contactName,
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
}
