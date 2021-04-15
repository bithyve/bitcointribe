// types and action creators: dispatched by components and sagas

import S3Service from '../../bitcoin/services/sss/S3Service'
import {
  EphemeralDataElements,
  WalletImage,
} from '../../bitcoin/utilities/Interface'

export const UPGRADE_LOADING = 'UPGRADE_LOADING'
export const INIT_LEVELS = 'INIT_LEVELS'
export const SET_CLOUD_FOR_LEVEL = 'SET_CLOUD_FOR_LEVEL'
export const AUTO_UPLOAD_SECONDARY = 'AUTO_UPLOAD_SECONDARY'
export const AUTO_UPLOAD_CONTACT = 'AUTO_UPLOAD_CONTACT'
export const SET_UPGRADE_PROCESS_STATUS = 'SET_UPGRADE_PROCESS_STATUS'
export const SET_AVAILABLE_KEEPER_DATA = 'SET_AVAILABLE_KEEPER_DATA'
export const UPDATE_AVAILABLE_KEEPER_DATA = 'UPDATE_AVAILABLE_KEEPER_DATA'
export const UPDATE_LEVEL_TO_SETUP = 'UPDATE_LEVEL_TO_SETUP'

export const switchUpgradeLoader = ( beingLoaded ) => {
  // console.log("Called s3 Loading", new Date())
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
  console.log( 'autoUploadSecondaryShare shareId', shareId )
  return {
    type: AUTO_UPLOAD_SECONDARY, payload: {
      shareId
    }
  }
}

export const autoShareContactKeeper = ( contactList, shareIds ) => {
  console.log( 'autoUploadSecondaryShare shareId', shareIds )
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

export const updateAvailableKeeperData = ( type ) => {
  return {
    type: UPDATE_AVAILABLE_KEEPER_DATA, payload: {
      type
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
