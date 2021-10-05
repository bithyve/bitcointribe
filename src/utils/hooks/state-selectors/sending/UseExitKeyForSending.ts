import useSendingState from './UseSendingState'
import { useMemo } from 'react'
import SourceAccountKind from '../../../../common/data/enums/SourceAccountKind'
import useAccountsState from '../accounts/UseAccountsState'
import { MultiSigAccount } from '../../../../bitcoin/utilities/Interface'


export default function useExitKeyForSending(): boolean {
  const sendingState = useSendingState()
  const accountsState = useAccountsState()

  return useMemo( () => {
    const { primarySubAccount } = sendingState.sourceAccountShell
    if( primarySubAccount.sourceKind === SourceAccountKind.SECURE_ACCOUNT ){
      const account = ( accountsState.accounts[ primarySubAccount.id ] as MultiSigAccount )
      const hasExitKey = account.xprivs.secondary? true: false
      return hasExitKey
    }
    else return false
  }, [ sendingState.sourceAccountShell, accountsState ] )
}
