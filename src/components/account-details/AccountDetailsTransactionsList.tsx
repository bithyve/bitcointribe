import React, { ReactElement, useCallback } from 'react'
import {
  FlatList,
  TouchableOpacity
} from 'react-native'
import _ from 'lodash'
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces'
import TransactionsListItem from './AccountDetailsTransactionsListItem'

const keyExtractor = ( item: TransactionDescribing ) => item.txid

export type Props = {
  transactions: TransactionDescribing[];
  onTransactionSelected: ( transaction: TransactionDescribing ) => void;
};

const AccountDetailsTransactionsList: React.FC<Props> = ( {
  transactions,
  onTransactionSelected,
}: Props ) => {

  /**
   * Debounces the tap handling due to an issue where double-tapping triggered
   * multiple navigations and caused the App component to unmount -- leading to
   * the crash described here: https://github.com/bithyve/hexa/issues/2329
   *
   * (Further discussion can also be found in this thread: https://bithyve-workspace.slack.com/archives/CN7K6RY9Z/p1608213919048000)
   */
  const transactionSelectionHandler = useCallback(
    _.debounce( ( transaction: TransactionDescribing ) => onTransactionSelected( transaction ), 200 ),
    []
  )

  const renderItem = ( { item: transaction, }: {
    item: TransactionDescribing;
  } ): ReactElement => {
    return (
      <TouchableOpacity
        onPress={() => transactionSelectionHandler( transaction )}
      >
        <TransactionsListItem transaction={transaction} />
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

export default AccountDetailsTransactionsList
