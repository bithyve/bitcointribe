import { useMemo } from 'react'
import AccountShell from '../../../common/data/models/AccountShell'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'


export default function useSpendableBalanceForAccountShell(
  accountShell: AccountShell,
): Satoshis {
  return useMemo( () => {
    return AccountShell.getSpendableBalance( accountShell )
  }, [ accountShell ] )
}
