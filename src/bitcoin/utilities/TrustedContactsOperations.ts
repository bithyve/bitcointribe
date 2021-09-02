import {
  Streams,
  UnecryptedStreams,
  UnecryptedStreamData,
  StreamData,
  TrustedContact,
  ContactDetails,
  SecondaryStreamData,
  BackupStreamData,
  PrimaryStreamData,
  TrustedContactRelationTypes,
  Trusted_Contacts,
} from './Interface'
import crypto from 'crypto'
import config from '../HexaConfig'
import { BH_AXIOS } from '../../services/api'
import { AxiosResponse } from 'axios'
import idx from 'idx'
const { HEXA_ID } = config

export default class TrustedContactsOperations {
  static cipherSpec: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = config.CIPHER_SPEC;

   static getStreamId = ( walletId: string ): string =>
     crypto.createHash( 'sha256' ).update( walletId ).digest( 'hex' ).slice( 0, 9 );

   static generateKey = ( length: number ): string => {
     let result = ''
     const characters =
     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
     const charactersLength = characters.length
     for ( let itr = 0; itr < length; itr++ ) {
       result += characters.charAt( Math.floor( Math.random() * charactersLength ) )
     }
     return result
   };

   static deriveStandardKey = ( psuedoKey: string ): string => {
     let key = psuedoKey
     const hash = crypto.createHash( 'sha512' )
     key = hash.update( key ).digest( 'hex' )
     return key.slice( key.length - TrustedContactsOperations.cipherSpec.keyLength )
   };

   static encryptViaPsuedoKey = ( plainText: string, psuedoKey: string ): string => {
     const key = TrustedContactsOperations.deriveStandardKey( psuedoKey )
     const cipher = crypto.createCipheriv(
       TrustedContactsOperations.cipherSpec.algorithm,
       key,
       TrustedContactsOperations.cipherSpec.iv
     )
     let encrypted = cipher.update( plainText, 'utf8', 'hex' )
     encrypted += cipher.final( 'hex' )
     return encrypted
   }

   static decryptViaPsuedoKey = ( encryptedText: string, psuedoKey: string ): string => {
     const key = TrustedContactsOperations.deriveStandardKey( psuedoKey )
     const decipher = crypto.createDecipheriv(
       TrustedContactsOperations.cipherSpec.algorithm,
       key,
       TrustedContactsOperations.cipherSpec.iv
     )
     let decrypted = decipher.update( encryptedText, 'hex', 'utf8' )
     decrypted += decipher.final( 'utf8' )
     return decrypted
   }

  static encryptData = ( key: string, dataPacket: any ) => {
    key = key.slice(
      key.length - TrustedContactsOperations.cipherSpec.keyLength
    )
    const cipher = crypto.createCipheriv(
      TrustedContactsOperations.cipherSpec.algorithm,
      key,
      TrustedContactsOperations.cipherSpec.iv
    )
    dataPacket.validator = config.HEXA_ID
    let encrypted = cipher.update( JSON.stringify( dataPacket ), 'utf8', 'hex' )
    encrypted += cipher.final( 'hex' )
    return {
      encryptedData: encrypted,
    }
  };

  static decryptData = ( key: string, encryptedDataPacket: string ) => {
    key = key.slice(
      key.length - TrustedContactsOperations.cipherSpec.keyLength
    )
    const decipher = crypto.createDecipheriv(
      TrustedContactsOperations.cipherSpec.algorithm,
      key,
      TrustedContactsOperations.cipherSpec.iv
    )
    let decrypted = decipher.update( encryptedDataPacket, 'hex', 'utf8' )
    decrypted += decipher.final( 'utf8' )

    const data = JSON.parse( decrypted )
    if ( data.validator !== config.HEXA_ID )
      throw new Error(
        'Decryption failed, invalid validator for the following data packet'
      )

    return {
      data,
    }
  };

