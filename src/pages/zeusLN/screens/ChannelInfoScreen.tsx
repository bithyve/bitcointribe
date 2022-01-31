import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { Text, View, Button, TextInput } from "react-native";
import Toast from "../../../components/Toast";
@inject("ChannelsStore")
@observer
export default class ChannelInfoScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channelInfo: this.props.navigation.getParam("channelInfo"),
      feeForm: false,
      feeValue: null
    };
  }

  closeChannel = (
    channelPoint: string,
    channelId: string,
    satPerByte?: string | null,
    forceClose?: boolean | null
  ) => {
    const { ChannelsStore, navigation } = this.props;

    // lnd
    if (channelPoint) {
      const [funding_txid_str, output_index] = channelPoint.split(":");

      if (satPerByte) {
        ChannelsStore.closeChannel(
          { funding_txid_str, output_index },
          null,
          satPerByte,
          forceClose
        );
      } else {
        ChannelsStore.closeChannel(
          { funding_txid_str, output_index },
          null,
          null,
          forceClose
        );
      }
    } else if (channelId) {
      // c-lightning, eclair
      ChannelsStore.closeChannel(null, channelId, satPerByte, forceClose);
    }

    this.props.navigation.goBack();
    Toast("Channel Close Intitiated");
  };

  render() {
    return (
      <View
        style={{
          margin: 10,
          flex: 1,
          flexDirection: "column",
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>{this.state.channelInfo.remote_pubkey}</Text>
          <Text>local balance: {this.state.channelInfo.local_balance}</Text>

          <Text>remote balance: {this.state.channelInfo.remote_balance}</Text>

          <Text>
            unsettled balance: {this.state.channelInfo.unsettled_balance}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-around",
          }}
        >
          <Text>
            status: {this.state.channelInfo.active ? "active" : "inactive"}
          </Text>
          <Text>
            private: {this.state.channelInfo.private ? "true" : "false"}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              margin: 10,
            }}
          >
            <Button
              title="keysend"
              onPress={() => {}
            />
          </View>


          <View
            style={{
              margin: 10,
            }}
          >
            <Button
              title="set fees"
              onPress={() => {
                if(this.state.feeForm) {
                  this.setState({feeValue: null})
                }
                this.setState({feeForm: !this.state.feeForm})
              }}
            />
            {this.state.feeForm && (<TextInput
            placeholder = {'fees'}
            keyboardType="numeric"
            onChangeText={(value) => {
              this.setState({feeValue: value})
            }}
            />)}
          </View>

          <View
            style={{
              margin: 10,
            }}
          >
            <Button
              title="close channel"
              onPress={() => {
                this.closeChannel(
                  this.state.channelInfo.channel_point,
                  null,
                  this.state.feeValue,
                  true
                );
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}
