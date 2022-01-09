import React, { Component, ReactElement } from 'react'
import { Text, View, FlatList, StyleSheet } from 'react-native'
import { Button } from 'react-native-elements/dist/buttons/Button'
import RESTUtils from '../../../utils/ln/RESTUtils'
import axios from "axios";
import SendAndReceiveButtonsFooter from '../../Accounts/Details/SendAndReceiveButtonsFooter';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { widthPercentageToDP } from 'react-native-responsive-screen'
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';

export default class TransactionInfo extends Component {
    constructor(props) {
        super(props)
        // console.log(this.props.navigation.getParam('transactionData'))
        // this.state = {
        this.txData = this.props.navigation.getParam('transactionData')
        // }
    }

    render() {
        return (
          <View style = {{
            margin: 5
          }}>
            <Text>{this.txData.amount}</Text>
            <Text>{this.txData.tx_hash}</Text>
            <Text>{this.txData.dest_addresses.map((data, index) => {
              <Text id={{index}}>{data}</Text>
            })}</Text>

            <Text>{this.txData.num_confirmations}</Text>
            <Text>{this.txData.total_fees}</Text>
          </View>
        )
    }
}