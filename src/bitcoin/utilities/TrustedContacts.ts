import {
  Contacts,
  EphemeralDataElements,
  TrustedData,
  EncryptedTrustedData,
  TrustedDataElements,
  EphemeralData,
  EncryptedEphemeralData,
  ShareUploadables,
  MetaShare,
  EncDynamicNonPMDD,
  Streams,
  UnecryptedStreams,
  UnecryptedStreamData,
  StreamData,
  TrustedContact,
  Trusted_Contacts
} from './Interface'
import crypto from 'crypto'
import config from '../HexaConfig'
import { ec as EC } from 'elliptic'
import { BH_AXIOS } from '../../services/api'
import { AxiosResponse } from 'axios'
import SSS from './sss/SSS'
const ec = new EC( 'curve25519' )

const { HEXA_ID } = config

export default class TrustedContacts {
  public static cipherSpec: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = config.CIPHER_SPEC;

  public static generateRandomString = ( length: number ): string => {
    let randomString = ''
    const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for ( let itr = 0; itr < length; itr++ ) {
      randomString += possibleChars.charAt(
        Math.floor( Math.random() * possibleChars.length ),
      )
    }
    return randomString
  };

  public static generateOTP = ( otpLength: number ): string =>
    TrustedContacts.generateRandomString( otpLength );

  private static getDerivedKey = ( psuedoKey: string ): string => {
    const hashRounds = 1048
    let key = psuedoKey
    for ( let itr = 0; itr < hashRounds; itr++ ) {
      const hash = crypto.createHash( 'sha512' )
      key = hash.update( key ).digest( 'hex' )
    }
    return key.slice( key.length - TrustedContacts.cipherSpec.keyLength )
  };

  public static getStreamId = ( walletId: string ): string =>
    crypto
      .createHash( 'sha256' )
      .update( walletId )
      .digest( 'hex' ).slice( 0, 9 )

  public static encryptPub = (
    publicKey: string,
    key: string,
  ): { encryptedPub: string } => {
    const encryptionKey = TrustedContacts.getDerivedKey( key )

    const cipher = crypto.createCipheriv(
      TrustedContacts.cipherSpec.algorithm,
      encryptionKey,
      TrustedContacts.cipherSpec.iv,
    )

    const prefix = 'hexa:'
    let encryptedPub = cipher.update( prefix + publicKey, 'utf8', 'hex' )
    encryptedPub += cipher.final( 'hex' )

    return {
      encryptedPub
    }
  };

  public static decryptPub = (
    encryptedPub: string,
    key: string,
  ): {
    decryptedPub: string;
  } => {
    const decryptionKey = TrustedContacts.getDerivedKey( key )

    const decipher = crypto.createDecipheriv(
      TrustedContacts.cipherSpec.algorithm,
      decryptionKey,
      TrustedContacts.cipherSpec.iv,
    )

    let decryptedPub = decipher.update( encryptedPub, 'hex', 'utf8' )
    decryptedPub += decipher.final( 'utf8' )

    if ( decryptedPub.slice( 0, 5 ) !== 'hexa:' ) {
      throw new Error( 'PubKey decryption failed: invalid key' )
    }

    return {
      decryptedPub: decryptedPub.slice( 5 )
    }
  };

  public trustedContacts: Contacts = {
  };
  public trustedContactsV2: Trusted_Contacts;
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

  public decodePublicKey = ( publicKey: string ) => {
    const keyPair = ec.keyFromPublic( publicKey, 'hex' )
    return keyPair.getPublic()
  };

