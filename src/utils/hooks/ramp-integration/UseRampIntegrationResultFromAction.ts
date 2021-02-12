import { RampActionKind } from '../../../store/actions/RampIntegration'
import useRampIntegrationState from '../state-selectors/accounts/UseRampIntegrationState'
import { useMemo } from 'react'

export default function useRampIntegrationResultFromAction( actionKind: RampActionKind ): string {
  const rampIntegrationState = useRampIntegrationState()
  return useMemo( () => {
    switch ( actionKind ) {

        /*
        // commenting this while create ramp shell redux code is ready
        case RampActionKind.CREATE_RAMP_ACCOUNT_SHELL:
          if ( rampIntegrationState.isCreatingRampAccountShell ) {
            return 'In Progress'
          } else if ( rampIntegrationState.addRampAccountShell ) {
            return `Failed. Message: ${rampIntegrationState.addRampAccountShellFailedMessage}`
          } else {
            return `Succeed. Metadata Details: ${rampIntegrationState.addRampAccountShellSucceeded}`
          }
        */
        case RampActionKind.FETCH_RAMP_RESERVATION:
          if ( rampIntegrationState.isProcessingRampOrder ) {
            return 'In Progress'
          } else if ( rampIntegrationState.hasRampReservationFetchFailed ) {
            return `Failed. Message: ${rampIntegrationState.fetchRampReservationFailedMessage}`
          } else {
            return `Succeed. Result: ${rampIntegrationState.hasRampReservationFetchSucceeded}`
          }
    }
  }, [ actionKind, rampIntegrationState ] )
}
