import { useMemo } from 'react'
import { TxPriority } from '../../../bitcoin/utilities/Interface'
import useSendingState from '../state-selectors/sending/UseSendingState'
const defaultTransactionPrioritiesAvailable = [ TxPriority.LOW, TxPriority.MEDIUM, TxPriority.HIGH ]

export default function useAvailableTransactionPriorities() {
  const sendingState = useSendingState()

  return useMemo( () => {
    let availablePriorities = defaultTransactionPrioritiesAvailable

    if( sendingState.feeIntelMissing ) availablePriorities = []
    else if( sendingState.sendMaxFee ) availablePriorities = [ TxPriority.LOW ]

    return availablePriorities
  }, [ sendingState.feeIntelMissing, sendingState.sendMaxFee ] )
}
