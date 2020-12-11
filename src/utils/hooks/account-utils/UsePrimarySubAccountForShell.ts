import { useMemo } from 'react';
import AccountShell from '../../../common/data/models/AccountShell';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';

export default function usePrimarySubAccountForShell(
  accountShell: AccountShell,
): SubAccountDescribing {
  return useMemo(() => {
    return accountShell.primarySubAccount;
  }, [accountShell.primarySubAccount]);
}
