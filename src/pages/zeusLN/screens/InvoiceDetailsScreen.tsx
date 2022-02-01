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
import Invoice from "../../../models/Invoice";

export default class TransactionDetailsScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const invoice: Invoice = this.props.navigation.getParam("invoice", null);
    const {
      fallback_addr,
      r_hash,
      isPaid,
      getMemo,
      receipt,
      creation_date,
      description_hash,
      payment_hash,
      r_preimage,
      cltv_expiry,
      expirationDate,
      payment_request,
      bolt11,
    } = invoice;

    const privateInvoice = invoice.private;

    console.log(invoice, "+_+_+");
    return (
      <ScrollView
        contentContainerStyle={styles.rootContainer}
        overScrollMode="never"
        bounces={false}
      >
        <Text style={styles.textHeader}>Invoice Details</Text>

        <View style={styles.bodySection}>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              {isPaid ? "Paid Amount" : "Unpaid Amount"}
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {invoice.getAmount}
            </Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>Memo</Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {getMemo}
            </Text>
          </View>

          {!!receipt && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>Receipt</Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {receipt}
              </Text>
            </View>
          )}

          {isPaid && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                Settle Date
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {invoice.settleDate}
              </Text>
            </View>
          )}

          {!!creation_date && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                Creation Date
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {invoice.creationDate}
              </Text>
            </View>
          )}

          {!!expirationDate && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>
                Expiration Date
              </Text>
              <Text
                style={{
                  ...ListStyles.listItemSubtitle,
                  marginBottom: 3,
                }}
              >
                {expirationDate}
              </Text>
            </View>
          )}

          {!!privateInvoice && (
            <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Private Invoice
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {privateInvoice}
            </Text>
          </View>
          )}

          {!!fallback_addr && (
            <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
            Fallback Address
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {fallback_addr}
            </Text>
          </View>
          )}

          {!!cltv_expiry && (
            <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              CLTV Verify
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {cltv_expiry}
            </Text>
          </View>
          )}

          {!!r_hash && typeof r_hash === "string" && (
            <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              R Hash
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {r_hash}
            </Text>
          </View>
          )}

          {!!r_preimage && (
            <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              R Pre-image
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {r_preimage}
            </Text>
          </View>
          )}

          {!!description_hash && (
            <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Description Hash
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {description_hash}
            </Text>
          </View>
          )}

          {!!payment_hash && (
           <View style={styles.lineItem}>
           <Text style={ListStyles.listItemTitleTransaction}>
             Creation Date
           </Text>
           <Text
             style={{
               ...ListStyles.listItemSubtitle,
               marginBottom: 3,
             }}
           >
             {invoice.creationDate}
           </Text>
         </View>
          )}

          {!!payment_request && (
            <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Payment Request
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {payment_request}
            </Text>
          </View>
          )}
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
