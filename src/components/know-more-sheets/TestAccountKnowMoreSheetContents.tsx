import React, { useRef } from 'react';
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

export default function TestAccountKnowMoreSheetContents(props) {
  const scrollViewRef = useRef<ScrollView>();

  return (
    <View style={{ ...styles.modalContainer, ...props.containerStyle }}>
      <AppBottomSheetTouchableWrapper
        style={{ justifyContent: 'center', alignItems: 'center' }}
        activeOpacity={10}
        onPress={() => props.titleClicked && props.titleClicked()}
      >
        <Text style={styles.headerText}>Test Account</Text>
      </AppBottomSheetTouchableWrapper>
      <View style={styles.headerSeparator} />
      <ScrollView
        ref={scrollViewRef}
        style={{
          flex: 1,
          backgroundColor: Colors.blue,
        }}
        snapToInterval={hp('85%')}
        decelerationRate="fast"
      >
        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp('5%'),
              marginBottom: wp('3%'),
            }}
          >
            We realise that the world of Bitcoin could seem daunting. We’ve
            designed the Test Account to demystify some of the aura that Bitcoin
            has
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/test_account_info_1.png')}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
              // marginBottom: wp('15%'),
            }}
          >
            Learn to use Hexa with the Test Account. Think of this account as
            the wallet’s Training Wheels!
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
        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp('5%'),
              marginBottom: wp('3%'),
            }}
          >
            This account is loaded with test sats that you can send to your
            friends’ Test Accounts. This helps you learn to transact using real
            sats.
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/test_account_info_1.png')}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
              // marginBottom: wp('15%'),
            }}
          >
            Remember that test sats can only be sent to other wallets that also
            support test sats.
          </Text>
          <AppBottomSheetTouchableWrapper
            style={{ alignItems: 'center' }}
            onPress={() => {
              scrollViewRef.current &&
              scrollViewRef.current.scrollTo({
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
        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp('7%'),
            }}
          >
            With the Test Account, you can rest assured that, whatever you do, there would not be any harmful, “real world” consequences such as losing your sats or bitcoin. 
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/test_account_info_1.png')}
              style={styles.helperImage}
            />
          </View>
          <View style={styles.bottomLinkView}>
            <Text style={{ ...styles.infoText, marginLeft: 0, marginRight: 0 }}>
            Let your imagination run wild, try sending test sats to, and receiving sats, from multiple friends in different permutations and combinations.
            </Text>
            <View style={{ ...styles.linkView, marginTop: wp('7%') }}>
              <Text style={styles.toKnowMoreText}>To know more,</Text>
              <AppBottomSheetTouchableWrapper
                style={{ marginLeft: 5 }}
                onPress={() => openLink('https://en.bitcoin.it/wiki/Testnet')}
              >
                <Text style={styles.clickHereText}>click here</Text>
              </AppBottomSheetTouchableWrapper>
            </View>
          </View>
          <View style={{ ...styles.separatorView, marginBottom: wp('7%') }} />
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
    marginLeft: wp('10%'),
    marginRight: wp('10%'),
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
    height: hp('85%'),
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
    height: wp('65%'),
    resizeMode: 'contain',
  },
  bottomLinkView: {
    marginLeft: wp('10%'),
    marginRight: wp('10%'),
    marginBottom: wp('15%'),
  },
});
