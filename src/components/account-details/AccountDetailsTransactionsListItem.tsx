import React from 'react'
import { ListItem } from 'react-native-elements'
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen'
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces'
import TransactionsFlatListItemContent from '../transactions/TransactionsFlatListItemContent'
import { View} from "react-native";
import Colors from '../../common/Colors';

export type Props = {
  transaction: TransactionDescribing;
  accountShellId: string
};

const AccountDetailsTransactionsListItem: React.FC<Props> = ( { transaction, accountShellId }: Props ) => {
  return (
    <ListItem containerStyle={{
      backgroundColor : Colors.backgroundColor1, paddingHorizontal: widthPercentageToDP( 5), 
    }} pad={2}>
      
      <TransactionsFlatListItemContent accountShellId={accountShellId} transaction={transaction} />
      {/* <ListItem.Chevron size={22}/> */}
    </ListItem>
  )
}

export default AccountDetailsTransactionsListItem
