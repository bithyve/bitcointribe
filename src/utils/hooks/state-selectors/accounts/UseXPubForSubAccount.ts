import { useMemo } from 'react'
import AccountShell from '../../../../common/data/models/AccountShell'
import SubAccountDescribing from '../../../../common/data/models/SubAccountInfo/Interfaces'
import useAccountsState from './UseAccountsState'


export default function useXPubForSubAccount(
  subAccount: SubAccountDescribing
): string {
  return useMemo( () => {
    return subAccount.xPub
  }, [ subAccount.xPub ] )
}
