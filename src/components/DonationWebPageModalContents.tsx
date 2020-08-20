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
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function DonationWebPageModalContents(props) {

  return (
    <View style={styles.modalContentContainer}>
      <View style={{ height: '100%', marginHorizontal: wp('8%') }}>
        <View style={styles.successModalHeaderView}>
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(18),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            Donation Webpage
            </Text>
          <Text
            style={{
              ...styles.modalInfoText,
              marginTop: wp('1.5%'),
              color: Colors.lightTextColor,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </Text>
        </View>
        <View style={{ ...styles.rowContainer, marginTop: 20 }}>
          <Image style={styles.imageStyle} source={require('../assets/images/icons/icon_donation_total.png')} />
          <View style={styles.textContainer}>
            <Text style={styles.titleTextStyle}>Donation Total</Text>
            <Text style={{
              ...styles.modalInfoText,
              marginTop: wp('1.2%'),
              color: Colors.lightTextColor,
            }}>Lorem ipsum dolor sit amet</Text>
          </View>
        </View>
        <View style={styles.rowContainer}>
          <Image style={styles.imageStyle} source={require('../assets/images/icons/icon_donation_transactions.png')} />
          <View style={styles.textContainer}>
            <Text style={styles.titleTextStyle}>Donation Transactions</Text>
            <Text style={{
              ...styles.modalInfoText,
              marginTop: wp('1.2%'),
              color: Colors.lightTextColor,
            }}>Lorem ipsum dolor sit amet</Text>
          </View>
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.titleTextStyle}>Donation Link</Text>
          <Text style={styles.modalInfoText}>When someone wants to donate, they can simply click on this link which will serve up the donation page</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.backgroundColor1,
            height: 50,
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Text
            style={{
              color: Colors.lightBlue,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              paddingTop: 5,
            }}
            numberOfLines={1}
          >
            {'creating...'}
          </Text>
          <TouchableOpacity
            style={{
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              width: 50,
              height: 50,
              backgroundColor: '#E3E3E3',
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            <Image
              source={require('../assets/images/icons/icon_copy.png')}
              style={{ width: 50, height: 50 }}
              resizeMode='center'
            />
          </TouchableOpacity>
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.titleTextStyle}>Embed Code</Text>
          <Text style={styles.modalInfoText}>If you have a website, simply copy this code on your site to start receiving donations</Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginTop: wp('6%'),
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  titleTextStyle: {
    color: Colors.blue,
    fontSize: RFValue(14),
    fontFamily: Fonts.FiraSansRegular,
  },
  rowContainer: {
    flexDirection: 'row',
    height: 70,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  imageStyle: {
    width: 26,
    height: 26,
    resizeMode: 'center'
  },
  textContainer: {
    flex: 1,
    marginHorizontal: hp('1.2%'),
  },
  infoTextContainer: {
    marginTop: 20,
    marginHorizontal: hp('1.5%'),
  }
});
