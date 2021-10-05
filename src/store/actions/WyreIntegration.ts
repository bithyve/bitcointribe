import { Action } from 'redux'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import { WyreOrder } from '../reducers/WyreIntegration'

export const FETCH_WYRE_RESERVATION = 'FETCH_WYRE_RESERVATION'
export const FETCH_WYRE_RESERVATION_FAILED = 'FETCH_WYRE_RESERVATION_FAILED'
export const FETCH_WYRE_RESERVATION_SUCCEEDED = 'FETCH_WYRE_RESERVATION_SUCCEEDED'
export const FETCH_WYRE_RESERVATION_COMPLETED = 'FETCH_WYRE_RESERVATION_COMPLETED'

export const FETCH_WYRE_RECEIVE_ADDRESS = 'FETCH_WYRE_RECEIVE_ADDRESS'
export const FETCH_WYRE_RECEIVE_ADDRESS_FAILED = 'FETCH_WYRE_RECEIVE_ADDRESS_FAILED'
export const FETCH_WYRE_RECEIVE_ADDRESS_SUCCEEDED = 'FETCH_WYRE_RECEIVE_ADDRESS_SUCCEEDED'
export const FETCH_WYRE_RECEIVE_ADDRESS_COMPLETED = 'FETCH_WYRE_RECEIVE_ADDRESS_COMPLETED'

export const WYRE_ORDER_FAILED = 'WYRE_ORDER_FAILED'
export const WYRE_ORDER_SUCCEEDED = 'WYRE_ORDER_SUCCEEDED'
export const WYRE_ORDER_COMPLETED = 'WYRE_ORDER_COMPLETED'

export const CLEAR_WYRE_CACHE = 'CLEAR_WYRE_CACHE'


export enum WyreActionKind {
  AUTHENTICATE,
  CREATE_WYRE_ACCOUNT_SHELL,
  LINK_HEXA_AND_WYRE_SUB_ACCOUNTS,
  FETCH_WYRE_RESERVATION,
  FETCH_WYRE_RECEIVE_ADDRESS,
  CLEAR_WYRE_CACHE
}


export const clearWyreCache = ( ) => {
  return {
    type: CLEAR_WYRE_CACHE,
  }
}

export interface WyreReservationFetchAction extends Action {
  type: typeof FETCH_WYRE_RESERVATION;
  payload: {
    address: string,
    amount?: number;
    currencyCode?: string;
    country?: string;
  };
}

export interface WyreReceiveAddressFetchAction extends Action {
  type: typeof FETCH_WYRE_RECEIVE_ADDRESS;
  payload: {
    instance?: number;
    sourceKind?: SourceAccountKind;
  }
}

export const fetchWyreReservation = (
  address: string,
  amount?: number,
  currencyCode?: string,
  country?: string,
): WyreReservationFetchAction => {
  return {
    type: FETCH_WYRE_RESERVATION,
    payload: {
      address, amount, currencyCode, country
    },
  }
}


export const fetchWyreReservationCompleted = ( ) => {
  return {
    type: FETCH_WYRE_RESERVATION_COMPLETED,
  }
}

export const fetchWyreReservationFailed = ( data ) => {
  return {
    type: FETCH_WYRE_RESERVATION_FAILED,
    payload: {
      data
    },
  }
}

export const fetchWyreReservationSucceeded = ( data ) => {
  return {
    type: FETCH_WYRE_RESERVATION_SUCCEEDED,
    payload: {
      fetchWyreReservationDetails: data
    },
  }
}

export const fetchWyreReceiveAddress = (
  instance?: number,
  sourceKind?: SourceAccountKind,
):WyreReceiveAddressFetchAction  => {
  return {
    type: FETCH_WYRE_RECEIVE_ADDRESS,
    payload: {
      instance, sourceKind
    },
  }
}


export const fetchWyreReceiveAddressCompleted = ( ) => {
  return {
    type: FETCH_WYRE_RECEIVE_ADDRESS_COMPLETED,
  }
}

export const fetchWyreReceiveAddressFailed = ( data ) => {
  return {
    type: FETCH_WYRE_RECEIVE_ADDRESS_FAILED,
    payload: {
      data
    },
  }
}

export const fetchWyreReceiveAddressSucceeded = ( data ) => {
  return {
    type: FETCH_WYRE_RECEIVE_ADDRESS_SUCCEEDED,
    payload: {
      data
    },
  }
}

export interface WyreOrderSuccessAction extends Action {
  type: typeof WYRE_ORDER_SUCCEEDED;
  payload: WyreOrder;
}


export const wyreOrderSucceeded = ( payload: WyreOrder ): WyreOrderSuccessAction => {
  return {
    type: WYRE_ORDER_SUCCEEDED,
    payload,
  }
}


export interface WyreOrderFailureAction extends Action {
  type: typeof WYRE_ORDER_FAILED;
  payload: string;
}

export const wyreOrderFailed = (
  errorMessage: string
): WyreOrderFailureAction => {
  return {
    type: WYRE_ORDER_FAILED,
    payload: errorMessage,
  }
}


export interface WyreOrderCompletionAction extends Action {
  type: typeof WYRE_ORDER_COMPLETED;
}

export const wyreOrderCompleted = ( ): WyreOrderCompletionAction => {
  return {
    type: WYRE_ORDER_COMPLETED,
  }
}
