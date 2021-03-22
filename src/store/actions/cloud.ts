export const SET_CLOUD_DATA = 'SET_CLOUD_DATA'
export const UPDATE_HEALTH_FOR_CLOUD = 'UPDATE_HEALTH_FOR_CLOUD'
export const UPDATE_CLOUD_HEALTH = 'UPDATE_CLOUD_HEALTH'

export const setCloudData = ( callback, kpInfo?, level?, share? ) => {
  return {
    type: SET_CLOUD_DATA,
    payload: {
      kpInfo, level, share, callback
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

