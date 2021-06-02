import TrustedContacts from '../utilities/TrustedContacts'
import config from '../HexaConfig'
import {
  Contacts,
  TrustedData,
  EphemeralDataElements,
  TrustedDataElements,
  ShareUploadables,
  MetaShare,
  EncDynamicNonPMDD,
  UnecryptedStreamData,
  ContactDetails,
  Trusted_Contacts,
} from '../utilities/Interface'

export default class TrustedContactsService {
  public static fromJSON = ( json: string ) => {
    const { tc } = JSON.parse( json )
    const {
      trustedContacts,
      trustedContactsV2,
      skippedContactsCount,
    }: {
      trustedContacts: Contacts;
      trustedContactsV2: Trusted_Contacts;
      skippedContactsCount: number;
    } = tc

    return new TrustedContactsService( {
      trustedContacts,
      trustedContactsV2,
      skippedContactsCount,
    } )
  };

  public static encryptPub = (
    publicKey: string,
    key: string,
  ): { encryptedPub: string } => TrustedContacts.encryptPub( publicKey, key );

  public static decryptPub = (
    encryptedPub: string,
    key: string,
  ): {
    decryptedPub: string;
  } => TrustedContacts.decryptPub( encryptedPub, key );

  public tc: TrustedContacts;
  constructor( stateVars? ) {
    this.tc = new TrustedContacts( stateVars )
  }

  public initializeContact = (
    contactName: string,
    encKey: string,
  ):
    | {
        status: number;
        data: {
          publicKey: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.tc.initializeContact(
          contactName.toLowerCase().trim(),
          encKey,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to setup contact',
      }
    }
  };

  public finalizeContact = (
    contactName: string,
    encodedPublicKey: string,
    encKey: string,
    contactsWalletName?: string,
    isGuardian?: boolean,
  ):
    | {
        status: number;
        data: {
          channelAddress: string;
          ephemeralAddress: string;
          publicKey: string;
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
        data: this.tc.finalizeContact(
          contactName.toLowerCase().trim(),
          encodedPublicKey,
          encKey,
          contactsWalletName,
          isGuardian,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to finalize contact',
      }
    }
  };

  public updateEphemeralChannel = async (
    contactName: string,
    dataElements: EphemeralDataElements,
    encKey: string,
    fetch?: boolean,
    shareUploadables?: ShareUploadables,
  ): Promise<
    | {
        status: number;
        data:
          | {
              updated: any;
              publicKey: string;
              data: EphemeralDataElements;
            }
          | {
              updated: any;
              publicKey: string;
              data?: undefined;
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
        data: await this.tc.updateEphemeralChannel(
          contactName.toLowerCase().trim(),
          dataElements,
          encKey,
          fetch,
          shareUploadables,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to update ephemeral channel',
      }
    }
  };

  public fetchEphemeralChannel = async (
    contactName: string,
    encKey: string,
    approveTC?: boolean,
    publicKey?: string,
  ): Promise<
    | {
        status: number;
        data: {
          data: EphemeralDataElements;
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
        data: await this.tc.fetchEphemeralChannel(
          contactName ? contactName.toLowerCase().trim() : contactName,
          encKey,
          approveTC,
          publicKey,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch from ephemeral channel',
      }
    }
  };

  public updateTrustedChannel = async (
    channelKey: string,
    dataElements: TrustedDataElements,
    fetch?: boolean,
    shareUploadables?: ShareUploadables,
  ): Promise<
    | {
        status: number;
        data:
          | {
              updated: any;
              data: TrustedData;
            }
          | {
              updated: any;
              data?: undefined;
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
        data: await this.tc.updateTrustedChannel(
          channelKey,
          dataElements,
          fetch,
          shareUploadables,
        ),
      }
    } catch ( err ) {
      console.log( 'err', err )
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to update contact',
      }
    }
  };

  public fetchTrustedChannel = async (
    contactName: string,
    contactsWalletName?: string,
  ): Promise<
    | {
        status: number;
        data: {
          data: TrustedDataElements;
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
        data: await this.tc.fetchTrustedChannel(
          contactName.toLowerCase().trim(),
          contactsWalletName,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to fetch from contact',
      }
    }
  };

  public syncPermanentChannels = async (
    channelSyncDetails:
    {
    channelKey: string,
    streamId: string,
    contactDetails?: ContactDetails,
    secondaryChannelKey?: string,
    unEncryptedOutstreamUpdates?: UnecryptedStreamData,
    contactsSecondaryChannelKey?: string
  }[]
  ): Promise<
    | {
        status: number;
        data: { updated?: Boolean },
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
      return {
        status: config.STATUS.SUCCESS,
        data: await this.tc.syncPermanentChannels(
          channelSyncDetails
        )
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to sync permanent channels',
      }
    }
  };

  public walletCheckIn = async (
    metaShares: MetaShare[],
    healthCheckStatus,
    metaSharesUnderCustody: MetaShare[],
    currencyCode
  ): Promise<
    | {
        status: number;
        data: {
          updated: boolean;
          healthCheckStatus: any;
          updationInfo: Array<{
            walletId: string;
            shareId: string;
            updated: boolean;
            updatedAt?: number;
            encryptedDynamicNonPMDD?: EncDynamicNonPMDD;
            err?: string;
          }>;
          exchangeRates: { [currency: string]: number };
          averageTxFees;
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
        data: await this.tc.walletCheckIn(
          metaShares,
          healthCheckStatus,
          metaSharesUnderCustody,
          currencyCode
        ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to sync last seens',
      }
    }
  };

  public syncLastSeens = async (): Promise<
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
        data: await this.tc.syncLastSeens(),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to sync last seens',
      }
    }
  };

  public syncTrustedChannels = async (
    contacts?,
  ): Promise<
    | {
        status: number;
        data: {
          synched: boolean;
          contactsToRemove: string[];
          guardiansToRemove: string[];
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
        data: await this.tc.syncTrustedChannels( contacts ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to sync trusted channels',
      }
    }
  };

  public initTCFromOldTC = async (
    oldContactName: string,
    newContactName: string,
  ): Promise<
    | {
        status: number;
        data: boolean;
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
        data: this.tc.initTCFromOldTC( oldContactName, newContactName )
      }
    } catch ( err ) {
      console.log( 'err', err )
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to update contact',
      }
    }
  };
}
