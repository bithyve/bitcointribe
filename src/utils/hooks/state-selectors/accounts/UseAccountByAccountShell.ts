import { useSelector } from 'react-redux'
import { Account } from '../../../../bitcoin/utilities/Interface'
import AccountShell from '../../../../common/data/models/AccountShell'
import { AccountsState } from '../../../../store/reducers/accounts'

export default function useAccountByAccountShell( accountShell: AccountShell ): Account {
  return useSelector( state => {
    const accountsState: AccountsState = state.accounts
    return accountsState.accounts[ accountShell.primarySubAccount.id ]
  } )
}

