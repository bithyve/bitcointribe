import { useMemo } from 'react'
import { AddressRecipientDescribing } from '../../../../common/data/models/interfaces/RecipientDescribing'
import useSelectedRecipientsForSending from './UseSelectedRecipientsForSending'


export default function useDonationIdFromSelectedRecipients(): string {
  const selectedRecipients = useSelectedRecipientsForSending()
  return useMemo( () => {
    let donationId = ''
    selectedRecipients.forEach( ( recipient: AddressRecipientDescribing ) => {
      if( recipient.donationID )
        donationId = recipient.donationID
    } )
    return donationId  },
  [ selectedRecipients ] )
}
