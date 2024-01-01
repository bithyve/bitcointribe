import React, { useMemo } from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import AccountDetailsTransactionsList from '../../../components/account-details/AccountDetailsTransactionsList'
import useAccountShellFromRoute from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import useTransactionsForAccountShell from '../../../utils/hooks/state-selectors/accounts/UseTransactionsForAccountShell'
import Colors from '../../../common/Colors'
import HeaderTitle from '../../../components/HeaderTitle'
import CommonStyles from '../../../common/Styles/Styles'
export type Props = {
  navigation: any;
  route: any;
};


const TransactionsListContainerScreen: React.FC<Props> = ( { navigation, route }: Props ) => {
  const accountShell = useAccountShellFromRoute( route )
  const transactions = useTransactionsForAccountShell( accountShell )

  function handleTransactionSelection( transaction: TransactionDescribing ) {
    navigation.navigate( 'TransactionDetails', {
      transaction,
      accountShellID: accountShell.id,
    } )
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <HeaderTitle
        firstLineTitle={'All Transactions'}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <AccountDetailsTransactionsList
        transactions={transactions}
        onTransactionSelected={handleTransactionSelection}
        accountShellId={accountShell.id}
        showAll={true}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundColor
  },
} )

export default TransactionsListContainerScreen
