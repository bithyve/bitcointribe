import { createAction } from 'redux-actions';
import { UPDATE_APP_PREFERENCE } from '../constants'

export const CURRENCY_CODE = 'CURRENCY_CODE';
export const CURRENCY_TOGGLE_VALUE = 'CURRENCY_TOGGLE_VALUE';
export const FCM_TOKEN_VALUE = 'FCM_TOKEN_VALUE';
export const SECONDARY_DEVICE_ADDRESS_VALUE = 'SECONDARY_DEVICE_ADDRESS_VALUE';
export const RELEASE_CASES_VALUE = 'RELEASE_CASES_VALUE';
export const TEST_ACCOUNT_HELPER_DONE = 'TEST_ACCOUNT_HELPER_DONE';
export const TRANSACTION_HELPER_DONE = 'TRANSACTION_HELPER_DONE';
export const RECEIVE_HELPER_DONE = 'RECEIVE_HELPER_DONE';
export const SEND_HELPER_DONE = 'SEND_HELPER_DONE';
export const SAVING_WARNING = 'SAVING_WARNING';
export const TWO_FA_SETUP = 'TWO_FA_SETUP';



export const setCurrencyCode = (data) => {
  return {
    type: CURRENCY_CODE,
    payload: { currencyCode: data },
  };
};
export const setCurrencyToggleValue = (data) => {
  return {
    type: CURRENCY_TOGGLE_VALUE,
    payload: { currencyToggleValue: data },
  };
};

export const setFCMToken = (data) => {
  return {
    type: FCM_TOKEN_VALUE,
    payload: { fcmTokenValue: data },
  };
};

export const setSecondaryDeviceAddress = (data) => {
  return {
    type: SECONDARY_DEVICE_ADDRESS_VALUE,
    payload: { secondaryDeviceAddressValue: data },
  };
};

export const setReleaseCases = (data) => {
  return {
    type: RELEASE_CASES_VALUE,
    payload: { releaseCasesValue: data },
  };
};

export const setTestAccountHelperDone = (data) => {
  return {
    type: TEST_ACCOUNT_HELPER_DONE,
    payload: { isTestHelperDoneValue: data },
  };
};

export const setTransactionHelper = (data) => {
  return {
    type: TRANSACTION_HELPER_DONE,
    payload: { isTransactionHelperDoneValue: data },
  };
};

export const setReceiveHelper = (data) => {
  return {
    type: RECEIVE_HELPER_DONE,
    payload: { isReceiveHelperDoneValue: data },
  };
};

export const setSendHelper = (data) => {
  return {
    type: SEND_HELPER_DONE,
    payload: { isSendHelperDoneValue: data },
  };
};

export const setSavingWarning = (data) => {
  return {
    type: SAVING_WARNING,
    payload: { savingWarning: data },
  };
};

export const setTwoFASetup = (data) => {
  return {
    type: TWO_FA_SETUP,
    payload: { isTwoFASetupDone: data },
  };
};

const updatePereferenceRequest = createAction(UPDATE_APP_PREFERENCE);
export const updatePreference = (payload) => dispatch => dispatch(updatePereferenceRequest(payload))
