import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet } from "react-native";
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";

export default function SendStatusModalContents(props) {
  return (
    <View style={{ ...styles.modalContentContainer, height: "100%" }}>
      <View>
        <View
          style={{
            ...styles.successModalHeaderView,
            marginRight: wp("8%"),
            marginLeft: wp("8%")
          }}
        >
          <Text style={styles.modalTitleText}>
            {props.title1stLine}
            {"\n"}
            {props.title2ndLine}
          </Text>
          <Text style={{ ...styles.modalInfoText, marginTop: wp("1.5%") }}>
            {props.info1stLine}
            {props.info2ndLine ? "\n" + props.info2ndLine : ""}
          </Text>
        </View>
        <View style={styles.box}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: hp("2%")
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
            <View style={{}}>
              <Text
                style={{
                  ...styles.sendSuccessInfoTitle,
                  fontFamily: Fonts.FiraSansMediumItalic
                }}
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
        <View
          style={{
            flexDirection: "row",
            marginTop: "auto",
            alignItems: "center"
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: "50%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1
  },
  box: {
    backgroundColor: Colors.backgroundColor1,
    marginRight: wp("5%"),
    marginLeft: wp("5%"),
    paddingTop: hp("2%"),
    marginBottom: hp("3%"),
    borderRadius: 10,
    justifyContent: "center",
    paddingLeft: wp("5%")
  },
  successModalHeaderView: {
    marginTop: hp("5%"),
    marginBottom: hp("3%")
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  successModalAmountView: {
    marginRight: wp("10%"),
    marginLeft: wp("10%")
  },
  successModalWalletNameText: {
    color: Colors.black,
    fontSize: RFValue(25, 812),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: "center"
  },
  successModalAmountImage: {
    width: wp("15%"),
    height: wp("15%"),
    marginRight: 15,
    marginLeft: 10,
    marginBottom: wp("1%"),
    resizeMode: "contain"
  },
  successModalAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(21, 812),
    marginLeft: 5
  },
  successModalAmountUnitText: {
    color: Colors.borderColor,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11, 812)
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
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.blue,
    alignSelf: "center",
    marginLeft: wp("8%")
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  separator: {
    height: 2,
    marginLeft: wp("2%"),
    marginRight: wp("2%"),
    backgroundColor: Colors.borderColor
  },
  sendSuccessView: {
    marginRight: wp("8%"),
    marginLeft: wp("8%"),
    marginBottom: hp("3%"),
    flexDirection: "row"
  },
  sendSuccessInfoTitle: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11, 812)
  }
});
