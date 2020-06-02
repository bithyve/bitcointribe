import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
  ActivityIndicator,
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
import {
  transferST1,
  addTransferDetails,
  removeTransferDetails,
} from '../../store/actions/accounts';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { UsNumberFormat } from '../../common/utilities';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../../components/ModalHeader';
import RemoveSelectedTransaction from './RemoveSelectedTrasaction';
import SendConfirmationContent from './SendConfirmationContent';

export default function SendToContact(props) {
  const dispatch = useDispatch();
  const [RemoveBottomSheet, setRemoveBottomSheet] = useState(React.createRef());
  const accounts = useSelector((state) => state.accounts);
  const [exchangeRates, setExchangeRates] = useState(
    accounts && accounts.exchangeRates,
  );
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
  const [InputStyle, setInputStyle] = useState(styles.textBoxView);
  const [InputStyle1, setInputStyle1] = useState(styles.textBoxView);
  const [InputStyleNote, setInputStyleNote] = useState(styles.textBoxView);
  const [isInvalidBalance, setIsInvalidBalance] = useState(false);
  const [SendUnSuccessBottomSheet, setSendUnSuccessBottomSheet] = useState(
    React.createRef<BottomSheet>(),
  );
  const [recipients, setRecipients] = useState([]);
  const loading = useSelector((state) => state.accounts[serviceType].loading);
  const transfer = useSelector((state) => state.accounts[serviceType].transfer);

  function isEmpty(obj) {
    return Object.keys(obj).every((k) => !Object.keys(obj[k]).length);
  }

  useEffect(() => {
    if (accounts && accounts.exchangeRates)
      setExchangeRates(accounts.exchangeRates);
  }, [accounts.exchangeRates]);

  useEffect(() => {
    if (bitcoinAmount && currencyAmount) {
      if (netBalance < Number(bitcoinAmount)) {
        setIsInvalidBalance(true);
        setIsConfirmDisabled(true);
      } else setIsConfirmDisabled(false);
    } else {
      setIsConfirmDisabled(true);
    }
  }, [bitcoinAmount, currencyAmount]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      checkRecordsHavingPrice();
    });
  }, []);

  useEffect(() => {
    if (!recipients.length) return;
    if (transfer.stage1.failed) {
      setTimeout(() => {
        setIsConfirmDisabled(false);
      }, 10);
      SendUnSuccessBottomSheet.current.snapTo(1);
    } else if (transfer.executed === 'ST1') {
      props.navigation.navigate('SendConfirmation', {
        serviceType,
        sweepSecure,
        netBalance,
        recipients,
        averageTxFees,
      });
    }
  }, [transfer, recipients]);

  const handleTrasferST1 = () => {
    const recipients = [];
    const currentRecipientInstance = {
      selectedContact,
      bitcoinAmount,
      currencyAmount,
      note,
    };

    const recipientsList = [];
    transfer.details.forEach((instance) => {
      if (instance.bitcoinAmount) recipientsList.push(instance);
    });
    recipientsList.push(currentRecipientInstance);

    recipientsList.map((item) => {
      let data = {
        address: item.selectedContact.id,
        amount: parseInt(item.bitcoinAmount),
      };
      recipients.push(data);
    });
    setRecipients(recipients);
    dispatch(transferST1(serviceType, recipients, averageTxFees));
  };

  const removeFromSendStorage = (item) => {
    setTimeout(() => {
      setRemoveItem(item);
    }, 2);
    (RemoveBottomSheet as any).current.snapTo(1);
  };

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

  const getImageIcon = (item) => {
    if (item) {
      if (item.account_name) {
        return (
          <Image
            source={
              item.account_name === 'Checking Account'
                ? require('../../assets/images/icons/icon_regular.png')
                : item.account_name === 'Saving Account'
                ? require('../../assets/images/icons/icon_secureaccount.png')
                : item.account_name === 'Test Account'
                ? require('../../assets/images/icons/icon_test_white.png')
                : require('../../assets/images/icons/icon_user.png')
            }
            style={styles.circleShapeView}
          />
        );
      }

      if (item.image) {
        return <Image source={item.image} style={styles.circleShapeView} />;
      } else {
        return (
          <View
            style={{
              ...styles.circleShapeView,
              backgroundColor: Colors.shadowBlue,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item && item.firstName ? (
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  lineHeight: 13, //... One for top and one for bottom alignment
                }}
              >
                {item
                  ? nameToInitials(
                      item.firstName && item.lastName
                        ? item.firstName + ' ' + item.lastName
                        : item.firstName && !item.lastName
                        ? item.firstName
                        : !item.firstName && item.lastName
                        ? item.lastName
                        : '',
                    )
                  : ''}
              </Text>
            ) : (
              <Image
                source={require('../../assets/images/icons/icon_user.png')}
                style={styles.circleShapeView}
              />
            )}
          </View>
        );
      }
    }
  };

  const renderMultipleContacts = (item) => {
    return (
      <View
        style={{
          marginRight: 20,
          justifyContent: 'center',
          alignItems: 'center',
          width: wp('15%'),
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          {getImageIcon(item.selectedContact)}
          <TouchableOpacity
            style={styles.closeMarkStyle}
            onPress={() => removeFromSendStorage(item)}
          >
            <AntDesign size={16} color={Colors.blue} name={'closecircle'} />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            color: Colors.textColorGrey,
            fontSize: RFValue(13),
            fontFamily: Fonts.FiraSansRegular,
            textAlign: 'center',
            marginTop: 5,
            width: wp('15%'),
          }}
          numberOfLines={1}
        >
          {item.selectedContact.name ||
            item.selectedContact.account_name ||
            item.selectedContact.id}
        </Text>
        <Text
          style={{
            color: Colors.blue,
            fontSize: RFValue(10),
            fontFamily: Fonts.FiraSansRegular,
          }}
        >
          {switchOn
            ? `${item.bitcoinAmount ? item.bitcoinAmount : bitcoinAmount} Sats`
            : '$' +
              `${item.currencyAmount ? item.currencyAmount : currencyAmount}`}
        </Text>
      </View>
    );
  };

  const renderVerticalDivider = () => {
    return (
      <View
        style={{
          width: 2,
          height: '60%',
          backgroundColor: Colors.borderColor,
          marginRight: 5,
          marginLeft: 5,
          alignSelf: 'center',
        }}
      />
    );
  };

  const convertBitCoinToCurrency = (value) => {
    let temp = value;
    if (switchOn) {
      let result = exchangeRates
        ? ((value / 1e8) * exchangeRates[CurrencyCode].last).toFixed(2)
        : 0;
      setBitCoinAmount(temp);
      setCurrencyAmount(result.toString());
    } else {
      let currency = exchangeRates
        ? value / exchangeRates[CurrencyCode].last
        : 0;
      currency = currency < 1 ? currency * 1e8 : currency;
      setCurrencyAmount(temp);
      setBitCoinAmount(currency.toFixed(2));
    }
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

  const renderBitCoinInputText = () => {
    return (
      <View
        style={{
          ...InputStyle,
          marginBottom: wp('1.5%'),
          marginTop: wp('1.5%'),
          flexDirection: 'row',
          width: wp('70%'),
          height: wp('13%'),
        }}
      >
        <View style={styles.amountInputImage}>
          <Image
            style={styles.textBoxImage}
            source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
          />
        </View>
        {renderVerticalDivider()}
        <TextInput
          style={{ ...styles.textBox, paddingLeft: 10 }}
          placeholder={
            switchOn ? 'Enter Amount in Sats' : 'Converted Amount in Sats'
          }
          editable={switchOn}
          value={bitcoinAmount}
          returnKeyLabel="Done"
          returnKeyType="done"
          keyboardType={'numeric'}
          onChangeText={(value) => {
            convertBitCoinToCurrency(value);
          }}
          placeholderTextColor={Colors.borderColor}
          onFocus={() => {
            setInputStyle(styles.inputBoxFocused);
          }}
          onBlur={() => {
            setInputStyle(styles.textBoxView);
          }}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === 'Backspace') {
              setTimeout(() => {
                setIsInvalidBalance(false);
              }, 10);
            }
          }}
        />
      </View>
    );
  };

  const renderUSDInputText = () => {
    return (
      <View
        style={{
          ...InputStyle1,
          marginBottom: wp('1.5%'),
          marginTop: wp('1.5%'),
          flexDirection: 'row',
          width: wp('70%'),
          height: wp('13%'),
        }}
      >
        <View style={styles.amountInputImage}>
          <Image
            style={styles.textBoxImage}
            source={require('../../assets/images/icons/dollar_grey.png')}
          />
        </View>
        {renderVerticalDivider()}
        <TextInput
          style={{ ...styles.textBox, paddingLeft: 10 }}
          editable={!switchOn}
          placeholder={
            switchOn ? 'Converted Amount in Dollars' : 'Enter Amount in Dollars'
          }
          value={currencyAmount}
          returnKeyLabel="Done"
          returnKeyType="done"
          keyboardType={'numeric'}
          onChangeText={(value) => {
            convertBitCoinToCurrency(value);
          }}
          placeholderTextColor={Colors.borderColor}
          onFocus={() => {
            setInputStyle1(styles.inputBoxFocused);
          }}
          onBlur={() => {
            setInputStyle1(styles.textBoxView);
          }}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === 'Backspace') {
              setTimeout(() => {
                setIsInvalidBalance(false);
              }, 10);
            }
          }}
        />
      </View>
    );
  };

  const renderRemoveSelectedContents = useCallback(() => {
    if (
      Object.keys(removeItem).length != 0 &&
      removeItem.constructor === Object
    ) {
      return (
        <RemoveSelectedTransaction
          selectedContact={removeItem}
          onPressBack={() => {
            if (RemoveBottomSheet.current)
              (RemoveBottomSheet as any).current.snapTo(0);
          }}
          onPressDone={() => {
            setTimeout(() => {
              dispatch(removeTransferDetails(serviceType, removeItem));
            }, 2);
            (RemoveBottomSheet as any).current.snapTo(0);
          }}
        />
      );
    }
  }, [removeItem]);

  const renderRemoveSelectedHeader = useCallback(() => {
    if (
      Object.keys(removeItem).length === 0 &&
      removeItem.constructor === Object
    ) {
      return (
        <ModalHeader
          onPressHeader={() => {
            if (RemoveBottomSheet.current)
              (RemoveBottomSheet as any).current.snapTo(0);
          }}
        />
      );
    }
  }, []);

  const checkRecordsHavingPrice = () => {
    if (transfer.details && transfer.details.length) {
      for (let i = 0; i < transfer.details.length; i++) {
        if (
          !transfer.details[i].selectedContact.hasOwnProperty(
            'bitcoinAmount',
          ) &&
          !transfer.details[i].selectedContact.hasOwnProperty(
            'currencyAmount',
          ) &&
          selectedContact.id == transfer.details[i].selectedContact.id
        ) {
          dispatch(removeTransferDetails(serviceType, transfer.details[i]));
        }
      }
    }
  };

  const checkBalance = () => {
    setIsConfirmDisabled(true);
    if (netBalance < Number(bitcoinAmount)) {
      setIsInvalidBalance(true);
      setIsConfirmDisabled(true);
    } else {
      setIsConfirmDisabled(false);
      if (transfer.details && transfer.details.length) {
        for (let i = 0; i < transfer.details.length; i++) {
          if (transfer.details[i].selectedContact.id == selectedContact.id) {
            dispatch(removeTransferDetails(serviceType, transfer.details[i]));
          }
        }
        dispatch(
          addTransferDetails(serviceType, {
            selectedContact,
            bitcoinAmount,
            currencyAmount,
            note,
          }),
        );
      }
      setTimeout(() => {
        handleTrasferST1();
      }, 10);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.white,
        alignSelf: 'center',
      }}
    >
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
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
              checkRecordsHavingPrice();
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
          <Text style={styles.modalHeaderTitleText}>{'Send To Contact'}</Text>
        </View>
      </View>
      <View style={{ width: wp('85%'), alignSelf: 'center' }}>
        {transfer.details && transfer.details.length > 0 ? (
          <ScrollView horizontal={true}>
            {transfer.details.map((item) => renderMultipleContacts(item))}
          </ScrollView>
        ) : null}
      </View>
      <View
        style={{
          alignSelf: 'center',
          width: wp('90%'),
          borderBottomWidth: 1,
          borderColor: Colors.borderColor,
          marginBottom: hp('1%'),
          marginTop: hp('2%'),
          flexDirection: 'row',
          paddingBottom: hp('1.5%'),
          paddingTop: hp('1%'),
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
              ? ((netBalance / 1e8) * exchangeRates[CurrencyCode].last).toFixed(
                  2,
                )
              : null}
          </Text>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue(7),
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : ''}
        enabled
      >
        <View
          style={{ paddingLeft: 20, paddingRight: 20, paddingTop: wp('5%') }}
        >
          <ScrollView>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                {renderBitCoinInputText()}
                {isInvalidBalance ? (
                  <View style={{ marginLeft: 'auto' }}>
                    <Text style={styles.errorText}>Insufficient balance</Text>
                  </View>
                ) : null}
                {renderUSDInputText()}
              </View>
              <View
                style={{
                  marginLeft: 'auto',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ToggleSwitch
                  currencyCodeValue={CurrencyCode}
                  onpress={async () => {
                    setSwitchOn(!switchOn);
                  }}
                  toggle={switchOn}
                  transform={true}
                />
              </View>
            </View>
            <View
              style={{
                ...InputStyleNote,
                marginBottom: wp('1.5%'),
                marginTop: wp('1.5%'),
                flexDirection: 'row',
                width: wp('85%'),
                height: wp('13%'),
              }}
            >
              <TextInput
                style={styles.textBox}
                returnKeyLabel="Done"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                placeholder={'Add a Note ( Optional )'}
                value={note}
                onChangeText={setNote}
                placeholderTextColor={Colors.borderColor}
                onFocus={() => {
                  setInputStyleNote(styles.inputBoxFocused);
                }}
                onBlur={() => {
                  setInputStyleNote(styles.textBoxView);
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: hp('3%'),
                marginBottom: hp('5%'),
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  checkBalance();
                }}
                disabled={isConfirmDisabled || loading.transfer}
                style={{
                  ...styles.confirmButtonView,
                  backgroundColor: Colors.blue,
                  elevation: 10,
                  shadowColor: Colors.shadowBlue,
                  shadowOpacity: 1,
                  shadowOffset: { width: 15, height: 15 },
                  opacity: isConfirmDisabled ? 0.5 : 1,
                }}
              >
                {/* {loading.transfer && !isInvalidBalance ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : ( */}
                {loading.transfer ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.buttonText}>{'Confirm & Proceed'}</Text>
                )}
                {/* )} */}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  ...styles.confirmButtonView,
                  width: wp('30%'),
                  marginLeft: 10,
                }}
                disabled={isConfirmDisabled || loading.transfer}
                onPress={() => {
                  // dispatch(clearTransfer(serviceType));
                  // if (getServiceType) {
                  //   getServiceType(serviceType);
                  // }
                  if (transfer.details && transfer.details.length) {
                    for (let i = 0; i < transfer.details.length; i++) {
                      if (
                        transfer.details[i].selectedContact.id ==
                        selectedContact.id
                      ) {
                        dispatch(
                          removeTransferDetails(
                            serviceType,
                            transfer.details[i],
                          ),
                        );
                      }
                    }
                    dispatch(
                      addTransferDetails(serviceType, {
                        selectedContact,
                        bitcoinAmount,
                        currencyAmount,
                        note,
                      }),
                    );
                    props.navigation.goBack();
                  }
                }}
              >
                <Text style={{ ...styles.buttonText, color: Colors.blue }}>
                  Add Recipient
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={RemoveBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('50%') : hp('50%'),
        ]}
        renderContent={renderRemoveSelectedContents}
        renderHeader={renderRemoveSelectedHeader}
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
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 15,
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
    marginRight: 10,
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginBottom: hp('0.5%'),
    width: wp('90%'),
  },
  textBoxView: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: Colors.borderColor,
  },
  inputBoxFocused: {
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
    height: wp('13%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    height: wp('13%'),
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
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('14%') / 2,
    borderColor: Colors.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    elevation: 10,
  },
  closeMarkStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
