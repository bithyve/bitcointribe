import axios, { AxiosResponse } from "axios";
import bip39 from "bip39";
import crypto from "crypto";
import secrets from "secrets.js-grempe";
import config from "../../Config";



export default class SSS {
  private mnemonic: string;
  private encryptedShares;
  private static threshold: number;
  private static cipherSpec = {
    algorithm: "aes-192-cbc",
    salt: "bithyeSalt", // NOTE: The salt should be as unique as possible. It is recommended that a salt is random and at least 16 bytes long
    keyLength: 24,
    iv: Buffer.alloc( 16, 0 )
  };

  constructor ( mnemonic: string ) {
    if ( bip39.validateMnemonic( mnemonic ) ) {
      this.mnemonic = mnemonic;
    } else {
      throw new Error( "Invalid Mnemonic" );
    }
    this.encryptedShares = [];
  }

  public stringToHex = ( str: string ) => secrets.str2hex( str );

  public static hexToString = hex => secrets.hex2str( hex );

  public getShares = () => this.encryptedShares;

  public generateRandomString = length => {
    let randomString: string = "";
    const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for ( let itr = 0; itr < length; itr++ ) {
      randomString += possibleChars.charAt(
        Math.floor( Math.random() * possibleChars.length )
      );
    }
    return randomString;
  };
  public generateOTP = ( otpLength: number ) =>
    this.generateRandomString( otpLength );

  public generateMessageID = () =>
    this.generateRandomString( config.MSG_ID_LENGTH );

  public generateShares = () => {
    // threshold shares(m) of total shares(n) will enable the recovery of the mnemonic
    SSS.threshold = config.SSS_THRESHOLD;
    const shares = secrets.share(
      this.stringToHex( this.mnemonic ),
      config.SSS_TOTAL,
      SSS.threshold
    );

    for ( let itr = 0; itr < shares.length; itr++ ) {
      const checksum = SSS.calculateChecksum( shares[ itr ] );
      shares[ itr ] = shares[ itr ] + checksum;
    }

    return shares;
  };

  public static recoverFromShares = decryptedShares => {
    if ( decryptedShares.length >= SSS.threshold ) {
      try {
        const shares = [];
        for ( const share of decryptedShares ) {
          if ( SSS.validShare( share ) ) {
            shares.push( share.slice( 0, share.length - 4 ) );
          } else {
            throw new Error( `Invalid checksum, share: ${ share } is corrupt` );
          }
        }

        const recoveredMnemonicHex = secrets.combine( shares );
        return SSS.hexToString( recoveredMnemonicHex );
      } catch ( err ) {
        console.log( err );
      }
    } else {
      throw new Error(
        `supplied number of shares are less than the threshold (${
        SSS.threshold
        })`
      );
    }
  };

  public uploadShare = async ( otpEncryptedShare, messageId ) => {
    let res: AxiosResponse;
    try {
      res = await axios.post( config.SERVER + "/uploadShare", {
        share: otpEncryptedShare,
        messageId
      } );

      const { success } = res.data;

      if ( !success ) {
        return { status: 400, err: res.data.err };
      }
      return { status: res.status, success, messageId };
    } catch ( err ) {
      console.log( err );
    }
  };

  public static downloadShare = async ( messageId: string ) => {
    let res: AxiosResponse;
    try {
      res = await axios.post( config.SERVER + "/downloadShare", {
        messageId
      } );

      if ( !res.data.share ) {
        return { status: 400, err: res.data.err };
      }

      return { status: res.status, otpEncryptedShare: res.data.share };
    } catch ( err ) {
      console.log( err );
    }
  };

  public encryptViaOTP = ( metaShare: string ) => {
    const otp: string = this.generateOTP( parseInt( config.SSS_OTP_LENGTH, 10 ) );
    const key = SSS.generateKey( otp );
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

    let encrypted = cipher.update( metaShare, "utf8", "hex" );
    encrypted += cipher.final( "hex" );
    const otpEncryptedMetaShare = encrypted;
    return {
      share: otpEncryptedMetaShare,
      otp
    };
  };

