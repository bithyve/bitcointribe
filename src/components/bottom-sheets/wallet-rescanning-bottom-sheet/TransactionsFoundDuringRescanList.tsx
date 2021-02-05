import React, { ReactElement } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { TransactionDetails } from '../../../bitcoin/utilities/Interface'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import { RescannedTransactionData } from '../../../store/reducers/wallet-rescanning'
import AccountDetailsTransactionsListItem from '../../account-details/AccountDetailsTransactionsListItem'

export type Props = {
  containerStyle?: Record<string, unknown>;
  transactionsDetailItems: RescannedTransactionData[];
  onTransactionDataSelected: ( transactionData: RescannedTransactionData ) => void;
};

const keyExtractor = ( item: RescannedTransactionData ) => item.details.txid

const TransactionsFoundDuringRescanList: React.FC<Props> = ( {
  containerStyle = {
  },
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
        {/*
            TODO: This is where we likely need to implement a new list
            item component to handle the concerns of the upcoming UX design (https://xd.adobe.com/view/181f3fd2-7aca-4284-61c7-3417e1fe6d8a-6e2e/screen/f7d13f6f-e24b-4966-9dab-c558ecd41ac3/)
         */}
        <AccountDetailsTransactionsListItem transaction={transactionData.details} />
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

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  }
} )

export default TransactionsFoundDuringRescanList
