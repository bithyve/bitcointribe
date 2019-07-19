import { AxiosResponse } from "axios";
import bip39 from "bip39";
import crypto from "crypto";
import QRCode from "qrcode";
import secrets from "secrets.js-grempe";
import config from "../../Config";
import { IMetaShare, ISocialStaticNonPMDD } from "../Interface";
const { BH_AXIOS } = config;

export default class SSS {
  public static recoverFromShares = (
    decryptedShares: string[],
  ): {
    mnemonic: string;
  } => {
    if ( decryptedShares.length >= SSS.threshold ) {
      const shares = [];
      for ( const share of decryptedShares ) {
        if ( SSS.validShare( share ) ) {
          shares.push( share.slice( 0, share.length - 8 ) );
        } else {
          throw new Error( `Invalid checksum, share: ${ share } is corrupt` );
        }
      }

      const recoveredMnemonicHex = secrets.combine( shares );
      return { mnemonic: SSS.hexToString( recoveredMnemonicHex ) };
    } else {
      throw new Error(
        `supplied number of shares are less than the threshold (${
        SSS.threshold
        })`,
      );
    }
  }

  public static decryptShares = (
    shares: string[],
    answer: string,
  ): {
    decryptedShares: string[];
  } => {
    const key = SSS.generateKey( answer );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );

