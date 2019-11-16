import { AxiosResponse } from "axios";
import * as bip39 from "bip39";
import crypto from "crypto";
import secrets from "secrets.js-grempe";
import config from "../../Config";
import {
  IBuddyStaticNonPMDD,
  IDynamicNonPMDD,
  IMetaShare,
  ISocialStaticNonPMDD
} from "../Interface";
const { BH_AXIOS } = config;

export default class SSS {
  public static cipherSpec: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = config.CIPHER_SPEC;

  public static recoverFromShares = (
    decryptedShares: string[]
  ): {
    mnemonic: string;
  } => {
    if (decryptedShares.length >= SSS.threshold) {
      const shares = [];
      for (const share of decryptedShares) {
        if (SSS.validShare(share)) {
          shares.push(share.slice(0, share.length - 8));
        } else {
          throw new Error(`Invalid checksum, share: ${share} is corrupt`);
        }
      }

      const recoveredMnemonicHex = secrets.combine(shares);
      return { mnemonic: SSS.hexToString(recoveredMnemonicHex) };
    } else {
      throw new Error(
        `supplied number of shares are less than the threshold (${SSS.threshold})`
      );
    }
  };

  public static decryptShares = (
    shares: string[],
    answer: string
  ): {
    decryptedShares: string[];
  } => {
    const key = SSS.generateKey(answer);
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );

