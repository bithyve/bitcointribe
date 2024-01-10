export const CLIPBOARD_READ_STATE = 'CLIPBOARF_READ_STATE'
export const LINKING_URL = 'LINKING_URL'


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
