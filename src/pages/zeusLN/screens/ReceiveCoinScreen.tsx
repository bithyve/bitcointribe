import React, { Component } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import RESTUtils from "../../../utils/ln/RESTUtils";
import Fonts from "../../../../src/common/Fonts.js";
import Colors from "../../../../src/common/Colors";
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CommonStyles from '../../../common/Styles/Styles'
import Ionicons from "react-native-vector-icons/Ionicons";
import QR from "react-native-qrcode-svg";
import CopyThisText from "../../../components/CopyThisText";
import { AppBottomSheetTouchableWrapper } from "../../../components/AppBottomSheetTouchableWrapper";
import { RFValue } from "react-native-responsive-fontsize";
import ModalContainer from "../../../components/home/ModalContainer";
import ReceiveAmountContent from "../../../components/home/ReceiveAmountContent";
// import GenerateL2Invoice from "../../../components/home/GenerateL2Invoice";
import { inject, observer } from "mobx-react";
import { ButtonGroup } from "react-native-elements";

@inject("InvoicesStore")
@observer
export default class ReceiveCoinScreen extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedIndex: 0,
      size: this.props.navigation.getParam("size"),
      title: this.props.navigation.getParam("title"),
    };
    this.updateIndex = this.updateIndex.bind(this);
  }

  componentDidMount(): void {
    this.props.InvoicesStore.getNewAddress();
    this.props.InvoicesStore.createInvoice("hello", "0");
  }

  updateIndex(selectedIndex) {
    this.setState({ selectedIndex });
  }

  render() {
    console.log(
      this.props.InvoicesStore.onChainAddress,
      "+_()",
      this.props.InvoicesStore.payment_request
    );
    const buttons = ["OnChain", "lightning"];
    const { selectedIndex } = this.state;

    return (
      <View>
        
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            this.props.navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.blue}
              size={17}
            />
          </View>
        </TouchableOpacity>
        <ButtonGroup
          onPress={this.updateIndex}
          selectedIndex={selectedIndex}
          buttons={buttons}
          containerStyle={{ height: hp("7%") }}
        />
        {selectedIndex === 0 && (
          <View style={styles.containerQrCode}>
            {this.props.InvoicesStore.onChainAddress ? (
              <QR
                logo={require("../../../../src/assets/images/icons/icon_hexa.png")}
                logoSize={50}
                logoMargin={2}
                logoBackgroundColor="white"
                logoBorderRadius={50}
                value={this.props.InvoicesStore.onChainAddress}
                size={this.state.size}
              />
            ) : (
              <Text>Loading..</Text>
            )}
            {this.state.title !== "" && (
              <Text style={styles.textQr}>On Chain Address</Text>
            )}
          </View>
        )}
        {selectedIndex === 1 && (
          <View style={styles.containerQrCode}>
            {this.props.InvoicesStore.payment_request ? (
              <QR
                logo={require("../../../../src/assets/images/icons/icon_hexa.png")}
                logoSize={50}
                logoMargin={2}
                logoBackgroundColor="white"
                logoBorderRadius={50}
                value={this.props.InvoicesStore.payment_request}
                size={this.state.size}
              />
            ) : (
              <Text>Loading..</Text>
            )}
            {this.state.title !== "" && (
              <Text style={styles.textQr}>Lightning Address</Text>
            )}
          </View>       
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerQrCode: {
    backgroundColor: "#e3e3e3",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  textQr: {
    color: "#6c6c6c",
    fontSize: 17,
    textAlign: "center",
    paddingVertical: 7,
  },
  text: {
    justifyContent: "center",
    marginRight: 10,
    marginLeft: 10,
    flex: 1,
  },
  titleText: {
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  selectedView: {
    marginLeft: wp("5%"),
    marginRight: wp("5%"),
    marginBottom: hp(4),
    marginTop: hp(2),
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
});
