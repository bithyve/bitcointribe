// types and action creators: dispatched by components and sagas
import { Action } from 'redux'
import {
  TrustedDataElements,
  EphemeralDataElements,
  trustedChannelActions,
  ShareUploadables,
  Contacts,
  UnecryptedStreamData,
  ContactDetails,
  ContactInfo,
} from '../../bitcoin/utilities/Interface'
import { createAction } from 'redux-actions'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { ServicesJSON } from '../../common/interfaces/Interfaces'

export const APPROVE_TRUSTED_CONTACT = 'APPROVE_TRUSTED_CONTACT'
export const INITIALIZE_TRUSTED_CONTACT = 'INITIALIZE_TRUSTED_CONTACT'
export const REMOVE_TRUSTED_CONTACT = 'REMOVE_TRUSTED_CONTACT'
export const UPDATE_EPHEMERAL_CHANNEL = 'UPDATE_EPHEMERAL_CHANNEL'
export const FETCH_EPHEMERAL_CHANNEL = 'FETCH_EPHEMERAL_CHANNEL'
export const UPDATE_TRUSTED_CHANNEL = 'UPDATE_TRUSTED_CHANNEL'
export const SYNC_PERMANENT_CHANNEL = 'SYNC_PERMANENT_CHANNEL'
export const FETCH_TRUSTED_CHANNEL = 'FETCH_TRUSTED_CHANNEL'
export const TRUSTED_CHANNELS_SETUP_SYNC = 'TRUSTED_CHANNELS_SETUP_SYNC'
export const WALLET_CHECK_IN = 'WALLET_CHECK_IN'
export const SYNC_TRUSTED_CHANNELS = 'SYNC_TRUSTED_CHANNELS'
export const POST_RECOVERY_CHANNEL_SYNC = 'POST_RECOVERY_CHANNEL_SYNC'
export const CLEAR_TRUSTED_CONTACTS_CACHE = 'CLEAR_TRUSTED_CONTACTS_CACHE'
export const SEND_VERSION_UPDATE_NOTIFICATION = 'SEND_VERSION_UPDATE_NOTIFICATION'
export const MULTI_UPDATE_TRUSTED_CHANNELS = 'MULTI_UPDATE_TRUSTED_CHANNELS'

export const clearTrustedContactsCache = () => {
  return {
    type: CLEAR_TRUSTED_CONTACTS_CACHE
  }
}

export const approveTrustedContact = (
  contactInfo: { contactName: string; info: string },
  contactsPublicKey: string,
  updateEphemeralChannel?: Boolean,
  contactsWalletName?: string,
  isGuardian?: boolean,
  isFromKeeper?: boolean,
) => {
  return {
    type: APPROVE_TRUSTED_CONTACT,
    payload: {
      contactInfo,
      contactsPublicKey,
      updateEphemeralChannel,
      contactsWalletName,
      isGuardian,
      isFromKeeper,
    },
  }
}

export const initializeTrustedContact = (
  contact: any,
  isGuardian?: boolean,
  channelKey?: string,
  contactsSecondaryChannelKey?: string,
) => {
  return {
    type: INITIALIZE_TRUSTED_CONTACT,
    payload: {
      contact,
      isGuardian,
      channelKey,
      contactsSecondaryChannelKey,
    },
  }
}

export const removeTrustedContact = ( contactName, shareIndex? ) => {
  return {
    type: REMOVE_TRUSTED_CONTACT,
    payload: {
      contactName,
      shareIndex,
    },
  }
}

export const updateEphemeralChannel = (
  contactInfo: { contactName: string; info: string, walletName?: string; },
  data: EphemeralDataElements,
  fetch?: Boolean,
  trustedContacts?: TrustedContactsService,
  uploadXpub?: Boolean,
  shareUploadables?: ShareUploadables,
  updatedDB?: any,
  isFromKeeper?: boolean
) => {
  return {
    type: UPDATE_EPHEMERAL_CHANNEL,
    payload: {
      contactInfo,
      data,
      fetch,
      trustedContacts,
      uploadXpub,
      shareUploadables,
      updatedDB,
      isFromKeeper,
    },
  }
}

export const fetchEphemeralChannel = (
  contactInfo: { contactName: string; info: string },
  approveTC?: Boolean,
  publicKey?: string,
) => {
  return {
    type: FETCH_EPHEMERAL_CHANNEL,
    payload: {
      contactInfo, approveTC, publicKey
    },
  }
}

