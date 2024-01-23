import React, { ReactElement } from 'react'
import { TouchableOpacity, View, FlatList, StyleSheet, StatusBar } from 'react-native'
import PaymentItem from './PaymentItem'
import Payment from '../../../models/Payment'

 const PaymentList =(props)=> {


   const uniqueKey = ( item:any, index: number ) => index.toString();

  const renderTemplate = ( { item } : {item: Payment } ): ReactElement => {
      return (
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate( 'PaymentDetailsScreen', {
              payment:item
            } )
          }}
        >
          <PaymentItem payment={item}/>
        </TouchableOpacity>
      )
    }

      return (
        <View
          style={styles.container}>
          <FlatList
            data={props.payments}
            renderItem={renderTemplate}
            keyExtractor={uniqueKey}
          />
        </View>
      )
    }

export default PaymentList;

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
} )

