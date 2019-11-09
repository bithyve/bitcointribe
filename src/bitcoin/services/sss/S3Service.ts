import config from "../../Config";
import { ErrMap } from "../../utilities/ErrMap";
import {
  IBuddyStaticNonPMDD,
  IDynamicNonPMDD,
  IMetaShare,
  ISocialStaticNonPMDD
} from "../../utilities/sss/Interface";
import SSS from "../../utilities/sss/SSS";

export default class S3Service {
  public static fromJSON = (json: string) => {
    const { sss } = JSON.parse(json);
    const {
      mnemonic,
      encryptedShares
    }: {
      mnemonic: string;
      encryptedShares: string[];
    } = sss;

    return new S3Service(mnemonic, encryptedShares);
  };

  public static recoverFromShares = (
    encryptedShares: string[],
    answer: string
  ):
    | {
        status: number;
        data: {
          mnemonic: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      const { decryptedShares } = SSS.decryptShares(encryptedShares, answer);
      const { mnemonic } = SSS.recoverFromShares(decryptedShares);
      return { status: config.STATUS.SUCCESS, data: { mnemonic } };
    } catch (err) {
      return { status: 501, err: err.message, message: ErrMap[501] };
    }
  };

  public static downloadShare = async (
    key: string
  ): Promise<
    | {
        status: number;
        data:
          | {
              encryptedMetaShare: string;
              messageId: string;
              dynamicNonPMDD: IDynamicNonPMDD;
            }
          | {
              encryptedMetaShare: string;
              messageId: string;
              dynamicNonPMDD?: undefined;
            };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await SSS.downloadShare(key)
      };
    } catch (err) {
      return { status: 502, err: err.message, message: ErrMap[502] };
    }
  };

  public static decryptEncMetaShare = async (
    encryptedMetaShare: string,
    key: string,
    existingShares: IMetaShare[] = [],
    walletId?: string
  ): Promise<
    | {
        status: number;
        data: {
          decryptedMetaShare: IMetaShare;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      const { decryptedMetaShare } = SSS.decryptMetaShare(
        encryptedMetaShare,
        key
      );

      if (
        SSS.validateDecryption(decryptedMetaShare, existingShares, walletId)
      ) {
        const messageId = SSS.getMessageId(key, config.MSG_ID_LENGTH);
        const { deleted } = await SSS.affirmDecryption(messageId);
        if (!deleted) {
          throw new Error("Unable to remove the share from the server");
        } else {
          return {
            status: config.STATUS.SUCCESS,
            data: { decryptedMetaShare }
          };
        }
      }
    } catch (err) {
      return { status: 503, err: err.message, message: ErrMap[503] };
    }
  };

  public static decryptViaOTP = (
    otpEncryptedData: string,
    otp: string
  ):
    | {
        status: number;
        data: {
          decryptedData: any;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: SSS.decryptViaOTP(otpEncryptedData, otp)
      };
    } catch (err) {
      return { status: 504, err: err.message, message: ErrMap[504] };
    }
  };

  public static recoverMetaShareFromQR = (
    qrData: string[]
  ):
    | {
        status: number;
        data: {
          metaShare: IMetaShare;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: SSS.recoverMetaShareFromQR(qrData)
      };
    } catch (err) {
      return { status: 505, err: err.message, message: ErrMap[505] };
    }
  };

  public static updateHealth = async (
    metaShares: IMetaShare[]
  ): Promise<
    | {
        status: number;
        data: {
          updationInfo: Array<{
            walletId: string;
            shareId: string;
            updated: boolean;
            dynamicNonPMDD?: IDynamicNonPMDD;
            err?: string;
          }>;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await SSS.updateHealth(metaShares)
      };
    } catch (err) {
      return { status: 506, err: err.message, message: ErrMap[506] };
    }
  };

  public static getShareId = (
    encryptedShare: string
  ):
    | {
        status: number;
        data: {
          shareId: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: SSS.getShareId(encryptedShare)
      };
    } catch (err) {
      return { status: 507, err: err.message, message: ErrMap[507] };
    }
  };

  public static generateKey = ():
    | {
        status: number;
        data: {
          key: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: { key: SSS.makeKey(SSS.cipherSpec.keyLength) }
      };
    } catch (err) {
      return { status: 508, err: err.message, message: ErrMap[508] };
    }
  };

  public static encryptViaOTP = (
    key: string
  ):
    | {
        status: number;
        data: {
          otpEncryptedData: string;
          otp: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: SSS.encryptViaOTP(key)
      };
    } catch (err) {
      return { status: 509, err: err.message, message: ErrMap[509] };
    }
  };

  private sss: SSS;
  constructor(mnemonic: string, encryptedShares?: string[]) {
    this.sss = new SSS(mnemonic, encryptedShares);
  }

  public generateShares = (
    answer: string
  ):
    | {
        status: number;
        data: {
          encryptedShares: string[];
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      const { shares } = this.sss.generateShares();
      const { encryptedShares } = this.sss.encryptShares(shares, answer);
      return { status: config.STATUS.SUCCESS, data: { encryptedShares } };
    } catch (err) {
      return { status: 510, err: err.message, message: ErrMap[510] };
    }
  };

  public encryptStaticNonPMDD = (
    staticNonPMDD: ISocialStaticNonPMDD | IBuddyStaticNonPMDD
  ):
    | {
        status: number;
        data: {
          encryptedStaticNonPMDD: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      const { encryptedStaticNonPMDD } = this.sss.encryptStaticNonPMDD(
        staticNonPMDD
      );
      return {
        status: config.STATUS.SUCCESS,
        data: { encryptedStaticNonPMDD }
      };
    } catch (err) {
      return { status: 511, err: err.message, message: ErrMap[511] };
    }
  };

  public getWalletId = ():
    | {
        status: number;
        data: {
          walletId: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return { status: config.STATUS.SUCCESS, data: this.sss.getWalletId() };
    } catch (err) {
      return { status: 512, err: err.message, message: ErrMap[512] };
    }
  };

  public initializeHealthcheck = async (
    encryptedShares: string[]
  ): Promise<
    | {
        status: number;
        data: {
          success: boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.sss.initializeHealthcheck(encryptedShares)
      };
    } catch (err) {
      return { status: 513, err: err.message, message: ErrMap[513] };
    }
  };

  public checkHealth = async (
    shareIDs: string[]
  ): Promise<
    | {
        status: number;
        data: {
          lastUpdateds: Array<{
            shareId: string;
            updatedAt: number;
          }>;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.sss.checkHealth(shareIDs)
      };
    } catch (err) {
      return { status: 514, err: err.message, message: ErrMap[514] };
    }
  };

  public updateDynamicNonPMDD = async (
    dynamicNonPMDD: IMetaShare[]
  ): Promise<
    | {
        status: number;
        data: {
          updated: boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      const { encryptedDynamicNonPMDD } = await this.sss.encryptDynamicNonPMDD(
        dynamicNonPMDD
      );

      return {
        status: config.STATUS.SUCCESS,
        data: await this.sss.updateDynamicNonPMDD(encryptedDynamicNonPMDD)
      };
    } catch (err) {
      return { status: 515, err: err.message, message: ErrMap[515] };
    }
  };

  public downloadDynamicNonPMDD = async (
    walletId: string
  ): Promise<
    | {
        status: number;
        data: {
          dynamicNonPMDD: IDynamicNonPMDD;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.sss.downloadDynamicNonPMDD(walletId)
      };
    } catch (err) {
      return { status: 516, err: err.message, message: ErrMap[516] };
    }
  };

  public decryptDynamicNonPMDD = (
    encryptedDynamicNonPMDD: string
  ):
    | {
        status: number;
        data: {
          decryptedDynamicNonPMDD: IMetaShare[];
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.sss.decryptDynamicNonPMDD(encryptedDynamicNonPMDD)
      };
    } catch (err) {
      return { status: 518, err: err.message, message: ErrMap[518] };
    }
  };

  public restoreDynamicNonPMDD = (
    dynamicNonPMDDs: IDynamicNonPMDD[]
  ):
    | {
        status: number;
        data: {
          latestDynamicNonPMDD: IMetaShare[];
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      const { decryptedDynamicNonPMDD } = this.sss.restoreDynamicNonPMDD(
        dynamicNonPMDDs
      );
      return {
        status: config.STATUS.SUCCESS,
        data: {
          latestDynamicNonPMDD: decryptedDynamicNonPMDD
        }
      };
    } catch (err) {
      return { status: 517, err: err.message, message: ErrMap[517] };
    }
  };

  public decryptStaticNonPMDD = (
    encryptedNonPMDD: string
  ):
    | {
        status: number;
        data: {
          decryptedStaticNonPMDD: ISocialStaticNonPMDD | IBuddyStaticNonPMDD;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.sss.decryptStaticNonPMDD(encryptedNonPMDD)
      };
    } catch (err) {
      return { status: 519, err: err.message, message: ErrMap[519] };
    }
  };

  public createMetaShare = (
    index: number,
    encryptedShare: string,
    encryptedStaticNonPMDD: string,
    tag: string,
    version?: number
  ):
    | {
        status: number;
        data: {
          metaShare: IMetaShare;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.sss.addMeta(
          index,
          encryptedShare,
          encryptedStaticNonPMDD,
          tag,
          version
        )
      };
    } catch (err) {
      return { status: 520, err: err.message, message: ErrMap[520] };
    }
  };

  public createQR = async (
    metashare: IMetaShare,
    index: number
  ): Promise<
    | {
        status: number;
        data: { qrData: string[] };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.sss.createQR(metashare, index)
      };
    } catch (err) {
      return { status: 521, err: err.message, message: ErrMap[521] };
    }
  };

  public generateEncryptedMetaShare = (
    metaShare: IMetaShare,
    key?: string
  ):
    | {
        status: number;
        data: {
          encryptedMetaShare: string;
          key: string;
          messageId: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.sss.encryptMetaShare(metaShare, key)
      };
    } catch (err) {
      return { status: 522, err: err.message, message: ErrMap[522] };
    }
  };

  public uploadShare = async (
    encryptedMetaShare: string,
    messageId: string,
    dynamicNonPMDD?: IDynamicNonPMDD
  ): Promise<
    | {
        status: number;
        data: {
          success: boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.sss.uploadShare(
          encryptedMetaShare,
          messageId,
          dynamicNonPMDD
        )
      };
    } catch (err) {
      return { status: 523, err: err.message, message: ErrMap[523] };
    }
  };
}
