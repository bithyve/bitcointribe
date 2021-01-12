import { Satoshis } from '../../common/data/typealiases/UnitAliases'
import {
  FETCH_WYRE_RESERVATION_SUCCEEDED,
  CLEAR_WYRE_CACHE

} from '../actions/WyreIntegration'


export type WyreOrder = {
  amount: number;
  currencyCode: string;
}

export type WyreIntegrationState = {
  wyreReservationCode: string | null;
  wyreHostedUrl: string | null;
  wyreReservationSucceeded: boolean;

  pendingWyreOrder: WyreOrder | null;
  isProcessingWyreOrder: boolean;
  hasWyreOrderSucceeded: boolean;

  isSyncingWyreWallet: boolean;
  fetchWyreReservationFailed: boolean;
  fetchWyreReservationFailedMessage: null;
}


const INITIAL_STATE: WyreIntegrationState = {
  wyreReservationCode: null,
  wyreHostedUrl: null,
  wyreReservationSucceeded: false,

  pendingWyreOrder: null,
  isProcessingWyreOrder: false,
  hasWyreOrderSucceeded: false,


  isSyncingWyreWallet: false,
  fetchWyreReservationFailed: false,
  fetchWyreReservationFailedMessage: null,
}

const reducer = ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
      case FETCH_WYRE_RESERVATION_SUCCEEDED:
        return {
          ...state,
          wyreReservationCode: action.payload.wyreReservationCode,
          wyreHostedUrl: action.payload.wyreHostedUrl,
          wyreReservationSucceeded: true,
          isProcessingWyreOrder: false,
        }
      case CLEAR_WYRE_CACHE:
        return {
          ...INITIAL_STATE,
        }
  }
  return state
}

export default reducer
