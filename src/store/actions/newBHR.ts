export const ON_PRESS_KEEPER = 'ON_PRESS_KEEPER'
export const LEVEL_COMPLETION_ERROR= 'LEVEL_COMPLETION_ERROR'
export const IS_PERSONAL_DEVICE_COMPLETE= 'IS_PERSONAL_DEVICE_COMPLETE'
export const NAVIGATING_HISTORY_PAGE = 'NAVIGATING_HISTORY_PAGE'
export const IS_LEVEL_ONE_COMPLETE = 'IS_LEVEL_ONE_COMPLETE'
export const TYPE_BOTTOMSHEET_OPEN = 'TYPE_BOTTOMSHEET_OPEN'

export const onPressKeeper = ( value, number ) => {
  return {
    type: ON_PRESS_KEEPER,
    payload:{
      value, number
    }
  }
}

export const setLevelCompletionError = ( errorTitle, errorInfo, status ) => {
  return {
    type: LEVEL_COMPLETION_ERROR,
    payload: {
      errorTitle, errorInfo, status
    }
  }
}

export const setIsPersonalDeviceComplete = ( personalDeviceStatus ) => {
  return {
    type: IS_PERSONAL_DEVICE_COMPLETE,
    payload: {
      personalDeviceStatus
    }
  }
}

export const navigateToHistoryPage = ( navigationObj ) => {
  return {
    type: NAVIGATING_HISTORY_PAGE,
    payload: {
      navigationObj
    }
  }
}

export const setIsLevel1Complete = ( level1Status ) => {
  return {
    type: IS_LEVEL_ONE_COMPLETE,
    payload: {
      level1Status
    }
  }
}

export const setIsKeeperTypeBottomSheetOpen = ( isTypeBottomSheetOpen ) => {
  return {
    type: TYPE_BOTTOMSHEET_OPEN,
    payload: {
      isTypeBottomSheetOpen
    }
  }
}
