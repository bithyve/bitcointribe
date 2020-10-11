import { useSelector } from 'react-redux';
import AccountShell from '../../../../common/data/models/AccountShell';
import { AccountsState } from '../../../../store/reducers/accounts';


function useAccountShell(accountShellID: string): AccountShell | undefined {
  return useSelector(state => {
    const accountsState: AccountsState = state.accounts;

    return accountsState.activeAccounts.find(accountShell => accountShell.id === accountShellID);
  });
}

export default useAccountShell;
