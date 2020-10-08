import { useSelector } from 'react-redux';
import TransactionGroup from '../../../../common/data/enums/TransactionGroup';
import AccountShell from '../../../../common/data/models/AccountShell';
import { AccountsState } from '../../../../store/reducers/accounts';


function useAccountShellsInGroup(transactionGroup: TransactionGroup): AccountShell[] {
  return useSelector(state => {
    const accountsState: AccountsState = state.accounts;

    return accountsState.activeAccounts.filter(accountShell => accountShell.transactionGroup === transactionGroup);
  });
}

export default useAccountShellsInGroup;
