import React, { useState, memo } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RFValue } from 'react-native-responsive-fontsize';
import BottomInfoBox from './BottomInfoBox';
import { nameToInitials } from '../common/CommonFunctions';

const ShareContactRequest = ({ SelectedContact, navigation, headerText, headerSubText, isDoneButton, contactHeader,noteHeader, note, createTrustedContact, sendViaQr, sendViaLink }) => {
  
  return (
    <View style={styles.modalContainer}>
      <View style={styles.headerView}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                ...styles.modalHeaderTitleText,
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              {headerText}{' '}
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
                paddingTop: 5,
              }}
            >
              {headerSubText}
            </Text>
          </View>
          {isDoneButton ? <TouchableOpacity
            onPress={() => {
              createTrustedContact();
              navigation.goBack();
            }}
            style={{
              height: wp('8%'),
              width: wp('18%'),
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.lightBlue,
              justifyContent: 'center',
              borderRadius: 8,
              alignSelf: 'center',
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              Done
            </Text>
          </TouchableOpacity> : null}
        </View>
      </View>
      <View style={styles.contactProfileView}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              backgroundColor: Colors.backgroundColor1,
              height: 90,
              position: 'relative',
              borderRadius: 10,
            }}
          >
            <View style={{ marginLeft: 70 }}>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(11),
                  marginLeft: 25,
                  paddingTop: 5,
                  paddingBottom: 3,
                }}
              >
                {contactHeader}
              </Text>
              <Text style={styles.contactNameText}>
                {SelectedContact.firstName && SelectedContact.lastName
                  ? SelectedContact.firstName + ' ' + SelectedContact.lastName
                  : SelectedContact.firstName && !SelectedContact.lastName
                  ? SelectedContact.firstName
                  : !SelectedContact.firstName && SelectedContact.lastName
                  ? SelectedContact.lastName
                  : ''}
              </Text>
              {SelectedContact.phoneNumbers && SelectedContact.phoneNumbers.length ? (
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(10),
                    marginLeft: 25,
                    paddingTop: 3,
                  }}
                >
                  {SelectedContact.phoneNumbers[0].digits}
                </Text>
              ) : SelectedContact.emails && SelectedContact.emails.length ? (
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(10),
                    marginLeft: 25,
                    paddingTop: 3,
                    paddingBottom: 5,
                  }}
                >
                  {SelectedContact.emails[0].email}
                </Text>
              ) : null}
            </View>
          </View>
          {SelectedContact.imageAvailable ? (
            <View
              style={{
                position: 'absolute',
                marginLeft: 15,
                marginRight: 15,
                alignItems: 'center',
                justifyContent: 'center',
                shadowOpacity: 1,
                shadowOffset: { width: 2, height: 2 },
              }}
            >
              <Image
                source={SelectedContact.image}
                style={{ ...styles.contactProfileImage }}
              />
            </View>
          ) : (
            <View
              style={{
                position: 'absolute',
                marginLeft: 15,
                marginRight: 15,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.backgroundColor,
                width: 70,
                height: 70,
                borderRadius: 70 / 2,
                shadowColor: Colors.shadowBlue,
                shadowOpacity: 1,
                shadowOffset: { width: 2, height: 2 },
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: RFValue(20),
                  lineHeight: RFValue(20), //... One for top and one for bottom alignment
                }}
              >
                {nameToInitials(
                  SelectedContact.firstName && SelectedContact.lastName
                    ? SelectedContact.firstName + ' ' + SelectedContact.lastName
                    : SelectedContact.firstName && !SelectedContact.lastName
                    ? SelectedContact.firstName
                    : !SelectedContact.firstName && SelectedContact.lastName
                    ? SelectedContact.lastName
                    : '',
                )}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={{ marginTop: 'auto' }}>
        <View style={{ marginBottom: hp('1%') }}>
          <BottomInfoBox
            title={noteHeader}
            infoText={note}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: Colors.blue,
            height: 60,
            borderRadius: 10,
            marginLeft: 25,
            marginRight: 25,
            marginBottom: hp('4%'),
            justifyContent: 'space-evenly',
            alignItems: 'center',
            shadowColor: Colors.shadowBlue,
            shadowOpacity: 1,
            shadowOffset: { width: 15, height: 15 },
          }}
        >
          <TouchableOpacity
            onPress={() => {
              createTrustedContact();
              sendViaLink();
            }}
            style={styles.buttonInnerView}
          >
            <Image
              source={require('../assets/images/icons/openlink.png')}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
          <View
            style={{ width: 1, height: 30, backgroundColor: Colors.white }}
          />
          <TouchableOpacity
            style={styles.buttonInnerView}
            onPress={() => {
              createTrustedContact();
              sendViaQr();
            }}
          >
            <Image
              source={require('../assets/images/icons/qr-code.png')}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    width: '100%',
  },
  headerView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  contactProfileView: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: hp('1.7%'),
  },
  contactProfileImage: {
    borderRadius: 60 / 2,
    width: 60,
    height: 60,
    resizeMode: 'cover',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('30%'),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
  commModeModalInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginLeft: 25,
    marginRight: 25,
    marginTop: hp('0.7%'),
  },
});
export default memo(ShareContactRequest);