import { TrustedContact, UnecryptedStreamData, UnecryptedStreams } from '../../../bitcoin/utilities/Interface'
import TrustedContactsOperations from '../../../bitcoin/utilities/TrustedContactsOperations'

export default function useStreamFromContact(
  contact: TrustedContact,
  walletId: string,
  instream?: boolean
): UnecryptedStreamData {
  const usersStreamId = TrustedContactsOperations.getStreamId( walletId )
  const channel: UnecryptedStreams = contact.unencryptedPermanentChannel

  if( channel )
    if( instream ){
    // return counterparty's stream(instream from user's perspective)
      for( const streamId of Object.keys( channel ) ){
        if( usersStreamId !== streamId ) return channel[ streamId ]
      }
    } else return channel[ usersStreamId ] // return user's stream(outstream from user's perspective)
}
