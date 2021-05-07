import { call, put, select } from 'redux-saga/effects'

import {
  updateSwanStatus,
  FETCH_SWAN_AUTHENTICATION_URL,
  fetchSwanAuthenticationUrlInitiated,
  fetchSwanAuthenticationUrlSucceeded,
  REDEEM_SWAN_CODE_FOR_TOKEN,
  redeemSwanCodeForTokenInitiated,
  redeemSwanCodeForTokenSucceeded,
  CREATE_WITHDRAWAL_WALLET_ON_SWAN,
  createWithdrawalWalletOnSwanInitiated,
  createWithdrawalWalletOnSwanSucceeded,

  LINK_SWAN_WALLET,
  linkSwanWalletSucceeded,
  linkSwanWalletFailed,
  tempSwanAccountShellCreated,
  CREATE_TEMP_SWAN_ACCOUNT_SHELL
} from '../actions/SwanIntegration'

import {
  redeemAuthCodeForToken,
  createWithdrawalWalletOnSwan,
  setupAutomaticWithdrawals
} from '../../services/swan'

import { createWatcher } from '../utils/utilities'

import { generatePKCEParameters } from '../lib/swan'
import Config from '../../bitcoin/HexaConfig'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import { AccountsState } from '../reducers/accounts'
import { REGULAR_ACCOUNT } from '../../common/constants/wallet-service-types'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import AccountShell from '../../common/data/models/AccountShell'
import Bitcoin from '../../bitcoin/utilities/accounts/Bitcoin'
import { DerivativeAccountTypes } from '../../bitcoin/utilities/Interface'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'

const swan_auth_url = `${Config.SWAN_BASE_URL}oidc/auth`
const redirect_uri = 'https%3A%2F%2Fhexawallet.io%2Fdev%2Fswan%2F'
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

  // Temp code for testing. to be removed
  console.log( {
    swanResponse
  } )

  const { access_token, expires_in, id_token, scope, token_type } = swanResponse.data
  yield put( redeemSwanCodeForTokenSucceeded( {
    swanAuthenticatedToken: access_token
  } ) )
  yield call( createWithdrawalWalletOnSwanWorker, {
    payload: {
      data: {
        minBtcThreshold: 0.01
      }
    }
  } )
}


export const createWithdrawalWalletOnSwanWatcher = createWatcher(
  createWithdrawalWalletOnSwanWorker,
  CREATE_WITHDRAWAL_WALLET_ON_SWAN
)
export function* createWithdrawalWalletOnSwanWorker( { payload } ) {

  yield put( createWithdrawalWalletOnSwanInitiated( payload.data.minBtcThreshold ) )

  const { swanAuthenticatedToken, swanAccountShell, minBtcThreshold } = yield select(
    ( state ) => state.swanIntegration
  )

  const swanXpub = swanAccountShell.primarySubAccount.xPub
  let swanCreateResponse
  try {
    swanCreateResponse = yield call( createWithdrawalWalletOnSwan, {
      access_token: swanAuthenticatedToken,
      extendedPublicKey: swanXpub,
      displayName: 'BTC purchased from Swan'
    } )
  }
  catch( e )  {
    console.log( {
      e
    } )
  }
  yield put( updateSwanStatus( SwanAccountCreationStatus.AUTHENTICATION_IN_PROGRESS ) )

  const swanWithdrawalResponse = yield call( setupAutomaticWithdrawals, {
    walletId: swanCreateResponse.data.item.id,
    access_token: swanAuthenticatedToken,
    minBtcThreshold
  } )

  yield put( createWithdrawalWalletOnSwanSucceeded( {
    swanWalletId: swanWithdrawalResponse.data.item.id
  } ) )
  yield put( updateSwanStatus( SwanAccountCreationStatus.WALLET_LINKED_SUCCESSFULLY ) )
}

function* addTempSwanAccountShell( { payload: subAccountInfo, }: {
  payload: SubAccountDescribing;
} ) {
  console.log( 'addTempSwanAcc called!' )
  const accountsState: AccountsState = yield select( state => state.accounts )
  const network = accountsState[ REGULAR_ACCOUNT ].service.hdWallet.network

  const bitcoinUnit = BitcoinUnit.SATS

  try {
    const swanAccountDetails = {
      accountName: subAccountInfo.customDisplayName,
      accountDescription: subAccountInfo.customDescription,
    }
    const service = yield select(
      ( state ) => state.accounts[ subAccountInfo.sourceKind ].service
    )
    const res = yield call(
      service.setupDerivativeAccount,
      DerivativeAccountTypes.SWAN,
      swanAccountDetails
    )

    const subAccountId = res.data.accountId
    const subAccountXpub = res.data.accountXpub
    const subAccountInstanceNum = res.data.accountNumber

    subAccountInfo.id = subAccountId
    subAccountInfo.xPub = Bitcoin.generateYpub( subAccountXpub, network )
    subAccountInfo.instanceNumber = subAccountInstanceNum

    const swanAccountShell = new AccountShell( {
      unit: bitcoinUnit,
      primarySubAccount: subAccountInfo,
      displayOrder: 1,
    } )

    yield put( tempSwanAccountShellCreated( swanAccountShell ) )

  } catch ( error ) {
    console.log( 'addNewAccountShell saga::error: ' + error )
  }
}

export const addTempSwanAccountShellWatcher = createWatcher( addTempSwanAccountShell, CREATE_TEMP_SWAN_ACCOUNT_SHELL )

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
