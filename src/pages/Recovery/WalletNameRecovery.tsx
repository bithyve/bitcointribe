import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar
} from "react-native";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import BottomInfoBox from "../../components/BottomInfoBox";
import DeviceInfo from "react-native-device-info";

export default function WalletNameRecovery(props) {
  const [inputStyle, setInputStyle] = useState(styles.inputBox);
  const [walletName, setWalletName] = useState("");

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
    <KeyboardAvoidingView
      style={styles.modalContentContainer}
      behavior={Platform.OS == "ios" ? "padding" : ""}
      enabled
    >
      <View style={{ height: "100%" }}>
        <View style={{ display: "flex" }}>
          <View
            style={{
              paddingTop: wp("8%"),
              paddingLeft: wp("7%"),
              paddingRight: wp("7%"),
              paddingBottom: wp("8%")
            }}
          >
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(18, 812),
                fontFamily: Fonts.FiraSansMedium,
                marginTop: 10
              }}
            >
              Type in the name{"\n"}of your wallet
            </Text>
            <Text style={{ ...styles.modalInfoText, marginTop: 7 }}>
              Your contacts will see this to{" "}
              <Text
                style={{
                  fontFamily: Fonts.FiraSansMediumItalic,
                  fontWeight: "bold",
                  fontStyle: "italic"
                }}
              >
                identify you
              </Text>
            </Text>
          </View>
          <TextInput
            style={{
              ...inputStyle,
              marginTop: wp("2%"),
              marginLeft: wp("7%"),
              marginRight: wp("7%"),
              marginBottom: wp("10%")
            }}
            placeholder={"Enter a name for wallet"}
            placeholderTextColor={Colors.borderColor}
            value={walletName}
            onChangeText={text => {
              setWalletName(text);
            }}
            onFocus={() => {
              setInputStyle(styles.inputBoxFocused);
            }}
            onBlur={() => {
              setInputStyle(styles.inputBox);
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            marginBottom:
              Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("2%") : 0
          }}
        >
          {walletName ? (
            <TouchableOpacity
              onPress={() =>
                props.navigation.navigate("QuestionRecovery", { walletName })
              }
              style={{ ...styles.proceedButtonView }}
            >
              <Text style={styles.proceedButtonText}>Proceed</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }}>
              <BottomInfoBox
                title={"Name of your existing wallet"}
                infoText={
                  "This can be any name, preferably what you were using for your wallet previously"
                }
              />
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: "100%",
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
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  inputBox: {
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    width: wp("85%"),
    height: 50,
    paddingLeft: 15,
    fontSize: RFValue(13, 812),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular
  },
  inputBoxFocused: {
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    width: wp("85%"),
    height: 50,
    paddingLeft: 15,
    fontSize: RFValue(13, 812),
    color: Colors.textColorGrey,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white,
    fontFamily: Fonts.FiraSansRegular
  },
  proceedButtonView: {
    height: wp("13%"),
    width: wp("30%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.blue,
    marginRight: 20,
    marginLeft: 20
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  }
});