    const decryptedShares: string[] = [];
    for (const share of shares) {
      const decipher = crypto.createDecipheriv(
        SSS.cipherSpec.algorithm,
        key,
        SSS.cipherSpec.iv
      );
      let decrypted = decipher.update(share, "hex", "utf8");
      decrypted += decipher.final("utf8");
      decryptedShares.push(decrypted);
    }
    return { decryptedShares };
  };

  public static downloadShare = async (
    encryptedKey: string,
    otp: string
  ): Promise<
    | {
        metaShare: IMetaShare;
        dynamicNonPMDD: IDynamicNonPMDD;
      }
    | {
        metaShare: IMetaShare;
        dynamicNonPMDD?: undefined;
      }
  > => {
    const key = SSS.decryptViaOTP(encryptedKey, otp).decryptedData;
    const messageId: string = SSS.getMessageId(key, config.MSG_ID_LENGTH);
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post("downloadShare", {
        messageId
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    const { share, dynamicNonPMDD } = res.data;
    const metaShare = SSS.decryptMetaShare(share, key).decryptedMetaShare;
    if (dynamicNonPMDD) {
      return { metaShare, dynamicNonPMDD };
    }
    return { metaShare };
  };

  public static validateDecryption = (
    decryptedMetaShare: IMetaShare,
    existingShares: IMetaShare[],
    walletId?: string
  ): boolean => {
    if (walletId && decryptedMetaShare.meta.walletId === walletId) {
      throw new Error("You're not allowed to be your own trusted party");
    }

    if (existingShares.length) {
      for (const share of existingShares) {
        if (share.meta.walletId === decryptedMetaShare.meta.walletId) {
          if (share.meta.version >= decryptedMetaShare.meta.version) {
            throw new Error(
              "You cannot store multiple shares from the same user"
            );
          }
        }
      }
    }

    return true;
  };

  public static affirmDecryption = async (
    messageId: string
  ): Promise<{
    deleted: boolean;
  }> => {
    let res: AxiosResponse;

    try {
      res = await BH_AXIOS.post("affirmDecryption", {
        messageId
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    return { deleted: res.data.deleted };
  };

  public static decryptViaOTP = (
    otpEncryptedData: string,
    otp: string
  ): {
    decryptedData: any;
  } => {
    const key = SSS.generateKey(otp);
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );
    const decipher = crypto.createDecipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv
    );

    try {
      let decrypted = decipher.update(otpEncryptedData, "hex", "utf8");
      decrypted += decipher.final("utf8");
      const decryptedData = JSON.parse(decrypted);
      return { decryptedData };
    } catch (err) {
      throw new Error(
        "An error occured while decrypting the share: Invalid OTP/Tampered Share"
      );
    }
  };

  public static decryptMetaShare = (
    encryptedMetaShare: string,
    key: any
  ): {
    decryptedMetaShare: IMetaShare;
  } => {
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );
    const decipher = crypto.createDecipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv
    );

    try {
      let decrypted = decipher.update(encryptedMetaShare, "hex", "utf8");
      decrypted += decipher.final("utf8");
      const decryptedMetaShare = JSON.parse(decrypted);
      if (decryptedMetaShare.meta.validator !== "HEXA") {
        throw new Error();
      }

      return { decryptedMetaShare };
    } catch (err) {
      throw new Error(
        "An error occured while decrypting the share: Invalid Key/Tampered Share"
      );
    }
  };

  public static getMessageId = (key: string, length: number): string => {
    const messageId = crypto
      .createHash("sha256")
      .update(key)
      .digest("hex");
    return messageId.slice(0, length);
  };

  public static recoverMetaShareFromQR = (
    qrData: string[]
  ): { metaShare: IMetaShare } => {
    console.log({ qrData });
    qrData.sort();
    let recoveredQRData: string;
    recoveredQRData = "";
    for (let itr = 0; itr < config.SSS_METASHARE_SPLITS; itr++) {
      const res = qrData[itr].slice(3);
      recoveredQRData = recoveredQRData + res;
    }
    console.log({ recoveredQRData });
    const metaShare = JSON.parse(recoveredQRData);
    console.log({ metaShare });
    return { metaShare };
  };

  public static updateHealth = async (
    metaShares: IMetaShare[]
  ): Promise<{
    updationInfo: Array<{
      walletId: string;
      shareId: string;
      updated: boolean;
      dynamicNonPMDD?: IDynamicNonPMDD;
      err?: string;
    }>;
  }> => {
    if (metaShares.length === 0) {
      throw new Error("No metaShare supplied");
    }

    const toUpdate: Array<{ walletId: string; shareId: string }> = [];
    for (const metaShare of metaShares) {
      const { shareId } = SSS.getShareId(metaShare.encryptedShare);
      toUpdate.push({ walletId: metaShare.meta.walletId, shareId });
    }

    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post("updateSharesHealth", {
        toUpdate
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    const { updationInfo } = res.data;
    return { updationInfo };
  };

  public static getShareId = (
    encryptedShare: string
  ): {
    shareId: string;
  } => {
    return {
      shareId: crypto
        .createHash("sha256")
        .update(encryptedShare)
        .digest("hex")
    };
  };

  public static makeKey = (length: number): string => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let itr = 0; itr < length; itr++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  public static encryptViaOTP = (
    data: any
  ): {
    otpEncryptedData: string;
    otp: string;
  } => {
    const otp: string = SSS.generateOTP(parseInt(config.SSS_OTP_LENGTH, 10));
    const key = SSS.generateKey(otp);
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );

    const cipher = crypto.createCipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv
    );
    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");
    const encryptedData = encrypted;
    return {
      otpEncryptedData: encryptedData,
      otp
    };
  };
  public static generateOTP = (otpLength: number): string =>
    SSS.generateRandomString(otpLength);

  public static generateRandomString = (length: number): string => {
    let randomString: string = "";
    const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let itr = 0; itr < length; itr++) {
      randomString += possibleChars.charAt(
        Math.floor(Math.random() * possibleChars.length)
      );
    }
    return randomString;
  };
  private static threshold: number = config.SSS_THRESHOLD;

  private static hexToString = (hex: string): string => secrets.hex2str(hex);

  private static generateKey = (psuedoKey: string): string => {
    const hashRounds = 5048;
    let key = psuedoKey;
    for (let itr = 0; itr < hashRounds; itr++) {
      const hash = crypto.createHash("sha512");
      key = hash.update(key).digest("hex");
    }
    return key.slice(key.length - SSS.cipherSpec.keyLength);
  };

  private static validShare = (checksumedShare: string): boolean => {
    const extractedChecksum = checksumedShare.slice(checksumedShare.length - 8);
    const recoveredShare = checksumedShare.slice(0, checksumedShare.length - 8);
    const calculatedChecksum = SSS.calculateChecksum(recoveredShare);
    if (calculatedChecksum !== extractedChecksum) {
      return false;
    }
    return true;
  };

  private static calculateChecksum = (share: string): string => {
    let temp = share;
    for (let itr = 0; itr < config.CHECKSUM_ITR; itr++) {
      const hash = crypto.createHash("sha512");
      hash.update(temp);
      temp = hash.digest("hex");
    }

    return temp.slice(0, 8);
  };

  private mnemonic: string;
  public walletId: string;
  public encryptedShares: string[];
  public metaShares: IMetaShare[];
  public metaShareTransferAssets: Array<{
    otp: string;
    encryptedKey: string;
    encryptedMetaShare: string;
  }>;
  public healthCheckInitialized: boolean;

  constructor(
    mnemonic: string,
    stateVars?: {
      encryptedShares: string[];
      metaShares: IMetaShare[];
      healthCheckInitialized: boolean;
      walletId: string;
      metaShareTransferAssets: Array<{
        otp: string;
        encryptedKey: string;
        encryptedMetaShare: string;
      }>;
    }
  ) {
    if (bip39.validateMnemonic(mnemonic)) {
      this.mnemonic = mnemonic;
    } else {
      throw new Error("Invalid Mnemonic");
    }
    this.walletId = stateVars
      ? stateVars.walletId
      : crypto
          .createHash("sha256")
          .update(bip39.mnemonicToSeedSync(this.mnemonic))
          .digest("hex");
    this.encryptedShares = stateVars ? stateVars.encryptedShares : [];
    this.metaShares = stateVars ? stateVars.metaShares : [];
    this.healthCheckInitialized = stateVars
      ? stateVars.healthCheckInitialized
      : false;
    this.metaShareTransferAssets = stateVars
      ? stateVars.metaShareTransferAssets
      : [];
  }

  public stringToHex = (str: string): string => secrets.str2hex(str);

  public generateMessageID = (): string =>
    SSS.generateRandomString(config.MSG_ID_LENGTH);

  public generateShares = (): {
    shares: string[];
  } => {
    // threshold shares(m) of total shares(n) will enable the recovery of the mnemonic
    const shares = secrets.share(
      this.stringToHex(this.mnemonic),
      config.SSS_TOTAL,
      SSS.threshold
    );

    for (let itr = 0; itr < shares.length; itr++) {
      const checksum = SSS.calculateChecksum(shares[itr]);
      shares[itr] = shares[itr] + checksum;
    }

    return { shares };
  };

  public uploadShare = async (
    shareIndex: 0 | 1 | 2,
    dynamicNonPMDD?: IDynamicNonPMDD
  ): Promise<{
    otp: string;
    encryptedKey: string;
  }> => {
    if (!this.metaShares.length)
      throw new Error("Generate MetaShares prior uploading");

    let res: AxiosResponse;
    const metaShare: IMetaShare = this.metaShares[shareIndex];
    const { encryptedMetaShare, key, messageId } = this.encryptMetaShare(
      metaShare
    );

    try {
      res = await BH_AXIOS.post("uploadShare", {
        share: encryptedMetaShare,
        messageId,
        dynamicNonPMDD
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    const { success } = res.data;
    if (!success) {
      throw new Error("Unable to upload share");
    }
    const { otp, otpEncryptedData } = SSS.encryptViaOTP(key);
    this.metaShareTransferAssets[shareIndex] = {
      otp,
      encryptedKey: otpEncryptedData,
      encryptedMetaShare
    };
    return { otp, encryptedKey: otpEncryptedData };
  };

  public encryptMetaShare = (
    metaShare: IMetaShare,
    key?: string
  ): { encryptedMetaShare: string; key: string; messageId: string } => {
    if (!key) {
      key = SSS.makeKey(SSS.cipherSpec.keyLength);
    }
    const messageId: string = SSS.getMessageId(key, config.MSG_ID_LENGTH);
    const cipher = crypto.createCipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv
    );
    let encrypted = cipher.update(JSON.stringify(metaShare), "utf8", "hex");
    encrypted += cipher.final("hex");
    const encryptedMetaShare = encrypted;
    return {
      encryptedMetaShare,
      key,
      messageId
    };
  };

  public initializeHealthcheck = async (): Promise<{
    success: boolean;
  }> => {
    if (this.healthCheckInitialized) {
      throw new Error("Health Check is already initialized.");
    }

    const shareIDs: string[] = [];
    for (const encryptedShare of this.encryptedShares) {
      const { shareId } = SSS.getShareId(encryptedShare);
      shareIDs.push(shareId);
    }

    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post("sharesHealthCheckInit", {
        walletID: this.walletId,
        shareIDs
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }
    if (res.data.initSuccessful) {
      this.healthCheckInitialized = true;
    }
    return {
      success: res.data.initSuccessful
    };
  };

  public checkHealth = async (shareIDs: string[]) => {
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post("checkSharesHealth", {
        walletID: this.walletId,
        shareIDs: shareIDs.filter(shareId => shareId !== null)
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    const updates: Array<{ shareId: string; updatedAt: number }> =
      res.data.lastUpdateds;

    const lastUpdateds = [];
    for (let itr = 0; itr <= shareIDs.length; itr++) {
      if (shareIDs[itr] === null) {
        lastUpdateds[itr] = null;
      } else {
        for (const update of updates) {
          if (update.shareId === shareIDs[itr]) {
            lastUpdateds[itr] = update;
          }
        }
      }
    }

    return {
      lastUpdateds
    };
  };

  public generateStaticNonPMDD = (secureAccAssets: {
    secondaryMnemonic: string;
    twoFASecret: string;
    secondaryXpub: string;
    bhXpub: string;
  }) => {
    const {
      secondaryMnemonic,
      twoFASecret,
      secondaryXpub,
      bhXpub
    } = secureAccAssets;

    const socialStaticNonPMDD: ISocialStaticNonPMDD = {
      secondaryXpub,
      bhXpub
    };
    const buddyStaticNonPMDD: IBuddyStaticNonPMDD = {
      secondaryMnemonic,
      twoFASecret,
      secondaryXpub,
      bhXpub
    };

    return {
      encryptedSocialStaticNonPMDD: this.encryptStaticNonPMDD(
        socialStaticNonPMDD
      ).encryptedStaticNonPMDD,
      encryptedBuddyStaticNonPMDD: this.encryptStaticNonPMDD(buddyStaticNonPMDD)
        .encryptedStaticNonPMDD
    };
  };

  public encryptStaticNonPMDD = (
    staticNonPMDD: ISocialStaticNonPMDD | IBuddyStaticNonPMDD
  ): {
    encryptedStaticNonPMDD: string;
  } => {
    const key = SSS.generateKey(
      bip39.mnemonicToSeedSync(this.mnemonic).toString("hex")
    );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   SSS.cipherSpec.salt,
    //   SSS.cipherSpec.keyLength,
    // );
    const cipher = crypto.createCipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv
    );

    let encrypted = cipher.update(JSON.stringify(staticNonPMDD), "utf8", "hex");
    encrypted += cipher.final("hex");
    return { encryptedStaticNonPMDD: encrypted };
  };

  public decryptStaticNonPMDD = (
    encryptStaticNonPMDD: string
  ): {
    decryptedStaticNonPMDD: ISocialStaticNonPMDD | IBuddyStaticNonPMDD;
  } => {
    const key = SSS.generateKey(
      bip39.mnemonicToSeedSync(this.mnemonic).toString("hex")
    );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   SSS.cipherSpec.salt,
    //   SSS.cipherSpec.keyLength,
    // );

    const decipher = crypto.createDecipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv
    );
    let decrypted = decipher.update(encryptStaticNonPMDD, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const decryptedStaticNonPMDD = JSON.parse(decrypted);
    return { decryptedStaticNonPMDD };
  };

  public encryptDynamicNonPMDD = (
    dynamicNonPMDD: IMetaShare[]
  ): { encryptedDynamicNonPMDD: string } => {
    const key = SSS.generateKey(
      bip39.mnemonicToSeedSync(this.mnemonic).toString("hex")
    );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   SSS.cipherSpec.salt,
    //   SSS.cipherSpec.keyLength,
    // );

    const cipher = crypto.createCipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv
    );
    let encrypted = cipher.update(
      JSON.stringify(dynamicNonPMDD),
      "utf8",
      "hex"
    );
    encrypted += cipher.final("hex");

    return { encryptedDynamicNonPMDD: encrypted };
  };

  public decryptDynamicNonPMDD = (
    encryptedDynamicNonPMDD: string
  ): {
    decryptedDynamicNonPMDD: IMetaShare[];
  } => {
    const key = SSS.generateKey(
      bip39.mnemonicToSeedSync(this.mnemonic).toString("hex")
    );
    console.log({ key });
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   SSS.cipherSpec.salt,
    //   SSS.cipherSpec.keyLength,
    // );

    const decipher = crypto.createDecipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv
    );
    let decrypted = decipher.update(encryptedDynamicNonPMDD, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const decryptedDynamicNonPMDD = JSON.parse(decrypted);
    return { decryptedDynamicNonPMDD };
  };

  public restoreDynamicNonPMDD = (
    dynamicNonPMDDs: IDynamicNonPMDD[]
  ): {
    decryptedDynamicNonPMDD: IMetaShare[];
  } => {
    if (dynamicNonPMDDs.length === 0) {
      throw new Error("No dynamicNonPMDDs supplied");
    }

    const latestDNP = dynamicNonPMDDs
      .sort((dnp1, dnp2) => {
        return dnp1.updatedAt > dnp2.updatedAt
          ? 1
          : dnp2.updatedAt > dnp1.updatedAt
          ? -1
          : 0;
      })
      .pop();

    const { decryptedDynamicNonPMDD } = this.decryptDynamicNonPMDD(
      latestDNP.encryptedDynamicNonPMDD
    );
    return { decryptedDynamicNonPMDD };
  };

  public updateDynamicNonPMDD = async (
    encryptedDynamicNonPMDD: string
  ): Promise<{
    updated: boolean;
  }> => {
    const dynamicNonPMDD: IDynamicNonPMDD = {
      updatedAt: Date.now(),
      encryptedDynamicNonPMDD
    };

    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post("updateDynamicNonPMDD", {
        walletID: this.walletId,
        dynamicNonPMDD
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    const { updated } = res.data;
    if (updated) {
      return {
        updated
      };
    } else {
      throw new Error("Unable to update the NonPMDD");
    }
  };

  public downloadDynamicNonPMDD = async (
    walletID: string
  ): Promise<{
    dynamicNonPMDD: IDynamicNonPMDD;
  }> => {
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post("downloadDynamicNonPMDD", {
        walletID
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    const { dynamicNonPMDD } = res.data;
    if (dynamicNonPMDD) {
      return {
        dynamicNonPMDD
      };
    } else {
      throw new Error("Unable to download DynamicNonPMDD");
    }
  };

  public createMetaShares = (
    secureAssets: {
      secondaryMnemonic: string;
      twoFASecret: string;
      secondaryXpub: string;
      bhXpub: string;
    },
    tag: string,
    version?: number
  ): {
    metaShares: IMetaShare[];
  } => {
    if (!this.encryptedShares.length) {
      throw new Error("Can not create MetaShares; missing encryptedShares");
    }

    const {
      encryptedSocialStaticNonPMDD,
      encryptedBuddyStaticNonPMDD
    } = this.generateStaticNonPMDD(secureAssets);

    const timestamp = new Date().toLocaleString(undefined, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    let index = 0;
    let metaShare: IMetaShare;
    for (const encryptedShare of this.encryptedShares) {
      if (index !== 2) {
        metaShare = {
          encryptedShare,
          meta: {
            version: version ? version : 0,
            validator: "HEXA",
            index,
            walletId: this.walletId,
            tag,
            timestamp
          },
          encryptedStaticNonPMDD: encryptedSocialStaticNonPMDD
        };
      } else {
        metaShare = {
          encryptedShare,
          meta: {
            version: version ? version : 0,
            validator: "HEXA",
            index,
            walletId: this.walletId,
            tag,
            timestamp
          },
          encryptedStaticNonPMDD: encryptedBuddyStaticNonPMDD
        };
      }

      this.metaShares.push(metaShare);
      index++;
    }
    if (this.metaShares.length !== 5) {
      this.metaShares = [];
      throw new Error("Something went wrong while generating metaShares");
    }

    return { metaShares: this.metaShares };
  };

  public createQR = async (
    metashare: IMetaShare,
    index: number
  ): Promise<{ qrData: string[] }> => {
    const splits: number = config.SSS_METASHARE_SPLITS;
    const metaString = JSON.stringify(metashare);
    const slice = Math.trunc(metaString.length / splits);
    const qrData: string[] = [];

    let start = 0;
    let end = slice;
    for (let itr = 0; itr < splits; itr++) {
      if (itr !== splits - 1) {
        qrData[itr] = metaString.slice(start, end);
      } else {
        qrData[itr] = metaString.slice(start);
      }
      start = end;
      end = end + slice;
      if (index === 4) {
        qrData[itr] = "e0" + (itr + 1) + qrData[itr];
      } else if (index === 5) {
        qrData[itr] = "c0" + (itr + 1) + qrData[itr];
      }
    }
    console.log(qrData);
    return { qrData };
  };

  public encryptShares = (
    shares: string[],
    answer: string
  ): {
    encryptedShares: string[];
  } => {
    const key = SSS.generateKey(answer);
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );

    for (const share of shares) {
      const cipher = crypto.createCipheriv(
        SSS.cipherSpec.algorithm,
        key,
        SSS.cipherSpec.iv
      );
      let encrypted = cipher.update(share, "utf8", "hex");
      encrypted += cipher.final("hex");
      this.encryptedShares.push(encrypted);
    }
    return { encryptedShares: this.encryptedShares };
  };
}
