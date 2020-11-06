  // types and action creators: dispatched by sagas
  export const TRUSTED_CONTACT_INITIALIZED = 'TRUSTED_CONTACT_INITIALIZED';
  export const trustedContactInitialized = (
    contactName: string,
    publicKey: string,
  ) => {
    return {
      type: TRUSTED_CONTACT_INITIALIZED,
      payload: { contactName, publicKey },
    };
  };
  
  