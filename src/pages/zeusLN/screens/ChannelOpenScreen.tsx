import React, { Component } from "react";
import {
  Text,
  View,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-paper";
import RESTUtils from "../../../utils/ln/RESTUtils";
import CoveredQRCodeScanner from "../../../components/qr-code-scanning/CoveredQRCodeScanner";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";
import { inject, observer } from "mobx-react";
import Toast from "../../../components/Toast";

@inject("ChannelsStore")
@observer
export default class OpenChannelScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      node: props.navigation.getParam("node"),
      node_pubkey_string:
        "",
      local_funding_amount: "200000",
      min_confs: "1",
      sat_per_byte: "2",
      private: false,
      host: "",
      suggestImport: "",
      utxos: [],
      utxoBalance: 0,
    };
  }

  connectPeer = (request: any) => {
    if (
      request.node_pubkey_string.trim() === "" ||
      request.host.trim() === ""
    ) {
      Toast("All Fields Are Compulsory");
      return;
    }
    if (
      isNaN(request.min_confs) ||
      isNaN(request.local_funding_amount) ||
      isNaN(request.sat_per_byte)
    ) {
      Toast("All Fields Are Compulsory");
      return;
    }

    let finalRequest = {
      node_pubkey_string: this.state.node_pubkey_string,
      sat_per_byte: parseInt(this.state.sat_per_byte),
      min_confs: parseInt(this.state.min_confs),
      private: this.state.private,
      local_funding_amount: this.state.local_funding_amount,
      host: this.state.host,
    };
    this.props.ChannelsStore.connectPeer(finalRequest);
    Toast("Channel Opening Initiated");
  };

  render() {
    const { ChannelsStore } = this.props;
    const {
      connectingToPeer,
      openingChannel,
      connectPeer,
      errorMsgChannel,
      errorMsgPeer,
      peerSuccess,
      channelSuccess,
    } = ChannelsStore;
    return (
      <View
        style={{
          margin: 5,
        }}
      >
        <View
          style={{
            margin: 5,
          }}
        >
          {/* <View style={styles.viewSectionContainer}>
                <CoveredQRCodeScanner
                  containerStyle={styles.qrScannerContainer}
                  onCodeScanned = {(data)=> {
                      let peerInfo = data.data
                      // trigger open channel function
                  }
                }
                />
              </View> */}
        </View>
        <TextInput
          onChangeText={(val) => {
            this.setState({ node_pubkey_string: val });
          }}
          value={this.state.node_pubkey_string}
          placeholder="Node Pubkey"
        />
        <TextInput
          onChangeText={(val) => {
            this.setState({ host: val });
          }}
          value={this.state.host}
          placeholder="Hostname:Port"
        />
        <TextInput
          onChangeText={(val) => {
            this.setState({ local_funding_amount: val });
          }}
          value={this.state.local_funding_amount}
          keyboardType="numeric"
          placeholder="Local Amount"
        />
        <TextInput
          value={this.state.min_confs}
          onChangeText={(val) => {
            this.setState({ min_confs: val });
          }}
          keyboardType="numeric"
          placeholder="Min. Number Of Confirmations"
        />
        <TextInput
          onChangeText={(val) => {
            this.setState({ sat_per_byte: val });
          }}
          value={this.state.sat_per_byte}
          keyboardType="numeric"
          placeholder="Satoshis Per Byte"
        />

        <Button
          title="open channel"
          onPress={() => {
            let request = {
              node_pubkey_string: this.state.node_pubkey_string,
              sat_per_byte: parseInt(this.state.sat_per_byte),
              min_confs: parseInt(this.state.min_confs),
              private: this.state.private,
              local_funding_amount: this.state.local_funding_amount,
              host: this.state.host,
            };
            this.connectPeer(request);
          }}
        />

        <View>
          {(connectingToPeer || openingChannel) && (
            <ActivityIndicator size="large" color="#0000ff" />
          )}
        </View>
      </View>
    );
  }
}
const qrScannerHeight = heightPercentageToDP(35);

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "white",
  },

  viewSectionContainer: {
    marginBottom: 16,
  },
  qrScannerContainer: {
    // width: '100%',
    // maxWidth: qrScannerHeight * ( 1.40 ),
    height: qrScannerHeight,
    marginBottom: 9,
  },
});
