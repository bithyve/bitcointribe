import React, { Component, ReactElement } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";
import openLink from "../../../utils/OpenLink";
import RESTUtils from "../../../utils/ln/RESTUtils";
import ChannelItem from "../components/channels/ChannelListComponent";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { inject, observer } from "mobx-react";
import ListStyles from "../../../common/Styles/ListStyles";
import LabeledBalanceDisplay from "../../../components/LabeledBalanceDisplay";
import moment from "moment";
import Colors from "../../../common/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import Fonts from "../../../common/Fonts";
import TransactionKind from "../../../common/data/enums/TransactionKind";
import TransactionItem from "../components/TransactionItem";

export default class TransactionDetailsScreen extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props.)
    this.state = {
      transaction: this.props.navigation.getParam("transaction"),
      accountShellId: this.props.navigation.getParam("accountShellId"),
    };
  }

  render() {
    console.log(this.props.navigation.getParam("transaction"), "transac");
    return (
      <ScrollView
        contentContainerStyle={styles.rootContainer}
        overScrollMode="never"
        bounces={false}
      >

        <Text style={styles.textHeader}>Transaction Details</Text>


        <View>
          <TransactionItem
            transaction={this.state.transaction}
            accountShellId={this.state.accountShellId}
          ></TransactionItem>
        </View>
        
        <View style={styles.bodySection}>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>Amount</Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {this.state.transaction.amount}
            </Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Transaction ID
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
              onPress={() =>
                openLink(
                  `https://blockstream.info/testnet/tx/${this.state.transaction.tx_hash}`
                )
              }
            >
              {this.state.transaction.tx_hash}
            </Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Destination Adresses
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {JSON.stringify(this.state.transaction.dest_addresses)}
            </Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>Fees</Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {this.state.transaction.total_fees}
            </Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Confirmations
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {this.state.transaction.num_confirmations > 6
                ? "+6"
                : this.state.transaction.num_confirmations}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  rootContainer: {
    flexGrow: 1,
    backgroundColor: Colors.backgroundColor,
  },
  textHeader: {
    fontSize: 24,
    color: Colors.blue,
    marginHorizontal: 20,
    marginVertical: 20,
    fontFamily: Fonts.FiraSansRegular,
  },

  bodySection: {
    marginTop: 24,
    paddingHorizontal: 10,
  },

  lineItem: {
    marginBottom: RFValue(16),
    backgroundColor: "white",
    padding: 10,
    paddingHorizontal: 10,
    elevation: 4,
    borderRadius: 8,
  },

  containerRec: {
    flexDirection: "row",
    alignItems: "center",
  },
});
