// types and action creators: dispatched by components and sagas

export const INITIALIZE_TRUSTED_CONTACT = 'INITIALIZE_TRUSTED_CONTACT';
export const APPROVE_TRUSTED_CONTACT = 'APPROVE_TRUSTED_CONTACT';

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

// types and action creators: dispatched by sagas
export const TRUSTED_CONTACT_INITIALIZED = 'TRUSTED_CONTACT_INITIALIZED';
export const TRUSTED_CONTACT_APPROVED = 'TRUSTED_CONTACT_APPROVED';

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
