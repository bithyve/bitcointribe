import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Alert,
  AsyncStorage,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackupStyles from '../ManageBackup/Styles';
import BottomInfoBox from '../../components/BottomInfoBox';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import SendViaLink from '../../components/SendViaLink';
import { nameToInitials } from '../../common/CommonFunctions';
import SendViaQR from '../../components/SendViaQR';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import { updateEphemeralChannel } from '../../store/actions/trustedContacts';
import { EphemeralData } from '../../bitcoin/utilities/Interface';
import config from '../../bitcoin/HexaConfig';
import ModalHeader from '../../components/ModalHeader';
import Toast from '../../components/Toast';

export default function AddContactSendRequest(props) {
  const [SendViaLinkBottomSheet, setSendViaLinkBottomSheet] = useState(
    React.createRef(),
  );

  const [SendViaQRBottomSheet, setSendViaQRBottomSheet] = useState(
    React.createRef(),
  );
  const [trustedLink, setTrustedLink] = useState('');
  const [trustedQR, setTrustedQR] = useState('');

  const SelectedContact = props.navigation.getParam('SelectedContact')
    ? props.navigation.getParam('SelectedContact')
    : [];

  const [Contact, setContact] = useState(
    SelectedContact ? SelectedContact[0] : {},
  );

  const WALLET_SETUP = useSelector(
    (state) => state.storage.database.WALLET_SETUP,
  );
  const trustedContacts: TrustedContactsService = useSelector(
    (state) => state.trustedContacts.service,
  );

  const updateTrustedContactsInfo = async (contact) => {
    let trustedContactsInfo: any = await AsyncStorage.getItem(
      'TrustedContactsInfo',
    );
    console.log({ trustedContactsInfo });

    if (trustedContactsInfo) {
      trustedContactsInfo = JSON.parse(trustedContactsInfo);
      if (
        trustedContactsInfo.findIndex((value) => {
          if (value && value.id) return value.id == contact.id;
        }) == -1
      ) {
        trustedContactsInfo.push(contact);
        // Toast('Trusted Contact added successfully');
      } else {
        // Toast('Trusted Contact already exists');
      }
    } else {
      trustedContactsInfo = [];
      trustedContactsInfo[3] = contact; // initial 3 reserved for Guardians
    }
    console.log({ trustedContactsInfo });
    await AsyncStorage.setItem(
      'TrustedContactsInfo',
      JSON.stringify(trustedContactsInfo),
    );
  };

  const dispatch = useDispatch();
  useEffect(() => {
    if (Contact && Contact.firstName) {
      const contactName = `${Contact.firstName} ${
        Contact.lastName ? Contact.lastName : ''
      }`.toLowerCase();
      const trustedContact = trustedContacts.tc.trustedContacts[contactName];

      if (!trustedContact) {
        (async () => {
          const walletID = await AsyncStorage.getItem('walletID');
          const FCM = await AsyncStorage.getItem('fcmToken');

          const data: EphemeralData = {
            walletID,
            FCM,
          };
          dispatch(updateEphemeralChannel(contactName, data));
        })();
      } else {
        updateTrustedContactsInfo(Contact); // Contact initialized to become TC
        if (!trustedLink) createDeepLink();

        if (!trustedQR) {
          const publicKey =
            trustedContacts.tc.trustedContacts[contactName].publicKey;

          setTrustedQR(
            JSON.stringify({
              requester: WALLET_SETUP.walletName,
              publicKey,
              type: 'trustedContactQR',
            }),
          );
        }
      }
    }
  }, [Contact, trustedContacts]);

  const createDeepLink = useCallback(() => {
    if (!Contact) {
      console.log('Err: Contact missing');
      return;
    }

    const contactName = `${Contact.firstName} ${
      Contact.lastName ? Contact.lastName : ''
    }`.toLowerCase();
    const publicKey = trustedContacts.tc.trustedContacts[contactName].publicKey;
    const requester = WALLET_SETUP.walletName;

    if (Contact.phoneNumbers && Contact.phoneNumbers.length) {
      const phoneNumber = Contact.phoneNumbers[0].number;
      console.log({ phoneNumber });
      const number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
      const numHintType = 'num';
      const numHint = number.slice(number.length - 3);
      const numberEncPubKey = TrustedContactsService.encryptPub(
        publicKey,
        number,
      ).encryptedPub;
      const numberDL =
        `https://hexawallet.io/${config.APP_STAGE}/tc` +
        `/${requester}` +
        `/${numberEncPubKey}` +
        `/${numHintType}` +
        `/${numHint}`;
      console.log({ numberDL });
      setTrustedLink(numberDL);
    } else if (Contact.emails && Contact.emails.length) {
      const email = Contact.emails[0].email;
      const emailInitials: string = email.split('@')[0];
      const emailHintType = 'eml';
      const emailHint = emailInitials.slice(emailInitials.length - 3);
      const emailEncPubKey = TrustedContactsService.encryptPub(
        publicKey,
        emailInitials,
      ).encryptedPub;
      const emailDL =
        `https://hexawallet.io/${config.APP_STAGE}/tc` +
        `/${requester}` +
        `/${emailEncPubKey}` +
        `/${emailHintType}` +
        `/${emailHint}`;
      console.log({ emailDL });
      setTrustedLink(emailDL);
    } else {
      Alert.alert(
        'Invalid Contact',
        'Cannot add a contact without phone-num/email as a trusted entity',
      );
    }
  }, [Contact, trustedContacts]);

  const renderSendViaLinkContents = useCallback(() => {
    return (
      <SendViaLink
        contactText={'Adding as a Trusted Contact:'}
        contact={Contact}
        link={trustedLink}
        contactEmail={''}
        onPressBack={() => {
          if (SendViaLinkBottomSheet.current)
            (SendViaLinkBottomSheet as any).current.snapTo(0);
        }}
        onPressDone={() => {
          (SendViaLinkBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [Contact, trustedLink]);

  const renderSendViaLinkHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          if (SendViaLinkBottomSheet.current)
            (SendViaLinkBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderSendViaQRContents = useCallback(() => {
    return (
      <SendViaQR
        contactText={'Adding as a Trusted Contact:'}
        contact={Contact}
        QR={trustedQR}
        contactEmail={''}
        onPressBack={() => {
          if (SendViaQRBottomSheet.current)
            (SendViaQRBottomSheet as any).current.snapTo(0);
        }}
        onPressDone={() => {
          (SendViaQRBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [Contact, trustedQR]);

  const renderSendViaQRHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          if (SendViaQRBottomSheet.current)
            (SendViaQRBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.modalContainer}>
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
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...BackupStyles.modalHeaderTitleText,
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Add Contact{' '}
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
            <TouchableOpacity
              onPress={() => {}}
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
            </TouchableOpacity>
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
                  Adding as a Trusted Contact:
                </Text>
                <Text style={styles.contactNameText}>
                  {Contact.firstName && Contact.lastName
                    ? Contact.firstName + ' ' + Contact.lastName
                    : Contact.firstName && !Contact.lastName
                    ? Contact.firstName
                    : !Contact.firstName && Contact.lastName
                    ? Contact.lastName
                    : ''}
                </Text>
                {Contact.phoneNumbers && Contact.phoneNumbers.length ? (
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontFamily: Fonts.FiraSansRegular,
                      fontSize: RFValue(10),
                      marginLeft: 25,
                      paddingTop: 3,
                    }}
                  >
                    {Contact.phoneNumbers[0].digits}
                  </Text>
                ) : null}
                {Contact.emails && Contact.emails.length ? (
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
                    {Contact.emails[0].email}
                  </Text>
                ) : null}
              </View>
            </View>
            {Contact.imageAvailable ? (
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
                  {nameToInitials(
                    Contact.firstName && Contact.lastName
                      ? Contact.firstName + ' ' + Contact.lastName
                      : Contact.firstName && !Contact.lastName
                      ? Contact.firstName
                      : !Contact.firstName && Contact.lastName
                      ? Contact.lastName
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
              backgroundColor={Colors.backgroundColor1}
              titleColor={Colors.black1}
              title={'Note'}
              infoText={
                'Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem ipsum dolor'
              }
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
                if (SendViaLinkBottomSheet.current)
                  (SendViaLinkBottomSheet as any).current.snapTo(1);
              }}
              style={styles.buttonInnerView}
            >
              <Image
                source={require('../../assets/images/icons/openlink.png')}
                style={styles.buttonImage}
              />
              <Text style={styles.buttonText}>Via Link</Text>
            </TouchableOpacity>
            <View
              style={{ width: 1, height: 30, backgroundColor: Colors.white }}
            />
            <TouchableOpacity
              style={styles.buttonInnerView}
              onPress={() => {
                if (SendViaQRBottomSheet.current)
                  (SendViaQRBottomSheet as any).current.snapTo(1);
              }}
            >
              <Image
                source={require('../../assets/images/icons/qr-code.png')}
                style={styles.buttonImage}
              />
              <Text style={styles.buttonText}>Via QR</Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomSheet
          enabledInnerScrolling={true}
          ref={SendViaLinkBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('83%')
              : hp('85%'),
          ]}
          renderContent={renderSendViaLinkContents}
          renderHeader={renderSendViaLinkHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={SendViaQRBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('83%')
              : hp('85%'),
          ]}
          renderContent={renderSendViaQRContents}
          renderHeader={renderSendViaQRHeader}
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
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
