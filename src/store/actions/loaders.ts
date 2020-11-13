export const STARTUP_SYNC_LOADED = 'STARTUP_SYNC_LOADED';
export const AUTO_ACCOUNT_SYNC = 'AUTO_ACCOUNT_SYNC';

export const startupSyncLoaded = (loaded) => {
  return { type: STARTUP_SYNC_LOADED, payload: { loaded } };
};

export const setAutoAccountSync = (accountType) => {
  return { type: AUTO_ACCOUNT_SYNC, payload: { accountType } };
};
