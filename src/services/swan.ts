import config from '../../src/bitcoin/HexaConfig'
const { HEXA_ID } = config
import { BH_AXIOS } from './api'

export const redeemAuthCodeForToken = ( { code_verifier, code } ) => {
  try {
    const body = {
      code_verifier, code
    }
    return BH_AXIOS.post( 'fetchWyreReservation', {
      HEXA_ID,
      ...body
    } )

  } catch ( error ) {
    console.log( 'error calling wyre ', error )
    return {
      error
    }
  }
}
