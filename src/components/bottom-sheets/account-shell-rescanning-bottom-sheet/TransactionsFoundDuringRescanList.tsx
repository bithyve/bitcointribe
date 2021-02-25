import React, { ReactElement } from 'react'
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { RescannedTransactionData } from '../../../store/reducers/wallet-rescanning'
import RescannedTransactionListItem from './RescannedTransactionListItem'

export type Props = {
  containerStyle?: Record<string, unknown>;
  transactionsDetailItems: RescannedTransactionData[];
  onTransactionDataSelected: ( transactionData: RescannedTransactionData ) => void;
};

const keyExtractor = ( item: RescannedTransactionData ) => item.details.txid

const TransactionsFoundDuringRescanList: React.FC<Props> = ( {
  transactionsDetailItems,
  onTransactionDataSelected,
}: Props ) => {


  const renderItem = ( { item: transactionData, }: {
    item: RescannedTransactionData;
  } ): ReactElement => {
    return (
      <TouchableOpacity
        onPress={() => onTransactionDataSelected( transactionData )}
      >
        <RescannedTransactionListItem transactionData={transactionData} />
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      data={transactionsDetailItems}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  )
}


export default TransactionsFoundDuringRescanList
