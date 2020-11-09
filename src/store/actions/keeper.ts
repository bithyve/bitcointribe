  // types and action creators: dispatched by sagas
  export const TRUSTED_CONTACT_INITIALIZED = 'TRUSTED_CONTACT_INITIALIZED';
  export const FETCH_KEEPER_TRUSTED_CHANNEL = 'FETCH_KEEPER_TRUSTED_CHANNEL';
  export const KEEPER_LOADING = 'KEEPER_LOADING';
  export const DOWNLOAD_SM_SHARES = 'DOWNLOAD_SM_SHARES';

  export const trustedContactInitialized = (
    contactName: string,
    publicKey: string,
  ) => {
    return {
      type: TRUSTED_CONTACT_INITIALIZED,
      payload: { contactName, publicKey },
    };
  };

  export const fetchKeeperTrustedChannel = (
    shareId: string,
    type: string,
    walletName?: string,
  ) => {
    return {
      type: FETCH_KEEPER_TRUSTED_CHANNEL,
      payload: { shareId, type, walletName },
    };
  };

  export const keeperLoading = (beingLoaded: string) => {
    return {
      type: KEEPER_LOADING,
      payload: { beingLoaded },
    };
  };

  export const downloadSMShard = (encryptedKey: string,
    otp?: string) => {
    return {
      type: DOWNLOAD_SM_SHARES,
      payload: { encryptedKey, otp },
    };
  };
