import { useMemo } from 'react'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import useSendingState from '../state-selectors/sending/UseSendingState'


export default function useTotalSpendingAmount(): Satoshis {
  const sendingState = useSendingState()

  return useMemo( () => {
    return sendingState
      .selectedRecipients
      .reduce( ( accumulated, recipient ) => {
        return accumulated + ( recipient.amount ? recipient.amount : 0 )
      }, 0 )
  }, [ sendingState.selectedRecipients ] )
}
