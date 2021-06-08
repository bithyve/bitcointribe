// types and action creators: dispatched by components and sagas
import {
  UnecryptedStreamData,
  ContactInfo,
} from '../../bitcoin/utilities/Interface'
import { ServicesJSON } from '../../common/interfaces/Interfaces'

export const SYNC_PERMANENT_CHANNELS = 'SYNC_PERMANENT_CHANNELS'
export const INITIALIZE_TRUSTED_CONTACT = 'INITIALIZE_TRUSTED_CONTACT'
export const REJECT_TRUSTED_CONTACT = 'REJECT_TRUSTED_CONTACT'
export const REMOVE_TRUSTED_CONTACT = 'REMOVE_TRUSTED_CONTACT'
export const WALLET_CHECK_IN = 'WALLET_CHECK_IN'

export enum PermanentChannelsSyncKind {
  SUPPLIED_CONTACTS = 'SUPPLIED_CONTACTS',
  EXISTING_CONTACTS = 'EXISTING_CONTACTS',
  NON_FINALIZED_CONTACTS = 'NON_FINALIZED_CONTACTS'
}

export const syncPermanentChannels = (
  {
    permanentChannelsSyncKind, // kind of channel sync
    channelUpdates, // out-stream updates for the channels
    metaSync,   // sync only meta-data for the channels
    hardSync, // sync channel irrespective of the new-data flag status
    updatedSERVICES, // service(db)-component to be jointly inserted into database
    shouldNotUpdateSERVICES, // skip database update
  }:
  {
    permanentChannelsSyncKind: PermanentChannelsSyncKind,
    channelUpdates?: {
    contactInfo: ContactInfo,
    streamUpdates?: UnecryptedStreamData,
  }[],
  metaSync?: boolean,
  hardSync?: boolean,
  updatedSERVICES?: ServicesJSON,
  shouldNotUpdateSERVICES?: boolean
}
) => {
  return {
    type: SYNC_PERMANENT_CHANNELS,
    payload: {
      permanentChannelsSyncKind,
      channelUpdates,
      metaSync,
      hardSync,
      updatedSERVICES,
      shouldNotUpdateSERVICES
    },
  }
}

export enum InitTrustedContactFlowKind {
  SETUP_TRUSTED_CONTACT = 'SETUP_TRUSTED_CONTACT',
  APPROVE_TRUSTED_CONTACT = 'APPROVE_TRUSTED_CONTACT',
  REJECT_TRUSTED_CONTACT = 'REJECT_TRUSTED_CONTACT'
}

export const initializeTrustedContact = (
  {
    contact,
    flowKind,
    isKeeper,
    channelKey,
    contactsSecondaryChannelKey,
    shareId,
  }:{
      contact: any,
      flowKind: InitTrustedContactFlowKind,
      isKeeper?: boolean,
      channelKey?: string,
      contactsSecondaryChannelKey?: string,
      shareId?: string
    },
) => {
  return {
    type: INITIALIZE_TRUSTED_CONTACT,
    payload: {
      contact,
      flowKind,
      isKeeper,
      channelKey,
      contactsSecondaryChannelKey,
      shareId,
    },
  }
}

export const rejectTrustedContact = ( { channelKey } : {channelKey: string} ) => {
  return {
    type: REJECT_TRUSTED_CONTACT,
    payload: {
      channelKey
    },
  }
}

export const removeTrustedContact = ( { channelKey } : {channelKey: string} ) => {
  return {
    type: REMOVE_TRUSTED_CONTACT,
    payload: {
      channelKey
    },
  }
}

export const walletCheckIn = ( currencyCode?: string ) => {
  return {
    type: WALLET_CHECK_IN,
    payload: {
      currencyCode
    },
  }
}

// types and action creators: dispatched by sagas
export const EXISTING_PERMANENT_CHANNELS_SYNCHED = 'EXISTING_PERMANENT_CHANNELS_SYNCHED'

export const existingPermanentChannelsSynched = ( { successful }: {successful: boolean} ) => {
  return {
    type: EXISTING_PERMANENT_CHANNELS_SYNCHED,
    payload: {
      successful
    }
  }
}
