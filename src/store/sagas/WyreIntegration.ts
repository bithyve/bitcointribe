import { call, put, select } from 'redux-saga/effects'

import {
  FETCH_WYRE_RESERVATION,
  fetchWyreReservationSucceeded,
  FETCH_WYRE_RECEIVE_ADDRESS,
  fetchWyreReceiveAddressSucceeded
} from '../actions/WyreIntegration'

import {
  fetchWyreReservation
} from '../../services/wyre'

import { createWatcher } from '../utils/utilities'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import { WYRE } from '../../common/constants/wallet-service-types'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'

export const fetchWyreReservationWatcher = createWatcher(
  fetchWyreReservationWorker,
  FETCH_WYRE_RESERVATION
)

function* fetchWyreReservationWorker( { payload } ) {
  const { amount, currencyCode, country, instance, sourceKind } = payload

  let service: RegularAccount| SecureAccount
  switch ( sourceKind ) {
      case SourceAccountKind.SECURE_ACCOUNT:
        service = yield select(
          ( state ) => state.accounts[ SourceAccountKind.SECURE_ACCOUNT ].service
        )
        break
      default:
        service = yield select(
          ( state ) => state.accounts[ SourceAccountKind.REGULAR_ACCOUNT ].service
        )
  }
  const receiveAddress =  service.getReceivingAddress( WYRE, instance? instance: 1 )

  const wyreResponse = yield call( fetchWyreReservation, amount, receiveAddress, currencyCode, country )

  const { reservation, url, error } = wyreResponse.data
  if( error ) {
    yield put( fetchWyreReservationSucceeded( {
      wyreReservationCode: null,
      wyreHostedUrl: null,
    } ) )
  }
  yield put( fetchWyreReservationSucceeded( {
    wyreReservationCode: reservation,
    wyreHostedUrl: url
  } ) )
}
