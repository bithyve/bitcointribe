import axios from 'axios';
import { FBTC_URL, WALLET_SLUG } from 'react-native-dotenv';

const URL = FBTC_URL;

export const accountSync = (data) =>
  axios({
    method: 'get',
    url: FBTC_URL + 'account-sync/wallet_slug/user_key',
  });

export const getQuote = (data) =>
  axios({
    method: 'post',
    url: FBTC_URL + 'quote',
    data,
  });

export const executeOrder = (data) =>
  axios({
    method: 'post',
    url: FBTC_URL + 'execute',
    data,
  });

//   export default (service, data) => {
//   const apiInfo = {
//     accountSync: {
//       method: 'get',
//       url: 'account-sync/wallet_slug/user_key' //+ WALLET_SLUG + '/' + data.userKey,
//     },
//     getQuote: {
//       method: 'post',
//       url: 'quote',
//     },
//     executeOrder: {
//       method: 'post',
//       url: 'execute',
//     },
//     getBalances: {
//       method: 'get',
//       url: 'user-balances/' + WALLET_SLUG + '/' + data.userKey,
//     },
//   };
//   axios({
//     method: apiInfo[service]['method'],
//     url: URL + apiInfo[service]['url'],
//     data,
//   }).then((obj) => {
//       console.log('result', obj);
//     })
//     .catch((error) => error);
// };
