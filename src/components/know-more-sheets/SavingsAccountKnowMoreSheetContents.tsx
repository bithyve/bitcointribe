import React, { useState, useRef } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import openLink from '../../utils/OpenLink';
import { ScrollView } from 'react-native-gesture-handler';

export default function SavingsAccountKnowMoreSheetContents(props) {
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
        snapToInterval={hp('85%')}
        decelerationRate="fast"
      >
        <View
          style={{
            height: hp('85%'),
            paddingBottom: hp('6%'),
            marginTop: hp('2%'),
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={styles.infoText}
          >
          Use this account to store, or hodl bitcoin and sats long term       
            </Text>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('5%'),
              marginBottom: hp('5%'),
            }}
          >
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
           style={{...styles.infoText, marginBottom: wp('8%'),}}
          >
            Be careful: If you end up sending sats from your Checking Account to your Savings Account and then decide to spend sats from your Savings Account, it will cost you much more in transaction fees every time
          </Text>
          <AppBottomSheetTouchableWrapper
            style={{ alignItems: 'center' }}
            onPress={() => {
              scrollViewRef.current?.scrollTo({
                x: 0,
                y: hp('85%'),
                animated: true,
              });
            }}
          >
            <FontAwesome
              name="angle-double-down"
              color={Colors.white}
              size={40}
            />
          </AppBottomSheetTouchableWrapper>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          {/* <View style={styles.separatorView}/> */}
          </View>
        </View>
        <View
          style={{
            height: hp('85%'),
            // paddingTop: hp('2%'),
            paddingBottom: hp('2%'),
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={styles.infoText}
          >
            The account needs you to set up a 2 Factor Authentication (2FA) system with your favorite authenticator software. This method makes it extremely hard for anyone but you to access your bitcoin
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
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
            style={styles.infoText}
          >
            Your 2FA code must be retrieved from your Keeper Device - do not ever set up 2 Factor Authentication for your Savings account on your wallet device, as this is a security risk
          </Text>
          <AppBottomSheetTouchableWrapper
            style={{ alignItems: 'center' }}
            onPress={() => {
              scrollViewRef.current?.scrollTo({
                x: 0,
                y: hp('170%'),
                animated: true,
              });
            }}
          >
            <FontAwesome
              name="angle-double-down"
              color={Colors.white}
              size={40}
            />
          </AppBottomSheetTouchableWrapper>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          {/* <View style={styles.separatorView}/> */}
          </View>
        </View>
        <View
          style={{
            height: hp('85%'),
            marginTop: hp('2%'),
          }}
        >
          <Text
            style={styles.infoText}
          >
            Your Savings Account is a 2-of-3 multi-signature account where you hold two keys (one on this device and the other on your Keeper Device)
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('6%'), marginBottom: hp('6%') }}>
            <Image
              source={require('../../assets/images/icons/savings_account_info_2.png')}
              style={{
                width: wp('90%'),
                height: wp('70%'),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={styles.infoText}
          >
            BitHyve holds the third key which is used only when you sign first and present the correct 2FA code. BitHyve never custodies any of your funds. The key held on the Keeper Device can be used to migrate your funds from Hexa, even if we stop supporting the app!
          </Text>
          
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
  infoText:{
    textAlign: 'center',
  color: Colors.white,
  fontSize: RFValue(13),
  fontFamily: Fonts.FiraSansRegular,
  marginLeft: wp('8%'),
  marginRight: wp('8%'),
},
separatorView: {
  borderStyle: 'dotted',
  borderWidth: 1,
  borderRadius: 1,
  borderColor: Colors.white,
  width: wp('70%'),
  height: 0,
  marginBottom: wp('1%'),
  marginTop: wp('1%'),
}
});
