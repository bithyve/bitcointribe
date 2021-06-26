import {
  Streams,
  UnecryptedStreams,
  UnecryptedStreamData,
  StreamData,
  TrustedContact,
  Trusted_Contacts,
  ContactDetails,
  SecondaryStreamData,
  BackupStreamData,
  PrimaryStreamData,
  TrustedContactRelationTypes
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

  public static decryptData = ( key: string, encryptedDataPacket: string ) => {
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
        contact.relationType = idx( primaryData, ( _ ) => _.relationType )
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
    instreamUpdates: StreamData,
  ) => {
    let encryptedInstream = contact.permanentChannel[ instreamUpdates.streamId ] || {
    }
    let unencryptedInstream = contact.unencryptedPermanentChannel[ instreamUpdates.streamId ] || {
    }

    encryptedInstream = {
      ...encryptedInstream,
      ...instreamUpdates,
    }

    unencryptedInstream = {
      ...unencryptedInstream,
      streamId: instreamUpdates.streamId,
      primaryData: instreamUpdates.primaryEncryptedData? TrustedContacts.decryptData( channelKey, instreamUpdates.primaryEncryptedData ).data: ( unencryptedInstream as UnecryptedStreamData ).primaryData,
      metaData: instreamUpdates.metaData? instreamUpdates.metaData: ( unencryptedInstream as UnecryptedStreamData ).metaData,
    }

    contact.permanentChannel[ instreamUpdates.streamId ] = ( encryptedInstream as StreamData )
    contact.unencryptedPermanentChannel[ instreamUpdates.streamId ] = ( unencryptedInstream as UnecryptedStreamData )

    contact.streamId = ( unencryptedInstream as UnecryptedStreamData ).streamId,
    contact.isActive = idx( ( unencryptedInstream as UnecryptedStreamData ).metaData, ( _ ) => _.flags.active )
    contact.hasNewData = idx( ( unencryptedInstream as UnecryptedStreamData ).metaData, ( _ ) => _.flags.newData )
    if( !contact.walletID )
      contact.walletID = idx( ( unencryptedInstream as UnecryptedStreamData ).primaryData, ( _ ) => _.walletID )

    const relationshipType = idx( ( unencryptedInstream as UnecryptedStreamData ).primaryData, ( _ ) => _.relationType )
    if( [ TrustedContactRelationTypes.WARD, TrustedContactRelationTypes.KEEPER_WARD ].includes( contact.relationType ) && [ TrustedContactRelationTypes.CONTACT ].includes( relationshipType ) ) delete contact.contactsSecondaryChannelKey
    if( relationshipType === TrustedContactRelationTypes.KEEPER ) contact.relationType = TrustedContactRelationTypes.WARD
    else if( relationshipType === TrustedContactRelationTypes.WARD ) contact.relationType = TrustedContactRelationTypes.KEEPER
    else contact.relationType = relationshipType
  };

  public syncPermanentChannels = async (
    channelSyncDetails:
    {
    channelKey: string,
    streamId: string,
    contactDetails?: ContactDetails,
    secondaryChannelKey?: string,
    unEncryptedOutstreamUpdates?: UnecryptedStreamData,
    contactsSecondaryChannelKey?: string,
    metaSync?: boolean,
  }[]
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      const channelMapping = {
      }
      const channelOutstreams = {
      }
      for ( const { channelKey, streamId, contactDetails, secondaryChannelKey, unEncryptedOutstreamUpdates, contactsSecondaryChannelKey, metaSync } of channelSyncDetails ){
        let contact: TrustedContact = this.trustedContacts[ channelKey ]

        if ( !contact ) {
        // initialize contact
          if( !contactDetails ) throw new Error( 'Init failed: contact details missing' )
          const newContact: TrustedContact = {
            contactDetails,
            isActive: true,
            hasNewData: true,
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
          metaSync,
          outstreamUpdates,
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

  public static retrieveFromStream = async (
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
    primaryData?: PrimaryStreamData,
    backupData?: BackupStreamData,
    secondaryData?: SecondaryStreamData,
  }> => {
    try {
      const permanentChannelAddress = crypto
        .createHash( 'sha256' )
        .update( channelKey )
        .digest( 'hex' )
      const streamId = TrustedContacts.getStreamId( walletId )

      const res: AxiosResponse = await BH_AXIOS.post( 'retrieveFromStream', {
        HEXA_ID,
        permanentChannelAddress,
        streamId,
        options
      } )

      const streamData: {
        primaryEncryptedData?: string,
        encryptedBackupData?: string,
        secondaryEncryptedData?: string,
      } = res.data.streamData
      console.log( {
        streamData
      } )
      const unencryptedStreamData: {
        primaryData?: PrimaryStreamData,
        backupData?: BackupStreamData,
        secondaryData?: SecondaryStreamData,
      } = {
      }
      if( options.retrievePrimaryData && streamData.primaryEncryptedData )
        unencryptedStreamData.primaryData = TrustedContacts.decryptData( channelKey, streamData.primaryEncryptedData ).data
      if( options.retrieveBackupData && streamData.encryptedBackupData )
        unencryptedStreamData[ 'backupData' ] = TrustedContacts.decryptData( channelKey, streamData.encryptedBackupData ).data
      if( options.retrieveSecondaryData && streamData.secondaryEncryptedData && secondaryChannelKey )
        unencryptedStreamData[ 'secondaryData' ] = TrustedContacts.decryptData( secondaryChannelKey, streamData.secondaryEncryptedData ).data

      return unencryptedStreamData
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
      throw new Error( err.message )
    }
  };
}
