import config from '../../src/bitcoin/HexaConfig'
import { BH_AXIOS } from './api'
const { HEXA_ID } = config

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
    return {
      error
    }
  }
}
