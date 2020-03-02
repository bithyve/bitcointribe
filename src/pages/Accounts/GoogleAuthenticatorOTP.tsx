import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import Fonts from '../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';

const GoogleAuthenticatorOTP = props => {
  const [textInput1Value, setTextInput1Value] = useState('');
  const [textInput2Value, setTextInput2Value] = useState('');
  const [textInput3Value, setTextInput3Value] = useState('');
  const [textInput4Value, setTextInput4Value] = useState('');
  const [textInput5Value, setTextInput5Value] = useState('');
  const [textInput6Value, setTextInput6Value] = useState('');
  const [passcode, setPasscode] = useState([]);
  const correctPasscode = 'AAAAAA';

  function onPressNumber(text, i) {
    let tempPasscode = passcode;
    tempPasscode[i] = text;
    setPasscode(tempPasscode);
    if (passcode.join('').length == 6 && passcode.join('') == correctPasscode) {
      props.navigation.navigate('WalletCreationSuccess');
    }
  }
  
  useEffect(() => {}, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitleText}>{''}</Text>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : ''}
        enabled
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={{ ...styles.modalContentContainer, height: '100%' }}>
            <View style={{ height: '100%' }}>
              <View style={{ marginTop: hp('3.5%'), marginBottom: hp('2%') }}>
                <Text style={styles.commModeModalHeaderText}>
                  {'Enter OTP shown on\nyour Authenticator'}
                </Text>
                <Text style={styles.commModeModalInfoText}>
                  {
                    'This is the authenticator app, like Google Authenticator, that you must have installed on your secondary device'
                  }
                </Text>
              </View>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: hp('5%'),
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingBottom: 20,
                }}
              >
                <View style={{}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(11),
                        fontFamily: Fonts.FiraSansRegular,
                      }}
                    >
                      Enter OTP
                    </Text>
                    {passcode.join('').length == 6 && passcode.join('') != correctPasscode ? (
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
                      maxLength={1}
                      keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                      selectTextOnFocus={true}
                      contextMenuHidden={true}
                      autoFocus = {true}
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
                        value = value.replace(/\s/g, '');
                        setTextInput1Value(value);
                        // console.log("value", "###"+value+"###", value.length)
                        if (value.length >= 1) {
                          onPressNumber(value, 0);
                          this.textInput2.focus();
                        }
                      }}
                      onKeyPress={e => {
                        if (e.nativeEvent.key === 'Backspace') {
                          this.textInput.focus();
                          onPressNumber('', 0);
                        }
                      }}
                      value={passcode[0] && passcode[0].length ? passcode[0] : ""}
                    />
                    <TextInput
                      maxLength={1}
                      keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
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
                        value = value.replace(/\s/g, '');
                        setTextInput2Value(value);
                        if (value.length >= 1) {
                          onPressNumber(value, 1);
                          this.textInput3.focus();
                        }
                      }}
                      onKeyPress={e => {
                        if (e.nativeEvent.key === 'Backspace') {
                          this.textInput.focus();
                          onPressNumber('', 1);
                        }
                      }}
                      value={passcode[1] && passcode[1].length ? passcode[1] : ""}
                    />

                    <TextInput
                      maxLength={1}
                      keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
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
                        value = value.replace(/\s/g, '');
                        setTextInput3Value(value);
                        if (value.length >= 1) {
                          onPressNumber(value, 2);
                          this.textInput4.focus();
                        }
                      }}
                      onKeyPress={e => {
                        if (e.nativeEvent.key === 'Backspace') {
                          this.textInput2.focus();
                          onPressNumber('', 2);
                        }
                      }}
                      value={passcode[2] && passcode[2].length ? passcode[2] : ""}
                    />

                    <TextInput
                      maxLength={1}
                      keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
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
                        value = value.replace(/\s/g, '');
                        setTextInput4Value(value);
                        if (value.length >= 1) {
                          onPressNumber(value, 3);
                          this.textInput5.focus();}
                      }}
                      onKeyPress={e => {
                        if (e.nativeEvent.key === 'Backspace') {
                          this.textInput3.focus();
                          onPressNumber('', 3);
                        }
                      }}
                      value={passcode[3] && passcode[3].length ? passcode[3] : ""}
                    />

                    <TextInput
                      maxLength={1}
                      keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                      selectTextOnFocus={true}
                      contextMenuHidden={true}
                      autoCorrect={false}
                      ref={input => {
                        this.textInput5 = input;
                      }}
                      style={[
                        this.textInput5 && this.textInput5.isFocused()
                          ? styles.textBoxActive
                          : styles.textBoxStyles,
                      ]}
                      onChangeText={value => {
                        value = value.replace(/\s/g, '');
                        setTextInput5Value(value);
                        if (value.length >= 1) {
                          onPressNumber(value,4);
                          this.textInput6.focus();}
                      }}
                      onKeyPress={e => {
                        if (e.nativeEvent.key === 'Backspace') {
                          this.textInput4.focus();
                          onPressNumber('',4);
                        }
                      }}
                      value={passcode[4] && passcode[4].length ? passcode[4] : ""}
                    />
                    <TextInput
                      maxLength={1}
                      keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                      selectTextOnFocus={true}
                      contextMenuHidden={true}
                      autoCorrect={false}
                      ref={input => {
                        this.textInput6 = input;
                      }}
                      style={[
                        this.textInput6 && this.textInput6.isFocused()
                          ? styles.textBoxActive
                          : styles.textBoxStyles,
                      ]}
                      onChangeText={value => {
                        value = value.replace(/\s/g, '');
                        setTextInput6Value(value);
                        if (value.length >= 1) {
                          onPressNumber(value,5);
                          this.textInput6.focus();}
                      }}
                      onKeyPress={e => {
                        if (e.nativeEvent.key === 'Backspace') {
                          this.textInput5.focus();
                          onPressNumber('',5);
                        }
                      }}
                      value={passcode[5] && passcode[5].length ? passcode[5] : ""}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default GoogleAuthenticatorOTP;

const styles = StyleSheet.create({
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  commModeModalHeaderText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansMedium,
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
  contactProfileView: {
    flexDirection: 'row',
    marginLeft: 25,
    marginRight: 25,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('3.5%'),
    marginTop: hp('1.7%'),
  },
  contactProfileImage: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
    borderRadius: 70 / 2,
  },
  contactNameText: {
    color: Colors.black,
    fontSize: RFValue(25),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('30%'),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  passcodeTextInputView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: hp('2.5%'),
    marginBottom: hp('2.5%'),
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
