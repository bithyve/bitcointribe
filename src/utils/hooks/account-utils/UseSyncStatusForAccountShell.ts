import { useMemo } from 'react'
import SyncStatus from '../../../common/data/enums/SyncStatus'
import AccountShell from '../../../common/data/models/AccountShell'

export default function useSyncStatusForAccountShell(
  accountShell: AccountShell,
): SyncStatus {
  return useMemo( () => {
    return accountShell.syncStatus
  }, [ accountShell.syncStatus ] )
}
