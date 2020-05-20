import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Linking, FlatList,Clipboard } from 'react-native';
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
import Toast from '../components/Toast';

export default function SendViaLink(props) {
  const [contactName, setContactName] = useState('');
  const [shareLink, setShareLink] = useState('http://hexawallet.io/trustedcontacts/ubcskuejm');

  const [shareApps, setshareApps] = useState([
    {
      title: `WhatsApp`,
      image: require('../assets/images/icons/whatsapp.png'),
      url: 'whatsapp://send',
      isAvailable: true,
    },
    {
      title: `Telegram`,
      image: require('../assets/images/icons/telegram.png'),
      url: 'https://telegram.me',
      isAvailable: true,
    },
    {
      title: `Messenger`,
      image: require('../assets/images/icons/messenger.png'),
      url: 'fb-messenger://',
      isAvailable: true,
    },
    {
      title: `Copy Link`,
      image: require('../assets/images/icons/copylink_share.png'),
      url: '',
      isAvailable: true,
    },
  ]);
  useEffect(() => {
    let contactName =
      props.contact.firstName && props.contact.lastName
        ? props.contact.firstName + ' ' + props.contact.lastName
        : props.contact.firstName && !props.contact.lastName
        ? props.contact.firstName
        : !props.contact.firstName && props.contact.lastName
        ? props.contact.lastName
        : '';
    setContactName(contactName);
    (async () => {
      for (let i = 0; i < shareApps.length; i++) {
        if (shareApps[i].url) {
          await Linking.canOpenURL(shareApps[i].url)
            .then((supported) => {
              console.log('');
              shareApps[i].isAvailable = supported;
            })
            .catch((err) => console.error('An error occurred', err));
        }
      }
    })();
  }, []);

  function writeToClipboard() {
    Clipboard.setString(shareLink);
    Toast('Copied Successfully');
  }

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
            <Text style={styles.modalHeaderTitleText}>
              Send Request via Link
            </Text>
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
          {props.onPressDone && (
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
          )}
        </View>
      </View>
      <ScrollView style={{ marginTop: hp('1.7%') }}>
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
                      paddingBottom: 5,
                    }}
                  >
                    {props.contactText}
                  </Text>
                ) : null}
                {contactName ? (
                  <Text style={styles.contactNameText}>{contactName}</Text>
                ) : null}
                {props.contactEmail ? (
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontFamily: Fonts.FiraSansRegular,
                      fontSize: RFValue(10),
                      marginLeft: 25,
                      paddingTop: 5,
                      paddingBottom: 5,
                    }}
                  >
                    {props.contactEmail}
                  </Text>
                ) : null}
              </View>
            </View>
            {props.contact.imageAvailable ? (
              <Image
                source={props.contact.image}
                style={{ ...styles.contactProfileImage }}
              />
            ) : (
              <View
                style={{
                  position: 'absolute',
                  marginLeft: 15,
                  marginRight: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.shadowBlue,
                  width: 70,
                  height: 70,
                  borderRadius: 70 / 2,
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
        <View
          style={{ marginTop: 40, marginLeft: 20, marginRight: 20 }}
        >
          <Text
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansRegular,
              paddingTop: 5,
            }}
          >
            {
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore'
            }
          </Text>
        </View>

        <View
          style={{
            marginTop: 40,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            backgroundColor: Colors.backgroundColor1,
            height: 50,
            borderRadius: 10,
            marginLeft: 20,
            marginRight: 20,
          }}
        >
          <Text
            style={{
              color: Colors.lightBlue,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              paddingTop: 5,
            }}
          >
            {shareLink}
          </Text>
        </View>

        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 40,
            marginBottom: hp('4%'),
          }}
        >
          <FlatList
    data={shareApps}
    horizontal={true}
    renderItem={({ item }) => {
    if(item.isAvailable){
       return <AppBottomSheetTouchableWrapper
        onPress={() => {
            if(item.title == 'Copy Link') 
            writeToClipboard();

        }}
        style={{
            ...styles.addModalView,
            backgroundColor: Colors.white,
            alignItems: 'center',
            justifyContent: 'center',
        }}
        >
            <View style={styles.modalElementInfoView}>
                <View
                style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                <View
                    style={{
                    shadowColor: Colors.shadowBlue,
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 15,
                    height: 15,
                    shadowOpacity: 1,
                    shadowOffset: { width: 5, height: 5 },
                    }}
                >
                    <Image
                    source={item.image}
                    style={{ width: 50, height: 50 }}
                    />
                </View>
                <Text style={styles.addModalInfoText}>{item.title}</Text>
                </View>
            </View>
            </AppBottomSheetTouchableWrapper>
        }
    }}
/>
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
  addModalView: {
    padding: 7,
    flexDirection: 'row',
    display: 'flex',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  modalElementInfoView: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 35,
  },
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
    marginLeft: 20,
    marginRight: 20,
  },
  contactProfileImage: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    borderRadius: 60 / 2,
    elevation: 20,
    shadowColor: Colors.borderColor,
    shadowOpacity: 1,
    shadowOffset: { width: 1, height: 4 },
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
