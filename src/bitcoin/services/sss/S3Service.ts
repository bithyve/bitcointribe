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

  public getWalletId = () => this.sss.getWalletId();

  public getShareId = ( encryptedShare: string ) =>
    this.sss.getShareId( encryptedShare );

  public initializeHealthcheck = async encryptedShares =>
    await this.sss.initializeHealthcheck( encryptedShares );

  public checkHealth = async encryptedShares =>
    await this.sss.checkHealth( encryptedShares );

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

  public static recoverFromShares = (
    encryptedShares: string,
    answers: string[]
  ) => {
    const decryptedShares = SSS.decryptShares( encryptedShares, answers );
    const mnemonic: string = SSS.recoverFromShares( decryptedShares );
    return mnemonic;
  };

  public createTransferShare = ( encryptedShare: any, tag?: string ) => {
    console.log( encryptedShare );
    if ( tag ) {
      encryptedShare = this.sss.addMeta( encryptedShare, tag );
    } else {
      encryptedShare = JSON.stringify( encryptedShare )
    }

    console.log( "Creating transfer share" )
    console.log( { encryptedShare } )
    const { share, otp } = this.sss.encryptViaOTP(
      encryptedShare
    );
    console.log( otp );
    return {
      share,
      otp
    };
  };

  public createQRShare = ( encryptedShare: string, tag: string ) =>
    this.sss.addMeta( encryptedShare, tag );

  public uploadShare = async ( otpEncryptedShare: string ) => {
    const messageId = this.sss.generateMessageID();
    return await this.sss.uploadShare( otpEncryptedShare, messageId );
  };

  public static downloadShare = async ( messageId: string ) => {
    const { otpEncryptedShare } = await SSS.downloadShare( messageId );
    return otpEncryptedShare;
  };

  public static decryptOTPEncShare = async (
    otpEncryptedShare: string,
    messageId: string,
    otp: string,
    walletId?: string,
    existingShares?: any[]
  ) => {
    const decryptedShare = SSS.decryptViaOTP( otpEncryptedShare, otp );
    try {
      if ( SSS.validateDecryption( decryptedShare, walletId, existingShares ) ) {
        const res = await axios.post( config.SERVER + "/affirmDecryption", {
          messageId
        } );
        if ( res.data.deleted ) {
          return { status: res.status, decryptedShare };
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
