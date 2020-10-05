import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  AsyncStorage,
  Platform,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import commonStyle from '../../common/Styles/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import {
  transferST3,
  clearTransfer,
  fetchTransactions,
  fetchBalanceTx,
} from '../../store/actions/accounts';
import SendStatusModalContents from '../../components/SendStatusModalContents';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BottomSheet from 'reanimated-bottom-sheet';
import ModalHeader from '../../components/ModalHeader';
import SendConfirmationContent from './SendConfirmationContent';
import { createRandomString } from '../../common/CommonFunctions/timeFormatter';
import moment from 'moment';
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/serviceTypes';
import DeviceInfo from 'react-native-device-info';

export default function TwoFAToken(props) {
  const [Elevation, setElevation] = useState(10);
  const [token, setToken] = useState('');
  const [tokenArray, setTokenArray] = useState(['']);
  const serviceType = props.navigation.getParam('serviceType');
  const recipientAddress = props.navigation.getParam('recipientAddress');
  const [SendUnSuccessBottomSheet, setSendUnSuccessBottomSheet] = useState(
    React.createRef<BottomSheet>(),
  );
  const { transfer, loading } = useSelector(
    (state) => state.accounts[serviceType],
  );
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);

  function onPressNumber(text) {
    let tmpToken = tokenArray;
    if (text) {
      tmpToken.push(text);
    } else {
      tmpToken.pop();
    }
    setTokenArray(tmpToken);
    if (tmpToken.length > 0) {
      setToken(tmpToken.join(''));
    }
  }

  const dispatch = useDispatch();
  const renderSuccessStatusContents = () => (
    <SendStatusModalContents
      title1stLine={'Sent Successfully'}
      title2ndLine={''}
      info1stLine={'bitcoin successfully sent to'}
      info2ndLine={''}
      userName={recipientAddress}
      // modalRef={SendSuccessBottomSheet}
      isSuccess={true}
      onPressViewAccount={() => {
        dispatch(clearTransfer(serviceType));
        // dispatch(fetchTransactions(serviceType));
        dispatch(
          fetchBalanceTx(serviceType, {
            loader: true,
            syncTrustedDerivative:
              serviceType === REGULAR_ACCOUNT || serviceType === SECURE_ACCOUNT
                ? true
                : false,
          }),
        );
        props.navigation.navigate('Accounts');
      }}
      transactionId={transfer.txid}
      transactionDateTime={Date()}
    />
  );

  const storeTrustedContactsHistory = async (details) => {
    if (details && details.length > 0) {
      let IMKeeperOfHistory = JSON.parse(
        await AsyncStorage.getItem('IMKeeperOfHistory'),
      );
      let OtherTrustedContactsHistory = JSON.parse(
        await AsyncStorage.getItem('OtherTrustedContactsHistory'),
      );
      for (let i = 0; i < details.length; i++) {
        const element = details[i];
        if (element.selectedContact.contactName) {
          let obj = {
            id: createRandomString(36),
            title: 'Sent Amount',
            date: moment(Date.now()).valueOf(),
            info: '',
            // 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
            selectedContactInfo: element,
          };
          if (element.selectedContact.isWard) {
            if (!IMKeeperOfHistory) IMKeeperOfHistory = [];
            IMKeeperOfHistory.push(obj);
            await AsyncStorage.setItem(
              'IMKeeperOfHistory',
              JSON.stringify(IMKeeperOfHistory),
            );
          }
          if (
            !element.selectedContact.isWard &&
            !element.selectedContact.isGuardian
          ) {
            if (!OtherTrustedContactsHistory) OtherTrustedContactsHistory = [];
            OtherTrustedContactsHistory.push(obj);
            await AsyncStorage.setItem(
              'OtherTrustedContactsHistory',
              JSON.stringify(OtherTrustedContactsHistory),
            );
          }
        }
      }
    }
  };

  useEffect(() => {
    if (!transfer.txid && transfer.stage3.failed) {
      setTimeout(() => {
        setElevation(0);
      }, 4);
      setTimeout(() => {
        SendUnSuccessBottomSheet.current.snapTo(1);
      }, 2);
    }
    if (transfer.txid) {
      storeTrustedContactsHistory(transfer.details);
    }
  }, [transfer]);

  const renderSendUnSuccessContents = () => {
    return (
      <SendConfirmationContent
        title={'Sent Unsuccessful'}
        info={
          'There seems to be a problem' + '\n' + transfer.stage3.failed
            ? 'Invalid 2FA token, please try again.'
            : 'Something went wrong, please try again.'
        }
        userInfo={transfer.details}
        isFromContact={false}
        okButtonText={'Try Again'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={() => {
          //dispatch(clearTransfer(serviceType));
          if (SendUnSuccessBottomSheet.current)
            SendUnSuccessBottomSheet.current.snapTo(0);
        }}
        onPressCancel={() => {
          //dispatch(clearTransfer(serviceType));
          dispatch(clearTransfer(serviceType));
          if (SendUnSuccessBottomSheet.current)
            SendUnSuccessBottomSheet.current.snapTo(0);
          props.navigation.navigate('Accounts');
        }}
        isUnSuccess={true}
      />
    );
  };

  const renderSendUnSuccessHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          //  dispatch(clearTransfer(serviceType));
          if (SendUnSuccessBottomSheet.current)
            SendUnSuccessBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  if (transfer.txid) {
    if (props.navigation.state.params.onTransactionSuccess)
      props.navigation.state.params.onTransactionSuccess();
    props.navigation.goBack();
  }

  useEffect(() => {
    if (!loading.transfer) {
      setIsConfirmDisabled(false);
    }
  }, [loading.transfer]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={commonStyle.headerContainer}>
        <TouchableOpacity
          style={commonStyle.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack();
          }}
          hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
        >
          <View style={commonStyle.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ ...styles.modalContentContainer, height: '100%' }}>
        <View
          style={{
            marginRight: wp('8%'),
            marginLeft: wp('8%'),
          }}
        >
          <View style={{ ...styles.otpRequestHeaderView }}>
            <Text style={styles.modalTitleText}>
              {'Enter OTP to authenticate'}
            </Text>
            <Text style={{ ...styles.modalInfoText, marginTop: hp('1.5%') }}>
              {
                'Please enter the OTP from the authenticator that you have set up'
              }
            </Text>
          </View>
          <View style={{ marginBottom: hp('2%') }}>
            <View style={styles.passcodeTextInputView}>
              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={(input) => {
                  this.textInput = input;
                }}
                style={[
                  this.textInput && this.textInput.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={(value) => {
                  onPressNumber(value);
                  if (value) this.textInput2.focus();
                }}
                onKeyPress={(e) => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput.focus();
                  }
                }}
              />

              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={(input) => {
                  this.textInput2 = input;
                }}
                style={[
                  this.textInput2 && this.textInput2.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={(value) => {
                  onPressNumber(value);
                  if (value) this.textInput3.focus();
                }}
                onKeyPress={(e) => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput.focus();
                  }
                }}
              />

              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={(input) => {
                  this.textInput3 = input;
                }}
                style={[
                  this.textInput3 && this.textInput3.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={(value) => {
                  onPressNumber(value);
                  if (value) this.textInput4.focus();
                }}
                onKeyPress={(e) => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput2.focus();
                  }
                }}
              />

              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={(input) => {
                  this.textInput4 = input;
                }}
                style={[
                  this.textInput3 && this.textInput3.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={(value) => {
                  onPressNumber(value);
                  if (value) this.textInput5.focus();
                }}
                onKeyPress={(e) => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput3.focus();
                  }
                }}
              />

              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={(input) => {
                  this.textInput5 = input;
                }}
                style={[
                  this.textInput3 && this.textInput3.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={(value) => {
                  onPressNumber(value);
                  if (value) this.textInput6.focus();
                }}
                onKeyPress={(e) => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput4.focus();
                  }
                }}
              />
              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={(input) => {
                  this.textInput6 = input;
                }}
                style={[
                  this.textInput3 && this.textInput3.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={(value) => {
                  onPressNumber(value);
                }}
                onKeyPress={(e) => {
                  if (e.nativeEvent.key === 'Backspace') {
                    this.textInput5.focus();
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
              {
                'If you have not set up the authenticator yet, please see our FAQ section to see how to do it'
              }
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 'auto' }}>
            <TouchableOpacity
              disabled={isConfirmDisabled}
              onPress={() => {
                setTimeout(() => {
                  setIsConfirmDisabled(true);
                }, 1);
                dispatch(transferST3(serviceType, token));
              }}
              style={{
                ...styles.confirmModalButtonView,
                elevation: Elevation,
                backgroundColor: isConfirmDisabled
                  ? Colors.lightBlue
                  : Colors.blue,
              }}
            >
              {(!isConfirmDisabled && loading.transfer) ||
              (isConfirmDisabled && loading.transfer) ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('ResetTwoFAHelp');
              }}
              style={{
                width: wp('30%'),
                height: wp('13%'),
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                marginLeft: 5,
              }}
            >
              <Text
                style={{
                  color: Colors.blue,
                  fontSize: RFValue(13),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Need Help?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* <View
          style={{
            alignItems: 'center',
            marginBottom: 200,
            marginTop: 200,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('LostTwoFA');
            }}
          >
            <Text>I am having problems with my 2FA</Text>
          </TouchableOpacity>
        </View> */}
        <BottomSheet
          onCloseStart={() => {
            SendUnSuccessBottomSheet.current.snapTo(0);
          }}
          onCloseEnd={() => setElevation(10)}
          enabledInnerScrolling={true}
          ref={SendUnSuccessBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('70%'),
          ]}
          renderContent={renderSendUnSuccessContents}
          renderHeader={renderSendUnSuccessHeader}
        />
      </View>
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
