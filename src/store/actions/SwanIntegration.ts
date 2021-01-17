export const FETCH_SWAN_AUTHENTICATION_URL = 'FETCH_SWAN_AUTHENTICATION_URL'
export const FETCH_SWAN_AUTHENTICATION_URL_SUCCEEDED = 'FETCH_SWAN_AUTHENTICATION_URL_SUCCEEDED'

export const LINK_SWAN_WALLET = 'LINK_SWAN_WALLET'
export const LINK_SWAN_WALLET_FAILED = 'LINK_SWAN_WALLET_FAILED'
export const LINK_SWAN_WALLET_SUCCEEDED = 'LINK_SWAN_WALLET_SUCCEEDED'
export const LINK_SWAN_WALLET_COMPLETED = 'LINK_SWAN_WALLET_COMPLETED'

export const SYNC_SWAN_WALLET = 'SYNC_SWAN_WALLET_WALLET'
export const SYNC_SWAN_WALLET_FAILED = 'SYNC_SWAN_WALLET_FAILED'
export const SYNC_SWAN_WALLET_SUCCEEDED = 'SYNC_SWAN_WALLET_SUCCEEDED'
export const SYNC_SWAN_WALLET_COMPLETED = 'SYNC_SWAN_WALLET_COMPLETED'

export const ADD_SWAN_METADATA = 'ADD_SWAN_METADATA'
export const ADD_SWAN_METADATA_FAILED = 'ADD_SWAN_METADATA_FAILED'
export const ADD_SWAN_METADATA_SUCCEEDED = 'ADD_SWAN_METADATA_SUCCEEDED'
export const ADD_SWAN_METADATA_COMPLETED = 'ADD_SWAN_METADATA_COMPLETED'


export enum SwanActionKind {
  FETCH_SWAN_AUTHENTICATION_URL,
  FETCH_SWAN_AUTHENTICATION_URL_SUCCEEDED,
  AUTHENTICATE,
  CREATE_SWAN_ACCOUNT_SHELL,
  LINK_HEXA_AND_SWAN_SUB_ACCOUNTS,
  SYNC_SWAN_ACCOUNT_DATA,
}

export const fetchSwanAuthenticationUrl = ( data ) =>  {
  return {
    type: FETCH_SWAN_AUTHENTICATION_URL,
    payload: {
      data
    }
  }
}

export const fetchSwanAuthenticationUrlSucceeded = ( data ) => {
  return {
    type: FETCH_SWAN_AUTHENTICATION_URL_SUCCEEDED,
    payload : {
      data
    }
  }
}
export const linkSwanWallet = ( data ) => {
  return {
    type: LINK_SWAN_WALLET,
    payload: {
      data
    },
  }
}

export const linkSwanWalletCompleted = ( data ) => {
  return {
    type: LINK_SWAN_WALLET_COMPLETED,
    payload: {
      data
    },
  }
}

export const linkSwanWalletFailed = ( data ) => {
  return {
    type: LINK_SWAN_WALLET_FAILED,
    payload: {
      data
    },
  }
}

export const linkSwanWalletSucceeded = ( data ) => {
  return {
    type: LINK_SWAN_WALLET_SUCCEEDED,
    payload: {
      swanWalletDetails: data
    },
  }
}

export const syncSwanWallet = ( data ) => {
  return {
    type: SYNC_SWAN_WALLET,
    payload: {
      data
    },
  }
}

export const syncSwanWalletCompleted = ( data ) => {
  return {
    type: SYNC_SWAN_WALLET_COMPLETED,
    payload: {
      data
    },
  }
}

export const syncSwanWalletFailed = ( data ) => {
  return {
    type: SYNC_SWAN_WALLET_FAILED,
    payload: {
      data
    },
  }
}

export const syncSwanWalletSucceeded = ( data ) => {
  return {
    type: SYNC_SWAN_WALLET_SUCCEEDED,
    payload: {
      syncSwanWalletDetails: data
    },
  }
}

export const addSwanMetadata = ( data ) => {
  return {
    type: ADD_SWAN_METADATA,
    payload: {
      data
    },
  }
}

export const addSwanMetadataCompleted = ( data ) => {
  return {
    type: ADD_SWAN_METADATA_COMPLETED,
    payload: {
      data
    },
  }
}

export const addSwanMetadataFailed = ( data ) => {
  return {
    type: ADD_SWAN_METADATA_FAILED,
    payload: {
      data
    },
  }
}

export const addSwanMetadataSucceeded = ( data ) => {
  return {
    type: ADD_SWAN_METADATA_SUCCEEDED,
    payload: {
      addSwanMetadaDetails: data
    },
  }
}
