export const STARTUP_SYNC_LOADED = 'STARTUP_SYNC_LOADED'

export const startupSyncLoaded = ( loaded ) => {
  return {
    type: STARTUP_SYNC_LOADED, payload: {
      loaded
    }
  }
}
