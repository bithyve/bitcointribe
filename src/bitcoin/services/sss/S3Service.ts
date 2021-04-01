import config from '../../HexaConfig'
import { ErrMap } from '../../utilities/ErrMap'
import {
  BuddyStaticNonPMDD,
  EncDynamicNonPMDD,
  MetaShare,
  SocialStaticNonPMDD,
  EncryptedImage,
  WalletImage,
} from '../../utilities/Interface'
import SSS from '../../utilities/sss/SSS'
import LevelHealth from '../../utilities/LevelHealth/LevelHealth'
import HDSegwitWallet from '../../utilities/accounts/HDSegwitWallet'
import SecureHDWallet from '../../utilities/accounts/SecureHDWallet'

export default class S3Service {
  public static fromJSON = ( json: string ) => {
    const { levelhealth } = JSON.parse( json )
    const { sss } = JSON.parse( json )
    const mnemonic = sss.mnemonic ? sss.mnemonic : levelhealth.mnemonic
    const walletId = sss.walletId ? sss.walletId : levelhealth.walletId
    const {
      encryptedSecrets,
      shareIDs,
      metaShares,
      healthCheckInitialized,
      healthCheckStatus,
      pdfHealth,
    }: {
      encryptedSecrets: string[];
      shareIDs: string[];
      metaShares: MetaShare[];
      healthCheckInitialized: boolean;
      healthCheckStatus: {};
      pdfHealth: {};
    } = sss


    const {
      encryptedSecretsKeeper,
      shareIDsKeeper,
      metaSharesKeeper,
      healthCheckInitializedKeeper,
      healthCheckStatusKeeper,
      pdfHealthKeeper,
      encryptedSMSecretsKeeper,
      SMMetaSharesKeeper,
    }: {
      encryptedSecretsKeeper: string[];
      shareIDsKeeper: string[];
      metaSharesKeeper: MetaShare[];
      healthCheckInitializedKeeper: boolean;
      healthCheckStatusKeeper: {};
      pdfHealthKeeper: {};
      encryptedSMSecretsKeeper: string[];
      SMMetaSharesKeeper: MetaShare[];
    } = levelhealth ? levelhealth : {
      encryptedSecretsKeeper: [],
      shareIDsKeeper: [],
      metaSharesKeeper: [],
      healthCheckInitializedKeeper: false,
      healthCheckStatusKeeper: {
      },
      pdfHealthKeeper: {
      },
      encryptedSMSecretsKeeper: [],
      SMMetaSharesKeeper: [],
    }

    return new S3Service( mnemonic, {
      encryptedSecrets,
      shareIDs,
      metaShares,
      healthCheckInitialized,
      walletId,
      healthCheckStatus,
      pdfHealth,
      encryptedSecretsKeeper,
      shareIDsKeeper,
      metaSharesKeeper,
      healthCheckInitializedKeeper,
      healthCheckStatusKeeper,
      pdfHealthKeeper,
      encryptedSMSecretsKeeper,
      SMMetaSharesKeeper,
    } )
  };

  public sss: SSS;
  public levelhealth: LevelHealth;
  public hdWallet: HDSegwitWallet;
  public secureWallet: SecureHDWallet;
  constructor(
    mnemonic: string,
    stateVars?: {
      encryptedSecrets: string[];
      shareIDs: string[];
      metaShares: MetaShare[];
      healthCheckInitialized: boolean;
      walletId: string;
      healthCheckStatus: {};
      pdfHealth: {};
      encryptedSecretsKeeper: string[];
      shareIDsKeeper: string[];
      metaSharesKeeper: MetaShare[];
      healthCheckInitializedKeeper: boolean;
      healthCheckStatusKeeper: {};
      pdfHealthKeeper: {};
      encryptedSMSecretsKeeper: string[];
      SMMetaSharesKeeper: MetaShare[];
    },
  ) {
    this.levelhealth = new LevelHealth( mnemonic, stateVars )
    this.sss = new SSS( mnemonic, stateVars )
    this.hdWallet = new HDSegwitWallet()
    this.secureWallet = new SecureHDWallet( mnemonic )
  }

