import useSendingState from './UseSendingState'
import { useMemo } from 'react'
import AccountShell from '../../../../common/data/models/AccountShell'


export default function useSourceAccountShellForSending(): AccountShell {
  const sendingState = useSendingState()

  return useMemo( () => {
    return sendingState.sourceAccountShell
  }, [ sendingState.sourceAccountShell ] )
}
