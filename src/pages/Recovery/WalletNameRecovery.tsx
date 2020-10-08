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
import commonStyle from "../../common/Styles";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function WalletNameRecovery(props) {
  const [inputStyle, setInputStyle] = useState(styles.inputBox);
  const [walletName, setWalletName] = useState("");

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
    <View style={{ flex: 1 }}>
      <View style={commonStyle.headerContainer}>
      <TouchableOpacity
          style={commonStyle.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack();
          }}
          hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
        >
           <View style={commonStyle.headerLeftIconInnerContainer}>
             <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
           </View>
         </TouchableOpacity>
       </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == "ios" ? "padding" : ""}
        enabled
      >
        <View style={{flex:1}}>
        <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(18),
                fontFamily: Fonts.FiraSansMedium,
                marginLeft: 20, 
              }}
            >
              Type in the name{"\n"}of your wallet
            </Text>
            <Text style={{ ...styles.modalInfoText, marginTop: 7,marginLeft: 20,  }}>
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

          <TextInput
            style={{
              ...inputStyle,
              marginTop: hp("5%"),
              marginLeft: 20, 
              marginRight: 20,
            }}
            keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
            maxLength={20}
            placeholder={"Enter a name for wallet"}
            placeholderTextColor={Colors.borderColor}
            value={walletName}
            onChangeText={text => {
              text = text.replace(/[^A-Za-z]/g, '')
              setWalletName(text)}}
            onFocus={() => {
              setInputStyle(styles.inputBoxFocused);
            }}
            onBlur={() => {
              setInputStyle(styles.inputBox);
            }}
          />
</View>
        
        {walletName ? (
          <View style={styles.bottomButtonView}>
            <TouchableOpacity
              onPress={() =>
                props.navigation.navigate("QuestionRecovery", { walletName })
              }
              style={styles.buttonView}
            >
              <Text style={styles.proceedButtonText}>Proceed</Text>
            </TouchableOpacity>
            </View>
          ) : (
            <View style={{
              flexDirection: "row",
              
              paddingBottom: DeviceInfo.hasNotch() ? 70 : 40,
              paddingTop: 30,
              alignItems: "center",
              }}>
                
              <BottomInfoBox
                title={"Wallet Name"}
                infoText={
                  "Enter a name for your wallet. This need not be the same as the one used previously"
                }
              />
            </View>

          )}
        
      </KeyboardAvoidingView>
    </View>
  </SafeAreaView>
     );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  bottomButtonView: {
    flexDirection: "row",
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: DeviceInfo.hasNotch() ? 70 : 40,
    paddingTop: 30,
    alignItems: "center",
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },
  buttonView: {
    height: wp("13%"),
    width: wp("30%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: Colors.blue
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular
  },
  inputBox: {
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    width: wp("85%"),
    height: 50,
    paddingLeft: 15,
    fontSize: RFValue(13),
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
    fontSize: RFValue(13),
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
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    marginRight: 20,
    marginLeft: 20
  },
  proceedButtonText: {

    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium
  }
});
