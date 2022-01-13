import React, { Component } from 'react'
import { Text, View } from 'react-native'

export default class TransactionInfo extends Component {
    constructor(props) {
        super(props)
        this.txData = this.props.navigation.getParam('transactionData')
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