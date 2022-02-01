import React, { Component, ReactElement } from "react";
import { Text, View, FlatList, TouchableOpacity, Button } from "react-native";
import RESTUtils from "../../../utils/ln/RESTUtils";
import ChannelItem from "../components/channels/ChannelListComponent";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { inject, observer } from "mobx-react";

export default class InvoiceDetailsScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props.navigation.getParam('invoice'), "+++")

    return (
      <View>
          <Text>
              INvoice
          </Text>
      </View>
    );
  }
}
