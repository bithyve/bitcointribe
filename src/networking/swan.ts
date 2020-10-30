import axios from 'axios';
import Config from "react-native-config";

const swanOAuthURL = Config.SWAN_URL || 'https://dev-api.swanbitcoin.com/';

export const getSwanAuthToken = (data) =>
  axios({
    method: 'get',
    url: swanOAuthURL,
  })

export const linkSwanWallet = (data) =>
  axios({
    method: 'post',
    url: swanOAuthURL.concat('wallets?mode=swan'),
    data,
    headers: { Authorization: `Bearer ${data.swanAuthToken}` }
  })

export const syncSwanWallet = (data) =>
  axios({
    method: 'get',
    url: `${swanOAuthURL}wallets/${data.swanWalletId}?mode=swan`,
    headers: { Authorization: `Bearer ${data.swanAuthToken}` }
  })
