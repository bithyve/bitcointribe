import axios from "axios";
import config from "../../Config";
import SSS from "../../utilities/sss/SSS";

export default class S3Service {
  private sss: SSS;
  constructor ( mnemonic: string ) {
    this.sss = new SSS( mnemonic );
  }

  public generateShares = ( answers: string[] ) => {
    const shares = this.sss.generateShares();
    const encryptedShares = this.sss.encryptShares( shares, answers );
    return encryptedShares;
  };

  public getShareId = ( encryptedShare: string ) =>
    this.sss.getShareId( encryptedShare );

  public initializeHealthcheck = async encryptedShares =>
    await this.sss.initializeHealthcheck( encryptedShares );

  public checkHealth = async encryptedShare =>
    await this.sss.checkHealth( encryptedShare );

  public updateHealth = async ( walletID, encryptedShare ) =>
    await this.sss.updateHealth( walletID, encryptedShare );

  public updateNonPMDD = async nonPMDD => {
    const encryptedNonPMDD = await this.sss.encryptNonPMDD( nonPMDD );
    return await this.sss.updateNonPMDD( encryptedNonPMDD );
  };

  public downloadNonPMDD = async ( walletId: string ) =>
    await this.sss.fetchNonPMDD( walletId );

  public decryptNonPMDD = async ( encryptedNonPMDD: string ) =>
    await this.sss.decryptNonPMDD( encryptedNonPMDD );

  public recoverFromShares = ( encryptedShares, answers: string[] ) => {
    const decryptedShares = this.sss.decryptShares( encryptedShares, answers );
    const mnemonic: string = this.sss.recoverFromShares( decryptedShares );
    return mnemonic;
  };

  public createTransferShare = ( encryptedShare: string, tag: string ) => {
    const metaShare = this.sss.addMeta( encryptedShare, tag );
    const { share, otp } = this.sss.encryptViaOTP( metaShare );
    return {
      share,
      otp
    };
  };

  public createQRShare = ( encryptedShare: string, tag: string ) =>
    this.sss.addMeta( encryptedShare, tag );

  public uploadShare = async ( otpEncryptedShare: string ) => {
    const messageId = this.sss.generateMessageID();
    return this.sss.uploadShare( otpEncryptedShare, messageId );
  };

  public downloadShare = async ( messageId: string ) => {
    const { otpEncryptedShare } = await this.sss.downloadShare( messageId );
    return otpEncryptedShare;
  };

  public decryptOTPEncShare = async (
    otpEncryptedShare: string,
    messageId: string,
    otp: string,
    existingShares?: any[]
  ) => {
    const decryptedShare = this.sss.decryptViaOTP( otpEncryptedShare, otp );
    try {
      if ( this.sss.validateDecryption( decryptedShare, existingShares ) ) {
        const res = await axios.post( config.SERVER + "/affirmDecryption", {
          messageId
        } );
        if ( res.data.deleted ) {
          return decryptedShare;
        } else {
          throw new Error( "Something went wrong while decrypting the share" );
        }
      }
    } catch ( err ) {
      console.log( err );
      return {
        status: 400,
        errorMessage: err.message
      };
    }
  };
}
