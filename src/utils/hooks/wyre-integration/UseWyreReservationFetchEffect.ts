import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { wyreOrderCompleted } from '../../../store/actions/WyreIntegration'
import useWyreIntegrationState from '../state-selectors/accounts/UseWyreIntegrationState'


export default function useWyreReservationFetchEffect( callbacks: {
  onSuccess?: () => void;
  onFailure?: () => void;
} ) {
  const dispatch = useDispatch()

  const {
    hasWyreReservationFetchSucceeded,
    hasWyreReservationFetchFailed,
  } = useWyreIntegrationState()

  useEffect( () => {
    if ( hasWyreReservationFetchSucceeded && callbacks.onSuccess ) {
      callbacks.onSuccess()
    } else if ( hasWyreReservationFetchFailed && callbacks.onFailure ) {
      callbacks.onFailure()
    }

    dispatch( wyreOrderCompleted() )

  }, [ hasWyreReservationFetchSucceeded, hasWyreReservationFetchFailed ] )
}
