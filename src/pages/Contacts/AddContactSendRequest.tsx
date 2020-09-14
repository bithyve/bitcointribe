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
import {
  updateEphemeralChannel,
  updateTrustedContactInfoLocally,
} from '../../store/actions/trustedContacts';
import {
  EphemeralData,
  EphemeralDataElements,
  TrustedContactDerivativeAccountElements,
} from '../../bitcoin/utilities/Interface';
import config from '../../bitcoin/HexaConfig';
import ModalHeader from '../../components/ModalHeader';
import Toast from '../../components/Toast';
import TimerModalContents from './TimerModalContents';
import {
  TRUSTED_CONTACTS,
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
} from '../../common/constants/serviceTypes';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';
import ShareContactRequest from '../../components/ShareContactRequest';
import ShareOtpWithTrustedContact from '../ManageBackup/ShareOtpWithTrustedContact';

export default function AddContactSendRequest(props) {
  const [isOTPType, setIsOTPType] = useState(false);
  const [
    shareOtpWithTrustedContactBottomSheet,
    setShareOtpWithTrustedContactBottomSheet,
  ] = useState(React.createRef<BottomSheet>());
  const [OTP, setOTP] = useState('');
  const [SendViaLinkBottomSheet, setSendViaLinkBottomSheet] = useState(
    React.createRef(),
  );
  const [SendViaQRBottomSheet, setSendViaQRBottomSheet] = useState(
    React.createRef(),
  );
  const [TimerModalBottomSheet, setTimerModalBottomSheet] = useState(
    React.createRef(),
  );
  const [renderTimer, setRenderTimer] = useState(false);

  const [trustedLink, setTrustedLink] = useState('');
  const [trustedQR, setTrustedQR] = useState('');
  const fcmTokenValue = useSelector((state) => state.preferences.fcmTokenValue);
  let trustedContactsInfo = useSelector(
    (state) => state.trustedContacts.trustedContactsInfo,
  );

  const SelectedContact = props.navigation.getParam('SelectedContact')
    ? props.navigation.getParam('SelectedContact')
    : [];
  console.log('SelectedContact', SelectedContact);
  const [Contact, setContact] = useState(
    SelectedContact ? SelectedContact[0] : {},
  );

  const WALLET_SETUP = useSelector(
    (state) => state.storage.database.WALLET_SETUP,
  );
  const trustedContacts: TrustedContactsService = useSelector(
    (state) => state.trustedContacts.service,
  );

  const regularAccount: RegularAccount = useSelector(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );

  const testAccount: TestAccount = useSelector(
    (state) => state.accounts[TEST_ACCOUNT].service,
  );

  const updateEphemeralChannelLoader = useSelector(
    (state) => state.trustedContacts.loading.updateEphemeralChannel,
  );
  function isEmpty(obj) {
    return Object.keys(obj).every((k) => !Object.keys(obj[k]).length);
  }
  const updateTrustedContactsInfo = async (contact) => {
    if (trustedContactsInfo) {
      if (
        trustedContactsInfo.findIndex((trustedContact) => {
          if (!trustedContact) return false;

          const presentContactName = `${trustedContact.firstName} ${
            trustedContact.lastName ? trustedContact.lastName : ''
          }`
            .toLowerCase()
            .trim();

          const selectedContactName = `${contact.firstName} ${
            contact.lastName ? contact.lastName : ''
          }`
            .toLowerCase()
            .trim();

          return presentContactName == selectedContactName;
        }) == -1
      ) {
        trustedContactsInfo.push(contact);
      }
    } else {
      trustedContactsInfo = [];
      trustedContactsInfo[0] = null; // securing initial 3 positions for Guardians
      trustedContactsInfo[1] = null;
      trustedContactsInfo[2] = null;
      trustedContactsInfo[3] = contact;
    }
    await AsyncStorage.setItem(
      'TrustedContactsInfo',
      JSON.stringify(trustedContactsInfo),
    );
    dispatch(updateTrustedContactInfoLocally(trustedContactsInfo));
  };

  const dispatch = useDispatch();

  const createTrustedContact = useCallback(async () => {
    if (Contact && Contact.firstName) {
      const contactName = `${Contact.firstName} ${
        Contact.lastName ? Contact.lastName : ''
      }`
        .toLowerCase()
        .trim();

      let info = '';
      if (Contact.phoneNumbers && Contact.phoneNumbers.length) {
        const phoneNumber = Contact.phoneNumbers[0].number;
        let number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
        number = number.slice(number.length - 10); // last 10 digits only
        info = number;
      } else if (Contact.emails && Contact.emails.length) {
        info = Contact.emails[0].email;
      }

      const contactInfo = {
        contactName,
        info: info.trim(),
      };
      const trustedContact = trustedContacts.tc.trustedContacts[contactName];

      const walletID = await AsyncStorage.getItem('walletID');
      const FCM = fcmTokenValue;
      //await AsyncStorage.getItem('fcmToken');

      let accountNumber =
        regularAccount.hdWallet.trustedContactToDA[contactName];
      if (!accountNumber) {
        // initialize a trusted derivative account against the following account
        const res = regularAccount.getDerivativeAccXpub(
          TRUSTED_CONTACTS,
          null,
          contactName,
        );
        if (res.status !== 200) {
          console.log('Err occurred while generating derivative account');
        } else {
          // refresh the account number
          accountNumber =
            regularAccount.hdWallet.trustedContactToDA[contactName];
        }
      }

      const trustedReceivingAddress = (regularAccount.hdWallet
        .derivativeAccounts[TRUSTED_CONTACTS][
        accountNumber
      ] as TrustedContactDerivativeAccountElements).receivingAddress;

      const data: EphemeralDataElements = {
        walletID,
        FCM,
        trustedAddress: trustedReceivingAddress,
        trustedTestAddress: testAccount.hdWallet.receivingAddress,
      };

      if (!trustedContact) {
        dispatch(updateEphemeralChannel(contactInfo, data));
      } else if (
        !trustedContact.symmetricKey &&
        trustedContact.ephemeralChannel &&
        trustedContact.ephemeralChannel.initiatedAt &&
        Date.now() - trustedContact.ephemeralChannel.initiatedAt >
          config.TC_REQUEST_EXPIRY
      ) {
        // re-initiating expired EC
        dispatch(
          updateEphemeralChannel(
            contactInfo,
            trustedContact.ephemeralChannel.data[0],
          ),
        );
      }
    }
  }, [Contact, trustedContacts]);

  useEffect(() => {
    if (updateEphemeralChannelLoader) {
      if (trustedLink) setTrustedLink('');
      if (trustedQR) setTrustedQR('');
      return;
    }

    if (!Contact) {
      console.log('Err: Contact missing');
      return;
    }

    const contactName = `${Contact.firstName} ${
      Contact.lastName ? Contact.lastName : ''
    }`
      .toLowerCase()
      .trim();
    const trustedContact = trustedContacts.tc.trustedContacts[contactName];

    if (trustedContact) {
      if (!trustedContact.ephemeralChannel) {
        console.log(
          'Err: Ephemeral Channel does not exists for contact: ',
          contactName,
        );
        return;
      }

      const { publicKey, otp } = trustedContacts.tc.trustedContacts[
        contactName
      ];
      const requester = WALLET_SETUP.walletName;
      const appVersion = DeviceInfo.getVersion();
      if (!trustedLink) {
        if (Contact.phoneNumbers && Contact.phoneNumbers.length) {
          const phoneNumber = Contact.phoneNumbers[0].number;
          console.log({ phoneNumber });
          let number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
          number = number.slice(number.length - 10); // last 10 digits only
          const numHintType = 'num';
          const numHint = number[0] + number.slice(number.length - 2);
          const numberEncPubKey = TrustedContactsService.encryptPub(
            publicKey,
            number,
          ).encryptedPub;
          const numberDL =
            `https://hexawallet.io/${config.APP_STAGE}/tc` +
            `/${requester}` +
            `/${numberEncPubKey}` +
            `/${numHintType}` +
            `/${numHint}` +
            `/${trustedContact.ephemeralChannel.initiatedAt}` +
            `/v${appVersion}`;
          setIsOTPType(false);
          setTrustedLink(numberDL);
        } else if (Contact.emails && Contact.emails.length) {
          const email = Contact.emails[0].email;
          const emailHintType = 'eml';
          const trucatedEmail = email.replace('.com', '');
          const emailHint =
            email[0] + trucatedEmail.slice(trucatedEmail.length - 2);
          const emailEncPubKey = TrustedContactsService.encryptPub(
            publicKey,
            email,
          ).encryptedPub;
          const emailDL =
            `https://hexawallet.io/${config.APP_STAGE}/tc` +
            `/${requester}` +
            `/${emailEncPubKey}` +
            `/${emailHintType}` +
            `/${emailHint}` +
            `/${trustedContact.ephemeralChannel.initiatedAt}` +
            `/v${appVersion}`;
          setIsOTPType(false);
          setTrustedLink(emailDL);
        } else if (otp) {
          const otpHintType = 'otp';
          const otpHint = 'xxx';
          const otpEncPubKey = TrustedContactsService.encryptPub(publicKey, otp)
            .encryptedPub;
          const otpDL =
            `https://hexawallet.io/${config.APP_STAGE}/tc` +
            `/${requester}` +
            `/${otpEncPubKey}` +
            `/${otpHintType}` +
            `/${otpHint}` +
            `/${trustedContact.ephemeralChannel.initiatedAt}` +
            `/v${appVersion}`;
          setIsOTPType(true);
          setOTP(otp);
          setTrustedLink(otpDL);
        } else {
          Alert.alert('Invalid Contact', 'Something went wrong.');
          return;
        }
        updateTrustedContactsInfo(Contact); // Contact initialized to become TC
      }

      if (!trustedQR) {
        let info = '';
        if (Contact.phoneNumbers && Contact.phoneNumbers.length) {
          const phoneNumber = Contact.phoneNumbers[0].number;
          let number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
          number = number.slice(number.length - 10); // last 10 digits only
          info = number;
        } else if (Contact.emails && Contact.emails.length) {
          info = Contact.emails[0].email;
        } else if (otp) {
          info = otp;
        }

        setTrustedQR(
          JSON.stringify({
            requester: WALLET_SETUP.walletName,
            publicKey,
            info: info.trim(),
            uploadedAt: trustedContact.ephemeralChannel.initiatedAt,
            type: 'trustedContactQR',
            ver: appVersion,
          }),
        );
      }
    }
  }, [Contact, trustedContacts, updateEphemeralChannelLoader]);

  const openTimer = async () => {
    setTimeout(() => {
      setRenderTimer(true);
    }, 2);
    let TCRequestTimer = JSON.parse(
      await AsyncStorage.getItem('TCRequestTimer'),
    );
    (SendViaLinkBottomSheet as any).current.snapTo(0);
    if (!TCRequestTimer) {
      (TimerModalBottomSheet as any).current.snapTo(1);
    }
  };

  const renderSendViaLinkContents = useCallback(() => {
    if (!isEmpty(Contact)) {
      return (
        <SendViaLink
          isFromReceive={true}
          headerText={'Share'}
          subHeaderText={'Send to your contact'}
          contactText={'Adding to Friends and Family:'}
          contact={Contact ? Contact : null}
          infoText={`Click here to accept contact request from ${
            WALLET_SETUP.walletName
          } Hexa wallet - link will expire in ${
            config.TC_REQUEST_EXPIRY / (60000 * 60)
          } hours`}
          link={trustedLink}
          contactEmail={''}
          onPressBack={() => {
            if (SendViaLinkBottomSheet.current)
              (SendViaLinkBottomSheet as any).current.snapTo(0);
          }}
          onPressDone={async () => {
            setTimeout(() => {
              setRenderTimer(true);
            }, 2);
            if (isOTPType) {
              shareOtpWithTrustedContactBottomSheet.current.snapTo(1);
            } else {
              openTimer();
            }
            (SendViaLinkBottomSheet as any).current.snapTo(0);
          }}
        />
      );
    }
  }, [Contact, trustedLink]);

  const renderSendViaLinkHeader = useCallback(() => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   if (SendViaLinkBottomSheet.current)
      //     (SendViaLinkBottomSheet as any).current.snapTo(0);
      // }}
      />
    );
  }, []);

  const renderSendViaQRContents = useCallback(() => {
    return (
      <SendViaQR
        isFromReceive={true}
        headerText={'Friends and Family Request'}
        subHeaderText={"Scan the QR from your Contact's Hexa Wallet"}
        contactText={'Adding to Friends and Family:'}
        contact={Contact}
        QR={trustedQR}
        contactEmail={''}
        onPressBack={() => {
          if (SendViaQRBottomSheet.current)
            (SendViaQRBottomSheet as any).current.snapTo(0);
        }}
        onPressDone={() => {
          (SendViaQRBottomSheet as any).current.snapTo(0);
          openTimer();
        }}
      />
    );
  }, [Contact, trustedQR]);

  const renderTimerModalContents = useCallback(() => {
    return (
      <TimerModalContents
        renderTimer={renderTimer}
        onPressContinue={() => onContinueWithTimer()}
      />
    );
  }, [renderTimer]);

  const renderTimerModalHeader = useCallback(() => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   if (TimerModalBottomSheet.current)
      //     (TimerModalBottomSheet as any).current.snapTo(0);
      // }}
      />
    );
  }, []);

  const onContinueWithTimer = () => {
    (TimerModalBottomSheet as any).current.snapTo(0);
    props.navigation.goBack();
  };

  const renderSendViaQRHeader = useCallback(() => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   if (SendViaQRBottomSheet.current)
      //     (SendViaQRBottomSheet as any).current.snapTo(0);
      // }}
      />
    );
  }, []);

  const setPhoneNumber = () => {
    let phoneNumber = Contact.phoneNumbers[0].number;
    let number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
    number = number.slice(number.length - 10); // last 10 digits only
    return number;
  };

  const renderShareOtpWithTrustedContactContent = useCallback(() => {
    return (
      <ShareOtpWithTrustedContact
        renderTimer={renderTimer}
        onPressOk={(index) => {
          setRenderTimer(false);
          shareOtpWithTrustedContactBottomSheet.current.snapTo(0);
          props.navigation.goBack();
        }}
        onPressBack={() => {
          shareOtpWithTrustedContactBottomSheet.current.snapTo(0);
        }}
        OTP={OTP}
      />
    );
  }, [OTP, renderTimer]);

  const renderShareOtpWithTrustedContactHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          shareOtpWithTrustedContactBottomSheet.current.snapTo(0);
        }}
      />
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.modalContainer}>
        <ShareContactRequest
        SelectedContact={Contact ? Contact : {}}
        navigation={props.navigation}
        headerText={'Add Contact'}
        headerSubText={'Send a Friends and Family request'}
        isDoneButton={true}
        contactHeader={'Adding to Friends and Family:'}
        noteHeader={'Friends and Family request'}
        note={'Your contact will have to accept your request for you to add them'}
        createTrustedContact={()=>createTrustedContact()}
        sendViaQr={()=>{
          if (SendViaQRBottomSheet.current)
                (SendViaQRBottomSheet as any).current.snapTo(1);
        }}
        sendViaLink={()=>{
          if (SendViaLinkBottomSheet.current)
                (SendViaLinkBottomSheet as any).current.snapTo(1);
        }}
        />
        {/* <View
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
                Associate a contact{' '}
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                  paddingTop: 5,
                }}
              >
                Send a Friends and Family request
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                createTrustedContact();
                props.navigation.goBack();
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
                  Adding to Friends and Family:
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
                    {setPhoneNumber()}
                  </Text>
                ) : Contact.emails && Contact.emails.length ? (
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
              title={'Friends and Family request'}
              infoText={
                'Your contact will have to accept your request for you to add them'
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
                createTrustedContact();
                if (SendViaLinkBottomSheet.current)
                  (SendViaLinkBottomSheet as any).current.snapTo(1);
              }}
              style={styles.buttonInnerView}
            >
              <Image
                source={require('../../assets/images/icons/openlink.png')}
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
                if (SendViaQRBottomSheet.current)
                  (SendViaQRBottomSheet as any).current.snapTo(1);
              }}
            >
              <Image
                source={require('../../assets/images/icons/qr-code.png')}
                style={styles.buttonImage}
              />
              <Text style={styles.buttonText}>QR</Text>
            </TouchableOpacity>
          </View>
        </View> */}
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={SendViaLinkBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('45%')
              : hp('46%'),
          ]}
          renderContent={renderSendViaLinkContents}
          renderHeader={renderSendViaLinkHeader}
        />
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={SendViaQRBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('46%')
              : hp('46%'),
          ]}
          renderContent={renderSendViaQRContents}
          renderHeader={renderSendViaQRHeader}
        />
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={TimerModalBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('30%')
              : hp('35%'),
          ]}
          renderContent={renderTimerModalContents}
          renderHeader={renderTimerModalHeader}
        />
        <BottomSheet
          onCloseEnd={() => {
            if (SelectedContact.length > 0) {
              setRenderTimer(false);
            }
          }}
          enabledInnerScrolling={true}
          ref={shareOtpWithTrustedContactBottomSheet}
          snapPoints={[-30, hp('65%')]}
          renderContent={renderShareOtpWithTrustedContactContent}
          renderHeader={renderShareOtpWithTrustedContactHeader}
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