  static cacheOutstream = (
    contact: TrustedContact,
    channelKey: string,
    unencryptedOutstreamUpdates: UnecryptedStreamData,
    secondaryChannelKey?: string
  ): StreamData => {
    const { streamId, primaryData, secondaryData, backupData, metaData } =
      unencryptedOutstreamUpdates
    let outstreamUpdates: StreamData
    if ( !contact.permanentChannel ) {
      // setup permanent channel and output stream
      const unencryptedOutStream: UnecryptedStreamData = {
        streamId,
        primaryData,
        metaData,
      }
      contact.unencryptedPermanentChannel = {
        [ streamId ]: unencryptedOutStream,
      }

      const primaryEncryptedData = primaryData
        ? TrustedContactsOperations.encryptData( channelKey, primaryData ).encryptedData
        : null
      const secondaryEncryptedData =
        secondaryData && secondaryChannelKey
          ? TrustedContactsOperations.encryptData( secondaryChannelKey, secondaryData ).encryptedData
          : null
      const encryptedBackupData = backupData
        ? TrustedContactsOperations.encryptData( channelKey, backupData ).encryptedData
        : null

      const outstream: StreamData = {
        streamId,
        primaryEncryptedData,
        metaData: unencryptedOutStream.metaData,
      }
      contact.permanentChannel = {
        [ streamId ]: outstream,
      }

      outstreamUpdates = {
        ...outstream,
        secondaryEncryptedData,
        encryptedBackupData,
      }
    } else {
      // update output stream
      const unencryptedOutstream = (
        contact.unencryptedPermanentChannel as UnecryptedStreams
      )[ streamId ]
      const outstream = ( contact.permanentChannel as Streams )[ streamId ]
      outstreamUpdates = {
        streamId: unencryptedOutstream.streamId,
      }

      if ( primaryData ) {
        if( primaryData.paymentAddresses ){
          primaryData.paymentAddresses = {
            ...unencryptedOutstream.primaryData.paymentAddresses,
            ...primaryData.paymentAddresses
          }
        }
        unencryptedOutstream.primaryData = {
          ...unencryptedOutstream.primaryData,
          ...primaryData,
        }
        const primaryEncryptedData = TrustedContactsOperations.encryptData(
          channelKey,
          unencryptedOutstream.primaryData
        ).encryptedData
        outstream.primaryEncryptedData = primaryEncryptedData
        outstreamUpdates.primaryEncryptedData = primaryEncryptedData
        contact.relationType = idx( primaryData, ( _ ) => _.relationType )
      }

      if ( secondaryData && secondaryChannelKey )
        outstreamUpdates.secondaryEncryptedData = TrustedContactsOperations.encryptData(
          secondaryChannelKey,
          secondaryData
        ).encryptedData
      else if ( secondaryData === null )
        outstreamUpdates.secondaryEncryptedData = null
      if( secondaryChannelKey ) contact.secondaryChannelKey = secondaryChannelKey // execution case: when a contact is upgraded to a keeper

      if ( backupData )
        outstreamUpdates.encryptedBackupData = TrustedContactsOperations.encryptData(
          channelKey,
          backupData
        ).encryptedData
      else if ( backupData === null ) outstreamUpdates.encryptedBackupData = null

      if ( metaData ) {
        const newFlags = idx( metaData, ( _ ) => _.flags ) || {
        }
        const updatedFlags = {
          ...unencryptedOutstream.metaData.flags,
          ...newFlags,
        }

        unencryptedOutstream.metaData = {
          ...unencryptedOutstream.metaData,
          ...metaData,
          flags: updatedFlags,
        }
        outstream.metaData = unencryptedOutstream.metaData
        outstreamUpdates.metaData = unencryptedOutstream.metaData
        if( updatedFlags.active !== undefined ) contact.isActive = updatedFlags.active
      }
    }
    return outstreamUpdates
  };

