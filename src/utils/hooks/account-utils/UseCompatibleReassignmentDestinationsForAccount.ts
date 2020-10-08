import AccountShell from '../../../common/data/models/AccountShell';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';
import useAccountShellsInGroup from '../state-selectors/accounts/UseAccountShellsInGroup';


/**
 * Gets all account shells with a matching transaction group
 */
function useCompatibleReassignmentDestinationsForAccount(
  accountShell: AccountShell,
): SubAccountDescribing[] {
  return useAccountShellsInGroup(accountShell.transactionGroup)
    .flatMap(shell => {
      return shell.id === accountShell.id ? [] : shell.subAccounts;
    });
}

export default useCompatibleReassignmentDestinationsForAccount;
