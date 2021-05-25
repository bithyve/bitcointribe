import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import RegularAccount from '../../../bitcoin/services/accounts/RegularAccount'
import { StreamData, Streams, UnecryptedStreamData, UnecryptedStreams } from '../../../bitcoin/utilities/Interface'
import TrustedContacts from '../../../bitcoin/utilities/TrustedContacts'
import { REGULAR_ACCOUNT } from '../../../common/constants/wallet-service-types'
import { AccountsState } from '../../../store/reducers/accounts'


export default function useStreamFromPermanentChannel(
  channel: Streams | UnecryptedStreams,
  instream?: boolean
): StreamData | UnecryptedStreamData {
  const accountsState: AccountsState = useSelector( state => state.accounts )
  return useMemo( () => {
    const regularAccount: RegularAccount = accountsState[ REGULAR_ACCOUNT ].service
    const { walletId } = regularAccount.hdWallet.getWalletId()
    const usersStreamId = TrustedContacts.getStreamId( walletId )

    if( instream ){
      // return counterparty's stream(instream from user's perspective)
      Object.keys( channel ).forEach( ( streamId ) => {
        if( usersStreamId !== streamId ) return channel[ streamId ]
      } )
    } else return channel[ usersStreamId ] // return user's stream(outstream from user's perspective)
  }, [ channel ] )
}
