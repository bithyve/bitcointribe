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

export default function KeeperDeviceHelpContents(props) {
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
          Recovery Keys on a Keeper Device
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
        <View style={{ height: hp('89%') }}>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginTop: hp('2%'), 
              marginLeft: wp('5%'),
              marginRight: wp('5%')
            }}
          >
            One of your five Recovery Keys can be delegated to a Keeper, which
            is a device on which you have Hexa installed. This device must be
            different from the one you are using right now
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('5%'), marginBottom: hp('5%') }}>
            <Image
              source={require('../../assets/images/icons/keeper_device_recovery_key.png')}
              style={{
                width: wp('90%'),
                height: wp('80%'),
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
              marginLeft: wp('5%'),
              marginRight: wp('5%')
            }}
          >
            If your Keeper Device is not accessible, it is possible to restore
            it using your primary device and one of your Keepers.
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('7%')}}>
            <View
              style={{
                borderStyle: 'dotted',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: Colors.white,
                width: wp('80%'),
                height: 0,
              }}
            />
          </View>
        </View>
        <View
          style={{
            height: hp('89%'),
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
              marginLeft: wp('5%'),
              marginRight: wp('5%')
            }}
          >
            The Keeper acts as the host of the Exit Key,which can be used to
            migrate from Hexa to another wallet at any time. The Keeper also
            stores the 2FA Key required to spend from the Savings Account
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: hp('5%'), marginBottom: hp('5%') }}>
            <Image
              source={require('../../assets/images/icons/keeper_device_recovery_key_2.png')}
              style={{
                width: wp('90%'),
                height: wp('80%'),
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
              marginLeft: wp('5%'),
              marginRight: wp('5%')
            }}
          >
            The Exit Key on the Keeper Device is an alphanumeric string that can
            be used to derive your addresses and private keys at any time. This
            string is also called a “mnemonic”.
          </Text>
        </View>
        <View
          style={{
            height: hp('89%'),
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
              marginLeft: wp('5%'),
              marginRight: wp('5%')
            }}
          >
            Your primary device has no access to the Exit Key. Therefore, a
            person with access to your primary device does not have access to
            your Savings Account
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center',  marginTop: hp('5%'), marginBottom: hp('5%') }}>
            <Image
              source={require('../../assets/images/icons/keeper_device_recovery_key_3.png')}
              style={{
                width: wp('90%'),
                height: wp('80%'),
                resizeMode: 'contain',
              }}
            />
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
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              To know more,
            </Text>
            <AppBottomSheetTouchableWrapper
              style={{ marginLeft: 5 }}
              onPress={() => openLink('https://en.bitcoin.it/wiki/Seed_phrase')}
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
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});
