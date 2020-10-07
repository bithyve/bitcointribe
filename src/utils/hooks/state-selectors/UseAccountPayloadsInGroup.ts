import { useSelector } from 'react-redux';
import TransactionGroup from '../../../common/data/enums/TransactionGroup';
import AccountPayload from '../../../common/data/models/AccountPayload/Interfaces';
import { AccountsState } from '../../../store/reducers/accounts';


function useAccountPayloadsInGroup(transactionGroup: TransactionGroup): AccountPayload[] {
  return useSelector(state => {
    const accountsState: AccountsState = state.accounts;

    return accountsState.activeAccounts.filter(accountPayload => accountPayload.transactionGroup === transactionGroup);
  });
}

export default useAccountPayloadsInGroup;
