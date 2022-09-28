import { useEffect } from 'react'
import useSendingState from '../hooks/state-selectors/sending/UseSendingState'
import useSourceAccountShellForSending from '../hooks/state-selectors/sending/UseSourceAccountShellForSending'
import useTotalSpendingAmount from '../hooks/sending-utils/UseTotalSpendingAmount'

export default function useAccountSendST2CompletionEffect( callbacks: {
  onSuccess?: ( txid: string | null, amt: number | null ) => void;
  onFailure?: ( errorMessage: string | null ) => void;
} ) {
  const {
    sendST2: {
      txid,
      isSuccessful,
      hasFailed,
      failedErrorMessage,
    },
  } = useSendingState()

  const amt = useTotalSpendingAmount()
  const sourceAccountShell = useSourceAccountShellForSending()

  useEffect( () => {
    if ( isSuccessful && callbacks.onSuccess ) {
      callbacks.onSuccess( txid, amt )
    } else if ( hasFailed && callbacks.onFailure ) {
      callbacks.onFailure( failedErrorMessage )
    }
  }, [ hasFailed, isSuccessful, sourceAccountShell ] )
}
