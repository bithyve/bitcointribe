import {
  MetaShare,
  EncDynamicNonPMDD,
  Streams,
  UnecryptedStreams,
  UnecryptedStreamData,
  StreamData,
  TrustedContact,
  Trusted_Contacts,
  ContactDetails
} from './Interface'
import crypto from 'crypto'
import config from '../HexaConfig'
import { BH_AXIOS } from '../../services/api'
import { AxiosResponse } from 'axios'
import idx from 'idx'
const { HEXA_ID } = config

export default class TrustedContacts {
  public static cipherSpec: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = config.CIPHER_SPEC;

  public static getStreamId = ( walletId: string ): string =>
    crypto
      .createHash( 'sha256' )
      .update( walletId )
      .digest( 'hex' ).slice( 0, 9 )

  public trustedContacts: Trusted_Contacts;
  public skippedContactsCount = 0;

  constructor( stateVars ) {
    this.initializeStateVars( stateVars )
  }

  public encryptData = ( key: string, dataPacket: any ) => {
    key = key.slice( key.length - TrustedContacts.cipherSpec.keyLength )
    const cipher = crypto.createCipheriv(
      TrustedContacts.cipherSpec.algorithm,
      key,
      TrustedContacts.cipherSpec.iv,
    )
    dataPacket.validator = config.HEXA_ID
    let encrypted = cipher.update( JSON.stringify( dataPacket ), 'utf8', 'hex' )
    encrypted += cipher.final( 'hex' )
    return {
      encryptedData: encrypted
    }
  };

  public decryptData = ( key: string, encryptedDataPacket: string ) => {
    key = key.slice( key.length - TrustedContacts.cipherSpec.keyLength )
    const decipher = crypto.createDecipheriv(
      TrustedContacts.cipherSpec.algorithm,
      key,
      TrustedContacts.cipherSpec.iv,
    )
    let decrypted = decipher.update( encryptedDataPacket, 'hex', 'utf8' )
    decrypted += decipher.final( 'utf8' )

    const data = JSON.parse( decrypted )
    if ( data.validator !== config.HEXA_ID ) {
      throw new Error(
        'Decryption failed, invalid validator for the following data packet',
      )
    }
    return {
      data
    }
  };

  public initializeStateVars = ( stateVars ) => {
    this.trustedContacts =
      stateVars && stateVars.trustedContacts ? stateVars.trustedContacts : {
      }
    this.skippedContactsCount =
      stateVars && stateVars.skippedContactsCount
        ? stateVars.skippedContactsCount
        : this.skippedContactsCount
  };

  public cacheOutstream = (
    contact: TrustedContact,
    channelKey: string,
    unencryptedOutstreamUpdates: UnecryptedStreamData,
    secondaryChannelKey?: string,
  ): StreamData => {

    const { streamId, primaryData, secondaryData, backupData, metaData } = unencryptedOutstreamUpdates
    let outstreamUpdates: StreamData
    if( !contact.permanentChannel ){
      // setup permanent channel and output stream
      const unencryptedOutStream: UnecryptedStreamData = {
        streamId,
        primaryData,
        metaData
      }
      contact.unencryptedPermanentChannel = {
        [ streamId ]: unencryptedOutStream
      }

      const primaryEncryptedData = primaryData? this.encryptData( channelKey, primaryData ).encryptedData: null
      const secondaryEncryptedData = secondaryData && secondaryChannelKey? this.encryptData( secondaryChannelKey, secondaryData ).encryptedData: null
      const encryptedBackupData = backupData? this.encryptData( channelKey, backupData ).encryptedData: null

      const outstream: StreamData = {
        streamId,
        primaryEncryptedData,
        metaData: unencryptedOutStream.metaData
      }
      contact.permanentChannel = {
        [ streamId ]: outstream
      }

      outstreamUpdates = {
        ...outstream,
        secondaryEncryptedData,
        encryptedBackupData
      }
    } else {
      // update output stream
      const unencryptedOutstream = ( contact.unencryptedPermanentChannel as UnecryptedStreams )[ streamId ]
      const outstream = ( contact.permanentChannel as Streams )[ streamId ]
      outstreamUpdates = {
        streamId: unencryptedOutstream.streamId
      }

      if( primaryData ){
        unencryptedOutstream.primaryData = {
          ...unencryptedOutstream.primaryData,
          ...primaryData
        }
        const primaryEncryptedData = this.encryptData( channelKey, unencryptedOutstream.primaryData ).encryptedData
        outstream.primaryEncryptedData = primaryEncryptedData
        outstreamUpdates.primaryEncryptedData = primaryEncryptedData
      }

      if( secondaryData && secondaryChannelKey )
        outstreamUpdates.secondaryEncryptedData = this.encryptData( secondaryChannelKey, secondaryData ).encryptedData
      else if ( secondaryData === null )
        outstreamUpdates.secondaryEncryptedData = null


      if( backupData )
        outstreamUpdates.encryptedBackupData = this.encryptData( channelKey, backupData ).encryptedData
      else if ( backupData === null )
        outstreamUpdates.encryptedBackupData = null


      if( metaData ){
        unencryptedOutstream.metaData = {
          ...unencryptedOutstream.metaData,
          ...metaData
        }
        outstream.metaData = unencryptedOutstream.metaData
        outstreamUpdates.metaData = unencryptedOutstream.metaData
        contact.isActive = idx( metaData, ( _ ) => _.flags.active )
      }
    }
    return outstreamUpdates
  };

