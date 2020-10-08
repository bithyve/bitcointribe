import { useMemo } from 'react';
import AccountShell from '../../../common/data/models/AccountShell';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';

const sampleSources: SubAccountDescribing[] = [

];

function useReassignableSourcesForAccount(
  accountShell: AccountShell,
): SubAccountDescribing[] {
  return useMemo(() => {
    return accountShell
      .subAccounts
      .filter(subAccount => subAccount.isPrimarySubAccount === false);
  }, [accountShell.subAccounts]);
}

export default useReassignableSourcesForAccount;
