import { useMemo } from 'react'
import { ContactRecipientDescribing } from '../../../../common/data/models/interfaces/RecipientDescribing'
import useTrustedContactsState from '../trusted-contacts/UseTrustedContactsState'


export default function useSendableTrustedContactRecipients(): ContactRecipientDescribing[] {
  const trustedContactsState = useTrustedContactsState()

  return useMemo( () => {
    const sendableTrustedContactRecipients = []
    trustedContactsState && trustedContactsState.trustedContactRecipients && trustedContactsState.trustedContactRecipients.forEach( ( tcRecipient )=>{
      const { paymentAddresses } = tcRecipient
      if( paymentAddresses ) sendableTrustedContactRecipients.push( tcRecipient )
    } )

    return sendableTrustedContactRecipients
    // return sampleContactRecipients
  }, [ trustedContactsState && trustedContactsState.trustedContactRecipients ] )
}
