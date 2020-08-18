import React from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { AppBottomSheetTouchableWrapper } from "./AppBottomSheetTouchableWrapper";

export default function ExitKeyModal(props) {
  return (
    <View style={styles.modalContentContainer}>
      <View
          style={{
            ...styles.successModalHeaderView,
            marginRight: wp("8%"),
            marginLeft: wp("8%"),
          }}
        >
          <Text style={styles.modalTitleText}>
            {"Sweeping Funds & Using Exit Key"}
          </Text>
          <Text style={{ ...styles.modalInfoText, marginTop: wp("1.5%") }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
          </Text>
        </View>
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
            <View>
            <Text style={styles.successModalHeaderText}>
            Lorem ipsum dolor
            </Text>
            
            <Text style={styles.successModalWalletNameText}>
            Lorem ipsum dolor
            </Text>
            <Text style={styles.successModalHeaderText}>
            Lorem ipsum dolor
            </Text>
            </View>
          </View>
          
        </View>

        <View
            style={{
              marginTop: hp("3%"),
              marginRight: wp("5%"),
              marginLeft: wp("5%"),
            }}
          >
            <Text style={{ ...styles.modalInfoText }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            </Text>
          </View>

        <View
          style={{
            flexDirection: "row",
            marginTop: "auto",
            alignItems: "center",
            marginBottom: hp('2%')
          }}
        >
          <AppBottomSheetTouchableWrapper
            disabled={props.loading}
            onPress={() => {
              props.onPressProceed();
            }}
            style={{ ...styles.successModalButtonView }}
          >
            {props.loading && props.loading==true ? 
              <ActivityIndicator size="small" />
              : <Text style={styles.proceedButtonText}>Proceed</Text>
            }
          </AppBottomSheetTouchableWrapper>
          <AppBottomSheetTouchableWrapper
            disabled={props.loading}
            onPress={() => props.onPressBack()}
            style={{
              height: wp("13%"),
              width: wp("35%"),
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text style={{ ...styles.proceedButtonText, color: Colors.blue }}>
              Back
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    alignSelf: 'center',
    width: '100%',
    backgroundColor: Colors.white,
  },
  box: {
    backgroundColor: Colors.backgroundColor1,
    marginRight: wp("5%"),
    marginLeft: wp("5%"),
    paddingTop: hp("1%"),
    paddingBottom: hp("1%"),
    marginBottom: hp("1%"),
    borderRadius: 10,
    justifyContent: "center"
  },
  successModalHeaderView: {
    marginTop: hp("2%"),
    marginBottom: hp("3%")
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
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: "left"
  },
  successModalHeaderText: {
    color: Colors.black,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: "left",
    paddingBottom: 5,
    paddingTop: 5
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
  }
});