  public initializeContact = (
    contactName: string,
    encKey: string,
  ): { publicKey: string; ephemeralAddress: string } => {
    if ( this.trustedContacts[ contactName ] ) {
      throw new Error(
        'TC Init failed: initialization already exists against the supplied',
      )
    }

    if ( contactName.slice( 0, 20 ) === 'f&f request awaiting' ) {
      this.skippedContactsCount++
    }

    const keyPair = ec.genKeyPair()
    const publicKey = keyPair.getPublic( 'hex' )
    const privateKey = keyPair.getPrivate( 'hex' )

    const ephemeralAddress = crypto
      .createHash( 'sha256' )
      .update( publicKey )
      .digest( 'hex' )

    let otp
    if ( !encKey ) {
      // contact with no phone-number/email
      otp = TrustedContacts.generateOTP( parseInt( config.SSS_OTP_LENGTH, 10 ) )
      encKey = SSS.strechKey( otp )
    }

    this.trustedContacts[ contactName ] = {
      privateKey,
      publicKey,
      encKey,
      otp,
      ephemeralChannel: {
        address: ephemeralAddress
      },
    }

    return {
      publicKey, ephemeralAddress
    }
  };

  public finalizeContact = (
    contactName: string,
    encodedPublicKey: string,
    encKey: string,
    contactsWalletName?: string,
    isGuardian?: boolean,
  ): {
    channelAddress: string;
    ephemeralAddress: string;
    publicKey: string;
  } => {
    if ( !this.trustedContacts[ contactName ] ) {
      this.initializeContact( contactName, encKey ) // case: trusted contact setup has been requested
    }

    if (
      this.trustedContacts[ contactName ].trustedChannel &&
      this.trustedContacts[ contactName ].trustedChannel.address
    ) {
      throw new Error(
        'TC finalize failed: channel already exists with this contact',
      )
    }

    const { ephemeralChannel, privateKey } = this.trustedContacts[ contactName ]
    const keyPair = ec.keyFromPrivate( privateKey, 'hex' )
    const symmetricKey = keyPair
      .derive( this.decodePublicKey( encodedPublicKey ) )
      .toString( 16 ) // ECDH

    const channelAddress = crypto
      .createHash( 'sha256' )
      .update( symmetricKey )
      .digest( 'hex' )

    const ephemeralAddress = crypto
      .createHash( 'sha256' )
      .update( encodedPublicKey )
      .digest( 'hex' )

    this.trustedContacts[ contactName ] = {
      ...this.trustedContacts[ contactName ],
      symmetricKey,
      ephemeralChannel: {
        ...ephemeralChannel,
        address: ephemeralAddress,
      },
      trustedChannel: {
        address: channelAddress,
      },
      contactsPubKey: encodedPublicKey,
      contactsWalletName, // would help with contact name to wallet name mapping to aid recovery share provisioning
      isWard: isGuardian ? true : false,
    }
    return {
      channelAddress,
      ephemeralAddress,
      publicKey: keyPair.getPublic( 'hex' ),
    }
  };

  public updateEphemeralChannelData = (
    contactName: string,
    data: EphemeralDataElements,
  ): { updatedEphemeralDataElements: EphemeralDataElements } => {
    let ephemeralData = this.trustedContacts[ contactName ].ephemeralChannel.data
    let updatedEphemeralDataElements: EphemeralDataElements
    if ( ephemeralData ) {
      let updated = false
      for ( let index = 0; index < ephemeralData.length; index++ ) {
        if ( ephemeralData[ index ].publicKey === data.publicKey ) {
          ephemeralData[ index ] = {
            ...ephemeralData[ index ],
            ...data,
          }
          updatedEphemeralDataElements = ephemeralData[ index ]
          updated = true
          break
        }
      }

      if ( !updated ) {
        // counterparty's data reception for the first time
        ephemeralData.push( data )
        updatedEphemeralDataElements = data
        // update counterparty's walletId and FCM
        data.walletID
          ? ( this.trustedContacts[ contactName ].walletID = data.walletID )
          : null

        if ( data.FCM )
          this.trustedContacts[ contactName ].FCMs
            ? this.trustedContacts[ contactName ].FCMs.push( data.FCM )
            : ( this.trustedContacts[ contactName ].FCMs = [ data.FCM ] )

        this.trustedContacts[ contactName ].trustedAddress = data.trustedAddress
        this.trustedContacts[ contactName ].trustedTestAddress =
          data.trustedTestAddress
      }
    } else {
      ephemeralData = [ data ]
      updatedEphemeralDataElements = data
    }

    this.trustedContacts[ contactName ].ephemeralChannel.data = ephemeralData
    return {
      updatedEphemeralDataElements
    }
  };

