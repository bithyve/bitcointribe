import { useSelector } from 'react-redux';
import AccountPayload from '../../../common/data/models/AccountPayload/Interfaces';
import { AccountsState } from '../../../store/reducers/accounts';


function useActiveAccountPayload(accountID: string): AccountPayload | undefined {
  return useSelector(state => {
    const accountsState: AccountsState = state.accounts;

    return accountsState.activeAccounts.find(accountPayload => accountPayload.uuid === accountID);
  });
}

export default useActiveAccountPayload;
