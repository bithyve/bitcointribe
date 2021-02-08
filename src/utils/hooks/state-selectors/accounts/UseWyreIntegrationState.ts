import { useSelector } from 'react-redux'
import { WyreIntegrationState } from '../../../../store/reducers/WyreIntegration'

const useWyreIntegrationState: () => WyreIntegrationState = () => {
  return useSelector( state => state.wyreIntegration )
}

export default useWyreIntegrationState
