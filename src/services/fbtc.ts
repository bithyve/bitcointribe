import axios from 'axios';
import Config from "react-native-config";

const URL = Config.FBTC_URL;

export const accountSync = (data) =>
  axios({
    method: 'get',
    url: URL + 'account-sync/wallet_slug/user_key' //+ Config.WALLET_SLUG + '/' + data.userKey, // wallet_slug/user_key',
  });

export const getQuote = (data) =>
  axios({
    method: 'post',
    url: URL + 'quote',
    data,
  });

export const executeOrder = (data) =>
  axios({
    method: 'post',
    url: URL + 'execute',
    data,
  });