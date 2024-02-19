import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { Mode } from './AccountDetails'
import { inject, observer } from 'mobx-react'
import InvoiceItem from './components/InvoiceItem'
import TransactionItem from './components/TransactionItem'

const styles = StyleSheet.create( {
} )

const ViewAllScreen = inject(
  'InvoicesStore',
  'TransactionsStore'
)(
  observer( ( { InvoicesStore, TransactionsStore, navigation, route } ) => {
    const { mode, accountShellId } = route.params
    return (
      <View>
        {mode === Mode.LIGHTNING ? (
          <FlatList
            bounces={false}
            data={InvoicesStore.invoices}
            //keyExtractor={keyExtractor}
            renderItem={( { item: invoice }: { item } ) => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate( 'InvoiceDetailsScreen', {
                    invoice,
                  } )
                }}
              >
                <InvoiceItem navigation={navigation} invoice={invoice} />
              </TouchableOpacity>
            )}
          />
        ) : (
          <FlatList
            bounces={false}
            data={TransactionsStore.transactions}
            //keyExtractor={keyExtractor}
            renderItem={( { item: transaction }: { item } ) => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate( 'TransactionDetailsScreen', {
                    transaction,
                    accountShellId,
                  } )
                }}
              >
                <TransactionItem
                  transaction={transaction}
                  accountShellId={accountShellId}
                />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    )
  } )
)

export default ViewAllScreen
