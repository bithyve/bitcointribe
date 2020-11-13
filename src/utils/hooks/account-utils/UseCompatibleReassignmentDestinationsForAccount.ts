import AccountShell from '../../../common/data/models/AccountShell';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';
import useAccountShellsInTransactionGroup from '../state-selectors/accounts/UseAccountShellsInTransactionGroup';


/**
 * Gets all account shells with a matching transaction group
 */
function useCompatibleReassignmentDestinationsForAccount(
  accountShell: AccountShell,
): SubAccountDescribing[] {
  return useAccountShellsInTransactionGroup(AccountShell.getTransactionGroup(accountShell))
    .flatMap(shell => {
      return shell.id === accountShell.id ? [] : AccountShell.getSubAccounts(accountShell);
    });
}

export default useCompatibleReassignmentDestinationsForAccount;
