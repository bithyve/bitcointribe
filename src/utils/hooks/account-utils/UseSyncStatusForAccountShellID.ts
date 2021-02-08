import { useMemo } from 'react'
import SyncStatus from '../../../common/data/enums/SyncStatus'
import useAccountShellForID from '../state-selectors/accounts/UseAccountShellForID'

export default function useSyncStatusForAccountShellID(
  accountShellID: string,
): SyncStatus {
  const accountShell = useAccountShellForID( accountShellID )

  return useMemo( () => {
    return accountShell.syncStatus
  }, [ accountShell.syncStatus ] )
}
