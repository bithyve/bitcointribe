import React, { useMemo } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import useAllAccountTransactions from '../../utils/hooks/transactions/UseAllAccountTransactions'
import EmptyListInfoBox from '../../components/empty-states/EmptyListInfoBox'
import TransactionsFlatList from '../../components/transactions/TransactionsFlatList'

export type Props = {
  navigation: any;
};

const AllTransactionsContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const { transactions, isLoadingTransactions } = useAllAccountTransactions()

  const isShowingInfoBox = useMemo( () => {
    return transactions.length < 2
  }, [ transactions ] )

  if ( isLoadingTransactions ) {
    return <ActivityIndicator size="large" />
  } else {
    return (
      <View style={styles.rootContainer}>
        <TransactionsFlatList
          transactions={transactions}
          onTransactionSelected={( transaction ) => {
            navigation.navigate( 'TransactionDetails', {
              transaction,
            } )
          }}
        />

        {isShowingInfoBox && (
          <EmptyListInfoBox
            containerStyle={styles.infoBoxContainer}
            headingText="View your transactions here"
            infoText="All your recent transactions across the accounts appear here"
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  infoBoxContainer: {
    flex: 0,
    marginHorizontal: 16,
    position: 'absolute',
    bottom: '5%',
  },
} )

export default AllTransactionsContainerScreen
