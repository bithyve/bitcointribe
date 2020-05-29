import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ToggleSwitch from '../../components/ToggleSwitch';
import { nameToInitials } from '../../common/CommonFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { transferST1 } from '../../store/actions/accounts';
import { UsNumberFormat } from '../../common/utilities';
import BottomSheet from 'reanimated-bottom-sheet';
import Slider from 'react-native-slider';
import BottomInfoBox from '../../components/BottomInfoBox';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ModalHeader from '../../components/ModalHeader';
import SendConfirmationContent from './SendConfirmationContent';

export default function SendToContact(props) {
  const dispatch = useDispatch();
  const accounts = useSelector((state) => state.accounts);
  const [exchangeRates, setExchangeRates] = useState(
    accounts && accounts.exchangeRates,
  );
  useEffect(() => {
    if (accounts && accounts.exchangeRates)
      setExchangeRates(accounts.exchangeRates);
  }, [accounts.exchangeRates]);
  const sendStorage = useSelector((state) => state.sendReducer.sendStorage);
  console.log('sendStorage', sendStorage);
  const selectedContact = props.navigation.getParam('selectedContact');
  const serviceType = props.navigation.getParam('serviceType');
  const averageTxFees = props.navigation.getParam('averageTxFees');
  const sweepSecure = props.navigation.getParam('sweepSecure');
  let netBalance = props.navigation.getParam('netBalance');
  const [removeItem, setRemoveItem] = useState({});
  const [switchOn, setSwitchOn] = useState(true);
  const [CurrencyCode, setCurrencyCode] = useState('USD');
  const [bitcoinAmount, setBitCoinAmount] = useState('');
  const [currencyAmount, setCurrencyAmount] = useState('');
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [note, setNote] = useState('');
  const viewRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderValueText, setSliderValueText] = useState('Low Fee');
  const [dropdownBoxOpenClose, setDropdownBoxOpenClose] = useState(false);
  const [
    SendSuccessBottomSheet,
    setSendSuccessBottomSheet,
  ] = useState(React.createRef<BottomSheet>());
  const [
    SendUnSuccessBottomSheet,
    setSendUnSuccessBottomSheet,
  ] = useState(React.createRef<BottomSheet>());

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

  useEffect(() => {
    if (bitcoinAmount && currencyAmount) {
      setIsConfirmDisabled(false);
    } else {
      setIsConfirmDisabled(true);
    }
  }, [bitcoinAmount, currencyAmount]);

  const getServiceTypeAccount = () => {
    if (serviceType == 'TEST_ACCOUNT') {
      return 'Test Account';
    } else if (serviceType == 'SECURE_ACCOUNT') {
      return 'Secure Account';
    } else if (serviceType == 'REGULAR_ACCOUNT') {
      return 'Checking Account';
    } else if (serviceType == 'S3_SERVICE') {
      return 'S3 Service';
    }
  };

  const handleTrasferST1 = () => {
    let recipients = [];
    const tempData = {
      selectedContact,
      bitcoinAmount,
      currencyAmount,
      note,
    };
    let storage = [...sendStorage, tempData];
    storage.map((item) => {
      let data = {
        address: item.selectedContact.id,
        amount: parseInt(item.bitcoinAmount),
      };
      recipients.push(data);
    });
    console.log('REcipients', recipients);
    dispatch(transferST1(serviceType, recipients, averageTxFees));
    props.navigation.navigate('SendConfirmation', {
      serviceType,
      sweepSecure,
      netBalance,
      recipients,
    });
  };

  const renderContacts = (item) => {
    return (
      <TouchableOpacity style={styles.contactProfileView}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              backgroundColor: Colors.backgroundColor1,
              height: 90,
              position: 'relative',
              borderRadius: 10,
            }}
          >
            <View style={{ marginLeft: 70 }}>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(11),
                  marginLeft: 25,
                  paddingTop: 5,
                  paddingBottom: 3,
                }}
              >
                Sending to:
              </Text>
              <Text style={styles.contactNameText}>
                {item.selectedContact.name ||
                  item.selectedContact.account_name ||
                  item.selectedContact.id}
              </Text>
              {item.hasOwnProperty('bitcoinAmount') ||
              item.hasOwnProperty('currencyAmount') ? (
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(10),
                    marginLeft: 25,
                    paddingTop: 3,
                  }}
                >
                  {item.bitcoinAmount
                    ? item.bitcoinAmount + ' Sats'
                    : '$ ' + item.currencyAmount
                    ? item.currencyAmount
                    : ''}
                </Text>
              ) : null}
            </View>
            <Ionicons
              style={{ marginLeft: 'auto', marginRight: 10 }}
              name={dropdownBoxOpenClose ? 'ios-arrow-up' : 'ios-arrow-down'}
              size={20}
              color={Colors.borderColor}
            />
          </View>
          {item.selectedContact.imageAvailable ? (
            <View
              style={{
                position: 'absolute',
                marginLeft: 15,
                marginRight: 15,
                alignItems: 'center',
                justifyContent: 'center',
                shadowOpacity: 1,
                shadowOffset: { width: 2, height: 2 },
              }}
            >
              <Image
                source={item.selectedContact.image}
                style={{ ...styles.contactProfileImage }}
              />
            </View>
          ) : (
            <View
              style={{
                position: 'absolute',
                marginLeft: 15,
                marginRight: 15,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.backgroundColor,
                width: 70,
                height: 70,
                borderRadius: 70 / 2,
                shadowColor: Colors.shadowBlue,
                shadowOpacity: 1,
                shadowOffset: { width: 2, height: 2 },
              }}
            >
              {item.selectedContact && item.selectedContact.name ? (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: RFValue(20),
                    lineHeight: RFValue(20), //... One for top and one for bottom alignment
                  }}
                >
                  {nameToInitials(
                    item.selectedContact.firstName &&
                      item.selectedContact.lastName
                      ? item.selectedContact.firstName +
                          ' ' +
                          item.selectedContact.lastName
                      : item.selectedContact.firstName &&
                        !item.selectedContact.lastName
                      ? item.selectedContact.firstName
                      : !item.selectedContact.firstName &&
                        item.selectedContact.lastName
                      ? item.selectedContact.lastName
                      : '',
                  )}
                </Text>
              ) : (
                <Image
                  source={require('../../assets/images/icons/icon_user.png')}
                  style={styles.contactProfileImage}
                />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
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
    sendStorage.map((item) => {
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
        userInfo={sendStorage}
        isFromContact={false}
        okButtonText={'View Account'}
        cancelButtonText={'Back'}
        isCancel={false}
        onPressOk={() => {
          if (SendSuccessBottomSheet.current)
            SendSuccessBottomSheet.current.snapTo(0);
          props.navigation.replace('Accounts', { serviceType: serviceType });
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
        userInfo={sendStorage}
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
          if (SendUnSuccessBottomSheet.current)
          SendUnSuccessBottomSheet.current.snapTo(0);
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
      <ScrollView>
        <View style={styles.modalContentContainer}>
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
                <FontAwesome
                  name="long-arrow-left"
                  color={Colors.blue}
                  size={17}
                />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitleText}>
                {'Send Confirmation'}
              </Text>
            </View>
          </View>
          <View
            style={{
              borderBottomWidth: 1,
              borderColor: Colors.borderColor,
              paddingBottom: hp('2%'),
              paddingTop: hp('1%'),
              marginRight: wp('6%'),
              marginLeft: wp('6%'),
            }}
          >
            <View
              style={{
                marginBottom: hp('1%'),
                marginTop: hp('1%'),
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                {'Sending From: '}
              </Text>
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

            {sendStorage && sendStorage.length > 0 ? (
              <ScrollView>
                {sendStorage.map((item) => renderContacts(item))}
              </ScrollView>
            ) : null}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: wp('6%'),
              marginLeft: wp('6%'),
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
                  {averageTxFees ? averageTxFees['low'].averageTxFee : ''}
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
                  {averageTxFees ? averageTxFees['medium'].averageTxFee : ''}
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
                  {averageTxFees ? averageTxFees['high'].averageTxFee : ''}
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
              onPress={() => {
                // handleTransferST2();
                // props.navigation.goBack();
                SendUnSuccessBottomSheet.current.snapTo(1);
                //SendSuccessBottomSheet.current.snapTo(1);
              }}
              style={{
                ...styles.confirmButtonView,
                backgroundColor: Colors.blue,
                elevation: 10,
                shadowColor: Colors.shadowBlue,
                shadowOpacity: 1,
                shadowOffset: { width: 15, height: 15 },
              }}
            >
              <Text style={styles.buttonText}>{'Confirm & Send'}</Text>
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
        </View>
      </ScrollView>
      <BottomSheet
        onCloseStart={() => {
         
        }}
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
  circleShapeView: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    borderColor: Colors.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    elevation: 10,
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
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
});