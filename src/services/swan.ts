import config from '../../src/bitcoin/HexaConfig'
const { HEXA_ID } = config
import { BH_AXIOS, SWAN_AXIOS } from './api'

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

export const createWithdrawalWalletOnSwan = ( { access_token, extendedPublicKey, displayName, metadata } ) => {
  try {
    const data = {
      extendedPublicKey, displayName, metadata
    }
    const headers= {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
    console.log( 'about to create wallet with ', data, headers )
    const config = {
      method: 'POST',
      headers,
      data
    }
    return SWAN_AXIOS.post( 'v1/wallets', config )

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
      headers,
      data
    }
    return SWAN_AXIOS.post( 'v1/automatic-withdrawal', config )

  } catch ( error ) {
    console.log( 'error calling swan ', error )
    return {
      error
    }
  }
}
