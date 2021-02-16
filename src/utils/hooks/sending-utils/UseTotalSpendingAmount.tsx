import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import useSendingState from '../state-selectors/sending/UseSendingState'


export default function useTotalSpendingAmount(): Satoshis {
  const sendingState = useSendingState()

  return useMemo( () => {
    return Object.values( sendingState.amountDesignations ).reduce( ( accumulated, current ) => {
      return accumulated + current
    }, 0 )
  }, [ sendingState.amountDesignations ] )
}
