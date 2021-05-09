export const ON_PRESS_KEEPER = 'ON_PRESS_KEEPER'
export const LEVEL_COMPLETION_ERROR= 'LEVEL_COMPLETION_ERROR'
export const NAVIGATING_HISTORY_PAGE = 'NAVIGATING_HISTORY_PAGE'
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


export const navigateToHistoryPage = ( navigationObj ) => {
  return {
    type: NAVIGATING_HISTORY_PAGE,
    payload: {
      navigationObj
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
