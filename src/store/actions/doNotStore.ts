export const CLIPBOARD_READ_STATE = 'CLIPBOARF_READ_STATE'
export const LINKING_URL = 'LINKING_URL'
export const TEMP_ACCSHEEL_ID = 'TEMP_ACCSHEEL_ID'
export const TOOGLE_LOAINING_GIFT = 'TOOGLE_LOAINING_GIFT'


export const clipboardReadAction = () => {
  return {
    type: CLIPBOARD_READ_STATE,
  }
}

export const updateLinkingURL = ( u: string ) => {
  return {
    type: LINKING_URL,
    payload: {
      url:u,
    }
  }
}

export const updateTempAccID = ( id: string ) => {
  return {
    type: TEMP_ACCSHEEL_ID,
    payload: {
      id,
    }
  }
}

export const updateGiftLoading = () => {
  return {
    type: TOOGLE_LOAINING_GIFT,
  }
}
