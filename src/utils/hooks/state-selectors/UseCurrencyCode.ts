import { useSelector } from 'react-redux';

export default function useCurrencyCode(): string {
  return useSelector((state) => {
    return state.preferences.currencyCode;
  });
};
