import {
  PrimaryUser,
  EphemeralDataElements,
  TrustedDataElements,
  EphemeralData,
  EncryptedEphemeralData,
  ShareUploadables,
} from './Interface';
import crypto from 'crypto';
import config from '../HexaConfig';
import { ec as EC } from 'elliptic';
import { BH_AXIOS } from '../../services/api';
import { AxiosResponse } from 'axios';
var ec = new EC('curve25519');

const { HEXA_ID } = config;

export default class Keeper {

  public user: PrimaryUser;

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
    Keeper.generateRandomString(otpLength);

  public encryptData = (key: string, dataPacket: any) => {
    key = key.slice(key.length - Keeper.cipherSpec.keyLength);
    const cipher = crypto.createCipheriv(
      Keeper.cipherSpec.algorithm,
      key,
      Keeper.cipherSpec.iv,
    );
    dataPacket.validator = config.HEXA_ID;
    let encrypted = cipher.update(JSON.stringify(dataPacket), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encryptedData: encrypted };
  };

  public decryptData = (key: string, encryptedDataPacket: string) => {
    key = key.slice(key.length - Keeper.cipherSpec.keyLength);
    const decipher = crypto.createDecipheriv(
      Keeper.cipherSpec.algorithm,
      key,
      Keeper.cipherSpec.iv,
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

  public initializeKeeper = (
    uuid: string,
    privateKey: string,
    publicKey: string,
    encKey: string,
    ephemeralAddress: string
  ): boolean => {

    // const keyPair = ec.genKeyPair();
    // const publicKey = keyPair.getPublic('hex');
    // const privateKey = keyPair.getPrivate('hex');

    // const ephemeralAddress = crypto
    //   .createHash('sha256')
    //   .update(publicKey)
    //   .digest('hex');

    this.user = {
      uuid: uuid,
      privateKey,
      publicKey,
      encKey,
      ephemeralChannel: { address: ephemeralAddress },
    };

    return true;
  };

  public updateEphemeralChannelData = (
    data: EphemeralDataElements,
  ): { updatedEphemeralDataElements: EphemeralDataElements } => {
    let ephemeralData = this.user.ephemeralChannel.data;
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
          ? (this.user.walletID = data.walletID)
          : null;

        if (data.FCM)
          this.user.FCMs
            ? this.user.FCMs.push(data.FCM)
            : (this.user.FCMs = [data.FCM]);

        this.user.trustedAddress = data.trustedAddress;
        this.user.trustedTestAddress =
          data.trustedTestAddress;
      }
    } else {
      ephemeralData = [data];
      updatedEphemeralDataElements = data;
    }

    this.user.ephemeralChannel.data = ephemeralData;
    return { updatedEphemeralDataElements };
  };

  public updateEphemeralChannel = async (
    dataElements: EphemeralDataElements,
    encKey: string,
    fetch?: Boolean,
    shareUploadables?: ShareUploadables,
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

      const { publicKey, ephemeralChannel } = this.user;
      dataElements.publicKey = publicKey;

      if (dataElements.DHInfo)
        dataElements.DHInfo.address = ephemeralChannel.address;

      const { updatedEphemeralDataElements } = this.updateEphemeralChannelData(dataElements);

      let res: AxiosResponse;
      if (!encKey) {
        // supporting versions prior to 1.1.0
        res = await BH_AXIOS.post('updateEphemeralChannel', {
          HEXA_ID,
          address: ephemeralChannel.address,
          data: dataElements,
          fetch,
          legacy: true,
        });
      } else {
        //Ignore this as its added to support older versions of app.
        let encryptedDataPacket: EncryptedEphemeralData;
        if (dataElements.DHInfo) {
          encryptedDataPacket = {
            publicKey,
            encryptedData: null,
            DHInfo: dataElements.DHInfo,
          };
        } else {
          const ephemeralData: EphemeralData = {
            publicKey,
            data: updatedEphemeralDataElements,
          };

          const { encryptedData } = this.encryptData(
            encKey,
            ephemeralData.data,
          );

          encryptedDataPacket = {
            publicKey,
            encryptedData,
            walletID: updatedEphemeralDataElements.walletID,
          };
        }

        if (shareUploadables && Object.keys(shareUploadables).length) {
          res = await BH_AXIOS.post('updateShareAndEC', {
            // EC update params
            HEXA_ID,
            address: ephemeralChannel.address,
            data: encryptedDataPacket,
            fetch,
            // upload share params
            share: shareUploadables.encryptedMetaShare,
            messageId: shareUploadables.messageId,
            encryptedDynamicNonPMDD: shareUploadables.encryptedDynamicNonPMDD,
          });
        } else {
          res = await BH_AXIOS.post('updateEphemeralChannel', {
            HEXA_ID,
            address: ephemeralChannel.address,
            data: encryptedDataPacket,
            fetch,
          });
        }
      }

      let { updated, initiatedAt, data } = res.data;
      console.log({ updated, initiatedAt, data });
      if (!updated) throw new Error('Failed to update ephemeral space');
      if (initiatedAt)
        this.user.ephemeralChannel.initiatedAt = initiatedAt;

      if (data && Object.keys(data).length) {
        if (!encKey) {
          this.updateEphemeralChannelData(data);
        }

        return {
          updated,
          publicKey,
          data: encKey
            ? this.processEphemeralChannelData(data, encKey).data
            : data,
        };
      }

      return { updated, publicKey };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      throw new Error(err.message);
    }
  };

  public processEphemeralChannelData = (
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
    this.updateEphemeralChannelData(decryptedEphemeralData.data);
    return decryptedEphemeralData;
  };
}