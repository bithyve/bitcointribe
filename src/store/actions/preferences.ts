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