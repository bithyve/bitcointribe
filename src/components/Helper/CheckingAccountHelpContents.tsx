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
          style={{
            color: Colors.white,
            fontFamily: Fonts.FiraSansMedium,
            fontSize: RFValue(20),
            marginTop: hp('1%'),
            marginBottom: hp('1%'),
          }}
        >
          Checking Account
        </Text>
      </AppBottomSheetTouchableWrapper>
      <View
        style={{
          backgroundColor: Colors.homepageButtonColor,
          height: 1,
          marginLeft: wp('5%'),
          marginRight: wp('5%'),
          marginBottom: hp('1%'),
        }}
      />
      <ScrollView
        style={styles.modalContainer}
        snapToInterval={hp('89%')}
        decelerationRate="fast"
      >
        <View
          style={{
            height: hp('89%'),
            justifyContent: 'space-between',
            paddingBottom: hp('6%'),
            marginTop: hp('1%'),
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            The Checking Account is designed as an account{'\n'}that you plan to
            use in the short term. Funds in{'\n'}the Checking Account can be
            spent immediately{'\n'}without 2FA confirmation, and carries lower
            fees{'\n'}compared to the Savings Account
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/checking_account_info_1.png')}
              style={{
                width: wp('90%'),
                height: wp('90%'),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            Since the Checking Account does not require{'\n'}2FA confirmation
            for spending, a person using your{'\n'}phone and knowing your
            passcode will {'\n'}be able to spend your bitcoin. Hence, for {'\n'}
            storing more funds or for spending infrequently, {'\n'}please store
            your bitcoin in the Savings Account
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View
              style={{
                borderStyle: 'dotted',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: Colors.white,
                width: wp('70%'),
                height: 0,
              }}
            />
          </View>
        </View>
        <View
          style={{
            height: hp('89%'),
            justifyContent: 'space-between',
            paddingTop: hp('2%'),
            paddingBottom: hp('6%'),
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            The Checking Account is a single signature{'\n'}account as compared
            to the multi signature{'\n'}Savings Account, and does not require
            2FA confirmation {'\n'}for spending. This smaller requirement
            results in{'\n'}a lesser fee compared to the Savings Account
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/test_account_info_2.png')}
              style={{
                width: wp('90%'),
                height: wp('90%'),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            Use this account to store small{'\n'}amounts for daily use
          </Text>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: wp('10%'),
              marginRight: wp('10%'),
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Text
              style={{
                color: Colors.white,
                // textAlign: 'center',
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              To read more,
            </Text>
            <TouchableOpacity
              style={{ marginLeft: 5 }}
              onPress={() =>
                openLink(
                  'https://en.bitcoin.it/wiki/Techniques_to_reduce_transaction_fees',
                )
              }
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue(13),
                  fontFamily: Fonts.FiraSansRegular,
                  textDecorationLine: 'underline',
                  textAlign: 'center',
                }}
              >
                click here
              </Text>
            </TouchableOpacity>
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
    paddingBottom: hp('4%'),
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});
