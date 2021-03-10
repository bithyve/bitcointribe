import useSendingState from './UseSendingState'
import { useMemo } from 'react'
import { TransactionFeeInfo } from '../../../../store/reducers/sending'


export default function useTransactionFeeInfoForSending(
): TransactionFeeInfo {
  const sendingState = useSendingState()

  return useMemo( () => {
    return sendingState.transactionFeeInfo
  }, [ sendingState.transactionFeeInfo ] )
}
