import { call, put, select } from 'redux-saga/effects'

import {
  FETCH_RAMP_RESERVATION,
  fetchRampReservationSucceeded,
  fetchRampReceiveAddressSucceeded
} from '../actions/RampIntegration'

import {
  fetchRampReservation
} from '../../services/ramp'

import { createWatcher } from '../utils/utilities'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import { RAMP } from '../../common/constants/wallet-service-types'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'

export const fetchRampReservationWatcher = createWatcher(
  fetchRampReservationWorker,
  FETCH_RAMP_RESERVATION
)

function* fetchRampReservationWorker( { payload } ) {
  const { instance, sourceKind } = payload

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
  const receiveAddress =  service.getReceivingAddress( RAMP, instance? instance: 1 )

  const rampResponse = yield call(
    fetchRampReservation,
    {
      receiveAddress
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
