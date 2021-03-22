  // types and action creators: dispatched by sagas
  export const TRUSTED_CONTACT_INITIALIZED = 'TRUSTED_CONTACT_INITIALIZED';
  export const FETCH_KEEPER_TRUSTED_CHANNEL = 'FETCH_KEEPER_TRUSTED_CHANNEL';
  export const KEEPER_LOADING = 'KEEPER_LOADING';
  export const UPDATE_NEW_FCM = 'UPDATE_NEW_FCM';
  export const IS_UPDATE_NEW_FCM = 'IS_UPDATE_NEW_FCM';

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

  export const updateNewFcm = (fcmToken: string) => {
    return {
      type: UPDATE_NEW_FCM,
      payload: { fcmToken },
    };
  };

  export const isUpdateNewFcm = (flag) => {
    return {
      type: IS_UPDATE_NEW_FCM,
      payload: { flag },
    };
  };
  