import { useMemo } from 'react'
import TransactionPriority from '../../../common/data/enums/TransactionPriority'
import useSendingState from '../state-selectors/sending/UseSendingState'
const defaultTransactionPrioritiesAvailable = [ TransactionPriority.LOW, TransactionPriority.MEDIUM, TransactionPriority.HIGH ]

export default function useAvailableTransactionPriorities() {
  const sendingState = useSendingState()

  return useMemo( () => {
    let availablePriorities = defaultTransactionPrioritiesAvailable

    if( sendingState.feeIntelMissing ) availablePriorities = []
    else if( sendingState.sendMaxFee ) availablePriorities = [ TransactionPriority.LOW ]

    return availablePriorities
  }, [ sendingState.feeIntelMissing, sendingState.sendMaxFee ] )
}
