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
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar
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
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/serviceTypes';
import { nameToInitials } from '../../common/CommonFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { storeContactsAccountToSend, removeContactsAccountFromSend } from '../../store/actions/send-action';
import { remove } from '../../storage/secure-store';

export default function SendToContact(props) {

  const dispatch = useDispatch();

  const accounts = useSelector((state) => state.accounts);
  const [exchangeRates, setExchangeRates] = useState(accounts && accounts.exchangeRates);
  useEffect(() => {
    if (accounts && accounts.exchangeRates) setExchangeRates(accounts.exchangeRates);
  }, [accounts.exchangeRates]);
  const sendStorage = useSelector((state) => state.sendReducer.sendStorage);

  const selectedContact = props.navigation.getParam('selectedContact');
  const serviceType = props.navigation.getParam('serviceType');

  const [switchOn, setSwitchOn] = useState(true);
  const [CurrencyCode, setCurrencyCode] = useState('USD');
  const [bitcoinAmount, setBitCoinAmount] = useState('');
  const [currencyAmount, setCurrencyAmount] = useState('');
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [note, setNote] = useState('');

  const statePrint = useSelector((state) => {
    console.log("sendStorage", sendStorage);
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
  }

  const getServiceTypeAccount = () => {
    if (serviceType === TEST_ACCOUNT) {
      return "Test Account";
    } else if (serviceType === REGULAR_ACCOUNT) {
      return "Checking Account";
    } else if (serviceType === SECURE_ACCOUNT) {
      return "Saving Account";
    } else {
      return "";
    }
  }

  const getImageIcon = item => {
    if (item) {
      if (item.imageAvailable) {
        return (
          <Image
            source={item.image}
            style={styles.circleShapeView}
          />
        );
      } else {
        return (
          <View
            style={{...styles.circleShapeView, 
              backgroundColor: Colors.shadowBlue, 
              alignItems: 'center', 
              justifyContent: 'center'}}>
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
          </View>
        );
      }
    }
  };

  const renderSingleContact = (item) => {
    return (
      <View style={{ flexDirection: 'column' }}>
        <TouchableOpacity>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {getImageIcon(item)}
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansRegular,
                textAlign: 'center'
              }}>
              {item.name || item.account_name}
            </Text>
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansRegular,
              }}>
              {switchOn ? `${bitcoinAmount} Sats` : '$'+`${currencyAmount}`}
              </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  const renderMultipleContacts = (item) => {
    return (
      <View style={{ flexDirection: 'column', marginRight: 10 }}>
        <TouchableOpacity>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              {getImageIcon(item.selectedContact)}
              <TouchableOpacity onPress={() => removeFromSendStorage(item)} >
                <View style={styles.closemarkStyle} >
                  <Text 
                    style={{
                    color: Colors.white,
                    fontSize: RFValue(10),
                    fontFamily: Fonts.FiraSansRegular,
                    textAlign: 'center'}}>
                    x
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansRegular,
                textAlign: 'center'
              }}>
              {item.selectedContact.name || item.selectedContact.account_name}
            </Text>
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansRegular,
              }}>
              {switchOn ? `${item.bitcoinAmount} Sats` : '$'+`${item.currencyAmount}`}
              </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

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
  }

  const renderVerticalDivider = () => {
    return (
      <View
        style={{
          width: 1,
          height: '60%',
          backgroundColor: Colors.borderColor,
          marginRight: 5,
          marginLeft: 5,
          alignSelf: 'center'
        }}
      />
    );
  }

  const convertBitCoinToCurrency = (value) => {
    let temp = value;
    if (switchOn) {
      let result = exchangeRates ? ((value / 1e8) * exchangeRates[CurrencyCode].last).toFixed(2) : 0;
      setBitCoinAmount(temp);
      setCurrencyAmount(result.toString());
    } else {
      let currency = exchangeRates ? (value / exchangeRates[CurrencyCode].last) : 0;
      currency = currency < 1 ? (currency * 1e8) : currency;
      setCurrencyAmount(temp);
      setBitCoinAmount(currency.toFixed(2));
    }
  }

  const renderBitCoinInputText = () => {
    return (
      <View style={styles.textBoxView}>
        <View style={styles.amountInputImage}>
          <Image
            style={styles.textBoxImage}
            source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
          />
        </View>
        {renderVerticalDivider()}
        <TextInput
          style={{ ...styles.textBox, paddingLeft: 10 }}
          placeholder={'Converted Amount'}
          editable={switchOn}
          value={bitcoinAmount}
          returnKeyLabel="Done"
          returnKeyType="done"
          keyboardType={'numeric'}
          onChangeText={(value) => {
            convertBitCoinToCurrency(value);
          }}
          placeholderTextColor={Colors.borderColor}
        />
      </View>
    );
  }

  const renderUSDInputText = () => {
    return (
      <View style={styles.textBoxView}>
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
          placeholder={'Enter Amount'}
          value={currencyAmount}
          returnKeyLabel="Done"
          returnKeyType="done"
          keyboardType={'numeric'}
          onChangeText={(value) =>  {
            convertBitCoinToCurrency(value);
          }}
          placeholderTextColor={Colors.borderColor}
        />
      </View>
    );
  }

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
          <ScrollView nestedScrollEnabled={true}>
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
                    <Text style={styles.modalHeaderTitleText}>{'Send'}</Text>
                  </View>
                </View>
                <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 15 }}>
                  {renderSingleContact(selectedContact)}
                  {sendStorage && sendStorage.length > 0 && 
                    <View style={{ flex: 1, flexDirection: 'row', marginTop: 5, marginBottom: 5 }}>
                      {sendStorage.map((item) => renderMultipleContacts(item))}
                    </View>
                  }
                  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: hp('2%')}}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansRegular,
                        }}>
                        { 'Sending From: ' }
                      </Text>
                      <Text
                        style={{
                          color: Colors.blue,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansRegular,
                        }}>
                        {getServiceTypeAccount()}
                      </Text>
                    </View>
                  </View>
                  {renderDivider()}
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                      {renderBitCoinInputText()}
                      {renderUSDInputText()}
                    </View>
                    <View style={{ alignItems: "center", justifyContent: "center", transform: [{ rotate: '90deg'}] }}>
                      <ToggleSwitch
                        currencyCodeValue={CurrencyCode}
                        onpress={async () => {
                          setSwitchOn(!switchOn);
                        }}
                        toggle={switchOn}
                      />
                    </View>
                  </View>
                  <View style={{ ...styles.textBoxView }}>
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
                      placeholder={'Add a note (Optional)'}
                      value={note}
                      onChangeText={setNote}
                      placeholderTextColor={Colors.borderColor}
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
                        dispatch(storeContactsAccountToSend({
                          selectedContact,
                          bitcoinAmount,
                          currencyAmount,
                          note
                        }));
                        props.navigation.navigate('SendConfirmation');
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
                        <Text style={styles.buttonText}>{'Confirm & Proceed'}</Text>
                      {/* )} */}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        ...styles.confirmButtonView,
                        width: wp('30%'),
                      }}
                      disabled={isConfirmDisabled}
                      onPress={() => {
                        // dispatch(clearTransfer(serviceType));
                        // if (getServiceType) {
                        //   getServiceType(serviceType);
                        // }
                        dispatch(storeContactsAccountToSend({
                          selectedContact,
                          bitcoinAmount,
                          currencyAmount,
                          note
                        }));
                        props.navigation.goBack();
                      }}
                    >
                      <Text style={{ ...styles.buttonText, color: Colors.blue }}>
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
    marginTop: hp('4%'),
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
  dropdownBox: {
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  dropdownBoxOpened: {
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  dropdownBoxText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
  },
  dropdownBoxModal: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginTop: hp('1%'),
    width: wp('90%'),
    height: hp('18%'),
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.white,
    position: 'absolute',
    zIndex: 9999,
    overflow: 'hidden',
  },
  dropdownBoxModalElementView: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 15,
  },
  circleShapeView: {
    width: 50,
    height: 50,
    borderRadius: 50/2,
    borderColor: Colors.white,
    borderWidth: 2
  },
  smallCircleShapeView: {
    width: 40,
    height: 40,
    borderRadius: 40/2,
    borderColor: Colors.white,
    borderWidth: 2
  },
  card: {
    width: 108,
    height: 110,
    borderColor: Colors.borderColor,
    borderWidth: 0.4,
    marginLeft: 15,
    backgroundColor: Colors.white,
  },
  closemarkStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: Colors.blue,
    borderRadius: 20/2,
    borderColor: Colors.white,
    borderWidth: 2,
    top: -5,
    right: -10,
    zIndex: -5
  }
});
