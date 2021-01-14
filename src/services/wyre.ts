import config from '../../src/bitcoin/HexaConfig'
const { HEXA_ID } = config
import { BH_AXIOS } from './api'

export const fetchWyreReservation = ( { amount, currencyCode, country } ) => {
  // this address needs to be retrieved from the wyre account
  const receiveAddress = '2NFg9snC3mhc6KsVn3StAstaGGkSNQJFzET'

  try {
    const body = {
      amount,
      currencyCode,
      country,
      receiveAddress,
      referenceId: Date.now()
    }
    console.log( 'calling relay with', { 
      body 
    } )
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
