import { Satoshis } from '../../common/data/typealiases/UnitAliases'
import {
  FETCH_WYRE_RESERVATION_SUCCEEDED,
  CLEAR_WYRE_CACHE,
  FETCH_WYRE_RESERVATION_COMPLETED

} from '../actions/WyreIntegration'


export type WyreOrder = {
  amount: number;
  currencyCode: string;
}

export type WyreIntegrationState = {
  wyreReservationCode: string | null;
  wyreHostedUrl: string | null;
  hasWyreReservationFetchSucceeded: boolean;
  hasWyreReservationFetchFailed: boolean;
  fetchWyreReservationFailedMessage: null;

  pendingWyreOrder: WyreOrder | null;
  isProcessingWyreOrder: boolean;
  hasWyreOrderSucceeded: boolean;

  isSyncingWyreWallet: boolean;
}


const INITIAL_STATE: WyreIntegrationState = {
  wyreReservationCode: null,
  wyreHostedUrl: null,
  hasWyreReservationFetchSucceeded: false,
  hasWyreReservationFetchFailed: false,

  pendingWyreOrder: null,
  isProcessingWyreOrder: false,
  hasWyreOrderSucceeded: false,


  isSyncingWyreWallet: false,
  fetchWyreReservationFailedMessage: null,
}

const reducer = ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
      case FETCH_WYRE_RESERVATION_SUCCEEDED:
        return {
          ...state,
          wyreReservationCode: action.payload.fetchWyreReservationDetails.wyreReservationCode,
          wyreHostedUrl: action.payload.fetchWyreReservationDetails.wyreHostedUrl,
          hasWyreReservationFetchSucceeded: true,
          isProcessingWyreOrder: false,
        }
      case FETCH_WYRE_RESERVATION_COMPLETED:
        return {
          ...state,
          hasWyreReservationFetchSucceeded: false,
          hasWyreReservationFetchFailed: false,
        }
      case CLEAR_WYRE_CACHE:
        return {
          ...INITIAL_STATE,
        }
  }
  return state
}

export default reducer
