import useSendingState from './UseSendingState'
import { useMemo } from 'react'
import { RecipientDescribing } from '../../../../common/data/models/interfaces/RecipientDescribing'
import { Satoshis } from '../../../../common/data/typealiases/UnitAliases'


export default function useAmountBeingSentToRecipient(
  recipient: RecipientDescribing
): Satoshis {
  return useMemo( () => {
    return recipient.amount ?? 0
  }, [ recipient.amount ] )
}
