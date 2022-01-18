import React, { Component } from 'react'
import { Text, View ,Button } from 'react-native'
import RESTUtils from '../../../utils/ln/RESTUtils'

interface CloseChannelRequest {
  funding_txid_str: string;
  output_index: string;
}

export default class ChannelInfoSceen extends Component {
    constructor(props) {
        super(props)
        console.log(this.props.navigation.getParam('channelInfo'), "+++")
        this.state = {
            channelInfo: this.props.navigation.getParam('channelInfo'),
            node: this.props.navigation.getParam('node')
        }
    }

    closeChannel = async (closeChannelReq: CloseChannelRequest) => {
      let {funding_txid, output_idx} = closeChannelReq;
      let closeChannelArgs = [
        funding_txid,
        output_idx,
        true
      ]
      await RESTUtils.closeChannel(this.state.node, closeChannelArgs)
      .then((resp:any) =>{
        console.log(resp)
      })
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
              <View
              style = {{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}
              >
                  <View
                  style = {{
                      margin: 10
                  }}>
                    <Button
                    title = 'keysend'
                    onPress = {() => {
                      console.log("keysend")
                    }}
                    />
                  </View>

                  <View
                  style = {{
                    margin: 10
                }}>
                    <Button
                    title = 'close channel'
                    onPress = {() => {
                      let [funding_txid, output_idx] = this.state.channelInfo.channel_point.split(':')
                      let req = {
                        funding_txid,
                        output_idx
                      }
                      this.closeChannel(req)
                    }}
                    />
                  </View>
                  
              </View>
            </View>
        )
    }
}