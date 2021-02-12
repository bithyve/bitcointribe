import { Satoshis } from '../../common/data/typealiases/UnitAliases'
import {
  FETCH_RAMP_RESERVATION_SUCCEEDED,
  CLEAR_RAMP_CACHE,
  FETCH_RAMP_RESERVATION_COMPLETED

} from '../actions/RampIntegration'


export type RampOrder = {
  amount: number;
  currencyCode: string;
}

export type RampIntegrationState = {
  rampReservationCode: string | null;
  rampHostedUrl: string | null;
  hasRampReservationFetchSucceeded: boolean;
  hasRampReservationFetchFailed: boolean;
  fetchRampReservationFailedMessage: string | null;

  pendingRampOrder: RampOrder | null;
  isProcessingRampOrder: boolean;
  hasRampOrderSucceeded: boolean;
  hasRampOrderFailed: boolean;
  rampOrderFailedMessage: string | null;

  isSyncingRampWallet: boolean;
}


const INITIAL_STATE: RampIntegrationState = {
  rampReservationCode: null,
  rampHostedUrl: null,
  hasRampReservationFetchSucceeded: false,
  hasRampReservationFetchFailed: false,
  fetchRampReservationFailedMessage: null,

  pendingRampOrder: null,
  isProcessingRampOrder: false,
  hasRampOrderSucceeded: false,
  hasRampOrderFailed: false,
  rampOrderFailedMessage: null,

  isSyncingRampWallet: false,
}

const reducer = ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
      case FETCH_RAMP_RESERVATION_SUCCEEDED:
        return {
          ...state,
          rampReservationCode: action.payload.fetchRampReservationDetails.rampReservationCode,
          rampHostedUrl: action.payload.fetchRampReservationDetails.rampHostedUrl,
          hasRampReservationFetchSucceeded: true,
          isProcessingRampOrder: false,
        }
      case FETCH_RAMP_RESERVATION_COMPLETED:
        return {
          ...state,
          hasRampReservationFetchSucceeded: false,
          hasRampReservationFetchFailed: false,
        }
      case CLEAR_RAMP_CACHE:
        return {
          ...INITIAL_STATE,
        }
  }
  return state
}

export default reducer
