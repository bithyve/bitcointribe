import config from '../../src/bitcoin/HexaConfig'
const { HEXA_ID, SWAN_BASE_URL, SWAN_URL_PREFIX } = config
import { BH_AXIOS, SWAN_AXIOS } from './api'
import axios from 'axios'
import qs from 'querystring'
export const redeemAuthCodeForToken = ( { code, state, code_verifier } ) => {
  try {
    const body = {
      code_verifier, code, state
    }

    return BH_AXIOS.post( 'swanAuth', {
      HEXA_ID,
      ...body
    } )

  } catch ( error ) {
    return {
      error
    }
  }
}

export const createWithdrawalWalletOnSwan = ( { access_token, extendedPublicKey, displayName } ) => {
  try {

    const data = {
      extendedPublicKey, displayName
    }

    const headers= {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }

    return axios( {
      method: 'POST',
      url: `${SWAN_BASE_URL}${SWAN_URL_PREFIX}v1/wallets`,
      headers,
      data
    } )

  } catch ( error ) {
    return {
      error
    }
  }
}


export const setupAutomaticWithdrawals = ( { access_token, walletId, minBtcThreshold } ) => {
  try {
    const data = {
      walletId, minBtcThreshold
    }
    const headers= {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }

    return axios( {
      method: 'POST',
      url: `${SWAN_BASE_URL}${SWAN_URL_PREFIX}v1/automatic-withdrawal`,
      headers,
      data
    } )
  } catch ( error ) {
    return {
      error
    }
  }
}
