import axios from 'axios';
import { FBTC_URL } from 'react-native-dotenv';

const URL = FBTC_URL;
const wallet_slug = 'bithyve';

export default (service, data) => {
  const apiInfo = {
    accountSync: {
      method: 'get',
      url: 'account-sync/' + wallet_slug + '/' + data.userKey,
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
      url: 'user-balances/' + wallet_slug + '/' + data.userKey,
    },
  };
  axios({
    method: apiInfo[service]['method'],
    url: URL + apiInfo[service]['url'],
    data,
  })
    .then((obj) => {
      console.log('result', obj);
    })
    .catch((error) => error);
};
