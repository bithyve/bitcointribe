import { useSelector } from 'react-redux'
import { RampIntegrationState } from '../../../../store/reducers/RampIntegration'

const useRampIntegrationState: () => RampIntegrationState = () => {
  return useSelector( state => state.rampIntegration )
}

export default useRampIntegrationState
