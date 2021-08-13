import React from 'react'
import { ListItem } from 'react-native-elements'
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces'
import TransactionsFlatListItemContent from '../transactions/TransactionsFlatListItemContent'

export type Props = {
  transaction: TransactionDescribing;
  accountShellId: string
};

const AccountDetailsTransactionsListItem: React.FC<Props> = ( { transaction, accountShellId }: Props ) => {
  return (
    <ListItem bottomDivider pad={4}>
      <TransactionsFlatListItemContent accountShellId={accountShellId} transaction={transaction} />
      <ListItem.Chevron />
    </ListItem>
  )
}

export default AccountDetailsTransactionsListItem