    const decryptedShares: string[] = [];
    for ( const share of shares ) {
      const decipher = crypto.createDecipheriv(
        SSS.cipherSpec.algorithm,
        key,
        SSS.cipherSpec.iv,
      );
      let decrypted = decipher.update( share, "hex", "utf8" );
      decrypted += decipher.final( "utf8" );
      decryptedShares.push( decrypted );
    }
    return { decryptedShares };
  }

  public static downloadShare = async (
    key: string,
  ): Promise<{
    encryptedMetaShare: string;
    messageId: string;
  }> => {
    const messageId: string = SSS.getMessageId( key, config.MSG_ID_LENGTH );
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post( "downloadShare", {
        messageId,
      } );
    } catch ( err ) {
      throw new Error( err.response.data.err );
    }

    return { encryptedMetaShare: res.data.share, messageId };
  }

  public static validateDecryption = (
    decryptedMetaShare: IMetaShare,
    walletId?: string,
    existingShares: IMetaShare[] = [],
  ): boolean => {
    if ( walletId && decryptedMetaShare.meta.walletId === walletId ) {
      throw new Error( "You're not allowed to be your own trusted party" );
    }

    if ( existingShares.length ) {
      for ( const share of existingShares ) {
        if ( share.meta.walletId === decryptedMetaShare.meta.walletId ) {
          throw new Error(
            "You cannot store multiple shares from the same user.",
          );
        }
      }
    }

    return true;
  }

  public static affirmDecryption = async (
    messageId: string,
  ): Promise<{
    deleted: boolean;
  }> => {
    let res: AxiosResponse;

    try {
      res = await BH_AXIOS.post( "affirmDecryption", {
        messageId,
      } );
    } catch ( err ) {
      throw new Error( err.response.data.err );
    }

    return { deleted: res.data.deleted };
  }

  public static decryptViaOTP = (
    otpEncryptedData: string,
    otp: string,
  ): {
    decryptedData: any;
  } => {
    const key = SSS.generateKey( otp );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );
    const decipher = crypto.createDecipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv,
    );

    try {
      let decrypted = decipher.update( otpEncryptedData, "hex", "utf8" );
      decrypted += decipher.final( "utf8" );
      const decryptedData = JSON.parse( decrypted );
      return { decryptedData };
    } catch ( err ) {
      throw new Error(
        "An error occured while decrypting the share: Invalid OTP/Tampered Share",
      );
    }
  }

  public static decryptMetaShare = (
    encryptedMetaShare: string,
    key: any,
  ): {
    decryptedMetaShare: IMetaShare;
  } => {
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );
    console.log( { encryptedMetaShare, key } );

    const decipher = crypto.createDecipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv,
    );

    try {
      let decrypted = decipher.update( encryptedMetaShare, "hex", "utf8" );
      decrypted += decipher.final( "utf8" );
      const decryptedMetaShare = JSON.parse( decrypted );
      console.log( { decryptedMetaShare } );

      if ( decryptedMetaShare.meta.validator !== "HEXA" ) {
        throw new Error();
      }

      return { decryptedMetaShare };
    } catch ( err ) {
      throw new Error(
        "An error occured while decrypting the share: Invalid Key/Tampered Share",
      );
    }
  }


  public static recoverMetaShareFromQR = (
    qrData: string[],
  ): { metaShare: IMetaShare } => {
    qrData.sort();
    let recoveredQRData: string;
    recoveredQRData = "";
    for ( let itr = 0; itr < config.SSS_METASHARE_SPLITS; itr++ ) {
      const res = qrData[ itr ].slice( 3 );
      recoveredQRData = recoveredQRData + res;
    }
    console.log( { recoveredQRData } );

    const metaShare = JSON.parse( recoveredQRData );
    console.log( { metaShare } );

    return { metaShare };
  }

  public static getMessageId = ( key: string, length: number ): string => {
    const messageId = crypto
      .createHash( "sha256" )
      .update( key )
      .digest( "hex" );
    return messageId.slice( 0, length );
  }

  private static cipherSpec: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = {
      algorithm: "aes-192-cbc",
      salt: "bithyeSalt", // NOTE: The salt should be as unique as possible. It is recommended that a salt is random and at least 16 bytes long
      keyLength: 24,
      iv: Buffer.alloc( 16, 0 ),
    };
  private static threshold: number = config.SSS_THRESHOLD;

  private static hexToString = ( hex: string ): string => secrets.hex2str( hex );

  private static generateKey = ( psuedoKey: string ): string => {
    const hashRounds = 5048;
    let key = psuedoKey;
    for ( let itr = 0; itr < hashRounds; itr++ ) {
      const hash = crypto.createHash( "sha512" );
      key = hash.update( key ).digest( "hex" );
    }
    return key.slice( key.length - SSS.cipherSpec.keyLength );
  }

  private static validShare = ( checksumedShare: string ): boolean => {
    const extractedChecksum = checksumedShare.slice( checksumedShare.length - 8 );
    const recoveredShare = checksumedShare.slice( 0, checksumedShare.length - 8 );
    const calculatedChecksum = SSS.calculateChecksum( recoveredShare );
    if ( calculatedChecksum !== extractedChecksum ) {
      return false;
    }
    return true;
  }

  private static calculateChecksum = ( share: string ): string => {
    let temp = share;
    for ( let itr = 0; itr < config.CHECKSUM_ITR; itr++ ) {
      const hash = crypto.createHash( "sha512" );
      hash.update( temp );
      temp = hash.digest( "hex" );
    }

    return temp.slice( 0, 8 );
  }
  private mnemonic: string;
  private encryptedShares: string[];

  constructor ( mnemonic: string, encryptedShares?: string[] ) {
    if ( bip39.validateMnemonic( mnemonic ) ) {
      this.mnemonic = mnemonic;
    } else {
      throw new Error( "Invalid Mnemonic" );
    }
    this.encryptedShares = encryptedShares ? encryptedShares : [];
  }

  public stringToHex = ( str: string ): string => secrets.str2hex( str );

  public getShares = (): string[] => this.encryptedShares;

  public generateRandomString = ( length: number ): string => {
    let randomString: string = "";
    const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for ( let itr = 0; itr < length; itr++ ) {
      randomString += possibleChars.charAt(
        Math.floor( Math.random() * possibleChars.length ),
      );
    }
    return randomString;
  }
  public generateOTP = ( otpLength: number ): string =>
    this.generateRandomString( otpLength )

  public generateMessageID = (): string =>
    this.generateRandomString( config.MSG_ID_LENGTH )

  public generateShares = (): {
    shares: string[];
  } => {
    // threshold shares(m) of total shares(n) will enable the recovery of the mnemonic
    const shares = secrets.share(
      this.stringToHex( this.mnemonic ),
      config.SSS_TOTAL,
      SSS.threshold,
    );

    for ( let itr = 0; itr < shares.length; itr++ ) {
      const checksum = SSS.calculateChecksum( shares[ itr ] );
      shares[ itr ] = shares[ itr ] + checksum;
    }

    return { shares };
  }

  public uploadShare = async (
    encryptedMetaShare: string,
    messageId: string,
  ): Promise<{
    success: boolean;
  }> => {
    let res: AxiosResponse;

    try {
      res = await BH_AXIOS.post( "uploadShare", {
        share: encryptedMetaShare,
        messageId,
      } );
    } catch ( err ) {
      throw new Error( err.response.data.err );
    }

    const { success } = res.data;

    if ( !success ) {
      throw new Error( "Unable to upload share" );
    }
    return { success };
  }

  public encryptViaOTP = (
    data: any,
  ): {
    otpEncryptedData: string;
    otp: string;
  } => {
    const otp: string = this.generateOTP( parseInt( config.SSS_OTP_LENGTH, 10 ) );
    const key = SSS.generateKey( otp );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );

    const cipher = crypto.createCipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv,
    );
    let encrypted = cipher.update( JSON.stringify( data ), "utf8", "hex" );
    encrypted += cipher.final( "hex" );
    const encryptedData = encrypted;
    return {
      otpEncryptedData: encryptedData,
      otp,
    };
  }

  public encryptMetaShare = (
    metaShare: IMetaShare,
  ): { encryptedMetaShare: string; key: string; messageId: string } => {
    const key: string = this.makeKey( SSS.cipherSpec.keyLength );
    const messageId: string = SSS.getMessageId( key, config.MSG_ID_LENGTH );
    const cipher = crypto.createCipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv,
    );
    let encrypted = cipher.update( JSON.stringify( metaShare ), "utf8", "hex" );
    encrypted += cipher.final( "hex" );
    const encryptedMetaShare = encrypted;
    return {
      encryptedMetaShare,
      key,
      messageId,
    };
  }

  public getShareId = (
    encryptedShare: string,
  ): {
    shareId: string;
  } => {
    return {
      shareId: crypto
        .createHash( "sha256" )
        .update( encryptedShare )
        .digest( "hex" ),
    };
  }

  public initializeHealthcheck = async (
    encryptedShares: string[],
  ): Promise<{
    success: boolean;
  }> => {
    const shareIDs: string[] = [];
    for ( const encryptedShare of encryptedShares ) {
      const { shareId } = this.getShareId( encryptedShare );
      shareIDs.push( shareId );
    }

    const { walletId } = this.getWalletId();
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post( "sharesHealthCheckInit", {
        walletID: walletId,
        shareIDs,
      } );
    } catch ( err ) {
      throw new Error( err.response.data.err );
    }
    return {
      success: res.data.initSuccessful,
    };
  }

  public updateHealth = async (
    walletID: string,
    encryptedShare: string,
  ): Promise<
    | {
      updated: boolean;
      nonPMDD: string;
    }
    | {
      updated: boolean;
      nonPMDD?: string;
    }
  > => {
    const { shareId } = this.getShareId( encryptedShare );

    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post( "updateShareHealth", {
        walletID,
        shareID: shareId,
      } );
    } catch ( err ) {
      throw new Error( err.response.data.err );
    }

    const { updated, nonPMDD } = res.data;

    if ( updated ) {
      if ( nonPMDD ) {
        return {
          updated,
          nonPMDD,
        };
      }
      return {
        updated,
      };
    } else {
      throw new Error( "Unable to update the health of the share" );
    }
  }

  public checkHealth = async (
    shareIDs: string[],
  ): Promise<{
    lastUpdateds: Array<{
      shareId: string;
      updatedAt: number;
    }>;
  }> => {
    const { walletId } = this.getWalletId();
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post( "checkSharesHealth", {
        walletID: walletId,
        shareIDs,
      } );
    } catch ( err ) {
      throw new Error( err.response.data.err );
    }

    const lastUpdateds: Array<{ shareId: string; updatedAt: number }> =
      res.data.lastUpdateds;

    return {
      lastUpdateds,
    };
  }

  public encryptDynamicNonPMDD = (
    dynamicNonPMDD: IMetaShare[],
  ): { encryptedDynamicNonPMDD: string } => {
    const key = SSS.generateKey(
      bip39.mnemonicToSeed( this.mnemonic ).toString( "hex" ),
    );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   SSS.cipherSpec.salt,
    //   SSS.cipherSpec.keyLength,
    // );

    const cipher = crypto.createCipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv,
    );
    let encrypted = cipher.update(
      JSON.stringify( dynamicNonPMDD ),
      "utf8",
      "hex",
    );
    encrypted += cipher.final( "hex" );

    return { encryptedDynamicNonPMDD: encrypted };
  }

  public decryptStaticNonPMDD = async (
    encryptStaticNonPMDD: string,
  ): Promise<{
    decryptedStaticNonPMDD: IMetaShare;
  }> => {
    const key = SSS.generateKey(
      bip39.mnemonicToSeed( this.mnemonic ).toString( "hex" ),
    );
    console.log( { key } );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   SSS.cipherSpec.salt,
    //   SSS.cipherSpec.keyLength,
    // );

    const decipher = crypto.createDecipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv,
    );
    let decrypted = decipher.update( encryptStaticNonPMDD, "hex", "utf8" );
    decrypted += decipher.final( "utf8" );

    const decryptedStaticNonPMDD = JSON.parse( decrypted );
    return { decryptedStaticNonPMDD };
  }

  public decryptDynamicNonPMDD = async (
    encryptDynamicNonPMDD: string,
  ): Promise<{
    decryptedDynamicNonPMDD: IMetaShare;
  }> => {
    const key = SSS.generateKey(
      bip39.mnemonicToSeed( this.mnemonic ).toString( "hex" ),
    );
    console.log( { key } );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   SSS.cipherSpec.salt,
    //   SSS.cipherSpec.keyLength,
    // );

    const decipher = crypto.createDecipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv,
    );
    let decrypted = decipher.update( encryptDynamicNonPMDD, "hex", "utf8" );
    decrypted += decipher.final( "utf8" );

    const decryptedDynamicNonPMDD = JSON.parse( decrypted );
    if ( decryptedDynamicNonPMDD.meta.validator !== "HEXA" ) {
      throw new Error( "Unable to decrypt the nonPMDD, it might be corrupt" );
    }
    return { decryptedDynamicNonPMDD };
  }

  public updateDynamicNonPMDD = async (
    encryptedDynamicNonPMDD: string,
  ): Promise<{
    updated: boolean;
  }> => {
    const { walletId } = this.getWalletId();
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post( "updateNonPMDD", {
        walletID: walletId,
        nonPMDD: encryptedDynamicNonPMDD,
      } );
    } catch ( err ) {
      throw new Error( err.response.data.err );
    }

    const { updated } = res.data;
    if ( updated ) {
      return {
        updated,
      };
    } else {
      throw new Error( "Unable to update the NonPMDD" );
    }
  }

  public downloadDynamicNonPMDD = async (
    walletID: string,
  ): Promise<{
    nonPMDD: string;
  }> => {
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post( "fetchNonPMDD", {
        walletID,
      } );
    } catch ( err ) {
      throw new Error( err.response.data.err );
    }

    const { nonPMDD } = res.data;
    if ( nonPMDD ) {
      return {
        nonPMDD,
      };
    } else {
      throw new Error( "Unable to fetch nonPMDD" );
    }
  }

  public encryptStaticNonPMDD = (
    staticNonPMDD: any,
  ): {
    encryptedStaticNonPMDD: string;
  } => {
    const key = SSS.generateKey(
      bip39.mnemonicToSeed( this.mnemonic ).toString( "hex" ),
    );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   SSS.cipherSpec.salt,
    //   SSS.cipherSpec.keyLength,
    // );
    const cipher = crypto.createCipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv,
    );

    let encrypted = cipher.update( JSON.stringify( staticNonPMDD ), "utf8", "hex" );
    encrypted += cipher.final( "hex" );
    return { encryptedStaticNonPMDD: encrypted };
  }

  public addMeta = (
    index: number,
    encryptedShare: string,
    encryptedStaticNonPMDD: string,
    tag: string,
  ): {
    metaShare: IMetaShare;
  } => {
    const { walletId } = this.getWalletId();
    const timeStamp = new Date().toLocaleString( undefined, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    } );

    const metaShare: IMetaShare = {
      encryptedShare,
      meta: {
        validator: "HEXA",
        index,
        walletId,
        tag,
        timeStamp,
      },
      encryptedStaticNonPMDD,
    };

    return { metaShare };
  }

  public createQR = async (
    metashare: IMetaShare,
    index: number,
  ): Promise<{ qrData: string[] }> => {
    const splits: number = config.SSS_METASHARE_SPLITS;
    const metaString = JSON.stringify( metashare );
    const slice = Math.trunc( metaString.length / splits );
    const qrData: string[] = [];

    let start = 0;
    let end = slice;
    for ( let itr = 0; itr < splits; itr++ ) {
      if ( itr !== splits - 1 ) {
        qrData[ itr ] = metaString.slice( start, end );
      } else {
        qrData[ itr ] = metaString.slice( start );
      }
      start = end;
      end = end + slice;
      if ( index === 4 ) {
        qrData[ itr ] = "e0" + ( itr + 1 ) + qrData[ itr ];
      } else if ( index === 5 ) {
        qrData[ itr ] = "c0" + ( itr + 1 ) + qrData[ itr ];
      }
    }
    console.log( qrData );
    return { qrData };
  }



  public encryptShares = (
    shares: string[],
    answer: string,
  ): {
    encryptedShares: string[];
  } => {
    const key = SSS.generateKey( answer );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );

    for ( const share of shares ) {
      const cipher = crypto.createCipheriv(
        SSS.cipherSpec.algorithm,
        key,
        SSS.cipherSpec.iv,
      );
      let encrypted = cipher.update( share, "utf8", "hex" );
      encrypted += cipher.final( "hex" );
      this.encryptedShares.push( encrypted );
    }
    return { encryptedShares: this.encryptedShares };
  }

  public getWalletId = (): { walletId: string } => {
    return {
      walletId: crypto
        .createHash( "sha512" )
        .update( bip39.mnemonicToSeed( this.mnemonic ) )
        .digest( "hex" ),
    };
  }

  public makeKey = ( length: number ): string => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for ( let itr = 0; itr < length; itr++ ) {
      result += characters.charAt( Math.floor( Math.random() * charactersLength ) );
    }
    return result;
  }
}
