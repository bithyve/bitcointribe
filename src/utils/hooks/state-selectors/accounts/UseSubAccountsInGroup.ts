import { useSelector } from 'react-redux';
import TransactionGroup from '../../../../common/data/enums/TransactionGroup';
import AccountShell from '../../../../common/data/models/AccountShell';
import SubAccountDescribing from '../../../../common/data/models/SubAccountInfo/Interfaces';
import { AccountsState } from '../../../../store/reducers/accounts';
import useAccountShellsInTransactionGroup from './UseAccountShellsInTransactionGroup';


function useSubAccountsInGroup(transactionGroup: TransactionGroup): SubAccountDescribing[] {
  return useAccountShellsInTransactionGroup(transactionGroup)
    .flatMap(accountShell => accountShell.subAccounts);
}

export default useSubAccountsInGroup;
