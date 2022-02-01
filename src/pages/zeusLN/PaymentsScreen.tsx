import React, { useEffect } from 'react'
import { StyleSheet, Text, View, FlatList } from 'react-native'
import { Mode } from './AccountDetails'
import { inject, observer } from 'mobx-react'
import InvoiceItem from './components/InvoiceItem'
import PaymentItem from './components/PaymentItem'


const styles = StyleSheet.create( {
} )

const ViewAllScreen = inject(
  'PaymentsStore',
  '', )( observer( ( {
  PaymentsStore,
  navigation
} ) => {

  useEffect( () => {
    PaymentsStore.reset()
    PaymentsStore.getPayments()
  }, [] )

  return (
    <View>
      <FlatList
        bounces={false}
        data={PaymentsStore.payments}
        //keyExtractor={keyExtractor}
        renderItem={( { item: payments, } : {
              item;
            } ) => <PaymentItem invoice={payments} />}
      />

    </View>
  )
} ) )


export default ViewAllScreen



