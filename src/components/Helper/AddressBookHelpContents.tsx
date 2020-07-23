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

export default function AddressBookHelpContents(props) {
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
        <Text style={styles.headerText}>Friends and Family</Text>
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
              marginTop: wp('10%'),
            }}
          >
            Friends and Family are contacts whom you know and trust, and those
            whom you transact with routinely. When transacting with Friends and
            Family, you are not required to ask them for a QR code when sending
            bitcoin
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/FnF_recovery_key_2.png')}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
              marginBottom: wp('15%'),
            }}
          >
            Selecting a contact as Friends and Family creates a secure channel
            between you and the contact. This secure channel enables easy
            exchange of information without requiring user action
          </Text>
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
              marginTop: wp('10%'),
            }}
          >
            Secure, encrypted channels are used to{'\n'}communicate your
            extended public key. An{'\n'}extended public key can be used by a
            peer to{'\n'}generate new addresses on your behalf.
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/test_account_info_2.png')}
              style={styles.helperImage}
            />
          </View>
          <View style={styles.bottomLinkView}>
            <Text style={{...styles.infoText, marginLeft: 0, marginRight: 0,}}>
              Possessing an extended public key does not allow one to gain
              possession of funds. This is because the contact does not possess
              your private key which affirms ownership of funds
            </Text>
            <View style={{...styles.linkView, marginTop: wp('7%')}}>
              <Text style={styles.toKnowMoreText}>To know more,</Text>
              <TouchableOpacity
                style={{ marginLeft: 5 }}
                onPress={() =>
                  openLink(
                    'https://en.wikipedia.org/wiki/Elliptic-curve_Diffie–Hellman',
                  )
                }
              >
                <Text style={styles.clickHereText}>click here</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.separatorView} />
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
    height: wp('65%'),
    resizeMode: 'contain',
  },
  bottomLinkView: {
    marginLeft: wp('10%'),
    marginRight: wp('10%'),
    marginBottom: wp('15%'),
  },
});
