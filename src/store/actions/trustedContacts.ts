// types and action creators: dispatched by components and sagas

import {
  TrustedDataElements,
  EphemeralData,
} from '../../bitcoin/utilities/Interface';

export const INITIALIZE_TRUSTED_CONTACT = 'INITIALIZE_TRUSTED_CONTACT';
export const APPROVE_TRUSTED_CONTACT = 'APPROVE_TRUSTED_CONTACT';
export const UPDATE_EPHEMERAL_CHANNEL = 'UPDATE_EPHEMERAL_CHANNEL';
export const FETCH_EPHEMERAL_CHANNEL = 'FETCH_EPHEMERAL_CHANNEL';
export const UPDATE_TRUSTED_CHANNEL = 'UPDATE_TRUSTED_CHANNEL';
export const FETCH_TRUSTED_CHANNEL = 'FETCH_TRUSTED_CHANNEL';

export const initializeTrustedContact = (contactName: string) => {
  return {
    type: INITIALIZE_TRUSTED_CONTACT,
    payload: { contactName },
  };
};

export const approveTrustedContact = (
  contactName: string,
  contactsPublicKey: string,
) => {
  return {
    type: APPROVE_TRUSTED_CONTACT,
    payload: { contactName, contactsPublicKey },
  };
};

export const updateEphemeralChannel = (
  contactName: string,
  data: EphemeralData,
  fetch?: Boolean,
) => {
  return {
    type: UPDATE_EPHEMERAL_CHANNEL,
    payload: { contactName, data, fetch },
  };
};

export const fetchEphemeralChannel = (contactName: string) => {
  return {
    type: FETCH_EPHEMERAL_CHANNEL,
    payload: { contactName },
  };
};

export const updateTrustedChannel = (
  contactName: string,
  data: TrustedDataElements,
  fetch?: Boolean,
) => {
  return {
    type: UPDATE_TRUSTED_CHANNEL,
    payload: { contactName, data, fetch },
  };
};

export const fetchTrustedChannel = (contactName: string) => {
  return {
    type: FETCH_TRUSTED_CHANNEL,
    payload: { contactName },
  };
};

// types and action creators: dispatched by sagas
export const TRUSTED_CONTACT_INITIALIZED = 'TRUSTED_CONTACT_INITIALIZED';
export const TRUSTED_CONTACT_APPROVED = 'TRUSTED_CONTACT_APPROVED';
export const EPHEMERAL_CHANNEL_UPDATED = 'EPHEMERAL_CHANNEL_UPDATED';
export const EPHEMERAL_CHANNEL_FETCHED = 'EPHEMERAL_CHANNEL_FETCHED';
export const TRUSTED_CHANNEL_UPDATED = 'TRUSTED_CHANNEL_UPDATED';
export const TRUSTED_CHANNEL_FETCHED = 'TRUSTED_CHANNEL_FETCHED';

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
