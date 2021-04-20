import TransactionPriority from '../enums/TransactionPriority'
import { Satoshis } from '../typealiases/UnitAliases'

type TransactionFeeSnapshot = {
  amount: Satoshis;
  estimatedBlocksBeforeConfirmation: number;
}

export default TransactionFeeSnapshot