  static cacheInstream = (
    contact: TrustedContact,
    channelKey: string,
    instreamUpdates: StreamData
  ) => {
    let encryptedInstream =
      contact.permanentChannel[ instreamUpdates.streamId ] || {
      }
    let unencryptedInstream =
      contact.unencryptedPermanentChannel[ instreamUpdates.streamId ] || {
      }

    encryptedInstream = {
      ...encryptedInstream,
      ...instreamUpdates,
    }

    unencryptedInstream = {
      ...unencryptedInstream,
      streamId: instreamUpdates.streamId,
      primaryData: instreamUpdates.primaryEncryptedData
        ? TrustedContactsOperations.decryptData(
          channelKey,
          instreamUpdates.primaryEncryptedData
        ).data
        : ( unencryptedInstream as UnecryptedStreamData ).primaryData,
      metaData: instreamUpdates.metaData
        ? instreamUpdates.metaData
        : ( unencryptedInstream as UnecryptedStreamData ).metaData,
    }

    contact.permanentChannel[ instreamUpdates.streamId ] =
      encryptedInstream as StreamData
    contact.unencryptedPermanentChannel[ instreamUpdates.streamId ] =
      unencryptedInstream as UnecryptedStreamData;

    ( contact.streamId = ( unencryptedInstream as UnecryptedStreamData ).streamId ),
    ( contact.isActive = idx(
      ( unencryptedInstream as UnecryptedStreamData ).metaData,
      ( _ ) => _.flags.active
    ) )
    contact.hasNewData = idx(
      ( unencryptedInstream as UnecryptedStreamData ).metaData,
      ( _ ) => _.flags.newData
    )
    if ( !contact.walletID )
      contact.walletID = idx(
        ( unencryptedInstream as UnecryptedStreamData ).primaryData,
        ( _ ) => _.walletID
      )

    const relationshipType = idx(
      ( unencryptedInstream as UnecryptedStreamData ).primaryData,
      ( _ ) => _.relationType
    )

    if( relationshipType ){
      if (
        [
          TrustedContactRelationTypes.WARD,
          TrustedContactRelationTypes.KEEPER_WARD,
        ].includes( contact.relationType ) &&
        [ TrustedContactRelationTypes.CONTACT ].includes( relationshipType )
      )
        delete contact.contactsSecondaryChannelKey
      if ( [ TrustedContactRelationTypes.KEEPER, TrustedContactRelationTypes.PRIMARY_KEEPER ].includes( relationshipType ) )
        contact.relationType = TrustedContactRelationTypes.WARD
      else if ( relationshipType === TrustedContactRelationTypes.WARD )
        contact.secondaryChannelKey = null
      else contact.relationType = relationshipType
    }
  };

