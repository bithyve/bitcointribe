import React from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import currencyIconSource from '../../utils/currency/currencyIconSource';

export default function QuoteConfirmation(props) {
  const currencySymbol = currencyIconSource(props.currencyCode, false)
  return (
    <View style={styles.modalContentContainer}>
      <View>
        <View style={styles.successModalHeaderView}>
          <Text style={styles.modalTitleText}>
            Confirm FastBitcoins{'\n'}Voucher Quote
          </Text>
          <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>
            The amount of sats for your voucher is shown below
          </Text>
        </View>
        <View style={styles.box}>
          <Text
            style={{
              fontSize: RFValue(10),
              fontFamily: Fonts.FiraSansMedium,
              color: Colors.lightTextColor,
            }}
          >
            Voucher {props.voucherNumber}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={{ flex: 2 }}>
              <Text style={{ ...styles.modalTitleText, fontSize: RFValue(12) }}>
                Purchased for
              </Text>
            </View>
            <View style={{ flex: 3 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                }}
              >
                <Image
                  style={styles.cardBitCoinImage}
                  source={currencySymbol}
                />
                <Text style={styles.cardAmountText}>{props.purchasedFor}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={{ flex: 2 }}>
              <Text style={{ ...styles.modalTitleText, fontSize: RFValue(12) }}>
                Redeem Amount
              </Text>
            </View>
            <View style={{ flex: 3 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                }}
              >
                <Image
                  style={styles.cardBitCoinImage}
                  source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                />
                <Text style={styles.cardAmountText}>{props.redeemAmount}</Text>
                <Text style={styles.cardAmountUnitText}>sats</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={{ flex: 2 }}>
              <Text
                style={{
                  ...styles.modalTitleText,
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                }}
              >
                Bitcoin Rate
              </Text>
            </View>
            <View style={{ flex: 3 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Image
                  style={{
                    ...styles.cardBitCoinImage,
                    width: wp('3.5%'),
                    height: wp('3.5%'),
                  }}
                  source={currencySymbol}
                />
                <Text
                  style={{
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansMedium,
                    color: Colors.lightTextColor,
                    lineHeight: RFValue(12),
                    marginRight: 5,
                  }}
                >
                  {props.bitcoinRate}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <Text
          style={{
            ...styles.modalInfoText,
            marginLeft: wp('8%'),
            marginRight: wp('8%'),
            marginBottom: wp('8%'),
          }}
        >
          Please proceed with redeeming the voucher
        </Text>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 'auto',
            alignItems: 'center',
          }}
        >
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressRedeem()}
            style={{ ...styles.successModalButtonView }}
          >
            {props.loading && props.loading == true ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.proceedButtonText}>Redeem Voucher</Text>
            )}
          </AppBottomSheetTouchableWrapper>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressBack()}
            style={{
              height: wp('13%'),
              width: wp('35%'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ ...styles.proceedButtonText, color: Colors.blue }}>
              Back
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  box: {
    backgroundColor: Colors.backgroundColor1,
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    padding: hp('2%'),
    marginBottom: hp('3%'),
    borderRadius: 10,
    justifyContent: 'center',
  },
  successModalHeaderView: {
    marginTop: hp('3%'),
    marginBottom: hp('3%'),
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
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
  cardBitCoinImage: {
    width: wp('5%'),
    height: wp('5%'),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp('1%'),
  },
  cardAmountText: {
    fontSize: RFValue(21),
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    marginRight: 5,
    marginTop: 'auto',
    lineHeight: RFValue(21),
  },
  cardAmountUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
});
