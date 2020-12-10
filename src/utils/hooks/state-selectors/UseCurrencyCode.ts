import { useSelector } from 'react-redux';

export default function useCurrencyCode(defaultCode: string = 'USD'): string {
  return useSelector((state) => {
    return state.preferences.currencyCode || defaultCode;
  });
};
