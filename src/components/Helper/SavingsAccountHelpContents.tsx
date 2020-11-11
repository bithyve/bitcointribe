import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import openLink from '../../utils/OpenLink';

export default function SavingsAccountHelpContents(props) {
  const scrollViewRef = useRef<ScrollView>();

  return (
    <View style={{ ...styles.modalContainer, ...props.containerStyle }}>
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
        ref={scrollViewRef}
        style={styles.modalContainer}
        snapToInterval={hp('80%')}
        decelerationRate="fast"
      >
        <View
          style={{
            height: hp('80%'),
            paddingBottom: hp('6%'),
            marginTop: hp('1%'),
            justifyContent: 'space-between'
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
            The Savings Account is designed as an account{'\n'}where you can
            store funds that you don’t plan{'\n'}to use in the short term. The
            Savings Account{'\n'}requires 2FA confirmation to authorise{'\n'}
            spending. The 2FA code must be retrieved{'\n'}from the Keeper App
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('5%'), marginBottom: hp('5%') }}>
            <Image
              source={require('../../assets/images/icons/savings_account_info_1.png')}
              style={{
                width: wp('90%'),
                height: wp('70%'),
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
            Spending from the Savings Account carries{'\n'}more fees compared to
            the Checking Account.{'\n'}This is in part, due to the requirement
            of {'\n'}2FA confirmation to confirm spending
          </Text>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            scrollViewRef.current?.scrollTo({ x: 0, y: hp('80%'), animated: true });
          }}>
            <FontAwesome name="angle-double-down" color={Colors.white} size={40} />
          </TouchableOpacity>
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
            height: hp('80%'),
            // paddingTop: hp('2%'),
            paddingBottom: hp('2%'),
            justifyContent: 'space-between'
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
            The Savings Account is designed as an account{'\n'}where you can store funds that you don’t plan{'\n'}to use in the short term. The Savings Account{'\n'}requires 2FA confirmation to authorise{'\n'}spending. The 2FA code must be retrieved{'\n'}from the 2FA App
            </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/savings_account_info_1.png')}
              style={{ width: wp('90%'), height: wp('70%'), resizeMode: 'contain' }}
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
            A multi signature account requires signatures from {'\n'}multiple
            keys. Hexa requires signatures{'\n'}from 2-of-3 keys, of which{'\n'}
            one key belongs to BitHyve signing server
          </Text>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            scrollViewRef.current?.scrollTo({ x: 0, y: hp('162%'), animated: true });
          }}>
            <FontAwesome name="angle-double-down" color={Colors.white} size={40} />
          </TouchableOpacity>
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
            height: hp('80%'),
            marginTop: hp('2%'),
            justifyContent: 'space-between'
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
            The Savings Account is a 2-of-3 multi signature{'\n'}account where you hold two keys (one on this{'\n'}device, the other on your Keeper device), and{'\n'}BitHyve holds one key. The key held on the{'\n'}Keeper device can be used to migrate from Hexa{'\n'}
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/savings_account_info_2.png')}
              style={{ width: wp('90%'), height: wp('70%'), resizeMode: 'contain' }}
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
            A multi signature account requires signatures from {'\n'}multiple keys. Hexa requires signatures{'\n'}from 2-of-3 keys, of which{'\n'}one key belongs to BitHyve signing server
            </Text>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: wp('10%'),
              marginRight: wp('10%'),
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: hp('3%'),
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
            <AppBottomSheetTouchableWrapper
              style={{ marginLeft: 5 }}
              onPress={() =>
                openLink('https://en.bitcoin.it/wiki/Multisignature')
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
            </AppBottomSheetTouchableWrapper>
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
    paddingBottom: hp('3%'),
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});
