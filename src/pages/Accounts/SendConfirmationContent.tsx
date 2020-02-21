import React, { useState } from "react";
import {
  View, Image, Text, StyleSheet, SafeAreaView,
  StatusBar, Platform
} from "react-native";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import commonStyle from "../../common/Styles";
import { AppBottomSheetTouchableWrapper } from "../../components/AppBottomSheetTouchableWrapper";

import DeviceInfo from 'react-native-device-info';

export default function SendConfirmationContent(props) {
  return (
    <View style={{ height:'100%', backgroundColor:Colors.white }}>
        <View style={{ ...styles.successModalHeaderView, marginRight: wp("8%"), marginLeft: wp("8%") }} >
            <Text style={styles.modalTitleText}>
                {props.title}
            </Text>
            <Text style={{ ...styles.modalInfoText, marginTop: wp("1%") }}>
                {props.info}
            </Text>
        </View>
        { props.isUnSuccess ? 
            <View style={{ flex: 1, marginTop:hp('5%'), marginBottom:hp('2%')}}>
                {/* <Text style={{marginRight: wp("8%"), marginLeft: wp("8%"), color: Colors.textColorGrey, fontSize: RFValue(11), fontFamily: Fonts.FiraSansRegular}}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
                </Text> */}
            </View> : 
            <View style={{ flex: 1, marginTop:hp('2%'), marginBottom:hp('2%')}}>
                { props.isFromContact ? 
                    <View style={styles.box}>
                        <View style={{ flexDirection: "row", alignItems: "center"}}>
                            <Image
                                style={styles.successModalAmountImage}
                                source={require("../../assets/images/icons/icon_wallet.png")}
                            />
                            <Text style={styles.successModalWalletNameText}>
                            {props.userInfo.to}
                            </Text>
                        </View>
                    </View>
                    : null
                }
                    {!props.isFromContact ? <View style={styles.sendSuccessView}>
                        <View style={{flex: 3}}>
                            <Text style={styles.sendSuccessInfoTitle}>
                                To: 
                            </Text>
                        </View>
                        <View style={{flex: 6}}>
                            <Text style={{ ...styles.sendSuccessInfoTitle, fontFamily: Fonts.FiraSansMediumItalic }} numberOfLines={1} >
                                {props.userInfo.to}
                            </Text>
                        </View>
                    </View> : null
                    }
                    <View style={styles.sendSuccessView}>
                        <View style={{flex: 3}}>
                            <Text style={styles.sendSuccessInfoTitle}>
                                From: 
                            </Text>
                        </View>
                        <View style={{flex: 6}}>
                            <Text style={{ ...styles.sendSuccessInfoTitle, fontFamily: Fonts.FiraSansMediumItalic }} numberOfLines={1} >
                                {props.userInfo.from}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.sendSuccessView}>
                        <View style={{flex: 3}}>
                            <Text style={styles.sendSuccessInfoTitle}>
                                Amount: 
                            </Text>
                        </View>
                        <View style={{flex: 6}}>
                            <Text style={{ ...styles.sendSuccessInfoTitle, fontFamily: Fonts.FiraSansMediumItalic }} numberOfLines={1} >
                                {props.userInfo.amount}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.sendSuccessView}>
                        <View style={{flex: 3}}>
                            <Text style={styles.sendSuccessInfoTitle}>
                                Fee: 
                            </Text>
                        </View>
                        <View style={{flex: 6}}>
                            <Text style={{ ...styles.sendSuccessInfoTitle, fontFamily: Fonts.FiraSansMediumItalic }} numberOfLines={1} >
                                {props.userInfo.fee}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.sendSuccessView}>
                        <View style={{flex: 3}}>
                            <Text style={styles.sendSuccessInfoTitle}>
                                Total: 
                            </Text>
                        </View>
                        <View style={{flex: 6}}>
                            <Text style={{ ...styles.sendSuccessInfoTitle, fontFamily: Fonts.FiraSansMediumItalic }} numberOfLines={1} >
                                {props.userInfo.total}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.sendSuccessView}>
                        <View style={{flex: 3}}>
                            <Text style={styles.sendSuccessInfoTitle}>
                                Est. Delivery Time: 
                            </Text>
                        </View>
                        <View style={{flex: 6}}>
                            <Text style={{ ...styles.sendSuccessInfoTitle, fontFamily: Fonts.FiraSansMediumItalic }} numberOfLines={1} >
                                {props.userInfo.estDeliveryTime}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.sendSuccessView}>
                        <View style={{flex: 3}}>
                            <Text style={styles.sendSuccessInfoTitle}>
                                Description: 
                            </Text>
                        </View>
                        <View style={{flex: 6}}>
                            <Text style={{ ...styles.sendSuccessInfoTitle, fontFamily: Fonts.FiraSansMediumItalic }} numberOfLines={2} >
                                {props.userInfo.description}
                            </Text>
                        </View>
                    </View>
                </View>
            }
            <View
                style={{
                flexDirection: "row",
                marginTop: "auto",
                alignItems: "center",
                flex:1,
                marginBottom: Platform.OS=="ios" && DeviceInfo.hasNotch ? hp('1%'): 0
                }}
            >
                <AppBottomSheetTouchableWrapper
                onPress={() => props.onPressOk()}
                style={{ ...styles.successModalButtonView }}
                >
                <Text style={styles.proceedButtonText}>
                    {props.okButtonText}
                </Text>
                </AppBottomSheetTouchableWrapper>
                {props.isCancel && (
                <AppBottomSheetTouchableWrapper
                    onPress={() => props.onPressCancel()}
                    style={{
                    height: wp("13%"),
                    width: wp("35%"),
                    justifyContent: "center",
                    alignItems: "center"
                    }}
                >
                    <Text style={{ ...styles.proceedButtonText, color: Colors.blue }}>
                    {props.cancelButtonText}
                </Text>
                </AppBottomSheetTouchableWrapper>
                )}
                {(props.isSuccess || props.isUnSuccess) && 
                    <Image
                    style={{
                        width: wp("25%"),
                        height: hp("18%"),
                        marginLeft: "auto",
                        resizeMode: "cover"
                    }}
                    source={
                        props.isSuccess
                        ? require("../../assets/images/icons/sendSuccess.png")
                        : require("../../assets/images/icons/sendError.png")
                    }
                    />
                }
            </View>
        </View>
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
    padding: wp("5%"),
  },
  successModalHeaderView: {
    marginBottom: hp("1%"),
    marginTop: hp("1%")
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
    marginRight: wp("8%"), 
    marginLeft: wp("8%"),
    marginBottom:wp('1%'),
    flexDirection: "row"
  },
  sendSuccessInfoTitle: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11)
  }
});
