export const SET_CLOUD_DATA = 'SET_CLOUD_DATA'
export const UPDATE_HEALTH_FOR_CLOUD = 'UPDATE_HEALTH_FOR_CLOUD'
export const UPDATE_CLOUD_HEALTH = 'UPDATE_CLOUD_HEALTH'
export const CHECK_CLOUD_BACKUP= 'CHECK_CLOUD_BACKUP'
export const UPDATE_DATA = 'UPDATE_DATA'
export const CREATE_FILE = 'CREATE_FILE'
export const CHECK_IF_FILE_AVAILABLE = 'CHECK_IF_FILE_AVAILABLE'
export const READ_FILE = 'READ_FILE'
export const UPLOAD_FILE = 'UPLOAD_FILE'
export const GOOGLE_DRIVE_LOGIN = 'GOOGLE_DRIVE_LOGIN'
export const GOOGLE_LOGIN_SUCCESS = 'GOOGLE_LOGIN_SUCCESS'
export const IS_FILE_READING = 'IS_FILE_READING'
export const GET_CLOUD_DATA_RECOVERY = 'GET_CLOUD_DATA_RECOVERY'
export const SET_CLOUD_DATA_RECOVERY = 'SET_CLOUD_DATA_RECOVERY'
export const IS_CLOUD_BACKUP_UPDATED = 'IS_CLOUD_BACKUP_UPDATED'
export const IS_CLOUD_BACKUP_SUCCESS = 'IS_CLOUD_BACKUP_SUCCESS'
export const GOOGLE_LOGIN_RESULT = 'GOOGLE_LOGIN_RESULT'
export const GOOGLE_LOGIN = 'GOOGLE_LOGIN'
export const GOOGLE_LOGIN_FAILURE = 'GOOGLE_LOGIN_FAILURE'
export const CLEAR_CLOUD_CACHE = 'CLEAR_CLOUD_CACHE'
export const CLOUD_BACKUP_STATUS = 'CLOUD_BACKUP_STATUS'
export const CLOUD_BACKUP_HISTORY = 'CLOUD_BACKUP_HISTORY'
export const SET_CLOUD_ERROR_MESSAGE = 'SET_CLOUD_ERROR_MESSAGE'
export const SET_GOOGLE_LOGIN_CANCELLED = 'SET_GOOGLE_LOGIN_CANCELLED'
export const UPDATE_CLOUD_BACKUP = 'UPDATE_CLOUD_BACKUP'

export const setCloudData = ( kpInfo?, level?, share? ) => {
  return {
    type: SET_CLOUD_DATA,
    payload: {
      kpInfo, level, share
    },
  }
}

export const setGoogleLoginCancelled = ( status ) => {
  return {
    type: SET_GOOGLE_LOGIN_CANCELLED,
    payload: {
      status
    },
  }
}

export const setCloudErrorMessage = ( message?, ) => {
  return {
    type: SET_CLOUD_ERROR_MESSAGE,
    payload: {
      message
    },
  }
}

export const updateHealthForCloud = ( share? ) => {
  return {
    type: UPDATE_HEALTH_FOR_CLOUD,
    payload: {
      share
    },
  }
}

export const setGoogleCloudLoginSuccess = ( isGoogleLoginSuccess ) => {
  return {
    type: GOOGLE_LOGIN_SUCCESS,
    payload: {
      isGoogleLoginSuccess
    },
  }
}

export const setGoogleCloudLoginFailure = ( isGoogleLoginFailure ) => {
  return {
    type: GOOGLE_LOGIN_FAILURE,
    payload: {
      isGoogleLoginFailure
    },
  }
}

export const setIsFileReading = ( isFileReading ) => {
  return {
    type: IS_FILE_READING,
    payload: {
      isFileReading
    },
  }
}

export const getCloudDataRecovery = () => {
  return {
    type: GET_CLOUD_DATA_RECOVERY,
  }
}

export const setCloudDataRecovery = ( cloudData ) => {
  return {
    type: SET_CLOUD_DATA_RECOVERY,
    payload: {
      cloudData
    },
  }
}

export const clearCloudCache = (  ) => {
  return {
    type: CLEAR_CLOUD_CACHE,
  }
}

export const setIsCloudBackupUpdated = ( isCloudBackupUpdated ) => {
  return {
    type: IS_CLOUD_BACKUP_UPDATED,
    payload: {
      isCloudBackupUpdated
    },
  }
}

export const setIsCloudBackupSuccess = ( isCloudBackupSuccess ) => {
  return {
    type: IS_CLOUD_BACKUP_SUCCESS,
    payload: {
      isCloudBackupSuccess
    },
  }
}

export const googleDriveLogin = ( googlePermissionCall ) => {
  return {
    type: GOOGLE_DRIVE_LOGIN,
    payload: {
      googlePermissionCall
    }
  }
}

export const setGoogleLoginResult = ( data ) => {
  return {
    type: GOOGLE_LOGIN_RESULT,
    payload: {
      data
    },
  }
}

export const setCloudBackupStatus = ( cloudBackupStatus ) => {
  return {
    type: CLOUD_BACKUP_STATUS,
    payload: {
      cloudBackupStatus
    },
  }
}

export const setCloudBackupHistory = ( cloudBackupHistory ) => {
  return {
    type: CLOUD_BACKUP_HISTORY,
    payload: {
      cloudBackupHistory
    },
  }
}

export const updateCloudData = () => {
  return {
    type: UPDATE_CLOUD_BACKUP
  }
}
