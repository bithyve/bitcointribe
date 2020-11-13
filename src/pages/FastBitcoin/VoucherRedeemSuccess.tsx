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

export default function VoucherRedeemSuccess(props) {
  return (
    <View style={styles.modalContentContainer}>
      <View>
        <View style={styles.successModalHeaderView}>
          <Text style={styles.modalTitleText}>
            Voucher redeemed successfully
          </Text>
          <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>
            Congratulations, the voucher has been redeemed successfully but bitcoin will be delivered and they should receive an email when that happens
          </Text>
        </View>
        <View style={styles.box}>
          <Text
            style={{
              fontSize: RFValue(25),
              fontFamily: Fonts.FiraSansRegular,
              color: Colors.gray5,
            }}
          >
            {props.accountName}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              marginTop: 15
            }}
          >
            <Image
              style={styles.cardBitCoinImage}
              source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
            />
            <Text style={{ ...styles.cardAmountText }}>
              {props.redeemAmount}
            </Text>
            <Text style={styles.cardAmountUnitText}>sats</Text>
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
          The funds will be available in your Checking Account after you receive a transaction confirmation email from FastBitcoins.
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
                <Text style={styles.proceedButtonText}>View Account</Text>
              )}
          </AppBottomSheetTouchableWrapper>
          <Image
            source={
              props.bottomImage
                ? props.bottomImage
                : require('../../assets/images/icons/illustration.png')
            }
            style={styles.successModalImage}
          />
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
    width: wp('4%'),
    height: wp('4%'),
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
    lineHeight: RFValue(21),
  },
  successModalImage: {
    width: wp('30%'),
    height: wp('35%'),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginRight: -5,
  },
});
