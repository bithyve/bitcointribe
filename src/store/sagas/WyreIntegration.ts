import { call, put, select } from 'redux-saga/effects'

import {
  FETCH_WYRE_RESERVATION,
  hasWyreReservationFetchSucceeded,
} from '../actions/WyreIntegration'

import {
  fetchWyreReservation
} from '../../services/wyre'

import { createWatcher } from '../utils/utilities'
import { DerivativeAccounts } from '../../bitcoin/utilities/Interface'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import { WYRE } from '../../common/constants/serviceTypes'
import BaseAccount from '../../bitcoin/utilities/accounts/BaseAccount'
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
  console.log( {
    wyreResponse
  } )
  const { reservation, url, error } = wyreResponse.data
  if( error ) {
    yield put( hasWyreReservationFetchSucceeded( {
      wyreReservationCode: null,
      wyreHostedUrl: null,
    } ) )
  }
  yield put( hasWyreReservationFetchSucceeded( {
    wyreReservationCode: reservation,
    wyreHostedUrl: url
  } ) )
}
