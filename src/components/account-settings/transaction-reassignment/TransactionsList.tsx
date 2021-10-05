import React, { useCallback } from 'react'
import { StyleSheet, FlatList } from 'react-native'
import { ListItem } from 'react-native-elements'
import RadioButton from '../../RadioButton'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import BitcoinUnit from '../../../common/data/enums/BitcoinUnit'
import CurrencyKind from '../../../common/data/enums/CurrencyKind'
import useCurrencyKind from '../../../utils/hooks/state-selectors/UseCurrencyKind'
import TransactionListItemContent from '../../transactions/TransactionsFlatListItemContent'

export type Props = {
  bitcoinUnit?: BitcoinUnit;
  currencyKind?: CurrencyKind | null;
  selectableTransactions: TransactionDescribing[];
  selectedTransactionIDs: Set<string>;
  onTransactionSelected: ( string ) => void;
};

const listItemKeyExtractor = ( item: TransactionDescribing ) => item.txID

const TransactionsList: React.FC<Props> = ( {
  bitcoinUnit = BitcoinUnit.SATS,
  currencyKind: defaultCurrencyKind,
  selectableTransactions,
  selectedTransactionIDs,
  onTransactionSelected,
}: Props ) => {
  const currencyKind = defaultCurrencyKind || useCurrencyKind()

  const isChecked = useCallback( ( transaction: TransactionDescribing ) => {
    return selectedTransactionIDs.has( transaction.txID )
  }, [ selectedTransactionIDs ] )

  const renderItem = ( { item: transaction }: { item: TransactionDescribing } ) => {
    return (
      <ListItem
        bottomDivider
        onPress={() => { onTransactionSelected( transaction ) }}
      >
        <RadioButton
          isChecked={isChecked( transaction )}
          ignoresTouch
        />

        <TransactionListItemContent
          transaction={transaction}
          bitcoinUnit={bitcoinUnit}
          currencyKind={currencyKind}
          accountShellId=""
        />
      </ListItem>
    )
  }

  return (
    <FlatList
      style={styles.rootContainer}
      contentContainerStyle={{
        paddingHorizontal: 14
      }}
      extraData={selectedTransactionIDs}
      data={selectableTransactions}
      keyExtractor={listItemKeyExtractor}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
  }
} )

export default TransactionsList
