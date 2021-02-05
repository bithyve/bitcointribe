import React, { ReactElement } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { TransactionDetails } from '../../../bitcoin/utilities/Interface'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import AccountDetailsTransactionsListItem from '../../account-details/AccountDetailsTransactionsListItem'

export type Props = {
  containerStyle?: Record<string, unknown>;
  transactions: TransactionDetails[];
  onTransactionSelected: ( transaction: TransactionDetails ) => void;
};

const keyExtractor = ( item: TransactionDetails ) => item.txid

const TransactionsFoundDuringRescanList: React.FC<Props> = ( {
  containerStyle = {
  },
  transactions,
  onTransactionSelected,
}: Props ) => {


  const renderItem = ( { item: transaction, }: {
    item: TransactionDescribing;
  } ): ReactElement => {
    return (
      <TouchableOpacity
        onPress={() => onTransactionSelected( transaction )}
      >
        <AccountDetailsTransactionsListItem transaction={transaction} />
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  }
} )

export default TransactionsFoundDuringRescanList
