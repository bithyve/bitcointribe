import { useMemo } from 'react'
import { ContactRecipientDescribing } from '../../../../common/data/models/interfaces/RecipientDescribing'
import useTrustedContactsState from '../trusted-contacts/UseTrustedContactsState'


export default function useSendableTrustedContactRecipients(): ContactRecipientDescribing[] {
  const trustedContactsState = useTrustedContactsState()

  return useMemo( () => {
    const sendableTrustedContactRecipients = []
    trustedContactsState && trustedContactsState.trustedContactRecipients && trustedContactsState.trustedContactRecipients.forEach( ( tcRecipient )=>{
      const { isActive, lastSeenActive } = tcRecipient
      if( isActive && lastSeenActive ) sendableTrustedContactRecipients.push( tcRecipient )
    } )

    return sendableTrustedContactRecipients
  }, [ trustedContactsState && trustedContactsState.trustedContactRecipients ] )
}
