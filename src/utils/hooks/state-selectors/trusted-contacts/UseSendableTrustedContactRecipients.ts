import { useMemo } from 'react'
import { ContactRecipientDescribing } from '../../../../common/data/models/interfaces/RecipientDescribing'
import useTrustedContactsState from './UseTrustedContactsState'


export default function useSendableTrustedContactRecipients(): ContactRecipientDescribing[] {
  const trustedContactsState = useTrustedContactsState()

  return useMemo( () => {
    const sendableTrustedContactRecipients = []
    trustedContactsState.trustedContactRecipients.forEach( ( tcRecipient )=>{
      const { hasTrustedChannelWithUser, hasTrustedAddress } = tcRecipient
      if( hasTrustedChannelWithUser|| hasTrustedAddress ) sendableTrustedContactRecipients.push( tcRecipient )
    } )

    return sendableTrustedContactRecipients
    // return sampleContactRecipients
  }, [ trustedContactsState.trustedContactRecipients ] )
}
