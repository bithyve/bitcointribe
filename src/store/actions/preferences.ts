import { createAction } from 'redux-actions';
import { UPDATE_APP_PREFERENCE } from '../constants'

export const CURRENCY_CODE = 'CURRENCY_CODE';
export const CURRENCY_TOGGLE_VALUE = 'CURRENCY_TOGGLE_VALUE';
export const FCM_TOKEN_VALUE = 'FCM_TOKEN_VALUE';
export const SECONDARY_DEVICE_ADDRESS_VALUE = 'SECONDARY_DEVICE_ADDRESS_VALUE';

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

const updatePereferenceRequest = createAction(UPDATE_APP_PREFERENCE);
export const updatePreference = (payload) => dispatch => dispatch(updatePereferenceRequest(payload))
