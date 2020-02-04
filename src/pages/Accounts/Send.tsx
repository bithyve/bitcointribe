import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Slider from 'react-native-slider';
import { useDispatch, useSelector } from 'react-redux';
import {
  transferST1,
  clearTransfer,
  transferST2,
  fetchTransactions,
  transferST3,
} from '../../store/actions/accounts';
import DeviceInfo from 'react-native-device-info';
import SendStatusModalContents from '../../components/SendStatusModalContents';
import TransparentHeaderModal from '../../components/TransparentHeaderModal';
import BottomSheet from 'reanimated-bottom-sheet';
import CustodianRequestOtpModalContents from '../../components/CustodianRequestOtpModalContents';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/serviceTypes';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import QrCodeModalContents from '../../components/QrCodeModalContents';
// import HealthCheckGoogleAuthModalContents from '../../components/HealthCheckGoogleAuthModalContents';
import AsyncStorage from '@react-native-community/async-storage';
import BottomInfoBox from '../../components/BottomInfoBox';

export default function Send(props) {
  const staticFees = props.navigation.getParam('staticFees');
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const [bottomSheet, setBottomSheet] = useState(React.createRef());
  const getServiceType = props.navigation.state.params.getServiceType
    ? props.navigation.state.params.getServiceType
    : null;
  const serviceType = props.navigation.getParam('serviceType');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('');
  const [description, setDescription] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderValueText, setSliderValueText] = useState('Low Fee');
  const [isSendHelperDone, setIsSendHelperDone] = useState(true);
  // const [SendSuccessBottomSheet, setSendSuccessBottomSheet] = useState(
  //   React.createRef(),
  // );
  const [SendHelperBottomSheet, setSendHelperBottomSheet] = useState(
    React.createRef(),
  );

  const checkNShowHelperModal = async () => {
    let isSendHelperDone = await AsyncStorage.getItem('isSendHelperDone');
    if (!isSendHelperDone && serviceType == TEST_ACCOUNT) {
      await AsyncStorage.setItem('isSendHelperDone', 'true');
      setTimeout(() => {
        setIsSendHelperDone(true);
      }, 10);

      setTimeout(() => {
        SendHelperBottomSheet.current.snapTo(1);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsSendHelperDone(false);
      }, 10);
    }
  };
  const [openmodal, setOpenmodal] = useState('closed');
  useEffect(() => {
    checkNShowHelperModal();
  }, []);

  // const stage2 = () => (
  //   <View style={{ margin: 40 }}>
  //     <Text style={{ marginVertical: 5 }}>Sending to: {recipientAddress}</Text>
  //     <Text style={{ marginVertical: 5 }}>Amount: {amount}</Text>
  //     <Text style={{ marginVertical: 10 }}>
  //       Transaction Fee: {transfer.stage1.fee}
  //     </Text>
  //     {loading.transfer ? (
  //       <ActivityIndicator size="small" style={{ marginVertical: 5 }} />
  //     ) : (
  //       <View>
  //         <Button
  //           title="Send"
  //           onPress={() => {
  //             dispatch(transferST2(serviceType));
  //           }}
  //         />
  //         <Button
  //           title="Cancel"
  //           onPress={() => {
  //             dispatch(clearTransfer(serviceType));
  //           }}
  //         />
  //       </View>
  //     )}
  //   </View>
  // );

  // const renderSuccessStatusContents = () => (
  //   <SendStatusModalContents
  //     title1stLine={'Sent Successfully'}
  //     title2ndLine={''}
  //     info1stLine={'Bitcoins successfully sent to'}
  //     info2ndLine={''}
  //     userName={recipientAddress}
  //     modalRef={SendSuccessBottomSheet}
  //     isSuccess={true}
  //     onPressViewAccount={() => {
  //       dispatch(clearTransfer(serviceType));
  //       dispatch(fetchTransactions(serviceType));
  //       props.navigation.navigate('Accounts');
  //     }}
  //     transactionId={transfer.txid}
  //     transactionDateTime={Date()}
  //   />
  // );

  const dispatch = useDispatch();

  const { transfer, loading, service } = useSelector(
    state => state.accounts[serviceType],
  );

  useEffect(() => {
    if (transfer.executed === 'ST1')
      props.navigation.navigate('Confirmation', {
        serviceType,
        recipientAddress,
        amount,
      });
  }, [transfer]);

  const renderSendHelperContents = () => {
    return (
      <TestAccountHelperModalContents
        topButtonText={`Sending Bitcoins`}
        helperInfo={`When you want to send bitcoins or sats (a very small fraction of a bitcoin), you have to send it to an address of the recipient Pretty much like an email address but one that changes every time you send it to them \n\nFor this you can either scan a QR code from the recipient or enter a very long sequence of numbers and letters which is the recipients bitcoin address`}
        continueButtonText={'Ok, got it'}
        onPressContinue={() => {
          (SendHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };
  const renderSendHelperHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          console.log('isSendHelperDone', isSendHelperDone);
          if (isSendHelperDone) {
            (SendHelperBottomSheet as any).current.snapTo(2);
            setTimeout(() => {
              setIsSendHelperDone(false);
            }, 10);
          } else {
            (SendHelperBottomSheet as any).current.snapTo(0);
          }
        }}
      />
    );
  };

  const getQrCodeData = qrData => {
    console.log('Qrcodedata', qrData);
    setTimeout(() => {
      setQrBottomSheetsFlag(false);
    }, 10);
    setTimeout(() => {
      (bottomSheet as any).current.snapTo(0);
    }, 10);

    setRecipientAddress(qrData);
  };

  const renderContent1 = () => {
    return (
      <QrCodeModalContents
        flag={true}
        modalRef={bottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={qrData => getQrCodeData(qrData)}
      />
    );
  };

  useEffect(() => {
    if (openmodal == 'closed') {
      setTimeout(() => {
        setQrBottomSheetsFlag(false);
      }, 10);
      (bottomSheet as any).current.snapTo(0);
    }
    if (openmodal == 'full') {
      setTimeout(() => {
        setQrBottomSheetsFlag(true);
      }, 10);
      (bottomSheet as any).current.snapTo(1);
    }
  }, [openmodal]);

  function openCloseModal() {
    if (openmodal == 'closed') {
      setOpenmodal('full');
    }
    if (openmodal == 'full') {
      setOpenmodal('closed');
    }
  }

  function renderHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => openCloseModal()}
        style={styles.modalHeaderContainer}
      >
        <View style={styles.modalHeaderHandle} />
        <Text style={styles.modalHeaderTitleText}>QR</Text>
      </TouchableOpacity>
    );
  }

  // const renderHealthCheckGoogleAuthContents = useCallback(() => {
  //   return (
  //     <HealthCheckGoogleAuthModalContents
  //       modalRef={HealthCheckGoogleAuthBottomSheet}
  //       onPressConfirm={() => {
  //         Keyboard.dismiss();
  //         (HealthCheckGoogleAuthBottomSheet as any).current.snapTo(0);
  //         //  (HealthCheckSuccessBottomSheet as any).current.snapTo(1);
  //       }}
  //     />
  //   );
  // }, []);

  // const renderHealthCheckGoogleAuthHeader = useCallback(() => {
  //   return (
  //     <TransparentHeaderModal
  //       onPressheader={() => {
  //         (HealthCheckGoogleAuthBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, []);

  useEffect(() => {
    if (serviceType === SECURE_ACCOUNT) {
      (async () => {
        if (!(await AsyncStorage.getItem('twoFASetup'))) {
          props.navigation.navigate('TwoFASetup', {
            twoFASetup: service.secureHDWallet.twoFASetup,
          });
          await AsyncStorage.setItem('twoFASetup', 'true');
        }
      })();
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalContentContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <ScrollView>
          <TouchableWithoutFeedback onPress={() => {SendHelperBottomSheet.current.snapTo(0)}}>
      
          <View onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeaderTitleView}>
              <View
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (getServiceType) {
                      getServiceType(serviceType);
                    }
                    props.navigation.goBack();
                  }}
                  style={{ height: 30, width: 30, justifyContent: 'center' }}
                >
                  <FontAwesome
                    name="long-arrow-left"
                    color={Colors.blue}
                    size={17}
                  />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitleText}>{'Send'}</Text>
                {serviceType == TEST_ACCOUNT ? (
                  <Text
                    onPress={() => {
                      AsyncStorage.setItem('isSendHelperDone', 'true');
                      SendHelperBottomSheet.current.snapTo(2);
                    }}
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue(12),
                      marginLeft: 'auto',
                    }}
                  >
                    Know more
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={{ paddingLeft: 20, paddingRight: 20 }}>
              <View style={styles.textBoxView}>
                <TextInput
                  // ref={refs => setTextContactNameRef(refs)}
                  style={styles.textBox}
                  placeholder={'Address'}
                  value={recipientAddress}
                  onChangeText={setRecipientAddress}
                  placeholderTextColor={Colors.borderColor}
                  // onFocus={() => {
                  //   props.modalRef.current.snapTo(2);
                  // }}
                  // onBlur={() => {
                  //   if (
                  //     !textAmountRef.isFocused() &&
                  //     !descriptionRef.isFocused()
                  //   ) {
                  //     props.modalRef.current.snapTo(1);
                  //   }
                  // }}
                />
                <TouchableOpacity
                  style={styles.contactNameInputImageView}
                  onPress={() => {
                    (bottomSheet as any).current.snapTo(1);
                    // props.navigation.navigate('QrScanner', {
                    //   scanedCode: getQrCodeData,
                    // });
                  }}
                >
                  <Image
                    style={styles.textBoxImage}
                    source={require('../../assets/images/icons/qr-code.png')}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.textBoxView}>
                <View style={styles.amountInputImage}>
                  <Image
                    style={styles.textBoxImage}
                    source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                  />
                </View>
                <TextInput
                  // ref={refs => setTextAmountRef(refs)}
                  style={{ ...styles.textBox, paddingLeft: 10 }}
                  placeholder={
                    serviceType === TEST_ACCOUNT
                      ? 'Enter Amount in t-sats'
                      : 'Enter Amount in sats'
                  }
                  value={amount}
                  keyboardType={'numeric'}
                  onChangeText={value => setAmount(value)}
                  placeholderTextColor={Colors.borderColor}
                  // onFocus={() => {
                  //   props.modalRef.current.snapTo(2);
                  // }}
                  // onBlur={() => {
                  //   if (
                  //     !descriptionRef.isFocused() &&
                  //     !textContactNameRef.isFocused()
                  //   ) {
                  //     props.modalRef.current.snapTo(1);
                  //   }
                  // }}
                />
              </View>
              <View style={{ ...styles.textBoxView, height: 100 }}>
                <TextInput
                  // ref={refs => setDescriptionRef(refs)}
                  multiline={true}
                  numberOfLines={4}
                  style={{
                    ...styles.textBox,
                    paddingRight: 20,
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                  placeholder={'Description (Optional)'}
                  value={description}
                  onChangeText={setDescription}
                  placeholderTextColor={Colors.borderColor}
                  // onFocus={() => {
                  //   props.modalRef.current.snapTo(2);
                  // }}
                  // onBlur={() => {
                  //   if (
                  //     !textAmountRef.isFocused() &&
                  //     !textContactNameRef.isFocused()
                  //   ) {
                  //     props.modalRef.current.snapTo(1);
                  //   }
                  // }}
                />
              </View>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: Colors.borderColor,
                marginRight: 10,
                marginLeft: 10,
                marginTop: hp('3%'),
                marginBottom: hp('3%'),
              }}
            />
            <View style={{ paddingLeft: 20, paddingRight: 20 }}>
              <Text
                style={{
                  color: Colors.blue,
                  fontSize: RFValue(13),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Transaction Priority
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Set priority for your transaction
              </Text>
              
              <View
                style={{
                  ...styles.textBoxView,
                  flexDirection: 'column',
                  height: 'auto',
                  marginTop: hp('2%'),
                  alignItems: 'center',
                  paddingLeft: 10,
                  paddingRight: 10,
                }}
              >
                <View style={{flexDirection: 'row'}}>
                <Slider
                  style={{ flex: 1, marginRight: 10 }}
                  minimumValue={0}
                  maximumValue={10}
                  step={5}
                  minimumTrackTintColor={Colors.blue}
                  maximumTrackTintColor={Colors.borderColor}
                  thumbStyle={{
                    borderWidth: 5,
                    borderColor: Colors.white,
                    backgroundColor: Colors.blue,
                    height: 30,
                    width: 30,
                    borderRadius: 15,
                  }}
                  trackStyle={{ height: 8, borderRadius: 10 }}
                  thumbTouchSize={{
                    width: 30,
                    height: 30,
                    backgroundColor: 'blue',
                  }}
                  value={sliderValue}
                  onValueChange={value => {
                    {
                      value == 0
                        ? setSliderValueText('Low Fee')
                        : value == 5
                        ? setSliderValueText('In the middle')
                        : setSliderValueText('Fast Transaction');
                    }
                    setSliderValue(value);
                  }}
                />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 10
                  }}
                >
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue(10),
                      fontFamily: Fonts.FiraSansRegular,
                      textAlign: 'center',
                      flex: 1, flexWrap: 'wrap',
                      marginRight: 5
                    }}
                  >
                    {'Low Fee\n'} (
                    {staticFees
                      ? staticFees[
                          sliderValueText === 'Low Fee\n'
                            ? 'low'
                            : sliderValueText === 'In the middle\n'
                            ? 'medium'
                            : 'high'
                        ]
                      : ''}
                    {serviceType === TEST_ACCOUNT ? ' t-sats' : ' sats'})
                  </Text>
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue(10),
                      fontFamily: Fonts.FiraSansRegular,
                      textAlign: 'center',
                      flex: 1, flexWrap: 'wrap',
                      marginRight: 5
                    }}
                  >
                    {'In the middle\n'} (
                    {staticFees
                      ? staticFees[
                          sliderValueText === 'Low Fee\n'
                            ? 'low'
                            : sliderValueText === 'In the middle\n'
                            ? 'medium'
                            : 'high'
                        ]
                      : ''}
                    {serviceType === TEST_ACCOUNT ? ' t-sats' : ' sats'})
                  </Text>
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue(10),
                      fontFamily: Fonts.FiraSansRegular,
                      textAlign: 'center',
                      flex: 1, flexWrap: 'wrap'
                    }}
                  >
                    {'Fast Transaction\n'} (
                    {staticFees
                      ? staticFees[
                          sliderValueText === 'Low Fee'
                            ? 'low'
                            : sliderValueText === 'In the middle'
                            ? 'medium'
                            : 'high'
                        ]
                      : ''}
                    {serviceType === TEST_ACCOUNT ? ' t-sats' : ' sats'})
                  </Text>
                </View>
                </View>
              </View>
            <View
              style={{ paddingLeft: 20, paddingRight: 20, marginTop: hp('5%') }}
            >
              <Text
                style={{
                  color: Colors.blue,
                  fontSize: RFValue(13),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Transaction Fee
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Transaction fee will be calculated in the next step according to
                the amount of money being sent
              </Text>
            </View>
            <View
              style={{
                paddingLeft: 20,
                paddingRight: 20,
                flexDirection: 'row',
                marginTop: hp('5%'),
                marginBottom: hp('5%'),
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  const priority =
                    sliderValueText === 'Low Fee'
                      ? 'low'
                      : sliderValueText === 'In the middle'
                      ? 'medium'
                      : 'high';
                  dispatch(
                    transferST1(serviceType, {
                      recipientAddress,
                      amount: parseInt(amount),
                      priority,
                    }),
                  );
                }}
                disabled={loading.transfer}
                style={{
                  ...styles.confirmButtonView,
                  backgroundColor: Colors.blue,
                  elevation: 10,
                  shadowColor: Colors.shadowBlue,
                  shadowOpacity: 1,
                  shadowOffset: { width: 15, height: 15 },
                }}
              >
                {loading.transfer ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.buttonText}>Confirm</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  ...styles.confirmButtonView,
                  width: wp('30%'),
                }}
                onPress={() => {
                  dispatch(clearTransfer(serviceType));
                  props.navigation.goBack();
                }}
              >
                <Text style={{ ...styles.buttonText, color: Colors.blue }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
            {/* {transfer.executed === 'ST1' ? stage2() : null} */}
            <View
          style={{
            marginBottom: hp('5%'),
          }}
        >
          <BottomInfoBox
            title={'Note'}
            infoText={
              'When you want to send bitcoins, you need the address of the receiver. For this you can either scan a QR code from their wallet/ app or copy address into the address field'
            }
          />
        </View>
        </View>
        </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
        <BottomSheet
          enabledInnerScrolling={true}
          ref={SendHelperBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
            ? hp('15%')
            : Platform.OS == 'android'
            ? hp('16%')
            : hp('15%'),
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('75%'),
          ]}
          renderContent={renderSendHelperContents}
          renderHeader={renderSendHelperHeader}
        />
        <BottomSheet
          onOpenEnd={() => {
            setQrBottomSheetsFlag(true);
          }}
          onCloseEnd={() => {
            setQrBottomSheetsFlag(false);
            (bottomSheet as any).current.snapTo(0);
          }}
          onCloseStart={() => {
            setQrBottomSheetsFlag(false);
          }}
          enabledInnerScrolling={true}
          ref={bottomSheet}
          snapPoints={[0, hp('90%')]}
          renderContent={renderContent1}
          renderHeader={renderHeader}
        />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
  },
  modalHeaderContainer: {
    backgroundColor: Colors.white,
    marginTop: 'auto',
    flex: 1,
    height: Platform.OS == 'ios' ? 45 : 40,
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
    zIndex: 9999,
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 15,
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
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  contactNameInputImageView: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBoxImage: {
    width: wp('6%'),
    height: wp('6%'),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  confirmButtonView: {
    width: wp('50%'),
    height: wp('13%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});
