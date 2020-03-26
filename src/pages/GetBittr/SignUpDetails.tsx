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
import VerificationSuccessModalContents from "./VerificationSuccessModalContents";
import InstructionsModalContents from "./InstructionsModalContents";

export default function SignUpDetails(props) {
  const [errorMessage, setErrorMessage] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [VerificationSuccessBottomSheet, setVerificationSuccessBottomSheet] = useState(React.createRef());
  const [InstructionsBottomSheet, setInstructionsBottomSheet] =useState(React.createRef());
  
  const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={`Verification link sent`}
        info={
          'We have sent you a verification link, you will need to verify your details to proceed\n\nPlease check your email\n\n'
        }
        note={emailAddress}
        noteNextLine={mobileNumber}
        proceedButtonText={'Start Over'}
        onPressProceed={() => {
          if (ErrorBottomSheet.current)
            (ErrorBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          if (ErrorBottomSheet.current)
            (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
          bottomImage={require('../../assets/images/icons/errorImage.png')}
      />
    );
  }, []);

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
        info={'Please proceed to find instructions and\nall necessary details to save bitcoins\n\n'}
        note={emailAddress}
        noteNextLine={mobileNumber}
        proceedButtonText={'Continue'}
        onPressProceed={() => {
          
        }}
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
        info={'Please proceed to find instructions and\nall necessary details to save bitcoins\n\n'}
        subInfo={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"}
        proceedButtonText={'Help'}
        bulletPoints={["aliqua. Ut faucibus pulvinar elementum", "neque volutpat. Leo integer malesuada nunc","Purus faucibus ornare suspendisse sed nisi","Et ligula ullamcorper malesuada proin"]}
        onPressProceed={() => {
          
        }}
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

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor1, paddingBottom:wp('10%') }}>
      <StatusBar backgroundColor={Colors.backgroundColor1} barStyle="dark-content" />
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.backgroundColor1 }} />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.textColorGrey}
                size={17}
              />
            </TouchableOpacity>
            <View style={{flex: 1,marginRight: 10, marginBottom: 10}}>
              <Text style={styles.modalHeaderTitleText}>{'Get Bittr'}</Text>
              <Text style={{...styles.modalHeaderSmallTitleText, marginBottom: 10}}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. 
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{ flex: 1, marginTop: 10, marginLeft: 25, marginBottom: 20, marginRight: 20 }}
        >
          <View style={{ ...styles.textBoxView }}>
                    <TextInput
                      style={{
                        ...styles.textBox,
                        paddingRight: 20,
                        marginTop: 10,
                        marginBottom: 10,
                      }}
                      returnKeyLabel="Done"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                      keyboardType={
                        Platform.OS == 'ios'
                          ? 'ascii-capable'
                          : 'visible-password'
                      }
                      placeholder={'Enter email address'}
                      value={emailAddress}
                      onChangeText={value => {
                        setEmailAddress(value)
                      }}
                      placeholderTextColor={Colors.borderColor}
                     />
                  </View>

                  <View style={{ ...styles.textBoxView }}>
                    <TextInput
                      style={{
                        ...styles.textBox,
                        paddingRight: 20,
                        marginTop: 10,
                        marginBottom: 10,
                      }}
                      returnKeyLabel="Done"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                      keyboardType={'numeric'}
                      placeholder={'Enter phone number'}
                      value={mobileNumber}
                      onChangeText={value => {
                        setMobileNumber(value)}
                      }
                      placeholderTextColor={Colors.borderColor}
                     />
                  </View>
        </View>
        <View style={{marginTop: 'auto'}}>
        <BottomInfoBox
        backgroundColor={Colors.white}
        titleColor={Colors.textColorGrey}
        title={"Note"}
        infoText={
          'Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem ipsum dolor'
        }
      />
      </View>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: 'auto',
            marginBottom: hp('5%'),
            marginLeft: wp('8%'),
          }}
        >
          <TouchableOpacity
            onPress={() => {
              (ErrorBottomSheet as any).current.snapTo(1);
            }}
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
              marginLeft: 10
            }}
          >
            <Text>Back</Text>
          </TouchableOpacity>
        </View>
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
      </View>
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
    color: Colors.textColorGrey,
    fontSize: RFValue(17),
    fontFamily: Fonts.FiraSansMedium,
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
});
