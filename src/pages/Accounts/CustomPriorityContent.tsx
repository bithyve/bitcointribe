import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import DeviceInfo from 'react-native-device-info';

export default function CustomPriorityContent(props) {
  const [amount, setAmount] = useState('');
  const [customEstimatedBlock, setCustomEstimatedBlock] = useState(0);

  const onCustomFeeChange = useCallback(
    (value) => {
      const { feeRates } =
        props.service.hdWallet || props.service.secureHDWallet;

      if (feeRates) {
        const customFeeRatePerByte = parseInt(value);
        let customEstimatedBlock = 0;
        // handling extremes
        if (customFeeRatePerByte > feeRates['2']) {
          customEstimatedBlock = 1;
        } else if (customFeeRatePerByte < feeRates['144']) {
          customEstimatedBlock = 200;
        } else {
          const closestFeeRatePerByte = Object.values(feeRates).reduce(
            function (prev, curr) {
              return Math.abs(curr - customFeeRatePerByte) <
                Math.abs(prev - customFeeRatePerByte)
                ? curr
                : prev;
            },
          );

          const etimatedBlock = Object.keys(feeRates).find(
            (key) => feeRates[key] === closestFeeRatePerByte,
          );
          customEstimatedBlock = parseInt(etimatedBlock);
        }

        if (parseInt(value) >= 1) setCustomEstimatedBlock(customEstimatedBlock);
        else setCustomEstimatedBlock(0);
      }

      setAmount(value);
    },
    [props.service],
  );

  return (
    <View style={{ height: '100%', backgroundColor: Colors.white }}>
      <View
        style={{
          ...styles.successModalHeaderView,
          marginRight: wp('8%'),
          marginLeft: wp('8%'),
        }}
      >
        <Text style={styles.modalTitleText}>{props.title}</Text>
        <Text style={{ ...styles.modalInfoText, marginTop: wp('1%') }}>
          {props.info}
        </Text>
      </View>
      <TouchableOpacity
        style={{
          ...styles.inputBoxFocused,
          marginBottom: wp('1.5%'),
          marginTop: wp('1.5%'),
          marginRight: wp('8%'),
          marginLeft: wp('8%'),
          flexDirection: 'row',
          width: wp('80%'),
          height: wp('13%'),
        }}
      >
        <View style={styles.amountInputImage}>
          <Image
            style={styles.textBoxImage}
            source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
          />
        </View>
        <View style={styles.enterAmountView} />
        <TextInput
          style={{
            ...styles.textBox,
            flex: 1,
            paddingLeft: 10,
            height: wp('13%'),
            width: wp('45%'),
          }}
          placeholder={'sats/byte'}
          value={amount}
          returnKeyLabel="Done"
          returnKeyType="done"
          keyboardType={'numeric'}
          onChangeText={(value) => onCustomFeeChange(value)}
          placeholderTextColor={Colors.borderColor}
        />
      </TouchableOpacity>
      {props.err ? (
        <View style={{ marginRight: wp('8%'), marginLeft: wp('8%') }}>
          <Text style={styles.errorText}>{props.err}</Text>
        </View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          marginBottom: wp('1.5%'),
          marginTop: 20,
          marginRight: wp('8%'),
          marginLeft: wp('8%'),
        }}
      >
        <Text
          style={{
            color: Colors.black,
            fontSize: RFValue(11),
            fontFamily: Fonts.FiraSansMedium,
            marginRight: 5,
          }}
        >
          Arrival Time
        </Text>
        <Text
          style={{
            color: Colors.textColorGrey,
            fontSize: RFValue(11),
            fontFamily: Fonts.FiraSansItalic,
          }}
        >
          {customEstimatedBlock
            ? `~ ${customEstimatedBlock * 10} - ${
                (customEstimatedBlock + 1) * 10
              } minutes`
            : 'Calculating...'}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: wp('15%'),
          marginTop: 30,
        }}
      >
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressOk(amount, customEstimatedBlock)}
          style={{ ...styles.successModalButtonView }}
        >
          <Text style={styles.proceedButtonText}>{props.okButtonText}</Text>
        </AppBottomSheetTouchableWrapper>
        {props.isCancel && (
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressCancel()}
            style={{
              height: wp('13%'),
              width: wp('35%'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ ...styles.proceedButtonText, color: Colors.blue }}>
              {props.cancelButtonText}
            </Text>
          </AppBottomSheetTouchableWrapper>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  successModalHeaderView: {
    marginBottom: hp('1%'),
    marginTop: hp('1%'),
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
  successModalButtonView: {
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
    marginLeft: wp('8%'),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  inputBoxFocused: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.white,
  },
  amountInputImage: {
    width: 40,
    height: wp('13%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBoxImage: {
    width: wp('6%'),
    height: wp('6%'),
    resizeMode: 'contain',
  },
  enterAmountView: {
    width: 2,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },
  textBox: {
    fontSize: RFValue(13),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
  },
});
