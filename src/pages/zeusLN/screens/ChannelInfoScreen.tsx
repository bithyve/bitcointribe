import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import { Text, View ,Button } from 'react-native'
import RESTUtils from '../../../utils/ln/RESTUtils'
import Toast from '../../../components/Toast'

interface CloseChannelRequest {
  funding_txid_str: string;
  output_index: string;
}

@inject('ChannelsStore')
@observer
export default class ChannelInfoSceen extends Component {
    constructor(props) {
        super(props)
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
                      let [funding_txid_str, output_index] = this.state.channelInfo.channel_point.split(':')
                      let req = {funding_txid_str, output_index}
                      this.props.ChannelsStore.closeChannel(this.state.node, req)
                      this.props.navigation.goBack()
                      Toast( 'Channel Close Intitiated' )
                    }}
                    />
                  </View>
                  
              </View>
            </View>
        )
    }
}