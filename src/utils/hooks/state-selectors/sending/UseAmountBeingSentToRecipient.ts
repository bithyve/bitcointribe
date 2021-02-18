import useSendingState from './UseSendingState'
import { useMemo } from 'react'
import { RecipientDescribing } from '../../../../common/data/models/interfaces/RecipientDescribing'
import { Satoshis } from '../../../../common/data/typealiases/UnitAliases'


export default function useAmountBeingSentToRecipient(
  recipient: RecipientDescribing
): Satoshis {
  const sendingState = useSendingState()

  return useMemo( () => {
    return sendingState.amountDesignations[ recipient.id ]
  }, [ sendingState.amountDesignations ] )
}
