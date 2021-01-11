import {
  WYRE_RESERVATION_SUCCEEDED,
  CLEAR_WYRE_CACHE

} from '../actions/WyreIntegration'


export type WyreIntegrationState = {
  wyreReservationCode: string | null;
  wyreHostedUrl: string | null;
  wyreReservationSucceeded: boolean;
  isProcessingWyreOrder: boolean;

  isSyncingWyreWallet: boolean;
  fetchWyreReservationFailed: boolean;
  fetchWyreReservationFailedMessage: null;
}

const INITIAL_STATE: WyreIntegrationState = {
  wyreReservationCode: null,
  wyreHostedUrl: null,
  wyreReservationSucceeded: false,
  isProcessingWyreOrder: false,

  isSyncingWyreWallet: false,
  fetchWyreReservationFailed: false,
  fetchWyreReservationFailedMessage: null,
}

const reducer = ( state = INITIAL_STATE, action ) => {
  switch ( action.type ) {
      case WYRE_RESERVATION_SUCCEEDED:
        return {
          ...state,
          wyreReservationCode: action.payload.wyreReservationCode,
          wyreHostedUrl: action.payload.wyreHostedUrl,
          wyreReservationSucceeded: true,
          isProcessingWyreOrder: false,
        }
      case CLEAR_WYRE_CACHE:
        return {
          ...state,
          wyreReservationCode: '',
          wyreHostedUrl: '',
          wyreReservationSucceeded: false,
          isProcessingWyreOrder: false,
        }
  }
  return state
}

export default reducer