  public processEphemeralChannelData = (
    contactName: string,
    encryptedData: EncryptedEphemeralData,
    key: string,
  ): EphemeralData => {
    const data: TrustedDataElements = this.decryptData(
      key,
      encryptedData.encryptedData,
    ).data

    const decryptedEphemeralData: EphemeralData = {
      publicKey: encryptedData.publicKey,
      data,
    }
    this.updateEphemeralChannelData( contactName, decryptedEphemeralData.data )
    return decryptedEphemeralData
  };

  public updateEphemeralChannel = async (
    contactName: string,
    dataElements: EphemeralDataElements,
    encKey: string,
    fetch?: boolean,
    shareUploadables?: ShareUploadables,
  ): Promise<
    | {
        updated: any;
        publicKey: string;
        data: EphemeralDataElements;
      }
    | {
        updated: any;
        publicKey: string;
        data?: undefined;
      }
  > => {
    try {
      if ( !this.trustedContacts[ contactName ] ) {
        this.initializeContact( contactName, encKey )
      }

      if ( this.trustedContacts[ contactName ].encKey )
        encKey = this.trustedContacts[ contactName ].encKey

      const { ephemeralChannel, publicKey } = this.trustedContacts[ contactName ]
      dataElements.publicKey = publicKey

      if ( dataElements.shareTransferDetails ) {
        this.trustedContacts[ contactName ].isGuardian = true
      }
      if ( dataElements.DHInfo )
        dataElements.DHInfo.address = ephemeralChannel.address

      const { updatedEphemeralDataElements } = this.updateEphemeralChannelData(
        contactName,
        dataElements,
      )

      let res: AxiosResponse
      if ( !encKey ) {
        // supporting versions prior to 1.1.0
        res = await BH_AXIOS.post( 'updateEphemeralChannel', {
          HEXA_ID,
          address: ephemeralChannel.address,
          data: dataElements,
          fetch,
          legacy: true,
        } )
      } else {
        let encryptedDataPacket: EncryptedEphemeralData
        if ( dataElements.DHInfo ) {
          encryptedDataPacket = {
            publicKey,
            encryptedData: null,
            DHInfo: dataElements.DHInfo,
          }
        } else {
          const ephemeralData: EphemeralData = {
            publicKey,
            data: updatedEphemeralDataElements,
          }

          const { encryptedData } = this.encryptData(
            encKey,
            ephemeralData.data,
          )

          encryptedDataPacket = {
            publicKey,
            encryptedData,
            walletID: updatedEphemeralDataElements.walletID,
          }
        }

        if ( shareUploadables && Object.keys( shareUploadables ).length ) {
          res = await BH_AXIOS.post( 'updateShareAndEC', {
            // EC update params
            HEXA_ID,
            address: ephemeralChannel.address,
            data: encryptedDataPacket,
            fetch,
            // upload share params
            share: shareUploadables.encryptedMetaShare,
            messageId: shareUploadables.messageId,
            encryptedDynamicNonPMDD: shareUploadables.encryptedDynamicNonPMDD,
          } )
        } else {
          res = await BH_AXIOS.post( 'updateEphemeralChannel', {
            HEXA_ID,
            address: ephemeralChannel.address,
            data: encryptedDataPacket,
            fetch,
          } )
        }
      }

      const { updated, initiatedAt, data } = res.data
      // console.log({ updated, initiatedAt, data });
      if ( !updated ) throw new Error( 'Failed to update ephemeral space' )
      if ( initiatedAt )
        this.trustedContacts[
          contactName
        ].ephemeralChannel.initiatedAt = initiatedAt

      if ( data && Object.keys( data ).length ) {
        if ( !encKey ) {
          this.updateEphemeralChannelData( contactName, data )
        }

        return {
          updated,
          publicKey,
          data: encKey
            ? this.processEphemeralChannelData( contactName, data, encKey ).data
            : data,
        }
      }

      return {
        updated, publicKey
      }
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
      throw new Error( err.message )
    }
  };

