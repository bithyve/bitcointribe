import { useMemo } from 'react'
import useAccountsState from './accounts/UseAccountsState'

export default function useExchangeRates(): unknown {
  const accountsState = useAccountsState()

  return useMemo( () => {
    return accountsState.exchangeRates
  }, [ accountsState.exchangeRates ] )
}