  static syncPermanentChannels = async (
    channelSyncDetails: {
      channelKey: string;
      streamId: string;
      contact?: TrustedContact;
      contactDetails?: ContactDetails;
      secondaryChannelKey?: string;
      unEncryptedOutstreamUpdates?: UnecryptedStreamData;
      contactsSecondaryChannelKey?: string;
      metaSync?: boolean;
    }[]
  ): Promise<{
    updated: boolean;
    updatedContacts: Trusted_Contacts;
  }> => {
    try {
      const channelMapping = {
      }
      const channelOutstreams = {
      }

      for ( let {
        channelKey,
        streamId,
        contact,
        contactDetails,
        secondaryChannelKey,
        unEncryptedOutstreamUpdates,
        contactsSecondaryChannelKey,
        metaSync,
      } of channelSyncDetails ) {

        if ( !contact ) { // initialize contact
          if ( !contactDetails )
            throw new Error( 'Init failed: contact details missing' )
          const newContact: TrustedContact = {
            contactDetails,
            channelKey,
            permanentChannelAddress: crypto
              .createHash( 'sha256' )
              .update( channelKey )
              .digest( 'hex' ),
            relationType: idx(
              unEncryptedOutstreamUpdates,
              ( _ ) => _.primaryData.relationType
            ),
            secondaryChannelKey,
            contactsSecondaryChannelKey,
            isActive: true,
            hasNewData: true,
          }
          contact = newContact
        }

        if ( !contact.isActive ) continue // skip non-active contacts
        if( contactsSecondaryChannelKey ) contact.contactsSecondaryChannelKey = contactsSecondaryChannelKey // execution case: when a contact is upgraded to a keeper

        // auto-update last seen(if flags aren't already present)
        if ( !unEncryptedOutstreamUpdates || !idx( unEncryptedOutstreamUpdates, _ => _.metaData.flags ) ){
          if( !unEncryptedOutstreamUpdates ) unEncryptedOutstreamUpdates = {
            streamId,
            metaData: {
              flags: {
                lastSeen: Date.now()
              }
            }
          }
          else if( !idx( unEncryptedOutstreamUpdates, _ => _.metaData.flags ) ) {
            unEncryptedOutstreamUpdates = {
              ...unEncryptedOutstreamUpdates,
              metaData: {
                ...unEncryptedOutstreamUpdates?.metaData,
                flags: {
                  lastSeen: Date.now()
                }
              }
            }
          }
        }

        const outstreamUpdates: StreamData = TrustedContactsOperations.cacheOutstream(
          contact,
          channelKey,
          unEncryptedOutstreamUpdates,
          secondaryChannelKey
        )

        channelMapping[ contact.permanentChannelAddress ] = {
          contact,
          channelKey,
        }
        channelOutstreams[ contact.permanentChannelAddress ] = {
          streamId,
          metaSync,
          outstreamUpdates,
        }
      }

      if ( Object.keys( channelOutstreams ).length ) {
        const res: AxiosResponse = await BH_AXIOS.post(
          'syncPermanentChannels',
          {
            HEXA_ID,
            channelOutstreams,
          }
        )

        const { channelInstreams } = res.data
        for ( const permanentChannelAddress of Object.keys( channelInstreams ) ) {
          const { updated, isActive, instream } =
            channelInstreams[ permanentChannelAddress ]
          const { contact, channelKey } =
            channelMapping[ permanentChannelAddress ]

          if ( !updated )
            console.log(
              'Failed to update permanent channel: ',
              permanentChannelAddress
            )
          if ( typeof isActive === 'boolean' )
            ( contact as TrustedContact ).isActive = isActive
          if ( instream ) TrustedContactsOperations.cacheInstream( contact, channelKey, instream )
        }

        // consolidate contact updates/creation
        const updatedContacts = {
        }
        Object.keys( channelMapping ).forEach( ( permanentChannelAddress ) => {
          const { contact, channelKey } =
            channelMapping[ permanentChannelAddress ]
          updatedContacts[ channelKey ] = contact
        } )

        return {
          updated: true, updatedContacts
        }
      } else throw new Error( 'No channels to update' )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
      throw new Error( err.message )
    }
  };

   static retrieveFromStream = async ( {
     walletId,
     channelKey,
     options,
     secondaryChannelKey,
   }: {
    walletId: string;
    channelKey: string;
    options: {
      retrievePrimaryData?: boolean;
      retrieveBackupData?: boolean;
      retrieveSecondaryData?: boolean;
    };
    secondaryChannelKey?: string;
  } ): Promise<{
    primaryData?: PrimaryStreamData;
    backupData?: BackupStreamData;
    secondaryData?: SecondaryStreamData;
  }> => {
     try {
       const permanentChannelAddress = crypto
         .createHash( 'sha256' )
         .update( channelKey )
         .digest( 'hex' )
       const streamId = TrustedContactsOperations.getStreamId( walletId )

       const res: AxiosResponse = await BH_AXIOS.post( 'retrieveFromStream', {
         HEXA_ID,
         permanentChannelAddress,
         streamId,
         options,
       } )

       const streamData: {
        primaryEncryptedData?: string;
        encryptedBackupData?: string;
        secondaryEncryptedData?: string;
      } = res.data.streamData

       const unencryptedStreamData: {
        primaryData?: PrimaryStreamData;
        backupData?: BackupStreamData;
        secondaryData?: SecondaryStreamData;
      } = {
      }
       if ( options.retrievePrimaryData && streamData.primaryEncryptedData )
         unencryptedStreamData.primaryData =
          TrustedContactsOperations.decryptData(
            channelKey,
            streamData.primaryEncryptedData
          ).data
       if ( options.retrieveBackupData && streamData.encryptedBackupData )
         unencryptedStreamData[ 'backupData' ] =
          TrustedContactsOperations.decryptData(
            channelKey,
            streamData.encryptedBackupData
          ).data
       if (
         options.retrieveSecondaryData &&
        streamData.secondaryEncryptedData &&
        secondaryChannelKey
       )
         unencryptedStreamData[ 'secondaryData' ] =
          TrustedContactsOperations.decryptData(
            secondaryChannelKey,
            streamData.secondaryEncryptedData
          ).data

       return unencryptedStreamData
     } catch ( err ) {
       if ( err.response ) throw new Error( err.response.data.err )
       if ( err.code ) throw new Error( err.code )
       throw new Error( err.message )
     }
   };

