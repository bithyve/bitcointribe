import { useSelector } from 'react-redux';
import TransactionGroup from '../../../../common/data/enums/TransactionGroup';
import AccountShell from '../../../../common/data/models/AccountShell';
import SubAccountDescribing from '../../../../common/data/models/SubAccountInfo/Interfaces';
import { AccountsState } from '../../../../store/reducers/accounts';
import useAccountShellsInGroup from './UseAccountShellsInGroup';


function useSubAccountsInGroup(transactionGroup: TransactionGroup): SubAccountDescribing[] {
  return useAccountShellsInGroup(transactionGroup)
    .flatMap(accountShell => accountShell.subAccounts);
}

export default useSubAccountsInGroup;
