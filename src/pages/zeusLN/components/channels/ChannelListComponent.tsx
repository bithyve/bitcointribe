import React, { Component, ReactElement } from 'react'
import { Text, View, FlatList, StyleSheet } from 'react-native'
import { Button } from 'react-native-elements/dist/buttons/Button'
import RESTUtils from '../../../../utils/ln/RESTUtils'
import axios from 'axios'
import SendAndReceiveButtonsFooter from '../../../Accounts/Details/SendAndReceiveButtonsFooter'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import useAccountShellFromNavigation from '../../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'

export default class ChannelList extends Component {
  constructor( props: any ) {
    super( props )
  }

  render() {
    return (
      <View>
        <View style = {{
          flex: 2,
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          margin: 5
        }}>
          <View>
            <Text>localBalance: {this.props.params.local_balance}</Text>
          </View>
          <View>
            <Text>remoteBalance: {this.props.params.remote_balance}</Text>
          </View>
        </View>

        <View style={{
          borderBottomWidth: 1, borderColor: 'grey', marginHorizontal: widthPercentageToDP( 4 )
        }} />
      </View>
    )
  }
}
