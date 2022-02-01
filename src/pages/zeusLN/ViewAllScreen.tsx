import React from 'react'
import { StyleSheet, Text, View, FlatList } from 'react-native'
import { Mode } from './AccountDetails'
import { inject, observer } from 'mobx-react'
import InvoiceItem from './components/InvoiceItem'
import TransactionItem from './components/TransactionItem'

const styles = StyleSheet.create( {
} )


const ViewAllScreen = inject(
  'InvoicesStore',
  'TransactionsStore', )( observer( ( {
  InvoicesStore,
  TransactionsStore,
  navigation
} ) => {
  const { mode, accountShellId } = navigation.state.params
  return (
    <View>
      {
        mode === Mode.LIGHTNING ?
          <FlatList
            bounces={false}
            data={InvoicesStore.invoices}
            //keyExtractor={keyExtractor}
            renderItem={( { item: invoice, } : {
            item;
          } ) => <InvoiceItem 
          navigation = {navigation}
          invoice={invoice} />}
          />:
          <FlatList
            bounces={false}
            data={TransactionsStore.transactions}
            //keyExtractor={keyExtractor}
            renderItem={( { item: transaction, } : {
            item;
          } ) => <TransactionItem           navigation = {navigation}
          transaction={transaction} accountShellId={accountShellId}/>}
          />
      }

    </View>
  )
} ) )


export default ViewAllScreen

