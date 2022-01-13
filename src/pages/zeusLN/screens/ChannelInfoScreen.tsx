import React, { Component } from 'react'
import { Text, View } from 'react-native'

export default class ChannelInfoSceen extends Component {
    constructor(props) {
        super(props)
        console.log(this.props.navigation.getParam('channelInfo'), "+++")
        this.state = {
            channelInfo: this.props.navigation.getParam('channelInfo')
        }
    }

    render() {
        return (
          <View style = {{
            margin: 10,
            flex: 1,
            flexDirection: 'column'
          }}>
              <View
              style = {{
                  flex:1,
                  flexDirection: 'column',
                  alignItems: 'center',
            justifyContent: 'center'
              }}
              >
                  <Text>{this.state.channelInfo.remote_pubkey}</Text>
                  <Text>local balance: {this.state.channelInfo.local_balance}</Text>

                  <Text>remote balance: {this.state.channelInfo.remote_balance}</Text>

                  <Text>unsettled balance: {this.state.channelInfo.unsettled_balance}</Text>
              </View>
              <View
              style = {{
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'space-around'
              }}>
                <Text>status: {this.state.channelInfo.active? 'active': 'inactive'}</Text>
                <Text>private: {this.state.channelInfo.private? 'true': 'false'}</Text>
              </View>
            </View>
        )
    }
}