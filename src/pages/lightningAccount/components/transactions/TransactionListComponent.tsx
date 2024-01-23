import React, { Component, ReactElement } from 'react'
import { View, FlatList, StyleSheet, StatusBar, TouchableOpacity } from 'react-native'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import Transaction from '../../../../models/Transaction'
import TransactionListItemComponent from './TransactionListItemComponent'
import { useNavigation } from '@react-navigation/native'

const TransactionListComponent = (props)=> {

    const navigation = useNavigation<any>()
    const uniqueKey = ( item:any, index: number ) => index.toString();

    const renderTemplate = ( { item } : {item: Transaction} ): ReactElement => {
      return (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate( 'TransactionInfo', {
              transactionData: item
            } )
          }}
        >
          <TransactionListItemComponent
            params = {item}
          />
          <View style={{
            borderBottomWidth: 1, borderColor: 'grey', marginHorizontal: widthPercentageToDP( 4 )
          }} />
        </TouchableOpacity>
      )
    }

      return (
        <View
          style={styles.container}>
          <FlatList
            data={props.transactions.slice( 0, 3 )}
            renderItem={renderTemplate}
            keyExtractor={uniqueKey}
          />
        </View>
      )
    }

export default TransactionListComponent;


const styles = StyleSheet.create( {
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
} )
