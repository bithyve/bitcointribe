import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { rampOrderCompleted } from '../../../store/actions/RampIntegration'
import useRampIntegrationState from '../state-selectors/accounts/UseRampIntegrationState'


export default function useRampOrderCompletionEffect( callbacks: {
  onSuccess?: () => void;
  onFailure?: () => void;
} ) {
  const dispatch = useDispatch()

  const {
    hasRampOrderSucceeded,
    hasRampOrderFailed,
  } = useRampIntegrationState()

  useEffect( () => {
    if ( hasRampOrderSucceeded && callbacks.onSuccess ) {
      callbacks.onSuccess()
    } else if ( hasRampOrderFailed && callbacks.onFailure ) {
      callbacks.onFailure()
    }

    dispatch( rampOrderCompleted() )

  }, [ hasRampOrderSucceeded, hasRampOrderFailed ] )
}
