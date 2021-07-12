import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Accounts, AccountType } from '../../../bitcoin/utilities/Interface'
import AccountShell from '../../../common/data/models/AccountShell'
import { AccountsState } from '../../../store/reducers/accounts'


export default function useReceivingAddressFromAccount(
  pickAddressFor: AccountType,
  pickAddressFrom: AccountType,
  instance = 0
): string {
  const accountState: AccountsState =  useSelector( state => state.accounts )
  const accountShells: AccountShell[] = accountState.accountShells
  const accounts: Accounts = accountState.accounts

  return useMemo( () => {
    let receivingAddress
    switch( pickAddressFor ) {
        case AccountType.WYRE_ACCOUNT:
        case AccountType.RAMP_ACCOUNT:
          const shell = accountShells.find( shell =>  shell.primarySubAccount.type === pickAddressFrom && shell.primarySubAccount.instanceNumber === instance )
          const accountId = shell.primarySubAccount.id
          receivingAddress = accounts[ accountId ].receivingAddress
          break
    }

    return receivingAddress
  }, [ accountShells, accounts ] )
}
