
export const FETCH_WYRE_RESERVATION = 'FETCH_WYRE_RESERVATION'
export const WYRE_RESERVATION_SUCCEEDED = 'WYRE_RESERVATION_SUCCEEDED'

export const FETCH_WYRE_RESERVATION_FAILED = 'FETCH_WYRE_RESERVATION_FAILED'
export const FETCH_WYRE_RESERVATION_SUCCEEDED = 'FETCH_WYRE_RESERVATION_SUCCEEDED'
export const FETCH_WYRE_RESERVATION_COMPLETED = 'FETCH_WYRE_RESERVATION_COMPLETED'

export enum WyreActionKind {
  AUTHENTICATE,
  CREATE_WYRE_ACCOUNT_SHELL,
  LINK_HEXA_AND_WYRE_SUB_ACCOUNTS,
  FETCH_WYRE_RESERVATION,
}


export const fetchWyreReservation = ( data ) => {
  console.log( 'fetchWyreReservation called ', { 
    data 
  } )
  return {
    type: FETCH_WYRE_RESERVATION,
    payload: {
      data 
    },
  }
}

export const wyreReservationSucceeded = ( data ) => {
  return {
    type: WYRE_RESERVATION_SUCCEEDED, payload: data
  }
}

export const fetchWyreReservationCompleted = ( data ) => {
  return {
    type: FETCH_WYRE_RESERVATION_COMPLETED,
    payload: {
      data 
    },
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
