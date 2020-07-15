import {
  Contacts,
  EphemeralDataElements,
  TrustedData,
  EncryptedTrustedData,
  TrustedDataElements,
  EphemeralData,
  EncryptedEphemeralData,
} from './Interface';
import crypto from 'crypto';
import config from '../HexaConfig';
import { ec as EC } from 'elliptic';
import { BH_AXIOS } from '../../services/api';
import { AxiosResponse } from 'axios';
var ec = new EC('curve25519');

const { HEXA_ID } = config;

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
    key = key.slice(key.length - TrustedContacts.cipherSpec.keyLength);
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
    key = key.slice(key.length - TrustedContacts.cipherSpec.keyLength);
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
    contactsWalletName?: string,
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

    const { ephemeralChannel, privateKey } = this.trustedContacts[contactName];
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
        ...ephemeralChannel,
        address: ephemeralAddress,
      },
      trustedChannel: {
        address: channelAddress,
      },
      contactsPubKey: encodedPublicKey,
      contactsWalletName, // would help with contact name to wallet name mapping to aid recovery share provisioning
      isWard: contactsWalletName ? true : false,
    };
    return {
      channelAddress,
      ephemeralAddress,
      publicKey: keyPair.getPublic('hex'),
    };
  };

  public updateEphemeralChannelData = (
    contactName: string,
    data: EphemeralDataElements,
  ): { updatedEphemeralDataElements: EphemeralDataElements } => {
    let ephemeralData = this.trustedContacts[contactName].ephemeralChannel.data;
    let updatedEphemeralDataElements: EphemeralDataElements;
    if (ephemeralData) {
      let updated = false;
      for (let index = 0; index < ephemeralData.length; index++) {
        if (ephemeralData[index].publicKey === data.publicKey) {
          ephemeralData[index] = {
            ...ephemeralData[index],
            ...data,
          };
          updatedEphemeralDataElements = ephemeralData[index];
          updated = true;
          break;
        }
      }

      if (!updated) {
        // counterparty's data reception for the first time
        ephemeralData.push(data);
        updatedEphemeralDataElements = data;
        // update counterparty's walletId and FCM
        data.walletID
          ? (this.trustedContacts[contactName].walletID = data.walletID)
          : null;

        if (data.FCM)
          this.trustedContacts[contactName].FCMs
            ? this.trustedContacts[contactName].FCMs.push(data.FCM)
            : (this.trustedContacts[contactName].FCMs = [data.FCM]);
      }
    } else {
      ephemeralData = [data];
      updatedEphemeralDataElements = data;
    }

    this.trustedContacts[contactName].ephemeralChannel.data = ephemeralData;
    return { updatedEphemeralDataElements };
  };

  public processEphemeralChannelData = (
    contactName: string,
    encryptedData: EncryptedEphemeralData,
    key: string,
  ): EphemeralData => {
    const data: TrustedDataElements = this.decryptData(
      key,
      encryptedData.encryptedData,
    ).data;

    const decryptedEphemeralData: EphemeralData = {
      publicKey: encryptedData.publicKey,
      data,
    };
    this.updateEphemeralChannelData(contactName, decryptedEphemeralData.data);
    return decryptedEphemeralData;
  };

  public updateEphemeralChannel = async (
    contactName: string,
    dataElements: EphemeralDataElements,
    encKey: string,
    fetch?: Boolean,
  ): Promise<
    | {
        updated: any;
        publicKey: string;
        data: EphemeralDataElements;
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

      if (dataElements.shareTransferDetails) {
        this.trustedContacts[contactName].isGuardian = true;
      }

      if (dataElements.DHInfo) {
        dataElements.DHInfo.address = ephemeralChannel.address;
      }

      const { updatedEphemeralDataElements } = this.updateEphemeralChannelData(
        contactName,
        dataElements,
      );
      const ephemeralData: EphemeralData = {
        publicKey,
        data: updatedEphemeralDataElements,
      };

      const { encryptedData } = this.encryptData(encKey, ephemeralData.data);

      const encryptedDataPacket: EncryptedEphemeralData = {
        publicKey,
        encryptedData,
      };

      const res = await BH_AXIOS.post('updateEphemeralChannel', {
        HEXA_ID,
        address: ephemeralChannel.address,
        data: encryptedDataPacket,
        fetch,
      });

      let { updated, initiatedAt, data } = res.data;
      console.log({ updated, initiatedAt, data });
      if (!updated) throw new Error('Failed to update ephemeral space');
      if (initiatedAt)
        this.trustedContacts[
          contactName
        ].ephemeralChannel.initiatedAt = initiatedAt;

      if (data && Object.keys(data).length) {
        data = this.processEphemeralChannelData(contactName, data, encKey);
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
    encKey: string,
    approveTC?: Boolean,
    publicKey?: string,
  ): Promise<{
    data: EphemeralDataElements;
  }> => {
    try {
      let res: AxiosResponse;
      if (!publicKey) {
        if (!this.trustedContacts[contactName]) {
          throw new Error(`No contact exist with contact name: ${contactName}`);
        }

        const { ephemeralChannel } = this.trustedContacts[contactName];

        res = await BH_AXIOS.post('fetchEphemeralChannel', {
          HEXA_ID,
          address: ephemeralChannel.address,
          identifier: this.trustedContacts[contactName].publicKey,
        });
      } else {
        // if publicKey; fetch data without any storage
        const address = crypto
          .createHash('sha256')
          .update(publicKey)
          .digest('hex');
        res = await BH_AXIOS.post('fetchEphemeralChannel', {
          HEXA_ID,
          address,
          identifier: `!${publicKey}`, // anti-counterparty's pub
        });
      }
      let { data } = res.data;

      if (!publicKey && data && Object.keys(data).length) {
        data = this.processEphemeralChannelData(contactName, data, encKey);
      }

      if (!publicKey && approveTC) {
        let contactsPublicKey;
        this.trustedContacts[contactName].ephemeralChannel.data.forEach(
          (element: EphemeralDataElements) => {
            if (
              element.publicKey !== this.trustedContacts[contactName].publicKey
            ) {
              contactsPublicKey = element.publicKey;
            }
          },
        ); // only one element would contain the public key (uploaded by the counterparty)

        if (!contactsPublicKey) {
          console.log(`Approval failed, ${contactName}'s public key missing`);
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

  public updateTrustedChannelData = (
    contactName: string,
    newTrustedData: TrustedData,
  ): { updatedTrustedData; overallTrustedData: TrustedData[] } => {
    let trustedData: TrustedData[] = this.trustedContacts[contactName]
      .trustedChannel.data
      ? [...this.trustedContacts[contactName].trustedChannel.data]
      : [];
    let updatedTrustedData: TrustedData = newTrustedData;
    if (trustedData.length) {
      let updated = false;
      for (let index = 0; index < trustedData.length; index++) {
        if (trustedData[index].publicKey === newTrustedData.publicKey) {
          trustedData[index].data = {
            ...trustedData[index].data,
            ...newTrustedData.data,
          };
          updated = true;
          updatedTrustedData = trustedData[index];
          break;
        }
      }

      if (!updated) {
        // counterparty's data reception for the first time
        trustedData.push(newTrustedData);
        console.log({ newTrustedData });
        // update counterparty's walletId and FCM

        newTrustedData.data.walletID
          ? (this.trustedContacts[contactName].walletID =
              newTrustedData.data.walletID)
          : null;

        if (newTrustedData.data.FCM)
          this.trustedContacts[contactName].FCMs
            ? this.trustedContacts[contactName].FCMs.push(
                newTrustedData.data.FCM,
              )
            : (this.trustedContacts[contactName].FCMs = [
                newTrustedData.data.FCM,
              ]);
      }
    } else {
      trustedData = [newTrustedData];
    }

    // this.trustedContacts[contactName].trustedChannel.data = trustedData; save post updation
    return { updatedTrustedData, overallTrustedData: trustedData };
  };

  public processTrustedChannelData = (
    contactName: string,
    encryptedData: EncryptedTrustedData,
    symmetricKey: string,
  ): TrustedData => {
    const data: TrustedDataElements = this.decryptData(
      symmetricKey,
      encryptedData.encryptedData,
    ).data;

    const decryptedTrustedData: TrustedData = {
      publicKey: encryptedData.publicKey,
      data,
    };
    const { overallTrustedData } = this.updateTrustedChannelData(
      contactName,
      decryptedTrustedData,
    );
    this.trustedContacts[contactName].trustedChannel.data = overallTrustedData;
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
        throw new Error(`No contact exist with contact name: ${contactName}`);
      }

      if (
        !this.trustedContacts[contactName].trustedChannel &&
        !this.trustedContacts[contactName].trustedChannel.address
      ) {
        throw new Error(
          `Secure channel not formed with the following contact: ${contactName}`,
        );
      }

      const { trustedChannel, symmetricKey, publicKey } = this.trustedContacts[
        contactName
      ];

      const trustedData: TrustedData = {
        publicKey,
        data: dataElements,
      };

      const {
        updatedTrustedData,
        overallTrustedData,
      } = this.updateTrustedChannelData(contactName, trustedData);

      const { encryptedData } = this.encryptData(
        symmetricKey,
        updatedTrustedData.data,
      );

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
      this.trustedContacts[
        contactName
      ].trustedChannel.data = overallTrustedData; // save post updation

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
        throw new Error(`No contact exist with contact name: ${contactName}`);
      }

      if (
        !this.trustedContacts[contactName].trustedChannel &&
        !this.trustedContacts[contactName].trustedChannel.address
      ) {
        throw new Error(
          `Secure channel not formed with the following contact: ${contactName}`,
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
      console.log({ res });

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
