import { useSelector } from 'react-redux';
import { SwanIntegrationState } from '../../../../store/reducers/SwanIntegration';

const useSwanIntegrationState: () => SwanIntegrationState = () => {
  return useSelector(state => state.swanIntegration);
};

export default useSwanIntegrationState;
