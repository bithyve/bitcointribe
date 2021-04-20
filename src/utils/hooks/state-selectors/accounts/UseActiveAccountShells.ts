import AccountShell from '../../../../common/data/models/AccountShell';
import useAccountsState from './UseAccountsState';
import { useMemo } from 'react';


export default function useActiveAccountShells(): AccountShell[] {
  const accountsState = useAccountsState();

  return useMemo(() => {
    return accountsState.accountShells || [];
  }, [accountsState.accountShells]);
}
