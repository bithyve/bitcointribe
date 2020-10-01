import { useSelector } from 'react-redux';
import AccountShell from '../../../../common/data/models/AccountShell';
import { AccountsState } from '../../../../store/reducers/accounts';


export default function useActiveAccountShells(): AccountShell[] {
  return useSelector(state => state.accounts.activeAccounts);
}
