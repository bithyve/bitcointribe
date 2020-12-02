import SubAccountKind from '../../../../common/data/enums/SubAccountKind'
import useAccountsState from './UseAccountsState'
import { useMemo } from 'react'
import { TEST_ACCOUNT, REGULAR_ACCOUNT, SECURE_ACCOUNT } from '../../../../common/constants/wallet-service-types'


export default function useWalletServiceForSubAccountKind( subAccountKind: SubAccountKind ) {
  const accountsState = useAccountsState()

  return useMemo( () => {
    switch ( subAccountKind ) {
        case SubAccountKind.TEST_ACCOUNT:
          return accountsState[ TEST_ACCOUNT ].service
        case SubAccountKind.REGULAR_ACCOUNT:
          return accountsState[ REGULAR_ACCOUNT ].service
        case SubAccountKind.SECURE_ACCOUNT:
          return accountsState[ SECURE_ACCOUNT ].service
        default:
        // TODO: I'm thinking `accountsState` should just have a `walletServices` property
        // that's an object with intuitively named keys that map to a
        // specific service instance.
          return null
    }
  }, [ accountsState ] )
}
