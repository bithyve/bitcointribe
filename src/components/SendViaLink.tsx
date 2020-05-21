import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Linking,
  FlatList,
  Clipboard,
  Platform,
} from 'react-native';
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

  const [shareLink, setShareLink] = useState('');

  const [shareApps, setshareApps] = useState([
    {
      title: `WhatsApp`,
      image: require('../assets/images/icons/whatsapp.png'),
      url: 'whatsapp://send?',
      isAvailable: false,
    },
    {
      title: `Telegram`,
      image: require('../assets/images/icons/telegram.png'),
      url: 'https://telegram.me/share/url?url=',
      isAvailable: false,
    },
    {
      title: `Messenger`,
      image: require('../assets/images/icons/messenger.png'),
      url: 'http://m.me/',
      isAvailable: false,
    },
    {
      title: `Copy Link`,
      image: require('../assets/images/icons/copylink_share.png'),
      url: '',
      isAvailable: true,
    },
  ]);
  const contact = props.contact;
  //console.log("Contact SEND VIA LINK", contact);
  const [Contact, setContact] = useState(props.contact ? props.contact : {});
  
  useEffect(() => {
    let contactName =
    Contact && Contact.firstName && Contact.lastName
        ? Contact.firstName + ' ' + Contact.lastName
        : Contact && Contact.firstName && !Contact.lastName
        ? Contact.firstName
        : Contact && !Contact.firstName && Contact.lastName
        ? Contact.lastName
        : '';
    setContactName(contactName);
  }, [Contact]);

  useEffect(() => {
    //console.log("Contact SEND VIA LINK1 ", contact);
    setContact(props.contact);
    (async () => {
      for (let i = 0; i < shareApps.length; i++) {
        if (shareApps[i].url) {
          let supported = await Linking.canOpenURL(shareApps[i].url);
          shareApps[i].isAvailable = supported;
          //console.log("supported", supported);
        }
      }
      setShareApps(shareApps);
      
    })();
  }, [contact]);

  function writeToClipboard() {
    Clipboard.setString(shareLink);
    Toast('Copied Successfully');
  }

  useEffect(() => {
    if (props.link) setShareLink(props.link);
  }, [props.link]);
  
  const openWhatsApp = (appUrl) => {
    if (shareLink) {
      let url = appUrl + 'text=' + shareLink; //+ '&phone=' + mobile;
      Linking.openURL(url)
        .then((data) => {
          //console.log('WhatsApp Opened');
        })
        .catch(() => {
          alert('Make sure WhatsApp installed on your device');
        });
    }
  };

  const openTelegram = (appUrl) => {
    if (shareLink) {
      let url = appUrl + shareLink;
      Linking.openURL(url)
        .then((data) => {
          //console.log('Telegram Opened');
        })
        .catch(() => {
          alert('Make sure Telegram installed on your device');
        });
    }
  };

  const openMessenger = (appUrl) => {
    if (shareLink) {
      let url = appUrl;
      Linking.openURL(url)
        .then((data) => {
          //console.log('Messenger Opened');
        })
        .catch(() => {
          alert('Make sure Facebook Messenger installed on your device');
        });
    }
  };

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
                  {Contact.phoneNumbers[0].digits}
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
                  {Contact.emails[0].email}
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
                  source={Contact.image}
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
        <View style={{ marginTop: 40, marginLeft: 20, marginRight: 20 }}>
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
            {shareLink ? shareLink : 'creating...'}
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

          <ScrollView horizontal={true}>
            {shareApps.map((item) => {
              if (item.isAvailable) {
                return (
                  <AppBottomSheetTouchableWrapper
                    onPress={() => {
                      if (item.title == 'Copy Link') writeToClipboard();

                      if (item.title == 'WhatsApp') openWhatsApp(item.url);
                      if (item.title == 'Telegram') openTelegram(item.url);
                      if (item.title == 'Messenger') openMessenger(item.url);
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
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
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
                        <Text style={styles.addModalInfoText}>
                          {item.title}
                        </Text>
                      </View>
                    </View>
                  </AppBottomSheetTouchableWrapper>
                );
              }

            })}
          </ScrollView>
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
