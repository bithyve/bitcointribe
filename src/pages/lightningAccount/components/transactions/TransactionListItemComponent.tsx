import React from 'react'
import { Text, View } from 'react-native'

import { widthPercentageToDP } from 'react-native-responsive-screen'

const TransactionListItemComponent = (props)=> {
    return (
      <View>
        <View style = {{
          flex: 2,
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          margin: 5
        }}>
          <View>
            <Text>amount: {props.params.amount}</Text>
          </View>
          <View>
            <Text>timestamp: {props.params.time_stamp}</Text>
          </View>
        </View>

        <View style={{
          borderBottomWidth: 1, borderColor: 'grey', marginHorizontal: widthPercentageToDP( 4 )
        }} />
      </View>
    )
  }

  export default TransactionListItemComponent