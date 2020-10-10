import { useMemo } from 'react';
import AccountShell from '../../../common/data/models/AccountShell';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';

export default function useSecondarySubAccountsForShell(
  accountShell: AccountShell,
): SubAccountDescribing[] {
  return useMemo(() => {
    return accountShell.secondarySubAccounts;
  }, [accountShell.secondarySubAccounts]);
}
