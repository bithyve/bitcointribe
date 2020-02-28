import React, { useState, useEffect, useCallback,useRef } from 'react';
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
  AsyncStorage,
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
  fetchBalance,
  fetchBalanceTx,
  alternateTransferST2,
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
import BottomInfoBox from '../../components/BottomInfoBox';
import SendConfirmationContent from './SendConfirmationContent';
import ModalHeader from '../../components/ModalHeader';

export default function Send(props) {
  const [
    SendConfirmationBottomSheet,
    setSendConfirmationBottomSheet,
  ] = useState(React.createRef());
  const [
    SendSuccessWithAddressBottomSheet,
    setSuccessWithAddressBottomSheet,
  ] = useState(React.createRef());
  const [
    SendUnSuccessWithAddressBottomSheet,
    setUnSuccessWithAddressBottomSheet,
  ] = useState(React.createRef());

  // const [
  //   SendConfirmationWithContactBottomSheet,
  //   setSendConfirmationWithContactBottomSheet,
  // ] = useState(React.createRef());
  // const [
  //   SendSuccessWithContactBottomSheet,
  //   setSuccessWithContactBottomSheet,
  // ] = useState(React.createRef());
  // const [
  //   SendUnSuccessWithContactBottomSheet,
  //   setUnSuccessWithContactBottomSheet,
  // ] = useState(React.createRef());

  const [staticFees, setStaticFees] = useState(
    props.navigation.getParam('staticFees'),
  );
  const serviceType = props.navigation.getParam('serviceType');
  const sweepSecure = props.navigation.getParam('sweepSecure');
  let netBalance = props.navigation.getParam('netBalance');
  const { transfer, loading, service } = useSelector(
    state => state.accounts[serviceType],
  );

  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const [bottomSheet, setBottomSheet] = useState(React.createRef());
  const getServiceType = props.navigation.state.params.getServiceType
    ? props.navigation.state.params.getServiceType
    : null;
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('');
  const [description, setDescription] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderValueText, setSliderValueText] = useState('Low Fee');
  const [isSendHelperDone, setIsSendHelperDone] = useState(true);
  const [isInvalidBalance, setIsInvalidBalance] = useState(false);
  // const [SendSuccessBottomSheet, setSendSuccessBottomSheet] = useState(
  //   React.createRef(),
  // );
  const [SendHelperBottomSheet, setSendHelperBottomSheet] = useState(
    React.createRef(),
  );
  const [isEditable, setIsEditable] = useState(true);

  let userInfo = {
    to: '2MvXh39FM7m5v8GHyQ3eCLi45ccA1pFL7DR',
    from: 'Secure Account',
    amount: '0.00012',
    fee: '0.0001',
    total: 0.00022,
    estDeliveryTime: '2 hours',
    description: '',
  };

  const checkNShowHelperModal = async () => {
    let isSendHelperDone = await AsyncStorage.getItem('isSendHelperDone');
    if (!isSendHelperDone && serviceType == TEST_ACCOUNT) {
      await AsyncStorage.setItem('isSendHelperDone', 'true');
      setTimeout(() => {
        setIsSendHelperDone(true);
      }, 10);

      setTimeout(() => {
        if (SendHelperBottomSheet.current)
          SendHelperBottomSheet.current.snapTo(1);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsSendHelperDone(false);
      }, 10);
    }
  };
  const [openmodal, setOpenmodal] = useState('closed');
  const viewRef = useRef(null);
  const tapSliderHandler = (evt) => {
    if (viewRef.current) {
     
      viewRef.current.measure((fx, fy, width, height, px) => {
        const location = ((evt.nativeEvent.locationX - px) / width);
        console.log("LOCATION", location, evt.nativeEvent.locationX, px, width);
        if(location >= -0.1 && location <= 0.2){
          setSliderValue(0);
        } else if(location >= 0.3 && location <= 0.6){
          setSliderValue(5);
        } else if(location >= 0.7 && location <= 1){
          setSliderValue(10);
        }
        
      });
    }
  };

  useEffect(() => {
    checkNShowHelperModal();
  }, []);

  useEffect(() => {
    if (!staticFees) {
      (async () => {
        const storedStaticFees = await AsyncStorage.getItem('storedStaticFees');
        if (storedStaticFees) {
          const { staticFees, lastFetched } = JSON.parse(storedStaticFees);
          if (Date.now() - lastFetched < 1800000) {
            setStaticFees(staticFees);
            return;
          } // maintaining a half an hour difference b/w fetches
        }

        const instance = service.hdWallet || service.secureHDWallet;
        const staticFees = await instance.getStaticFee();
        setStaticFees(staticFees);
        await AsyncStorage.setItem(
          'storedStaticFees',
          JSON.stringify({ staticFees, lastFetched: Date.now() }),
        );
      })();
    }
  }, []);

  useEffect(() => {
    if (sweepSecure)
      if (netBalance === 0) {
        setAmount(`0`);
      } else {
        setAmount(
          `${netBalance -
            Number(
              staticFees[
                sliderValueText === 'Low Fee'
                  ? 'low'
                  : sliderValueText === 'In the middle'
                  ? 'medium'
                  : 'high'
              ],
            )}`,
        );
      }
  }, [sweepSecure, sliderValueText]);

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

  useEffect(() => {
    if (
      transfer.stage1.failed ||
      transfer.stage2.failed ||
      transfer.stage3.failed
    ) {
      if (SendConfirmationBottomSheet.current)
        SendConfirmationBottomSheet.current.snapTo(0);
      if (SendUnSuccessWithAddressBottomSheet.current)
        SendUnSuccessWithAddressBottomSheet.current.snapTo(1);
      setIsEditable(true);
    } else if (transfer.txid) {
      if (SendConfirmationBottomSheet.current)
        SendConfirmationBottomSheet.current.snapTo(0);
      if (SendSuccessWithAddressBottomSheet.current)
        SendSuccessWithAddressBottomSheet.current.snapTo(1);
    } else if (transfer.executed === 'ST1') {
      if (SendConfirmationBottomSheet.current)
        SendConfirmationBottomSheet.current.snapTo(1);
    } else if (!transfer.txid && transfer.executed === 'ST2') {
      props.navigation.navigate('TwoFAToken', {
        serviceType,
        recipientAddress,
      });
    }
  }, [transfer]);

  const renderSendHelperContents = () => {
    return (
      <TestAccountHelperModalContents
        topButtonText={`Sending Bitcoins`}
        image={require('../../assets/images/icons/send.png')}
        helperInfo={`When you want to send bitcoins or sats, you need the recipient’s bitcoin address\n\nYou can scan this address as a QR code or copy it from the recipient`}
        continueButtonText={'Ok, got it'}
        onPressContinue={() => {
          if (SendHelperBottomSheet.current)
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
          if (isSendHelperDone) {
            if (SendHelperBottomSheet.current)
              (SendHelperBottomSheet as any).current.snapTo(1);
            setTimeout(() => {
              setIsSendHelperDone(false);
            }, 10);
          } else {
            if (SendHelperBottomSheet.current)
              (SendHelperBottomSheet as any).current.snapTo(0);
          }
        }}
      />
    );
  };

  const getQrCodeData = qrData => {
    setTimeout(() => {
      setQrBottomSheetsFlag(false);
      setRecipientAddress(qrData);
    }, 2);
    setTimeout(() => {
      if (bottomSheet.current) (bottomSheet as any).current.snapTo(0);
    }, 10);
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

  function renderHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => {
          setTimeout(() => {
            setQrBottomSheetsFlag(false);
          }, 2);
          if (bottomSheet.current) (bottomSheet as any).current.snapTo(0);
        }}
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

  const renderSendConfirmationContents = () => {
    if (transfer) {
      userInfo = {
        to: recipientAddress,
        from: getAccountFromType(),
        amount: amount,
        fee: transfer.stage1.fee,
        total: parseInt(amount, 10) + parseInt(transfer.stage1.fee, 10),
        estDeliveryTime: timeConvert(transfer.stage1.estimatedBlocks * 10),
        description: description,
      };
    }
    return (
      <SendConfirmationContent
        title={'Send Confirmation'}
        info={'Confirm the follow details'}
        userInfo={userInfo}
        isFromContact={false}
        okButtonText={'Confirm'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={() => {
          if (sweepSecure) {
            dispatch(alternateTransferST2(serviceType));
          } else {
            dispatch(transferST2(serviceType));
          }
        }}
        onPressCancel={() => {
          dispatch(clearTransfer(serviceType));
          if (SendConfirmationBottomSheet.current)
            SendConfirmationBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderSendConfirmationHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          if (SendConfirmationBottomSheet.current) {
            dispatch(clearTransfer(serviceType));
            SendConfirmationBottomSheet.current.snapTo(0);
          }
        }}
      />
    );
  };

  const renderSendSuccessWithAddressContents = () => {
    if (transfer) {
      userInfo = {
        to: recipientAddress,
        from: getAccountFromType(),
        amount: amount,
        fee: transfer.stage1.fee,
        total: parseInt(amount, 10) + parseInt(transfer.stage1.fee, 10),
        estDeliveryTime: timeConvert(transfer.stage1.estimatedBlocks * 10),
        description: description,
      };
    }
    return (
      <SendConfirmationContent
        title={'Sent Successfully'}
        info={'Bitcoins successfully sent to Contact'}
        userInfo={userInfo}
        isFromContact={false}
        okButtonText={'View Account'}
        cancelButtonText={'Back'}
        isCancel={false}
        onPressOk={() => {
          dispatch(clearTransfer(serviceType));
          dispatch(
            fetchBalanceTx(serviceType, {
              loader: true,
            }),
          );
          if (SendSuccessWithAddressBottomSheet.current)
            SendSuccessWithAddressBottomSheet.current.snapTo(0);
          props.navigation.navigate('Accounts');
        }}
        isSuccess={true}
      />
    );
  };

  const renderSendSuccessWithAddressHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          dispatch(clearTransfer(serviceType));
          dispatch(
            fetchBalanceTx(serviceType, {
              loader: true,
            }),
          );
          if (SendSuccessWithAddressBottomSheet.current)
            SendSuccessWithAddressBottomSheet.current.snapTo(0);
          props.navigation.navigate('Accounts');
        }}
      />
    );
  };

  const renderSendUnSuccessWithAddressContents = () => {
    return (
      <SendConfirmationContent
        title={'Sent Unsuccessful'}
        info={'There seems to be a problem'}
        userInfo={userInfo}
        isFromContact={false}
        okButtonText={'Try Again'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={() => {
          dispatch(clearTransfer(serviceType));
          if (SendUnSuccessWithAddressBottomSheet.current)
            SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
        }}
        onPressCancel={() => {
          dispatch(clearTransfer(serviceType));
          if (SendUnSuccessWithAddressBottomSheet.current)
            SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
        }}
        isUnSuccess={true}
      />
    );
  };

  const renderSendUnSuccessWithAddressHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          dispatch(clearTransfer(serviceType));
          if (SendUnSuccessWithAddressBottomSheet.current)
            SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  useEffect(() => {
    if (serviceType === SECURE_ACCOUNT) {
      (async () => {
        if (
          !(await AsyncStorage.getItem('twoFASetup')) &&
          !(await AsyncStorage.getItem('walletRecovered'))
        ) {
          props.navigation.navigate('TwoFASetup', {
            twoFASetup: service.secureHDWallet.twoFASetup,
          });
          await AsyncStorage.setItem('twoFASetup', 'true');
        }
      })();
    }
  }, []);

  const getAccountFromType = () => {
    if (serviceType == 'TEST_ACCOUNT') {
      return 'Test Account';
    }
    if (serviceType == 'SECURE_ACCOUNT') {
      return 'Secure Account';
    }
    if (serviceType == 'REGULAR_ACCOUNT') {
      return 'Regular Account';
    }
    if (serviceType == 'S3_SERVICE') {
      return 'S3 Service';
    }
  };

  function timeConvert(valueInMinutes) {
    var num = valueInMinutes;
    var hours = Math.round(num / 60);
    var days = Math.round(hours / 24);
    if (valueInMinutes < 60) {
      return valueInMinutes + ' minutes';
    } else if (hours < 24) {
      return hours + ' hours';
    } else if (days > 0) {
      return days == 1 ? days + ' day' : days + ' days';
    }
  }

  const checkBalance = () => {
    if (
      netBalance <
      Number(amount) +
        Number(
          staticFees[
            sliderValueText === 'Low Fee'
              ? 'low'
              : sliderValueText === 'In the middle'
              ? 'medium'
              : 'high'
          ],
        )
    ) {
      setIsInvalidBalance(true);
    } else {
      setIsEditable(false);
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
    }
  };

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
            <TouchableWithoutFeedback
              onPress={() => {
                if (SendHelperBottomSheet.current)
                  SendHelperBottomSheet.current.snapTo(0);
              }}
            >
              <View onStartShouldSetResponder={() => true}>
                <View style={styles.modalHeaderTitleView}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (getServiceType) {
                          getServiceType(serviceType);
                        }
                        props.navigation.goBack();
                      }}
                      style={{
                        height: 30,
                        width: 30,
                        justifyContent: 'center',
                      }}
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
                          if (SendHelperBottomSheet.current)
                            SendHelperBottomSheet.current.snapTo(1);
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
                      editable={isEditable}
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
                        if (bottomSheet.current)
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
                  {serviceType == TEST_ACCOUNT ? (
                    <Text
                      onPress={() => {
                        setRecipientAddress(
                          '2N1TSArdd2pt9RoqE3LXY55ixpRE9e5aot8',
                        );
                      }}
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(10),
                        marginLeft: 'auto',
                        fontFamily: Fonts.FiraSansItalic,
                      }}
                    >
                      Send it to a sample address
                    </Text>
                  ) : null}
                  <View style={styles.textBoxView}>
                    <View style={styles.amountInputImage}>
                      <Image
                        style={styles.textBoxImage}
                        source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                      />
                    </View>
                    <TextInput
                      editable={sweepSecure ? false : isEditable}
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
                      onKeyPress={e => {
                        if (e.nativeEvent.key === 'Backspace') {
                          setTimeout(() => {
                            setIsInvalidBalance(false);
                          }, 10);
                        }
                      }}
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
                  {isInvalidBalance ? (
                    <View style={{ marginLeft: 'auto' }}>
                      <Text style={styles.errorText}>Insufficient balance</Text>
                    </View>
                  ) : null}
                  <View style={{ ...styles.textBoxView, height: 100 }}>
                    <TextInput
                      // ref={refs => setDescriptionRef(refs)}
                      editable={isEditable}
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
                    <View style={{ flexDirection: 'row'}} ref={ viewRef } collapsable={ false }>
                      <TouchableWithoutFeedback onPressIn={ tapSliderHandler }>
                      <Slider
                        style={{ flex: 1 }}
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
                          console.log('Value', value);
                          setSliderValue(value);
                        }}
                        onSlidingComplete={value => {
                          console.log('Value onSlidingComplete', value);
                          value == 0
                            ? setSliderValueText('Low Fee')
                            : value == 5
                            ? setSliderValueText('In the middle')
                            : setSliderValueText('Fast Transaction');
                        }}
                      />
                      </TouchableWithoutFeedback>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansRegular,
                          textAlign: 'center',
                          flex: 1,
                          flexWrap: 'wrap',
                          marginRight: 5,
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
                          flex: 1,
                          flexWrap: 'wrap',
                          marginRight: 5,
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
                          flex: 1,
                          flexWrap: 'wrap',
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
                      checkBalance();
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
                    {loading.transfer && !isInvalidBalance ? (
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
                {serviceType === SECURE_ACCOUNT ? (
                  <View
                    style={{
                      alignItems: 'center',
                      marginBottom: 200,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        props.navigation.navigate('LostTwoFA');
                      }}
                    >
                      <Text>Forget 2FA?</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendHelperBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderSendHelperContents}
        renderHeader={renderSendHelperHeader}
      />
      <BottomSheet
        onOpenEnd={() => {
          setQrBottomSheetsFlag(true);
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
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendConfirmationBottomSheet}
        snapPoints={[-50, hp('50%')]}
        renderContent={renderSendConfirmationContents}
        renderHeader={renderSendConfirmationHeader}
      />
      <BottomSheet
        onCloseStart={() => {
          {
            dispatch(clearTransfer(serviceType));
            dispatch(
              fetchBalanceTx(serviceType, {
                loader: true,
              }),
            );
            props.navigation.navigate('Accounts');
          }
        }}
        enabledInnerScrolling={true}
        ref={SendSuccessWithAddressBottomSheet}
        snapPoints={[-50, hp('50%')]}
        renderContent={renderSendSuccessWithAddressContents}
        renderHeader={renderSendSuccessWithAddressHeader}
      />
      <BottomSheet
        onCloseStart={() => {
          dispatch(clearTransfer(serviceType));
          SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
        }}
        enabledInnerScrolling={true}
        ref={SendUnSuccessWithAddressBottomSheet}
        snapPoints={[-50, hp('50%')]}
        renderContent={renderSendUnSuccessWithAddressContents}
        renderHeader={renderSendUnSuccessWithAddressHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
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
