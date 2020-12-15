import AccountShell from '../../../../common/data/models/AccountShell';
import { useMemo } from 'react';
import { TransactionDetails } from '../../../../bitcoin/utilities/Interface';


export default function useTransactionsForAccountShell(
  accountShell: AccountShell
): TransactionDetails[] {
  return useMemo(() => {
    return AccountShell.getAllTransactions(accountShell);
  }, [accountShell]);
}
