// types and action creators: dispatched by components and sagas

export const INITIALIZE_TRUSTED_CONTACT = 'INITIALIZE_TRUSTED_CONTACT';

export const initializeTrustedContact = (contactName) => {
  return {
    type: INITIALIZE_TRUSTED_CONTACT,
    payload: { contactName },
  };
};

// types and action creators: dispatched by sagas
export const TRUSTED_CONTACT_INITIALIZED = 'TRUSTED_CONTACT_INITIALIZED';

export const trustedContactInitialized = (publicKey) => {
  return {
    type: TRUSTED_CONTACT_INITIALIZED,
    payload: { publicKey },
  };
};
