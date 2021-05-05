import config from '../../src/bitcoin/HexaConfig'
const { HEXA_ID, SWAN_BASE_URL } = config
import { BH_AXIOS, SWAN_AXIOS } from './api'
import axios from 'axios'
import qs from 'querystring'
export const redeemAuthCodeForToken = ( { code, state, code_verifier } ) => {
  try {
    const body = {
      code_verifier, code, state
    }
    console.log( 'about to call for redeem ', body )
    return BH_AXIOS.post( 'swanAuth', {
      HEXA_ID,
      ...body
    } )

  } catch ( error ) {
    console.log( 'error calling swan ', error )
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
    console.log( 'about to create wallet with ', data, headers )

    return axios( {
      method: 'POST',
      url: `${SWAN_BASE_URL}v1/wallets`,
      headers,
      data
    } )

  } catch ( error ) {
    console.log( 'error calling swan ', error )
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
    console.log( 'about to create wallet with ', data, headers )
    const config = {
      method: 'POST',
      url: `${SWAN_BASE_URL}v1/automatic-withdrawal`,
      headers,
      data
    }

    return axios( {
      method: 'POST',
      url: `${SWAN_BASE_URL}v1/automatic-withdrawal`,
      headers,
      data
    } )
  } catch ( error ) {
    console.log( 'error calling swan ', error )
    return {
      error
    }
  }
}
