import React, { useState, useEffect } from 'react';
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
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
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
  storeContactsAccountToSend,
  removeContactsAccountFromSend,
} from '../../store/actions/send-action';
import { transferST1 } from '../../store/actions/accounts';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { UsNumberFormat } from '../../common/utilities';
import { ScrollView as GestureHandlerScrollView } from 'react-native-gesture-handler'

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

  const [switchOn, setSwitchOn] = useState(true);
  const [CurrencyCode, setCurrencyCode] = useState('USD');
  const [bitcoinAmount, setBitCoinAmount] = useState('');
  const [currencyAmount, setCurrencyAmount] = useState('');
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [note, setNote] = useState('');
  const [InputStyle, setInputStyle] = useState(styles.textBoxView);
  const [InputStyle1, setInputStyle1] = useState(styles.textBoxView);
  const [InputStyleNote, setInputStyleNote] = useState(styles.textBoxView);
  const statePrint = useSelector((state) => {
    console.log('sendStorage', sendStorage);
  });

  useEffect(() => {
    if (bitcoinAmount && currencyAmount) {
      setIsConfirmDisabled(false);
    } else {
      setIsConfirmDisabled(true);
    }
  }, [bitcoinAmount, currencyAmount]);

  const removeFromSendStorage = (item) => {
    dispatch(removeContactsAccountFromSend(item));
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

  const getImageIcon = (item) => {
    if (item) {
      if (item.account_name === 'Checking Account') {
        return (
          <Image
            source={require('../../assets/images/icons/icon_regular.png')}
            style={styles.circleShapeView}
          />
        );
      }

      if (item.account_name === 'Saving Account') {
        return (
          <Image
            source={require('../../assets/images/icons/icon_secureaccount.png')}
            style={styles.circleShapeView}
          />
        );
      }

      if (item.imageAvailable) {
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
          {item && item.firstName ?
            (<Text
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
            </Text>) : (<Image source={require('../../assets/images/icons/icon_user.png')} style={styles.circleShapeView} />)}
          </View>
        );
      }
    }
  };


  const renderMultipleContacts = (item) => {
    return (
        <View
          style={{
            marginRight: 10,
            justifyContent: 'center',
            alignItems: 'center',
            width: 100
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            {getImageIcon(item.selectedContact)}
            <TouchableOpacity
              style={styles.closemarkStyle}
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
              height: 15,
            }}
            numberOfLines={1}

          >
            {item.selectedContact.name || item.selectedContact.account_name || item.selectedContact.id}
          </Text>
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(10),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            {switchOn
              ? `${
                  item.bitcoinAmount ? item.bitcoinAmount : bitcoinAmount
                } Sats`
              : '$' +
                `${item.currencyAmount ? item.currencyAmount : currencyAmount}`}
          </Text>
        </View>
    );
  };

  const renderDivider = () => {
    return (
      <View
        style={{
          height: 1,
          backgroundColor: Colors.borderColor,
          marginTop: hp('3%'),
          marginBottom: hp('3%'),
        }}
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

  const renderBitCoinInputText = () => {
    return (
      <View
        style={{
          ...InputStyle,
          marginBottom: 6,
          marginTop: 6,
          flexDirection: 'row',
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
        />
      </View>
    );
  };

  const renderUSDInputText = () => {
    return (
      <View
        style={{
          ...InputStyle1,
          marginBottom: 6,
          marginTop: 6,
          flexDirection: 'row',
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
        />
      </View>
    );
  };

  return (
    <View style={{ height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',}}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalContentContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <ScrollView>
            <TouchableWithoutFeedback>
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
                      {'Send To Contact'}
                    </Text>
                  </View>
                </View>
                <View
                  style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 15 }}
                >
                  {/* {renderSingleContact(selectedContact)} */}
                  {sendStorage && sendStorage.length > 0 ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 5,
                        marginBottom: 5,
                        backgroundColor:'yellow'
                      }}
                    >
                       <ScrollView horizontal={true}>
                    {sendStorage.map((item) => renderMultipleContacts(item))}
                    </ScrollView>
                    </View>
                    
                  ) : null}
                  
                  <View
                    style={{
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
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                      {renderBitCoinInputText()}
                      {renderUSDInputText()}
                    </View>
                    <View
                      style={{
                        marginLeft: 'auto',
                        paddingLeft: 20,
                        paddingRight: 10,
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
                      marginBottom: 6,
                      marginTop: 6,
                      flexDirection: 'row',
                    }}
                  >
                    <TextInput
                      style={styles.textBox}
                      returnKeyLabel="Done"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                      keyboardType={
                        Platform.OS == 'ios'
                          ? 'ascii-capable'
                          : 'visible-password'
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
                        if (sendStorage && sendStorage.length) {
                          for (let i = 0; i < sendStorage.length; i++) {
                            if (
                              sendStorage[i].selectedContact.id ==
                              selectedContact.id
                            ) {
                              removeFromSendStorage(
                                sendStorage[i],
                              );
                            }
                          }
                          dispatch(
                            storeContactsAccountToSend({
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
                      }}
                      disabled={isConfirmDisabled}
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
                      <Text style={styles.buttonText}>
                        {'Confirm & Proceed'}
                      </Text>
                      {/* )} */}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        ...styles.confirmButtonView,
                        width: wp('30%'),
                        marginLeft: 10,
                      }}
                      disabled={isConfirmDisabled}
                      onPress={() => {
                        // dispatch(clearTransfer(serviceType));
                        // if (getServiceType) {
                        //   getServiceType(serviceType);
                        // }
                        if (sendStorage && sendStorage.length) {
                          for (let i = 0; i < sendStorage.length; i++) {
                            if (
                              sendStorage[i].selectedContact.id ==
                              selectedContact.id
                            ) {
                              removeFromSendStorage(
                                sendStorage[i],
                              );
                            }
                          }
                          dispatch(
                            storeContactsAccountToSend({
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
                      <Text
                        style={{ ...styles.buttonText, color: Colors.blue }}
                      >
                        Add Recipient
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
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
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
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
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: Colors.shadowBlue,
  },
  closemarkStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
