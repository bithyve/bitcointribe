import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function TrustedContactRequest(props) {
  const [WrongInputError, setWrongInputError] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);
  const [PhoneNumber, setPhoneNumber] = useState('');
  const [EmailId, setEmailId] = useState('');
  const [onBlurFocus, setOnBlurFocus] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeArray, setPasscodeArray] = useState([]);

  useEffect(() => {
    if (!props.isRequestModalOpened) {
      setWrongInputError('');
      setPhoneNumber('');
      setEmailId('');
      setPasscode('');
      setPasscodeArray([]);
    }
  }, [props.isRequestModalOpened]);

  function onPressNumber(text, i) {
    let tempPasscode = passcodeArray;
    tempPasscode[i] = text;
    setTimeout(() => {
      setPasscodeArray(tempPasscode);
    }, 2);
    if (passcodeArray.join('').length == 6) {
      setPasscode(tempPasscode.join(''));
    }
  }

  useEffect(() => {
    if (!props.inputType) setIsDisabled(false);
    else setIsDisabled(true);
  }, [props.inputType]);

  const getStyle = (i) => {
    if (i == 0) {
      return this.textInput && this.textInput.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles;
    }
    if (i == 1) {
      return this.textInput2 && this.textInput2.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles;
    }
    if (i == 2) {
      return this.textInput3 && this.textInput3.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles;
    }
    if (i == 3) {
      return this.textInput4 && this.textInput4.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles;
    }
    if (i == 4) {
      return this.textInput5 && this.textInput5.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles;
    }
    if (i == 5) {
      return this.textInput6 && this.textInput6.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles;
    }
  };
  const getInputBox = () => {
    if (props.inputType == 'email') {
      return (
        <View style={styles.textboxView}>
          <TextInput
            autoCapitalize={'none'}
            returnKeyLabel="Done"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            keyboardType={'email-address'}
            placeholderTextColor={Colors.borderColor}
            placeholder={`${props.hint.charAt(0)}XXXX@XXX${props.hint.substring(
              1,
            )}.com`}
            onChangeText={(text) => {
              setEmailId(text);
            }}
            style={{ flex: 1, fontSize: RFValue(13) }}
            onFocus={() => {
              if (Platform.OS === 'ios') {
                setOnBlurFocus(true);
                props.bottomSheetRef.snapTo(2);
              }
            }}
            onBlur={() => {
              checkForValidation(EmailId);
              setOnBlurFocus(false);
              props.bottomSheetRef.snapTo(1);
            }}
            value={EmailId}
          />
          {/* <View style={styles.separatorView} />
          <Text
            style={{
              ...styles.countryCodeText,
              color: EmailId ? Colors.textColorGrey : Colors.borderColor,
            }}
          >
            @bithyve.com
          </Text> */}
        </View>
      );
    } else if (props.inputType == 'phone') {
      return (
        <View style={styles.textboxView}>
          {/* <Text
            style={{
              ...styles.countryCodeText,
              color: PhoneNumber ? Colors.textColorGrey : Colors.borderColor,
            }}
          >
            +91
          </Text>
          <View style={styles.separatorView} /> */}
          <TextInput
            keyboardType={'numeric'}
            returnKeyLabel="Done"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            placeholderTextColor={Colors.borderColor}
            placeholder={`${props.hint.charAt(
              0,
            )}XXX XXX X${props.hint.substring(1)}`}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (text.length === 10) checkForValidation(text);
            }}
            style={{ flex: 1 }}
            onFocus={() => {
              if (Platform.OS === 'ios') {
                setOnBlurFocus(true);
                props.bottomSheetRef.snapTo(2);
              }
            }}
            onBlur={() => {
              checkForValidation(PhoneNumber);
              setOnBlurFocus(false);
              props.bottomSheetRef.snapTo(1);
            }}
            value={PhoneNumber}
          />
        </View>
      );
    } else {
      return (
        <View style={{ flexDirection: 'row', marginBottom: wp('5%') }}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            return (
              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                ref={(input) => {
                  if (i == 0) this.textInput = input;
                  if (i == 1) this.textInput2 = input;
                  if (i == 2) this.textInput3 = input;
                  if (i == 3) this.textInput4 = input;
                  if (i == 4) this.textInput5 = input;
                  if (i == 5) this.textInput6 = input;
                }}
                style={getStyle(i)}
                onChangeText={(value) => {
                  if (value && i == 0) {
                    onPressNumber(value, 0);
                    this.textInput2.focus();
                  }
                  if (value && i == 1) {
                    onPressNumber(value, 1);
                    this.textInput3.focus();
                  }
                  if (value && i == 2) {
                    onPressNumber(value, 2);
                    this.textInput4.focus();
                  }
                  if (value && i == 3) {
                    onPressNumber(value, 3);
                    this.textInput5.focus();
                  }
                  if (value && i == 4) {
                    onPressNumber(value, 4);
                    this.textInput6.focus();
                  }
                  if (value && i == 5) {
                    onPressNumber(value, 5);
                    this.textInput6.focus();
                  }
                }}
                onKeyPress={(e) => {
                  if (e.nativeEvent.key === 'Backspace' && i == 0) {
                    this.textInput.focus();
                    onPressNumber('', 0);
                  }
                  if (e.nativeEvent.key === 'Backspace' && i == 1) {
                    this.textInput.focus();
                    onPressNumber('', 1);
                  }
                  if (e.nativeEvent.key === 'Backspace' && i == 2) {
                    this.textInput2.focus();
                    onPressNumber('', 2);
                  }
                  if (e.nativeEvent.key === 'Backspace' && i == 3) {
                    this.textInput3.focus();
                    onPressNumber('', 3);
                  }
                  if (e.nativeEvent.key === 'Backspace' && i == 4) {
                    this.textInput4.focus();
                    onPressNumber('', 4);
                  }
                  if (e.nativeEvent.key === 'Backspace' && i == 5) {
                    this.textInput5.focus();
                    onPressNumber('', 5);
                  }
                }}
                onFocus={() => {
                  if (Platform.OS == 'ios') {
                    if (passcodeArray.length == 0 && i == 0) {
                      props.bottomSheetRef.snapTo(2);
                    } else {
                      props.bottomSheetRef.snapTo(2);
                    }
                  }
                }}
                onBlur={() => {
                  if (Platform.OS == 'ios') {
                    if (
                      (passcodeArray.length == 0 || passcodeArray.length == 6) &&
                      i == 5
                    ) {
                      props.bottomSheetRef.snapTo(1);
                    }
                  }
                }}
              //value={passcodeArray[i] && passcodeArray[i].length ? passcodeArray[i] : ""}
              />
            );
          })}
        </View>
      );
    }
  };

  const checkForValidation = (text) => {
    console.log('TEXT', text.charAt(0) + text.substring(8), props.hint);
    if (props.inputType == 'phone') {
      if (text.length == 0) {
        setWrongInputError('');
        setIsDisabled(true);
      } else if (text.length != 0 && text.length < 10) {
        setWrongInputError('Incorrect Phone Number, try again');
        setIsDisabled(true);
      } else if (!text.match(/^[0-9]+$/)) {
        setWrongInputError('Incorrect Phone Number, try again');
        setIsDisabled(true);
      } else if (
        text.length >= 3 &&
        text.charAt(0) + text.substring(8) != props.hint
      ) {
        setWrongInputError('Incorrect Phone Number, try again');
        setIsDisabled(true);
      } else {
        setWrongInputError('');
        setIsDisabled(false);
      }
    }
    if (props.inputType == 'email') {
      if (text.length == 0) {
        setWrongInputError('Please enter Email, try again');
        setIsDisabled(true);
      } else if (
        text.length >= 3 &&
        text.charAt(0) +
        text.replace('.com', '').slice(text.replace('.com', '').length - 2) !=
        props.hint
      ) {
        setWrongInputError('Incorrect Email, try again');
        setIsDisabled(true);
      } else {
        setWrongInputError('');
        setIsDisabled(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{
        height: '100%',
        backgroundColor: Colors.white,
      }}
      behavior={Platform.OS == 'ios' ? 'padding' : ''}
      enabled
    >
      <ScrollView
        style={{
          ...styles.modalContentContainer,
          paddingBottom: onBlurFocus ? hp('30%') : 0,
        }}
      >
        <View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={styles.successModalHeaderView}>
              {!props.isRecovery ? (
                <Text style={styles.modalTitleText}>
                  {props.isGuardian
                    ? 'Keeper Request'
                    : 'Friends and Family Request'}
                </Text>
              ) : (
                  <Text style={styles.modalTitleText}>Recovery Key Request</Text>
                )}
              <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>
                {props.inputType
                  ? 'Accept the request to add your contact to Friends and Family'
                  : 'Looks like someone wants to be your Keeper'}
              </Text>
            </View>
            <View style={styles.box}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Image
                  style={styles.successModalAmountImage}
                  source={require('../../assets/images/icons/icon_wallet.png')}
                />
                <Text
                  style={{
                    fontSize: RFValue(18),
                    fontFamily: Fonts.FiraSansRegular,
                    color: Colors.blue,
                  }}
                >
                  {props.trustedContactName}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: 0.5,
              backgroundColor: Colors.borderColor,
              marginBottom: hp('3%'),
            }}
          />
          {!props.isQR ? (
            <Text
              style={{
                ...styles.modalTitleText,
                marginLeft: wp('8%'),
                marginRight: wp('8%'),
              }}
            >
              {props.inputType === 'phone'
                ? 'Confirm your mobile number'
                : props.inputType === 'email'
                  ? 'Confirm your email address'
                  : null}
            </Text>
          ) : null}
          {!props.isQR ? (
            <Text
              style={{
                ...styles.modalInfoText,
                marginLeft: wp('8%'),
                marginRight: wp('8%'),
                // marginBottom: wp('8%'),
              }}
            >
              Enter your{' '}
              <Text
                style={{
                  ...styles.modalInfoText,
                  marginLeft: wp('8%'),
                  marginRight: wp('8%'),
                  marginBottom: wp('8%'),
                }}
              >
                {props.inputType === 'phone'
                  ? 'mobile number, '
                  : props.inputType === 'email'
                    ? 'email address, '
                    : 'otp, '}
                <Text style={{ fontFamily: Fonts.FiraSansMediumItalic }}>
                  to accept the request
                </Text>
              </Text>
              {/* <Text style={{ fontFamily: Fonts.FiraSansMediumItalic }}>
                {props.inputType === 'phone'
                  ? `${props.hint.charAt(0)}XXX XXX X${props.hint.substring(1)}`
                  : props.inputType === 'email'
                  ? `${props.hint.charAt(0)}XXXX@XXX${props.hint.substring(
                      1,
                    )}.com`
                  : null}
              </Text> */}
            </Text>
          ) : null}

          {!props.isQR ? (
            <View style={{ marginLeft: wp('8%'), marginRight: wp('8%') }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.inputErrorText}>{WrongInputError}</Text>
              </View>
              {getInputBox()}
            </View>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              marginTop: 'auto',
              alignItems: 'center',
            }}
          >
            <AppBottomSheetTouchableWrapper
              disabled={isDisabled}
              onPress={() => {
                const key =
                  props.inputType === 'phone'
                    ? PhoneNumber
                    : props.inputType === 'email'
                      ? EmailId
                      : passcode.toUpperCase();
                setTimeout(() => {
                  setPhoneNumber('');
                }, 2);
                props.onPressAccept(key);
              }}
              style={{
                ...styles.successModalButtonView,
                backgroundColor: isDisabled ? Colors.lightBlue : Colors.blue,
              }}
            >
              {props.loading && props.loading == true ? (
                <ActivityIndicator size="small" />
              ) : (
                  <Text style={styles.proceedButtonText}>Accept Request</Text>
                )}
            </AppBottomSheetTouchableWrapper>
            <AppBottomSheetTouchableWrapper
              onPress={() => {
                const key =
                  props.inputType === 'phone'
                    ? PhoneNumber
                    : props.inputType === 'email'
                      ? EmailId
                      : null;
                props.onPressReject(key);
              }}
              style={{
                height: wp('13%'),
                width: wp('35%'),
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ ...styles.proceedButtonText, color: Colors.blue }}>
                Reject Request
              </Text>
            </AppBottomSheetTouchableWrapper>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  box: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.shadowBlue,
    marginTop: hp('3%'),
    marginLeft: wp('4%'),
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: 'center',
  },
  successModalHeaderView: {
    flex: 1,
    marginTop: hp('3%'),
    marginBottom: hp('3%'),
    marginLeft: wp('8%'),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  successModalButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    alignSelf: 'center',
    marginLeft: wp('8%'),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  successModalAmountImage: {
    width: wp('10%'),
    height: wp('10%'),
    marginRight: 10,
    marginLeft: 10,
    // marginBottom: wp('1%'),
    resizeMode: 'contain',
  },
  phoneNumberInfoText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    color: Colors.textColorGrey,
    marginBottom: wp('5%'),
  },
  inputErrorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    fontSize: RFValue(10),
    color: Colors.red,
    marginTop: wp('2%'),
    marginBottom: wp('3%'),
    marginLeft: 'auto',
  },
  textboxView: {
    flexDirection: 'row',
    paddingLeft: 15,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
    marginBottom: wp('5%'),
    alignItems: 'center',
  },
  countryCodeText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
    paddingRight: 15,
  },
  separatorView: {
    marginRight: 15,
    height: 25,
    width: 2,
    borderColor: Colors.borderColor,
    borderWidth: 1,
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
  textStyles: {
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  textFocused: {
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
});
