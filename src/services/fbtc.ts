import axios from 'axios'
import { FBTC_URL } from 'react-native-dotenv'

const URL = FBTC_URL

const apiInfo = {
	accountSync: {
		method: 'get',
		url: 'account-sync/wallet_slug/user_key'
	},
	getQuote: {
		method: 'post',
		url: 'quote'
	},
	executeOrder: {
		method: 'post',
		url: 'execute'
	},
	getBalances: {
		method: 'get',
		url: 'user-balances/wallet_slug/user_key'
	}
}

export default (service, data) => 
	axios({
		method: apiInfo[service]["method"],
		url: URL + apiInfo[service]["url"],
		data
	})
	.catch(error => error);