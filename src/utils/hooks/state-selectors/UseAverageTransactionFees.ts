import { useMemo } from 'react'
import useAccountsState from './accounts/UseAccountsState'

export default function useAverageTransactionFees(): unknown {
  const accountsState = useAccountsState()

  return useMemo( () => {
    return accountsState.averageTxFees
  }, [ accountsState.averageTxFees ] )
}
