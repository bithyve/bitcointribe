import { useSelector } from 'react-redux';

const useAccountsState = () => useSelector(state => state.accounts);

export default useAccountsState;
