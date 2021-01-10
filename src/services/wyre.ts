import axios from 'axios'
import Config from 'react-native-config'
import CryptoJS from 'crypto-js'

const wyreBaseURL = Config.WYRE_BASE_URL || 'https://api.testwyre.com/v3'
const WYRE_API_KEY = Config.WYRE_API_KEY || ''

export const fetchWyreReservation = ( { amount, currencyCode } ) => {
  try {
    const url = `${wyreBaseURL}/orders/reserve`

    const headers= { 
      'Authorization': `Bearer ${WYRE_API_KEY}`, 
      'Content-Type': 'application/json'
    }

    const body = {
      amount,
      'sourceCurrency': currencyCode,
      'destCurrency': 'BTC',
      'referrerAccountId': 'AC_A462Y892EX9',
      'dest': '2NFg9snC3mhc6KsVn3StAstaGGkSNQJFzET',
      'country': 'GB',
      'redirectUrl': 'https://hexawallet.io/dev/tcg/AndroSwat/2d26253bf3e96d1891b0794d7ebc3954aa4f29e414949634e9f9cff907215827a40e417d675dbffd8998418a6922ae4186ec5c27b5be5e5cd1d6e917fff0387e70ef816216069e2d1eca5db818e0705a/otp/xxx/1610104041398/v1.4.1',
      'failureRedirectUrl': 'https://google.com',
      'lockfields': [ 'destCurrency' ]
    }

    return axios( {
      method: 'post',
      url: url,
      headers: headers,
      data: body
    } )

  } catch ( error ) {
    console.log( 'error calling wyre ', error )
    return {
      error 
    }
  }
}


