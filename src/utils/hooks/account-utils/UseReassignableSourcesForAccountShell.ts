import { useMemo } from 'react';
import AccountShell from '../../../common/data/models/AccountShell';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';


function useReassignableSourcesForAccountShell(
  accountShell: AccountShell,
): SubAccountDescribing[] {
  return useMemo(() => {
    return accountShell.subAccounts;
  }, [accountShell.subAccounts]);
}

export default useReassignableSourcesForAccountShell;
