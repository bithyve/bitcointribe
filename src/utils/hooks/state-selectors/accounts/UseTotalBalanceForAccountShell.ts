import AccountShell from '../../../../common/data/models/AccountShell';
import { Satoshis } from '../../../../common/data/typealiases/UnitAliases';
import { useMemo } from 'react';


export default function useTotalBalanceForAccountShell(accountShell: AccountShell): Satoshis {
  return useMemo(() => {
    return AccountShell.getTotalBalance(accountShell);
  }, [accountShell]);
}
