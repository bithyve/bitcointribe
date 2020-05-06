import { Contacts } from './Interface';
import crypto from 'crypto';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import config from '../Config';
import { ec as EC } from 'elliptic';
var ec = new EC('curve25519');

const { RELAY, HEXA_ID, REQUEST_TIMEOUT } = config;
const BH_AXIOS: AxiosInstance = axios.create({
  baseURL: RELAY,
  timeout: REQUEST_TIMEOUT,
});

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

  public initializeContact = (
    contactName: string,
  ): { publicKey: string; ephemeralAddress: string } => {
    if (this.trustedContacts[contactName]) {
      throw new Error(
        'TC Init failed: initialization already exists against the supplied',
      );
    }

    const keyPair = ec.genKeyPair();
    const publicKey = keyPair.getPublic('hex');
    const privateKey = keyPair.getPrivate('hex');

    const ephemeralAddress = crypto
      .createHash('sha256')
      .update(publicKey)
      .digest('hex');

    this.trustedContacts[contactName] = {
      privateKey,
      ephemeralAddress,
    };

    return { publicKey, ephemeralAddress };
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

    const { privateKey } = this.trustedContacts[contactName];
    const keyPair = ec.keyFromPrivate(privateKey, 'hex');
    const symmetricKey = keyPair
      .derive(this.decodePublicKey(encodedPublicKey))
      .toString(16); // ECDH

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
      ephemeralAddress,
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

  public updateEphemeralChannel = async (
    contactName: string,
    dataPacket: any,
  ): Promise<{
    updated: Boolean;
    data: any;
  }> => {
    try {
      if (!this.trustedContacts[contactName]) {
        throw new Error(
          `No trusted contact exist with contact name: ${contactName}`,
        );
      }

      const { ephemeralAddress } = this.trustedContacts[contactName];
      const encryptedDataPacket = dataPacket;

      const res = await BH_AXIOS.post('updateEphemeralChannel', {
        HEXA_ID,
        ephemeralAddress,
        data: encryptedDataPacket,
      });

      const { updated, data } = res.data;
      if (!updated) throw new Error('Failed to update ephemeral space');

      return { updated, data };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      throw new Error(err.message);
    }
  };

  public fetchEphemeralChannel = async (
    contactName: string,
  ): Promise<{
    data: any;
  }> => {
    try {
      if (!this.trustedContacts[contactName]) {
        throw new Error(
          `No trusted contact exist with contact name: ${contactName}`,
        );
      }

      const { ephemeralAddress } = this.trustedContacts[contactName];

      const res = await BH_AXIOS.post('fetchEphemeralChannel', {
        HEXA_ID,
        ephemeralAddress,
      });

      const { data } = res.data;
      return { data };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      throw new Error(err.message);
    }
  };

  public updateTrustedChannel = async (
    contactName: string,
    dataPacket: any,
  ): Promise<{
    updated: Boolean;
    data: any;
  }> => {
    try {
      if (!this.trustedContacts[contactName]) {
        throw new Error(
          `No trusted contact exist with contact name: ${contactName}`,
        );
      }

      if (!this.trustedContacts[contactName].channelAddress) {
        throw new Error(
          `Trusted channel not formed with the following contact: ${contactName}`,
        );
      }

      const { channelAddress } = this.trustedContacts[contactName];
      const encryptedDataPacket = dataPacket;

      const res = await BH_AXIOS.post('updateTrustedChannel', {
        HEXA_ID,
        channelAddress,
        data: encryptedDataPacket,
      });

      const { updated, data } = res.data;
      if (!updated) throw new Error('Failed to update ephemeral space');

      return { updated, data };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      throw new Error(err.message);
    }
  };

  public fetchTrustedChannel = async (
    contactName: string,
  ): Promise<{
    data: any;
  }> => {
    try {
      if (!this.trustedContacts[contactName]) {
        throw new Error(
          `No trusted contact exist with contact name: ${contactName}`,
        );
      }

      if (!this.trustedContacts[contactName].channelAddress) {
        throw new Error(
          `Trusted channel not formed with the following contact: ${contactName}`,
        );
      }

      const { channelAddress } = this.trustedContacts[contactName];

      const res = await BH_AXIOS.post('fetchTrustedChannel', {
        HEXA_ID,
        channelAddress,
      });

      const { data } = res.data;

      return { data };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      throw new Error(err.message);
    }
  };
}
