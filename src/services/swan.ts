import axios from 'axios'
import Config from '../bitcoin/HexaConfig'
import { useSelector } from 'react-redux'

const swanOAuthURL = Config.SWAN_BASE_URL || 'https://dev-api.swanbitcoin.com'
const swanClientId = Config.SWAN_CLIENT_ID || 'hexa-dev'

export const redeemAuthCodeForToken = () =>{
  const { code_verifier, code } = useSelector( state => state.swanIntegration )
  try {
    const swanResponse = axios( {
      method: 'post',
      url: `${swanOAuthURL}/oidc/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'auth': {
          'username': swanClientId,
          'password': ''
        }
      },
      data: new URLSearchParams( {
        grant_type: 'authorization_code',
        code,
        code_verifier,
        client_id:swanClientId,
        redirect_uri: 'https://hexawallet.io/dev/swan/'
      } )
    } )
    console.log( {
      swanResponse
    } )
    return swanResponse || {
      result: 'no response'
    }
  }
  catch( error ) {
    console.log( 'error calling wyre ', error )
    return {
      error
    }
  }
}

export const getSwanAuthToken = ( data ) =>
  axios( {
    method: 'get',
    url: swanOAuthURL,
  } )

export const linkSwanWallet = ( data ) =>
  axios( {
    method: 'post',
    url: swanOAuthURL.concat( 'wallets?mode=swan' ),
    data,
    headers: {
      Authorization: `Bearer ${data.swanAuthToken}`
    }
  } )

export const syncSwanWallet = ( data ) =>
  axios( {
    method: 'get',
    url: `${swanOAuthURL}wallets/${data.swanWalletId}?mode=swan`,
    headers: {
      Authorization: `Bearer ${data.swanAuthToken}`
    }
  } )
