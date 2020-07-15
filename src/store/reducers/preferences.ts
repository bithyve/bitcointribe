import {
    CURRENCY_CODE,
    CURRENCY_TOGGLE_VALUE
  } from '../actions/preferences';
  
  const INITIAL_STATE = {
    currencyCode: null,
    currencyToggleValue: null,
  };
  
  const preferences = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case CURRENCY_CODE:
        return {
          ...state,
          currencyCode: action.payload.currencyCode,
        };
        case CURRENCY_TOGGLE_VALUE:
        return {
          ...state,
          currencyToggleValue: action.payload.currencyToggleValue,
        };
      default:
        return state;
    }
  };
  export default preferences;
  