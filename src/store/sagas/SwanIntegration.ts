import { call, put } from 'redux-saga/effects'

import {
  FETCH_SWAN_TOKEN,
  fetchSwanTokenSucceeded,
  fetchSwanTokenFailed,
  LINK_SWAN_WALLET,
  linkSwanWalletSucceeded,
  linkSwanWalletFailed,
} from '../actions/SwanIntegration'

import {
  getSwanAuthToken,
  linkSwanWallet,
  syncSwanWallet,
  redeemAuthCode
} from '../../services/swan'

import { createWatcher } from '../utils/utilities'

export function* fetchSwanTokenWorker( { payload } ) {
  // Authentication code is available which needs to be redeemed
  console.log( 'About to Redeem Authorization Code ', payload.data )
  try {
    const result = yield call( redeemAuthCode, payload.data )

    console.log( '***-> result', result )
    if ( !result || result.status !== 200 ) {
      const data = {
        fetchSwanTokenFail: true,
        fetchSwanTokenFailMessage: 'Swan authentication failed',
      }
      yield put( fetchSwanTokenFailed( data ) )
    } else {
      /*
      If we are here that means authentication was succesful with Swan
      there are 2 options to consider

      Option 1:
      User is now athenticated with Swan so they really do have a Swan account
      we can now create a Swan Account and save:
      swan xpub,
      The returned auth token
      initial linkingStatus as 'NOT_LINKED'
      isConfirmed  as false

      Option 2:
      Create the swan account shell as a separate action and reducer
      and update it when we get the auth token.
      */

      yield put( fetchSwanTokenSucceeded( result.data ) )
      if ( result.error ) {
        const data = {
          fetchSwanTokenFail: true,
          fetchSwanTokenFailMessage: result.message || 'Swan authentication failed',
        }
        yield put( fetchSwanTokenFailed( data ) )
      }
    }
  } catch ( err ) {
    console.log( 'err', err )
    const data = {
      fetchSwanTokenFail: true,
      fetchSwanTokenFailMessage: 'Swan authentication failed',
    }
    yield put( fetchSwanTokenFailed( data ) )
  }
}

export const fetchSwanTokenWatcher = createWatcher(
  fetchSwanTokenWorker,
  FETCH_SWAN_TOKEN,
)

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