  public cacheInstream = (
    contact: TrustedContact,
    channelKey: string,
    inStream: StreamData,
  ) => {
    const unencryptedInstream: UnecryptedStreamData = {
      streamId: inStream.streamId,
      primaryData: this.decryptData( channelKey, inStream.primaryEncryptedData ).data,
      metaData: inStream.metaData,
    }
    contact.unencryptedPermanentChannel[ inStream.streamId ] = unencryptedInstream
    contact.permanentChannel[ inStream.streamId ] = inStream
    contact.isActive = idx( inStream.metaData, ( _ ) => _.flags.active )
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
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      const channelMapping = {
      }
      const channelOutstreams = {
      }
      for ( const { channelKey, streamId, contactDetails, secondaryChannelKey, unEncryptedOutstreamUpdates, contactsSecondaryChannelKey } of channelSyncDetails ){
        let contact: TrustedContact = this.trustedContacts[ channelKey ]

        if ( !contact ) {
        // initialize contact
          if( !contactDetails ) throw new Error( 'Init failed: contact details missing' )
          const newContact: TrustedContact = {
            contactDetails,
            isActive: true,
            permanentChannelAddress: crypto
              .createHash( 'sha256' )
              .update( channelKey )
              .digest( 'hex' ),
            relationType: idx( unEncryptedOutstreamUpdates, ( _ ) => _.primaryData.relationType ),
            secondaryChannelKey,
            contactsSecondaryChannelKey
          }
          this.trustedContacts[ channelKey ] = newContact
          contact = newContact
        }

        if( !contact.isActive ) continue // skip non-active contacts

        let outstreamUpdates: StreamData
        if( unEncryptedOutstreamUpdates )
          outstreamUpdates = this.cacheOutstream( contact, channelKey, unEncryptedOutstreamUpdates, secondaryChannelKey )

        const { permanentChannelAddress } = ( this.trustedContacts[
          channelKey
        ] as TrustedContact )

        channelMapping[ permanentChannelAddress ] = {
          contact, channelKey
        }
        channelOutstreams[ permanentChannelAddress ] = {
          streamId,
          outstreamUpdates
        }
      }

      if( Object.keys( channelOutstreams ).length ){
        const res: AxiosResponse = await BH_AXIOS.post( 'syncPermanentChannels', {
          HEXA_ID,
          channelOutstreams,
        } )

        const { channelInstreams } = res.data
        for( const permanentChannelAddress of Object.keys( channelInstreams ) ){
          const { updated, isActive, instream } = channelInstreams[ permanentChannelAddress ]
          const { contact, channelKey } = channelMapping[ permanentChannelAddress ]

          if ( !updated ) console.log( 'Failed to update permanent channel: ', permanentChannelAddress )
          if( typeof isActive === 'boolean' ) ( contact as TrustedContact ).isActive = isActive
          if( instream ) this.cacheInstream( contact, channelKey, instream )
        }

        return {
          updated: true
        }
      } else throw new Error( 'No channels to update' )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
      throw new Error( err.message )
    }
  };

  public walletCheckIn = async (
    walletId: string,
    metaShares: MetaShare[],
    healthCheckStatus,
    metaSharesUnderCustody: MetaShare[],
    currencyCode
  ): Promise<{
    updated: boolean;
    healthCheckStatus;
    updationInfo: Array<{
      walletId: string;
      shareId: string;
      updated: boolean;
      updatedAt?: number;
      encryptedDynamicNonPMDD?: EncDynamicNonPMDD;
      err?: string;
    }>;
    exchangeRates: { [currency: string]: number };
    averageTxFees: any;
  }> => {
    const updateChannelsLS = {
    }
    const channelAddressToKeyMapping = {
    }
    const outStreamId = TrustedContacts.getStreamId( walletId )
    const currentTS = Date.now()

    for ( const channelKey of Object.keys( this.trustedContacts ) ) {
      const contact = this.trustedContacts[ channelKey ]
      const { permanentChannelAddress, permanentChannel, isActive } = contact
      if( isActive && Object.keys( permanentChannel ).length > 1 ){ // contact established(in-stream available)
        contact.unencryptedPermanentChannel[ outStreamId ].metaData.flags.lastSeen = currentTS
        contact.permanentChannel[ outStreamId ].metaData.flags.lastSeen = currentTS
        updateChannelsLS[ permanentChannelAddress ] = {
          lastSeen: currentTS
        }
        channelAddressToKeyMapping[ permanentChannelAddress ] = channelKey
      }
    }

    const toUpdate = [] // healths to update(shares under custody)
    for ( const share of metaSharesUnderCustody ) {
      toUpdate.push( {
        walletId: share.meta.walletId,
        shareId: share.shareId,
        reshareVersion: share.meta.reshareVersion,
      } )
    }

    const res = await BH_AXIOS.post( 'v2/walletCheckIn', {
      HEXA_ID,
      walletID: walletId,
      shareIDs: metaShares
        ? metaShares.map( ( metaShare ) => metaShare.shareId )
        : null, // legacy HC
      updateChannelsLS, // LS update
      toUpdate, // share under-custody update
      ...currencyCode && {
        currencyCode
      },
    } )

    const {
      updated,
      updatedLastSeens,
      exchangeRates,
      averageTxFees,
    } = res.data // LS data & exchange rates
    const { updationInfo } = res.data // share under-custody update info
    const updates: Array<{
      shareId: string;
      updatedAt: number;
      reshareVersion: number;
    }> = res.data.lastUpdateds // legacy HC
    // console.log({ updatedLastSeens, updates, updationInfo });

    // synching health: legacy
    if ( metaShares && updates.length ) {
      for ( const { shareId, updatedAt, reshareVersion } of updates ) {
        for ( let index = 0; index < metaShares.length; index++ ) {
          if ( metaShares[ index ] && metaShares[ index ].shareId === shareId ) {
            if ( healthCheckStatus[ index ] ) {
              const currentReshareVersion =
                healthCheckStatus[ index ].reshareVersion !== undefined
                  ? healthCheckStatus[ index ].reshareVersion
                  : 0

              if ( reshareVersion < currentReshareVersion ) continue // skipping health updation from previous keeper(while the share is still not removed from keeper's device)
            }

            healthCheckStatus[ index ] = {
              shareId,
              updatedAt,
              reshareVersion,
            }
          }
        }
      }
    }

    Object.keys( updatedLastSeens ).forEach( ( permanentChannelAddress ) => {
      const { lastSeen, instreamId } = updatedLastSeens[ permanentChannelAddress ]
      const channelKey = channelAddressToKeyMapping[ permanentChannelAddress ]

      const contact = this.trustedContacts[ channelKey ]
      contact.unencryptedPermanentChannel[ instreamId ].metaData.flags.lastSeen = lastSeen
      contact.permanentChannel[ instreamId ].metaData.flags.lastSeen = lastSeen
    } )

    return {
      updated,
      healthCheckStatus,
      updationInfo,
      exchangeRates,
      averageTxFees,
    }
  };
}
