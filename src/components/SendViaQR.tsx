import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BottomInfoBox from './BottomInfoBox';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';
import { nameToInitials } from '../common/CommonFunctions';
import { ScrollView } from 'react-native-gesture-handler';
import QRCode from 'react-native-qrcode-svg';

export default function SendViaQR(props) {
  const [receivingAddress, setReceivingAddress] = useState('http://hexawallet.io/trustedcontacts/ubcskuejm');
  const [contactName, setContactName] = useState('');

  const contact = props.contact;

  const [Contact, setContact] = useState(props.contact ? props.contact : {});
  useEffect(() => {
    if (contact) {
      setContact(props.contact);
    }
  }, [contact]);
  
    useEffect(()=>{
      let contactName =
    Contact && Contact.firstName && Contact.lastName
        ? Contact.firstName + ' ' + Contact.lastName
        : Contact && Contact.firstName && !Contact.lastName
        ? Contact.firstName
        : Contact && !Contact.firstName && Contact.lastName
        ? Contact.lastName
        : '';
    setContactName(contactName);
   },[Contact]);

  return (
    <View style={styles.modalContainer}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          paddingRight: 10,
          paddingBottom: hp('1.5%'),
          paddingTop: hp('1%'),
          marginLeft: 10,
          marginRight: 10,
          marginBottom: hp('1.5%'),
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              props.onPressBack();
            }}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalHeaderTitleText}>Send Request via QR</Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
                paddingTop: 5,
              }}
            >
              Lorem ipsum dolor sit amet, consec
            </Text>
          </View>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressDone()}
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
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
      <ScrollView style={{ marginLeft: 20,
    marginRight: 20,
    marginTop: hp('1.7%'),}}>
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
                {props.contactText ? (
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
                    {props.contactText}
                  </Text>
                ) : null}
                {contactName ? (
                  <Text style={styles.contactNameText}>{contactName}</Text>
                ) : null}
                {Contact && Contact.phoneNumbers.length ? <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(10),
                    marginLeft: 25,
                    paddingTop: 3,
                  }}
                >
                  {Contact && Contact.phoneNumbers[0].digits}
                </Text> : null }
                {Contact && Contact.emails.length ? <Text
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
                </Text> : null}
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
                  {nameToInitials(contactName)}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.loader}>
            
        {!receivingAddress ? (
          <ActivityIndicator size="large" />
        ) : (
          <QRCode value={receivingAddress} size={hp('27%')} />
        )}
        </View>
      </ScrollView>
      <View style={{ marginTop: 'auto' }}>
        <BottomInfoBox
          backgroundColor={Colors.backgroundColor1}
          titleColor={Colors.black1}
          title={'Note'}
          infoText={
            'Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem ipsum dolor'
          }
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  loader: { 
  height: hp('27%'), justifyContent: 'center',
  marginLeft: 20,
  marginRight: 20,
  alignItems: 'center',
  marginTop: hp('4%'), },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 2,
    backgroundColor: Colors.backgroundColor,
  },
  contactProfileView: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