  public static decryptViaOTP = ( otpEncryptedShare: string, otp: string ) => {
    console.log( otpEncryptedShare )
    const key = SSS.generateKey( otp );
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

    try {
      let decrypted = decipher.update( otpEncryptedShare, "hex", "utf8" );
      decrypted += decipher.final( "utf8" );
      console.log( { decrypted } )
      const decryptedMetaShare = JSON.parse( decrypted );
      console.log( { decryptedMetaShare } )
      if ( decryptedMetaShare.meta.validator !== "HEXA" ) {
        throw new Error(
          "Either the share is corrupt or the decryption OTP is wrong."
        );
      }

      return decryptedMetaShare;
    } catch ( err ) {
      console.log( err.message )
      throw new Error(
        "An error occured while decrypting the share: Invalid OTP"
      );
    }
  };

  public static validateDecryption = (
    decryptedShare,
    walletId?,
    existingShares: any[] = []
  ) => {
    if ( walletId && decryptedShare.meta.walletId === walletId ) {
      throw new Error( "You're not allowed to be your own trusted party" );
    }

    if ( existingShares.length ) {
      for ( const share of existingShares ) {
        if ( share.meta.walletID === decryptedShare.meta.walletID ) {
          throw new Error(
            "You cannot store multiple shares from a single user."
          );
        }
      }
    }
    return true;
  };

  public getShareId = ( encryptedShare: string ) => {
    return crypto
      .createHash( "sha256" )
      .update( encryptedShare )
      .digest( "hex" );
  };

  public initializeHealthcheck = async encryptedShares => {
    const shareIDs: string[] = [];
    for ( const encryptedShare of encryptedShares ) {
      shareIDs.push( this.getShareId( encryptedShare ) );
    }

    try {
      const res = await axios.post( config.SERVER + "/sharesHealthCheckInit", {
        walletID: this.getWalletId(),
        shareIDs
      } );
      return {
        status: res.status,
        success: res.data.initSuccessful
      };
    } catch ( err ) {
      return {
        status: 400,
        errorMessage: "Unable to initialize healthCheck"
      };
    }
  };

  public updateHealth = async ( walletID: string, encryptedShare: string ) => {
    console.log( "Updating" );
    try {
      const res = await axios.post( config.SERVER + "/updateShareHealth", {
        walletID,
        shareID: this.getShareId( encryptedShare )
      } );
      const { updated, nonPMDD } = res.data;
      console.log( { updated } );

      if ( updated ) {
        if ( nonPMDD ) {
          return {
            status: res.status,
            updated,
            data: nonPMDD
          };
        }
        return {
          status: res.status,
          updated
        };
      } else {
        throw new Error();
      }
    } catch ( err ) {
      console.log( { err: err.response.data } );
      return {
        status: 400,
        errorMessage: "Unable to update the health for the supplied share"
      };
    }
  };

  public checkHealth = async ( encryptedShares: string[] ) => {
    const shareIDs: string[] = [];
    encryptedShares.forEach( encShare =>
      shareIDs.push( this.getShareId( encShare ) )
    );

    try {
      const res = await axios.post( config.SERVER + "/checkSharesHealth", {
        walletID: this.getWalletId(),
        shareIDs
      } );
      const { lastUpdateds } = res.data;

      return {
        status: res.status,
        lastUpdateds
      };
    } catch ( err ) {
      return {
        status: 400,
        errorMessage: err.response.data
      };
    }
  };

  public encryptNonPMDD = async nonPMDD => {
    const intermediateKey = SSS.generateKey(
      bip39.mnemonicToSeed( this.mnemonic ).toString( "hex" )
    );
    const key = crypto.scryptSync(
      intermediateKey,
      SSS.cipherSpec.salt,
      SSS.cipherSpec.keyLength
    );

    const cipher = crypto.createCipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv
    );
    let encrypted = cipher.update( JSON.stringify( nonPMDD ), "utf8", "hex" );
    encrypted += cipher.final( "hex" );

