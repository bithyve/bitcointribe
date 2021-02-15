import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchWyreReceiveAddressCompleted } from '../../../store/actions/WyreIntegration'
import useWyreIntegrationState from '../state-selectors/accounts/UseWyreIntegrationState'

/*

Note: This is not used by any UI component at the moment

*/

export default function useWyreReceiveAddressFetchEffect( callbacks: {
  onSuccess?: () => void;
  onFailure?: () => void;
} ) {
  const dispatch = useDispatch()

  const {
    hasWyreReceiveAddressSucceeded,
    hasWyreReceiveAddressFailed,
  } = useWyreIntegrationState()

  useEffect( () => {
    if ( hasWyreReceiveAddressSucceeded && callbacks.onSuccess ) {
      callbacks.onSuccess()
    } else if ( hasWyreReceiveAddressFailed && callbacks.onFailure ) {
      callbacks.onFailure()
    }

    dispatch( fetchWyreReceiveAddressCompleted() )

  }, [ hasWyreReceiveAddressSucceeded, hasWyreReceiveAddressFailed ] )
}