   static updateStream = async ( {
     channelKey,
     streamUpdates,
   }: {
   channelKey: string;
   streamUpdates: StreamData,
  } ): Promise<{
   updated: boolean;
  }> => {
     try {
       const permanentChannelAddress = crypto
         .createHash( 'sha256' )
         .update( channelKey )
         .digest( 'hex' )

       const res: AxiosResponse = await BH_AXIOS.post( 'updateStream', {
         HEXA_ID,
         permanentChannelAddress,
         streamUpdates
       } )

       const { updated } = res.data
       return {
         updated
       }
     } catch ( err ) {
       if ( err.response ) throw new Error( err.response.data.err )
       if ( err.code ) throw new Error( err.code )
       throw new Error( err.message )
     }
   };

   static restoreTrustedContacts = async ( {
     walletId,
     channelKeys,
   }: {
    walletId: string;
    channelKeys: string[];
    } ): Promise<Trusted_Contacts> => {
     try {

       const channelAddresses = channelKeys.map( ( channelKey ) =>
         crypto
           .createHash( 'sha256' )
           .update( channelKey )
           .digest( 'hex' )
       )
       const res: AxiosResponse = await BH_AXIOS.post( 'retrieveChannels', {
         HEXA_ID,
         channelAddresses,
       } )

       const permanentChannels: {
        [channelAddress: string]: Streams;
        } = res.data.permanentChannels
       if( !Object.keys( permanentChannels ).length ) throw new Error( 'Unable to recover trusted contacts: no permanent channels found' )

       const restoredContacts: Trusted_Contacts = {
       }
       const outstreamId = TrustedContactsOperations.getStreamId( walletId )
       let instreamId: string
       for ( const channelKey of channelKeys ) {
         const permanentChannelAddress = crypto
           .createHash( 'sha256' )
           .update( channelKey )
           .digest( 'hex' )

         const permanentChannel: Streams = permanentChannels[ permanentChannelAddress ]
         const unencryptedPermanentChannel: UnecryptedStreams = {
         }
         for( const streamId of Object.keys( permanentChannel ) ) {
           if( streamId !== outstreamId ) instreamId = streamId

           const stream: StreamData = permanentChannel[ streamId ]
           unencryptedPermanentChannel[ streamId ] = {
             streamId,
             primaryData: TrustedContactsOperations.decryptData( channelKey, stream.primaryEncryptedData ).data,
             secondaryData: stream.secondaryEncryptedData? TrustedContactsOperations.decryptData( channelKey, stream.secondaryEncryptedData ).data: null,
             backupData: stream.encryptedBackupData? TrustedContactsOperations.decryptData( channelKey, stream.encryptedBackupData ).data: null,
             metaData: stream.metaData
           }
         }

         const newContact: TrustedContact = {
           contactDetails: idx(
             unencryptedPermanentChannel,
             ( _ ) => _[ outstreamId ].primaryData.contactDetails
           ),
           relationType: idx(
             unencryptedPermanentChannel,
             ( _ ) => _[ outstreamId ].primaryData.relationType
           ),
           channelKey: channelKey,
           permanentChannelAddress,
           permanentChannel,
           unencryptedPermanentChannel,
           walletID: idx(
             unencryptedPermanentChannel,
             ( _ ) => _[ instreamId ].primaryData.walletID
           ),
           streamId: instreamId,
           isActive: idx(
             unencryptedPermanentChannel,
             ( _ ) => _[ instreamId ].metaData.flags.active
           ),
           hasNewData: idx(
             unencryptedPermanentChannel,
             ( _ ) => _[ instreamId ].metaData.flags.newData
           )
         }

         restoredContacts[ channelKey ] = newContact
       }

       return restoredContacts
     } catch ( err ) {
       if ( err.response ) throw new Error( err.response.data.err )
       if ( err.code ) throw new Error( err.code )
       throw new Error( err.message )
     }
   };
}
