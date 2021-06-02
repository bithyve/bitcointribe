import TrustedContacts from '../utilities/TrustedContacts'
import config from '../HexaConfig'
import {
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
      skippedContactsCount,
    }: {
      trustedContacts: Trusted_Contacts;
      skippedContactsCount: number;
    } = tc

    return new TrustedContactsService( {
      trustedContacts,
      skippedContactsCount,
    } )
  };

  public tc: TrustedContacts;
  constructor( stateVars? ) {
    this.tc = new TrustedContacts( stateVars )
  }

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
}
