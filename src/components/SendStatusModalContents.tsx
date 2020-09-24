import React, { useState } from "react";
import {
  View, Image, TouchableOpacity, Text, StyleSheet, SafeAreaView,
  StatusBar
} from "react-native";
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import commonStyle from "../common/Styles/Styles";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function SendStatusModalContents(props) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={commonStyle.headerContainer}>
        <TouchableOpacity
          style={commonStyle.headerLeftIconContainer}
          onPress={() => {
            //props.navigation.goBack();
          }}
        >
          <View style={commonStyle.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
          <View
            style={{
              ...styles.successModalHeaderView,
              flex:1,
              marginRight: wp("8%"),
              marginLeft: wp("8%")
            }}
          >
            <Text style={styles.modalTitleText}>
              {props.title1stLine}
              {"\n"}
              {props.title2ndLine}
            </Text>
            <Text style={{ ...styles.modalInfoText, marginTop: wp("1%") }}>
              {props.info1stLine}
              {props.info2ndLine ? "\n" + props.info2ndLine : ""}
            </Text>
          </View>
          <View style={{ flex: 1, justifyContent:'center'}}>
            <View style={styles.box}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  style={styles.successModalAmountImage}
                  source={require("../assets/images/icons/icon_wallet.png")}
                />
                <Text style={styles.successModalWalletNameText}>
                  {props.userName}
                </Text>
              </View>
            </View>
            {props.isSuccess ? (
              <View style={styles.sendSuccessView}>
                <View style={{}}>
                  <Text style={styles.sendSuccessInfoTitle}>
                    Wallet Transactions Id:{" "}
                  </Text>
                  <Text style={styles.sendSuccessInfoTitle}>Date and Time: </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      ...styles.sendSuccessInfoTitle,
                      fontFamily: Fonts.FiraSansMediumItalic,
                    }}
                    numberOfLines={1}
                  >
                    {props.transactionId}
                  </Text>
                  <Text
                    style={{
                      ...styles.sendSuccessInfoTitle,
                      fontFamily: Fonts.FiraSansMediumItalic
                    }}
                  >
                    {props.transactionDateTime}
                  </Text>
                </View>
              </View>
            ) : (
                <View style={styles.sendSuccessView}>
                  <Text style={{ ...styles.modalInfoText, marginTop: wp("1.5%") }}>
                    {props.subInfo1stLine}
                    {props.subInfo2ndLine ? "\n" + props.subInfo2ndLine : ""}
                  </Text>
                </View>
              )}
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: "auto",
              alignItems: "center",
              flex:1,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                props.isSuccess
                  ? props.onPressViewAccount()
                  : props.onPressTryAgain()
              }
              style={{ ...styles.successModalButtonView }}
            >
              <Text style={styles.proceedButtonText}>
                {props.isSuccess ? "View Account" : "Try Again"}
              </Text>
            </TouchableOpacity>
            {!props.isSuccess && (
              <TouchableOpacity
                onPress={() => props.onPressSkip()}
                style={{
                  height: wp("13%"),
                  width: wp("35%"),
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Text style={{ ...styles.proceedButtonText, color: Colors.blue }}>
                  Skip
              </Text>
              </TouchableOpacity>
            )}
            <Image
              style={{
                width: wp("25%"),
                height: hp("18%"),
                marginLeft: "auto",
                resizeMode: "cover"
              }}
              source={
                props.isSuccess
                  ? require("../assets/images/icons/sendSuccess.png")
                  : require("../assets/images/icons/sendError.png")
              }
            />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.backgroundColor1,
    marginRight: wp("5%"),
    marginLeft: wp("5%"),
    marginBottom: hp("3%"),
    borderRadius: 10,
    justifyContent: "center",
    paddingLeft: wp("5%"),
    paddingRight: wp("5%")
  },
  successModalHeaderView: {
    //marginBottom: hp("1%")
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular
  },
  successModalAmountView: {
    marginRight: wp("10%"),
    marginLeft: wp("10%")
  },
  successModalWalletNameText: {
    color: Colors.black,
    fontSize: RFValue(25),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: "center",
    paddingRight: 10,
    flex: 1
  },
  successModalAmountImage: {
    width: wp("15%"),
    height: wp("15%"),
    marginRight: 15,
    marginLeft: 10,
    // marginBottom: wp("1%"),
    resizeMode: "contain"
  },
  successModalAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(21),
    marginLeft: 5
  },
  successModalAmountUnitText: {
    color: Colors.borderColor,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11)
  },
  successModalAmountInfoView: {
    flex: 0.4,
    marginRight: wp("10%"),
    marginLeft: wp("10%")
  },
  successModalButtonView: {
    height: wp("13%"),
    width: wp("35%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    alignSelf: "center",
    marginLeft: wp("8%")
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium
  },
  separator: {
    height: 2,
    marginLeft: wp("2%"),
    marginRight: wp("2%"),
    backgroundColor: Colors.borderColor
  },
  sendSuccessView: {
    marginRight: wp("6%"),
    marginLeft: wp("6%"),
    flexDirection: "row"
  },
  sendSuccessInfoTitle: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11)
  }
});
