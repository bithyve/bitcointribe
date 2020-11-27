import { useMemo } from 'react';
import AccountShell from '../../../../common/data/models/AccountShell';
import useAccountShellsInUTXOCompatibilityGroup from './UseAccountShellsInUTXOCompatibilityGroup';


/**
 * Finds account shells that can serve as compatible destination's for
 * another account shell's transactions during reassignment, or for merging.
 */
function useCompatibleAccountShells(accountShell: AccountShell): AccountShell[] {
  const accountShellsInGroup = useAccountShellsInUTXOCompatibilityGroup(AccountShell.getUTXOCompatibilityGroup(accountShell));

  return useMemo(() => {
    return accountShellsInGroup.filter(shell => shell.id !== accountShell.id);
  }, [accountShellsInGroup]);
}

export default useCompatibleAccountShells;
