import useSendingState from './UseSendingState'
import { useMemo } from 'react'
import { RecipientDescribing } from '../../../../common/data/models/interfaces/RecipientDescribing'


export default function useSelectedRecipientsForSending(): RecipientDescribing[] {
  const sendingState = useSendingState()

  return useMemo( () => {
    return sendingState.selectedRecipients
  }, [ sendingState.selectedRecipients ] )
}
