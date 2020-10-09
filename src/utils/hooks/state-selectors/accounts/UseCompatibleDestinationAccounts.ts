import { useMemo } from 'react';
import AccountShell from '../../../../common/data/models/AccountShell';
import useAccountShellsInGroup from './UseAccountShellsInGroup';


function useCompatibleDestinationAccounts(accountShell: AccountShell): AccountShell[] {
  const accountShellsInGroup = useAccountShellsInGroup(accountShell.transactionGroup);

  return useMemo(() => {
    return accountShellsInGroup.filter(shell => shell.id !== accountShell.id);
  }, [accountShellsInGroup]);
}

export default useCompatibleDestinationAccounts;
