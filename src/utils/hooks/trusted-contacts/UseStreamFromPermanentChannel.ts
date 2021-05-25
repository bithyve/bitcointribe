import { StreamData, Streams, UnecryptedStreamData, UnecryptedStreams } from '../../../bitcoin/utilities/Interface'
import TrustedContacts from '../../../bitcoin/utilities/TrustedContacts'

export default function useStreamFromPermanentChannel(
  walletId: string,
  channel: Streams | UnecryptedStreams,
  instream?: boolean
): StreamData | UnecryptedStreamData {
  const usersStreamId = TrustedContacts.getStreamId( walletId )

  if( instream ){
    // return counterparty's stream(instream from user's perspective)
    Object.keys( channel ).forEach( ( streamId ) => {
      if( usersStreamId !== streamId ) return channel[ streamId ]
    } )
  } else return channel[ usersStreamId ] // return user's stream(outstream from user's perspective)
}
