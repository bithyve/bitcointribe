import { WyreActionKind } from '../../../store/actions/WyreIntegration'
import useWyreIntegrationState from '../state-selectors/accounts/UseWyreIntegrationState'
import { useMemo } from 'react'

export default function useWyreIntegrationResultFromAction( actionKind: WyreActionKind ): string {
  const wyreIntegrationState = useWyreIntegrationState()
  return useMemo( () => {
    switch ( actionKind ) {
        case WyreActionKind.AUTHENTICATE:
          if ( wyreIntegrationState.isFetchingWyreToken ) {
            return 'In Progress'
          } else if ( wyreIntegrationState.fetchWyreTokenFailed ) {
            return `Failed. Message: ${wyreIntegrationState.fetchWyreTokenFailedMessage}`
          } else {
            return `Succeed. Token Details: ${wyreIntegrationState.wyreReservationCode}`
          }

        case WyreActionKind.CREATE_WYRE_ACCOUNT_SHELL:
          if ( wyreIntegrationState.isAddingWyreMetadata ) {
            return 'In Progress'
          } else if ( wyreIntegrationState.addWyreMetadataFailed ) {
            return `Failed. Message: ${wyreIntegrationState.addWyreMetadataFailedMessage}`
          } else {
            return `Succeed. Metadata Details: ${wyreIntegrationState.wyreReservationSucceeded}`
          }

        case WyreActionKind.LINK_HEXA_AND_WYRE_SUB_ACCOUNTS:
          if ( wyreIntegrationState.isLinkingWyreWallet ) {
            return 'In Progress'
          } else if ( wyreIntegrationState.linkWyreWalletFailed ) {
            return `Failed. Message: ${wyreIntegrationState.linkWyreWalletFailedMessage}`
          } else {
            return `Succeed. Wallet Details: ${wyreIntegrationState.wyreHostedUrl}`
          }

        case WyreActionKind.FETCH_WYRE_RESERVATION:
          if ( wyreIntegrationState.isProcessingWyreOrder ) {
            return 'In Progress'
          } else if ( wyreIntegrationState.fetchWyreReservationFailed ) {
            return `Failed. Message: ${wyreIntegrationState.fetchWyreReservationFailedMessage}`
          } else {
            return `Succeed. Wallet Details: ${wyreIntegrationState.wyreHostedUrl}`
          }
    }
  }, [ actionKind, wyreIntegrationState ] )
}
