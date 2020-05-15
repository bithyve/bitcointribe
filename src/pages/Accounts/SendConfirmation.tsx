import React, { useState, useEffect, useRef } from 'react';
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
  FlatList
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import BottomInfoBox from '../../components/BottomInfoBox';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Slider from 'react-native-slider';
import { useDispatch, useSelector } from 'react-redux';
import { storeContactsAccountToSend, removeContactsAccountFromSend } from '../../store/actions/send-action';
import { remove } from '../../storage/secure-store';

export default function SendConfirmation(props) {

  const dispatch = useDispatch();

  const accounts = useSelector((state) => state.accounts);
  const [exchangeRates, setExchangeRates] = useState(accounts && accounts.exchangeRates);
  useEffect(() => {
    if (accounts && accounts.exchangeRates) setExchangeRates(accounts.exchangeRates);
  }, [accounts.exchangeRates]);
  const sendStorage = useSelector((state) => state.sendReducer.sendStorage);

  const selectedContact = props.navigation.getParam('selectedContact');

  const [switchOn, setSwitchOn] = useState(true);
  const [CurrencyCode, setCurrencyCode] = useState('USD');
  const [bitcoinAmount, setBitCoinAmount] = useState('');
  const [currencyAmount, setCurrencyAmount] = useState('');
  
  const [note, setNote] = useState('');

  const removeFromSendStorage = (item) => {
    dispatch(removeContactsAccountFromSend(item));
  }

  const viewRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderValueText, setSliderValueText] = useState('Low Fee');
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

  const renderSingleContact = ({ item, index }) => {
    return (
      <View style={{ flexDirection: 'column' }}>
        <TouchableOpacity>
          <View 
            style={{
              ...styles.textBoxView,
              flexDirection: 'row',
              marginTop: hp('2%'),
              justifyContent: 'center',
              backgroundColor: Colors.backgroundColor1
            }}>
            <Image style={{ ...styles.circleShapeView, margin: 10 }} source={require('../../assets/images/icons/icon_contact.png')} resizeMode="contain" />
            <View style={{ flex: 1, margin: 10, justifyContent: 'center' }}>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(10),
                  fontFamily: Fonts.FiraSansRegular,
                }}>
                Sending to:
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(20),
                  fontFamily: Fonts.FiraSansRegular,
                }}>
                {item.selectedContact.name || item.selectedContact.account_name}
              </Text>
              <Text
                style={{
                  color: Colors.blue,
                  fontSize: RFValue(10),
                  fontFamily: Fonts.FiraSansRegular,
                }}>
                  {`${item.bitcoinAmount} Sats`}
                {/* {switchOn ? `${item.bitcoinAmount} Sats` : '$'+`${currencyAmount}`} */}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'center', marginEnd: 20, marginStart: 20 }}>
              <Image style={{ width: 12, height: 12 }}
                source={require('../../assets/images/icons/icon_arrow_down.png')} resizeMode="contain"/>
            </View>
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

  const renderBitCoinAmountText = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
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
            marginLeft: 10
          }}>
          2000
        </Text>
        <Text
          style={{
            color: Colors.textColorGrey,
            fontSize: RFValue(13),
            fontFamily: Fonts.FiraSansRegular,
          }}>
          { ' sats' }
        </Text>
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
          <ScrollView nestedScrollEnabled={true} style={{ marginBottom: 20 }}>
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
                    <Text style={styles.modalHeaderTitleText}>{'Send Confirmation'}</Text>
                  </View>
                </View>
                <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 15 }}>
                  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{ flex: 1, flexDirection: 'row', marginBottom: 5 }}>
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansRegular,
                        }}>
                        Sending From:
                      </Text>
                      <Text
                        style={{
                          color: Colors.blue,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansRegular,
                        }}>
                        Saving Account
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 1,  flexDirection: 'row', alignItems: 'center' }}>
                    <FlatList
                      nestedScrollEnabled={true}
                      data={sendStorage}
                      renderItem={renderSingleContact}
                      keyExtractor={(item, index) => index.toString()}
                    />
                  </View>
                  {renderDivider()}
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        color: Colors.blue,
                        fontSize: RFValue(13),
                        fontFamily: Fonts.FiraSansRegular,
                      }}>
                      Total Amount
                    </Text>
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                      {renderBitCoinAmountText()}
                    </View>
                  </View>
                  {renderDivider()}
                  <View style={{ flex: 1 }}>
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
                      <View
                        style={{ flexDirection: 'row' }}
                        // ref={viewRef}
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
                          {'Low Fee\n'} 
                          {/* ({averageTxFees ? averageTxFees['low'].averageTxFee : ''}
                          {serviceType === TEST_ACCOUNT ? ' t-sats' : ' sats'}) */}
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
                          {'In the middle\n'} 
                          {/* ({averageTxFees
                            ? averageTxFees['medium'].averageTxFee
                            : ''}
                          {serviceType === TEST_ACCOUNT ? ' t-sats' : ' sats'}) */}
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
                          {'Fast Transaction\n'} 
                          {/* ({averageTxFees
                            ? averageTxFees['high'].averageTxFee
                            : ''}
                          {serviceType === TEST_ACCOUNT ? ' t-sats' : ' sats'}) */}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{ marginTop: hp('3%') }} >
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
                      marginLeft: 20,
                      marginRight: 20
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        props.navigation.goBack();
                      }}
                      style={{
                        ...styles.confirmButtonView,
                        backgroundColor: Colors.blue,
                        elevation: 10,
                        shadowColor: Colors.shadowBlue,
                        shadowOpacity: 1,
                        shadowOffset: { width: 15, height: 15 }
                      }}
                    >
                      {/* {loading.transfer && !isInvalidBalance ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : ( */}
                        <Text style={styles.buttonText}>{'Confirm & Send'}</Text>
                      {/* )} */}
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
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
    width: 62,
    height: 62,
    borderRadius: 62/2,
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
