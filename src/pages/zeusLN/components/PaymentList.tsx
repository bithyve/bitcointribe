import React, { Component, ReactElement } from 'react'
import { Text, View, FlatList, StyleSheet, StatusBar } from 'react-native'
import { Button } from 'react-native-elements/dist/buttons/Button'
import RESTUtils from '../../../../utils/ln/RESTUtils'
import axios from 'axios'
import SendAndReceiveButtonsFooter from '../../../Accounts/Details/SendAndReceiveButtonsFooter'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import useAccountShellFromNavigation from '../../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import Transaction from '../../../../models/Transaction'
import TransactionListItemComponent from './TransactionListItemComponent'
import PaymentItem from './PaymentItem'
import Payment from '../../../models/Payment'

export default class PaymentList extends Component {
  constructor( props: any ) {
    super( props )
  }

    uniqueKey = ( item:any, index: number ) => index.toString();

    renderTemplate = ( { item } : {item: Payment } ): ReactElement => {
      return (
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('PaymentDetailsScreen', {
                payment:item
            })
          }}
        >
            <PaymentItem payment={item}/>
          <View style={{
            borderBottomWidth: 1, borderColor: 'grey', marginHorizontal: widthPercentageToDP( 4 )
          }} />
        </TouchableOpacity>
      )
    }

    render() {
      return (
        <View
          style={styles.container}>
          <FlatList
            data={this.props.payments}
            renderItem={this.renderTemplate}
            keyExtractor={this.uniqueKey}
          />
        </View>
      )
    }
}


const styles = StyleSheet.create( {
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
} )
