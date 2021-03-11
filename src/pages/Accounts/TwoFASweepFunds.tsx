import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  Image,
  Keyboard,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import BottomInfoBox from '../../components/BottomInfoBox';
import { ScrollView } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import Slider from 'react-native-slider';
import { clearTransfer, transferST1 } from '../../store/actions/accounts';
import { SECURE_ACCOUNT } from '../../common/constants/wallet-service-types';

export default function TwoFASweepFunds(props) {
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const dispatch = useDispatch();
  const [averageTxFees, setAverageTxFees] = useState(props.averageTxFees);
  const serviceType = SECURE_ACCOUNT;
  const sweepSecure = true;
  const { transfer, loading, service } = useSelector(
    (state) => state.accounts[serviceType],
  );
  const wallet = service.secureHDWallet;
  const [netBalance, setNetBalance] = useState(
    wallet.balances.balance + wallet.balances.unconfirmedBalance,
  );
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderValueText, setSliderValueText] = useState('Low Fee');
  const [isInvalidBalance, setIsInvalidBalance] = useState(false);
  const [isInvalidAddress, setIsInvalidAddress] = useState(true);
  // const [SendSuccessBottomSheet, setSendSuccessBottomSheet] = useState(
  //   React.createRef(),
  // );
  const [isEditable, setIsEditable] = useState(true);
  const viewRef = useRef(null);
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

  const checkBalance = () => {
    setIsConfirmDisabled(true);
    if (
      netBalance <
      Number(amount) +
        Number(
          averageTxFees[
            sliderValueText === 'Low Fee'
              ? 'low'
              : sliderValueText === 'In the middle'
              ? 'medium'
              : 'high'
          ].averageTxFee,
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
      const recipients = [
        { address: recipientAddress, amount: parseInt(amount) },
      ];
      dispatch(transferST1(serviceType, recipients, averageTxFees));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      <View style={{ ...styles.modalContentContainer, marginTop: 10 }}>
        <ScrollView style={styles.qrModalScrollView}>
          <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppBottomSheetTouchableWrapper
                onPress={() => props.navigation.goBack()}
                style={{ height: 30, width: 30, justifyContent: 'center' }}
                hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
              >
                <FontAwesome
                  name="long-arrow-left"
                  color={Colors.blue}
                  size={17}
                />
              </AppBottomSheetTouchableWrapper>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.modalHeaderTitleText}>{'Sweep Funds'}</Text>
              </View>
            </View>
          </View>
          <View style={{ flex: 1, marginTop: wp('2%') }}>
            <View style={styles.modalContentContainer}>
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS == 'ios' ? 'padding' : ''}
                enabled
              >
                <ScrollView>
                  <View onStartShouldSetResponder={() => true}>
                    <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                      <View style={styles.textBoxView}>
                        <TextInput
                          // ref={refs => setTextContactNameRef(refs)}
                          editable={isEditable}
                          style={styles.textBox}
                          placeholder={'Address'}
                          keyboardType={
                            Platform.OS == 'ios'
                              ? 'ascii-capable'
                              : 'visible-password'
                          }
                          value={recipientAddress}
                          onChangeText={setRecipientAddress}
                          placeholderTextColor={Colors.borderColor}
                          onKeyPress={(e) => {
                            if (e.nativeEvent.key === 'Backspace') {
                              setTimeout(() => {
                                setIsInvalidAddress(true);
                              }, 10);
                            }
                          }}
                          onBlur={() => {
                            const instance =
                              service.hdWallet || service.secureHDWallet;
                            let isAddressValid = instance.isValidAddress(
                              recipientAddress,
                            );
                            setIsInvalidAddress(isAddressValid);
                          }}
                          autoCorrect={false}
                          autoFocus={false}
                          autoCompleteType="off"
                        />
                        <AppBottomSheetTouchableWrapper
                          style={styles.contactNameInputImageView}
                          onPress={() => props.onPressQrScan()}
                        >
                          <Image
                            style={styles.textBoxImage}
                            source={require('../../assets/images/icons/qr-code.png')}
                          />
                        </AppBottomSheetTouchableWrapper>
                      </View>
                      {!isInvalidAddress ? (
                        <View style={{ marginLeft: 'auto' }}>
                          <Text style={styles.errorText}>
                            Enter correct address
                          </Text>
                        </View>
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
                          placeholder={'Enter amount in sats'}
                          value={amount}
                          returnKeyLabel="Done"
                          returnKeyType="done"
                          keyboardType={'numeric'}
                          onChangeText={(value) => setAmount(value)}
                          placeholderTextColor={Colors.borderColor}
                          onKeyPress={(e) => {
                            if (e.nativeEvent.key === 'Backspace') {
                              setTimeout(() => {
                                setIsInvalidBalance(false);
                              }, 10);
                            }
                          }}
                        />
                      </View>
                      {isInvalidBalance ? (
                        <View style={{ marginLeft: 'auto' }}>
                          <Text style={styles.errorText}>
                            Insufficient balance
                          </Text>
                        </View>
                      ) : null}
                      <View style={{ ...styles.textBoxView }}>
                        <TextInput
                          // ref={refs => setDescriptionRef(refs)}
                          editable={isEditable}
                          // multiline={true}
                          // numberOfLines={4}
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
                          placeholder={'Description (Optional)'}
                          value={description}
                          onChangeText={setDescription}
                          placeholderTextColor={Colors.borderColor}
                          autoCorrect={false}
                          autoFocus={false}
                          autoCompleteType="off"
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
                        <View
                          style={{ flexDirection: 'row' }}
                          ref={viewRef}
                          collapsable={false}
                        >
                          <TouchableWithoutFeedback
                            onPressIn={tapSliderHandler}
                          >
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
                            {averageTxFees
                              ? averageTxFees['low'].averageTxFee
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
                            {averageTxFees
                              ? averageTxFees['medium'].averageTxFee
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
                            {averageTxFees
                              ? averageTxFees['high'].averageTxFee
                              : ''}
                            {' sats'})
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
                      <AppBottomSheetTouchableWrapper
                        onPress={() => {
                          props.onPressConfirmSweep();
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
                        {loading.transfer && !isInvalidBalance ? (
                          <ActivityIndicator
                            size="small"
                            color={Colors.white}
                          />
                        ) : (
                          <Text style={styles.buttonText}>Confirm & Send</Text>
                        )}
                      </AppBottomSheetTouchableWrapper>
                      <AppBottomSheetTouchableWrapper
                        style={{
                          ...styles.confirmButtonView,
                          width: wp('30%'),
                        }}
                        onPress={() => props.onPressCancel()}
                      >
                        <Text
                          style={{ ...styles.buttonText, color: Colors.blue }}
                        >
                          Cancel
                        </Text>
                      </AppBottomSheetTouchableWrapper>
                    </View>
                    <View
                      style={{
                        marginBottom: hp('5%'),
                      }}
                    >
                      <BottomInfoBox
                        title={'Amount'}
                        infoText={
                          'The amount pre-filled is the total number of bitcoin presently in your Secure Account'
                        }
                      />
                    </View>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  qrModalScrollView: {
    display: 'flex',
    backgroundColor: Colors.white,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('2%'),
    paddingTop: hp('2%'),
    marginLeft: wp('4%'),
    marginRight: wp('4%'),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
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
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  confirmButtonView: {
    width: wp('50%'),
    height: wp('13%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
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
});
