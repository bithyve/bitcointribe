import React, { useState, useRef } from "react";
import {
  View,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet
} from "react-native";
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import CommonStyle from "../common/Styles";
export default function CustodianRequestOtpModalContents(props) {
  const [passcode, setPasscode] = useState("");
  const inputRef = useRef(null);
  const [scrollViewRef, setscrollViewRef] = useState(React.createRef());

  function onPressNumber(text) {
    let tmpPasscode = passcode;
    if (passcode.length < 6) {
      tmpPasscode += text;
      setPasscode(tmpPasscode);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={CommonStyle.headerContainer}>
        <TouchableOpacity
          style={CommonStyle.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack();
          }}
        >
          <View style={CommonStyle.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
    <View style={styles.modalContentContainer}>
      <View
        ref={scrollViewRef}
        style={{
          marginRight: wp("8%"),
          marginLeft: wp("8%")
        }}
      >
        <View style={{ ...styles.otpRequestHeaderView }}>
          <Text style={styles.modalTitleText}>
            {props.title1stLine}
            {"\n"}
            {props.title2ndLine}
          </Text>
          <Text style={{ ...styles.modalInfoText, marginTop: hp("1.5%") }}>
            {props.info1stLine}
            {"\n"}
            {props.info2ndLine}
          </Text>
        </View>
        <View style={{ marginBottom: hp("2%") }}>
          <View style={styles.passcodeTextInputView}>
            <TextInput
              maxLength={1}
              returnKeyType="done"
              returnKeyLabel="Done"
              keyboardType="number-pad"
              ref={input => {
                this.textInput = input;
              }}
              style={[
                this.textInput && this.textInput.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
                if (value) this.textInput2.focus();
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput.focus();
                }
              }}
              // onFocus={() => {
              // 	if (passcode.length == 0) {
              // 		props.modalRef.current.snapTo(2)
              // 	}
              // }}
              // onBlur={() => {
              // 	if (passcode.length == 0 || passcode.length == 6) {
              // 		props.modalRef.current.snapTo(1)
              // 	}
              // }}
            />

            <TextInput
              maxLength={1}
              returnKeyType="done"
              returnKeyLabel="Done"
              keyboardType="number-pad"
              ref={input => {
                this.textInput2 = input;
              }}
              style={[
                this.textInput2 && this.textInput2.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
                if (value) this.textInput3.focus();
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput.focus();
                }
              }}
              //   onFocus={() => {
              //     props.modalRef.current.snapTo(2);
              //   }}
            />

            <TextInput
              maxLength={1}
              returnKeyType="done"
              returnKeyLabel="Done"
              keyboardType="number-pad"
              ref={input => {
                this.textInput3 = input;
              }}
              style={[
                this.textInput3 && this.textInput3.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
                if (value) this.textInput4.focus();
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput2.focus();
                }
              }}
              //   onFocus={() => {
              //     props.modalRef.current.snapTo(2);
              //   }}
            />

            <TextInput
              maxLength={1}
              returnKeyType="done"
              returnKeyLabel="Done"
              keyboardType="number-pad"
              ref={input => {
                this.textInput4 = input;
              }}
              style={[
                this.textInput3 && this.textInput3.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
                if (value) this.textInput5.focus();
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput3.focus();
                }
              }}
              //   onFocus={() => {
              //     props.modalRef.current.snapTo(2);
              //   }}
            />

            <TextInput
              maxLength={1}
              returnKeyType="done"
              returnKeyLabel="Done"
              keyboardType="number-pad"
              ref={input => {
                this.textInput5 = input;
              }}
              style={[
                this.textInput3 && this.textInput3.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
                if (value) this.textInput6.focus();
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput4.focus();
                }
              }}
              //   onFocus={() => {
              //     props.modalRef.current.snapTo(2);
              //   }}
            />
            <TextInput
              maxLength={1}
              returnKeyType="done"
              returnKeyLabel="Done"
              keyboardType="number-pad"
              ref={input => {
                this.textInput6 = input;
              }}
              style={[
                this.textInput3 && this.textInput3.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput5.focus();
                }
              }}
              //   onFocus={() => {
              //     props.modalRef.current.snapTo(2);
              //   }}
              //   onBlur={() => {
              //     if (passcode.length == 0) {
              //       props.modalRef.current.snapTo(1);
              //     }
              //   }}
            />
          </View>
        </View>
        <View
          style={{
            marginBottom: hp("8%"),
            marginLeft: wp("2%"),
            marginRight: wp("2%")
          }}
        >
          <Text style={{ ...styles.modalInfoText }}>
            {props.subInfo1stLine}
            {"\n"}
            {props.subInfo2ndLine}
          </Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: "auto" }}>
          <TouchableOpacity
            onPress={passcode => props.onPressConfirm(passcode)}
            style={{ ...styles.confirmModalButtonView }}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: "100%",
    backgroundColor: Colors.white,
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: "bold",
    fontSize: RFValue(13, 812)
  },
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp("12%"),
    width: wp("12%"),
    borderRadius: 7,
    borderColor: Colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(13, 812),
    textAlign: "center",
    lineHeight: 18
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: wp("12%"),
    width: wp("12%"),
    borderRadius: 7,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 },
    borderColor: Colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(13, 812),
    textAlign: "center",
    lineHeight: 18
  },
  textStyles: {
    color: Colors.black,
    fontSize: RFValue(13, 812),
    textAlign: "center",
    lineHeight: 18
  },
  textFocused: {
    color: Colors.black,
    fontSize: RFValue(13, 812),
    textAlign: "center",
    lineHeight: 18
  },
  otpRequestHeaderView: {
    marginTop: hp("5%"),
    marginBottom: hp("2%")
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
  confirmModalButtonView: {
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
    alignSelf: "center"
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  passcodeTextInputView: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: hp("2.5%"),
    marginBottom: hp("2.5%")
  }
});
