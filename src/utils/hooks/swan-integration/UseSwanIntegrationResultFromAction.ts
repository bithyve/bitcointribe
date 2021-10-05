import { SwanActionKind } from '../../../store/actions/SwanIntegration'
import useSwanIntegrationState from '../state-selectors/accounts/UseSwanIntegrationState'
import { useMemo } from 'react'

export default function useSwanIntegrationResultFromAction( actionKind: SwanActionKind ): string {
  const swanIntegrationState = useSwanIntegrationState()

  return useMemo( () => {
    switch ( actionKind ) {
        case SwanActionKind.AUTHENTICATE:
          if ( swanIntegrationState.isFetchingSwanToken ) {
            return 'In Progress'
          } else if ( swanIntegrationState.fetchSwanTokenFailed ) {
            return `Failed. Message: ${swanIntegrationState.fetchSwanTokenFailedMessage}`
          } else {
            return `Succeed. Token Details: ${swanIntegrationState.swanTokenDetails}`
          }

        case SwanActionKind.LINK_HEXA_AND_SWAN_SUB_ACCOUNTS:
          if ( swanIntegrationState.isLinkingSwanWallet ) {
            return 'In Progress'
          } else if ( swanIntegrationState.linkSwanWalletFailed ) {
            return `Failed. Message: ${swanIntegrationState.linkSwanWalletFailedMessage}`
          } else {
            return `Succeed. Wallet Details: ${swanIntegrationState.swanWalletDetails}`
          }

        case SwanActionKind.FETCH_SWAN_AUTHENTICATION_URL:
          if ( swanIntegrationState.isSwanAuthenticationInProgress ) {
            return 'In Progress'
          } else if ( !swanIntegrationState.hasFetchSwanAuthenticationUrlSucceeded ) {
            return `Failed. Message: ${swanIntegrationState.swanAuthenticationUrl}`
          } else {
            return `Succeed. Wallet Details: ${swanIntegrationState.swanAuthenticationUrl}`
          }
    }
  }, [ actionKind, swanIntegrationState ] )
}
