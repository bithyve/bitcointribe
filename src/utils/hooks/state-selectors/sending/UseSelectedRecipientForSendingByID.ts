import useSendingState from './UseSendingState'
import { useMemo } from 'react'
import { RecipientDescribing } from '../../../../common/data/models/interfaces/RecipientDescribing'


export default function useSelectedRecipientForSendingByID( id: string ): RecipientDescribing {
  const sendingState = useSendingState()

  return useMemo( () => {
    return sendingState.selectedRecipients.find( recipient => recipient.id == id )
  }, [ sendingState.selectedRecipients ] )
}
