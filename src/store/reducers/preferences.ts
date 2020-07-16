import {
    CURRENCY_CODE,
    CURRENCY_TOGGLE_VALUE,
    FCM_TOKEN_VALUE,
    SECONDARY_DEVICE_ADDRESS_VALUE
  } from '../actions/preferences';
import { UPDATE_APP_PREFERENCE } from "../constants";
import { chain } from 'icepick';

const initialState = {
    isInternetModalCome: false,
    currencyCode: null,
    currencyToggleValue: null,
    fcmTokenValue: '',
    secondaryDeviceAddressValue: '',
}

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case UPDATE_APP_PREFERENCE:
            return chain(state).setIn([payload.key], payload.value).value()
            case CURRENCY_CODE:
              return {
                ...state,
                currencyCode: payload.currencyCode,
              };
              case CURRENCY_TOGGLE_VALUE:
              return {
                ...state,
                currencyToggleValue: payload.currencyToggleValue,
              };
              case FCM_TOKEN_VALUE:
              return {
                ...state,
                fcmTokenValue: payload.fcmTokenValue,
              };
              case SECONDARY_DEVICE_ADDRESS_VALUE:
              return {
                ...state,
                secondaryDeviceAddressValue: payload.secondaryDeviceAddressValue,
              };
        default:
            return state
    }
}
