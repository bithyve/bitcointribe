import { createAction } from 'redux-actions';
import { UPDATE_APP_PREFERENCE } from '../constants'

export const CURRENCY_CODE = 'CURRENCY_CODE';
export const CURRENCY_TOGGLE_VALUE = 'CURRENCY_TOGGLE_VALUE';



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


const updatePereferenceRequest = createAction(UPDATE_APP_PREFERENCE);
export const updatePreference = (payload) => dispatch => dispatch(updatePereferenceRequest(payload))
