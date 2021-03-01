export const SET_CLOUD_DATA = 'SET_CLOUD_DATA'
export const SET_CLOUD_BACKUP_STATUS = 'SET_CLOUD_BACKUP_STATUS'
export const UPDATE_CLOUD_HEALTH = 'UPDATE_CLOUD_HEALTH'

export const setCloudData = (callback, kpInfo?, level?, share? ) => {
  return {
    type: SET_CLOUD_DATA,
    payload: {
        kpInfo, level, share, callback
    },
  }
}

export const setCloudBackupStatus = (share?) => {
  return {
    type: SET_CLOUD_BACKUP_STATUS,
    payload: {
        share
    },
  }
}
 