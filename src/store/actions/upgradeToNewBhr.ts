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
