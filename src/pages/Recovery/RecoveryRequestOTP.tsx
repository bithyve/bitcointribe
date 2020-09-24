import React, { useState, useRef, useEffect,useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Keyboard,
  Platform
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  downloadMShare,
  uploadRequestedShare,
  resetRequestedShareUpload,
  ErrorSending,
  UploadSuccessfully,
} from '../../store/actions/sss';
import { useDispatch, useSelector } from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CommonStyle from '../../common/Styles/Styles';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ErrorModalContents from '../../components/ErrorModalContents';
import ModalHeader from '../../components/ModalHeader';

export default function RecoveryRequestOTP(props) {
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(false);
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [buttonText, setButtonText] = useState('Try again');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const isErrorSendingFailed = useSelector(state => state.sss.errorSending);
  const isUploadSuccessfully = useSelector(state => state.sss.uploadSuccessfully);
  console.log("isErrorSendingFailed", isErrorSendingFailed);
  const recoveryRequest = props.navigation.getParam('recoveryRequest');
  const { requester, rk, otp } = recoveryRequest;
  const [passcode, setPasscode] = useState([]);
  const inputRef = useRef(null);
  const [
    RecoveryRequestRejectedBottomSheet,
    setRecoveryRequestRejectedBottomSheet,
  ] = useState(React.createRef());
  const [
    RecoveryRequestAcceptBottomSheet,
    setRecoveryRequestAcceptBottomSheet,
  ] = useState(React.createRef());
  const [demo, setDemo] = useState(false);

  function onPressNumber(text, i) {
    if (text.length == 6) {
      setTimeout(() => {
      setPasscode(Array.from(text));
      }, 5);
      setDemo(!demo);
      if (passcode.join('').length == 6) {
        Keyboard.dismiss();
      }
    } else {
      let tempPasscode = passcode;
      tempPasscode[i] = Array.from(text)[0];
      setTimeout(() => {
        setPasscode(tempPasscode);
        }, 5);
        setDemo(!demo);
      if (passcode.join('').length == 6) {
        Keyboard.dismiss();
      }
    }
    }

  const dispatch = useDispatch();
  const { loading, requestedShareUpload } = useSelector(state => state.sss);
  // const { UNDER_CUSTODY } = useSelector(
  //   state => state.storage.database.DECENTRALIZED_BACKUP,
  // );

  const onOTPSubmit = () => {
    if (passcode.join('').length !== 6 || !rk) return;
    setIsConfirmDisabled(true);
    dispatch(uploadRequestedShare(requester, rk, passcode.join('')));
  };

  useEffect(() => {
    if (otp) {
      setIsConfirmDisabled(true);
      dispatch(uploadRequestedShare(requester, rk, otp));
    }
  }, []);

  useEffect(() => {
    if (requestedShareUpload[requester]) {
      if (!requestedShareUpload[requester].status) {
        setTimeout(() => {
          setErrorMessageHeader('Error sending Recovery Key');
          setErrorMessage(
            'There was an error while sending your Recovery Key, please try again in a little while',
          );
          setButtonText('Try again');
          setIsConfirmDisabled(false);
        }, 2);
        (ErrorBottomSheet as any).current.snapTo(1);
        //Alert.alert('Upload failed', requestedShareUpload[requester].err);
      } else {
        dispatch(resetRequestedShareUpload());
        setIsConfirmDisabled(false);
        props.navigation.goBack();
      }
    }
  }, [requestedShareUpload]);

  const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
       modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={buttonText}
        onPressProceed={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/errorImage.png')}
      />
    );
  }, [errorMessage,errorMessageHeader,buttonText]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  if(isErrorSendingFailed){
    setTimeout(() => {
      setErrorMessageHeader('Error sending Recovery Key');
      setErrorMessage(
        'There was an error while sending your Recovery Key, please try again in a little while',
      );
      setButtonText('Try again');
    }, 2);
    (ErrorBottomSheet as any).current.snapTo(1);
    dispatch(ErrorSending(null));
  }

  if(isUploadSuccessfully){
    setTimeout(() => {
      setErrorMessageHeader('Sending successful');
      setErrorMessage(
        'The Recovery Key has been sent, the receiver needs to accept ',
      );
      setButtonText('Done');
    }, 2);
    (ErrorBottomSheet as any).current.snapTo(1);
    dispatch(UploadSuccessfully(null));
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
          style={{
            marginRight: wp('8%'),
            marginLeft: wp('8%'),
          }}
        >
          <View style={{ ...styles.otpRequestHeaderView }}>
            <Text style={styles.modalTitleText}>
              Enter OTP to accept request
            </Text>
            <Text style={{ ...styles.modalInfoText, marginTop: hp('1.5%') }}>
              Please enter the 6 digit OTP the owner of the Recovery Key shared with you
            </Text>
          </View>
          <View style={{ marginBottom: hp('2%') }}>
            <View style={styles.passcodeTextInputView}>
             <TextInput
                value={passcode ? passcode[0] : ''}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                selectTextOnFocus={true}
                autoFocus={true}
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
                  console.log('VALUE', value);
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
              />

              <TextInput
                value={passcode ? passcode[1] : ''}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                selectTextOnFocus={true}
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
              />

              <TextInput
                value={passcode ? passcode[2] : ''}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                selectTextOnFocus={true}
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
              />

              <TextInput
                value={passcode ? passcode[3] : ''}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                selectTextOnFocus={true}
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
                  if (value.length >= 1) this.textInput5.focus();
                }}
                onKeyPress={e => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput3.focus();
                    onPressNumber('', 3);
                  }
                }}
              />

              <TextInput
                value={passcode ? passcode[4] : ''}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                selectTextOnFocus={true}
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
                  onPressNumber(value, 4);
                  if (value.length >= 1) this.textInput6.focus();
                }}
                onKeyPress={e => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput4.focus();
                    onPressNumber('', 4);
                  }
                }}
              />
              <TextInput
                value={passcode ? passcode[5] : ''}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                selectTextOnFocus={true}
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
                  onPressNumber(value, 5);
                  if (value.length >= 1) this.textInput6.focus();
                }}
                onKeyPress={e => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput5.focus();
                    onPressNumber('', 5);
                  }
                }}
              />
            </View>
          </View>
          <View
            style={{
              marginBottom: hp('8%'),
              marginLeft: wp('2%'),
              marginRight: wp('2%'),
            }}
          >
            <Text style={{ ...styles.modalInfoText }}>
              The OTP is time sensitive, please be sure to enter the OTP shared within 10 minutes
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 'auto' }}>
            <TouchableOpacity
              disabled={isConfirmDisabled}
              onPress={onOTPSubmit}
              style={{ ...styles.confirmModalButtonView }}
            >
              {isConfirmDisabled ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.confirmButtonText}>Send Recovery Key</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: 'bold',
    fontSize: RFValue(13),
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
  otpRequestHeaderView: {
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
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
  confirmModalButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
  },
  confirmButtonText: {
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
});
