import { Satoshis } from '../../common/data/typealiases/UnitAliases'
import {
  FETCH_WYRE_RESERVATION_SUCCEEDED,
  CLEAR_WYRE_CACHE,
  FETCH_WYRE_RESERVATION_COMPLETED,
  FETCH_WYRE_RECEIVE_ADDRESS_SUCCEEDED,
  FETCH_WYRE_RECEIVE_ADDRESS_COMPLETED
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
  fetchWyreReservationFailedMessage: string | null;

  wyreReceiveAddress: string | null;
  hasWyreReceiveAddressSucceeded: boolean;
  hasWyreReceiveAddressFailed: boolean;

  pendingWyreOrder: WyreOrder | null;
  isProcessingWyreOrder: boolean;
  hasWyreOrderSucceeded: boolean;
  hasWyreOrderFailed: boolean;
  wyreOrderFailedMessage: string | null;

  isSyncingWyreWallet: boolean;
}


const INITIAL_STATE: WyreIntegrationState = {
  wyreReservationCode: null,
  wyreHostedUrl: null,
  hasWyreReservationFetchSucceeded: false,
  hasWyreReservationFetchFailed: false,
  fetchWyreReservationFailedMessage: null,


  wyreReceiveAddress: null,
  hasWyreReceiveAddressSucceeded: false,
  hasWyreReceiveAddressFailed: false,

  pendingWyreOrder: null,
  isProcessingWyreOrder: false,
  hasWyreOrderSucceeded: false,
  hasWyreOrderFailed: false,
  wyreOrderFailedMessage: null,

  isSyncingWyreWallet: false,
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
      case FETCH_WYRE_RECEIVE_ADDRESS_SUCCEEDED:
        return {
          ...state,
          wyreReceiveAddress: action.payload.data.wyreReceiveAddress,
          hasWyreReceiveAddressSucceeded: true
        }
      case FETCH_WYRE_RECEIVE_ADDRESS_COMPLETED:
        return {
          ...state,
          hasWyreReceiveAddressSucceeded: false,
          hasWyreReceiveAddressFailed: false,
        }
      case CLEAR_WYRE_CACHE:
        return {
          ...INITIAL_STATE,
        }
  }
  return state
}

export default reducer
