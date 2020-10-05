import React, { ReactElement } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { TransactionDescribing } from '../../common/data/models/Transactions/Interfaces';
import Colors from '../../common/Colors';
import TransactionsListItem from './AccountDetailsTransactionsListItem';

const keyExtractor = (item: TransactionDescribing)  => item.txID;

export type Props = {
  transactions: TransactionDescribing[];
  onTransactionSelected: (TransactionDescribing) => void;
};

const AccountDetailsTransactionsList: React.FC<Props> = ({
  transactions,
  onTransactionSelected,
}: Props) => {

  const renderItem = ({ item: transaction }: { item: TransactionDescribing }): ReactElement => {
    return (
      <TouchableOpacity
        onPress={() => onTransactionSelected(transaction)}
      >
        <TransactionsListItem transaction={transaction} />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={transactions}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
};


export default AccountDetailsTransactionsList;
