import { call, put } from 'redux-saga/effects'

import {
  FETCH_WYRE_RESERVATION,
  fetchWyreReservationSucceeded,
} from '../actions/WyreIntegration'

import {
  fetchWyreReservation
} from '../../services/wyre'

import { createWatcher } from '../utils/utilities'

function* fetchWyreReservationWorker( { payload } ) {
  const { address: receiveAddress, amount, currencyCode, country } = payload
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

export const fetchWyreReservationWatcher = createWatcher(
  fetchWyreReservationWorker,
  FETCH_WYRE_RESERVATION
)
