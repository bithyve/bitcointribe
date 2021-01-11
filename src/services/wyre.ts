import config from '../../src/bitcoin/HexaConfig'
const { HEXA_ID } = config
import { BH_AXIOS } from './api'

export const fetchWyreReservation = ( { amount, currencyCode, country } ) => {
  try {
    const body = {
      amount,
      currencyCode,
      country,
      // this address needs to be retrieved from the wyre account
      'receiveAddress': '2NFg9snC3mhc6KsVn3StAstaGGkSNQJFzET',
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


