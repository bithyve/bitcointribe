import { createAction } from 'redux-actions'
import { UPDATE_APP_PREFERENCE } from '../constants'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import { Action } from 'redux'

export const CARD_DATA = 'CARD_DATA'
export const CURRENCY_CODE = 'CURRENCY_CODE'
export const CURRENCY_KIND_SET = 'CURRENCY_KIND_SET'
export const GIFT_CURRENCY_KIND_SET = 'GIFT_CURRENCY_KIND_SET'
export const FCM_TOKEN_VALUE = 'FCM_TOKEN_VALUE'
export const SECONDARY_DEVICE_ADDRESS_VALUE = 'SECONDARY_DEVICE_ADDRESS_VALUE'
export const RELEASE_CASES_VALUE = 'RELEASE_CASES_VALUE'
export const TEST_ACCOUNT_HELPER_DONE = 'TEST_ACCOUNT_HELPER_DONE'
export const TRANSACTION_HELPER_DONE = 'TRANSACTION_HELPER_DONE'
export const RECEIVE_HELPER_DONE = 'RECEIVE_HELPER_DONE'
export const INITIAL_KNOW_MORE_SEND_SHEET_SHOWN = 'INITIAL_KNOW_MORE_SEND_SHEET_SHOWN'
export const SAVING_WARNING = 'SAVING_WARNING'
export const INIT_ASYNC_MIGRATION_REQUEST = 'INIT_ASYNC_MIGRATION_REQUEST'
export const INIT_ASYNC_MIGRATION_SUCCESS = 'INIT_ASYNC_MIGRATION_SUCCESS'
export const INIT_ASYNC_MIGRATION_FAILED = 'INIT_ASYNC_MIGRATION_FAILED'
export const UPDATE_APPLICATION_STATUS = 'UPDATE_APPLICATION_STATUS'
export const IS_PERMISSION_SET = 'IS_PERMISSION_SET'
export const SET_WALLET_ID = 'SET_WALLET_ID'
export const UPDATE_LAST_SEEN = 'UPDATE_LAST_SEEN'

export const setCurrencyCode = ( data ) => {
  return {
    type: CURRENCY_CODE,
    payload: {
      currencyCode: data
    },
  }
}

export interface CurrencyKindSetAction extends Action {
  type: typeof CURRENCY_KIND_SET;
  payload: CurrencyKind,
}

export const currencyKindSet = ( kind: CurrencyKind ) => {
  return {
    type: CURRENCY_KIND_SET,
    payload: kind,
  }
}

export const giftCurrencyKindSet = ( kind: CurrencyKind ) => {
  return {
    type: GIFT_CURRENCY_KIND_SET,
    payload: kind,
  }
}

export const setFCMToken = ( data ) => {
  return {
    type: FCM_TOKEN_VALUE,
    payload: {
      fcmTokenValue: data
    },
  }
}

export const setSecondaryDeviceAddress = ( data ) => {
  return {
    type: SECONDARY_DEVICE_ADDRESS_VALUE,
    payload: {
      secondaryDeviceAddressValue: data
    },
  }
}

export const setReleaseCases = ( data ) => {
  return {
    type: RELEASE_CASES_VALUE,
    payload: {
      releaseCasesValue: data
    },
  }
}

export const setTestAccountHelperDone = ( data ) => {
  return {
    type: TEST_ACCOUNT_HELPER_DONE,
    payload: {
      isTestHelperDoneValue: data
    },
  }
}

export const setTransactionHelper = ( data ) => {
  return {
    type: TRANSACTION_HELPER_DONE,
    payload: {
      isTransactionHelperDoneValue: data
    },
  }
}

export const setReceiveHelper = ( data ) => {
  return {
    type: RECEIVE_HELPER_DONE,
    payload: {
      isReceiveHelperDoneValue: data
    },
  }
}


export const initialKnowMoreSendSheetShown = () => {
  return {
    type: INITIAL_KNOW_MORE_SEND_SHEET_SHOWN,
  }
}


export const setSavingWarning = ( data ) => {
  return {
    type: SAVING_WARNING,
    payload: {
      savingWarning: data
    },
  }
}

const updatePereferenceRequest = createAction( UPDATE_APP_PREFERENCE )
export const updatePreference = ( payload ) => ( dispatch ) =>
  dispatch( updatePereferenceRequest( payload ) )

export const updateApplicationStatus = ( data ) => {
  return {
    type: UPDATE_APPLICATION_STATUS,
    payload: {
      status: data
    },
  }
}

export const updateLastSeen = ( data ) => {
  return {
    type: UPDATE_LAST_SEEN,
    payload: {
      lastSeen: data
    },
  }
}

export const setCardData = ( data ) => {
  return {
    type: CARD_DATA,
    payload: {
      cardData: data
    },
  }
}

export const setIsPermissionGiven = ( data ) => {
  return {
    type: IS_PERMISSION_SET,
    payload: {
      isPermissionSet: data
    }
  }
}

export const setWalletId = ( data ) => {
  return {
    type: SET_WALLET_ID,
    payload: {
      walletId: data
    }
  }
}
