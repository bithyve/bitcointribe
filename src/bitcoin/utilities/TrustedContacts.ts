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
        secondaryData,
        backupData,
        metaData
      }
      contact.unencryptedPermanentChannel = {
        [ streamId ]: unencryptedOutStream
      }

      const outstream: StreamData = {
        streamId,
        primaryEncryptedData : unencryptedOutStream.primaryData? this.encryptData( channelKey, unencryptedOutStream.primaryData ).encryptedData: null,
        secondaryEncryptedData: unencryptedOutStream.secondaryData && secondaryChannelKey? this.encryptData( secondaryChannelKey, unencryptedOutStream.secondaryData ).encryptedData: null,
        encryptedBackupData : unencryptedOutStream.backupData? this.encryptData( channelKey, unencryptedOutStream.backupData ).encryptedData: null,
        metaData: unencryptedOutStream.metaData
      }
      contact.permanentChannel = {
        [ streamId ]: outstream
      }

      outstreamUpdates =  outstream
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
        outstream.primaryEncryptedData = this.encryptData( channelKey, unencryptedOutstream.primaryData ).encryptedData
        outstreamUpdates.primaryEncryptedData = outstream.primaryEncryptedData
      }

      if( secondaryData && secondaryChannelKey ){
        unencryptedOutstream.secondaryData = {
          ...unencryptedOutstream.secondaryData,
          ...secondaryData
        }
        outstream.secondaryEncryptedData = this.encryptData( secondaryChannelKey, unencryptedOutstream.secondaryData ).encryptedData
        outstreamUpdates.secondaryEncryptedData = outstream.secondaryEncryptedData
      } else if ( secondaryData === null ){
        unencryptedOutstream.secondaryData = null // remove secondary data
        outstream.secondaryEncryptedData = null
      }

      if( backupData ){
        unencryptedOutstream.backupData = {
          ...unencryptedOutstream.backupData,
          ...backupData
        }
        outstream.encryptedBackupData = this.encryptData( channelKey, unencryptedOutstream.backupData ).encryptedData
        outstreamUpdates.encryptedBackupData = outstream.encryptedBackupData
      } else if ( backupData === null ){
        unencryptedOutstream.backupData = null // remove backupData data
        outstream.encryptedBackupData = null
      }

      if( metaData ){
        unencryptedOutstream.metaData = {
          ...unencryptedOutstream.metaData,
          ...metaData
        }
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
    const channelsToUpdate = {
    }

    // TODO: modify last seen sync mech in accordance w/ new trusted contacts
    // for ( const contact of Object.values( this.trustedContacts ) ) {
    //   const { trustedChannel, publicKey } = contact
    //   if ( trustedChannel ) {
    //     channelsToUpdate[ trustedChannel.address ] = {
    //       publicKey
    //     }
    //   }
    // }

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
      walletID: metaShares ? metaShares[ 0 ].meta.walletId : null,
      shareIDs: metaShares
        ? metaShares.map( ( metaShare ) => metaShare.shareId )
        : null, // legacy HC
      channelsToUpdate, // LS update
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

    // if ( Object.keys( updatedLastSeens ).length ) {
    //   for ( const contactName of Object.keys( this.trustedContacts ) ) {
    //     const { trustedChannel } = this.trustedContacts[ contactName ]
    //     if ( trustedChannel ) {
    //       const { publicKey, lastSeen } = updatedLastSeens[
    //         trustedChannel.address
    //       ] // counterparty's pub
    //       trustedChannel.data.forEach( ( subChan: TrustedData ) => {
    //         if ( subChan.publicKey === publicKey ) {
    //           subChan.lastSeen = lastSeen
    //           this.trustedContacts[ contactName ].lastSeen = lastSeen

    //           // update health via channel
    //           if ( lastSeen > 0 && metaShares ) {
    //             for ( let index = 0; index < metaShares.length; index++ ) {
    //               if ( metaShares[ index ].meta.guardian === contactName ) {
    //                 healthCheckStatus[ index ] = {
    //                   shareId: metaShares[ index ].shareId,
    //                   updatedAt: lastSeen,
    //                   reshareVersion: healthCheckStatus[ index ]
    //                     ? healthCheckStatus[ index ].reshareVersion
    //                     : 0,
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       } )
    //     }
    //   }
    // }

    return {
      updated,
      healthCheckStatus,
      updationInfo,
      exchangeRates,
      averageTxFees,
    }
  };
}
