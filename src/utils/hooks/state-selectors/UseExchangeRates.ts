import { useSelector } from 'react-redux';

const useExchangeRates = () => useSelector(state => state.accounts.exchangeRates);

export default useExchangeRates;
