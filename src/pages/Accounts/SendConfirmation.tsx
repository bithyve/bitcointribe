import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
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
import { useDispatch, useSelector } from 'react-redux';
import {
  transferST1,
  transferST2,
  clearTransfer,
  fetchBalanceTx,
  alternateTransferST2,
} from '../../store/actions/accounts';
import { UsNumberFormat } from '../../common/utilities';
import BottomSheet from 'reanimated-bottom-sheet';
import Slider from 'react-native-slider';
import BottomInfoBox from '../../components/BottomInfoBox';
import ModalHeader from '../../components/ModalHeader';
import SendConfirmationContent from './SendConfirmationContent';
import RecipientComponent from './RecipientComponent';
import { createRandomString } from '../../common/CommonFunctions/timeFormatter';
import moment from 'moment';
import {
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
} from '../../common/constants/serviceTypes';

export default function SendConfirmation(props) {
  const dispatch = useDispatch();
  const accounts = useSelector((state) => state.accounts);
  const [exchangeRates, setExchangeRates] = useState(
    accounts && accounts.exchangeRates,
  );
  useEffect(() => {
    if (accounts && accounts.exchangeRates)
      setExchangeRates(accounts.exchangeRates);
  }, [accounts.exchangeRates]);
  const selectedContact = props.navigation.getParam('selectedContact');
  const serviceType = props.navigation.getParam('serviceType');
  const loading = useSelector((state) => state.accounts[serviceType].loading);
  const transfer = useSelector((state) => state.accounts[serviceType].transfer);
  const sweepSecure = props.navigation.getParam('sweepSecure');
  const netBalance = props.navigation.getParam('netBalance');
  const [switchOn, setSwitchOn] = useState(true);
  const [CurrencyCode, setCurrencyCode] = useState('USD');
  const viewRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderValueText, setSliderValueText] = useState('Low Fee');
  const [SendSuccessBottomSheet, setSendSuccessBottomSheet] = useState(
    React.createRef<BottomSheet>(),
  );
  const [SendUnSuccessBottomSheet, setSendUnSuccessBottomSheet] = useState(
    React.createRef<BottomSheet>(),
  );
  const [SelectedContactId, setSelectedContactId] = useState(0);
  // const [amount, setAmount] = useState('');

  // useEffect(() => {
  //   if (netBalance === 0) {
  //     setAmount(`0`);
  //   } else {
  //     setAmount(
  //       `${
  //         netBalance -
  //         Number(
  //           averageTxFees[
  //             sliderValueText === 'Low Fee'
  //               ? 'low'
  //               : sliderValueText === 'In the middle'
  //               ? 'medium'
  //               : 'high'
  //           ].averageTxFee,
  //         )
  //       }`,
  //     );
  //   }
  // }, [sliderValueText]);
  useEffect(() => {
    console.log('transfer', transfer);
    if (transfer.stage2.failed) {
      setTimeout(() => {
        SendUnSuccessBottomSheet.current.snapTo(1);
      }, 2);
    } else if (transfer.txid) {
      storeTrustedContactsHistory(transfer.details);
      SendSuccessBottomSheet.current.snapTo(1);
    } else if (!transfer.txid && transfer.executed === 'ST2') {
      props.navigation.navigate('TwoFAToken', {
        serviceType,
        recipientAddress: '',
      });
    }
  }, [transfer]);

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
            info:
              'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
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

  const onConfirm = useCallback(() => {
    const txPriority =
      sliderValueText === 'Low Fee'
        ? 'low'
        : sliderValueText === 'In the middle'
        ? 'medium'
        : 'high';
    if (sweepSecure) {
      dispatch(alternateTransferST2(serviceType, txPriority));
    } else {
      dispatch(transferST2(serviceType, txPriority));
    }
  }, [serviceType, sliderValueText, sweepSecure]);

  const tapSliderHandler = (evt) => {
    if (viewRef.current) {
      viewRef.current.measure((fx, fy, width, height, px) => {
        const location = (evt.nativeEvent.locationX - px) / width;
        if (location >= -0.1 && location <= 0.2) {
          setSliderValue(0);
        } else if (location >= 0.3 && location <= 0.6) {
          setSliderValue(5);
        } else if (location >= 0.7 && location <= 1) {
          setSliderValue(10);
        }
      });
    }
  };

  function isEmpty(obj) {
    return Object.keys(obj).every((k) => !Object.keys(obj[k]).length);
  }

  const getServiceTypeAccount = () => {
    if (serviceType == 'TEST_ACCOUNT') {
      return 'Test Account';
    } else if (serviceType == 'SECURE_ACCOUNT') {
      return 'Savings Account';
    } else if (serviceType == 'REGULAR_ACCOUNT') {
      return 'Checking Account';
    } else if (serviceType == 'S3_SERVICE') {
      return 'S3 Service';
    }
  };

  const renderContacts = (item) => {
    return (
      <RecipientComponent
        onPressElement={() => {
          if (item.note) {
            if (SelectedContactId == item.selectedContact.id)
              setSelectedContactId(0);
            else setSelectedContactId(item.selectedContact.id);
          }
        }}
        item={item}
        SelectedContactId={SelectedContactId}
      />
    );
  };

  const renderVerticalDivider = () => {
    return (
      <View
        style={{
          width: 1,
          height: '60%',
          backgroundColor: Colors.borderColor,
          marginRight: 5,
          marginLeft: 5,
          alignSelf: 'center',
        }}
      />
    );
  };

  const getTotalAmount = () => {
    let totalAmount = 0;
    transfer.details.map((item) => {
      totalAmount += parseInt(item.bitcoinAmount);
    });
    return totalAmount;
  };

  const renderBitCoinAmountText = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <View style={styles.amountInputImage}>
          <Image
            style={styles.textBoxImage}
            source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
          />
        </View>
        {renderVerticalDivider()}
        <Text
          style={{
            color: Colors.black,
            fontSize: RFValue(20),
            fontFamily: Fonts.FiraSansRegular,
            marginLeft: 10,
          }}
        >
          {getTotalAmount()}
        </Text>
        <Text
          style={{
            color: Colors.textColorGrey,
            fontSize: RFValue(13),
            fontFamily: Fonts.FiraSansRegular,
            marginRight: 5,
          }}
        >
          {' sats'}
        </Text>
      </View>
    );
  };

  const renderSendSuccessContents = () => {
    return (
      <SendConfirmationContent
        title={'Sent Successfully'}
        info={'Bitcoins successfully sent to Contact'}
        userInfo={transfer.details}
        isFromContact={false}
        okButtonText={'View Account'}
        cancelButtonText={'Back'}
        isCancel={false}
        onPressOk={() => {
          if (SendSuccessBottomSheet.current)
            SendSuccessBottomSheet.current.snapTo(0);

          dispatch(clearTransfer(serviceType));
          // dispatch(fetchTransactions(serviceType));
          dispatch(
            fetchBalanceTx(serviceType, {
              loader: true,
              syncTrustedDerivative:
                serviceType === REGULAR_ACCOUNT ? true : false,
            }),
          );
          props.navigation.navigate('Accounts');
        }}
        isSuccess={true}
      />
    );
  };

  const renderSendSuccessHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          if (SendSuccessBottomSheet.current)
            SendSuccessBottomSheet.current.snapTo(0);
          props.navigation.navigate('Accounts');
        }}
      />
    );
  };

  const renderSendUnSuccessContents = () => {
    return (
      <SendConfirmationContent
        title={'Sent Unsuccessful'}
        info={'There seems to be a problem'}
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

  return (
    <View
      style={{
        height: '100%',
        backgroundColor: Colors.white,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalHeaderTitleView}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            style={{
              height: 30,
              width: 30,
              justifyContent: 'center',
            }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <Image
            source={
              serviceType == TEST_ACCOUNT
                ? require('../../assets/images/icons/icon_test.png')
                : serviceType == REGULAR_ACCOUNT
                ? require('../../assets/images/icons/icon_regular.png')
                : require('../../assets/images/icons/icon_secureaccount.png')
            }
            style={{ width: wp('10%'), height: wp('10%') }}
          />
          <View style={{ marginLeft: wp('2.5%') }}>
            <Text style={styles.modalHeaderTitleText}>
              {'Send Confirmation'}
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
              }}
            >
              {serviceType == TEST_ACCOUNT
                ? 'Test Account'
                : serviceType == REGULAR_ACCOUNT
                ? 'Checking Account'
                : 'Savings Account'}
            </Text>
          </View>
        </View>
      </View>
      <ScrollView>
        <View
          style={{
            paddingBottom: hp('1%'),
            paddingTop: hp('0.7%'),
            marginRight: wp('6%'),
            marginLeft: wp('6%'),
            marginBottom: hp('1%'),
            marginTop: hp('1%'),
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansItalic,
            }}
          >
            {getServiceTypeAccount()}
          </Text>
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(10),
              fontFamily: Fonts.FiraSansItalic,
              lineHeight: 15,
              textAlign: 'center',
            }}
          >
            {' (Availble to spend '}
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansItalic,
              }}
            >
              {serviceType == 'Test Account'
                ? UsNumberFormat(netBalance)
                : switchOn
                ? UsNumberFormat(netBalance)
                : exchangeRates
                ? (
                    (netBalance / 1e8) *
                    exchangeRates[CurrencyCode].last
                  ).toFixed(2)
                : null}
            </Text>
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(9),
                fontFamily: Fonts.FiraSansMediumItalic,
              }}
            >
              {serviceType == 'Test Account'
                ? ' t-sats )'
                : switchOn
                ? ' sats )'
                : ' ' + CurrencyCode.toLocaleLowerCase() + ' )'}
            </Text>
          </Text>
        </View>
        {transfer.details && transfer.details.length > 0 ? (
          <ScrollView>
            {transfer.details.map((item) => renderContacts(item))}
          </ScrollView>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: hp('2%'),
            marginRight: wp('6%'),
            marginLeft: wp('6%'),
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: Colors.borderColor,
            paddingBottom: hp('1.5%'),
            paddingTop: hp('1.5%'),
          }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: 5,
            }}
          >
            Total Amount
          </Text>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}
          >
            {renderBitCoinAmountText()}
          </View>
        </View>

        <View
          style={{
            marginRight: wp('6%'),
            marginLeft: wp('6%'),
            marginTop: hp('2%'),
          }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: 5,
            }}
          >
            Transaction Priority
          </Text>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: 5,
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
            <View
              style={{ flexDirection: 'row' }}
              ref={viewRef}
              collapsable={false}
            >
              <TouchableWithoutFeedback onPressIn={tapSliderHandler}>
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
                  onValueChange={(value) => {
                    setSliderValue(value);
                  }}
                  onSlidingComplete={(value) => {
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
                {transfer.stage1.txPrerequisites
                  ? transfer.stage1.txPrerequisites['low'].fee
                  : ''}
                {' sats'})
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
                {transfer.stage1.txPrerequisites
                  ? transfer.stage1.txPrerequisites['medium'].fee
                  : ''}
                {' sats'})
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
                {transfer.stage1.txPrerequisites
                  ? transfer.stage1.txPrerequisites['high'].fee
                  : ''}
                {' sats'})
              </Text>
            </View>
          </View>
        </View>
        <View style={{ marginTop: hp('3%') }}>
          <BottomInfoBox
            title={'Note'}
            infoText={
              'When you want to send bitcoins, you need the address of the receiver. For this you can either scan a QR code from their wallet/ app or copy address into the address field'
            }
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            marginTop: hp('3%'),
            marginBottom: hp('5%'),
            marginLeft: wp('6%'),
            marginRight: wp('6%'),
          }}
        >
          <TouchableOpacity
            onPress={onConfirm}
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
              <Text style={styles.buttonText}>{'Confirm & Send'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              ...styles.confirmButtonView,
              width: wp('30%'),
            }}
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            <Text style={{ ...styles.buttonText, color: Colors.blue }}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomSheet
        onCloseStart={() => {}}
        enabledInnerScrolling={true}
        ref={SendSuccessBottomSheet}
        snapPoints={[-50, hp('65%')]}
        renderContent={renderSendSuccessContents}
        renderHeader={renderSendSuccessHeader}
      />

      <BottomSheet
        onCloseStart={() => {
          SendUnSuccessBottomSheet.current.snapTo(0);
        }}
        enabledInnerScrolling={true}
        ref={SendUnSuccessBottomSheet}
        snapPoints={[-50, hp('65%')]}
        renderContent={renderSendUnSuccessContents}
        renderHeader={renderSendUnSuccessHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
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
  textBoxView: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: Colors.borderColor,
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    elevation: 10,
    borderColor: Colors.borderColor,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowColor: Colors.borderColor,
    backgroundColor: Colors.white,
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
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue(13),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
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
  closemarkStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  contactProfileView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1.7%'),
  },
  contactProfileImage: {
    borderRadius: 60 / 2,
    width: 60,
    height: 60,
    resizeMode: 'cover',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },
});
