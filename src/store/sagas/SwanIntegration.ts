import { call, put, select } from 'redux-saga/effects'

import {
  REDEEM_SWAN_CODE_FOR_TOKEN,
  FETCH_SWAN_AUTHENTICATION_URL,
  fetchSwanAuthenticationUrlSucceeded,
  LINK_SWAN_WALLET,
  linkSwanWalletSucceeded,
  linkSwanWalletFailed,
  redeemSwanCodeForToken,
  redeemSwanCodeForTokenSucceeded,
} from '../actions/SwanIntegration'

import {
  redeemAuthCodeForToken
} from '../../services/swan'

import { createWatcher } from '../utils/utilities'

import { generatePKCEParameters } from '../lib/swan'
import Config from '../../bitcoin/HexaConfig'

const client_id = Config.SWAN_CLIENT_ID || 'hexa-dev'
const swanOAuthURL = Config.SWAN_BASE_URL || 'https://login-demo.curity.io/oauth/v2/oauth-token'
const swan_auth_url = `${swanOAuthURL}/oidc/auth`
const redirect_uri = 'https%3A%2F%2Fhexawallet.io%2Fdev%2Fswan%2F'//'http%3A%2F%2Flocalhost%3A15000%2Foidc-client-sample.html'//'https://oauth.tools/callback/code' //
let count = 0
export const fetchSwanAuthenticationUrlWatcher = createWatcher(
  fetchSwanAuthenticationUrlWorker,
  FETCH_SWAN_AUTHENTICATION_URL
)
/*
http://dev-api.swanbitcoin.com/oidc/auth?client_id=hexa-dev&redirect_uri=https%3A%2F%2Fhexawallet.io%2Fdev%2Fswan%2F&response_type=code&scope=openid%20v1%20write%3Avendor_wallet%20read%3Avendor_wallet%20write%3Aautomatic_withdrawal%20read%3Aautomatic_withdrawal&state=d250bf9468e0481aa93e384fb89b4f12&code_challenge=y26-jKwd4dLTPD3KZOJOokVKlYFlLZp2kdNSfzZwQRA&code_challenge_method=S256&response_mode=query
http://dev-api.swanbitcoin.com/oidc/auth?client_id=hexa-dev&redirect_uri=https%3A%2F%2Fhexawallet.io%2Fdev%2Fswan%2F&response_type=code&scope=openid%20v1%20write%3Avendor_wallet%20read%3Avendor_wallet%20write%3Aautomatic_withdrawal%20read%3Aautomatic_withdrawal&state=88561517876-FvC&code_challenge=CFw0kTcC9jczdKveoHGzVPjZC9yr-P1CqK15sotZGWA&code_challenge_method=S256&response_mode=query


/*
auth response
https://hexawallet.io/dev/swan/?code=5RU6Hfqez8Yo640QMHByc2bOXr0pRXM_cgN9Nz1iitc&state=d250bf9468e0481aa93e384fb89b4f12
https://hexawallet.io/dev/swan/?code=-emO6cJUmzznR1ObqOhfeG2jSmSXvz6DawhQPNWoBXk&state=75365396958-EJb
hexa://dev/swan/?code=-emO6cJUmzznR1ObqOhfeG2jSmSXvz6DawhQPNWoBXk&state=75365396958-EJb
*/
export function* fetchSwanAuthenticationUrlWorker( { payload } ) {
  const { code_challenge, code_verifier, nonce, state } = generatePKCEParameters()
  const swanAuthenticationUrl = `\
${swan_auth_url}?\
client_id=${client_id}\
&redirect_uri=${redirect_uri}\
&response_type=code\
&scope=openid%20v1%20write%3Avendor_wallet%20read%3Avendor_wallet%20write%3Aautomatic_withdrawal%20read%3Aautomatic_withdrawal\
&state=${state}\
&code_challenge=${code_challenge}\
&code_challenge_method=S256\
&response_mode=query\
`
// &redirect_uri=${redirect_uri}\
// &ui_locales=en\
// &nonce=${nonce}\
  console.log( {
    code_challenge, code_verifier, nonce, state, swanAuthenticationUrl
  } )
  yield put( fetchSwanAuthenticationUrlSucceeded( {
    swanAuthenticationUrl, code_challenge, code_verifier, nonce, state
  } ) )
}


