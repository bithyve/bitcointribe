import { call, put } from 'redux-saga/effects'

import {
  FETCH_RAMP_RESERVATION,
  fetchRampReservationSucceeded,
} from '../actions/RampIntegration'
import {
  fetchRampReservation
} from '../../services/ramp'
import { createWatcher } from '../utils/utilities'

function* fetchRampReservationWorker( { payload } ) {
  const { address } = payload
  const rampResponse = yield call(
    fetchRampReservation,
    {
      receiveAddress: address,
    } )

  const { reservation, url, error } = rampResponse

  if( error ) {
    yield put( fetchRampReservationSucceeded( {
      rampReservationCode: null,
      rampHostedUrl: null,
    } ) )
  }
  yield put( fetchRampReservationSucceeded( {
    rampReservationCode: reservation,
    rampHostedUrl: url
  } ) )
}

export const fetchRampReservationWatcher = createWatcher(
  fetchRampReservationWorker,
  FETCH_RAMP_RESERVATION
)
