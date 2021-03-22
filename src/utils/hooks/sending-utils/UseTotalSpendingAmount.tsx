import { useMemo } from 'react'
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import useSendingState from '../state-selectors/sending/UseSendingState'


export default function useTotalSpendingAmount( currentRecipient?: RecipientDescribing ): Satoshis {
  const sendingState = useSendingState()

  return useMemo( () => {
    return sendingState
      .selectedRecipients
      .reduce( ( accumulated, recipient ) => {
        if( currentRecipient && currentRecipient.id === recipient.id ) return accumulated + 0
        else return accumulated + ( recipient.amount ? recipient.amount : 0 )
      }, 0 )
  }, [ sendingState.selectedRecipients ] )
}
