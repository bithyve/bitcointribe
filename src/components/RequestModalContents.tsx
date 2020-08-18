import React, { Component, useState, useCallback, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BottomSheet from 'reanimated-bottom-sheet';
import { nameToInitials } from '../common/CommonFunctions';
import DeviceInfo from 'react-native-device-info';
import SmallHeaderModal from './SmallHeaderModal';
import SendViaQR from './SendViaQR';
import SendViaLink from './SendViaLink';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';

export default function RequestModalContents(props) {
  
  const contact = props.contact;
  const [Contact, setContact] = useState(props.contact ? props.contact : {});
  // console.log("Contact", Contact, props.contact);

  useEffect(() => {
    if (contact) {
      setContact(props.contact);
    }
  }, [contact]);

  const setPhoneNumber = () =>{
    let phoneNumber = Contact.phoneNumbers[0].number;
    let number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
    number = number.slice(number.length - 10); // last 10 digits only
    return number;
  }
  
  return (
    <View style={{ ...styles.modalContentContainer, height: '100%' }}>
      <View style={{ height: '100%' }}>
        <View style={{ marginTop: hp('3.5%'), marginBottom: hp('2%') }}>
          <Text style={styles.commModeModalHeaderText}>
            Request Recovery Key{'\n'}from Friends and Family
          </Text>
          <Text style={styles.commModeModalInfoText}>
            Request Key from Friends and Family, you can change your Keeper, or their primary mode of contact
          </Text>
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
                {props.textHeader ? (
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
                    {props.textHeader}
                  </Text>
                ) : null}
                <Text style={styles.contactNameText}>
                  {Contact && Contact.firstName && Contact.lastName
                    ? Contact.firstName + ' ' + Contact.lastName
                    : Contact && Contact.firstName && !Contact.lastName
                    ? Contact.firstName
                    : Contact && !Contact.firstName && Contact.lastName
                    ? Contact.lastName
                    : ''}
                </Text>
                {Contact &&
                Contact.phoneNumbers &&
                Contact.phoneNumbers.length ? (
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontFamily: Fonts.FiraSansRegular,
                      fontSize: RFValue(10),
                      marginLeft: 25,
                      paddingTop: 3,
                    }}
                  >
                    {setPhoneNumber()}
                    {/* {Contact.phoneNumbers[0].digits} */}
                  </Text>
                ) : Contact && Contact.emails && Contact.emails.length ? (
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
                    {Contact && Contact.emails[0].email}
                  </Text>
                ) : null}
              </View>
            </View>
            {Contact && Contact.imageAvailable ? (
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
                  source={Contact && Contact.image}
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
                    Contact && Contact.firstName && Contact.lastName
                      ? Contact.firstName + ' ' + Contact.lastName
                      : Contact && Contact.firstName && !Contact.lastName
                      ? Contact.firstName
                      : Contact && !Contact.firstName && Contact.lastName
                      ? Contact.lastName
                      : '',
                  )}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text
          style={{ ...styles.commModeModalInfoText, marginBottom: hp('3.5%') }}
        >
          You can choose to request the Key via phone or email or via QR if
          your contact is nearby
        </Text>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: Colors.blue,
            height: 60,
            borderRadius: 10,
            marginLeft: 25,
            marginRight: 25,
            marginTop: 'auto',
            marginBottom: hp('4%'),
            justifyContent: 'space-evenly',
            alignItems: 'center',
            shadowColor: Colors.shadowBlue,
            shadowOpacity: 1,
            shadowOffset: { width: 15, height: 15 },
          }}
        >
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressViaLink()}
            style={styles.buttonInnerView}
          >
            <Image
              source={require('../assets/images/icons/openlink.png')}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Share</Text>
          </AppBottomSheetTouchableWrapper>
          <View
            style={{ width: 1, height: 30, backgroundColor: Colors.white }}
          />
          <AppBottomSheetTouchableWrapper
            style={styles.buttonInnerView}
            onPress={()=>props.onPressViaQr()}
          >
            <Image
              source={require('../assets/images/icons/qr-code.png')}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>QR</Text>
          </AppBottomSheetTouchableWrapper>
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
  commModeModalHeaderText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(18),
    marginLeft: 25,
    marginRight: 25,
  },
  commModeModalInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginLeft: 25,
    marginRight: 25,
    marginTop: hp('0.7%'),
  },
  contactProfileView: {
    flexDirection: 'row',
    marginLeft: 25,
    marginRight: 25,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('3.5%'),
    marginTop: hp('1.7%'),
  },
  contactProfileImage: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
    borderRadius: 70 / 2,
  },
  contactNameText: {
    color: Colors.black,
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
});
