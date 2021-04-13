import { useEffect } from 'react'
import useSendingState from '../hooks/state-selectors/sending/UseSendingState'


export default function useAccountSendST1CompletionEffect( callbacks: {
  onSuccess?: () => void;
  onFailure?: ( errorMessage: string | null ) => void;
} ) {
  const {
    sendST1: {
      isSuccessful,
      hasFailed,
      failedErrorMessage,
    },
  } = useSendingState()

  useEffect( () => {
    if ( isSuccessful && callbacks.onSuccess ) {
      callbacks.onSuccess()
    } else if ( hasFailed && callbacks.onFailure ) {
      callbacks.onFailure( failedErrorMessage )
    }
  }, [ hasFailed, isSuccessful ] )
}
