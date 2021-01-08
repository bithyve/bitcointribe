import { call, put } from 'redux-saga/effects'

import {
  FETCH_WYRE_TOKEN,
  fetchWyreTokenSucceeded,
  fetchWyreTokenFailed,
  LINK_WYRE_WALLET,
  linkWyreWalletSucceeded,
  linkWyreWalletFailed,
} from '../actions/WyreIntegration'

import {
  getWyreAuthToken,
  linkWyreWallet,
  syncWyreWallet,
  redeemAuthCode
} from '../../services/wyre'

import { createWatcher } from '../utils/utilities'

export function* fetchWyreTokenWorker( { payload } ) {
  // Authentication code is available which needs to be redeemed
  console.log( 'About to Redeem Authorization Code ', payload.data )
  try {
    const result = yield call( redeemAuthCode, payload.data )

    console.log( '***-> result', result )
    if ( !result || result.status !== 200 ) {
      const data = {
        fetchWyreTokenFail: true,
        fetchWyreTokenFailMessage: 'Wyre authentication failed',
      }
      yield put( fetchWyreTokenFailed( data ) )
    } else {
      /*
      If we are here that means authentication was succesful with Wyre
      there are 2 options to consider

      Option 1:
      User is now athenticated with Wyre so they really do have a Wyre account
      we can now create a Wyre Account and save:
      wyre xpub,
      The returned auth token
      initial linkingStatus as 'NOT_LINKED'
      isConfirmed  as false

      Option 2:
      Create the wyre account shell as a separate action and reducer
      and update it when we get the auth token.
      */

      yield put( fetchWyreTokenSucceeded( result.data ) )
      if ( result.error ) {
        const data = {
          fetchWyreTokenFail: true,
          fetchWyreTokenFailMessage: result.message || 'Wyre authentication failed',
        }
        yield put( fetchWyreTokenFailed( data ) )
      }
    }
  } catch ( err ) {
    console.log( 'err', err )
    const data = {
      fetchWyreTokenFail: true,
      fetchWyreTokenFailMessage: 'Wyre authentication failed',
    }
    yield put( fetchWyreTokenFailed( data ) )
  }
}

export const fetchWyreTokenWatcher = createWatcher(
  fetchWyreTokenWorker,
  FETCH_WYRE_TOKEN,
)

function* linkWyreWalletWorker( { payload } ) {
  console.log( 'linkWyreWallet payload.data', payload.data )
  /*
  Continue with this worker only if:
  condition 1: Wyre Account is not present
  OR
  condition 2: Wyre account is present but status is 'NOT_LINKED'
  */
  const condition1 = true
  const condition2 = true
  if ( condition1 || condition2 ) {
    const data = {
      linkWyreWalletFailed: true,
      linkWyreWalletFailedMessage: 'Wyre Account already available',
    }
    yield put( linkWyreWalletFailed( data ) )
  }

  try {
    /*
    Option 1:
    Retrieve wyre account
    retrieve wyre auth token and wyre xpub from wyre acc data.
    replace wyreAccount with retrieved wyre Account

    Option 2:
    wyre auth token and wyre xpub will be passed as data from UI via action
    */

    // below is required for Option 1 only and not for Option 2
    const wyreAccount = {
      xpub: '',
      wyreAuthToken: '',
    }

    payload.data.xpub = wyreAccount.xpub
    payload.data.wyreAuthToken = wyreAccount.wyreAuthToken

    // {"btcAddresses":["3PTECsh6bMhNVmDPYqkYkr3cro2Mo8q6fL"],"displayName":"wallet-test"}

    let result = yield call( linkWyreWallet, payload.data )

    if ( !result || result.status !== 200 ) {
      const data = {
        linkWyreWalletFailed: true,
        linkWyreWalletFailedMessage: 'Wyre wallet linking failed',
      }
      yield put( linkWyreWalletFailed( data ) )
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
      The following properties needs to be updated in Wyre Acc data:
      */
      const wyreWalletId = result.item.id
      const linkStatus = 'LINK_INITIATED'
      const isConfirmed = false
      const displayName = result.item.displayName

      const data = {
        linkStatus, isConfirmed, displayName, wyreWalletId
      }
      yield put( linkWyreWalletSucceeded( data ) )

      if ( result.error ) {
        const data = {
          linkWyreWalletFailed: true,
          linkWyreWalletFailedMessage: result.message || 'Wyre wallet linking failed',
        }
        yield put( linkWyreWalletFailed( data ) )
      }
    }
  } catch ( err ) {
    console.log( 'err', err )
    const data = {
      linkWyreWalletFailed: true,
      linkWyreWalletFailedMessage: 'Wyre wallet linking failed',
    }
    yield put( linkWyreWalletFailed( data ) )
  }
}

export const linkWyreWalletWatcher = createWatcher( linkWyreWalletWorker, LINK_WYRE_WALLET )
