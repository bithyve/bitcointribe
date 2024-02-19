import React, { Component, ReactElement } from 'react'
import { Text, View, FlatList, StyleSheet } from 'react-native'
import { Button } from 'react-native-elements/dist/buttons/Button'
import RESTUtils from '../../../../utils/ln/RESTUtils'
import axios from 'axios'
import SendAndReceiveButtonsFooter from '../../../Accounts/Details/SendAndReceiveButtonsFooter'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import useAccountShellFromRoute from '../../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'

export default class ChannelList extends Component {
  constructor( props: any ) {
    super( props )
  }

  render() {
    return (
      <View>
        <Text>{this.props.alias}</Text>
        <View style = {{
          flex: 2,
          justifyContent: 'space-around',
          alignItems: 'center',
          margin: 5
        }}>
          {this.props.channelParams.active?
            <View style = {{
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              margin: 5
            }}>
              <View>
                <Text>Local: {this.props.channelParams.local_balance}</Text>
              </View>
              <View>
                <Text>Remote: {this.props.channelParams.remote_balance}</Text>
              </View>
            </View>: <Text>Offline: { parseInt ( this.props.channelParams.remote_balance ) + parseInt( this.props.channelParams.local_balance )}</Text>}
        </View>

        <View style={{
          borderBottomWidth: 1, borderColor: 'grey', marginHorizontal: widthPercentageToDP( 4 )
        }} />
      </View>
    )
  }
}
