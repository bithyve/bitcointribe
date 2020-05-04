import { Contacts } from './Interface';
import { ec as EC } from 'elliptic';
var ec = new EC('curve25519');
import crypto from 'crypto';

export default class TrustedContacts {
  public trustedContacts: Contacts = {};
  constructor(stateVars) {
    this.initializeStateVars(stateVars);
  }

  public initializeStateVars = (stateVars) => {
    this.trustedContacts =
      stateVars && stateVars.trustedContacts ? stateVars.trustedContacts : {};
  };

  public decodePublicKey = (publicKey: string) => {
    const keyPair = ec.keyFromPublic(publicKey, 'hex');
    return keyPair.getPublic();
  };

  public initializeContact = (contactName: string): { publicKey: string } => {
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

    return { publicKey };
  };

  public finalizeContact = (
    contactName: string,
    encodedPublicKey: string,
  ): {
    channelAddress: string;
    ephemeralAddress: string;
    publicKey: string;
  } => {
    if (!this.trustedContacts[contactName]) {
      this.initializeContact(contactName); // case: trusted contact setup has been requested
    }

    if (this.trustedContacts[contactName].channelAddress) {
      throw new Error(
        'TC finalize failed: channel already exists with this contact',
      );
    }

    const { keyPair } = this.trustedContacts[contactName];
    const symmetricKey = keyPair.derive(this.decodePublicKey(encodedPublicKey)); // ECDH

    const channelAddress = crypto
      .createHash('sha256')
      .update(symmetricKey)
      .digest('hex');

    const ephemeralAddress = crypto
      .createHash('sha256')
      .update(encodedPublicKey)
      .digest('hex');

    this.trustedContacts[contactName] = {
      ...this.trustedContacts[contactName],
      symmetricKey,
      channelAddress,
      contactsPubKey: encodedPublicKey,
    };
    console.log({ contactName: this.trustedContacts[contactName] });
    return {
      channelAddress,
      ephemeralAddress,
      publicKey: keyPair.getPublic('hex'),
    };
  };
}
