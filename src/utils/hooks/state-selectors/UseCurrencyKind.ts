import { useSelector } from 'react-redux';
import CurrencyKind from '../../../common/data/enums/CurrencyKind';

export default function useCurrencyKind(): CurrencyKind {
  return useSelector((state) => {
    alert(`state.preferences.currencyKind: ${state.preferences.currencyKind}`)
    return state.preferences.currencyKind;
  });
};
