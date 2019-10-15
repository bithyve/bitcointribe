import config from '../../Config';
import {
    IBuddyStaticNonPMDD,
    IMetaShare,
    ISocialStaticNonPMDD
} from '../../utilities/sss/Interface';
import SSS from '../../utilities/sss/SSS';

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
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          } => {
        try {
            const { decryptedShares } = SSS.decryptShares(
                encryptedShares,
                answer
            );
            const { mnemonic } = SSS.recoverFromShares(decryptedShares);
            return { status: config.STATUS.SUCCESS, data: { mnemonic } };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
        }
    };

    public static downloadShare = async (
        key: string
    ): Promise<
        | {
              status: number;
              data: {
                  encryptedMetaShare: string;
              };
              err?: undefined;
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          }
    > => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: await SSS.downloadShare(key)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
        }
    };

    public static decryptEncMetaShare = async (
        encryptedMetaShare: string,
        key: string,
        walletId?: string,
        existingShares?: IMetaShare[]
    ): Promise<
        | {
              status: number;
              data: {
                  decryptedMetaShare: IMetaShare;
              };
              err?: undefined;
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          }
    > => {
        try {
            const { decryptedMetaShare } = SSS.decryptMetaShare(
                encryptedMetaShare,
                key
            );

            if (
                SSS.validateDecryption(
                    decryptedMetaShare,
                    walletId,
                    existingShares
                )
            ) {
                const messageId = SSS.getMessageId(key, config.MSG_ID_LENGTH);
                const { deleted } = await SSS.affirmDecryption(messageId);
                if (!deleted) {
                    throw new Error(
                        'Unable to remove the share from the server'
                    );
                } else {
                    return {
                        status: config.STATUS.SUCCESS,
                        data: { decryptedMetaShare }
                    };
                }
            }
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
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
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          } => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: SSS.decryptViaOTP(otpEncryptedData, otp)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
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
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          } => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: SSS.recoverMetaShareFromQR(qrData)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
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
                      dynamicNonPMDD?: string;
                      err?: string;
                  }>;
              };
              err?: undefined;
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          }
    > => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: await SSS.updateHealth(metaShares)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
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
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          } => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: SSS.getShareId(encryptedShare)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
        }
    };

    public static generateKey = ():
        | {
              status: number;
              data: {
                  key: string;
              };
              err?: undefined;
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          } => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: { key: SSS.makeKey(SSS.cipherSpec.keyLength) }
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
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
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          } => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: SSS.encryptViaOTP(key)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
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
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          } => {
        try {
            const { shares } = this.sss.generateShares();
            const { encryptedShares } = this.sss.encryptShares(shares, answer);
            return { status: config.STATUS.SUCCESS, data: { encryptedShares } };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
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
          }
        | {
              status: number;
              err: string;
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
            return { status: config.STATUS.ERROR, err: err.message };
        }
    };

    public getWalletId = ():
        | {
              status: number;
              data: {
                  walletId: string;
              };
              err?: undefined;
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          } => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: this.sss.getWalletId()
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
        }
    };

    public initializeHealthcheck = async (
        encryptedShares: string[]
    ): Promise<
        | {
              status: number;
              data: any;
              err?: undefined;
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          }
    > => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: await this.sss.initializeHealthcheck(encryptedShares)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
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
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          }
    > => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: await this.sss.checkHealth(shareIDs)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
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
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          }
    > => {
        try {
            const {
                encryptedDynamicNonPMDD
            } = await this.sss.encryptDynamicNonPMDD(dynamicNonPMDD);

            return {
                status: config.STATUS.SUCCESS,
                data: await this.sss.updateDynamicNonPMDD(
                    encryptedDynamicNonPMDD
                )
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
        }
    };

    public downloadDynamicNonPMDD = async (
        walletId: string
    ): Promise<
        | {
              status: number;
              data: {
                  nonPMDD: string;
              };
              err?: undefined;
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          }
    > => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: await this.sss.downloadDynamicNonPMDD(walletId)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
        }
    };

    public decryptDynamicNonPMDD = async (
        encryptedDynamicNonPMDD: string
    ): Promise<
        | {
              status: number;
              data: {
                  decryptedDynamicNonPMDD: IMetaShare[];
              };
              err?: undefined;
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          }
    > => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: await this.sss.decryptDynamicNonPMDD(
                    encryptedDynamicNonPMDD
                )
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
        }
    };

    public decryptStaticNonPMDD = async (
        encryptedNonPMDD: string
    ): Promise<
        | {
              status: number;
              data: {
                  decryptedStaticNonPMDD:
                      | ISocialStaticNonPMDD
                      | IBuddyStaticNonPMDD;
              };
              err?: undefined;
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          }
    > => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: await this.sss.decryptStaticNonPMDD(encryptedNonPMDD)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
        }
    };

    public createMetaShare = (
        index: number,
        encryptedShare: string,
        encryptedStaticNonPMDD: string,
        tag: string
    ):
        | {
              status: number;
              data: {
                  metaShare: IMetaShare;
              };
              err?: undefined;
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          } => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: this.sss.addMeta(
                    index,
                    encryptedShare,
                    encryptedStaticNonPMDD,
                    tag
                )
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
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
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          }
    > => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: await this.sss.createQR(metashare, index)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
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
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          } => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: this.sss.encryptMetaShare(metaShare, key)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
        }
    };

    public uploadShare = async (
        encryptedMetaShare: string,
        messageId: string
    ): Promise<
        | {
              status: number;
              data: {
                  success: boolean;
              };
              err?: undefined;
          }
        | {
              status: number;
              err: string;
              data?: undefined;
          }
    > => {
        try {
            return {
                status: config.STATUS.SUCCESS,
                data: await this.sss.uploadShare(encryptedMetaShare, messageId)
            };
        } catch (err) {
            return { status: config.STATUS.ERROR, err: err.message };
        }
    };
}
