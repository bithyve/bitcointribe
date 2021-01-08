import { WyreActionKind } from '../../../store/actions/WyreIntegration'
import useWyreIntegrationState from '../state-selectors/accounts/UseWyreIntegrationState'
import { useMemo } from 'react'

export default function useWyreIntegrationResultFromAction( actionKind: WyreActionKind ): string {
  const wyreIntegrationState = useWyreIntegrationState()
  console.log( { 
    wyreIntegrationState 
  } )
  return useMemo( () => {
    switch ( actionKind ) {
        case WyreActionKind.AUTHENTICATE:
          if ( wyreIntegrationState.isFetchingWyreToken ) {
            return 'In Progress'
          } else if ( wyreIntegrationState.fetchWyreTokenFailed ) {
            return `Failed. Message: ${wyreIntegrationState.fetchWyreTokenFailedMessage}`
          } else {
            return `Succeed. Token Details: ${wyreIntegrationState.wyreTokenDetails}`
          }

        case WyreActionKind.CREATE_WYRE_ACCOUNT_SHELL:
          if ( wyreIntegrationState.isAddingWyreMetadata ) {
            return 'In Progress'
          } else if ( wyreIntegrationState.addWyreMetadataFailed ) {
            return `Failed. Message: ${wyreIntegrationState.addWyreMetadataFailedMessage}`
          } else {
            return `Succeed. Metadata Details: ${wyreIntegrationState.wyreMetadataDetails}`
          }

        case WyreActionKind.LINK_HEXA_AND_WYRE_SUB_ACCOUNTS:
          if ( wyreIntegrationState.isLinkingWyreWallet ) {
            return 'In Progress'
          } else if ( wyreIntegrationState.linkWyreWalletFailed ) {
            return `Failed. Message: ${wyreIntegrationState.linkWyreWalletFailedMessage}`
          } else {
            return `Succeed. Wallet Details: ${wyreIntegrationState.wyreWalletDetails}`
          }

        case WyreActionKind.SYNC_WYRE_ACCOUNT_DATA:
          if ( wyreIntegrationState.isSyncingWyreWallet ) {
            return 'In Progress'
          } else if ( wyreIntegrationState.syncWyreWalletFailed ) {
            return `Failed. Message: ${wyreIntegrationState.syncWyreWalletFailedMessage}`
          } else {
            return `Succeed. Wallet Details: ${wyreIntegrationState.wyreWalletDetails}`
          }
    }
  }, [ actionKind, wyreIntegrationState ] )
}
