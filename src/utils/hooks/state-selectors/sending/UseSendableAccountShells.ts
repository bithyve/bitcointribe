import AccountShell from '../../../../common/data/models/AccountShell'
import useAccountsState from '../accounts/UseAccountsState'
import { useMemo } from 'react'
import SubAccountKind from '../../../../common/data/enums/SubAccountKind'


export default function useSendableAccountShells( currentAccountShell: AccountShell ): AccountShell[] {
  const accountsState = useAccountsState()

  return useMemo( () => {
    if( currentAccountShell.primarySubAccount.kind === SubAccountKind.TEST_ACCOUNT ) return []

    const sendableAccountShells = []
    accountsState.accountShells.forEach( ( accountShell ) => {
      if( accountShell.primarySubAccount.isUsable && accountShell.primarySubAccount.kind !== SubAccountKind.TEST_ACCOUNT )
        if( accountShell.id !== currentAccountShell.id )
          sendableAccountShells.push( accountShell )
    } )

    return sendableAccountShells
  }, [ accountsState.accountShells ] )
}
