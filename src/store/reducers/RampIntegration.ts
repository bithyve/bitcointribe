import { Satoshis } from '../../common/data/typealiases/UnitAliases'
import {
  FETCH_RAMP_RESERVATION_SUCCEEDED,
  CLEAR_RAMP_CACHE,
  FETCH_RAMP_RECEIVE_ADDRESS_SUCCEEDED,

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

  rampReceiveAddress: string | null;
  hasRampReceiveAddressSucceeded: boolean;

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
  rampReceiveAddress: null,
  hasRampReceiveAddressSucceeded: false,

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
      case FETCH_RAMP_RECEIVE_ADDRESS_SUCCEEDED:
        return {
          ...state,
          rampReceiveAddress: action.payload.data.rampReceiveAddress,
          hasRampReceiveAddressSucceeded: true
        }
      case CLEAR_RAMP_CACHE:
        return {
          ...INITIAL_STATE,
        }
  }
  return state
}

export default reducer
