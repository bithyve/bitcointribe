import config from '../../src/bitcoin/HexaConfig'
const { HEXA_ID } = config
import { BH_AXIOS } from './api'

export const fetchWyreReservation = ( amount, receiveAddress, currencyCode, country ) => {
  try {
    const body = {
      amount,
      currencyCode,
      country,
      receiveAddress,
      referenceId: Date.now()
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
