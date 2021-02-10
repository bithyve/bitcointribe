import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { wyreOrderCompleted } from '../../../store/actions/WyreIntegration'
import useWyreIntegrationState from '../state-selectors/accounts/UseWyreIntegrationState'


export default function useWyreOrderCompletionEffect( callbacks: {
  onSuccess?: () => void;
  onFailure?: () => void;
} ) {
  const dispatch = useDispatch()

  const {
    hasWyreOrderSucceeded,
    hasWyreOrderFailed,
  } = useWyreIntegrationState()

  useEffect( () => {
    if ( hasWyreOrderSucceeded && callbacks.onSuccess ) {
      callbacks.onSuccess()
    } else if ( hasWyreOrderFailed && callbacks.onFailure ) {
      callbacks.onFailure()
    }

    dispatch( wyreOrderCompleted() )

  }, [ hasWyreOrderSucceeded, hasWyreOrderFailed ] )
}
