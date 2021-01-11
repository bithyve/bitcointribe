import { call, put } from 'redux-saga/effects'

import {
  FETCH_WYRE_RESERVATION,
  wyreReservationSucceeded,
} from '../actions/WyreIntegration'

import {
  fetchWyreReservation
} from '../../services/wyre'

import { createWatcher } from '../utils/utilities'

export const fetchWyreReservationWatcher = createWatcher(
  fetchWyreReservationWorker,
  FETCH_WYRE_RESERVATION
)

export function* fetchWyreReservationWorker( { payload } ) {
  console.log( { 
    payload 
  } )
  const wyreResponse = yield call( fetchWyreReservation, payload.data )
  console.log( { 
    wyreResponse 
  } )
  const { reservation, url, error } = wyreResponse.data
  if( error ) {
    yield put( wyreReservationSucceeded( {
      wyreReservationCode: null,
      wyreHostedUrl: null,
    } ) )
  }
  yield put( wyreReservationSucceeded( {
    wyreReservationCode: reservation,
    wyreHostedUrl: url
  } ) )
}
