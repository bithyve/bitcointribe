import config from '../../src/bitcoin/HexaConfig'
const { HEXA_ID } = config
import { BH_AXIOS } from './api'

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
