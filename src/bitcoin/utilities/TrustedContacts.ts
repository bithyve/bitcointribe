import { Contacts } from './Interface';
import { ec as EC } from 'elliptic';
var ec = new EC('curve25519');
import crypto from 'crypto';

export default class TrustedContacts {
  public trustedContacts: Contacts = {};
  constructor() {}

  public decodePublicKey = (publicKey: string) => {
    const keyPair = ec.keyFromPublic(publicKey, 'hex');
    return keyPair.getPublic();
  };

  public initializeContact = (contactName: string) => {
    if (this.trustedContacts[contactName]) {
      throw new Error(
        'TC Init failed: initialization already exists against the supplied',
      );
    }

    const keyPair = ec.genKeyPair();
    const publicKey = keyPair.getPublic('hex');
    this.trustedContacts[contactName] = {
      keyPair,
    };

    return publicKey;
  };

  public finalizeContact = (contactName: string, encodedPublicKey: string) => {
    if (this.trustedContacts[contactName]) {
      if (this.trustedContacts[contactName].channelAddress) {
        throw new Error(
          'TC finalize failed: channel already exists with this contact',
        );
      }
      const { keyPair } = this.trustedContacts[contactName];
      const contactsPublicKey = this.decodePublicKey(encodedPublicKey);
      const symmetricKey = keyPair.derive(contactsPublicKey);
      const channelAddress = crypto
        .createHash('sha256')
        .update(symmetricKey)
        .digest('hex');

      this.trustedContacts[contactName] = {
        ...this.trustedContacts[contactName],
        symmetricKey,
        channelAddress,
      };
      console.log({ contactName: this.trustedContacts[contactName] });
    } else {
    }
  };
}
