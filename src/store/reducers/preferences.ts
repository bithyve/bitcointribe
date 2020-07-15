import {
    CURRENCY_CODE,
    CURRENCY_TOGGLE_VALUE
  } from '../actions/preferences';
import { UPDATE_APP_PREFERENCE } from "../constants";
import { chain } from 'icepick';

const initialState = {
    isInternetModalCome: false,
    currencyCode: null,
    currencyToggleValue: null,
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
        default:
            return state
    }
}
