import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import AccountDetailsTransactionsList from '../../../components/account-details/AccountDetailsTransactionsList'
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import useTransactionsForAccountShell from '../../../utils/hooks/state-selectors/accounts/UseTransactionsForAccountShell'

export type Props = {
  navigation: any;
};


const TransactionsListContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const accountShell = useAccountShellFromNavigation( navigation )
  const transactions = useTransactionsForAccountShell( accountShell )

  function handleTransactionSelection( transaction: TransactionDescribing ) {
    navigation.navigate( 'TransactionDetails', {
      transaction,
      accountShellID: accountShell.id,
    } )
  }

  return (
    <View style={styles.rootContainer}>
      <AccountDetailsTransactionsList
        transactions={transactions}
        onTransactionSelected={handleTransactionSelection}
      />
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },
} )

export default TransactionsListContainerScreen
