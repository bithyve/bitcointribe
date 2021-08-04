import { AxiosResponse } from 'axios'
import * as bip39 from 'bip39'
import crypto from 'crypto'
import secrets from 'secrets.js-grempe'
import config from '../HexaConfig'
import {
  EncDynamicNonPMDD,
  MetaShare,
} from './Interface'

import { BH_AXIOS } from '../../services/api'
import { generateRandomString } from '../../common/CommonFunctions'
import moment from 'moment'
const { HEXA_ID } = config

export default class BHROperations {
  static cipherSpec: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = config.CIPHER_SPEC;
  static threshold: number = config.SSS_THRESHOLD;
  static thresholdLevel1: number = config.SSS_LEVEL1_THRESHOLD;
  static thresholdLevel2: number = config.SSS_LEVEL2_THRESHOLD;

  static hexToString = ( hex: string ): string => secrets.hex2str( hex );
  static stringToHex = ( str: string ): string => secrets.str2hex( str );

  static generateKey = ( length: number ): string => {
    let result = ''
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for ( let itr = 0; itr < length; itr++ ) {
      result += characters.charAt( Math.floor( Math.random() * charactersLength ) )
    }
    return result
  };

  static decryptSecrets = (
    secretsArray: string[],
    answer: string,
  ): {
    decryptedSecrets: string[];
  } => {
    const key = BHROperations.getDerivedKey( answer )

    const decryptedSecrets: string[] = []
    for ( const secret of secretsArray ) {
      const decipher = crypto.createDecipheriv(
        BHROperations.cipherSpec.algorithm,
        key,
        BHROperations.cipherSpec.iv,
      )
      let decrypted = decipher.update( secret, 'hex', 'utf8' )
      decrypted += decipher.final( 'utf8' )
      decryptedSecrets.push( decrypted )
    }
    return {
      decryptedSecrets
    }
  };

  static encryptWithAnswer = (
    data: string,
    answer: string,
  ): {
    encryptedData: string;
  } => {
    const key = BHROperations.getDerivedKey( answer )
    const cipher = crypto.createCipheriv(
      BHROperations.cipherSpec.algorithm,
      key,
      BHROperations.cipherSpec.iv,
    )
    let encrypted = cipher.update( data, 'utf8', 'hex' )
    encrypted += cipher.final( 'hex' )
    return {
      encryptedData: encrypted
    }
  };

  static decryptWithAnswer = (
    encryptedData: string,
    answer: string,
  ): {
    decryptedData: string;
  } => {
    const key = BHROperations.getDerivedKey( answer )
    const decipher = crypto.createDecipheriv(
      BHROperations.cipherSpec.algorithm,
      key,
      BHROperations.cipherSpec.iv,
    )
    let decrypted = decipher.update( encryptedData, 'hex', 'utf8' )
    decrypted += decipher.final( 'utf8' )

    return {
      decryptedData: decrypted
    }
  };

  static encryptDynamicNonPMDD = (
    mnemonic: string,
    dynamicNonPMDD: MetaShare[],
  ): { encryptedDynamicNonPMDD: string } => {
    const key = BHROperations.getDerivedKey(
      bip39.mnemonicToSeedSync( mnemonic ).toString( 'hex' ),
    )
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   BHROperations.cipherSpec.salt,
    //   BHROperations.cipherSpec.keyLength,
    // );

    const cipher = crypto.createCipheriv(
      BHROperations.cipherSpec.algorithm,
      key,
      BHROperations.cipherSpec.iv,
    )
    let encrypted = cipher.update(
      JSON.stringify( dynamicNonPMDD ),
      'utf8',
      'hex',
    )
    encrypted += cipher.final( 'hex' )

    return {
      encryptedDynamicNonPMDD: encrypted
    }
  };

  static decryptDynamicNonPMDD = (
    mnemonic: string,
    encryptedDynamicNonPMDD: EncDynamicNonPMDD,
  ): {
    decryptedDynamicNonPMDD: MetaShare[];
  } => {
    const key = BHROperations.getDerivedKey(
      bip39.mnemonicToSeedSync( mnemonic ).toString( 'hex' ),
    )
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   BHROperations.cipherSpec.salt,
    //   BHROperations.cipherSpec.keyLength,
    // );

    const decipher = crypto.createDecipheriv(
      BHROperations.cipherSpec.algorithm,
      key,
      BHROperations.cipherSpec.iv,
    )
    let decrypted = decipher.update(
      encryptedDynamicNonPMDD.encryptedDynamicNonPMDD,
      'hex',
      'utf8',
    )
    decrypted += decipher.final( 'utf8' )

    const decryptedDynamicNonPMDD = JSON.parse( decrypted )
    return {
      decryptedDynamicNonPMDD
    }
  };

  static restoreDynamicNonPMDD = (
    mnemonic: string,
    dynamicNonPMDDs: EncDynamicNonPMDD[],
  ): {
    decryptedDynamicNonPMDD: MetaShare[];
  } => {
    if ( dynamicNonPMDDs.length === 0 ) {
      throw new Error( 'No dynamicNonPMDDs supplied' )
    }

    const latestDNP = dynamicNonPMDDs
      .sort( ( dnp1, dnp2 ) => {
        return dnp1.updatedAt > dnp2.updatedAt
          ? 1
          : dnp2.updatedAt > dnp1.updatedAt
            ? -1
            : 0
      } )
      .pop()

    const { decryptedDynamicNonPMDD } = BHROperations.decryptDynamicNonPMDD( mnemonic, latestDNP )
    return {
      decryptedDynamicNonPMDD
    }
  };

