import { useEffect } from 'react'
import useSendingState from '../hooks/state-selectors/sending/UseSendingState'
import useSourceAccountShellForSending from '../hooks/state-selectors/sending/UseSourceAccountShellForSending'

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
  const sourceAccountShell = useSourceAccountShellForSending()

  useEffect( () => {
    if ( isSuccessful && callbacks.onSuccess ) {
      callbacks.onSuccess()
    } else if ( hasFailed && callbacks.onFailure ) {
      callbacks.onFailure( failedErrorMessage )
    }
  }, [ hasFailed, isSuccessful, sourceAccountShell ] )
}