  public static recoverFromSecrets = (
    encryptedSecrets: string[],
    answer: string,
    level?: number
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
      const { decryptedSecrets } = SSS.decryptSecrets( encryptedSecrets, answer )
      const { mnemonic } = SSS.recoverFromSecrets( decryptedSecrets )
      return {
        status: config.STATUS.SUCCESS, data: {
          mnemonic
        }
      }
    } catch ( err ) {
      return {
        status: 501, err: err.message, message: ErrMap[ 501 ]
      }
    }
  };

  public static recoverFromSecretsKeeper = (
    encryptedSecrets: string[],
    answer: string,
    level?: number
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
      const { decryptedSecrets } = LevelHealth.decryptSecrets( encryptedSecrets, answer )
      const { mnemonic } = LevelHealth.recoverFromSecretsKeeper( decryptedSecrets, level )
      return {
        status: config.STATUS.SUCCESS, data: {
          mnemonic
        }
      }
    } catch ( err ) {
      return {
        status: 501, err: err.message, message: ErrMap[ 501 ]
      }
    }
  };

  public static downloadShare = async (
    encryptedKey: string,
    otp?: string,
  ): Promise<
    | {
        status: number;
        data:
          | {
              metaShare: MetaShare;
              encryptedDynamicNonPMDD: EncDynamicNonPMDD;
            }
          | {
              metaShare: MetaShare;
              encryptedDynamicNonPMDD?: undefined;
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
        data: await LevelHealth.downloadShare( encryptedKey, otp ),
      }
    } catch ( err ) {
      return {
        status: 502, err: err.message, message: ErrMap[ 502 ]
      }
    }
  };

  public static downloadPdfShare = async (
    messageId: string,
    key: string,
  ): Promise<
    | {
        status: number;
        data:
          | {
              metaShare: MetaShare;
              encryptedDynamicNonPMDD: EncDynamicNonPMDD;
            }
          | {
              metaShare: MetaShare;
              encryptedDynamicNonPMDD?: undefined;
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
        data: await LevelHealth.downloadPdfShare( messageId, key ),
      }
    } catch ( err ) {
      return {
        status: 502, err: err.message, message: ErrMap[ 502 ]
      }
    }
  };

  public static downloadDynamicNonPMDD = async (
    walletId: string,
  ): Promise<
    | {
        status: number;
        data: {
          encryptedDynamicNonPMDD: EncDynamicNonPMDD;
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
        data: await LevelHealth.downloadDynamicNonPMDD( walletId ),
      }
    } catch ( err ) {
      return {
        status: 516, err: err.message, message: ErrMap[ 516 ]
      }
    }
  };

  public static generateEncryptedMetaShare = (
    metaShare: MetaShare,
    key?: string,
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
        data: LevelHealth.encryptMetaShare( metaShare, key ),
      }
    } catch ( err ) {
      return {
        status: 522, err: err.message, message: ErrMap[ 522 ]
      }
    }
  };

  public static generateRequestCreds = (): {
    key: string;
  } => LevelHealth.generateRequestCreds();

  public static uploadRequestedShare = async (
    encryptedKey: string,
    otp?: string,
    metaShare?: MetaShare,
    encryptedDynamicNonPMDD?: EncDynamicNonPMDD,
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
        data: await LevelHealth.uploadRequestedShare(
          encryptedKey,
          otp,
          metaShare,
          encryptedDynamicNonPMDD,
        ),
      }
    } catch ( err ) {
      return {
        status: 503, err: err.message, message: ErrMap[ 503 ]
      }
    }
  };

  public static downloadAndValidateShare = async (
    encryptedKey: string,
    otp?: string,
    existingShares: MetaShare[] = [],
    walletId?: string,
  ): Promise<
    | {
        status: number;
        data: {
          metaShare: MetaShare;
          encryptedDynamicNonPMDD: EncDynamicNonPMDD;
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
        data: await LevelHealth.downloadAndValidateShare(
          encryptedKey,
          otp,
          existingShares,
          walletId,
        ),
      }
    } catch ( err ) {
      return {
        status: 503, err: err.message, message: ErrMap[ 503 ]
      }
    }
  };

  public static decryptViaOTP = (
    otpEncryptedData: string,
    otp: string,
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
        data: LevelHealth.decryptViaOTP( otpEncryptedData, otp ),
      }
    } catch ( err ) {
      return {
        status: 504, err: err.message, message: ErrMap[ 504 ]
      }
    }
  };

  public static recoverMetaShareFromQR = (
    qrData: string[],
  ):
    | {
        status: number;
        data: {
          metaShare: MetaShare;
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
        data: LevelHealth.recoverMetaShareFromQR( qrData ),
      }
    } catch ( err ) {
      return {
        status: 505, err: err.message, message: ErrMap[ 505 ]
      }
    }
  };

  public static updateHealth = async (
    metaShares: MetaShare[],
  ): Promise<
    | {
        status: number;
        data: {
          updationInfo: Array<{
            walletId: string;
            shareId: string;
            updated: boolean;
            updatedAt?: number;
            encryptedDynamicNonPMDD?: EncDynamicNonPMDD;
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
        data: await SSS.updateHealth( metaShares ),
      }
    } catch ( err ) {
      return {
        status: 506, err: err.message, message: ErrMap[ 506 ]
      }
    }
  };

  public static updateHealthKeeper = async (
    shares: [{
      walletId: string;
      shareId: string;
      reshareVersion: number;
      updatedAt: number;
      status?: string;
      name?: string;
    }],
  ): Promise<
    | {
        status: number;
        data: {
          updationInfo: Array<{
            walletId: string;
            shareId: string;
            updated: boolean;
            updatedAt?: number;
            encryptedDynamicNonPMDD?: EncDynamicNonPMDD;
            err?: string;
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
    console.log( 'updateMSharesHealth s3sevice', shares )
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await LevelHealth.updateHealthKeeper( shares ),
      }
    } catch ( err ) {
      return {
        status: 506, err: err.message, message: ErrMap[ 506 ]
      }
    }
  };

  public static getShareId = (
    encryptedShare: string,
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
        data: {
          shareId: LevelHealth.getShareId( encryptedShare )
        },
      }
    } catch ( err ) {
      return {
        status: 507, err: err.message, message: ErrMap[ 507 ]
      }
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
        data: {
          key: LevelHealth.generateKey( LevelHealth.cipherSpec.keyLength )
        },
      }
    } catch ( err ) {
      return {
        status: 508, err: err.message, message: ErrMap[ 508 ]
      }
    }
  };

  public static encryptViaOTP = (
    key: string,
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
        data: LevelHealth.encryptViaOTP( key ),
      }
    } catch ( err ) {
      return {
        status: 509, err: err.message, message: ErrMap[ 509 ]
      }
    }
  };

  public generateShares = (
    answer: string,
  ):
    | {
        status: number;
        data: {
          encryptedSecrets: string[];
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
      const { shares } = this.sss.generateShares()
      const { encryptedSecrets } = this.sss.encryptSecrets( shares, answer )
      return {
        status: config.STATUS.SUCCESS, data: {
          encryptedSecrets
        }
      }
    } catch ( err ) {
      return {
        status: 510, err: err.message, message: ErrMap[ 510 ]
      }
    }
  };

  public generateLevel1Shares = (
    secureAssets: {
      secondaryMnemonic: string;
      twoFASecret: string;
      secondaryXpub: string;
      bhXpub: string;
    },
    answer: string,
    tag: string,
    questionId: string,
    version: string,
    question? :string,
    level?: number
  ):
    | {
        status: number;
        data: {
          encryptedSecrets: string[];
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

      const { shares } = this.levelhealth.generateLevel1Shares()
      const { encryptedSecrets } = this.levelhealth.encryptSecrets( shares, answer )
      const { metaShares } = this.levelhealth.createMetaSharesKeeper( secureAssets, tag, questionId, version, question, level )
      console.log( 'metaShares', metaShares )
      return {
        status: config.STATUS.SUCCESS, data: {
          encryptedSecrets
        }
      }
    } catch ( err ) {
      return {
        status: 510, err: err.message, message: ErrMap[ 510 ]
      }
    }
  };

  public generateLevel2Shares = (
    secureAssets: {
      secondaryMnemonic: string;
      twoFASecret: string;
      secondaryXpub: string;
      bhXpub: string;
    },
    answer: string,
    tag: string,
    questionId: string,
    version: string,
    question? :string,
    level?: number
  ):
    | {
        status: number;
        data: {
          encryptedSecrets: string[];
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
      const { shares } = this.levelhealth.generateLevel2Shares()
      const { encryptedSecrets } = this.levelhealth.encryptSecrets( shares, answer )
      const { metaShares } = this.levelhealth.createMetaSharesKeeper( secureAssets, tag, questionId, version, question, level )
      return {
        status: config.STATUS.SUCCESS, data: {
          encryptedSecrets
        }
      }
    } catch ( err ) {
      return {
        status: 510, err: err.message, message: ErrMap[ 510 ]
      }
    }
  };


  public encryptStaticNonPMDD = (
    staticNonPMDD: SocialStaticNonPMDD | BuddyStaticNonPMDD,
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
      const { encryptedStaticNonPMDD } = this.levelhealth.encryptStaticNonPMDD(
        staticNonPMDD,
      )
      return {
        status: config.STATUS.SUCCESS,
        data: {
          encryptedStaticNonPMDD
        },
      }
    } catch ( err ) {
      return {
        status: 511, err: err.message, message: ErrMap[ 511 ]
      }
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
      return {
        status: config.STATUS.SUCCESS,
        data: {
          walletId: this.levelhealth.walletId
        },
      }
    } catch ( err ) {
      return {
        status: 512, err: err.message, message: ErrMap[ 512 ]
      }
    }
  };

  public initializeHealth = async (): Promise<
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
        data: await this.sss.initializeHealthcheck(),
      }
    } catch ( err ) {
      return {
        status: 513, err: err.message, message: ErrMap[ 513 ]
      }
    }
  };

  public initializeHealthKeeper = async (): Promise<
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
        data: await this.levelhealth.initializeHealthKeeper(),
      }
    } catch ( err ) {
      return {
        status: 513, err: err.message, message: ErrMap[ 513 ]
      }
    }
  };

  public updateHealthLevel2 = async ( SecurityQuestionHealth, level ): Promise<
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
        data: await this.levelhealth.updateHealthLevel2( SecurityQuestionHealth, level ),
      }
    } catch ( err ) {
      return {
        status: 513, err: err.message, message: ErrMap[ 513 ]
      }
    }
  };

  public checkHealth = async (): Promise<
    | {
        status: number;
        data: {
          shareGuardianMapping: {
            [index: number]: {
              shareId: string;
              updatedAt: number;
              guardian: string;
            };
          };
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
        data: await this.sss.checkHealth(),
      }
    } catch ( err ) {
      return {
        status: 514, err: err.message, message: ErrMap[ 514 ]
      }
    }
  };

  public checkHealthKeeper = async (): Promise<
    | {
        status: number;
        data?: {};
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
        data: ( await this.levelhealth.checkHealthKeeper() ).data,
      }
    } catch ( err ) {
      return {
        status: 514, err: err.message, message: ErrMap[ 514 ]
      }
    }
  };

  public resetSharesHealth = async (
    shareIndex: number,
  ): Promise<
    | {
        status: number;
        data: {
          resetted: boolean;
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
        data: await this.sss.resetSharesHealth( shareIndex ),
      }
    } catch ( err ) {
      return {
        status: 514, err: err.message, message: ErrMap[ 514 ]
      }
    }
  };

  public updateDynamicNonPMDD = async (
    dynamicNonPMDD: any,
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
      return {
        status: config.STATUS.SUCCESS,
        data: await this.levelhealth.updateDynamicNonPMDD( dynamicNonPMDD ),
      }
    } catch ( err ) {
      return {
        status: 515, err: err.message, message: ErrMap[ 515 ]
      }
    }
  };

  public decryptDynamicNonPMDD = (
    encryptedDynamicNonPMDD: EncDynamicNonPMDD,
  ):
    | {
        status: number;
        data: {
          decryptedDynamicNonPMDD: MetaShare[];
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
        data: this.levelhealth.decryptDynamicNonPMDD( encryptedDynamicNonPMDD ),
      }
    } catch ( err ) {
      return {
        status: 518, err: err.message, message: ErrMap[ 518 ]
      }
    }
  };

  public restoreDynamicNonPMDD = (
    dynamicNonPMDDs: EncDynamicNonPMDD[],
  ):
    | {
        status: number;
        data: {
          latestDynamicNonPMDD: MetaShare[];
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
      const { decryptedDynamicNonPMDD } = this.levelhealth.restoreDynamicNonPMDD(
        dynamicNonPMDDs,
      )
      return {
        status: config.STATUS.SUCCESS,
        data: {
          latestDynamicNonPMDD: decryptedDynamicNonPMDD,
        },
      }
    } catch ( err ) {
      return {
        status: 517, err: err.message, message: ErrMap[ 517 ]
      }
    }
  };

  public decryptStaticNonPMDD = (
    encryptedNonPMDD: string,
  ):
    | {
        status: number;
        data: {
          decryptedStaticNonPMDD;
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
        data: this.levelhealth.decryptStaticNonPMDD( encryptedNonPMDD ),
      }
    } catch ( err ) {
      return {
        status: 519, err: err.message, message: ErrMap[ 519 ]
      }
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
    questionId,
    question? : string,
    version?: string,
  ):
    | {
        status: number;
        data: {
          metaShares: MetaShare[];
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
        data: this.sss.createMetaShares( secureAssets, tag, questionId, question, version ),
      }
    } catch ( err ) {
      return {
        status: 520, err: err.message, message: ErrMap[ 520 ]
      }
    }
  };

  public reshareMetaShare = (
    index: number,
  ):
    | {
        status: number;
        data: {
          metaShare: MetaShare;
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
      const metaShare = this.sss.reshareMetaShare( index )
      return {
        status: config.STATUS.SUCCESS, data: {
          metaShare
        }
      }
    } catch ( err ) {
      return {
        status: 520, err: err.message, message: ErrMap[ 520 ]
      }
    }
  };

  public reshareMetaShareKeeper = (
    index: number,
  ):
    | {
        status: number;
        data: {
          metaShare: MetaShare;
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
      const metaShare = this.levelhealth.reshareMetaShareKeeper( index )
      return {
        status: config.STATUS.SUCCESS, data: {
          metaShare
        }
      }
    } catch ( err ) {
      return {
        status: 520, err: err.message, message: ErrMap[ 520 ]
      }
    }
  };

  public restoreMetaShares = (
    metaShares: MetaShare[],
  ):
    | {
        status: number;
        data: {
          restored: boolean;
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
      const { restored } = this.sss.restoreMetaShares( metaShares )
      return {
        status: config.STATUS.SUCCESS, data: {
          restored
        }
      }
    } catch ( err ) {
      return {
        status: 520, err: err.message, message: ErrMap[ 520 ]
      }
    }
  };

  public restoreMetaSharesKeeper = (
    metaShares: MetaShare[],
  ):
    | {
        status: number;
        data: {
          restored: boolean;
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
      const { restored } = this.levelhealth.restoreMetaSharesKeeper( metaShares )
      return {
        status: config.STATUS.SUCCESS, data: {
          restored
        }
      }
    } catch ( err ) {
      return {
        status: 520, err: err.message, message: ErrMap[ 520 ]
      }
    }
  };

  public createQR = (
    index: number,
  ):
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
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.levelhealth.createQR( index ),
      }
    } catch ( err ) {
      return {
        status: 521, err: err.message, message: ErrMap[ 521 ]
      }
    }
  };

  public prepareShareUploadables = (
    shareIndex: number,
    contactName: string,
    dynamicNonPMDD?: MetaShare[],
  ):
    | {
        status: number;
        data: {
          otp: string;
          encryptedKey: string;
          encryptedMetaShare: string;
          messageId: string;
          encryptedDynamicNonPMDD: EncDynamicNonPMDD;
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
        data: this.sss.prepareShareUploadables(
          shareIndex,
          contactName,
          dynamicNonPMDD,
        ),
      }
    } catch ( err ) {
      return {
        status: 523, err: err.message, message: ErrMap[ 523 ]
      }
    }
  };

  public prepareShareUploadablesKeeper = (
    shareIndex: number,
    contactName: string,
    dynamicNonPMDD?: MetaShare[],
  ):
    | {
        status: number;
        data: {
          otp: string;
          encryptedKey: string;
          encryptedMetaShare: string;
          messageId: string;
          encryptedDynamicNonPMDD: EncDynamicNonPMDD;
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
        data: this.levelhealth.prepareShareUploadablesKeeper(
          shareIndex,
          contactName,
          dynamicNonPMDD,
        ),
      }
    } catch ( err ) {
      return {
        status: 523, err: err.message, message: ErrMap[ 523 ]
      }
    }
  };

  public updateWalletImage = async (
    walletImage: WalletImage,
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
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.sss.updateWalletImage( walletImage ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to update Wallet Image',
      }
    }
  };

  public updateWalletImageKeeper = async (
    walletImage: WalletImage,
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
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.levelhealth.updateWalletImage( walletImage ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to update Wallet Image',
      }
    }
  };

  public fetchWalletImage = async (): Promise<
  | {
      status: number;
      data: {
        walletImage: WalletImage;
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
        data: await this.sss.fetchWalletImage(),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch Wallet Image',
      }
    }
  };

  public fetchWalletImageKeeper = async (): Promise<
    | {
        status: number;
        data: {
          walletImage: WalletImage;
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
        data: await this.levelhealth.fetchWalletImage(),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch Wallet Image',
      }
    }
  };

   public updateGuardianInMetaShare = async (
     shareId: string,
     name: string,
   ): Promise<
    | {
        status: number;
        data: MetaShare[];
      }
    | {
        status: number;
        err: any;
      }
  > => {
     try {
       return {
         status: config.STATUS.SUCCESS,
         data: ( await this.levelhealth.updateGuardianInMetaShare( shareId, name ) ).data,
       }
     } catch ( err ) {
       return {
         status: 0o1,
         err: err.message,
       }
     }

   };

  public static downloadSMShare = async (
    encryptedKey: string,
    otp?: string,
  ): Promise<
    | {
        status: number;
        data:
          | {
              metaShare: MetaShare;
              encryptedDynamicNonPMDD: EncDynamicNonPMDD;
            }
          | {
              metaShare: MetaShare;
              encryptedDynamicNonPMDD?: undefined;
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
        data: await LevelHealth.downloadSMShare( encryptedKey, otp ),
      }
    } catch ( err ) {
      return {
        status: 502, err: err.message, message: ErrMap[ 502 ]
      }
    }
  };

  public static removeUnwantedUnderCustody = async (
    metaShares: MetaShare[],
  ): Promise<
    | {
        status: number;
        data: {
          updationInfo: Array<{
            walletId: string;
            shareId: string;
            updated: boolean;
            updatedAt?: number;
            encryptedDynamicNonPMDD?: EncDynamicNonPMDD;
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
        data: await LevelHealth.removeUnwantedUnderCustody( metaShares ),
      }
    } catch ( err ) {
      return {
        status: 506, err: err.message, message: ErrMap[ 506 ]
      }
    }
  };

  public generateSMShares = (
    secondaryMnemonic: string,
    answer: string,
    tag: string,
    questionId: string,
    version: string,
    question?: string,
  ):
    | {
        status: number;
        data: {
          encryptedSecrets: string[];
          metaShares: MetaShare[];
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
      const { shares } = this.levelhealth.generateSMShares( secondaryMnemonic )
      console.log( 'secondaryMnemonic', secondaryMnemonic )
      console.log( 'shares', shares )
      const { encryptedSecrets } = this.levelhealth.encryptSecrets( shares, answer, true )
      console.log( 'shares', shares )
      const { metaShares } = this.levelhealth.createSMMetaSharesKeeper( secondaryMnemonic, tag, questionId, version, question )
      console.log( 'metaShares', metaShares )
      return {
        status: config.STATUS.SUCCESS, data: {
          encryptedSecrets, metaShares
        }
      }
    } catch ( err ) {
      return {
        status: 510, err: err.message, message: ErrMap[ 510 ]
      }
    }
  };

  public static uploadRequestedSMShare = async (
    encryptedKey: string,
    otp?: string,
    metaShare?: MetaShare,
    encryptedDynamicNonPMDD?: EncDynamicNonPMDD,
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
        data: await LevelHealth.uploadRequestedSMShare(
          encryptedKey,
          metaShare,
          otp,
          encryptedDynamicNonPMDD,
        ),
      }
    } catch ( err ) {
      return {
        status: 503, err: err.message, message: ErrMap[ 503 ]
      }
    }
  };

  public deleteSmSharesAndSM = async (): Promise<
    | {
        status: number;
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
      }
  > => {
    try {
      await this.levelhealth.deleteSmSharesAndSM()
      return {
        status: config.STATUS.SUCCESS
      }
    } catch ( err ) {
      return {
        status: 503, err: err.message, message: ErrMap[ 503 ]
      }
    }
  }

  public updateKeeperInfoToMetaShare = (
    keeperInfo: any, answer: string
  ):
    | {
        status: number;
        data: {
          metaShares: MetaShare[];
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
      const { metaShares } = this.levelhealth.updateKeeperInfoToMetaShare( keeperInfo, answer )
      return {
        status: config.STATUS.SUCCESS, data: {
          metaShares
        }
      }
    } catch ( err ) {
      return {
        status: 520, err: err.message, message: ErrMap[ 520 ]
      }
    }
  };

  public static downloadSMPDFShare = async (
    messageId: string,
    key: string
  ): Promise<
    | {
        status: number;
        data:
          | {
              metaShare: MetaShare;
              encryptedDynamicNonPMDD: EncDynamicNonPMDD;
            }
          | {
              metaShare: MetaShare;
              encryptedDynamicNonPMDD?: undefined;
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
        data: await LevelHealth.downloadSMPDFShare( messageId, key ),
      }
    } catch ( err ) {
      return {
        status: 502, err: err.message, message: ErrMap[ 502 ]
      }
    }
  };
}
