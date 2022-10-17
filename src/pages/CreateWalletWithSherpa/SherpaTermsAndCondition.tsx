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

export default function SherpaTermsAndCondition(props) {
  const [Transactions, setTransactions] = useState(false);
  const [Chat, setChat] = useState(false);
  const [FNF, setFNF] = useState(false);
  const [DetachWallet, setDetachWallet] = useState(false);
  const [Gift, setGift] = useState(false);
  const [Others, setOthers] = useState(false);

  const { translations } = useContext(LocalizationContext);
  const strings = translations["login"];
  const common = translations["common"];

  const selectAllTerms = () => {
    setTransactions(true);
    setFNF(true);
    setChat(true);
    setDetachWallet(true);
    setGift(true);
    setOthers(true);
  };

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
              props.navigation.navigate("CreateWalletWithSherpaCode");
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
              secondLineBoldTitle={strings.sherpaTermCondition}
              secondLineTitle={""}
              infoTextNormal={strings.sherpaTermConditionParagraph}
              infoTextBold={""}
              infoTextNormal1={""}
              step={""}
            />
            {/* checkbox List */}
            <View style={{flex: 0.8, marginTop: 20}}>
            <CheckBox
              checkStatus={Transactions}
              setCheckStatus={() => setTransactions(!Transactions)}
              margin={false}
              titleText={"Transactions"}
            />
            <CheckBox
              checkStatus={Chat}
              setCheckStatus={() => setChat(!Chat)}
              margin={false}
              titleText={"Chat"}
            />
            <CheckBox
              checkStatus={FNF}
              setCheckStatus={() => setFNF(!FNF)}
              margin={false}
              titleText={"Friends & Family"}
            />
            <CheckBox
              checkStatus={DetachWallet}
              setCheckStatus={() => setDetachWallet(!DetachWallet)}
              margin={false}
              titleText={"Detach wallet"}
            />
            <CheckBox
              checkStatus={Gift}
              setCheckStatus={() => setGift(!Gift)}
              margin={false}
              titleText={"Gift"}
            />
            <CheckBox
              checkStatus={Others}
              setCheckStatus={() => setOthers(!Others)}
              margin={false}
              titleText={"Others"}
            />
            </View>
            <View style={{ flex: 0.2, flexDirection: "row", alignItems: "center"}}>
              <View style={styles.bottomButtonView}>
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
                      // props.navigation.navigate("EnterSherpaCode");
                    }}
                    style={styles.buttonView}
                  >
                    <Text style={styles.buttonText}>{common.agree}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => selectAllTerms()}>
                <Text style={styles.selectAllText}>Select all</Text>
              </TouchableOpacity>
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
    // paddingVertical: DeviceInfo.hasNotch() ? hp(4) : hp(3),
  },
  selectAllText: {
    color: Colors.darkBlue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});
