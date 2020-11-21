import {
  Keepers,
  EphemeralDataElementsForKeeper,
  TrustedDataElements,
  EphemeralData,
  EncryptedEphemeralData,
  ShareUploadables,
  EphemeralDataForKeeper,
  EphemeralDataElements,
  EncryptedTrustedData,
  TrustedData,
  EncDynamicNonPMDD,
  MetaShare,
} from './Interface';
import crypto from 'crypto';
import config from '../HexaConfig';
import { ec as EC } from 'elliptic';
import { BH_AXIOS } from '../../services/api';
import { AxiosResponse } from 'axios';
import TrustedContacts from './TrustedContacts';
import LevelHealth from './LevelHealth/LevelHealth';
var ec = new EC('curve25519');

const { HEXA_ID } = config;

export default class Keeper {
  public keepers: Keepers = {};
  constructor(stateVars) {
    this.initializeStateVars(stateVars);
  }

  public initializeStateVars = (stateVars) => {
    this.keepers = stateVars && stateVars.keepers ? stateVars.keepers : {};
  };

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

  public decodePublicKey = (publicKey: string) => {
    const keyPair = ec.keyFromPublic(publicKey, 'hex');
    return keyPair.getPublic();
  };

  public static encryptPub = (
    publicKey: string,
    key: string,
  ): { encryptedPub: string } => {
    const encryptionKey = Keeper.getDerivedKey(key);

    const cipher = crypto.createCipheriv(
      Keeper.cipherSpec.algorithm,
      encryptionKey,
      Keeper.cipherSpec.iv,
    );

    const prefix = 'hexa:';
    let encryptedPub = cipher.update(prefix + publicKey, 'utf8', 'hex');
    encryptedPub += cipher.final('hex');

    return { encryptedPub };
  };

  public static decryptPub = (
    encryptedPub: string,
    key: string,
  ): {
    decryptedPub: string;
  } => {
    const decryptionKey = Keeper.getDerivedKey(key);

    const decipher = crypto.createDecipheriv(
      Keeper.cipherSpec.algorithm,
      decryptionKey,
      Keeper.cipherSpec.iv,
    );

    let decryptedPub = decipher.update(encryptedPub, 'hex', 'utf8');
    decryptedPub += decipher.final('utf8');

    if (decryptedPub.slice(0, 5) !== 'hexa:') {
      throw new Error('PubKey decryption failed: invalid key');
    }

    return { decryptedPub: decryptedPub.slice(5) };
  };

  private static getDerivedKey = (psuedoKey: string): string => {
    const hashRounds = 1048;
    let key = psuedoKey;
    for (let itr = 0; itr < hashRounds; itr++) {
      const hash = crypto.createHash('sha512');
      key = hash.update(key).digest('hex');
    }
    return key.slice(key.length - Keeper.cipherSpec.keyLength);
  };

