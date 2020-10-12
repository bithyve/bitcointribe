import {
  Keepers,
  EphemeralDataElementsForKeeper,
  TrustedDataElements,
  EphemeralData,
  EncryptedEphemeralData,
  ShareUploadables,
  EphemeralDataForKeeper
} from './Interface';
import crypto from 'crypto';
import config from '../HexaConfig';
import { ec as EC } from 'elliptic';
import { BH_AXIOS } from '../../services/api';
import { AxiosResponse } from 'axios';
var ec = new EC('curve25519');

const { HEXA_ID } = config;

export default class Keeper {

  public keepers: Keepers = {};

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

  // public initializeKeeper = (
  //   uuid: string,
  //   privateKey: string,
  //   publicKey: string,
  //   encKey: string,
  //   ephemeralAddress: string
  // ): boolean => {

  //   // const keyPair = ec.genKeyPair();
  //   // const publicKey = keyPair.getPublic('hex');
  //   // const privateKey = keyPair.getPrivate('hex');

  //   // const ephemeralAddress = crypto
  //   //   .createHash('sha256')
  //   //   .update(publicKey)
  //   //   .digest('hex');

  //   this.keepers[shareId] = {
  //     uuid: uuid,
  //     privateKey,
  //     publicKey,
  //     encKey,
  //     ephemeralChannel: { address: ephemeralAddress },
  //   };

  //   return true;
  // };

  public updateEphemeralChannelData = (
    shareId: string,
    data: EphemeralDataElementsForKeeper,
  ): { updatedEphemeralDataElements: EphemeralDataElementsForKeeper } => {
    let ephemeralData = this.keepers[shareId].ephemeralChannel.data;
    let updatedEphemeralDataElements: EphemeralDataElementsForKeeper;
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
          ? (this.keepers[shareId].walletID = data.walletID)
          : null;

      }
    } else {
      ephemeralData = [data];
      updatedEphemeralDataElements = data;
    }

    this.keepers[shareId].ephemeralChannel.data = ephemeralData;
    return { updatedEphemeralDataElements };
  };

  public updateEphemeralChannel = async (
    shareId: string,
    shareType: string,
    publicKey: string,
    ephemeralAddress: string,
    dataElements: EphemeralDataElementsForKeeper,
    encKey: string,
    shareUploadables: ShareUploadables,
    fetch?: Boolean,
    privateKey?: string,
  ): Promise<
    | {
      updated: any;
      publicKey: string;
      data: EphemeralDataElementsForKeeper;
    }
    | {
      updated: any;
      publicKey: string;
      data?: undefined;
    }
  > => {
    try {

      this.keepers[shareId] = {
        shareType,
        privateKey,
        publicKey,
        encKey,
        ephemeralChannel: { address: ephemeralAddress },
      };

      dataElements.publicKey = publicKey;

      const { updatedEphemeralDataElements } = this.updateEphemeralChannelData(shareId, dataElements);

      let res: AxiosResponse;
      if (!encKey) {
        //Ignore this as its added to support older versions of app.
        // supporting versions prior to 1.1.0
        res = await BH_AXIOS.post('updateEphemeralChannel', {
          HEXA_ID,
          address: this.keepers[shareId].ephemeralChannel.address,
          data: dataElements,
          fetch,
          legacy: true,
        });
      } else {
        let encryptedDataPacket: EncryptedEphemeralData;
        // if (dataElements.DHInfo) {
        //   encryptedDataPacket = {
        //     publicKey,
        //     encryptedData: null,
        //     DHInfo: dataElements.DHInfo,
        //   };
        // } else {
          const ephemeralData: EphemeralDataForKeeper = {
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
        // }

        if (shareUploadables && Object.keys(shareUploadables).length) {
          res = await BH_AXIOS.post('updateShareAndEC', {
            // EC update params
            HEXA_ID,
            address: this.keepers[shareId].ephemeralChannel.address,
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
            address: this.keepers[shareId].ephemeralChannel.address,
            data: encryptedDataPacket,
            fetch,
          });
        }
      }

      console.log('resresresresres', res)

      let { updated, initiatedAt, data } = res.data;
      console.log({ updated, initiatedAt, data });
      if (!updated) throw new Error('Failed to update ephemeral space');
      if (initiatedAt)
        this.keepers[shareId].ephemeralChannel.initiatedAt = initiatedAt;

      if (data && Object.keys(data).length) {
        if (!encKey) {
          this.updateEphemeralChannelData(shareId, data);
        }

        return {
          updated,
          publicKey,
          data: encKey
            ? this.processEphemeralChannelData(shareId, data, encKey).data
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
    shareId: string,
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
    this.updateEphemeralChannelData(shareId, decryptedEphemeralData.data);
    return decryptedEphemeralData;
  };
}