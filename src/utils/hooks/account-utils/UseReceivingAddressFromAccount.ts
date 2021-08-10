import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Accounts, AccountType, ActiveAddressAssignee, Wallet } from '../../../bitcoin/utilities/Interface'
import AccountShell from '../../../common/data/models/AccountShell'
import { AccountsState } from '../../../store/reducers/accounts'
import { getNextFreeAddress } from '../../../store/sagas/accounts'


export default function useReceivingAddressFromAccount(
  pickAddressFor: AccountType,
  pickAddressFrom: AccountType,
  instance = 0
): string {
  const accountState: AccountsState =  useSelector( state => state.accounts )
  const accountShells: AccountShell[] = accountState.accountShells
  const accounts: Accounts = accountState.accounts
  const wallet: Wallet = useSelector( state => state.storage.wallet )
  const dispatch = useDispatch()

  return useMemo( () => {
    let receivingAddress
    if( !wallet.accounts[ pickAddressFrom ] ) pickAddressFrom = AccountType.CHECKING_ACCOUNT // default account

    const assigneeInfo: ActiveAddressAssignee = {
      type: pickAddressFor,
      senderInfo: {
        name: pickAddressFor === AccountType.WYRE_ACCOUNT? 'Wyre': 'Ramp'
      }
    }
    switch( pickAddressFor ) {
        case AccountType.WYRE_ACCOUNT:
        case AccountType.RAMP_ACCOUNT:
          const shell = accountShells.find( shell =>  shell.primarySubAccount.type === pickAddressFrom && shell.primarySubAccount.instanceNumber === instance )
          const accountId = shell.primarySubAccount.id
          receivingAddress = getNextFreeAddress( dispatch, accounts[ accountId ], assigneeInfo )
          break
    }
    return receivingAddress
  }, [ wallet.accounts ] )
}
