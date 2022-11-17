import React, { ReactElement, useCallback } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import _ from "lodash";
import TransactionDescribing from "../../common/data/models/Transactions/Interfaces";
import TransactionsListItem from "./AccountDetailsTransactionsListItem";
import Colors from "../../common/Colors";
import { widthPercentageToDP, heightPercentageToDP } from "react-native-responsive-screen";


const keyExtractor = (item: TransactionDescribing) => item.txid;

export type Props = {
  transactions: TransactionDescribing[];
  onTransactionSelected: (transaction: TransactionDescribing) => void;
  accountShellId: string;
  showAll: boolean;
};

const AccountDetailsTransactionsList: React.FC<Props> = ({
  transactions,
  onTransactionSelected,
  accountShellId,
  showAll,
}: Props) => {
  /**
   * Debounces the tap handling due to an issue where double-tapping triggered
   * multiple navigations and caused the App component to unmount -- leading to
   * the crash described here: https://github.com/bithyve/hexa/issues/2329
   *
   * (Further discussion can also be found in this thread: https://bithyve-workspace.slack.com/archives/CN7K6RY9Z/p1608213919048000)
   */
  const transactionSelectionHandler = useCallback(
    _.debounce(
      (transaction: TransactionDescribing) =>
        onTransactionSelected(transaction),
      200
    ),
    []
  );

  const renderItem = ({
    item: transaction,
  }: {
    item: TransactionDescribing;
  }): ReactElement => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => transactionSelectionHandler(transaction)}
        >
          <TransactionsListItem
            accountShellId={accountShellId}
            transaction={transaction}
          />
          {/* <View style={{
          borderBottomWidth: 1, borderColor: Colors.gray1, marginHorizontal: widthPercentageToDP( 4 )
        }} /> */}
        </TouchableOpacity>
      </View>
    );
  };
  return (
    
    <FlatList
      // data={ showAll ? transactions.sort( ( a, b ) => b.date.localeCompare( a.date ) ) : transactions.sort( ( a, b ) => b.date.localeCompare( a.date ) ).slice( 0, 3 )}
      data={showAll ? transactions : transactions.slice(0, 3)}
      // data={transactions}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      />
  );
};

export default AccountDetailsTransactionsList;
