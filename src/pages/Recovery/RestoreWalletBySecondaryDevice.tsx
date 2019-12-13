import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import Fonts from "../../common/Fonts";
import Colors from "../../common/Colors";
import CommonStyles from "../../common/Styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import HeaderTitle from "../../components/HeaderTitle";
import BottomInfoBox from "../../components/BottomInfoBox";
import CopyThisText from "../../components/CopyThisText";
import KnowMoreButton from "../../components/KnowMoreButton";
import { useDispatch, useSelector } from "react-redux";
import { requestShare } from "../../store/actions/sss";
import QRCode from "react-native-qrcode-svg";

export default function RestoreWalletBySecondaryDevice(props) {
  const [secondaryQR, setSecondaryQR] = useState("");

  const walletName = props.navigation.getParam("walletName");
  const { RECOVERY_SHARES } = useSelector(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );

  const { REQUEST_DETAILS } = RECOVERY_SHARES[0]
    ? RECOVERY_SHARES[0]
    : { REQUEST_DETAILS: null };

  REQUEST_DETAILS && !secondaryQR
    ? setSecondaryQR(
        JSON.stringify({
          ...REQUEST_DETAILS,
          type: "secondaryDeviceQR"
        })
      )
    : null;

  const dispatch = useDispatch();
  useEffect(() => {
    if (!REQUEST_DETAILS) dispatch(requestShare(walletName, 0));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.navigate("RestoreSelectedContactsList");
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
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == "ios" ? "padding" : ""}
          enabled
        >
          <View style={{ flex: 2 }}>
            <HeaderTitle
              isKnowMoreButton={true}
              onPressKnowMore={() => {}}
              firstLineTitle={"Restore wallet using"}
              secondLineTitle={"Secondary Device"}
              infoTextNormal={
                "Use the Recover Secret stored in your secondary device. "
              }
              infoTextBold={"you will need to have the other device with you"}
            />
          </View>
          <View
            style={{ flex: 4, alignItems: "center", justifyContent: "center" }}
          >
            {!secondaryQR ? (
              <ActivityIndicator size="large" />
            ) : (
              <QRCode value={secondaryQR} size={hp("27%")} />
            )}
            {secondaryQR ? <CopyThisText text={secondaryQR} /> : null}
          </View>
          <View style={{ flex: 2, justifyContent: "flex-end" }}></View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    color: Colors.blue,
    fontSize: RFValue(25, 812),
    marginLeft: 15,
    marginBottom: 5,
    fontFamily: Fonts.FiraSansRegular
  },
  labelStyle: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12, 812),
    marginLeft: 15,
    fontFamily: Fonts.FiraSansRegular
  },
  bottomNoteText: {
    color: Colors.blue,
    fontSize: RFValue(13, 812),
    marginBottom: 5,
    fontFamily: Fonts.FiraSansRegular
  },
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  buttonView: {
    height: wp("13%"),
    width: wp("30%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.blue
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  bottomButtonView: {
    flexDirection: "row",
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 40,
    paddingTop: 30,
    alignItems: "center"
  },
  statusIndicatorView: {
    flexDirection: "row",
    marginLeft: "auto"
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5
  },
  addressView: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: "center"
  },
  addressText: {
    fontSize: RFValue(13, 812),
    color: Colors.lightBlue
  },
  copyIconView: {
    width: 48,
    height: 50,
    backgroundColor: Colors.borderColor,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  }
});