  static updateDynamicNonPMDD = async (
    walletId: string,
    mnemonic: string,
    dynamicNonPMDD,
  ): Promise<{
    updated: boolean;
  }> => {
    const encryptedDynamicNonPMDD: EncDynamicNonPMDD = {
      updatedAt: Date.now(),
      encryptedDynamicNonPMDD: BHROperations.encryptDynamicNonPMDD( mnemonic, dynamicNonPMDD )
        .encryptedDynamicNonPMDD,
    }

    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'updateDynamicNonPMDD', {
        HEXA_ID,
        walletID: walletId,
        encryptedDynamicNonPMDD,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { updated } = res.data
    if ( updated ) {
      return {
        updated,
      }
    } else {
      throw new Error( 'Unable to update the NonPMDD' )
    }
  };

  static downloadShare = async (
    encryptedKey: string,
    otp?: string,
  ): Promise<
    | {
        metaShare: MetaShare;
        encryptedDynamicNonPMDD: EncDynamicNonPMDD;
        messageId: string;
      }
    | {
        metaShare: MetaShare;
        messageId: string;
        encryptedDynamicNonPMDD?: undefined;
      }
  > => {
    let key = encryptedKey // if no OTP is provided the key is non-OTP encrypted and can be used directly
    if ( otp ) {
      key = BHROperations.decryptViaOTP( encryptedKey, otp ).decryptedData
    }
    const messageId: string = BHROperations.getMessageId(
      key,
      config.MSG_ID_LENGTH,
    )
    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'downloadShare', {
        HEXA_ID,
        messageId,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { share, encryptedDynamicNonPMDD } = res.data
    const metaShare = BHROperations.decryptMetaShare( share, key )
      .decryptedMetaShare
    return {
      metaShare, encryptedDynamicNonPMDD, messageId
    }
  };

  static downloadDynamicNonPMDD = async (
    walletID: string,
  ): Promise<{
    encryptedDynamicNonPMDD: EncDynamicNonPMDD;
  }> => {
    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'downloadDynamicNonPMDD', {
        HEXA_ID,
        walletID,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { encryptedDynamicNonPMDD } = res.data
    if ( encryptedDynamicNonPMDD ) {
      return {
        encryptedDynamicNonPMDD,
      }
    } else {
      throw new Error( 'Unable to download EncDynamicNonPMDD' )
    }
  };

  static validateStorage = (
    decryptedMetaShare: MetaShare,
    existingShares: MetaShare[],
    walletId?: string,
  ): boolean => {
    if ( walletId && decryptedMetaShare.meta.walletId === walletId ) {
      throw new Error( 'You\'re not allowed to be your own contact' )
    }

    if ( existingShares.length ) {
      for ( const share of existingShares ) {
        if ( share.meta.walletId === decryptedMetaShare.meta.walletId ) {
          if (
            parseFloat( share.meta.version ) >=
            parseFloat( decryptedMetaShare.meta.version )
          ) {
            throw new Error(
              'You cannot store lower share version of the same share',
            )
          }
        }
      }
    }

    return true
  };

  static affirmDecryption = async (
    messageId: string,
  ): Promise<{
    deleted: boolean;
  }> => {
    let res: AxiosResponse

    try {
      res = await BH_AXIOS.post( 'affirmDecryption', {
        HEXA_ID,
        messageId,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    return {
      deleted: res.data.deleted
    }
  };

  static encryptMetaShare = (
    metaShare: MetaShare,
    key?: string,
  ): { encryptedMetaShare: string; key: string; messageId: string } => {
    if ( !key ) {
      key = BHROperations.generateKey( BHROperations.cipherSpec.keyLength )
    }
    const messageId: string = BHROperations.getMessageId(
      key,
      config.MSG_ID_LENGTH,
    )
    const cipher = crypto.createCipheriv(
      BHROperations.cipherSpec.algorithm,
      key,
      BHROperations.cipherSpec.iv,
    )
    let encrypted = cipher.update( JSON.stringify( metaShare ), 'utf8', 'hex' )
    encrypted += cipher.final( 'hex' )
    const encryptedMetaShare = encrypted
    return {
      encryptedMetaShare,
      key,
      messageId,
    }
  };

  static generateRequestCreds = () => {
    const key = BHROperations.generateKey( BHROperations.cipherSpec.keyLength )
    // const { otp, otpEncryptedData } = BHROperations.encryptViaOTP(key);
    return {
      key
    }
  };

  static uploadRequestedShare = async (
    encryptedKey: string,
    otp?: string,
    metaShare?: MetaShare,
    encryptedDynamicNonPMDD?: EncDynamicNonPMDD,
  ): Promise<{ success: boolean }> => {
    let key = encryptedKey // if no OTP is provided the key is non-OTP encrypted and can be used directly
    if ( otp ) {
      key = BHROperations.decryptViaOTP( encryptedKey, otp ).decryptedData
    }
    const { encryptedMetaShare, messageId } = BHROperations.encryptMetaShare(
      metaShare,
      key,
    )

    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'uploadShare', {
        HEXA_ID,
        share: encryptedMetaShare,
        messageId,
        encryptedDynamicNonPMDD,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { success } = res.data
    if ( !success ) {
      throw new Error( 'Unable to upload share' )
    }
    return {
      success
    }
  };

  static uploadNewShare = async (
    encryptedKey: string,
    otp?: string,
    metaShare?: MetaShare,
    encryptedDynamicNonPMDD?: EncDynamicNonPMDD,
  ): Promise<{ success: boolean }> => {
    let key = encryptedKey // if no OTP is provided the key is non-OTP encrypted and can be used directly
    if ( otp ) {
      key = BHROperations.decryptViaOTP( encryptedKey, otp ).decryptedData
    }
    const { encryptedMetaShare, messageId } = BHROperations.encryptMetaShare(
      metaShare,
      key,
    )

    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'uploadShare2', {
        HEXA_ID,
        share: encryptedMetaShare,
        messageId,
        encryptedDynamicNonPMDD,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { success } = res.data
    if ( !success ) {
      throw new Error( 'Unable to upload share' )
    }
    return {
      success
    }
  };

  static downloadAndValidateShare = async (
    encryptedKey: string,
    otp?: string,
    existingShares?: MetaShare[],
    walletId?: string,
  ): Promise<{
    metaShare: MetaShare;
    encryptedDynamicNonPMDD: EncDynamicNonPMDD;
  }> => {
    const {
      metaShare,
      encryptedDynamicNonPMDD,
    } = await BHROperations.downloadShare( encryptedKey, otp )

    if ( BHROperations.validateStorage( metaShare, existingShares, walletId ) ) {
      // const { deleted } = await BHROperations.affirmDecryption(messageId);
      // if (!deleted) {
      //   console.log('Unable to remove the share from the server');
      // }
      return {
        metaShare, encryptedDynamicNonPMDD
      }
    }
  };

  static recoverFromSecretsKeeper = (
    decryptedSecrets: string[],
    level?: number
  ): {
    mnemonic: string;
  } => {
    const levelThreshold = level == 2 ? BHROperations.thresholdLevel1 : level == 3 ? BHROperations.thresholdLevel2 : BHROperations.threshold
    if ( decryptedSecrets.length >= levelThreshold ) {
      const secretsArray = []
      for ( const secret of decryptedSecrets ) {
        if ( BHROperations.validShare( secret ) ) {
          secretsArray.push( secret.slice( 0, secret.length - 8 ) )
        } else {
          throw new Error( `Invalid checksum, share: ${secret} is corrupt` )
        }
      }

      const recoveredMnemonicHex = secrets.combine( secretsArray )
      return {
        mnemonic: BHROperations.hexToString( recoveredMnemonicHex )
      }
    } else {
      throw new Error(
        `supplied number of shares are less than the threshold (${levelThreshold})`,
      )
    }
  };

  static decryptViaOTP = (
    otpEncryptedData: string,
    otp: string,
  ): {
    decryptedData: any;
  } => {
    const key = BHROperations.getDerivedKey( otp )
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );
    const decipher = crypto.createDecipheriv(
      BHROperations.cipherSpec.algorithm,
      key,
      BHROperations.cipherSpec.iv,
    )

    try {
      let decrypted = decipher.update( otpEncryptedData, 'hex', 'utf8' )
      decrypted += decipher.final( 'utf8' )
      const decryptedData = JSON.parse( decrypted )
      return {
        decryptedData
      }
    } catch ( err ) {
      throw new Error(
        'An error occurred while decrypting the data: Invalid OTP/Tampered data',
      )
    }
  };

  static decryptMetaShare = (
    encryptedMetaShare: string,
    key: any,
  ): {
    decryptedMetaShare: MetaShare;
  } => {
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );
    const decipher = crypto.createDecipheriv(
      BHROperations.cipherSpec.algorithm,
      key,
      BHROperations.cipherSpec.iv,
    )

    try {
      let decrypted = decipher.update( encryptedMetaShare, 'hex', 'utf8' )
      decrypted += decipher.final( 'utf8' )
      const decryptedMetaShare: MetaShare = JSON.parse( decrypted )
      const { shareId, encryptedShare } = decryptedMetaShare
      const generatedShareId = crypto
        .createHash( 'sha256' )
        .update( JSON.stringify( encryptedShare.pmShare ) )
        .digest( 'hex' )

      if (
        shareId !== generatedShareId &&
        decryptedMetaShare.meta.validator !== 'HEXA'
      ) {
        throw new Error()
      }

      return {
        decryptedMetaShare
      }
    } catch ( err ) {
      throw new Error(
        'An error occurred while decrypting the share: Invalid Key/Tampered Share',
      )
    }
  };

  static getMessageId = ( key: string, length: number ): string => {
    const messageId = crypto.createHash( 'sha256' ).update( key ).digest( 'hex' )
    return messageId.slice( 0, length )
  };

  static recoverMetaShareFromQR = (
    qrData: string[],
  ): { metaShare: MetaShare } => {
    qrData.sort()
    let recoveredQRData: string
    recoveredQRData = ''
    for ( let itr = 0; itr < config.SSS_METASHARE_SPLITS; itr++ ) {
      const res = qrData[ itr ].slice( 3 )
      recoveredQRData = recoveredQRData + res
    }
    const metaShare = JSON.parse( recoveredQRData )
    return {
      metaShare
    }
  };

  static updateHealthKeeper = async (
    shares: [
      {
        walletId: string;
        shareId: string;
        reshareVersion: number;
        updatedAt: number;
        status?: string;
        name?: string;
      },
    ],
    isNeedToUpdateCurrentLevel?: boolean
  ): Promise<{
    updationInfo: Array<{
      walletId: string;
      shareId: string;
      updated: boolean;
      updatedAt?: number;
    }>;
    updationResult: Array<{
      levels: Array<{
        levelInfo: Array<{
          _id: string;
          shareType: string;
          updatedAt: number;
          status: string;
          shareId: string;
          reshareVersion: number;
        }>;
        _id?: string;
        level: number;
      }>
      currentLevel: number;
      walletId: string;
    }>
  }> => {
    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'updateSharesHealth2', {
        HEXA_ID,
        toUpdate: shares,
        isNeedToUpdateCurrentLevel: isNeedToUpdateCurrentLevel
      } )
      console.log( 'updateSharesHealth2 res', res )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }
    return res.data
  };

  static getShareId = ( encryptedSecret: string ): string =>
    crypto
      .createHash( 'sha256' )
      .update( JSON.stringify( encryptedSecret ) )
      .digest( 'hex' );

  static strechKey = ( password: string ): string => {
    return crypto
      .pbkdf2Sync(
        password,
        config.HEXA_ID,
        config.KEY_STRETCH_ITERATIONS,
        BHROperations.cipherSpec.keyLength / 2,
        'sha256',
      )
      .toString( 'hex' )
  };

  static encryptViaOTP = (
    data: any,
  ): {
    otpEncryptedData: string;
    otp: string;
  } => {
    const otp: string = BHROperations.generateOTP(
      parseInt( config.SSS_OTP_LENGTH, 10 ),
    )
    const key = BHROperations.getDerivedKey( otp )
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   this.cipherSpec.salt,
    //   this.cipherSpec.keyLength,
    // );

    const cipher = crypto.createCipheriv(
      BHROperations.cipherSpec.algorithm,
      key,
      BHROperations.cipherSpec.iv,
    )
    let encrypted = cipher.update( JSON.stringify( data ), 'utf8', 'hex' )
    encrypted += cipher.final( 'hex' )
    const encryptedData = encrypted
    return {
      otpEncryptedData: encryptedData,
      otp,
    }
  };

  static generateOTP = ( otpLength: number ): string =>
    BHROperations.generateRandomString( otpLength );

  static generateRandomString = ( length: number ): string => {
    let randomString = ''
    const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for ( let itr = 0; itr < length; itr++ ) {
      randomString += possibleChars.charAt(
        Math.floor( Math.random() * possibleChars.length ),
      )
    }
    return randomString
  };

  static getDerivedKey = ( psuedoKey: string ): string => {
    const hashRounds = 1048
    let key = psuedoKey
    for ( let itr = 0; itr < hashRounds; itr++ ) {
      const hash = crypto.createHash( 'sha512' )
      key = hash.update( key ).digest( 'hex' )
    }
    return key.slice( key.length - BHROperations.cipherSpec.keyLength )
  };

  static validShare = ( checksumedShare: string ): boolean => {
    const extractedChecksum = checksumedShare.slice( checksumedShare.length - 8 )
    const recoveredShare = checksumedShare.slice( 0, checksumedShare.length - 8 )
    const calculatedChecksum = BHROperations.calculateChecksum( recoveredShare )
    if ( calculatedChecksum !== extractedChecksum ) {
      return false
    }
    return true
  };

  static calculateChecksum = ( share: string ): string => {
    let temp = share
    for ( let itr = 0; itr < config.CHECKSUM_ITR; itr++ ) {
      const hash = crypto.createHash( 'sha512' )
      hash.update( temp )
      temp = hash.digest( 'hex' )
    }

    return temp.slice( 0, 8 )
  };

  static generateMessageID = (): string =>
    BHROperations.generateRandomString( config.MSG_ID_LENGTH );

  static generateLevel1Shares = ( primaryMnemonic: string, secondaryMnemonic: string ): {
    shares: string[]; smShares: string[];
  } => {
    // threshold shares(m) of total shares(n) will enable the recovery of the mnemonic
    const shares = secrets.share(
      BHROperations.stringToHex( primaryMnemonic ),
      config.SSS_LEVEL1_TOTAL,
      config.SSS_LEVEL1_THRESHOLD,
    )

    const smShares = secrets.share(
      BHROperations.stringToHex( secondaryMnemonic ),
      config.SSS_LEVEL1_TOTAL,
      config.SSS_LEVEL1_THRESHOLD,
    )

    for ( let itr = 0; itr < shares.length; itr++ ) {
      const checksum = BHROperations.calculateChecksum( shares[ itr ] )
      shares[ itr ] = shares[ itr ] + checksum
    }
    return {
      shares, smShares
    }
  };

  static generateLevel2Shares = ( keeperMetaShares: MetaShare[], answer: string, primaryMnemonic?: string ): {
    shares: string[];
    primaryMnemonic: string,
  } => {
    // threshold shares(m) of total shares(n) will enable the recovery of the mnemonic
    if( !primaryMnemonic ){
      const decryptedShareArr = []
      for ( let i = 0; i < keeperMetaShares.length; i++ ) {
        const element = keeperMetaShares[ i ]
        decryptedShareArr.push( element.encryptedShare.pmShare )
      }
      const { decryptedSecrets } = BHROperations.decryptSecrets( decryptedShareArr, answer )

      const secretsArr = [] // secrets w/o checksum
      for ( const secret of decryptedSecrets ) {
        secretsArr.push( secret.slice( 0, secret.length - 8 ) )
      }

      const recoveredMnemonicHex = secrets.combine( secretsArr )
      primaryMnemonic = BHROperations.hexToString( recoveredMnemonicHex )
    }

    const shares = secrets.share(
      BHROperations.stringToHex( primaryMnemonic ),
      config.SSS_LEVEL2_TOTAL,
      config.SSS_LEVEL2_THRESHOLD,
    )

    for ( let itr = 0; itr < shares.length; itr++ ) {
      const checksum = BHROperations.calculateChecksum( shares[ itr ] )
      shares[ itr ] = shares[ itr ] + checksum
    }

    return {
      shares,
      primaryMnemonic
    }
  };

  static prepareShareUploadablesKeeper = (
    mnemonic: string,
    shareIndex: number,
    keeperMetaShares: MetaShare[],
    contactName: string,
    dynamicNonPMDD?: MetaShare[],
  ): {
    otp: string;
    encryptedKey: string;
    encryptedMetaShare: string;
    messageId: string;
    encryptedDynamicNonPMDD: EncDynamicNonPMDD;
    updatedKeeperMetaShares: MetaShare[];
  } => {
    if ( !keeperMetaShares.length ) {
      throw new Error( 'Generate MetaShares prior uploading' )
    }

    keeperMetaShares[
      shareIndex
    ].meta.guardian = contactName.toLowerCase().trim()
    const metaShare: MetaShare = keeperMetaShares[ shareIndex ]
    const { encryptedMetaShare, key, messageId } = BHROperations.encryptMetaShare(
      metaShare,
    )

    let encryptedDynamicNonPMDD: EncDynamicNonPMDD
    if ( dynamicNonPMDD ) {
      encryptedDynamicNonPMDD = {
        encryptedDynamicNonPMDD: BHROperations.encryptDynamicNonPMDD( mnemonic, dynamicNonPMDD )
          .encryptedDynamicNonPMDD,
        updatedAt: Date.now(),
      }
    }

    const { otp, otpEncryptedData } = BHROperations.encryptViaOTP( key )
    return {
      otp,
      encryptedKey: otpEncryptedData,
      encryptedMetaShare,
      messageId,
      encryptedDynamicNonPMDD,
      updatedKeeperMetaShares: keeperMetaShares,
    }
  };

  static initializeHealthKeeper = async ( walletId: string ): Promise<{
    success: boolean;
    levelInfo: any[];
  }> => {
    // TODO: do the following check prior to calling the method
    // if ( this.healthCheckInitializedKeeper )
    //   throw new Error( 'Health Check is already initialized.' )

    const randomIdForSecurityQ = generateRandomString( 8 )
    const randomIdForCloud = generateRandomString( 8 )
    const levelInfo = [
      {
        shareType: 'cloud',
        updatedAt: 0,
        status: 'notAccessible',
        shareId: randomIdForCloud,
        reshareVersion: 0,
      },
      {
        shareType: 'securityQuestion',
        updatedAt: moment( new Date() ).valueOf(),
        status: 'accessible',
        shareId: randomIdForSecurityQ,
        reshareVersion: 0,
      },
    ]

    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'sharesHealthCheckInit2', {
        HEXA_ID,
        walletID: walletId,
        levelInfo,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    //   if( res.data.initSuccessful ){
    //     this.healthCheckInitializedKeeper = true
    //   }

    return {
      success: res.data.initSuccessful,
      levelInfo: levelInfo,
    }
  };

  static checkHealth = async (
    walletId: string,
    keeperMetaShares: MetaShare[],
  ): Promise<{
    shareGuardianMapping: {
      [index: number]: { shareId: string; updatedAt: number; guardian: string };
    };
  }> => {
    let res: AxiosResponse

    if ( !keeperMetaShares.length )
      throw new Error( 'Can not initialize health check; missing MetaShares' )

    const metaShares = keeperMetaShares.slice( 0, 3 )
    try {
      res = await BH_AXIOS.post( 'checkSharesHealth2', {
        HEXA_ID,
        walletID: walletId,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const updates: Array<{ shareId: string; updatedAt: number }> =
      res.data.lastUpdateds

    const shareGuardianMapping = {
    }
    for ( const { shareId, updatedAt } of updates ) {
      for ( let index = 0; index < metaShares.length; index++ ) {
        if ( metaShares[ index ] && metaShares[ index ].shareId === shareId ) {
          shareGuardianMapping[ index ] = {
            shareId,
            updatedAt,
            guardian: metaShares[ index ].meta.guardian,
          }
        }
      }
    }

    return {
      shareGuardianMapping,
    }
  };

  static checkHealthKeeper = async ( walletId: string ): Promise<{
    data: {};
  }> => {
    let response = {
    }
    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'checkSharesHealth2', {
        HEXA_ID,
        walletID: walletId,
      } )
      response = res
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
      response = err
    }
    if( res.data ){
      return {
        data: res.data
      }
    }
    else return {
      data: response
    }

  };

  static updateHealthLevel2 = async ( walletId: string, keeperMetaShares: MetaShare[], SecurityQuestionHealth, _level ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const levelInfo = []
    if ( keeperMetaShares.length ) {
      levelInfo[ 0 ] = {
        shareType: 'cloud',
        updatedAt: 0,
        status: 'notAccessible',
        shareId: keeperMetaShares[ 0 ].shareId,
        reshareVersion: 0,
      }
      levelInfo[ 1 ] = SecurityQuestionHealth
      for ( let i = 1; i < keeperMetaShares.length; i++ ) {
        const element = keeperMetaShares[ i ]
        let shareType = ''
        if ( i == 0 ) shareType = 'cloud'
        if ( i == 1 ) shareType = 'primaryKeeper'
        const obj = {
          shareType: shareType,
          updatedAt: 0,
          status: 'notAccessible',
          shareId: element.shareId,
          reshareVersion: 0,
        }
        levelInfo.push( obj )
      }
      let res: AxiosResponse
      try {
        res = await BH_AXIOS.post( 'updateHealthLevel2', {
          HEXA_ID,
          walletID: walletId,
          level: _level,
          levelInfo,
        } )
        console.log( 'updateHealthLevel2 res', res )
      } catch ( err ) {
        console.log( 'updateHealthLevel2 err', err )
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      return {
        success: res.data.updateSuccessful,
        message: '',
      }
    }
    return {
      success: false,
      message: 'Something went wrong!',
    }
  };

  static initLevels = async ( walletId: string, keeperMetaShares: MetaShare[], SecurityQuestionHealth, _level ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const levelInfo = []
    if ( keeperMetaShares.length ) {
      levelInfo[ 0 ] = {
        shareType: 'cloud',
        updatedAt: 0,
        status: 'notAccessible',
        shareId: keeperMetaShares[ 0 ].shareId,
        reshareVersion: 0,
      }
      levelInfo[ 1 ] = SecurityQuestionHealth
      for ( let i = 1; i < keeperMetaShares.length; i++ ) {
        const element = keeperMetaShares[ i ]
        let shareType = ''
        if ( i == 0 ) shareType = 'cloud'
        if ( i == 1 ) shareType = 'primaryKeeper'
        const obj = {
          shareType: shareType,
          updatedAt: 0,
          status: 'notAccessible',
          shareId: element.shareId,
          reshareVersion: 0,
        }
        levelInfo.push( obj )
      }
      let res: AxiosResponse
      try {
        res = await BH_AXIOS.post( 'initLevels', {
          HEXA_ID,
          walletID: walletId,
          level: _level,
          levelInfo,
        } )
        console.log( 'initLevels res', res )
      } catch ( err ) {
        console.log( 'initLevels err', err )
        if ( err.response ) throw new Error( err.response.data.err )
        if ( err.code ) throw new Error( err.code )
      }
      //   if( res.data.updateSuccessful ){
      //     this.healthCheckInitializedKeeper = true
      //   }
      return {
        success: res.data.updateSuccessful,
        message: '',
      }
    }
    return {
      success: false,
      message: 'Something went wrong!',
    }
  };

  static createMetaShares = (
    walletId: string,
    encryptedPrimarySecrets: string[],
    tag: string,
    questionId: string,
    version?: string,
  ): {
    metaShares: MetaShare[];
  } => {
    if ( !encryptedPrimarySecrets.length ) {
      throw new Error( 'Can not create MetaShares; missing encryptedPrimarySecrets' )
    }

    const timestamp = new Date().toLocaleString( undefined, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    } )

    let keeperMetaShares: MetaShare[] = []
    let index = 0
    for ( const encryptedSecret of encryptedPrimarySecrets ) {
      let metaShare: MetaShare
      if ( index === 0 ) {
        metaShare = {
          encryptedSecret,
          shareId: BHROperations.getShareId( encryptedSecret ),
          meta: {
            version: version ? version : '0',
            validator: 'HEXA',
            index,
            walletId,
            tag,
            timestamp,
            reshareVersion: 0,
            questionId
          },
        }
      } else {
        metaShare = {
          encryptedSecret,
          shareId: BHROperations.getShareId( encryptedSecret ),
          meta: {
            version: version ? version : '0',
            validator: 'HEXA',
            index,
            walletId,
            tag,
            timestamp,
            reshareVersion: 0,
            questionId
          },
        }
      }

      keeperMetaShares.push( metaShare )
      index++
    }

    if ( keeperMetaShares.length !== config.SSS_LEVEL1_TOTAL ) {
      keeperMetaShares = []
      throw new Error( 'Something went wrong while generating metaShares' )
    }

    return {
      metaShares: keeperMetaShares
    }
  };

  static createMetaSharesKeeper = (
    walletId: string,
    encryptedPrimarySecrets: string[],
    encryptedSecondarySecrets: string[],
    exisitngKeeperMetaShares: MetaShare[],
    answer: string,
    bhXpub: string,
    tag: string,
    questionId: string,
    version: string,
    question: string,
    level: number,
  ): {
    metaShares: MetaShare[];
    oldMetaShares: MetaShare[];
  } => {
    if ( !encryptedPrimarySecrets.length ) throw new Error( 'Can not create MetaShares; missing encryptedPrimarySecrets' )

    const timestamp = new Date().toLocaleString( undefined, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    } )

    const { encryptedData: encryptedXpub } = BHROperations.encryptWithAnswer( bhXpub, answer )

    let keeperMetaShares = []
    let metaShare: MetaShare
    for ( let index = 0; index < encryptedPrimarySecrets.length; index++ ) {
      const element = encryptedPrimarySecrets[ index ]
      metaShare = {
        shareId: BHROperations.getShareId( element ),
        encryptedShare: {
          pmShare: element,
          smShare: encryptedSecondarySecrets.length ? encryptedSecondarySecrets[ 1 ] : '',
          bhXpub: encryptedXpub
        },
        meta: {
          version: version ? version : '0',
          validator: 'HEXA',
          index,
          walletId: walletId,
          tag,
          timestamp,
          reshareVersion: 0,
          questionId,
          question,
          scheme: level == 2 ? '2of3' : '3of5',
        },
      }
      keeperMetaShares.push( metaShare )
    }

    if ( level == 2 && keeperMetaShares.length !== config.SSS_LEVEL1_TOTAL ) {
      keeperMetaShares = []
      throw new Error( 'Something went wrong while generating metaShares' )
    }

    if ( level == 3 && keeperMetaShares.length !== config.SSS_LEVEL2_TOTAL ) {
      keeperMetaShares = []
      throw new Error( 'Something went wrong while generating metaShares' )
    }

    return {
      metaShares: keeperMetaShares,
      oldMetaShares: exisitngKeeperMetaShares,
    }
  };

  static reshareMetaShareKeeper = ( index: number, keeperMetaShares: MetaShare[] ) => {
    keeperMetaShares[ index ].meta.reshareVersion =
    keeperMetaShares[ index ].meta.reshareVersion + 1
    return keeperMetaShares[ index ]
  };

  static createQR = ( index: number, keeperMetaShares: MetaShare[], keeperPDFHealth ): { qrData: string[], keeperPDFHealth } => {
    const splits: number = config.SSS_METASHARE_SPLITS
    const metaString = JSON.stringify( keeperMetaShares[ index ] )
    const slice = Math.trunc( metaString.length / splits )
    const qrData: string[] = []

    let start = 0
    let end = slice
    for ( let itr = 0; itr < splits; itr++ ) {
      if ( itr !== splits - 1 ) {
        qrData[ itr ] = metaString.slice( start, end )
      } else {
        qrData[ itr ] = metaString.slice( start )
      }
      start = end
      end = end + slice
      if ( index === 3 ) {
        qrData[ itr ] = 'e0' + ( itr + 1 ) + qrData[ itr ]
      } else if ( index === 4 ) {
        qrData[ itr ] = 'c0' + ( itr + 1 ) + qrData[ itr ]
      }
      if ( itr === 0 ) {
        keeperPDFHealth = {
          ...keeperPDFHealth,
          [ index ]: {
            shareId: keeperMetaShares[ index ].shareId,
            qrData: qrData[ itr ],
          },
        }
      }
    }
    return {
      qrData,
      keeperPDFHealth
    }
  };

  static encryptSecrets = (
    secretsToEncrypt: string[],
    answer: string,
    areSecondaryShares?: boolean,
  ): {
        encryptedSecondarySecrets: any[];
        encryptedPrimarySecrets?: undefined;
        keeperShareIDs?: undefined;
    } | {
        encryptedPrimarySecrets: any[];
        keeperShareIDs: any[];
        encryptedSecondarySecrets?: undefined;
    } => {
    const key = BHROperations.getDerivedKey( answer )
    const shareIDs = []
    const encryptedSecretsArr = []
    for ( const secret of secretsToEncrypt ) {
      const cipher = crypto.createCipheriv(
        BHROperations.cipherSpec.algorithm,
        key,
        BHROperations.cipherSpec.iv,
      )
      let encrypted = cipher.update( secret, 'utf8', 'hex' )
      encrypted += cipher.final( 'hex' )
      encryptedSecretsArr.push( encrypted )
      shareIDs.push( BHROperations.getShareId( encrypted ) )
    }
    if( areSecondaryShares ){
      return {
        encryptedSecondarySecrets: encryptedSecretsArr,
      }
    } else{
      return {
        encryptedPrimarySecrets: encryptedSecretsArr,
        keeperShareIDs: shareIDs
      }
    }
  };

  static encryptShares = (
    primarySecrets: string[],
    answer: string,
    secondarySecrets?: string[],
  ): {
    encryptedPrimarySecrets: string[];
    keeperShareIDs: string[];
    encryptedSecondarySecrets: string[];
  } => {
    const key = BHROperations.getDerivedKey( answer )
    const shareIDs = []
    const encryptedPrimarySecrets = []
    for ( const secret of primarySecrets ) {
      const cipher = crypto.createCipheriv(
        BHROperations.cipherSpec.algorithm,
        key,
        BHROperations.cipherSpec.iv,
      )
      let encrypted = cipher.update( secret, 'utf8', 'hex' )
      encrypted += cipher.final( 'hex' )
      encryptedPrimarySecrets.push( encrypted )
      shareIDs.push( BHROperations.getShareId( encrypted ) )
    }

    const encryptedSecondarySecrets = []
    if( secondarySecrets ){
      for ( const secret of secondarySecrets ) {
        const cipher = crypto.createCipheriv(
          BHROperations.cipherSpec.algorithm,
          key,
          BHROperations.cipherSpec.iv,
        )
        let encrypted = cipher.update( secret, 'utf8', 'hex' )
        encrypted += cipher.final( 'hex' )
        encryptedSecondarySecrets.push( encrypted )
      }
    }

    return {
      encryptedPrimarySecrets,
      keeperShareIDs: shareIDs,
      encryptedSecondarySecrets,
    }
  };

  static updateGuardianInMetaShare = (
    keeperMetaShares: MetaShare[],
    shareId: string,
    name: string,
  ) : { updatedKeeperMetaShares: MetaShare[] } => {
    for ( let i = 0; i < keeperMetaShares.length; i++ ) {
      const element = keeperMetaShares[ i ]
      if( element.shareId == shareId ){
        keeperMetaShares[ i ].meta.guardian = name.toLowerCase().trim()
      }
    }
    return {
      updatedKeeperMetaShares: keeperMetaShares
    }
  }

  static uploadPDFPrimaryShare = async (
    share: string,
    messageId?: string,
  ): Promise<{success : Boolean}> => {
    console.log( 'uploadPDFPrimaryShare messageId', messageId )
    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'uploadPDFShare', {
        HEXA_ID,
        share,
        messageId
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }
    return res.data
  };

   static uploadPDFSecondaryShare = async (
     share: string,
     messageId?: string,
   ): Promise<{success : Boolean}> => {
     console.log( 'uploadPDFSecondaryShare messageId', messageId )
     let res: AxiosResponse
     try {
       res = await BH_AXIOS.post( 'uploadPDFSecondaryShare', {
         HEXA_ID,
         share,
         messageId
       } )
     } catch ( err ) {
       if ( err.response ) throw new Error( err.response.data.err )
       if ( err.code ) throw new Error( err.code )
     }
     console.log( 'uploadPDFSecondaryShare res', res )
     return res.data
   };

  static removeUnwantedUnderCustody = async (
    metaShares: MetaShare[],
  ): Promise<{
    updationInfo: Array<{
      walletId: string;
      shareId: string;
      updated: boolean;
      updatedAt?: number;
      encryptedDynamicNonPMDD?: EncDynamicNonPMDD;
      err?: string;
    }>;
  }> => {
    if ( metaShares.length === 0 ) {
      throw new Error( 'No metaShare supplied' )
    }

    const toUpdate: Array<{
      walletId: string;
      shareId: string;
      reshareVersion: number;
    }> = []
    for ( const metaShare of metaShares ) {
      toUpdate.push( {
        walletId: metaShare.meta.walletId,
        shareId: metaShare.shareId,
        reshareVersion: metaShare.meta.reshareVersion,
      } )
    }

    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'removeUnwantedUnderCustody', {
        HEXA_ID,
        toUpdate,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { updationInfo } = res.data
    return {
      updationInfo
    }
  };

  static generateSecondaryShares = ( secondaryMnemonic: string ): {
    secondaryShares: string[];
  } => {
    // threshold shares(m) of total shares(n) will enable the recovery of the mnemonic
    const shares = secrets.share(
      BHROperations.stringToHex( secondaryMnemonic.trim() ),
      config.SSS_LEVEL1_TOTAL,
      config.SSS_LEVEL1_THRESHOLD,
    )

    for ( let itr = 0; itr < shares.length; itr++ ) {
      const checksum = BHROperations.calculateChecksum( shares[ itr ] )
      shares[ itr ] = shares[ itr ] + checksum
    }

    return {
      secondaryShares: shares
    }
  };

  static createSecondaryMetaSharesKeeper = (
    walletId: string,
    encryptedSecondarySecrets: string[],
    tag: string,
    questionId: string,
    version?: string,
    question?: string,
  ): {
    secondaryMetaShares: MetaShare[];
  } => {
    if ( !encryptedSecondarySecrets.length ) throw new Error( 'Can not create secondary MetaShares; missing encryptedSecondarySecrets' )

    const timestamp = new Date().toLocaleString( undefined, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    } )

    let index = 0
    const secondaryMetaShares: MetaShare[] = []
    let metaShare: MetaShare
    for ( const encryptedSecret of encryptedSecondarySecrets ) {
      metaShare = {
        encryptedSecret,
        shareId: BHROperations.getShareId( encryptedSecret ),
        meta: {
          version: version ? version : '0',
          validator: 'HEXA',
          index,
          walletId,
          tag,
          timestamp,
          reshareVersion: 0,
          questionId,
          question
        },
      }
      secondaryMetaShares.push( metaShare )
      index++
    }

    return {
      secondaryMetaShares
    }
  };

  static updateKeeperInfoToMetaShare = ( keeperMetaShares: MetaShare[], oldKeeperMetaShares: MetaShare[], keeperInfo: any, answer: string ): { keeperMetaShares: MetaShare[], oldKeeperMetaShares: MetaShare[]; } => {
    const { encryptedData } = BHROperations.encryptWithAnswer( JSON.stringify( keeperInfo ), answer )
    for ( let i = 0; i < keeperMetaShares.length; i++ ) {
      keeperMetaShares[ i ].meta.encryptedKeeperInfo = encryptedData
    }
    if( oldKeeperMetaShares && oldKeeperMetaShares.length ){
      for ( let i = 0; i < oldKeeperMetaShares.length; i++ ) {
        oldKeeperMetaShares[ i ].meta.encryptedKeeperInfo = encryptedData
      }
    }
    return {
      keeperMetaShares, oldKeeperMetaShares,
    }
  };

  static getSecondaryMnemonic = ( secretsArray: string[], answer: string ) => {
    const decryptedShareArr = []
    for ( let i = 0; i < secretsArray.length; i++ ) {
      const element = secretsArray[ i ]
      decryptedShareArr.push( element )
    }
    const { decryptedSecrets } = BHROperations.decryptSecrets( decryptedShareArr, answer )
    const recoveredMnemonicHex = secrets.combine( decryptedSecrets )
    return {
      mnemonic: BHROperations.hexToString( recoveredMnemonicHex )
    }
  }

  static downloadSMPDFShare = async ( messageId: string, key: string ): Promise<
    | {
        status: number;
        metaShare: MetaShare;
      }
    | {
        status: number;
        metaShare: MetaShare;
      }
  > => {
    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'downloadPDFSecondaryShare', {
        HEXA_ID,
        messageId,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }
    const { decryptedMetaShare } = BHROperations.decryptMetaShare( res.data.share, key )
    return {
      status: 200, metaShare: decryptedMetaShare
    }
  };
}
