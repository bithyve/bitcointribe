import React, { ReactElement } from 'react'
import { FlatList } from 'react-native'
import { TransactionDetails } from '../../bitcoin/utilities/Interface'
import TransactionsFlatListItem from './TransactionsFlatListItem'

export type Props = {
  transactions: TransactionDetails[];
  onTransactionSelected: ( transaction: TransactionDetails ) => void;
};

const keyExtractor = ( item: TransactionDetails ) => item.txid


const TransactionsFlatList: React.FC<Props> = ( {
  transactions,
  onTransactionSelected,
}: Props ) => {

  function renderItem( { item: transaction }: { item: TransactionDetails } ): ReactElement {
    return (
      <TransactionsFlatListItem
        transaction={transaction}
        onPress={() => onTransactionSelected( transaction )}
      />
    )
  }

  return (
    <FlatList
      contentContainerStyle={{
        paddingHorizontal: 14
      }}
      data={transactions}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  )
}

export default TransactionsFlatList
