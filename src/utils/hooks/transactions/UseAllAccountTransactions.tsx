import { useMemo } from 'react'
import useAccountsState from '../state-selectors/accounts/UseAccountsState'
import AccountShell from '../../../common/data/models/AccountShell'



export default function useAllAccountTransactions() {
  const accountsState = useAccountsState()
  const accountShells: AccountShell[] = accountsState.accountShells

  const transactions = useMemo( () => {
    const allTransactions = []
    accountShells.forEach( ( shell )=> {
      allTransactions.push( ... AccountShell.getAllTransactions( shell ) )
    } )
    return allTransactions
  }, [ accountsState ] )

  return {
    transactions,
  }
}
