import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  TextInput,
  Keyboard,
  ScrollView,
  Linking,
  AsyncStorage,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import DeviceInfo from 'react-native-device-info';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import BottomInfoBox from '../../components/BottomInfoBox';
import ModalHeader from '../../components/ModalHeader';
import ErrorModalContents from '../../components/ErrorModalContents';
import VerificationSuccessModalContents from './VerificationSuccessModalContents';
import InstructionsModalContents from './InstructionsModalContents';
import { useDispatch, useSelector } from 'react-redux';
import { sendEmailRequest, sendSmsRequest, verifyEmailRequest, sentEmailRequest, verifiedEmail, sentSmsRequest } from '../../store/actions/bittr';
import { validateEmail } from '../../common/CommonFunctions';
import OtpModalContents from "./OtpModalContents";

export default function SignUpDetails(props) {
  const [isIncorrectOtp, setIsIncorrectOtp] = useState(false)
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [
    VerificationSuccessBottomSheet,
    setVerificationSuccessBottomSheet,
  ] = useState(React.createRef());
  const [InstructionsBottomSheet, setInstructionsBottomSheet] = useState(
    React.createRef(),
  );
  const bitcoinAddress = props.navigation.state.params
    ? props.navigation.state.params.address
    : '';
  const selectedAccount = props.navigation.state.params
    ? props.navigation.state.params.selectedAccount
    : '';
    const EmailTokenNavigate = props.navigation.state.params ? props.navigation.state.params.EmailToken : '';
  const [OTPBottomSheet, setOTPBottomSheet] = useState(React.createRef());
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const [errorProceedButton, setErrorProceedButton] = useState('');
  const [errorIgnoreButton, setErrorIgnoreButton] = useState('');
  const [isIgnoreButton, setIsIgnoreButton] = useState(false);
  const [buttonDisable, setButtonDisable] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [passcode, setPasscode] = useState([]);

  const smsSent = useSelector(state => state.bittr);
  const emailSent = useSelector(state => state.bittr);
  const emailVerified = useSelector(state => state.bittr);
  const emailVerifiedDetails = useSelector(state => state.bittr.emailVerifiedDetails);
  const smsSentDetails = useSelector(state => state.bittr.smsSentDetails);
  const dispatch = useDispatch();
  function onPressNumber(text, i) {
    let tempPasscode = passcode;
    tempPasscode[i] = text;
    setPasscode(tempPasscode);

    if (passcode.join('').length == 4) {
      props.navigation.navigate('WalletCreationSuccess');
    }
  }

  //TODO: when we handle error add this code
  // 

  useEffect(() => {
    Linking.addEventListener('url', handleDeepLink);
  }, []);

  const handleDeepLink = useCallback(event => {
    const EmailToken = event.url.substr(event.url.lastIndexOf('/') + 1);
    console.log("EmailToken",EmailToken);
    let data = {
      token : EmailToken ? EmailToken : EmailTokenNavigate
    }
    dispatch(verifyEmailRequest(data));
  }, []);

  useEffect(() => {
    (async()=>{
    if(!emailVerified && emailVerifiedDetails && !emailVerifiedDetails.success){
      setTimeout(() => {
          setErrorMessageHeader(`Verification link\nhas expired`);
          setErrorMessage(
            'The Verification link has expired,\nplease start over again'
          );
          setErrorProceedButton('Try Again');
          setIsIgnoreButton(true);
           setErrorIgnoreButton('Back')
        }, 2);
        (ErrorBottomSheet as any).current.snapTo(1);
    } else {
      if(emailVerified && emailVerifiedDetails && emailVerifiedDetails.success){
        let mobileNumber = await AsyncStorage.getItem('MobileNo');
        console.log("mobileNumber", mobileNumber);
        let contactData = {
          phone: mobileNumber,
          country_code: '91',
        };
        dispatch(sendSmsRequest(contactData));
        dispatch(verifiedEmail());
      }
    }})(); 
  }, [emailVerified, emailVerifiedDetails]);

  useEffect(() => {
    if (smsSent.smsSent && smsSentDetails && smsSentDetails.success) {
      console.log("smsSent.smsSent", smsSent.smsSent);
      (OTPBottomSheet as any).current.snapTo(1);
      dispatch(sentSmsRequest());
    }
  }, [smsSent]);
  
  useEffect(() => {
    if (emailSent.emailSent) {
      setTimeout(() => {
        setErrorMessageHeader(`Verification link sent`);
        setErrorMessage(
          'We have sent you a verification link, you will need to verify your details to proceed\n\nPlease check your email',
        );
        setErrorProceedButton('Start Over');
      }, 2);
      console.log('emailSent', emailSent, smsSent);
      dispatch(sentEmailRequest());
      (ErrorBottomSheet as any).current.snapTo(1);
    }
  }, [emailSent]);

  const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        note={emailAddress}
        noteNextLine={mobileNumber}
        proceedButtonText={errorProceedButton}
        headerTextColor={Colors.black1}
        buttonTextColor={Colors.buttonText}
        buttonColor={Colors.yellow}
        buttonShadowColor={Colors.shadowYellow}
        onPressProceed={() => {
          if (ErrorBottomSheet.current)
            (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isIgnoreButton={isIgnoreButton}
        cancelButtonText={errorIgnoreButton}
        onPressIgnore={() => {
          if (ErrorBottomSheet.current)
            (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/errorImage.png')}
      />
    );
  }, [
    emailAddress,
    mobileNumber,
    errorMessage,
    errorMessageHeader,
    errorProceedButton,
    errorIgnoreButton,
    isIgnoreButton,
  ]);

  useEffect(() => {
    if (emailAddress && mobileNumber) setButtonDisable(false);
  }, [emailAddress, mobileNumber]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderVerificationSuccessContent = useCallback(() => {
    return (
      <VerificationSuccessModalContents
        modalRef={VerificationSuccessBottomSheet}
        title={`Email Address and\nphone number verified`}
        info={
          'Please proceed to find instructions and\nall necessary details to save bitcoins\n\n'
        }
        note={emailAddress}
        noteNextLine={mobileNumber}
        proceedButtonText={'Continue'}
        onPressProceed={() => {}}
        isIgnoreButton={false}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/illustration.png')}
      />
    );
  }, []);

  const renderVerificationSuccessHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (VerificationSuccessBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderInstructionsModalContent = useCallback(() => {
    return (
      <InstructionsModalContents
        modalRef={InstructionsBottomSheet}
        title={`Instructions and\ndetails for transfer`}
        info={
          'Please proceed to find instructions and\nall necessary details to save bitcoins\n\n'
        }
        subInfo={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'
        }
        proceedButtonText={'Help'}
        bulletPoints={[
          'aliqua. Ut faucibus pulvinar elementum',
          'neque volutpat. Leo integer malesuada nunc',
          'Purus faucibus ornare suspendisse sed nisi',
          'Et ligula ullamcorper malesuada proin',
        ]}
        onPressProceed={() => {}}
      />
    );
  }, []);

  const renderInstructionsModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (InstructionsBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderConfirmOTPModalContent = useCallback(() => {
    return (
      <OtpModalContents 
        isIncorrectOtp={isIncorrectOtp}
        onOtpDone={(otpValue)=>{
          if(otpValue!='1111' && otpValue!=""){
            setIsIncorrectOtp(true);
          }
          else{
            setIsIncorrectOtp(false);
          }
          setOtp(otpValue);
        }}
        modalRef={OTPBottomSheet}
        onPressConfirm={()=>{}}
      />
    );
  }, [isIncorrectOtp, otp]);

  const renderConfirmOTPModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (OTPBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor1 }}>
      <StatusBar
        backgroundColor={Colors.backgroundColor1}
        barStyle="dark-content"
      />
      <SafeAreaView
        style={{ flex: 0, backgroundColor: Colors.backgroundColor1 }}
      />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.black1}
                size={17}
              />
            </TouchableOpacity>
            <View style={{ flex: 1, marginRight: 10, marginBottom: 10 }}>
              <Text style={styles.modalHeaderTitleText}>{'Get Bittr'}</Text>
              <Text
                style={{
                  ...styles.modalHeaderSmallTitleText,
                  marginBottom: 10,
                }}
              >
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            marginTop: 10,
            marginLeft: 25,
            marginBottom: 20,
            marginRight: 20,
          }}
        >
          <View style={{ ...styles.textBoxView }}>
            <TextInput
              style={{
                ...styles.textBox,
                paddingRight: 10,
                marginTop: 10,
                marginBottom: 10,
              }}
              autoCapitalize="none"
              returnKeyLabel="Done"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              keyboardType={
                Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
              }
              placeholder={'Enter email address'}
              value={emailAddress}
              onChangeText={value => {
                setEmailAddress(value);
              }}
              placeholderTextColor={Colors.borderColor}
            />
          </View>
          {!isEmailValid ? (
            <View style={{ marginLeft: 'auto' }}>
              <Text style={styles.errorText}>Enter valid email address</Text>
            </View>
          ) : null}
          <View style={{ ...styles.textBoxView }}>
            <TextInput
              style={{
                ...styles.textBox,
                paddingRight: 20,
                marginTop: 10,
                marginBottom: 10,
              }}
              autoCapitalize="none"
              returnKeyLabel="Done"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              keyboardType={'numeric'}
              placeholder={'Enter phone number'}
              value={mobileNumber}
              onChangeText={value => {
                setMobileNumber(value);
              }}
              placeholderTextColor={Colors.borderColor}
            />
          </View>
        </View>
      </View>
      <View style={{ marginTop: 'auto', marginBottom: hp('4%') }}>
        <BottomInfoBox
          backgroundColor={Colors.white}
          titleColor={Colors.black1}
          title={'Note'}
          infoText={
            'Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem ipsum dolor'
          }
        />

        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginLeft: wp('8%'),
          }}
        >
          <TouchableOpacity
            onPress={async() => {
              if (validateEmail(emailAddress)) {
                await AsyncStorage.setItem('MobileNo', mobileNumber);
                setIsEmailValid(true);
                let formData = {
                  email: emailAddress,
                  language: 'en',
                  bitcoin_address: bitcoinAddress,
                  category: 'hexa',
                };
                
                dispatch(sendEmailRequest(formData));
                
              } else {
                setIsEmailValid(false);
              }
            }}
            disabled={buttonDisable}
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
            }}
          >
            <Text>SignUp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack()
            }}
            style={{
              width: wp('20%'),
              height: wp('13%'),
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 10,
            }}
          >
            <Text>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('40%') : hp('45%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />

      <BottomSheet
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('45%') : hp('50%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={VerificationSuccessBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('45%'),
        ]}
        renderContent={renderVerificationSuccessContent}
        renderHeader={renderVerificationSuccessHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={InstructionsBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('55%') : hp('60%'),
        ]}
        renderContent={renderInstructionsModalContent}
        renderHeader={renderInstructionsModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={OTPBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('50%') : hp('55%'),
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('75%') : hp('80%'),
        ]}
        renderContent={renderConfirmOTPModalContent}
        renderHeader={renderConfirmOTPModalHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    marginTop: hp('5%'),
  },
  modalHeaderTitleText: {
    color: Colors.black1,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor1,
    width: '100%',
  },
  modalHeaderSmallTitleText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
  },
});
