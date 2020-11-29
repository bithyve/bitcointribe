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
import { ScrollView } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function DonationAccountHelpContents(props) {
  const scrollViewRef = useRef<ScrollView>();

  return (
    <View style={styles.modalContainer}>
      <AppBottomSheetTouchableWrapper
        style={styles.viewStyle}
        activeOpacity={10}
        onPress={() => props.titleClicked && props.titleClicked()}
      >
        <Text style={styles.headerText}>Donation Account</Text>
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
              marginTop: wp('4%'),
            }}
          >
            Your supporters can donate to your causes anonymously.
          </Text>
          <View style={styles.viewStyle}>
            <Image
              source={require('../../assets/images/icons/donationHelper.png')}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
              marginBottom: wp('4%'),
            }}
          >
            Source sats and bitcoin from around the world without hassle or worrying about the tech involved.
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
          <View style={styles.viewStyle}>
            <View
              style={{
                ...styles.separatorViewDotted,
                ...styles.separatorView,
              }}
            />
          </View>
        </View>

        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp('4%'),
            }}
          >
            Easily share your wallet address across platforms like chats, social
            media and your website
          </Text>
          <View style={styles.viewStyle}>
            <Image
              source={require('../../assets/images/icons/donationHelper2.png')}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
              marginBottom: wp('4%'),
            }}
          >
            Your donors simply have to scan a QR code to donate sats or bitcoin
          </Text>
          <View style={styles.viewStyle}>
            <View
              style={{
                ...styles.separatorViewDotted,
                ...styles.separatorView,
              }}
            />
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
  viewStyle: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  separatorViewDotted: {
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: Colors.white,
  },
});