  public fetchEphemeralChannel = async (
    contactName: string,
    encKey: string,
    approveTC?: boolean,
    publicKey?: string,
  ): Promise<{
    data: EphemeralDataElements;
  }> => {
    try {
      let res: AxiosResponse

      if ( !publicKey ) {
        if ( !this.trustedContacts[ contactName ] ) {
          throw new Error( `No contact exist with contact name: ${contactName}` )
        }

        const { ephemeralChannel } = this.trustedContacts[ contactName ]

        res = await BH_AXIOS.post( 'fetchEphemeralChannel', {
          HEXA_ID,
          address: ephemeralChannel.address,
          identifier: this.trustedContacts[ contactName ].publicKey,
        } )
      } else {
        // if publicKey; fetch data without any storage
        const address = crypto
          .createHash( 'sha256' )
          .update( publicKey )
          .digest( 'hex' )
        res = await BH_AXIOS.post( 'fetchEphemeralChannel', {
          HEXA_ID,
          address,
          identifier: `!${publicKey}`, // anti-counterparty's pub
        } )
      }
      let { data } = res.data

      if ( !publicKey && data && Object.keys( data ).length ) {
        data = this.processEphemeralChannelData( contactName, data, encKey )
      }

      if ( !publicKey && approveTC ) {
        let contactsPublicKey
        this.trustedContacts[ contactName ].ephemeralChannel.data.forEach(
          ( element: EphemeralDataElements ) => {
            if (
              element.publicKey !== this.trustedContacts[ contactName ].publicKey
            ) {
              contactsPublicKey = element.publicKey
            }
          },
        ) // only one element would contain the public key (uploaded by the counterparty)

        if ( !contactsPublicKey ) {
          // console.log(`Approval failed, ${contactName}'s public key missing`);
          throw new Error(
            `Approval failed, ${contactName}'s public key missing`,
          )
        }

        this.finalizeContact( contactName, contactsPublicKey, encKey )
      }

      return {
        data
      }
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
      throw new Error( err.message )
    }
  };

  public updateTrustedChannelData = (
    contactName: string,
    newTrustedData: TrustedData,
  ): { updatedTrustedData; overallTrustedData: TrustedData[] } => {
    let trustedData: TrustedData[] = this.trustedContacts[ contactName ]
      .trustedChannel.data
      ? [ ...this.trustedContacts[ contactName ].trustedChannel.data ]
      : []
    let updatedTrustedData: TrustedData = newTrustedData
    if ( trustedData.length ) {
      let updated = false
      for ( let index = 0; index < trustedData.length; index++ ) {
        if ( trustedData[ index ].publicKey === newTrustedData.publicKey ) {
          trustedData[ index ].data = {
            ...trustedData[ index ].data,
            ...newTrustedData.data,
          }
          updated = true
          updatedTrustedData = trustedData[ index ]
          break
        }
      }

      if ( !updated ) {
        // counterparty's data reception for the first time
        trustedData.push( newTrustedData )
        // console.log({ newTrustedData });
        // update counterparty's walletId and FCM

        newTrustedData.data.walletID
          ? ( this.trustedContacts[ contactName ].walletID =
              newTrustedData.data.walletID )
          : null

        if ( newTrustedData.data.FCM )
          this.trustedContacts[ contactName ].FCMs
            ? this.trustedContacts[ contactName ].FCMs.push(
              newTrustedData.data.FCM,
            )
            : ( this.trustedContacts[ contactName ].FCMs = [
              newTrustedData.data.FCM,
            ] )
      }
    } else {
      trustedData = [ newTrustedData ]
    }

    // this.trustedContacts[contactName].trustedChannel.data = trustedData; save post updation
    return {
      updatedTrustedData, overallTrustedData: trustedData
    }
  };

