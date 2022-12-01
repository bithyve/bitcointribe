import React, { useMemo } from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import AccountDetailsTransactionsList from '../../../components/account-details/AccountDetailsTransactionsList'
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import useTransactionsForAccountShell from '../../../utils/hooks/state-selectors/accounts/UseTransactionsForAccountShell'
import Colors from '../../../common/Colors'
import CustomToolbar from '../../../components/home/CustomToolbar'
import { hp } from '../../../common/data/responsiveness/responsive'
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
      <SafeAreaView style={{
        backgroundColor: Colors.appPrimary
      }} />
      <CustomToolbar
        onBackPressed={() => navigation.goBack()}
        toolbarTitle={'All Transactions'}
        showSwitch={false}
        containerStyle={{
          // borderBottomStartRadius: 0,
          // marginTop: hp( 40 )
          height: hp( 100 )
        }} />
      <AccountDetailsTransactionsList
        transactions={transactions}
        onTransactionSelected={handleTransactionSelection}
        accountShellId={accountShell.id}
        showAll={true}
      />
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundColor
  },
} )

export default TransactionsListContainerScreen