  public initializeKeeper = (
    shareId: string,
    encKey: string,
  ): { publicKey: string; ephemeralAddress: string } => {
    if (this.keepers[shareId]) {
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

    let otp;
    if (!encKey) {
      // contact with no phone-number/email
      otp = TrustedContacts.generateOTP(parseInt(config.SSS_OTP_LENGTH, 10));
      encKey = LevelHealth.strechKey(otp);
    }

    this.keepers[shareId] = {
      privateKey,
      publicKey,
      shareTransferDetails: {
        encryptedKey: encKey,
        otp,
      },
      ephemeralChannel: { address: ephemeralAddress },
    };
    return { publicKey, ephemeralAddress };
  };

  public finalizeKeeper = (
    shareId: string,
    encodedPublicKey: string,
    encKey: string,
    keeperUUID?: string,
    keeperFeatureList?: any[],
    isPrimary?: Boolean,
    walletName?: string,
    EfChannelAddress?: string,
  ): {
    channelAddress: string;
    ephemeralAddress: string;
    publicKey: string;
  } => {
    try {
      if (!this.keepers[shareId]) {
        this.initializeKeeper(shareId, encKey); // case: trusted contact setup has been requested
      }

      // if (
      //   this.keepers[shareId].trustedChannel &&
      //   this.keepers[shareId].trustedChannel.address
      // ) {
      //   throw new Error(
      //     'TC finalize failed: channel already exists with this keeper',
      //   );
      // }
      const { ephemeralChannel, privateKey } = this.keepers[shareId];
      const keyPair = ec.keyFromPrivate(privateKey, 'hex');
      const symmetricKey = keyPair
        .derive(this.decodePublicKey(encodedPublicKey))
        .toString(16); // ECDH

      const channelAddress = crypto
        .createHash('sha256')
        .update(symmetricKey)
        .digest('hex');

      const ephemeralAddress = EfChannelAddress ? EfChannelAddress : crypto.createHash('sha256').update(encodedPublicKey).digest('hex');

      this.keepers[shareId] = {
        ...this.keepers[shareId],
        symmetricKey,
        ephemeralChannel: {
          ...ephemeralChannel,
          address: ephemeralAddress,
        },
        trustedChannel: {
          address: channelAddress,
        },
        keeperPubKey: encodedPublicKey,
        walletName, // would help with contact name to wallet name mapping to aid recovery share provisioning
        keeperUUID,
        keeperFeatureList,
        isPrimary,
      };
      return {
        channelAddress,
        ephemeralAddress,
        publicKey: keyPair.getPublic('hex'),
      };
    } catch (error) {
      console.log('error finalize keeper', error);
      return {
        channelAddress: '',
        ephemeralAddress: '',
        publicKey: '',
      };
    }
  };

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
        data.walletID ? (this.keepers[shareId].walletID = data.walletID) : null;
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
    dataElements: EphemeralDataElements,
    encKey: string,
    shareUploadables: ShareUploadables,
    fetch?: Boolean,
    privateKey?: string,
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
      console.log("this.keepers[shareId] before",this.keepers[shareId]);
      this.keepers[shareId] = {
        ...this.keepers[shareId],
        shareType,
        publicKey,
        shareTransferDetails: dataElements.shareTransferDetails
          ? dataElements.shareTransferDetails
          : {},
        ephemeralChannel: { address: ephemeralAddress },
      };
      
      //dataElements.publicKey = publicKey;
      console.log("this.keepers[shareId] after",this.keepers[shareId]);

      const { updatedEphemeralDataElements } = this.updateEphemeralChannelData(
        shareId,
        dataElements,
      );

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
        console.log('updateEphemeralChannel if res', res);
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

        const { encryptedData } = this.encryptData(encKey, ephemeralData.data);

        encryptedDataPacket = {
          publicKey,
          encryptedData,
          walletID: updatedEphemeralDataElements.walletID,
        };
        // }

        if (shareUploadables && Object.keys(shareUploadables).length) {
          let obj = {
            // EC update params
            HEXA_ID,
            address: this.keepers[shareId].ephemeralChannel.address,
            data: encryptedDataPacket,
            fetch,
            // upload share params
            share: shareUploadables.encryptedMetaShare,
            messageId: shareUploadables.messageId,
            encryptedDynamicNonPMDD: shareUploadables.encryptedDynamicNonPMDD,
          }
          console.log('updateShareAndEC', obj);
          res = await BH_AXIOS.post('updateShareAndEC', obj);
          console.log('updateShareAndEC res', res);
        } else {
          res = await BH_AXIOS.post('updateEphemeralChannel', {
            HEXA_ID,
            address: this.keepers[shareId].ephemeralChannel.address,
            data: encryptedDataPacket,
            fetch,
          });
          console.log('updateEphemeralChannel else res', res);
        }
      }

      console.log('resresresresres', res);

      let { updated, initiatedAt, data } = res.data;
      console.log({ updated, initiatedAt, data });
      if (!updated) throw new Error('Failed to update ephemeral space');
      if (initiatedAt)
        this.keepers[shareId].ephemeralChannel.initiatedAt = initiatedAt;

