import { useSelector } from 'react-redux';
import CurrencyKind from '../../../common/data/enums/CurrencyKind';

export default function useCurrencyKind(): CurrencyKind {
  return useSelector((state) => {
    return state.preferences.currencyKind;
  });
};
