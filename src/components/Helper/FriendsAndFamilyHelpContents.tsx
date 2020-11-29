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
import { ScrollView } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function FriendsAndFamilyHelpContents(props) {
  const scrollViewRef = useRef<ScrollView>();
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
          Recovery Key with Friends and Family
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
            justifyContent: 'space-between',
            marginTop: hp('2%'),
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: wp('5%'),
              marginRight: wp('5%'),
            }}
          >
            You can designate two of your friends/ family members as keepers of
            your Recovery Keys, if they have Hexa installed.
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/FnF_recovery_key.png')}
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
              marginLeft: wp('5%'),
              marginRight: wp('5%'),
            }}
          >
            Share a QR code or a link with your friends/ family members and ask
            them to open Hexa to act as your Keepers.
          </Text>
          <AppBottomSheetTouchableWrapper
            style={{ alignItems: 'center' }}
            onPress={() => {
              scrollViewRef.current &&
                scrollViewRef.current.scrollTo({
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
            marginTop: hp('2%'),
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
              marginRight: wp('5%'),
            }}
          >
            Hexa requires access to your phone’s Address Book to help you
            designate contacts as Keepers. This does not mean that BitHyve, the
            company behind Hexa, would have access to your personal information.
          </Text>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('6%'),
              marginBottom: hp('7%'),
            }}
          >
            <Image
              source={require('../../assets/images/icons/FnF_recovery_key_2.png')}
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
              marginLeft: wp('5%'),
              marginRight: wp('5%'),
            }}
          >
            Rest assured that the friends or family members you designate as
            Keepers would not have any access to your account information,
            including your bitcoin balance.
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
            height: hp('85%'),
            // paddingTop: hp('2%'),
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
              marginRight: wp('5%'),
            }}
          >
            Recovery Keys are sent through secure, encrypted channels called
            ECDH channels. These channels are encrypted end-to-end, enabling
            only the receiver and sender to decrypt their information.
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
              source={require('../../assets/images/icons/keeper_device_recovery_key_3.png')}
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
              marginRight: wp('5%'),
            }}
          >
            Creation of ECDH Channels is facilitated by the BitHyve Relay
            Server. After creation, however, the Relay Server (and others on the
            internet) is blind to all communications between the two parties.
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
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});
