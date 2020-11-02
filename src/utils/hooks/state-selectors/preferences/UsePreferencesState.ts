import { useSelector } from 'react-redux';

const usePreferencesState = () => useSelector(state => state.preferences);

export default usePreferencesState;