export const redeemSawCodeForTokenWatcher = createWatcher(
  redeemSawCodeForTokenWorker,
  REDEEM_SWAN_CODE_FOR_TOKEN
)
export function* redeemSawCodeForTokenWorker( { payload } ) {
  /*

  Request
  http://dev-api.swanbitcoin.com/oidc/auth?client_id=hexa-dev&redirect_uri=https%3A%2F%2Fhexawallet.io%2Fdev%2Fswan%2F&response_type=code&scope=openid%20v1%20write%3Avendor_wallet%20read%3Avendor_wallet%20write%3Aautomatic_withdrawal%20read%3Aautomatic_withdrawal&state=33679074916-byV&code_challenge=8JAY1jmIqOj8Jjf5a1ODHbZCuIJ9i0Zs3ZoXlpH7b8c&code_challenge_method=S256&response_mode=query'

  Response
  https://hexawallet.io/dev/swan/?code=yU0zLa-PnsjKzD7vXWc_2zF2Xyut7FrjMTQgqSvnRCp&state=33679074916-byV

  */
  console.log( count++, payload )
  // 'code': 'yU0zLa-PnsjKzD7vXWc_2zF2Xyut7FrjMTQgqSvnRCp&state=33679074916-byV',
  // 'code_verifier': 'jLm1y0vAqiYS1TcfwMaXAB0opMQloxjb25sGORAMN5BNUWgeOteCkWaqW1HpJCWz',
  const { code, code_verifier } = yield select(
    ( state ) => state.swanIntegration
  )
  const swanAuthenticatedCode = yield call( redeemAuthCodeForToken, {
    code, code_verifier
  } )

  yield put( redeemSwanCodeForTokenSucceeded( {
    swanAuthenticatedCode
  } ) )
}

function* linkSwanWalletWorker( { payload } ) {
  console.log( 'linkSwanWallet payload.data', payload.data )
  /*
  Continue with this worker only if:
  condition 1: Swan Account is not present
  OR
  condition 2: Swan account is present but status is 'NOT_LINKED'
  */
  const condition1 = true
  const condition2 = true
  if ( condition1 || condition2 ) {
    const data = {
      linkSwanWalletFailed: true,
      linkSwanWalletFailedMessage: 'Swan Account already available',
    }
    yield put( linkSwanWalletFailed( data ) )
  }

  try {
    /*
    Option 1:
    Retrieve swan account
    retrieve swan auth token and swan xpub from swan acc data.
    replace swanAccount with retrieved swan Account

    Option 2:
    swan auth token and swan xpub will be passed as data from UI via action
    */

    // below is required for Option 1 only and not for Option 2
    const swanAccount = {
      xpub: '',
      swanAuthToken: '',
    }

    payload.data.xpub = swanAccount.xpub
    payload.data.swanAuthToken = swanAccount.swanAuthToken

    // {"btcAddresses":["3PTECsh6bMhNVmDPYqkYkr3cro2Mo8q6fL"],"displayName":"wallet-test"}

    let result = yield call( linkSwanWallet, payload.data )

    if ( !result || result.status !== 200 ) {
      const data = {
        linkSwanWalletFailed: true,
        linkSwanWalletFailedMessage: 'Swan wallet linking failed',
      }
      yield put( linkSwanWalletFailed( data ) )
    } else {
      /*
      If its a success the response will be as follows:

      {
          "entity": "walletAddress",
          "item": {
              "id": "096cd43f-f1c5-47cb-9acb-6a29134c5262",
              "btcAddress": "2N6aLeRSg3p63BguHpjMf5CVcfYQtr7xoan",
              "isConfirmed": false,
              "displayName": "wallet-test"
          }
      }
      */
      result = {
        entity: 'walletAddress',
        item: {
          id: '096cd43f-f1c5-47cb-9acb-6a29134c5262',
          btcAddress: '2N6aLeRSg3p63BguHpjMf5CVcfYQtr7xoan',
          isConfirmed: false,
          displayName: 'wallet-test',
        },
      }

      /*
      The following properties needs to be updated in Swan Acc data:
      */
      const swanWalletId = result.item.id
      const linkStatus = 'LINK_INITIATED'
      const isConfirmed = false
      const displayName = result.item.displayName

      const data = {
        linkStatus, isConfirmed, displayName, swanWalletId
      }
      yield put( linkSwanWalletSucceeded( data ) )

      if ( result.error ) {
        const data = {
          linkSwanWalletFailed: true,
          linkSwanWalletFailedMessage: result.message || 'Swan wallet linking failed',
        }
        yield put( linkSwanWalletFailed( data ) )
      }
    }
  } catch ( err ) {
    console.log( 'err', err )
    const data = {
      linkSwanWalletFailed: true,
      linkSwanWalletFailedMessage: 'Swan wallet linking failed',
    }
    yield put( linkSwanWalletFailed( data ) )
  }
}

export const linkSwanWalletWatcher = createWatcher( linkSwanWalletWorker, LINK_SWAN_WALLET )