  public processTrustedChannelData = (
    contactName: string,
    encryptedData: EncryptedTrustedData,
    symmetricKey: string,
  ): TrustedData => {
    const data: TrustedDataElements = this.decryptData(
      symmetricKey,
      encryptedData.encryptedData,
    ).data

    const decryptedTrustedData: TrustedData = {
      publicKey: encryptedData.publicKey,
      data,
      encDataHash: crypto
        .createHash( 'sha256' )
        .update( encryptedData.encryptedData )
        .digest( 'hex' ),
      lastSeen: encryptedData.lastSeen,
    }
    const { overallTrustedData } = this.updateTrustedChannelData(
      contactName,
      decryptedTrustedData,
    )
    this.trustedContacts[ contactName ].trustedChannel.data = overallTrustedData
    return decryptedTrustedData
  };

  public updateTrustedChannel = async (
    contactName: string,
    dataElements: TrustedDataElements,
    fetch?: boolean,
    shareUploadables?: ShareUploadables,
  ): Promise<
    | {
        updated: any;
        data: TrustedData;
      }
    | {
        updated: any;
        data?: undefined;
      }
  > => {
    try {
      if ( !this.trustedContacts[ contactName ] ) {
        throw new Error( `No contact exist with contact name: ${contactName}` )
      }

      if (
        !this.trustedContacts[ contactName ].trustedChannel &&
        !this.trustedContacts[ contactName ].trustedChannel.address
      ) {
        throw new Error(
          `Secure channel not formed with the following contact: ${contactName}`,
        )
      }

      const { trustedChannel, symmetricKey, publicKey } = this.trustedContacts[
        contactName
      ]

      const trustedData: TrustedData = {
        publicKey,
        data: dataElements,
      }
      const {
        updatedTrustedData,
        overallTrustedData,
      } = this.updateTrustedChannelData( contactName, trustedData )

      const { encryptedData } = this.encryptData(
        symmetricKey,
        updatedTrustedData.data,
      )

      const encryptedDataPacket: EncryptedTrustedData = {
        publicKey,
        encryptedData,
        dataHash: crypto
          .createHash( 'sha256' )
          .update( encryptedData )
          .digest( 'hex' ),
        lastSeen: Date.now(),
      }

      let res: AxiosResponse
      if ( shareUploadables && Object.keys( shareUploadables ).length ) {
        res = await BH_AXIOS.post( 'updateShareAndTC', {
          // EC update params
          HEXA_ID,
          address: trustedChannel.address,
          data: encryptedDataPacket,
          fetch,
          // upload share params
          share: shareUploadables.encryptedMetaShare,
          messageId: shareUploadables.messageId,
          encryptedDynamicNonPMDD: shareUploadables.encryptedDynamicNonPMDD,
        } )
      } else {
        // console.log('form data updateTrustedChannel', JSON.stringify({
        //   HEXA_ID,
        //   address: trustedChannel.address,
        //   data: encryptedDataPacket,
        //   fetch,
        // }))
        res = await BH_AXIOS.post( 'updateTrustedChannel', {
          HEXA_ID,
          address: trustedChannel.address,
          data: encryptedDataPacket,
          fetch,
        } )
      }
      console.log( 'updateTrustedChannel res Call', res )

      let { updated, data } = res.data
      if ( !updated ) throw new Error( 'Failed to update ephemeral space' )
      this.trustedContacts[
        contactName
      ].trustedChannel.data = overallTrustedData // save post updation

      if ( data ) {
        data = this.processTrustedChannelData( contactName, data, symmetricKey )
        const { walletName } = data.data ? data.data : {
          walletName: null
        }
        if ( walletName ) {
          this.trustedContacts[ contactName ] = {
            ...this.trustedContacts[ contactName ],
            contactsWalletName: walletName,
          }
        }
        return {
          updated, data
        }
      }
      return {
        updated
      }
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
      throw new Error( err.message )
    }
  };

