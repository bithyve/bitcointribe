import useSendingState from './UseSendingState'
import { useMemo } from 'react'
import SourceAccountKind from '../../../../common/data/enums/SourceAccountKind'
import useAccountsState from '../accounts/UseAccountsState'
import SecureAccount from '../../../../bitcoin/services/accounts/SecureAccount'


export default function useExitKeyForSending(): boolean {
  const sendingState = useSendingState()
  const accountsState = useAccountsState()

  return useMemo( () => {
    const { primarySubAccount } = sendingState.sourceAccountShell
    if( primarySubAccount.sourceKind === SourceAccountKind.SECURE_ACCOUNT ){

      const service: SecureAccount = accountsState[
        primarySubAccount.sourceKind
      ].service
      const hasExitKey = service.secureHDWallet.secondaryXpriv

      if( hasExitKey )return true
      else return false
    }
    else return false
  }, [ sendingState.sourceAccountShell, accountsState ] )
}
