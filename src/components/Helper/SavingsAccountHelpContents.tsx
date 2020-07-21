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

export default function SavingsAccountHelpContents(props) {
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
          Savings Account
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
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            The Savings Account is designed as an account{'\n'}where you can
            store funds that you don’t plan{'\n'}to use in the short term. The
            Savings Account{'\n'}requires 2FA confirmation to authorise{'\n'}
            spending. The 2FA code must be retrieved{'\n'}from the Keeper App
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/savings_account_info_1.png')}
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
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            Spending from the Savings Account carries{'\n'}more fees compared to
            the Checking Account.{'\n'}This is in part, due to the requirement
            of {'\n'}2FA confirmation to confirm spending
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
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansRegular,
            }}
            >
                The Savings Account is designed as an account{'\n'}where you can store funds that you don’t plan{'\n'}to use in the short term. The Savings Account{'\n'}requires 2FA confirmation to authorise{'\n'}spending. The 2FA code must be retrieved{'\n'}from the 2FA App
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/savings_account_info_1.png')}
                    style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                />
            </View>
            <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            A multi signature account requires signatures from {'\n'}multiple
            keys. Hexa requires signatures{'\n'}from 2-of-3 keys, of which{'\n'}
            one key belongs to BitHyve signing server
          </Text>
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
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansRegular,
            }}
            >
                The Savings Account is a 2-of-3 multi signature{'\n'}account where you hold two keys (one on this{'\n'}device, the other on your Keeper device), and{'\n'}BitHyve holds one key. The key held on the{'\n'}Keeper device can be used to migrate from Hexa{'\n'}
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/savings_account_info_2.png')}
                    style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                />
            </View>
            <Text
                style={{
                    textAlign: 'center',
                    color: Colors.white,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansRegular,
                }}
            >
                  A multi signature account requires signatures from {'\n'}multiple keys. Hexa requires signatures{'\n'}from 2-of-3 keys, of which{'\n'}one key belongs to BitHyve signing server
            </Text>
        </View>
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
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              To read more,
            </Text>
            <TouchableOpacity
              style={{ marginLeft: 5 }}
              onPress={() =>
                openLink('https://en.bitcoin.it/wiki/Multisignature')
              }
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                  textDecorationLine: 'underline',
                  textAlign: 'center',
                }}
              >
                click here
              </Text>
            </TouchableOpacity>
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
    paddingBottom: hp('5%'),
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});
