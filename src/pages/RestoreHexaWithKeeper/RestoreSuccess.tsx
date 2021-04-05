import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageBackground } from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';

export default function RestoreSuccess(props) {
  return (
    <View style={styles.modalContentContainer}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.headerTitleText}>
          Wallet Successfully{'\n'}Restored
        </Text>
        <Text style={styles.headerInfoText}>
          Congratulations! You can now use{'\n'}your{' '}
          <Text style={{ fontFamily: Fonts.FiraSansMediumItalic }}>Wallet</Text>
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={styles.greyBox}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/icon_wallet.png')}
              style={styles.greyBoxImage}
            />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.greyBoxText}>Hexa Wallet Backup</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                marginTop: hp('1%'),
              }}
            >
              <Image
                style={styles.cardBitCoinImage}
                source={require('../../assets/images/icons/icon_bitcoin_dark_grey.png')}
              />
              <Text style={styles.cardAmountTextGrey}>{'2,065,000'}</Text>
              <Text style={styles.cardAmountUnitText}>{'sats'}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.successModalAmountView}>
        <Text style={styles.bottomInfoText}>
          Your wallet has been successfully restored
        </Text>
      </View>
      <View style={styles.bottomButtonsView}>
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressProceed()}
          style={styles.successModalButtonView}
        >
          <Text style={styles.proceedButtonText}>Go to Wallet</Text>
        </AppBottomSheetTouchableWrapper>
        <Image
          source={require('../../assets/images/icons/illustration.png')}
          style={styles.successModalImage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: wp('1.5%'),
  },
  bottomInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: hp('1%'),
    marginTop: 'auto',
  },
  bottomButtonsView: {
    height: hp('15%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  transparentButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalHeaderView: {
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    marginTop: wp('4%'),
  },
  successModalAmountView: {
    justifyContent: 'center',
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    marginTop: 'auto',
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
  greyBox: {
    width: wp('90%'),
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  greyBoxImage: {
    width: wp('15%'),
    height: wp('15%'),
  },
  greyBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(20),
  },
  cardAmountUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  cardAmountTextGrey: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(18),
    marginRight: 5,
    marginTop: 'auto',
    lineHeight: RFValue(18),
  },
  cardBitCoinImage: {
    width: wp('3%'),
    height: wp('3%'),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp('0.7%'),
  },
  successModalImage: {
    width: wp('30%'),
    height: wp('35%'),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginRight: -5,
  },
});