    return encrypted;
  };

  public decryptNonPMDD = async ( encryptedNonPMDD: string ) => {
    const intermediateKey = SSS.generateKey(
      bip39.mnemonicToSeed( this.mnemonic ).toString( "hex" )
    );

    const key = crypto.scryptSync(
      intermediateKey,
      SSS.cipherSpec.salt,
      SSS.cipherSpec.keyLength
    );

    const decipher = crypto.createDecipheriv(
      SSS.cipherSpec.algorithm,
      key,
      SSS.cipherSpec.iv
    );
    let decrypted = decipher.update( encryptedNonPMDD, "hex", "utf8" );
    decrypted += decipher.final( "utf8" );

    const decryptedNonPMDD = JSON.parse( decrypted );
    if ( decryptedNonPMDD.meta.validator !== "HEXA" ) {
      throw new Error( "Unable to decrypt the nonPMDD, it might be corrupt" );
    }
    return decryptedNonPMDD;
  };

  public updateNonPMDD = async ( encryptedNonPMDD: string ) => {
    try {
      const res = await axios.post( config.SERVER + "/updateNonPMDD", {
        walletID: this.getWalletId(),
        nonPMDD: encryptedNonPMDD
      } );
      const { updated } = res.data;
      if ( updated ) {
        return {
          status: 200,
          updated
        };
      } else {
        throw new Error();
      }
    } catch ( err ) {
      return {
        status: 400,
        errorMessage: `An error occured while updating the NonPMDD: ${ err }`
      };
    }
  };

  public fetchNonPMDD = async ( walletID: string ) => {
    try {
      const res = await axios.post( config.SERVER + "/fetchNonPMDD", {
        walletID
      } );
      const { nonPMDD } = res.data;
      if ( nonPMDD ) {
        return {
          status: 200,
          nonPMDD
        };
      } else {
        throw new Error();
      }
    } catch ( err ) {
      return {
        status: 400,
        errorMessage: `An error occured while fetching the NonPMDD: ${ err }`
      };
    }
  };

  public addMeta = ( encryptedShare: string, tag: string ) => {
    const walletId = this.getWalletId();
    const timeStamp = new Date().toLocaleString( undefined, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    } );

    const share = {
      encryptedShare,
      meta: {
        validator: "HEXA",
        walletId,
        tag,
        timeStamp,
        info: `${ tag }'s sss share`
      }
    };

    return JSON.stringify( share );
  };

  public encryptShares = ( shares, answers ) => {
    const key = SSS.generateKey( answers.join( "" ) );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   SSS.cipherSpec.salt,
    //   SSS.cipherSpec.keyLength,
    // );

    for ( const share of shares ) {
      const cipher = crypto.createCipheriv(
        SSS.cipherSpec.algorithm,
        key,
        SSS.cipherSpec.iv
      );
      let encrypted = cipher.update( share, "utf8", "hex" );
      encrypted += cipher.final( "hex" );
      this.encryptedShares.push( encrypted );
    }
    return this.encryptedShares;
  };

  public static decryptShares = ( shares, answers ) => {
    const key = SSS.generateKey( answers.join( "" ) );
    // const key = crypto.scryptSync(
    //   intermediateKey,
    //   SSS.cipherSpec.salt,
    //   SSS.cipherSpec.keyLength,
    // );

    const decryptedShares = [];
    for ( const share of shares ) {
      const decipher = crypto.createDecipheriv(
        SSS.cipherSpec.algorithm,
        key,
        SSS.cipherSpec.iv
      );
      let decrypted = decipher.update( share, "hex", "utf8" );
      decrypted += decipher.final( "utf8" );
      decryptedShares.push( decrypted );
    }
    return decryptedShares;
  };

  public getWalletId = () =>
    crypto
      .createHash( "sha512" )
      .update( bip39.mnemonicToSeed( this.mnemonic ) )
      .digest( "hex" );

  private static validShare = checksumedShare => {
    const extractedChecksum = checksumedShare.slice( checksumedShare.length - 4 );
    const recoveredShare = checksumedShare.slice( 0, checksumedShare.length - 4 );
    const calculatedChecksum = SSS.calculateChecksum( recoveredShare );
    if ( calculatedChecksum !== extractedChecksum ) {
      return false;
    }
    return true;
  };

  private static calculateChecksum = ( share: string, rotation: number = 2 ) => {
    let temp = share;
    for ( let itr = 0; itr < rotation; itr++ ) {
      const hash = crypto.createHash( "sha512" );
      hash.update( temp );
      temp = hash.digest( "hex" );
    }

    return temp.slice( 0, 4 );
  };

  private static generateKey = ( psuedoKey: string ) => {
    const hashRounds = 5048;
    let key = psuedoKey;
    for ( let itr = 0; itr < hashRounds; itr++ ) {
      const hash = crypto.createHash( "sha512" );
      key = hash.update( key ).digest( "hex" );
    }
    return key.slice( key.length - SSS.cipherSpec.keyLength );
  };
}
