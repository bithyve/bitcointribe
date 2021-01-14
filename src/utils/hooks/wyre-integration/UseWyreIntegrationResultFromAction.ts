import { WyreActionKind } from '../../../store/actions/WyreIntegration'
import useWyreIntegrationState from '../state-selectors/accounts/UseWyreIntegrationState'
import { useMemo } from 'react'

export default function useWyreIntegrationResultFromAction( actionKind: WyreActionKind ): string {
  const wyreIntegrationState = useWyreIntegrationState()
  return useMemo( () => {
    switch ( actionKind ) {

        /*
        // commenting this while create wyre shell redux code is ready
        case WyreActionKind.CREATE_WYRE_ACCOUNT_SHELL:
          if ( wyreIntegrationState.isCreatingWyreAccountShell ) {
            return 'In Progress'
          } else if ( wyreIntegrationState.addWyreAccountShell ) {
            return `Failed. Message: ${wyreIntegrationState.addWyreAccountShellFailedMessage}`
          } else {
            return `Succeed. Metadata Details: ${wyreIntegrationState.addWyreAccountShellSucceeded}`
          }
        */
        case WyreActionKind.FETCH_WYRE_RESERVATION:
          if ( wyreIntegrationState.isProcessingWyreOrder ) {
            return 'In Progress'
          } else if ( wyreIntegrationState.hasWyreReservationFetchFailed ) {
            return `Failed. Message: ${wyreIntegrationState.fetchWyreReservationFailedMessage}`
          } else {
            return `Succeed. Result: ${wyreIntegrationState.hasWyreReservationFetchSucceeded}`
          }
    }
  }, [ actionKind, wyreIntegrationState ] )
}
