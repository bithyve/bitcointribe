import { AxiosResponse } from 'axios'
import * as bip39 from 'bip39'
import crypto from 'crypto'
import secrets from 'secrets.js-grempe'
import config from '../HexaConfig'
import {
  EncDynamicNonPMDD,
  MetaShare,
  NewWalletImage
} from './Interface'

import { BH_AXIOS } from '../../services/api'
import Relay from './Relay'
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

  static generateLevel1Shares = ( primaryMnemonic: string ): {
    shares: string[];
  } => {
    // threshold shares(m) of total shares(n) will enable the recovery of the mnemonic
    const shares = secrets.share(
      BHROperations.stringToHex( primaryMnemonic ),
      config.SSS_LEVEL1_TOTAL,
      config.SSS_LEVEL1_THRESHOLD,
    )

    for ( let itr = 0; itr < shares.length; itr++ ) {
      const checksum = BHROperations.calculateChecksum( shares[ itr ] )
      shares[ itr ] = shares[ itr ] + checksum
    }
    return {
      shares
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
      } catch ( err ) {
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

  static createMetaSharesKeeper = (
    walletId: string,
    encryptedPrimarySecrets: string[],
    exisitngKeeperMetaShares: MetaShare[],
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

    let keeperMetaShares = []
    let metaShare: MetaShare
    for ( let index = 0; index < encryptedPrimarySecrets.length; index++ ) {
      const element = encryptedPrimarySecrets[ index ]
      metaShare = {
        shareId: BHROperations.getShareId( element ),
        encryptedShare: {
          pmShare: element,
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
  ): {
    encryptedPrimarySecrets: string[];
    keeperShareIDs: string[];
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
    return {
      encryptedPrimarySecrets,
      keeperShareIDs: shareIDs,
    }
  };

  public static getMnemonics = ( secretsArray: string[], answer?: string, isPrimary?: boolean ) => {
    const shareArr = isPrimary ? [] : secretsArray
    if( isPrimary ){
      const { decryptedSecrets } = BHROperations.decryptSecrets( secretsArray, answer )
      for ( const secret of decryptedSecrets ) {
        if ( BHROperations.validShare( secret ) ) {
          shareArr.push( secret.slice( 0, secret.length - 8 ) )
        } else {
          throw new Error( `Invalid checksum, share: ${secret} is corrupt` )
        }
      }
    }
    const recoveredMnemonicHex = secrets.combine( shareArr )
    const hex = BHROperations.hexToString( recoveredMnemonicHex )
    return {
      mnemonic: hex
    }
  }

  public static fetchWalletImage = async ( walletId ): Promise<
  | {
      status: number;
      data: {
        walletImage: NewWalletImage;
      };
      err?: undefined;
      message?: undefined;
    }
  | {
      status: number;
      err: any;
      message: string;
      data?: undefined;
    }
> => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await Relay.fetchWalletImage( walletId ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch Wallet Image',
      }
    }
  };

  public static encryptMetaSharesWithNewAnswer = async ( metaShares, oldMetaShares, oldAnswer, newAnswer, security ) => {
    try {
      const { questionId, question, answer } = security
      const updatedMetaShares: MetaShare[] = [ ]
      const updatedOldMetaShares: MetaShare[] = [ ]
      for ( let i = 0; i < metaShares.length; i++ ) {
        const element: MetaShare = metaShares[ i ]
        const decryptedData = BHROperations.decryptWithAnswer( element.encryptedShare.pmShare, oldAnswer )
        const encryptedData = BHROperations.encryptWithAnswer( decryptedData.decryptedData, newAnswer )
        updatedMetaShares[ i ] = {
          shareId: element.shareId,
          meta: {
            ...element.meta,
            questionId,
            question,
            index: i,
            reshareVersion: element.meta.reshareVersion,
            scheme: element.meta.scheme,
            timestamp: element.meta.timestamp,
            validator: element.meta.validator,
            version: element.meta.version,
          },
          encryptedShare: {
            pmShare: encryptedData.encryptedData
          }
        }
      }
      for ( let i = 0; i < oldMetaShares.length; i++ ) {
        const element = oldMetaShares[ i ]
        const decryptedData = BHROperations.decryptWithAnswer( element.encryptedShare.pmShare, oldAnswer )
        const encryptedData = BHROperations.encryptWithAnswer( decryptedData.decryptedData, newAnswer )
        updatedOldMetaShares[ i ] = {
          shareId: element.shareId,
          meta: {
            ...element.meta,
            questionId,
            question,
            index: i,
            reshareVersion: element.meta.reshareVersion,
            scheme: element.meta.scheme,
            timestamp: element.meta.timestamp,
            validator: element.meta.validator,
            version: element.meta.version,
          },
          encryptedShare: {
            pmShare: encryptedData.encryptedData
          }
        }
      }
      return {
        updatedMetaShares, updatedOldMetaShares
      }
    } catch ( err ) {
      return {
        updatedMetaShares:metaShares, updatedOldMetaShares: oldMetaShares
      }
    }
  };
}
