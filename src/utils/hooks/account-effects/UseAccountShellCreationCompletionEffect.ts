import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { newAccountShellCreationCompleted } from '../../../store/actions/accounts'
import useAccountsState from '../state-selectors/accounts/UseAccountsState'


export default function useAccountShellCreationCompletionEffect( onComplete: () => void ) {
  const dispatch = useDispatch()
  const { hasNewAccountShellGenerationSucceeded } = useAccountsState()

  useEffect( () => {
    if ( hasNewAccountShellGenerationSucceeded ) {
      dispatch( newAccountShellCreationCompleted() )
      onComplete()
    }
  }, [ hasNewAccountShellGenerationSucceeded ] )
}