      if (data && Object.keys(data).length) {
        console.log('resresresresres if', data);
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
      console.log('err.response.data.err', err.response.data.err);
      console.log('err.response.data.err', err.message);
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

  public fetchEphemeralChannel = async (
    shareId: string,
    encKey: string,
    approveTC?: Boolean,
    publicKey?: string,
  ): Promise<{
    data: EphemeralDataElementsForKeeper;
  }> => {
    try {
      let res: AxiosResponse;

      if (!publicKey) {
        if (!this.keepers[shareId]) {
          throw new Error(`No contact exist with contact name: ${shareId}`);
        }

        const { ephemeralChannel } = this.keepers[shareId];

        res = await BH_AXIOS.post('fetchEphemeralChannel', {
          HEXA_ID,
          address: ephemeralChannel.address,
          identifier: this.keepers[shareId].publicKey,
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
        data = this.processEphemeralChannelData(shareId, data, encKey);
      }

      if (!publicKey && approveTC) {
        let contactsPublicKey;
        this.keepers[shareId].ephemeralChannel.data.forEach(
          (element: EphemeralDataElements) => {
            if (element.publicKey !== this.keepers[shareId].publicKey) {
              contactsPublicKey = element.publicKey;
            }
          },
        ); // only one element would contain the public key (uploaded by the counterparty)

        if (!contactsPublicKey) {
          // console.log(`Approval failed, ${contactName}'s public key missing`);
          throw new Error(`Approval failed, ${shareId}'s public key missing`);
        }

        this.finalizeKeeper(shareId, contactsPublicKey, encKey);
      }

      return { data };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      throw new Error(err.message);
    }
  };

  public updateTrustedChannelData = (
    shareId: string,
    newTrustedData: TrustedData,
  ): { updatedTrustedData; overallTrustedData: TrustedData[] } => {
    let trustedData: TrustedData[] = this.keepers[shareId].trustedChannel.data
      ? [...this.keepers[shareId].trustedChannel.data]
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
        // console.log({ newTrustedData });
        // update counterparty's walletId and FCM

        newTrustedData.data.walletID
          ? (this.keepers[shareId].walletID = newTrustedData.data.walletID)
          : null;

        if (newTrustedData.data.FCM)
          this.keepers[shareId].FCMs
            ? this.keepers[shareId].FCMs.push(newTrustedData.data.FCM)
            : (this.keepers[shareId].FCMs = [newTrustedData.data.FCM]);
      }
    } else {
      trustedData = [newTrustedData];
    }

    // this.keepers[contactName].trustedChannel.data = trustedData; save post updation
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
      encDataHash: crypto
        .createHash('sha256')
        .update(encryptedData.encryptedData)
        .digest('hex'),
      lastSeen: encryptedData.lastSeen,
    };
    const { overallTrustedData } = this.updateTrustedChannelData(
      contactName,
      decryptedTrustedData,
    );
    this.keepers[contactName].trustedChannel.data = overallTrustedData;
    return decryptedTrustedData;
  };

