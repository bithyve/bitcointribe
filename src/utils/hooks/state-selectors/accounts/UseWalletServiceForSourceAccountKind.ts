import useAccountsState from './UseAccountsState'
import { useMemo } from 'react'
import { TEST_ACCOUNT, REGULAR_ACCOUNT, SECURE_ACCOUNT } from '../../../../common/constants/wallet-service-types'
import SourceAccountKind from '../../../../common/data/enums/SourceAccountKind'


export default function useWalletServiceForSourceAccountKind( sourceAccountKind: SourceAccountKind ) {
  const accountsState = useAccountsState()

  return useMemo( () => {
    switch ( sourceAccountKind ) {
        case SourceAccountKind.TEST_ACCOUNT:
          return accountsState[ TEST_ACCOUNT ].service
        case SourceAccountKind.REGULAR_ACCOUNT:
          return accountsState[ REGULAR_ACCOUNT ].service
        case SourceAccountKind.SECURE_ACCOUNT:
          return accountsState[ SECURE_ACCOUNT ].service
        default:
          return null
    }
  }, [ accountsState ] )
}
