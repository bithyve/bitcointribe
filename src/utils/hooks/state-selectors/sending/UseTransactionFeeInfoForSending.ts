import useSendingState from './UseSendingState'
import { useMemo } from 'react'
import { RecipientDescribing } from '../../../../common/data/models/interfaces/RecipientDescribing'
import { Satoshis } from '../../../../common/data/typealiases/UnitAliases'
import { TransactionFeeInfo } from '../../../../store/reducers/sending'


export default function useTransactionFeeInfoForSending(
): TransactionFeeInfo {
  const sendingState = useSendingState()

  return useMemo( () => {
    return sendingState.transactionFeeInfo
  }, [ sendingState.transactionFeeInfo ] )
}
