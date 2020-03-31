import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  Platform
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { AppBottomSheetTouchableWrapper } from "../../components/AppBottomSheetTouchableWrapper";

export default function OtpModalContents(props) {
    const [passcode, setPasscode] = useState([]);
    
    function onPressNumber(text, i) {
        let tempPasscode = passcode;
        tempPasscode[i] = text;
        setPasscode(tempPasscode);
        if (passcode.join('').length == 4 || passcode.join('').length==0) {
            props.onOtpDone(passcode.join(''));
        }
    }

    return (
    <View style={{ backgroundColor: Colors.white, height: '100%', paddingBottom: wp('10%') }}>
        <View style={{ height: '100%', marginRight: wp('4%'), marginLeft: wp('4%'), marginBottom: hp('2%') }}>
          <View style={{ marginTop: wp('5%') }}>
            <Text style={styles.commModeModalHeaderText}>
              {'Enter OTP to\nconfirm phone number'}
            </Text>
            <Text style={{ ...styles.commModeModalInfoText, marginTop: 5 }}>
              {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'}
            </Text>
          </View>
          <View style={{ marginBottom: hp('4%'), paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', marginTop: hp('4.5%'), marginLeft: 25}}>
              {props.isIncorrectOtp ? (
                <Text
                  style={{
                    color: Colors.red,
                    fontSize: RFValue(10),
                    fontFamily: Fonts.FiraSansMediumItalic,
                  }}
                >
                  Incorrect OTP, Try Again
                </Text>
              ) : null}
            </View>
            <View style={styles.passcodeTextInputView}>
              <TextInput
                returnKeyType={"done"}
                maxLength={1}
                keyboardType={'number-pad'}
                selectTextOnFocus={true}
                contextMenuHidden={true}
                autoCorrect={false}
                ref={input => {
                  this.textInput = input;
                }}
                style={[
                  this.textInput && this.textInput.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={value => {
                  onPressNumber(value, 0);
                  if (value.length >= 1) {
                    this.textInput2.focus();
                  }
                }}
                onKeyPress={e => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput.focus();
                    onPressNumber('', 0);
                  }
                }}
                onFocus={() => {
                    if (Platform.OS == "ios") {
                        props.modalRef.current.snapTo(2)
                    }
                }}
                onBlur={() => {
                    if ((passcode.length == 0 || passcode.length == 4) && Platform.OS == "ios") {
                        props.modalRef.current.snapTo(1)
                    }
                }}
              />

              <TextInput
                returnKeyType={"done"}
                maxLength={1}
                keyboardType={'number-pad'}
                selectTextOnFocus={true}
                contextMenuHidden={true}
                autoCorrect={false}
                ref={input => {
                  this.textInput2 = input;
                }}
                style={[
                  this.textInput2 && this.textInput2.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={value => {
                  onPressNumber(value, 1);
                  if (value.length >= 1) this.textInput3.focus();
                }}
                onKeyPress={e => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput.focus();
                    onPressNumber('', 1);
                  }
                }}
                onFocus={() => {
                    if (Platform.OS == "ios") {
                        props.modalRef.current.snapTo(2);
                    }
                }}
              />

              <TextInput
                returnKeyType={"done"}
                maxLength={1}
                keyboardType={'number-pad'}
                selectTextOnFocus={true}
                contextMenuHidden={true}
                autoCorrect={false}
                ref={input => {
                  this.textInput3 = input;
                }}
                style={[
                  this.textInput3 && this.textInput3.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={value => {
                  onPressNumber(value, 2);
                  if (value.length >= 1) this.textInput4.focus();
                }}
                onKeyPress={e => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput2.focus();
                    onPressNumber('', 2);
                  }
                }}
                onFocus={() => {
                    if (Platform.OS == "ios") {
                        props.modalRef.current.snapTo(2);
                    }
                }}
              />

              <TextInput
                returnKeyType={"done"}
                maxLength={1}
                keyboardType={'number-pad'}
                selectTextOnFocus={true}
                contextMenuHidden={true}
                autoCorrect={false}
                ref={input => {
                  this.textInput4 = input;
                }}
                style={[
                  this.textInput4 && this.textInput4.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={value => {
                  onPressNumber(value, 3);
                }}
                onKeyPress={e => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput3.focus();
                    onPressNumber('', 3);
                  }
                }}
                onFocus={() => {
                    if (Platform.OS == "ios") {
                        props.modalRef.current.snapTo(2);
                    }
                }}
                onBlur={() => {
                    if (Platform.OS == "ios" && passcode.length == 0) {
                        props.modalRef.current.snapTo(1);
                    }
                }}
              />
            </View>
            <Text style={styles.commModeModalInfoText}>
              {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt'}
            </Text>
          </View>

          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressConfirm()}
            style={{
              height: wp('13%'),
              width: wp('40%'),
              backgroundColor: Colors.yellow,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
              elevation: 10,
              shadowColor: Colors.shadowYellow,
              shadowOpacity: 1,
              shadowOffset: { width: 15, height: 15 },
              marginRight: 25,
              marginLeft: 25,
            }}
          >
            <Text>Confirm</Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>);
}
const styles = StyleSheet.create({
    commModeModalHeaderText: {
        color: Colors.black1,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(18),
        marginLeft: 25,
        marginRight: 25,
    },
    commModeModalInfoText: {
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(11),
        marginLeft: 25,
        marginRight: 25,
        // marginTop: hp('0.7%')
    },
    passcodeTextInputView: {
        flexDirection: 'row',
        marginTop: hp('1%'),
        marginBottom: hp('4.5%'),
        marginLeft: 25,
    },
    textBoxStyles: {
        borderWidth: 0.5,
        height: wp('12%'),
        width: wp('12%'),
        borderRadius: 7,
        borderColor: Colors.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        marginLeft: 8,
        color: Colors.black,
        fontSize: RFValue(13),
        textAlign: 'center',
        lineHeight: 18,
    },
    textBoxActive: {
        borderWidth: 0.5,
        height: wp('12%'),
        width: wp('12%'),
        borderRadius: 7,
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 3 },
        borderColor: Colors.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        marginLeft: 8,
        color: Colors.black,
        fontSize: RFValue(13),
        textAlign: 'center',
        lineHeight: 18,
    },
});
