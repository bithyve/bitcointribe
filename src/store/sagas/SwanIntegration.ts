import { call, put, select } from 'redux-saga/effects'

import {
  REDEEM_SWAN_CODE_FOR_TOKEN,
  FETCH_SWAN_AUTHENTICATION_URL,
  fetchSwanAuthenticationUrlInitiated,
  fetchSwanAuthenticationUrlSucceeded,
  LINK_SWAN_WALLET,
  linkSwanWalletSucceeded,
  linkSwanWalletFailed,
  redeemSwanCodeForTokenInitiated,
  redeemSwanCodeForTokenSucceeded,
} from '../actions/SwanIntegration'

import {
  redeemAuthCodeForToken
} from '../../services/swan'

import { createWatcher } from '../utils/utilities'

import { generatePKCEParameters } from '../lib/swan'
import Config from '../../bitcoin/HexaConfig'

const swan_auth_url = `${Config.SWAN_BASE_URL}/oidc/auth`
const redirect_uri = 'https%3A%2F%2Fhexawallet.io%2Fdev%2Fswan%2F'
const count = 0
export const fetchSwanAuthenticationUrlWatcher = createWatcher(
  fetchSwanAuthenticationUrlWorker,
  FETCH_SWAN_AUTHENTICATION_URL
)

export function* fetchSwanAuthenticationUrlWorker( { payload } ) {
  yield put( fetchSwanAuthenticationUrlInitiated() )
  const { code_challenge, code_verifier, nonce, state } = yield call( generatePKCEParameters )
  const swanAuthenticationUrl = `\
${swan_auth_url}?\
client_id=${Config.SWAN_CLIENT_ID}\
&redirect_uri=${redirect_uri}\
&response_type=code\
&scope=openid%20v1%20write%3Avendor_wallet%20read%3Avendor_wallet%20write%3Aautomatic_withdrawal%20read%3Aautomatic_withdrawal\
&state=${state}\
&code_challenge=${code_challenge}\
&code_challenge_method=S256\
&response_mode=query\
`

  yield put( fetchSwanAuthenticationUrlSucceeded( {
    swanAuthenticationUrl, code_challenge, code_verifier, nonce, state
  } ) )
}


export const redeemSwanCodeForTokenWatcher = createWatcher(
  redeemSwanCodeForTokenWorker,
  REDEEM_SWAN_CODE_FOR_TOKEN
)
export function* redeemSwanCodeForTokenWorker( { payload } ) {
  yield put( redeemSwanCodeForTokenInitiated() )

  // Extract swan auth code from deep link redirect url
  const splits = payload.data.split( '/' )
  const code = splits[ splits.length - 1 ].split( '&' )[ 0 ].split( '=' )[ 1 ]

  const { code_verifier, state } = yield select(
    ( state ) => state.swanIntegration
  )
  const swanResponse = yield call( redeemAuthCodeForToken, {
    code,
    state,
    code_verifier
  } )

  const { access_token, expires_in, id_token, scope, token_type } = swanResponse.data
  yield put( redeemSwanCodeForTokenSucceeded( {
    swanAuthenticatedCode: access_token
  } ) )
}

function* linkSwanWalletWorker( { payload } ) {
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