  public fetchTrustedChannel = async (
    contactName: string,
    contactsWalletName?: string,
  ): Promise<{
    data: TrustedDataElements;
  }> => {
    try {
      if ( !this.trustedContacts[ contactName ] ) {
        throw new Error( `No contact exist with contact name: ${contactName}` )
      }

      if (
        !this.trustedContacts[ contactName ].trustedChannel &&
        !this.trustedContacts[ contactName ].trustedChannel.address
      ) {
        throw new Error(
          `Secure channel not formed with the following contact: ${contactName}`,
        )
      }

      const { trustedChannel, symmetricKey, publicKey } = this.trustedContacts[
        contactName
      ]

      const res = await BH_AXIOS.post( 'fetchTrustedChannel', {
        HEXA_ID,
        address: trustedChannel.address,
        identifier: publicKey,
      } )
      // console.log({ res });

      let { data } = res.data
      if ( data ) {
        data = this.processTrustedChannelData( contactName, data, symmetricKey )
          .data
        if ( data.walletName ) {
          this.trustedContacts[ contactName ] = {
            ...this.trustedContacts[ contactName ],
            contactsWalletName: data.walletName,
          }
        }
      }

      if ( contactsWalletName ) {
        this.trustedContacts[ contactName ] = {
          ...this.trustedContacts[ contactName ],
          contactsWalletName, // would help with contact name to wallet name mapping to aid recovery share provisioning
          isWard: contactsWalletName ? true : false,
        }
      }

      return {
        data,
      }
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
      throw new Error( err.message )
    }
  };

  public cacheOutstream = (
    contact: TrustedContact,
    channelKey: string,
    streamId: string,
    updates: {
      data?: any,
      backupData?: any
      isActive?: any
    }
  ) => {
    const { data, backupData, isActive } = updates
    if( !contact.permanentChannel ){
      // setup permanent channel and output stream
      const unencryptedOutStream: UnecryptedStreamData = {
        streamId,
        data,
        backupData
      }
      contact.unencryptedPermanentChannel = {
        [ streamId ]: unencryptedOutStream
      }

      const outstream: StreamData = {
        streamId,
        encryptedData : unencryptedOutStream.data? this.encryptData( channelKey, unencryptedOutStream.data ).encryptedData: null,
        encryptedBackupData : unencryptedOutStream.backupData? this.encryptData( channelKey, unencryptedOutStream.backupData ).encryptedData: null,
        flags: {
          active: true,
          lastSeen: Date.now(),
          newData: true,
        }
      }
      contact.permanentChannel = {
        [ streamId ]: outstream
      }
    } else {
      // update output stream
      const unencryptedOutstream = ( contact.unencryptedPermanentChannel as UnecryptedStreams )[ streamId ]
      const outstream = ( contact.permanentChannel as Streams )[ streamId ]

      if( data ){
        unencryptedOutstream.data = {
          ...unencryptedOutstream.data,
          data
        }
        outstream.encryptedData = this.encryptData( channelKey, unencryptedOutstream.data ).encryptedData
      }

      if( backupData ){
        unencryptedOutstream.backupData = {
          ...unencryptedOutstream.backupData,
          backupData
        }
        outstream.encryptedBackupData = this.encryptData( channelKey, unencryptedOutstream.backupData ).encryptedData
      }

      outstream.flags = {
        ...outstream.flags,
        active: isActive,
        lastSeen: Date.now(),
        newData: true,
      }
    }
  };

  public cacheInstream = (
    contact: TrustedContact,
    channelKey: string,
    inStream: StreamData,
  ) => {
    const unencryptedInstream: UnecryptedStreamData = {
      streamId: inStream.streamId,
      data: this.decryptData( channelKey, inStream.encryptedData ).data,
    }
    contact.unencryptedPermanentChannel[ inStream.streamId ] = unencryptedInstream
    contact.permanentChannel[ inStream.streamId ] = inStream
  };

