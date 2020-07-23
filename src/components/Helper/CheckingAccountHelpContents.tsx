import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Linking,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function CheckingAccountHelpContents(props) {
  const openLink = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  return (
    <View style={styles.modalContainer}>
      <AppBottomSheetTouchableWrapper
        style={{ justifyContent: 'center', alignItems: 'center' }}
        activeOpacity={10}
        onPress={() => props.titleClicked && props.titleClicked()}
      >
        <Text
          style={styles.headerText}
        >
          Checking Account
        </Text>
      </AppBottomSheetTouchableWrapper>
      <View style={styles.headerSeparator} />
      <ScrollView
         style={{
          flex: 1,
          backgroundColor: Colors.blue,
        }}
        snapToInterval={hp('89%')}
        decelerationRate="fast"
      >
         <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp('5%'),
            }}
          >
            The Checking Account is designed as an account that you plan to
            use in the short term. Funds in the Checking Account can be
            spent immediately without 2FA confirmation, and carries lower
            fees compared to the Savings Account
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/checking_account_info_1.png')}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
              marginBottom: wp('5%'),
            }}
          >
            Since the Checking Account does not require 2FA confirmation
            for spending, a person using your phone and knowing your
            passcode will be able to spend your bitcoin. Hence, for
            storing more funds or for spending infrequently, please store
            your bitcoin in the Savings Account
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              borderStyle: 'dotted',
              borderWidth: 1,
              borderRadius: 1,
              borderColor: Colors.white,
              ...styles.separatorView,
            }}
          />
          </View>
        </View>
        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp('5%'),
            }}
          >
            The Checking Account is a single signature account as compared
            to the multi signature Savings Account, and does not require
            2FA confirmation for spending. This smaller requirement
            results in a lesser fee compared to the Savings Account
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/test_account_info_2.png')}
              style={styles.helperImage}
            />
          </View>
          <View style={styles.bottomLinkView}>
            <Text style={{...styles.infoText, marginLeft: 0, marginRight: 0,}}>
            Use this account to store small amounts for daily use
          </Text>
          <View style={{...styles.linkView, marginTop: wp('7%')}}>
            <Text
              style={styles.toKnowMoreText}
            >
              To read more,
            </Text>
            <AppBottomSheetTouchableWrapper
              style={{ marginLeft: 5 }}
              onPress={() =>
                openLink(
                  'https://en.bitcoin.it/wiki/Techniques_to_reduce_transaction_fees',
                )
              }
            >
              <Text
                style={styles.clickHereText}>
                click here
              </Text>
            </AppBottomSheetTouchableWrapper>
          </View>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(20),
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  headerSeparator: {
    backgroundColor: Colors.homepageButtonColor,
    height: 1,
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    marginBottom: hp('1%'),
  },
  infoText: {
    textAlign: 'center',
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: wp('8%'),
    marginRight: wp('8%'),
  },
  clickHereText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  toKnowMoreText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  linkView: {
    flexDirection: 'row',
    marginLeft: wp('10%'),
    marginRight: wp('10%'),
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ElementView: {
    height: hp('89%'),
    justifyContent: 'space-between',
  },
  separatorView: {
    width: wp('70%'),
    height: 0,
    alignSelf: 'center',
    marginBottom: wp('1%'),
  },
  helperImage: {
    width: wp('80%'),
    height: wp('60%'),
    resizeMode: 'contain',
  },
  bottomLinkView: {
    marginLeft: wp('10%'),
    marginRight: wp('10%'),
    marginBottom: wp('15%'),
  },
});
