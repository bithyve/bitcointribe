import { useSelector } from 'react-redux'

function useInitialServiceInstancesAvailabilityState( ): Boolean {
  const initServices = useSelector( ( state ) => state.storage.initialServiceInstances )
  if( initServices && Object.keys( initServices ).length ) return true
  else false
}

export default useInitialServiceInstancesAvailabilityState