  public syncPermanentChannel = async (
    channelKey: string,
    walletId: string,
    updates?: {
      data?: any,
      backupData?: any
      isActive?: any
    }
  ): Promise<{
    updated: boolean;
  }> => {
    try {

      let contact: TrustedContact = this.trustedContactsV2[ channelKey ]
      if ( !contact ) {
        // initialize contact
        const newContact: TrustedContact = {
          permanentChannelAddress: crypto
            .createHash( 'sha256' )
            .update( channelKey )
            .digest( 'hex' ),
        }
        this.trustedContactsV2[ channelKey ] = newContact
        contact = newContact
      }

      const streamId = TrustedContacts.getStreamId( walletId )
      if( updates )
        this.cacheOutstream( contact, channelKey, streamId, updates )

      const { permanentChannelAddress, permanentChannel } = ( this.trustedContactsV2[
        channelKey
      ] as TrustedContact )

      const res: AxiosResponse = await BH_AXIOS.post( 'syncPermanentChannel', {
        HEXA_ID,
        channelAddress: permanentChannelAddress,
        outStream: updates? permanentChannel[ streamId ]: null,
      } )
      console.log( {
        res
      } )

      const { updated, inStream } = res.data
      if ( !updated ) throw new Error( 'Failed to update permanent channel' )

      if( inStream ){
        this.cacheInstream( contact, channelKey, inStream )
      }

      return {
        updated
      }
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
      throw new Error( err.message )
    }
  };

  public syncLastSeens = async (): Promise<{
    updated: boolean;
  }> => {
    const channelsToUpdate = {
    }
    for ( const contact of Object.values( this.trustedContacts ) ) {
      const { trustedChannel, publicKey } = contact
      if ( trustedChannel ) {
        channelsToUpdate[ trustedChannel.address ] = {
          publicKey
        }
      }
    }

    if ( Object.keys( channelsToUpdate ).length ) {
      const res = await BH_AXIOS.post( 'syncLastSeens', {
        HEXA_ID,
        channelsToUpdate,
      } )

      const { updated, updatedLastSeens } = res.data
      // console.log({ updatedLastSeens });
      if ( Object.keys( updatedLastSeens ).length ) {
        for ( const contactName of Object.keys( this.trustedContacts ) ) {
          const { trustedChannel } = this.trustedContacts[ contactName ]
          if ( trustedChannel ) {
            const { publicKey, lastSeen } = updatedLastSeens[
              trustedChannel.address
            ] // counterparty's pub
            trustedChannel.data.forEach( ( subChan: TrustedData ) => {
              if ( subChan.publicKey === publicKey ) {
                subChan.lastSeen = lastSeen
                this.trustedContacts[ contactName ].lastSeen = lastSeen
              }
            } )
          }
        }
      }

      return {
        updated
      }
    } else {
      throw new Error( 'No trusted channels to update' )
    }
  };

