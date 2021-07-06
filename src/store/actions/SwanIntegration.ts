import AccountShell from '../../common/data/models/AccountShell'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'

export const UPDATE_SWAN_STATUS = 'UPDATE_SWAN_STATUS'
export const CLEAR_SWAN_CACHE = 'CLEAR_SWAN_CACHE'
export const FETCH_SWAN_AUTHENTICATION_URL_STARTED = 'FETCH_SWAN_AUTHENTICATION_URL_STARTED'
export const FETCH_SWAN_AUTHENTICATION_URL = 'FETCH_SWAN_AUTHENTICATION_URL'
export const FETCH_SWAN_AUTHENTICATION_URL_SUCCEEDED = 'FETCH_SWAN_AUTHENTICATION_URL_SUCCEEDED'

export const REDEEM_SWAN_CODE_FOR_TOKEN_STARTED = 'REDEEM_SWAN_CODE_FOR_TOKEN_STARTED'
export const REDEEM_SWAN_CODE_FOR_TOKEN = 'REDEEM_SWAN_CODE_FOR_TOKEN'
export const REDEEM_SWAN_CODE_FOR_TOKEN_SUCCEEDED = 'REDEEM_SWAN_CODE_FOR_TOKEN_SUCCEEDED'

export const CREATE_WITHDRAWAL_WALLET_ON_SWAN_STARTED = 'CREATE_WITHDRAWAL_WALLET_ON_SWAN_STARTED'
export const CREATE_WITHDRAWAL_WALLET_ON_SWAN = 'CREATE_WITHDRAWAL_WALLET_ON_SWAN'
export const CREATE_WITHDRAWAL_WALLET_ON_SWAN_SUCCEEDED = 'CREATE_WITHDRAWAL_WALLET_ON_SWAN_SUCCEEDED'

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

export const CREATE_TEMP_SWAN_ACCOUNT_INFO = 'CREATE_TEMP_SWAN_ACCOUNT_INFO'
export const TEMP_SWAN_ACCOUNT_INFO_SAVED = 'TEMP_SWAN_ACCOUNT_INFO_SAVED'

export enum SwanActionKind {
  UPDATE_SWAN_STATUS,
  CLEAR_SWAN_CACHE,
  FETCH_SWAN_AUTHENTICATION_URL,
  FETCH_SWAN_AUTHENTICATION_URL_SUCCEEDED,
  REDEEM_SWAN_CODE_FOR_TOKEN,
  REDEEM_SWAN_CODE_FOR_TOKEN_SUCCEEDED,
  CREATE_WITHDRAWAL_WALLET_ON_SWAN,
  CREATE_WITHDRAWAL_WALLET_ON_SWAN_SUCCEEDED,
  AUTHENTICATE,
  CREATE_TEMP_SWAN_ACCOUNT_INFO,
  LINK_HEXA_AND_SWAN_SUB_ACCOUNTS,
  SYNC_SWAN_ACCOUNT_DATA
}

export const updateSwanStatus = ( data ) => {
  return {
    type: UPDATE_SWAN_STATUS,
    payload: {
      data
    }
  }
}

export const clearSwanCache = ( ) => {
  return {
    type: CLEAR_SWAN_CACHE,
  }
}

export const fetchSwanAuthenticationUrl = ( data ) =>  {
  return {
    type: FETCH_SWAN_AUTHENTICATION_URL,
    payload: {
      data
    }
  }
}

export const fetchSwanAuthenticationUrlInitiated = () => {
  return {
    type: FETCH_SWAN_AUTHENTICATION_URL_STARTED,
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

export const redeemSwanCodeForToken = ( data ) => {
  return {
    type: REDEEM_SWAN_CODE_FOR_TOKEN,
    payload : {
      data
    }
  }
}

export const redeemSwanCodeForTokenInitiated = () => {
  return {
    type: REDEEM_SWAN_CODE_FOR_TOKEN_STARTED,
  }
}

export const redeemSwanCodeForTokenSucceeded = ( data ) => {
  return {
    type: REDEEM_SWAN_CODE_FOR_TOKEN_SUCCEEDED,
    payload : {
      data
    }
  }
}

// createWithdrawalWalletOnSwan
export const createWithdrawalWalletOnSwan = ( data ) => {
  return {
    type: CREATE_WITHDRAWAL_WALLET_ON_SWAN,
    payload : {
      data
    }
  }
}

export const createWithdrawalWalletOnSwanInitiated = ( data ) => {
  return {
    type: CREATE_WITHDRAWAL_WALLET_ON_SWAN_STARTED,
    payload : {
      data
    }
  }
}

export const createWithdrawalWalletOnSwanSucceeded = ( data ) => {
  return {
    type: CREATE_WITHDRAWAL_WALLET_ON_SWAN_SUCCEEDED,
    payload : {
      data
    }
  }
}

export const createTempSwanAccountInfo = ( accountDetails: {
  name: string,
  description: string,
} ) => {
  return {
    type: CREATE_TEMP_SWAN_ACCOUNT_INFO,
    payload: {
      accountDetails
    }
  }
}

export const tempSwanAccountInfoSaved = ( data ) => {
  return {
    type: TEMP_SWAN_ACCOUNT_INFO_SAVED,
    payload: {
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
