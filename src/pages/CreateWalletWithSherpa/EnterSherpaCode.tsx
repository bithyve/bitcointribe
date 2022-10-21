import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Text,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Fonts from "../../common/Fonts";
import Colors from "../../common/Colors";
import CommonStyles from "../../common/Styles/Styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import DeviceInfo from "react-native-device-info";
import HeaderTitle1 from "../../components/HeaderTitle1";
import { LocalizationContext } from "../../common/content/LocContext";
import CheckBox from "../../components/CheckBox/CheckBox";

export default function EnterSherpaCode(props) {
  const [sherpaCode, setSherpaCode] = useState("");
  const [inputStyle, setInputStyle] = useState(styles.inputBox);
  const [CheckTermAndCodition, setCheckTermAndCodition] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const strings = translations["login"];
  const common = translations["common"];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.backgroundColor,
      }}
    >
      <StatusBar
        backgroundColor={Colors.backgroundColor}
        barStyle="dark-content"
      />
      <View
        style={{
          flex: 1,
        }}
      >
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.navigate("WalletInitialization");
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
          style={{
            flex: 1,
          }}
          behavior={Platform.OS == "ios" ? "padding" : ""}
          enabled
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <HeaderTitle1
              secondLineBoldTitle={strings.enterSherpaCode}
              secondLineTitle={""}
              infoTextNormal={strings.enterSherpaCodeParagraph}
              infoTextBold={""}
              infoTextNormal1={""}
              step={""}
            />
            <View style={{ marginTop: hp("5%") }}>
              <TextInput
                style={inputStyle}
                placeholderTextColor={Colors.borderColor}
                value={sherpaCode}
                keyboardType={
                  Platform.OS == "ios" ? "ascii-capable" : "visible-password"
                }
                maxLength={10}
                onChangeText={(text) => {
                  text = text.replace(/[^A-Za-z]/g, "");
                  setSherpaCode(text);
                }}
                onFocus={() => {
                  setInputStyle(styles.inputBoxFocused);
                }}
                onBlur={() => {
                  setInputStyle(styles.inputBox);
                }}
                autoCorrect={false}
                autoCompleteType="off"
              />
              {/* checkbox for terms and condition */}
              <CheckBox
                checkStatus={CheckTermAndCodition}
                setCheckStatus={() =>
                  setCheckTermAndCodition(!CheckTermAndCodition)
                }
                titleText={"Agree to the Sherpa's terms and conditions"}
              />
              <View style={styles.bottomButtonView}>
                {sherpaCode.trim() != "" ? (
                  <View
                    style={{
                      elevation: 10,
                      shadowColor: Colors.shadowBlue,
                      shadowOpacity: 1,
                      shadowOffset: {
                        width: 15,
                        height: 15,
                      },
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                      }}
                      style={styles.buttonView}
                    >
                      <Text style={styles.buttonText}>
                        {common.createWallet}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  labelStyle: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    marginLeft: 20,
    marginBottom: 5,
    fontFamily: Fonts.FiraSansRegular,
  },
  inputBox: {
    borderRadius: 10,
    marginTop: hp("1%"),
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    fontSize: RFValue(13),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: hp(1),
    backgroundColor: Colors.backgroundColor1,
  },
  inputBoxFocused: {
    borderRadius: 10,
    marginTop: hp("1%"),
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    fontSize: RFValue(13),
    color: Colors.textColorGrey,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    backgroundColor: Colors.backgroundColor1,
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: hp(1),
  },
  buttonView: {
    height: wp("13%"),
    width: wp("30%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  bottomButtonView: {
    flexDirection: "row",
    paddingHorizontal: hp(2),
    paddingVertical: DeviceInfo.hasNotch() ? hp(4) : hp(5),
  },
});
