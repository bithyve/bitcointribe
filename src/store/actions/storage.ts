import { Wallet } from '../../bitcoin/utilities/Interface'

// types and action creators (saga): dispatched by saga workers
export const UPDATE_WALLET = 'UPDATE_WALLET'
export const UPDATE_USER_NAME = 'UPDATE_USER_NAME'
export const KEY_FETCHED = 'KEY_FETCHED'

export const updateWallet = ( wallet: Wallet ) => {
  return {
    type: UPDATE_WALLET,
    payload: {
      wallet
    }
  }
}

export const updateUserName = ( userName: string ) => {
  return {
    type: UPDATE_USER_NAME,
    payload: {
      userName
    }
  }
}

export const keyFetched = ( key ) => {
  return {
    type: KEY_FETCHED, payload: {
      key
    }
  }
}
