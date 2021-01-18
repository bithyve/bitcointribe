import axios from 'axios'
import Config from 'react-native-config'

const swanOAuthURL = Config.SWAN_URL || 'https://dev-api.swanbitcoin.com/'

export const redeemAuthCode = ( data ) =>
  axios( {
    method: 'post',
    url: 'https://login-demo.curity.io/oauth/v2/oauth-token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: new URLSearchParams( {
      grant_type: 'authorization_code',
      code:'ESJaHCabOUKwf46LEqdSerokFDNb5DLa',
      client_id:'demo-web-client',
      client_secret:'6koyn9KpRuofYt2U',
      redirect_uri: 'https://oauth.tools/callback/code'
    } )
  } )

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
