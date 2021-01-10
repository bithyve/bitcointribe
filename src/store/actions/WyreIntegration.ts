
export const FETCH_WYRE_RESERVATION = 'FETCH_WYRE_RESERVATION_WALLET'
export const WYRE_RESERVATION_SUCCEEDED = 'WYRE_RESERVATION_SUCCEEDED'

export const FETCH_WYRE_RESERVATION_FAILED = 'FETCH_WYRE_RESERVATION_FAILED'
export const FETCH_WYRE_RESERVATION_SUCCEEDED = 'FETCH_WYRE_RESERVATION_SUCCEEDED'
export const FETCH_WYRE_RESERVATION_COMPLETED = 'FETCH_WYRE_RESERVATION_COMPLETED'

export const FETCH_WYRE_TOKEN = 'FETCH_WYRE_TOKEN'
export const FETCH_WYRE_TOKEN_FAILED = 'FETCH_WYRE_TOKEN_FAILED'
export const FETCH_WYRE_TOKEN_SUCCEEDED = 'FETCH_WYRE_TOKEN_SUCCEEDED'
export const FETCH_WYRE_TOKEN_COMPLETED = 'FETCH_WYRE_TOKEN_COMPLETED'

export const LINK_WYRE_WALLET = 'LINK_WYRE_WALLET'
export const LINK_WYRE_WALLET_FAILED = 'LINK_WYRE_WALLET_FAILED'
export const LINK_WYRE_WALLET_SUCCEEDED = 'LINK_WYRE_WALLET_SUCCEEDED'
export const LINK_WYRE_WALLET_COMPLETED = 'LINK_WYRE_WALLET_COMPLETED'

export const ADD_WYRE_METADATA = 'ADD_WYRE_METADATA'
export const ADD_WYRE_METADATA_FAILED = 'ADD_WYRE_METADATA_FAILED'
export const ADD_WYRE_METADATA_SUCCEEDED = 'ADD_WYRE_METADATA_SUCCEEDED'
export const ADD_WYRE_METADATA_COMPLETED = 'ADD_WYRE_METADATA_COMPLETED'


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

export const fetchWyreToken = ( data ) => {
  return {
    type: FETCH_WYRE_TOKEN,
    payload: {
      data 
    },
  }
}

export const fetchWyreTokenCompleted = () => {
  return {
    type: FETCH_WYRE_TOKEN_COMPLETED 
  }
}

export const fetchWyreTokenFailed = data => {
  return {
    type: FETCH_WYRE_TOKEN_FAILED,
    payload: {
      data 
    },
  }
}

export const fetchWyreTokenSucceeded = ( data ) => {
  return {
    type: FETCH_WYRE_TOKEN_SUCCEEDED,
    payload: {
      wyreReservationCode: data 
    }
  }
}

export const linkWyreWallet = ( data ) => {
  return {
    type: LINK_WYRE_WALLET,
    payload: {
      data 
    },
  }
}

export const linkWyreWalletCompleted = ( data ) => {
  return {
    type: LINK_WYRE_WALLET_COMPLETED,
    payload: {
      data 
    },
  }
}

export const linkWyreWalletFailed = ( data ) => {
  return {
    type: LINK_WYRE_WALLET_FAILED,
    payload: {
      data 
    },
  }
}

export const linkWyreWalletSucceeded = ( data ) => {
  return {
    type: LINK_WYRE_WALLET_SUCCEEDED,
    payload: {
      wyreHostedUrl: data 
    },
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

export const addWyreMetadata = ( data ) => {
  return {
    type: ADD_WYRE_METADATA,
    payload: {
      data 
    },
  }
}

export const addWyreMetadataCompleted = ( data ) => {
  return {
    type: ADD_WYRE_METADATA_COMPLETED,
    payload: {
      data 
    },
  }
}

export const addWyreMetadataFailed = ( data ) => {
  return {
    type: ADD_WYRE_METADATA_FAILED,
    payload: {
      data 
    },
  }
}

export const addWyreMetadataSucceeded = ( data ) => {
  return {
    type: ADD_WYRE_METADATA_SUCCEEDED,
    payload: {
      addWyreMetadaDetails: data 
    },
  }
}