  public updateTrustedChannel = async (
    shareId: string,
    dataElements: TrustedDataElements,
    fetch?: Boolean,
    shareUploadables?: ShareUploadables,
  ): Promise<
    | {
        updated: any;
        data: any; //TrustedData;
      }
    | {
        updated: any;
        data?: undefined;
      }
  > => {
    try {
      if (!this.keepers[shareId]) {
        console.log('updateTrustedChannel, !this.keepers[shareId]');
        throw new Error(`No contact exist with contact name: ${shareId}`);
      }

      if (
        !this.keepers[shareId].trustedChannel &&
        !this.keepers[shareId].trustedChannel.address
      ) {
        console.log(
          'updateTrustedChannel, !this.keepers[shareId].trustedChannel.address',
        );
        throw new Error(
          `Secure channel not formed with the following contact: ${shareId}`,
        );
      }

      const { trustedChannel, symmetricKey, publicKey } = this.keepers[shareId];
      console.log("trustedChannel, symmetricKey, publicKey",trustedChannel, symmetricKey, publicKey)
      const trustedData: TrustedData = {
        publicKey,
        data: dataElements,
      };
      console.log('updateTrustedChannel, trustedData', trustedData);
      const {
        updatedTrustedData,
        overallTrustedData,
      } = this.updateTrustedChannelData(shareId, trustedData);
      console.log(
        'updateTrustedChannel, overallTrustedData',
        updatedTrustedData,
        overallTrustedData,
      );

      const { encryptedData } = this.encryptData(
        symmetricKey,
        updatedTrustedData.data,
      );

      console.log('updateTrustedChannel, encryptedData', encryptedData);

      const encryptedDataPacket: EncryptedTrustedData = {
        publicKey,
        encryptedData,
        dataHash: crypto
          .createHash('sha256')
          .update(encryptedData)
          .digest('hex'),
        lastSeen: Date.now(),
      };

      console.log(
        'updateTrustedChannel, encryptedDataPacket',
        encryptedDataPacket,
      );

      let res: AxiosResponse;
      if (shareUploadables && Object.keys(shareUploadables).length) {
        res = await BH_AXIOS.post('updateShareAndTC', {
          // EC update params
          HEXA_ID,
          address: trustedChannel.address,
          data: encryptedDataPacket,
          fetch,
          // upload share params
          share: shareUploadables.encryptedMetaShare,
          messageId: shareUploadables.messageId,
          encryptedDynamicNonPMDD: shareUploadables.encryptedDynamicNonPMDD,
        });
        console.log('updateTrustedChannel, res if', res);
      } else {
        res = await BH_AXIOS.post('updateTrustedChannel', {
          HEXA_ID,
          address: trustedChannel.address,
          data: encryptedDataPacket,
          fetch,
        });
        console.log('updateTrustedChannel, res else', res);
      }
      console.log('updateTrustedChannel, res', res);
      let { updated, data } = res.data;
      if (!updated) throw new Error('Failed to update ephemeral space');
      this.keepers[shareId].trustedChannel.data = overallTrustedData; // save post updation

      if (data) {
        data = this.processTrustedChannelData(shareId, data, symmetricKey);
        const { walletName } = data.data ? data.data : { walletName: null };
        if (walletName) {
          this.keepers[shareId] = {
            ...this.keepers[shareId],
            walletName: walletName,
          };
        }
        return { updated, data };
      }
      return { updated };
    } catch (err) {
      console.log(
        'err.response.data.err updateTrustedChannel',
        err.response.data.err,
      );
      console.log('err.response.data.err updateTrustedChannel', err.message);
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      throw new Error(err.message);
    }
  };

  public fetchTrustedChannel = async (
    shareId: string,
    walletName?: string,
  ): Promise<{
    data: TrustedDataElements;
  }> => {
    try {
      if (!this.keepers[shareId]) {
        throw new Error(`No contact exist with contact name: ${shareId}`);
      }

      if (
        !this.keepers[shareId].trustedChannel &&
        !this.keepers[shareId].trustedChannel.address
      ) {
        throw new Error(
          `Secure channel not formed with the following contact: ${shareId}`,
        );
      }

      const { trustedChannel, symmetricKey, publicKey } = this.keepers[shareId];

      const res = await BH_AXIOS.post('fetchTrustedChannel', {
        HEXA_ID,
        address: trustedChannel.address,
        identifier: publicKey,
      });
      // console.log({ res });

      let { data } = res.data;
      if (data) {
        data = this.processTrustedChannelData(shareId, data, symmetricKey).data;
        if (data.walletName) {
          this.keepers[shareId] = {
            ...this.keepers[shareId],
            walletName: data.walletName,
          };
        }
      }

      if (walletName) {
        this.keepers[shareId] = {
          ...this.keepers[shareId],
          walletName, // would help with contact name to wallet name mapping to aid recovery share provisioning
        };
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

  public uploadSecondaryShare = async (
    encryptedKey: string,
    metaShare: MetaShare,
    otp?: string,
    encryptedDynamicNonPMDD?: EncDynamicNonPMDD,
  ): Promise<{ success: boolean }> => {
    let key = encryptedKey; // if no OTP is provided the key is non-OTP encrypted and can be used directly
    if (otp) {
      key = LevelHealth.decryptViaOTP(encryptedKey, otp).decryptedData;
    }
    const { encryptedMetaShare, messageId } = LevelHealth.encryptMetaShare(
      metaShare,
      key,
    );

    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post('uploadSecondaryShare', {
        HEXA_ID,
        share: encryptedMetaShare,
        messageId,
        encryptedDynamicNonPMDD,
      });

      const { success } = res.data;
      if (!success) {
        throw new Error('Unable to upload share');
      }
      return { success };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
      return { success: false };
    }
  };
}
