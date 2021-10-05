import React from 'react'
import { ListItem } from 'react-native-elements'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces'
import TransactionsFlatListItemContent from '../transactions/TransactionsFlatListItemContent'

export type Props = {
  transaction: TransactionDescribing;
  accountShellId: string
};

const AccountDetailsTransactionsListItem: React.FC<Props> = ( { transaction, accountShellId }: Props ) => {
  return (
    <ListItem containerStyle={{
      backgroundColor: '#f5f5f5', paddingHorizontal: widthPercentageToDP( 5 )
    }} pad={2}>
      <TransactionsFlatListItemContent accountShellId={accountShellId} transaction={transaction} />
      <ListItem.Chevron size={28}/>
    </ListItem>
  )
}

export default AccountDetailsTransactionsListItem
