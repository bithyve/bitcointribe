import { Action } from 'redux'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import { RampOrder } from '../reducers/RampIntegration'

export const FETCH_RAMP_RESERVATION = 'FETCH_RAMP_RESERVATION'
export const FETCH_RAMP_RESERVATION_FAILED = 'FETCH_RAMP_RESERVATION_FAILED'
export const FETCH_RAMP_RESERVATION_SUCCEEDED = 'FETCH_RAMP_RESERVATION_SUCCEEDED'
export const FETCH_RAMP_RESERVATION_COMPLETED = 'FETCH_RAMP_RESERVATION_COMPLETED'

export const FETCH_RAMP_RECEIVE_ADDRESS = 'FETCH_RAMP_RECEIVE_ADDRESS'
export const FETCH_RAMP_RECEIVE_ADDRESS_SUCCEEDED = 'FETCH_RAMP_RECEIVE_ADDRESS_SUCCEEDED'

export const RAMP_ORDER_FAILED = 'RAMP_ORDER_FAILED'
export const RAMP_ORDER_SUCCEEDED = 'RAMP_ORDER_SUCCEEDED'
export const RAMP_ORDER_COMPLETED = 'RAMP_ORDER_COMPLETED'

export const CLEAR_RAMP_CACHE = 'CLEAR_RAMP_CACHE'


export enum RampActionKind {
  AUTHENTICATE,
  CREATE_RAMP_ACCOUNT_SHELL,
  LINK_HEXA_AND_RAMP_SUB_ACCOUNTS,
  FETCH_RAMP_RESERVATION,

  CLEAR_RAMP_CACHE
}


export const clearRampCache = ( ) => {
  return {
    type: CLEAR_RAMP_CACHE,
  }
}

export interface RampReservationFetchAction extends Action {
  type: typeof FETCH_RAMP_RESERVATION;
  payload: {
    address: string,
    amount?: number;
    currencyCode?: string;
    country?: string;
  };
}


export const fetchRampReservation = (
  address: string,
  amount?: number,
  currencyCode?: string,
  country?: string,
): RampReservationFetchAction => {
  return {
    type: FETCH_RAMP_RESERVATION,
    payload: {
      address, amount, currencyCode, country
    },
  }
}


export const fetchRampReservationCompleted = ( ) => {
  return {
    type: FETCH_RAMP_RESERVATION_COMPLETED,
  }
}

export const fetchRampReservationFailed = ( data ) => {
  return {
    type: FETCH_RAMP_RESERVATION_FAILED,
    payload: {
      data
    },
  }
}

export const fetchRampReservationSucceeded = ( data ) => {
  return {
    type: FETCH_RAMP_RESERVATION_SUCCEEDED,
    payload: {
      fetchRampReservationDetails: data
    },
  }
}


export const fetchRampReceiveAddress = (
  instance?: number,
  sourceKind?: SourceAccountKind,
)  => {
  return {
    type: FETCH_RAMP_RECEIVE_ADDRESS,
    payload: {
      instance, sourceKind
    },
  }
}

export const fetchRampReceiveAddressSucceeded = ( data ) => {
  return {
    type: FETCH_RAMP_RECEIVE_ADDRESS_SUCCEEDED,
    payload: {
      data
    },
  }
}

export interface RampOrderSuccessAction extends Action {
  type: typeof RAMP_ORDER_SUCCEEDED;
  payload: RampOrder;
}


export const rampOrderSucceeded = ( payload: RampOrder ): RampOrderSuccessAction => {
  return {
    type: RAMP_ORDER_SUCCEEDED,
    payload,
  }
}


export interface RampOrderFailureAction extends Action {
  type: typeof RAMP_ORDER_FAILED;
  payload: string;
}

export const rampOrderFailed = (
  errorMessage: string
): RampOrderFailureAction => {
  return {
    type: RAMP_ORDER_FAILED,
    payload: errorMessage,
  }
}


export interface RampOrderCompletionAction extends Action {
  type: typeof RAMP_ORDER_COMPLETED;
}

export const rampOrderCompleted = ( ): RampOrderCompletionAction => {
  return {
    type: RAMP_ORDER_COMPLETED,
  }
}
