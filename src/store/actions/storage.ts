import { Wallet } from '../../bitcoin/utilities/Interface'

// types and action creators (saga): dispatched by saga workers
export const UPDATE_WALLET = 'UPDATE_WALLET'
export const KEY_FETCHED = 'KEY_FETCHED'

export const updateWallet = ( wallet: Wallet ) => {
  return {
    type: UPDATE_WALLET,
    payload: {
      wallet
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
