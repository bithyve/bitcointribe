import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchRampReservationCompleted } from '../../../store/actions/RampIntegration'
import useRampIntegrationState from '../state-selectors/accounts/UseRampIntegrationState'


export default function useRampReservationFetchEffect( callbacks: {
  onSuccess?: () => void;
  onFailure?: () => void;
} ) {
  const dispatch = useDispatch()

  const {
    hasRampReservationFetchSucceeded,
    hasRampReservationFetchFailed,
  } = useRampIntegrationState()

  useEffect( () => {
    if ( hasRampReservationFetchSucceeded && callbacks.onSuccess ) {
      callbacks.onSuccess()
    } else if ( hasRampReservationFetchFailed && callbacks.onFailure ) {
      callbacks.onFailure()
    }

    dispatch( fetchRampReservationCompleted() )

  }, [ hasRampReservationFetchSucceeded, hasRampReservationFetchFailed ] )
}
