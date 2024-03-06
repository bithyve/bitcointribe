// types and action creators: dispatched by components and sagas

export const UPGRADE_LOADING = 'UPGRADE_LOADING'
export const INIT_LEVELS = 'INIT_LEVELS'
export const SET_CLOUD_FOR_LEVEL = 'SET_CLOUD_FOR_LEVEL'
export const AUTO_UPLOAD_SECONDARY = 'AUTO_UPLOAD_SECONDARY'
export const AUTO_UPLOAD_CONTACT = 'AUTO_UPLOAD_CONTACT'
export const SET_UPGRADE_PROCESS_STATUS = 'SET_UPGRADE_PROCESS_STATUS'
export const SET_AVAILABLE_KEEPER_DATA = 'SET_AVAILABLE_KEEPER_DATA'
export const UPDATE_AVAILABLE_KEEPER_DATA = 'UPDATE_AVAILABLE_KEEPER_DATA'
export const UPDATE_LEVEL_TO_SETUP = 'UPDATE_LEVEL_TO_SETUP'
export const UPGRADE_LEVEL_INIT_STATUS = 'UPGRADE_LEVEL_INIT_STATUS'
export const CONFIRM_PDF_SHARED_UPGRADE = 'CONFIRM_PDF_SHARED_UPGRADE'

export const switchUpgradeLoader = ( beingLoaded ) => {
  return {
    type: UPGRADE_LOADING, payload: {
      beingLoaded
    }
  }
}

export const initLevels = ( level ) => {
  return {
    type: INIT_LEVELS, payload: {
      level
    }
  }
}

export const setCloudDataForLevel = ( level ) => {
  return {
    type: SET_CLOUD_FOR_LEVEL, payload: {
      level
    }
  }
}

export const autoUploadSecondaryShare = ( shareId ) => {
  return {
    type: AUTO_UPLOAD_SECONDARY, payload: {
      shareId
    }
  }
}

export const autoShareContactKeeper = ( contactList, shareIds ) => {
  return {
    type: AUTO_UPLOAD_CONTACT, payload: {
      contactList, shareIds
    }
  }
}

export const setUpgradeProcessStatus = ( status ) => {
  return {
    type: SET_UPGRADE_PROCESS_STATUS, payload: {
      status
    }
  }
}

export const setAvailableKeeperData = ( availableKeeperData ) => {
  return {
    type: SET_AVAILABLE_KEEPER_DATA, payload: {
      availableKeeperData
    }
  }
}

export const updateAvailableKeeperData = ( object: {type: string; name?: string; }[] ) => {
  return {
    type: UPDATE_AVAILABLE_KEEPER_DATA, payload: {
      object
    }
  }
}

export const updateLevelToSetup = ( level ) => {
  return {
    type: UPDATE_LEVEL_TO_SETUP, payload: {
      level
    }
  }
}

export const isUpgradeLevelInitializedStatus = ( ) => {
  return {
    type: UPGRADE_LEVEL_INIT_STATUS
  }
}

export const confirmPDFSharedFromUpgrade = (
  shareId: string,
  scannedData: string
) => {
  return {
    type: CONFIRM_PDF_SHARED_UPGRADE,
    payload: {
      shareId,
      scannedData
    },
  }
}
