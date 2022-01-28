import React, { Component, ReactElement } from "react";
import { Text, View, FlatList, TouchableOpacity, Button } from "react-native";
import RESTUtils from "../../../utils/ln/RESTUtils";
import ChannelItem from "../components/channels/ChannelListComponent";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { inject, observer } from "mobx-react";

interface HTLC {
  hash_lock: string;
  expiration_height: number;
  incoming: boolean;
  amount: string;
}

interface ChannelFrame {
  commit_weight: string;
  local_balance: string;
  commit_fee: string;
  csv_delay: number;
  channel_point: string;
  chan_id: string;
  fee_per_kw: string;
  total_satoshis_received: string;
  pending_htlcs: Array<HTLC>;
  num_updates: string;
  active: boolean;
  remote_balance: string;
  unsettled_balance: string;
  total_satoshis_sent: string;
  remote_pubkey: string;
  capacity: string;
  private: boolean;
  state: string;
  msatoshi_total: string;
  msatoshi_to_us: string;
  channel_id?: string;
  alias?: string;
}
@inject("ChannelsStore")
@observer
export default class ChannelScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(): void {
    this.props.ChannelsStore.getChannels();
  }

  uniqueKey = (item: any, index: number) => index.toString();
  renderTemplate = ({ item }: { item: ChannelFrame }): ReactElement => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate("ChannelInfoScreen", {
            channelInfo: item,
          });
        }}
      >
        <ChannelItem params={item} />
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: "grey",
            marginHorizontal: widthPercentageToDP(4),
          }}
        />
      </TouchableOpacity>
    );
  };

  render() {
    console.log(this.props.ChannelsStore.totalOutbound, "\n----", this.props.ChannelsStore.totalInbound, "\n---", this.props.ChannelsStore.totalOffline)
    return (
      <View>
        <Button
          title="Open Channel"
          onPress={() => {
            this.props.navigation.navigate("ChannelOpenScreen");
          }}
        />
        <View>
          <Text>Total Inbound : {this.props.ChannelsStore.totalOutbound}</Text>
          <Text>Total Outbound: {this.props.ChannelsStore.totalInbound}</Text>
          <Text>Total offline: {this.props.ChannelsStore.totalOffline}</Text>
        </View>
        {this.props.ChannelsStore.loading ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            style={{
              margin: 5,
            }}
            data={this.props.ChannelsStore.channels}
            renderItem={this.renderTemplate}
            keyExtractor={this.uniqueKey}
          />
        )}
      </View>
    );
  }
}
