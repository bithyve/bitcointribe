import { useMemo } from 'react';
import AccountShell from '../../../../common/data/models/AccountShell';
import useAccountsState from './UseAccountsState';


export default function useAccountShellForID(
  accountShellID: string
): AccountShell | undefined {
  const accountsState = useAccountsState();

  return useMemo(() => {
    return accountsState
      .accountShells
      .find(accountShell => accountShell.id === accountShellID);
  }, [accountsState.accountShells]);
}
