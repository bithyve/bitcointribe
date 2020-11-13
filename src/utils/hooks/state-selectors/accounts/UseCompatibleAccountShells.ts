import { useMemo } from 'react';
import AccountShell from '../../../../common/data/models/AccountShell';
import useAccountShellsInTransactionGroup from './UseAccountShellsInTransactionGroup';


/**
 * Finds account shells that can serve as compatible destination's for
 * another account shell's transactions during reassignment, or for merging.
 */
function useCompatibleAccountShells(accountShell: AccountShell): AccountShell[] {
  const accountShellsInGroup = useAccountShellsInTransactionGroup(AccountShell.getTransactionGroup(accountShell));

  return useMemo(() => {
    return accountShellsInGroup.filter(shell => shell.id !== accountShell.id);
  }, [useAccountShellsInTransactionGroup]);
}

export default useCompatibleAccountShells;
