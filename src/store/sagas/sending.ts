import { put } from 'redux-saga/effects'
import { createWatcher } from '../utils/utilities'
import { CALCULATE_SEND_MAX_FEE, sendMaxFeeCalculated } from '../actions/sending'


function* calculateSendMaxFee( { } ) {
  yield put( sendMaxFeeCalculated( 100 ) )
}

export const calculateSendMaxFeeWatcher = createWatcher(
  calculateSendMaxFee,
  CALCULATE_SEND_MAX_FEE
)
