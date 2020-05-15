import {
  Contacts,
  EphemeralData,
  TrustedData,
  EncryptedTrustedData,
  TrustedDataElements,
} from './Interface';
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
  public static cipherSpec: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = config.CIPHER_SPEC;

  public static generateRandomString = (length: number): string => {
    let randomString: string = '';
    const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let itr = 0; itr < length; itr++) {
      randomString += possibleChars.charAt(
        Math.floor(Math.random() * possibleChars.length),
      );
    }
    return randomString;
  };

  public static generateOTP = (otpLength: number): string =>
    TrustedContacts.generateRandomString(otpLength);

  private static getDerivedKey = (psuedoKey: string): string => {
    const hashRounds = 1048;
    let key = psuedoKey;
    for (let itr = 0; itr < hashRounds; itr++) {
      const hash = crypto.createHash('sha512');
      key = hash.update(key).digest('hex');
    }
    return key.slice(key.length - TrustedContacts.cipherSpec.keyLength);
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
      } => {
    let usedOTP = false;
    if (!key) {
      key = TrustedContacts.generateOTP(parseInt(config.SSS_OTP_LENGTH, 10));
      usedOTP = true;
    }
    const encryptionKey = TrustedContacts.getDerivedKey(key);

    const cipher = crypto.createCipheriv(
      TrustedContacts.cipherSpec.algorithm,
      encryptionKey,
      TrustedContacts.cipherSpec.iv,
    );

    const prefix = 'hexa:';
    let encryptedPub = cipher.update(prefix + publicKey, 'utf8', 'hex');
    encryptedPub += cipher.final('hex');

    if (usedOTP) {
      return {
        encryptedPub,
        otp: key,
      };
    } else {
      return { encryptedPub };
    }
  };

  public static decryptPub = (
    encryptedPub: string,
    key: string,
  ): {
    decryptedPub: string;
  } => {
    const decryptionKey = TrustedContacts.getDerivedKey(key);

    const decipher = crypto.createDecipheriv(
      TrustedContacts.cipherSpec.algorithm,
      decryptionKey,
      TrustedContacts.cipherSpec.iv,
    );

    let decryptedPub = decipher.update(encryptedPub, 'hex', 'utf8');
    decryptedPub += decipher.final('utf8');

    if (decryptedPub.slice(0, 5) !== 'hexa:') {
      throw new Error('PubKey decryption failed: invalid key');
    }

    return { decryptedPub: decryptedPub.slice(5) };
  };

  public trustedContacts: Contacts = {};
  constructor(stateVars) {
    this.initializeStateVars(stateVars);
  }

  public encryptData = (key: string, dataPacket: any) => {
    const cipher = crypto.createCipheriv(
      TrustedContacts.cipherSpec.algorithm,
      key,
      TrustedContacts.cipherSpec.iv,
    );
    dataPacket.validator = config.HEXA_ID;
    let encrypted = cipher.update(JSON.stringify(dataPacket), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encryptedData: encrypted };
  };

  public decryptData = (key: string, encryptedDataPacket: string) => {
    const decipher = crypto.createDecipheriv(
      TrustedContacts.cipherSpec.algorithm,
      key,
      TrustedContacts.cipherSpec.iv,
    );
    let decrypted = decipher.update(encryptedDataPacket, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const data = JSON.parse(decrypted);
    if (data.validator !== config.HEXA_ID) {
      throw new Error(
        'Decryption failed, invalid validator for the following data packet',
      );
    }
    return { data };
  };

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
      publicKey,
      ephemeralChannel: { address: ephemeralAddress },
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

    if (
      this.trustedContacts[contactName].trustedChannel &&
      this.trustedContacts[contactName].trustedChannel.address
    ) {
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
      ephemeralChannel: {
        address: ephemeralAddress,
      },
      trustedChannel: {
        address: channelAddress,
      },
      contactsPubKey: encodedPublicKey,
    };
    console.log({ contactName: this.trustedContacts[contactName] });
    return {
      channelAddress,
      ephemeralAddress,
      publicKey: keyPair.getPublic('hex'),
    };
  };

  public processEphemeralChannelData = (
    contactName: string,
    data: EphemeralData,
  ) => {
    let ephemeralData = this.trustedContacts[contactName].ephemeralChannel.data;
    if (ephemeralData) {
      let updated = false;
      for (let index = 0; index < ephemeralData.length; index++) {
        if (ephemeralData[index].publicKey === data.publicKey) {
          ephemeralData[index] = {
            ...ephemeralData[index],
            ...data,
          };
          updated = true;
          break;
        }
      }

      if (!updated) {
        // 2nd party data reception for the first time
        ephemeralData.push(data);
      }
    } else {
      ephemeralData = [data];
    }

    this.trustedContacts[contactName].ephemeralChannel.data = ephemeralData;
  };

  public updateEphemeralChannel = async (
    contactName: string,
    dataElements: EphemeralData,
    fetch?: Boolean,
  ): Promise<
    | {
        updated: any;
        publicKey: string;
        data: EphemeralData;
      }
    | {
        updated: any;
        publicKey: string;
        data?: undefined;
      }
  > => {
    try {
      if (!this.trustedContacts[contactName]) {
        this.initializeContact(contactName);
      }

      const { ephemeralChannel, publicKey } = this.trustedContacts[contactName];
      dataElements.publicKey = publicKey;

      const res = await BH_AXIOS.post('updateEphemeralChannel', {
        HEXA_ID,
        address: ephemeralChannel.address,
        data: dataElements,
        fetch,
      });

      const { updated, data } = res.data;
      if (!updated) throw new Error('Failed to update ephemeral space');
      if (data) {
        this.processEphemeralChannelData(contactName, data);
        return { updated, publicKey, data };
      }

      return { updated, publicKey };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      throw new Error(err.message);
    }
  };

  public fetchEphemeralChannel = async (
    contactName: string,
    approveTC?: Boolean,
  ): Promise<{
    data: EphemeralData;
  }> => {
    try {
      if (!this.trustedContacts[contactName]) {
        throw new Error(
          `No trusted contact exist with contact name: ${contactName}`,
        );
      }

      const { ephemeralChannel, publicKey } = this.trustedContacts[contactName];

      const res = await BH_AXIOS.post('fetchEphemeralChannel', {
        HEXA_ID,
        address: ephemeralChannel.address,
        identifier: publicKey,
      });

      const { data } = res.data;
      if (data) {
        this.processEphemeralChannelData(contactName, data);
      }

      if (approveTC) {
        let contactsPublicKey;
        this.trustedContacts[contactName].ephemeralChannel.data.forEach(
          (element: EphemeralData) => {
            if (element.publicKey) {
              contactsPublicKey = element.publicKey;
            }
          },
        ); // only one element would contain the public key (uploaded by the counterparty)

        if (!contactsPublicKey) {
          throw new Error(
            `Approval failed, ${contactName}'s public key missing`,
          );
        }

        this.finalizeContact(contactName, contactsPublicKey);
      }

      return { data };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      throw new Error(err.message);
    }
  };

  public processTrustedChannelData = (
    contactName: string,
    encryptedData: EncryptedTrustedData,
    symmetricKey: string,
  ): TrustedData => {
    const decryptedTrustedData: TrustedData = {
      publicKey: encryptedData.publicKey,
      data: this.decryptData(symmetricKey, encryptedData.encryptedData).data,
    };

    let trustedData = this.trustedContacts[contactName].trustedChannel.data;
    if (trustedData) {
      let updated = false;
      for (let index = 0; index < trustedData.length; index++) {
        if (trustedData[index].publicKey === decryptedTrustedData.publicKey) {
          trustedData[index] = {
            ...trustedData[index],
            ...decryptedTrustedData,
          };
          updated = true;
          break;
        }
      }

      if (!updated) {
        // 2nd party data reception for the first time
        trustedData.push(decryptedTrustedData);
      }
    } else {
      trustedData = [decryptedTrustedData];
    }

    this.trustedContacts[contactName].trustedChannel.data = trustedData;

    return decryptedTrustedData;
  };

  public updateTrustedChannel = async (
    contactName: string,
    dataElements: TrustedDataElements,
    fetch?: Boolean,
  ): Promise<
    | {
        updated: any;
        data: TrustedData;
      }
    | {
        updated: any;
        data?: undefined;
      }
  > => {
    try {
      if (!this.trustedContacts[contactName]) {
        throw new Error(
          `No trusted contact exist with contact name: ${contactName}`,
        );
      }

      if (
        !this.trustedContacts[contactName].trustedChannel &&
        !this.trustedContacts[contactName].trustedChannel.address
      ) {
        throw new Error(
          `Trusted channel not formed with the following contact: ${contactName}`,
        );
      }

      const { trustedChannel, symmetricKey, publicKey } = this.trustedContacts[
        contactName
      ];

      const { encryptedData } = this.encryptData(symmetricKey, dataElements);
      const encryptedDataPacket: EncryptedTrustedData = {
        publicKey,
        encryptedData,
      };

      const res = await BH_AXIOS.post('updateTrustedChannel', {
        HEXA_ID,
        address: trustedChannel.address,
        data: encryptedDataPacket,
        fetch,
      });

      let { updated, data } = res.data;
      if (!updated) throw new Error('Failed to update ephemeral space');

      if (data) {
        data = this.processTrustedChannelData(contactName, data, symmetricKey);
        return { updated, data };
      }
      return { updated };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      throw new Error(err.message);
    }
  };

  public fetchTrustedChannel = async (
    contactName: string,
  ): Promise<{
    data: TrustedData;
  }> => {
    try {
      if (!this.trustedContacts[contactName]) {
        throw new Error(
          `No trusted contact exist with contact name: ${contactName}`,
        );
      }

      if (
        !this.trustedContacts[contactName].trustedChannel &&
        !this.trustedContacts[contactName].trustedChannel.address
      ) {
        throw new Error(
          `Trusted channel not formed with the following contact: ${contactName}`,
        );
      }

      const { trustedChannel, symmetricKey, publicKey } = this.trustedContacts[
        contactName
      ];

      const res = await BH_AXIOS.post('fetchTrustedChannel', {
        HEXA_ID,
        address: trustedChannel.address,
        identifier: publicKey,
      });

      let { data } = res.data;
      if (data) {
        data = this.processTrustedChannelData(contactName, data, symmetricKey);
      }

      return {
        data,
      };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      throw new Error(err.message);
    }
  };
}