  public walletCheckIn = async (
    metaShares: MetaShare[],
    healthCheckStatus,
    metaSharesUnderCustody: MetaShare[],
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
    for ( const contact of Object.values( this.trustedContacts ) ) {
      const { trustedChannel, publicKey } = contact
      if ( trustedChannel ) {
        channelsToUpdate[ trustedChannel.address ] = {
          publicKey
        }
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

    const res = await BH_AXIOS.post( 'walletCheckIn', {
      HEXA_ID,
      walletID: metaShares ? metaShares[ 0 ].meta.walletId : null,
      shareIDs: metaShares
        ? metaShares.map( ( metaShare ) => metaShare.shareId )
        : null, // legacy HC
      channelsToUpdate, // LS update
      toUpdate, // share under-custody update
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

    if ( Object.keys( updatedLastSeens ).length ) {
      for ( const contactName of Object.keys( this.trustedContacts ) ) {
        const { trustedChannel } = this.trustedContacts[ contactName ]
        if ( trustedChannel ) {
          const { publicKey, lastSeen } = updatedLastSeens[
            trustedChannel.address
          ] // counterparty's pub
          trustedChannel.data.forEach( ( subChan: TrustedData ) => {
            if ( subChan.publicKey === publicKey ) {
              subChan.lastSeen = lastSeen
              this.trustedContacts[ contactName ].lastSeen = lastSeen

              // update health via channel
              if ( lastSeen > 0 && metaShares ) {
                for ( let index = 0; index < metaShares.length; index++ ) {
                  if ( metaShares[ index ].meta.guardian === contactName ) {
                    healthCheckStatus[ index ] = {
                      shareId: metaShares[ index ].shareId,
                      updatedAt: lastSeen,
                      reshareVersion: healthCheckStatus[ index ]
                        ? healthCheckStatus[ index ].reshareVersion
                        : 0,
                    }
                  }
                }
              }
            }
          } )
        }
      }
    }

    return {
      updated,
      healthCheckStatus,
      updationInfo,
      exchangeRates,
      averageTxFees,
    }
  };

  public syncTrustedChannels = async (
    contacts?: Contacts,
  ): Promise<{
    synched: boolean;
    contactsToRemove: string[];
    guardiansToRemove: string[];
  }> => {
    const channelsToSync = {
    }
    for ( const contact of Object.values(
      contacts ? contacts : this.trustedContacts,
    ) ) {
      const { trustedChannel, publicKey } = contact
      if (
        trustedChannel &&
        trustedChannel.data &&
        trustedChannel.data.length === 2 // ensures channel-setup completion
      ) {
        let pub, dataHash
        trustedChannel.data.forEach( ( subChan: TrustedData ) => {
          if ( subChan.publicKey !== publicKey ) {
            // counter party's data
            pub = subChan.publicKey
            dataHash = subChan.encDataHash
          }
          channelsToSync[ trustedChannel.address ] = {
            publicKey: pub, dataHash
          }
        } )
      }
    }
    // console.log({ channelsToSync });
    if ( Object.keys( channelsToSync ).length ) {
      const res = await BH_AXIOS.post( 'syncTrustedChannels', {
        HEXA_ID,
        channelsToSync,
      } )

      const { synched, synchedChannels } = res.data
      // console.log({ synched, synchedChannels });

      const contactsToRemove = []
      const guardiansToRemove = []
      if ( Object.keys( synchedChannels ).length ) {
        for ( const contactName of Object.keys(
          contacts ? contacts : this.trustedContacts,
        ) ) {
          const contact = this.trustedContacts[ contactName ]
          const { trustedChannel, symmetricKey } = contact
          if ( trustedChannel && synchedChannels[ trustedChannel.address ] ) {
            const {
              publicKey,
              encryptedData,
              dataHash,
              lastSeen,
            } = synchedChannels[ trustedChannel.address ] // counterparty's pub
            trustedChannel.data.forEach( ( subChan: TrustedData ) => {
              if ( subChan.publicKey === publicKey ) {
                const decryptedData: TrustedDataElements = this.decryptData(
                  symmetricKey,
                  encryptedData,
                ).data
                if ( decryptedData.remove ) contactsToRemove.push( contactName )
                if ( decryptedData.removeGuardian )
                  guardiansToRemove.push( contactName )
                subChan.data = decryptedData
                subChan.encDataHash = dataHash
                subChan.lastSeen = lastSeen

                // updating FCMs, if any(post ward recovery)
                if ( decryptedData.FCM ){
                  if(  contact.FCMs ){
                    if( !contact.FCMs.includes( decryptedData.FCM ) )
                      this.trustedContacts[ contactName ].FCMs.push(
                        decryptedData.FCM,
                      )
                  } else {
                    this.trustedContacts[ contactName ].FCMs = [ decryptedData.FCM ]
                  }
                }

              }
            } )
          }
        }
      }

      return {
        synched, contactsToRemove, guardiansToRemove
      }
    } else {
      throw new Error( 'No trusted channels to update' )
    }
  };

  public initTCFromOldTC = (
    oldContactName: string,
    newContactName: string,
  ) => {
    try {
      this.trustedContacts[ newContactName ] = this.trustedContacts[ oldContactName ]
      return true
    } catch ( error ) {
      console.log( 'error finalize keeper', error )
      return false
    }
  };
}
