import { useSelector } from 'react-redux';
import BitcoinUnit from '../../../../common/data/enums/BitcoinUnit';
import TransactionGroup from '../../../../common/data/enums/TransactionGroup';
import AccountShell from '../../../../common/data/models/AccountShell';
import CheckingSubAccountInfo from '../../../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo';
import SavingsSubAccountInfo from '../../../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo';
import TestSubAccountInfo from '../../../../common/data/models/SubAccountInfo/HexaSubAccounts/TestSubAccountInfo';
import { AccountsState } from '../../../../store/reducers/accounts';

const sampleShellsForTestingTransactionReassignment: AccountShell[] = [
  new AccountShell({
    primarySubAccount: new CheckingSubAccountInfo({}),
    unit: BitcoinUnit.SATS,
  }),
  new AccountShell({
    primarySubAccount: new SavingsSubAccountInfo({}),
    unit: BitcoinUnit.SATS,
  }),
  new AccountShell({
    primarySubAccount: new TestSubAccountInfo({}),
    unit: BitcoinUnit.TSATS,
  }),
];


function useAccountShellsInGroup(transactionGroup: TransactionGroup): AccountShell[] {
  return useSelector(state => {
    const accountsState: AccountsState = state.accounts;

    return accountsState
      .accountShells
      // .concat(sampleShellsForTestingTransactionReassignment)
      .filter(accountShell => AccountShell.getTransactionGroup(accountShell) === transactionGroup);
  });
}

export default useAccountShellsInGroup;
