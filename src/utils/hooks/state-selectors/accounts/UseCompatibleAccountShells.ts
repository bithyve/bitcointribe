import { useMemo } from 'react';
import AccountShell from '../../../../common/data/models/AccountShell';
import useAccountShellsInUTXOCompatibilityGroup from './UseAccountShellsInUTXOCompatibilityGroup';


/**
 * Finds other account shells that share the given shell's `UTXOCompatibilityGroup`
 */
function useCompatibleAccountShells(accountShell: AccountShell): AccountShell[] {
  const accountShellsInGroup = useAccountShellsInUTXOCompatibilityGroup(AccountShell.getUTXOCompatibilityGroup(accountShell));

  return useMemo(() => {
    return accountShellsInGroup.filter(shell => shell.id !== accountShell.id);
  }, [accountShellsInGroup]);
}

export default useCompatibleAccountShells;
