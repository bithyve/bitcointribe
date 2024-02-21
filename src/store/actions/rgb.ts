import { RGBConfig } from '../../bitcoin/utilities/Interface'

export const SET_RGB_CONFIG = 'SET_RGB_CONFIG'
export const SYNC_RGB = 'SYNC_RGB'
export const RGB_SYNCING = 'RGB_SYNCING'
export const SET_RGB_ONCHAIN_BALANCE = 'SET_RGB_ONCHAIN_BALANCE'
export const SET_NEXT_FREE_ADDRESS = 'SET_NEXT_FREE_ADDRESS'
export const RECEIVE_RGB_ASSET = 'RECEIVE_RGB_ASSET'
export const SET_RGB_TXNS = 'SET_RGB_TXNS'
export const SET_RECEIVE_DATA = 'SET_RECEIVE_DATA'
export const SET_RGB20_ASSETS = 'SET_RGB20_ASSETS'
export const SET_RGB121_ASSETS = 'SET_RGB121_ASSETS'
export const SET_LAST_BACKED_UP = 'SET_LAST_BACKED_UP'
export const RGB_INTRO_MODAL = 'RGB_INTRO_MODAL'
export const SET_TESTSATS_TIMESTAMP = 'SET_TESTSATS_TIMESTAMP'


export const setRgbConfig = ( config: RGBConfig ) => {
  return {
    type: SET_RGB_CONFIG,
    payload: {
      config
    },
  }
}

export const setRgbSyncing = ( isSyncing: boolean ) => {
  return {
    type: RGB_SYNCING,
    payload: {
      isSyncing
    },
  }
}

export const setRgb20Assets = ( assets ) => {
  return {
    type: SET_RGB20_ASSETS,
    payload: {
      assets
    },
  }
}

export const setRgb121Assets = ( assets ) => {
  return {
    type: SET_RGB121_ASSETS,
    payload: {
      assets
    },
  }
}

export const receiveRgbAsset = (
) => {
  return {
    type: RECEIVE_RGB_ASSET,
    payload:{
    },
  }
}

export const setReceiveData = ( receiveData ) => {
  return {
    type: SET_RECEIVE_DATA,
    payload: {
      receiveData
    },
  }
}

export const syncRgb = ( ) => {
  return {
    type: SYNC_RGB,
    payload: {
    },
  }
}

export const setRgbOnchainBalances = ( balances ) => {
  return {
    type: SET_RGB_ONCHAIN_BALANCE,
    payload: {
      balances
    },
  }
}

export const setRgbTxns = ( transactions ) => {
  return {
    type: SET_RGB_TXNS,
    payload: {
      transactions
    },
  }
}

export const setNextFreeAddress = ( address: string ) => {
  return {
    type: SET_NEXT_FREE_ADDRESS,
    payload: {
      address
    },
  }
}

export const updateLastBackedUp = (  ) => {
  return {
    type: SET_LAST_BACKED_UP,
  }
}

export const setRgbIntroModal = ( isIntroModal: boolean ) => {
  return {
    type: RGB_INTRO_MODAL,
    payload: {
      isIntroModal
    },
  }
}

export const setTestSatsTimestamp = (  ) => {
  return {
    type: SET_TESTSATS_TIMESTAMP,
  }
}

