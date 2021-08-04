// types and action creators: dispatched by components and sagas
import { ImageSourcePropType } from 'react-native'
import {
  UnecryptedStreamData,
  ContactInfo,
  Trusted_Contacts,
} from '../../bitcoin/utilities/Interface'

export const SYNC_PERMANENT_CHANNELS = 'SYNC_PERMANENT_CHANNELS'
export const INITIALIZE_TRUSTED_CONTACT = 'INITIALIZE_TRUSTED_CONTACT'
export const REJECT_TRUSTED_CONTACT = 'REJECT_TRUSTED_CONTACT'
export const EDIT_TRUSTED_CONTACT = 'EDIT_TRUSTED_CONTACT'
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
    skipDatabaseUpdate, // skip database update
  }:
  {
    permanentChannelsSyncKind: PermanentChannelsSyncKind,
    channelUpdates?: {
    contactInfo: ContactInfo,
    streamUpdates?: UnecryptedStreamData,
  }[],
  metaSync?: boolean,
  hardSync?: boolean,
  skipDatabaseUpdate?: boolean
}
) => {
  return {
    type: SYNC_PERMANENT_CHANNELS,
    payload: {
      permanentChannelsSyncKind,
      channelUpdates,
      metaSync,
      hardSync,
      skipDatabaseUpdate
    },
  }
}

export enum InitTrustedContactFlowKind {
  SETUP_TRUSTED_CONTACT = 'SETUP_TRUSTED_CONTACT',
  APPROVE_TRUSTED_CONTACT = 'APPROVE_TRUSTED_CONTACT',
  REJECT_TRUSTED_CONTACT = 'REJECT_TRUSTED_CONTACT',
  EDIT_TRUSTED_CONTACT = 'EDIT_TRUSTED_CONTACT'
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

export const editTrustedContact = ( { channelKey, contactName, image } : {channelKey: string, contactName?: string, image?: ImageSourcePropType} ) => {
  return {
    type: EDIT_TRUSTED_CONTACT,
    payload: {
      channelKey,
      contactName,
      image,
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
export const UPDATE_TRUSTED_CONTACTS = 'UPDATE_TRUSTED_CONTACTS'
export const RESTORE_CONTACTS = 'RESTORE_CONTACTS'

export const existingPermanentChannelsSynched = ( { successful }: {successful: boolean} ) => {
  return {
    type: EXISTING_PERMANENT_CHANNELS_SYNCHED,
    payload: {
      successful
    }
  }
}

export const updateTrustedContacts = ( contacts: Trusted_Contacts ) => {
  return {
    type: UPDATE_TRUSTED_CONTACTS,
    payload: {
      contacts
    }
  }
}

export const restoreContacts = ( channelSyncUpdates: {
  channelKey: string;
  streamId: string;
}[] ) => {
  return {
    type: RESTORE_CONTACTS,
    payload: {
      channelSyncUpdates
    }
  }
}