export const updateTrustedChannel = (
  contactInfo: { contactName: string; info: string },
  data: TrustedDataElements,
  fetch?: Boolean,
  shareUploadables?: ShareUploadables,
  updatedDB?: any,
) => {
  return {
    type: UPDATE_TRUSTED_CHANNEL,
    payload: {
      contactInfo, data, fetch, shareUploadables, updatedDB
    },
  }
}

export const syncPermanentChannel = (
  contactInfo: ContactInfo,
  updates?: UnecryptedStreamData,
  updatedSERVICES?: ServicesJSON
) => {
  return {
    type: SYNC_PERMANENT_CHANNEL,
    payload: {
      contactInfo, updates, updatedSERVICES
    },
  }
}

export const fetchTrustedChannel = (
  contactInfo: {
    contactName: string;
    info: string;
  },
  action: trustedChannelActions,
  contactsWalletName?: string,
) => {
  return {
    type: FETCH_TRUSTED_CHANNEL,
    payload: {
      contactInfo, action, contactsWalletName
    },
  }
}

export const trustedChannelsSetupSync = () => {
  return {
    type: TRUSTED_CHANNELS_SETUP_SYNC,
  }
}

export const walletCheckIn = ( synchingContacts?: Boolean ) => {
  return {
    type: WALLET_CHECK_IN,
    payload: {
      synchingContacts
    },
  }
}

export const syncTrustedChannels = ( contacts? ) => {
  return {
    type: SYNC_TRUSTED_CHANNELS,
    payload: {
      contacts
    },
  }
}

export const postRecoveryChannelSync = () => {
  return {
    type: POST_RECOVERY_CHANNEL_SYNC,
  }
}

export const sendVersionUpdateNotification = ( version: string ) => {
  return {
    type: SEND_VERSION_UPDATE_NOTIFICATION,
    payload: {
      version
    }
  }
}

export const multiUpdateTrustedChannels = ( data: TrustedDataElements, contacts?: Contacts ) => {
  return {
    type: MULTI_UPDATE_TRUSTED_CHANNELS,
    payload: {
      data, contacts
    }
  }
}


// types and action creators: dispatched by sagas
export const TRUSTED_CONTACT_APPROVED = 'TRUSTED_CONTACT_APPROVED'
export const EPHEMERAL_CHANNEL_UPDATED = 'EPHEMERAL_CHANNEL_UPDATED'
export const EPHEMERAL_CHANNEL_FETCHED = 'EPHEMERAL_CHANNEL_FETCHED'
export const TRUSTED_CHANNEL_UPDATED = 'TRUSTED_CHANNEL_UPDATED'
export const TRUSTED_CHANNEL_FETCHED = 'TRUSTED_CHANNEL_FETCHED'
export const PAYMENT_DETAILS_FETCHED = 'PAYMENT_DETAILS_FETCHED'
export const CLEAR_PAYMENT_DETAILS = 'CLEAR_PAYMENT_DETAILS'
export const SWITCH_TC_LOADING = 'SWITCH_TC_LOADING'
export const UPGRADE_REDUCER = 'UPGRADE_REDUCER'

export const trustedContactApproved = (
  contactName: string,
  approved: Boolean,
) => {
  return {
    type: TRUSTED_CONTACT_APPROVED,
    payload: {
      contactName, approved
    },
  }
}

export const ephemeralChannelUpdated = (
  contactName: string,
  updated: Boolean,
  data?: any,
) => {
  return {
    type: EPHEMERAL_CHANNEL_UPDATED,
    payload: {
      contactName, updated, data
    },
  }
}

export const ephemeralChannelFetched = ( contactName: string, data: any ) => {
  return {
    type: EPHEMERAL_CHANNEL_FETCHED,
    payload: {
      contactName, data
    },
  }
}

export const trustedChannelUpdated = (
  contactName: string,
  updated: Boolean,
  data?: any,
) => {
  return {
    type: TRUSTED_CHANNEL_UPDATED,
    payload: {
      contactName, updated, data
    },
  }
}

export const trustedChannelFetched = ( contactName: string, data: any ) => {
  return {
    type: TRUSTED_CHANNEL_FETCHED,
    payload: {
      contactName, data
    },
  }
}

// export const paymentDetailsFetched = ( paymentDetails ) => {
//   return {
//     type: PAYMENT_DETAILS_FETCHED,
//     payload: {
//       paymentDetails
//     },
//   }
// }

// export const clearPaymentDetails = () => {
//   return {
//     type: CLEAR_PAYMENT_DETAILS,
//   }
// }

export const switchTCLoading = ( beingLoaded ) => {
  return {
    type: SWITCH_TC_LOADING,
    payload: {
      beingLoaded
    },
  }
}
export const upgradeReducer = (  ) => {
  return {
    type: UPGRADE_REDUCER,
  }
}
