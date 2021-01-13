import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { wyreOrderCompleted } from '../../../store/actions/WyreIntegration'
import useWyreIntegrationState from '../state-selectors/accounts/UseWyreIntegrationState'


export default function useWyreOrderCompletionEffect( onComplete: () => void ) {
  const dispatch = useDispatch()
  const { hasWyreOrderSucceeded } = useWyreIntegrationState()

  useEffect( () => {
    if ( hasWyreOrderSucceeded ) {
      dispatch( wyreOrderCompleted() )
      onComplete()
    }
  }, [ hasWyreOrderSucceeded ] )
}
