import axios from 'axios';
import { FBTC_URL, WALLET_SLUG } from 'react-native-dotenv';

const URL = FBTC_URL;

export default (service, data) => {
  const apiInfo = {
    accountSync: {
      method: 'get',
      url: 'account-sync/' + WALLET_SLUG + '/' + data.userKey,
    },
    getQuote: {
      method: 'post',
      url: 'quote',
    },
    executeOrder: {
      method: 'post',
      url: 'execute',
    },
    getBalances: {
      method: 'get',
      url: 'user-balances/' + WALLET_SLUG + '/' + data.userKey,
    },
  };
  axios({
    method: apiInfo[service]['method'],
    url: URL + apiInfo[service]['url'],
    data,
  }).then((obj) => {
      console.log('result', obj);
    })
    .catch((error) => error);
};
