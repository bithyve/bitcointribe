import { useMemo } from 'react';
import AccountShell from '../../../../common/data/models/AccountShell';
import useAccountShellsInGroup from './UseAccountShellsInGroup';


/**
 * Finds account shells that can serve as compatible destination's for
 * another account shell's transactions during reassignment, or for merging.
 */
function useCompatibleAccountShells(accountShell: AccountShell): AccountShell[] {
  const accountShellsInGroup = useAccountShellsInGroup(AccountShell.getTransactionGroup(accountShell));

  return useMemo(() => {
    return accountShellsInGroup.filter(shell => shell.id !== accountShell.id);
  }, [useAccountShellsInGroup]);
}

export default useCompatibleAccountShells;
