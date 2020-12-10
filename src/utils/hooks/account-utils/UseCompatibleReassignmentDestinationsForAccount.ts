import AccountShell from '../../../common/data/models/AccountShell';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';
import useAccountShellsInUTXOCompatibilityGroup from '../state-selectors/accounts/UseAccountShellsInUTXOCompatibilityGroup';


/**
 * Gets all account shells with a matching transaction group
 */
function useCompatibleReassignmentDestinationsForAccount(
  accountShell: AccountShell,
): SubAccountDescribing[] {
  return useAccountShellsInUTXOCompatibilityGroup(AccountShell.getUTXOCompatibilityGroup(accountShell))
    .flatMap(shell => {
      return shell.id === accountShell.id ? [] : AccountShell.getSubAccounts(accountShell);
    });
}

export default useCompatibleReassignmentDestinationsForAccount;
