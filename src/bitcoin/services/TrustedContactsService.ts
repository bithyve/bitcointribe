import TrustedContacts from '../utilities/TrustedContacts'
import config from '../HexaConfig'
import {
  UnecryptedStreamData,
  ContactDetails,
  Trusted_Contacts,
  PrimaryStreamData,
  BackupStreamData,
  SecondaryStreamData,
} from '../utilities/Interface'

export default class TrustedContactsService {
  public static fromJSON = ( json: string ) => {
    const { tc } = JSON.parse( json )
    const { trustedContacts, }: {
      trustedContacts: Trusted_Contacts;
    } = tc

    return new TrustedContactsService( {
      trustedContacts,
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
    metaSync?: boolean
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

  public retrieveFromStream = async (
    {
      walletId,
      channelKey,
      options,
      secondaryChannelKey
    }: {
    walletId: string,
    channelKey: string,
    options: {
      retrievePrimaryData?: boolean,
      retrieveBackupData?: boolean,
      retrieveSecondaryData?: boolean,
    }
    secondaryChannelKey?: string,
  }
  ): Promise<{
    status: number;
    data: {
        primaryData?: PrimaryStreamData;
        backupData?: BackupStreamData;
        secondaryData?: SecondaryStreamData;
    };
    err?: undefined;
    message?: undefined;
   }
  | {
    status: number;
    data?: undefined,
    err: string;
    message: string;
   }> => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.tc.retrieveFromStream(
          {
            walletId,
            channelKey,
            options,
            secondaryChannelKey
          }
        )
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to retrieve data from stream',
      }
    }
  };
}

