// types and action creators: dispatched by components and sagas
import {
  TrustedDataElements,
  EphemeralDataElements,
  trustedChannelActions,
  ShareUploadables,
} from '../../bitcoin/utilities/Interface';

import { createAction } from 'redux-actions';
import { UPDATE_ADDRESS_BOOK_LOCALLY, UPDATE_TRUSTED_CONTACT_INFO } from '../constants'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';

export const INITIALIZE_TRUSTED_CONTACT = 'INITIALIZE_TRUSTED_CONTACT';
export const APPROVE_TRUSTED_CONTACT = 'APPROVE_TRUSTED_CONTACT';
export const REMOVE_TRUSTED_CONTACT = 'REMOVE_TRUSTED_CONTACT';
export const UPDATE_EPHEMERAL_CHANNEL = 'UPDATE_EPHEMERAL_CHANNEL';
export const FETCH_EPHEMERAL_CHANNEL = 'FETCH_EPHEMERAL_CHANNEL';
export const UPDATE_TRUSTED_CHANNEL = 'UPDATE_TRUSTED_CHANNEL';
export const FETCH_TRUSTED_CHANNEL = 'FETCH_TRUSTED_CHANNEL';
export const TRUSTED_CHANNELS_SYNC = 'TRUSTED_CHANNELS_SYNC';

export const initializeTrustedContact = (contactInfo: {
  contactName: string;
  info: string;
}) => {
  return {
    type: INITIALIZE_TRUSTED_CONTACT,
    payload: { contactInfo },
  };
};

export const approveTrustedContact = (
  contactInfo: { contactName: string; info: string },
  contactsPublicKey: string,
  updateEphemeralChannel?: Boolean,
  contactsWalletName?: string,
) => {
  return {
    type: APPROVE_TRUSTED_CONTACT,
    payload: {
      contactInfo,
      contactsPublicKey,
      updateEphemeralChannel,
      contactsWalletName,
    },
  };
};

export const removeTrustedContact = (contactName) => {
  return {
    type: REMOVE_TRUSTED_CONTACT,
    payload: {
      contactName,
    },
  };
};

export const updateEphemeralChannel = (
  contactInfo: { contactName: string; info: string },
  data: EphemeralDataElements,
  fetch?: Boolean,
  trustedContacts?: TrustedContactsService,
  uploadXpub?: Boolean,
  shareUploadables?: ShareUploadables,
  updatedDB?: any,
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
    },
  };
};

export const fetchEphemeralChannel = (
  contactInfo: { contactName: string; info: string },
  approveTC?: Boolean,
  publicKey?: string,
) => {
  return {
    type: FETCH_EPHEMERAL_CHANNEL,
    payload: { contactInfo, approveTC, publicKey },
  };
};

export const updateTrustedChannel = (
  contactInfo: { contactName: string; info: string },
  data: TrustedDataElements,
  fetch?: Boolean,
  shareUploadables?: ShareUploadables,
  updatedDB?: any,
) => {
  return {
    type: UPDATE_TRUSTED_CHANNEL,
    payload: { contactInfo, data, fetch, shareUploadables, updatedDB },
  };
};

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
    payload: { contactInfo, action, contactsWalletName },
  };
};

export const trustedChannelsSync = () => {
  return {
    type: TRUSTED_CHANNELS_SYNC,
  };
};

// types and action creators: dispatched by sagas
export const TRUSTED_CONTACT_INITIALIZED = 'TRUSTED_CONTACT_INITIALIZED';
export const TRUSTED_CONTACT_APPROVED = 'TRUSTED_CONTACT_APPROVED';
export const EPHEMERAL_CHANNEL_UPDATED = 'EPHEMERAL_CHANNEL_UPDATED';
export const EPHEMERAL_CHANNEL_FETCHED = 'EPHEMERAL_CHANNEL_FETCHED';
export const TRUSTED_CHANNEL_UPDATED = 'TRUSTED_CHANNEL_UPDATED';
export const TRUSTED_CHANNEL_FETCHED = 'TRUSTED_CHANNEL_FETCHED';
export const PAYMENT_DETAILS_FETCHED = 'PAYMENT_DETAILS_FETCHED';
export const CLEAR_PAYMENT_DETAILS = 'CLEAR_PAYMENT_DETAILS';
export const SWITCH_TC_LOADING = 'SWITCH_TC_LOADING';

export const trustedContactInitialized = (
  contactName: string,
  publicKey: string,
) => {
  return {
    type: TRUSTED_CONTACT_INITIALIZED,
    payload: { contactName, publicKey },
  };
};

export const trustedContactApproved = (
  contactName: string,
  approved: Boolean,
) => {
  return {
    type: TRUSTED_CONTACT_APPROVED,
    payload: { contactName, approved },
  };
};

export const ephemeralChannelUpdated = (
  contactName: string,
  updated: Boolean,
  data?: any,
) => {
  return {
    type: EPHEMERAL_CHANNEL_UPDATED,
    payload: { contactName, updated, data },
  };
};

export const ephemeralChannelFetched = (contactName: string, data: any) => {
  return {
    type: EPHEMERAL_CHANNEL_FETCHED,
    payload: { contactName, data },
  };
};

export const trustedChannelUpdated = (
  contactName: string,
  updated: Boolean,
  data?: any,
) => {
  return {
    type: TRUSTED_CHANNEL_UPDATED,
    payload: { contactName, updated, data },
  };
};

export const trustedChannelFetched = (contactName: string, data: any) => {
  return {
    type: TRUSTED_CHANNEL_FETCHED,
    payload: { contactName, data },
  };
};

export const paymentDetailsFetched = (paymentDetails) => {
  return {
    type: PAYMENT_DETAILS_FETCHED,
    payload: { paymentDetails },
  };
};

export const clearPaymentDetails = () => {
  return {
    type: CLEAR_PAYMENT_DETAILS,
  };
};

export const switchTCLoading = (beingLoaded) => {
  return {
    type: SWITCH_TC_LOADING,
    payload: { beingLoaded },
  };
};



const updateAddressBookLocallyRequest = createAction(UPDATE_ADDRESS_BOOK_LOCALLY);
export const updateAddressBookLocally = (payload) => dispatch => dispatch(updateAddressBookLocallyRequest(payload))

const updateTrustedContactInfoRequest = createAction(UPDATE_TRUSTED_CONTACT_INFO);
export const updateTrustedContactInfoLocally = (payload) => dispatch => dispatch(updateTrustedContactInfoRequest(payload))