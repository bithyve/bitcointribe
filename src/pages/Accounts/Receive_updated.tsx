import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  Alert,
  InteractionManager,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import BottomSheet from 'reanimated-bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BottomInfoBox from '../../components/BottomInfoBox';
import ModalHeader from '../../components/ModalHeader';
import AddContactAddressBook from '../Contacts/AddContactAddressBook';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import DeviceInfo from 'react-native-device-info';
import { nameToInitials } from '../../common/CommonFunctions';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import SendViaQR from '../../components/SendViaQR';
import SendViaLink from '../../components/SendViaLink';
import Entypo from 'react-native-vector-icons/Entypo';
import {
  TEST_ACCOUNT,
  SECURE_ACCOUNT,
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../common/constants/serviceTypes';
import BackupStyles from '../ManageBackup/Styles';
import {
  updateEphemeralChannel,
  updateTrustedContactInfoLocally,
} from '../../store/actions/trustedContacts';
import {
  EphemeralDataElements,
  TrustedContactDerivativeAccountElements,
} from '../../bitcoin/utilities/Interface';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import config from '../../bitcoin/HexaConfig';
import ReceiveHelpContents from '../../components/Helper/ReceiveHelpContents';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import Loader from '../../components/loader';
import TwoFASetupWarningModal from './TwoFASetupWarningModal';
import idx from 'idx';
import {
  setReceiveHelper,
  setSavingWarning,
} from '../../store/actions/preferences';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';

export default function Receive(props) {
  const [
    SecureReceiveWarningBottomSheet,
    setSecureReceiveWarningBottomSheet,
  ] = useState(React.createRef());
  //let [isLoading, setIsLoading] = useState(true);
  const [ReceiveHelperBottomSheet, setReceiveHelperBottomSheet] = useState(
    React.createRef(),
  );
  const [
    AddContactAddressBookBookBottomSheet,
    setAddContactAddressBookBottomSheet,
  ] = useState(React.createRef());
  const [isLoadContacts, setIsLoadContacts] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState(Object);
  const [AsTrustedContact, setAsTrustedContact] = useState(false);
  const [isReceiveHelperDone, setIsReceiveHelperDone] = useState(true);
  const [serviceType, setServiceType] = useState(
    props.navigation.getParam('serviceType')
      ? props.navigation.getParam('serviceType')
      : '',
  );
  const [SendViaLinkBottomSheet, setSendViaLinkBottomSheet] = useState(
    React.createRef(),
  );

  const [SendViaQRBottomSheet, setSendViaQRBottomSheet] = useState(
    React.createRef(),
  );
  const getServiceType = props.navigation.state.params.getServiceType
    ? props.navigation.state.params.getServiceType
    : null;

  const derivativeAccountDetails =
    props.navigation.state.params.derivativeAccountDetails;

  const carouselIndex = props.navigation.state.params.carouselIndex
    ? props.navigation.state.params.carouselIndex
    : null;

  function isEmpty(obj) {
    return Object.keys(obj).every((k) => !Object.keys(obj[k]).length);
  }

  const dispatch = useDispatch();
  const [receiveLink, setReceiveLink] = useState('');
  const [receiveQR, setReceiveQR] = useState('');
  const { loading, service } = useSelector(
    (state) => state.accounts[serviceType],
  );
  const updateEphemeralChannelLoader = useSelector(
    (state) => state.trustedContacts.loading.updateEphemeralChannel,
  );
  const fcmTokenValue = useSelector((state) =>
    idx(state, (_) => _.preferences.fcmTokenValue),
  );
  const isReceiveHelperDoneValue = useSelector((state) =>
    idx(state, (_) => _.preferences.isReceiveHelperDoneValue),
  );
  const savingWarning = useSelector((state) =>
    idx(state, (_) => _.preferences.savingWarning),
  );

  let trustedContactsInfo = useSelector(
    (state) => state.trustedContacts.trustedContactsInfo,
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

  useEffect(() => {
    if (!AsTrustedContact) {
      const receivingAddress = service.getReceivingAddress(
        derivativeAccountDetails ? derivativeAccountDetails.type : null,
        derivativeAccountDetails ? derivativeAccountDetails.number : null,
      );

      if (receivingAddress) {
        let receiveAt = receivingAddress;
        if (amount) {
          receiveAt = service.getPaymentURI(receiveAt, {
            amount: parseInt(amount) / 1e8,
          }).paymentURI;
        }
        setReceiveLink(receiveAt);
        setReceiveQR(receiveAt);
      }
    }
  }, [service, amount, AsTrustedContact]);

  useEffect(() => {
    if (AsTrustedContact) {
      setTimeout(() => {
        setReceiveLink('');
        setReceiveQR('');
        setIsLoadContacts(true);
      }, 200);
      (AddContactAddressBookBookBottomSheet as any).current.snapTo(1);
    }
  }, [AsTrustedContact]);

  // useEffect(() => {
  //   dispatch(fetchAddress(serviceType));
  //   if (isLoading) {
  //     InteractionManager.runAfterInteractions(() => {
  //       setTimeout(() => {
  //         setIsLoading(false);
  //       }, 2000);
  //     });
  //     InteractionManager.setDeadline(3);
  //   }
  // }, []);

  useEffect(() => {
    if (!AsTrustedContact) return;
    if (!selectedContact || !selectedContact.firstName) {
      //console.log('Err: Contact missing');
      return;
    }
    if (updateEphemeralChannelLoader) {
      if (receiveLink) setReceiveLink('');
      if (receiveQR) setReceiveQR('');
      return;
    }
    const contactName = `${selectedContact.firstName} ${
      selectedContact.lastName ? selectedContact.lastName : ''
    }`
      .toLowerCase()
      .trim();
    const trustedContact = trustedContacts.tc.trustedContacts[contactName];

    if (trustedContact) {
      if (!trustedContact.ephemeralChannel) {
        // console.log(
        //   'Err: Ephemeral Channel does not exists for contact: ',
        //   contactName,
        // );
        return;
      }

      const { publicKey, otp } = trustedContacts.tc.trustedContacts[
        contactName
      ];
      const requester = WALLET_SETUP.walletName;
      const appVersion = DeviceInfo.getVersion();

      if (!receiveLink) {
        if (
          selectedContact.phoneNumbers &&
          selectedContact.phoneNumbers.length
        ) {
          const phoneNumber = selectedContact.phoneNumbers[0].number;
          // console.log({ phoneNumber });
          let number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
          number = number.slice(number.length - 10); // last 10 digits only
          const numHintType = 'num';
          const numHint = number[0] + number.slice(number.length - 2);
          const numberEncPubKey = TrustedContactsService.encryptPub(
            publicKey,
            number,
          ).encryptedPub;
          const numberDL =
            `https://hexawallet.io/${config.APP_STAGE}/ptc` +
            `/${requester}` +
            `/${numberEncPubKey}` +
            `/${numHintType}` +
            `/${numHint}` +
            `/${trustedContact.ephemeralChannel.initiatedAt}` +
            `/v${appVersion}`;

          // console.log({ numberDL });
          setReceiveLink(numberDL);
        } else if (selectedContact.emails && selectedContact.emails.length) {
          const email = selectedContact.emails[0].email;
          const emailHintType = 'eml';
          const trucatedEmail = email.replace('.com', '');
          const emailHint =
            email[0] + trucatedEmail.slice(trucatedEmail.length - 2);
          const emailEncPubKey = TrustedContactsService.encryptPub(
            publicKey,
            email,
          ).encryptedPub;
          const emailDL =
            `https://hexawallet.io/${config.APP_STAGE}/ptc` +
            `/${requester}` +
            `/${emailEncPubKey}` +
            `/${emailHintType}` +
            `/${emailHint}` +
            `/${trustedContact.ephemeralChannel.initiatedAt}` +
            `/v${appVersion}`;

          //console.log({ emailDL });
          setReceiveLink(emailDL);
        } else if (otp) {
          const otpHintType = 'otp';
          const otpHint = 'xxx';
          const otpEncPubKey = TrustedContactsService.encryptPub(publicKey, otp)
            .encryptedPub;
          const otpDL =
            `https://hexawallet.io/${config.APP_STAGE}/ptc` +
            `/${requester}` +
            `/${otpEncPubKey}` +
            `/${otpHintType}` +
            `/${otpHint}` +
            `/${trustedContact.ephemeralChannel.initiatedAt}` +
            `/v${appVersion}`;

          console.log({ otpDL });
          setReceiveLink(otpDL);
        } else {
          Alert.alert('Invalid Contact', 'Something went wrong.');
          return;
        }
        updateTrustedContactsInfo(selectedContact); // Contact initialized to become TC
      }

      if (!receiveQR) {
        let info = '';
        if (
          selectedContact.phoneNumbers &&
          selectedContact.phoneNumbers.length
        ) {
          const phoneNumber = selectedContact.phoneNumbers[0].number;
          let number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
          number = number.slice(number.length - 10); // last 10 digits only
          info = number;
        } else if (selectedContact.emails && selectedContact.emails.length) {
          info = selectedContact.emails[0].email;
        } else if (otp) {
          info = otp;
        }

        setReceiveQR(
          JSON.stringify({
            requester: WALLET_SETUP.walletName,
            publicKey,
            info: info.trim(),
            uploadedAt: trustedContact.ephemeralChannel.initiatedAt,
            type: 'paymentTrustedContactQR',
            ver: appVersion,
          }),
        );
      }
    }
  }, [
    selectedContact,
    trustedContacts,
    AsTrustedContact,
    receiveLink,
    receiveQR,
    updateEphemeralChannelLoader,
  ]);

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
      trustedContactsInfo[3] = contact; // initial 3 reserved for Guardians
    }
    await AsyncStorage.setItem(
      'TrustedContactsInfo',
      JSON.stringify(trustedContactsInfo),
    );
    dispatch(updateTrustedContactInfoLocally(trustedContactsInfo));
  };

  const createTrustedContact = useCallback(async () => {
    if (!AsTrustedContact) return;

    if (selectedContact && selectedContact.firstName) {
      const contactName = `${selectedContact.firstName} ${
        selectedContact.lastName ? selectedContact.lastName : ''
      }`
        .toLowerCase()
        .trim();

      let info = '';
      if (selectedContact.phoneNumbers && selectedContact.phoneNumbers.length) {
        const phoneNumber = selectedContact.phoneNumbers[0].number;
        let number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
        number = number.slice(number.length - 10); // last 10 digits only
        info = number;
      } else if (selectedContact.emails && selectedContact.emails.length) {
        info = selectedContact.emails[0].email;
      }

      const contactInfo = {
        contactName,
        info: info.trim(),
      };

      const trustedContact = trustedContacts.tc.trustedContacts[contactName];
      const receivingAddress = service.getReceivingAddress(
        derivativeAccountDetails ? derivativeAccountDetails.type : null,
        derivativeAccountDetails ? derivativeAccountDetails.number : null,
      );

      let paymentURI;
      if (amount) {
        paymentURI = service.getPaymentURI(receivingAddress, {
          amount: parseInt(amount) / 1e8,
        }).paymentURI;
      }
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

      let trustedPaymentURI;
      if (amount) {
        trustedPaymentURI = service.getPaymentURI(trustedReceivingAddress, {
          amount: parseInt(amount) / 1e8,
        }).paymentURI;
      }

      if (!trustedContact) {
        (async () => {
          const walletID = await AsyncStorage.getItem('walletID');
          const FCM = fcmTokenValue;
          //await AsyncStorage.getItem('fcmToken');

          const data: EphemeralDataElements = {
            walletID,
            FCM,
            paymentDetails: {
              trusted: {
                address: trustedReceivingAddress,
                paymentURI: trustedPaymentURI,
              },
              alternate: {
                address: receivingAddress,
                paymentURI,
              },
            },
            trustedAddress: trustedReceivingAddress,
            trustedTestAddress: testAccount.hdWallet.receivingAddress,
          };
          dispatch(updateEphemeralChannel(contactInfo, data));
        })();
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
      } else if (
        !trustedContact.symmetricKey &&
        trustedContact.ephemeralChannel
      ) {
        if (
          trustedContact.ephemeralChannel.data &&
          trustedContact.ephemeralChannel.data[0].paymentDetails &&
          trustedContact.ephemeralChannel.data[0].paymentDetails.alternate
            .address === receivingAddress &&
          trustedContact.ephemeralChannel.data[0].paymentDetails.alternate
            .paymentURI === paymentURI
        )
          return;
        const data: EphemeralDataElements = {
          paymentDetails: {
            trusted: {
              address: trustedReceivingAddress,
              paymentURI: trustedPaymentURI,
            },
            alternate: {
              address: receivingAddress,
              paymentURI,
            },
          },
        };
        dispatch(updateEphemeralChannel(contactInfo, data));
      }
    }
  }, [
    selectedContact,
    trustedContacts,
    AsTrustedContact,
    amount,
    serviceType,
    service,
  ]);

  const checkNShowHelperModal = async () => {
    let isReceiveHelperDone1 = isReceiveHelperDoneValue;
    if (!isReceiveHelperDone1) {
      await AsyncStorage.getItem('isReceiveHelperDone');
    }
    if (!isReceiveHelperDone1 && serviceType == TEST_ACCOUNT) {
      dispatch(setReceiveHelper(true));
      //await AsyncStorage.setItem('isReceiveHelperDone', 'true');
      setTimeout(() => {
        setIsReceiveHelperDone(true);
      }, 10);
      setTimeout(() => {
        if (ReceiveHelperBottomSheet.current)
          (ReceiveHelperBottomSheet as any).current.snapTo(1);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsReceiveHelperDone(false);
      }, 10);
    }
  };

  useEffect(() => {
    checkNShowHelperModal();
    //(async () => {
    if (serviceType === SECURE_ACCOUNT) {
      if (!savingWarning) {
        //await AsyncStorage.getItem('savingsWarning')
        // TODO: integrate w/ any of the PDF's health (if it's good then we don't require the warning modal)
        if (SecureReceiveWarningBottomSheet.current)
          (SecureReceiveWarningBottomSheet as any).current.snapTo(1);
        dispatch(setSavingWarning(true));
        //await AsyncStorage.setItem('savingsWarning', 'true');
      }
    }
    //})();
  }, []);

  const onPressOkOf2FASetupWarning = () => {
    if (SecureReceiveWarningBottomSheet.current)
      (SecureReceiveWarningBottomSheet as any).current.snapTo(0);
  };

  const onPressTouchableWrapper = () => {
    if (ReceiveHelperBottomSheet.current)
      (ReceiveHelperBottomSheet as any).current.snapTo(0);
  };

  const onPressBack = () => {
    if (getServiceType) {
      getServiceType(serviceType, carouselIndex);
    }
    props.navigation.goBack();
  };

  const onPressKnowMore = () => {
    dispatch(setReceiveHelper(true));
    //AsyncStorage.setItem('isReceiveHelperDone', 'true');
    if (ReceiveHelperBottomSheet.current)
      (ReceiveHelperBottomSheet as any).current.snapTo(1);
  };

  const onPressShare = () => {
    if (AsTrustedContact) {
      createTrustedContact();
    }
    if (SendViaLinkBottomSheet.current)
      (SendViaLinkBottomSheet as any).current.snapTo(1);
  };

  const onPressQr = () => {
    if (AsTrustedContact) {
      createTrustedContact();
    }
    if (SendViaQRBottomSheet.current)
      (SendViaQRBottomSheet as any).current.snapTo(1);
  };

  const onPressReceiveHelperHeader = () => {
    if (isReceiveHelperDone) {
      if (ReceiveHelperBottomSheet.current)
        (ReceiveHelperBottomSheet as any).current.snapTo(1);
      setTimeout(() => {
        setIsReceiveHelperDone(false);
      }, 10);
    } else {
      if (ReceiveHelperBottomSheet.current)
        (ReceiveHelperBottomSheet as any).current.snapTo(0);
    }
  };

  const onPressContinue = (selectedContacts) => {
    setTimeout(() => {
      setSelectedContact(selectedContacts[0]);
    }, 2);
    (AddContactAddressBookBookBottomSheet as any).current.snapTo(0);
  };

  const setPhoneNumber = () => {
    let phoneNumber = selectedContact.phoneNumbers[0].number;
    let number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
    number = number.slice(number.length - 10); // last 10 digits only
    return number;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={() => onPressTouchableWrapper()}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <View style={BackupStyles.modalContainer}>
            <View style={BackupStyles.modalHeaderTitleView}>
              <View
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              >
                <TouchableOpacity
                  onPress={() => onPressBack()}
                  style={{ height: 30, width: 30, justifyContent: 'center' }}
                >
                  <FontAwesome
                    name="long-arrow-left"
                    color={Colors.blue}
                    size={17}
                  />
                </TouchableOpacity>
                <Image
                  source={
                    derivativeAccountDetails
                      ? require('../../assets/images/icons/icon_donation_hexa.png')
                      : serviceType == TEST_ACCOUNT
                      ? require('../../assets/images/icons/icon_test.png')
                      : serviceType == REGULAR_ACCOUNT
                      ? require('../../assets/images/icons/icon_regular.png')
                      : require('../../assets/images/icons/icon_secureaccount.png')
                  }
                  style={{ width: wp('10%'), height: wp('10%') }}
                />
                <View style={{ marginLeft: wp('2.5%') }}>
                  <Text style={BackupStyles.modalHeaderTitleText}>Receive</Text>
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontFamily: Fonts.FiraSansRegular,
                      fontSize: RFValue(12),
                    }}
                  >
                    {derivativeAccountDetails
                      ? 'Donation Account'
                      : serviceType == TEST_ACCOUNT
                      ? 'Test Account'
                      : serviceType == REGULAR_ACCOUNT
                      ? 'Checking Account'
                      : 'Savings Account'}
                  </Text>
                </View>
                {serviceType == TEST_ACCOUNT ? (
                  <Text
                    onPress={() => onPressKnowMore()}
                    style={styles.knowMoreTouchable}
                  >
                    Know more
                  </Text>
                ) : null}
              </View>
            </View>
            <ScrollView>
              <View style={{ flex: 1, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={styles.requestedAmountText}>
                  Requested amount:
                </Text>
                <View style={styles.textBoxView}>
                  <View style={styles.amountInputImage}>
                    <Image
                      style={styles.textBoxImage}
                      source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                    />
                  </View>
                  <TextInput
                    style={{ ...styles.textBox, paddingLeft: 10 }}
                    placeholder={'Enter amount in sats'}
                    value={amount}
                    returnKeyLabel="Done"
                    returnKeyType="done"
                    keyboardType={'numeric'}
                    onChangeText={(value) => setAmount(value)}
                    placeholderTextColor={Colors.borderColor}
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={10}
                  onPress={() => setAsTrustedContact(!AsTrustedContact)}
                  style={styles.senderAsContactTouchable}
                >
                  <Text style={styles.senderAsContactText}>
                    Add sender as Contact
                  </Text>
                  <View style={styles.senderAsContactCheckView}>
                    {AsTrustedContact && (
                      <Entypo
                        name="check"
                        size={RFValue(17)}
                        color={Colors.green}
                      />
                    )}
                  </View>
                </TouchableOpacity>
                {!isEmpty(selectedContact) && AsTrustedContact && (
                  <View style={styles.contactProfileView}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <View style={styles.selectedContactView}>
                        {selectedContact && selectedContact.imageAvailable ? (
                          <View style={styles.selectedContactImageView}>
                            <Image
                              source={selectedContact && selectedContact.image}
                              style={{ ...styles.contactProfileImage }}
                            />
                          </View>
                        ) : (
                          <View style={styles.selectedContactInitialsView}>
                            <Text style={styles.selectedContactInitialsText}>
                              {nameToInitials(
                                selectedContact &&
                                  selectedContact.firstName &&
                                  selectedContact.lastName
                                  ? selectedContact.firstName +
                                      ' ' +
                                      selectedContact.lastName
                                  : selectedContact &&
                                    selectedContact.firstName &&
                                    !selectedContact.lastName
                                  ? selectedContact.firstName
                                  : selectedContact &&
                                    !selectedContact.firstName &&
                                    selectedContact.lastName
                                  ? selectedContact.lastName
                                  : '',
                              )}
                            </Text>
                          </View>
                        )}
                        <View>
                          <Text style={styles.addingAsContactText}>
                            Adding as a Contact:
                          </Text>
                          <Text style={styles.contactNameText}>
                            {selectedContact &&
                            selectedContact.firstName &&
                            selectedContact.lastName
                              ? selectedContact.firstName +
                                ' ' +
                                selectedContact.lastName
                              : selectedContact &&
                                selectedContact.firstName &&
                                !selectedContact.lastName
                              ? selectedContact.firstName
                              : selectedContact &&
                                !selectedContact.firstName &&
                                selectedContact.lastName
                              ? selectedContact.lastName
                              : ''}
                          </Text>
                          {selectedContact &&
                          selectedContact.phoneNumbers &&
                          selectedContact.phoneNumbers.length ? (
                            <Text style={styles.selectedContactPhoneNumber}>
                              {setPhoneNumber()}
                              {/* {selectedContact.phoneNumbers[0].digits} */}
                            </Text>
                          ) : selectedContact &&
                            selectedContact.emails &&
                            selectedContact.emails.length ? (
                            <Text style={styles.selectedContactEmail}>
                              {selectedContact &&
                                selectedContact.emails[0].email}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
            <View style={styles.bottomButtonOuterView}>
              <View style={{ marginBottom: hp('1%') }}>
                <BottomInfoBox
                  title={'Bitcoin Receiving Address'}
                  infoText={'Generate bitcoin address and send via link or QR'}
                />
              </View>
              <View style={styles.bottomButtonInnerView}>
                <AppBottomSheetTouchableWrapper
                  onPress={() => onPressShare()}
                  style={styles.buttonInnerView}
                >
                  <Image
                    source={require('../../assets/images/icons/openlink.png')}
                    style={styles.buttonImage}
                  />
                  <Text style={styles.buttonText}>Share</Text>
                </AppBottomSheetTouchableWrapper>
                <View
                  style={{
                    width: 1,
                    height: 30,
                    backgroundColor: Colors.white,
                  }}
                />
                <AppBottomSheetTouchableWrapper
                  style={styles.buttonInnerView}
                  onPress={() => onPressQr()}
                >
                  <Image
                    source={require('../../assets/images/icons/qr-code.png')}
                    style={styles.buttonImage}
                  />
                  <Text style={styles.buttonText}>QR</Text>
                </AppBottomSheetTouchableWrapper>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      {/* {isLoading ? <Loader /> : null} */}
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ReceiveHelperBottomSheet as any}
        snapPoints={[-50, hp('89%')]}
        renderContent={() => (
          <ReceiveHelpContents
            titleClicked={() => {
              if (ReceiveHelperBottomSheet.current)
                (ReceiveHelperBottomSheet as any).current.snapTo(0);
            }}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            borderColor={Colors.blue}
            backgroundColor={Colors.blue}
            onPressHeader={() => onPressReceiveHelperHeader()}
          />
        )}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        enabledGestureInteraction={false}
        ref={AddContactAddressBookBookBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
        ]}
        renderContent={() => (
          <AddContactAddressBook
            isLoadContacts={isLoadContacts}
            modalTitle="Select a Contact"
            modalRef={AddContactAddressBookBookBottomSheet}
            proceedButtonText={'Confirm & Proceed'}
            onPressContinue={(selectedContacts) =>
              onPressContinue(selectedContacts)
            }
            onSelectContact={(selectedContact) =>
              setSelectedContact(selectedContact)
            }
            onPressBack={() => {
              setTimeout(() => {
                setAsTrustedContact(!AsTrustedContact);
                setSelectedContact({});
              }, 2);
              (AddContactAddressBookBookBottomSheet as any).current.snapTo(0);
            }}
            onSkipContinue={() => {
              let { skippedContactsCount } = trustedContacts.tc;
              let data;
              if (!skippedContactsCount) {
                skippedContactsCount = 1;
                data = {
                  firstName: 'F&F request',
                  lastName: `awaiting ${skippedContactsCount}`,
                  name: `F&F request awaiting ${skippedContactsCount}`,
                };
              } else {
                data = {
                  firstName: 'F&F request',
                  lastName: `awaiting ${skippedContactsCount + 1}`,
                  name: `F&F request awaiting ${skippedContactsCount + 1}`,
                };
              }

              onPressContinue([data]);
            }}
          />
        )}
        renderHeader={() => (
          <ModalHeader
            backgroundColor={Colors.white}
            //onPressHeader={() => (AddContactAddressBookBookBottomSheet as any).current.snapTo(0)}
          />
        )}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        enabledGestureInteraction={false}
        ref={SendViaLinkBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('45%') : hp('46%'),
        ]}
        renderContent={() => (
          <SendViaLink
            isFromReceive={true}
            headerText={'Share'}
            subHeaderText={
              !isEmpty(selectedContact)
                ? 'Send to your contact'
                : 'Send bitcoin address'
            }
            contactText={'Adding to Friends and Family:'}
            amountCurrency={serviceType == TEST_ACCOUNT ? 't-sats' : 'sats'}
            contact={!isEmpty(selectedContact) ? selectedContact : null}
            info={
              'Send the link below with your contact. It will send your bitcoin address and a way for the person to accept your request.'
            }
            infoText={
              receiveLink.includes('https://hexawallet.io')
                ? `Click here to accept contact request from ${
                    WALLET_SETUP.walletName
                  } Hexa wallet - link will expire in ${
                    config.TC_REQUEST_EXPIRY / (60000 * 60)
                  } hours`
                : null
            }
            amount={amount === '' ? null : amount}
            link={receiveLink}
            serviceType={serviceType}
            onPressBack={() => {
              if (SendViaLinkBottomSheet.current)
                (SendViaLinkBottomSheet as any).current.snapTo(0);
            }}
            onPressDone={() =>
              (SendViaLinkBottomSheet as any).current.snapTo(0)
            }
          />
        )}
        renderHeader={() => (
          <ModalHeader
          // onPressHeader={() => {
          //   if (SendViaLinkBottomSheet.current)
          //     (SendViaLinkBottomSheet as any).current.snapTo(0);
          // }}
          />
        )}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        enabledGestureInteraction={false}
        ref={SendViaQRBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('55%') : hp('56%'),
        ]}
        renderContent={() => (
          <SendViaQR
            isFromReceive={true}
            headerText={'QR'}
            subHeaderText={'Scan QR for contact request'}
            contactText={'Adding to Friends and Family:'}
            contact={!isEmpty(selectedContact) ? selectedContact : null}
            amount={amount === '' ? null : amount}
            QR={receiveQR}
            serviceType={serviceType}
            amountCurrency={serviceType == TEST_ACCOUNT ? 't-sats' : 'sats'}
            contactEmail={''}
            onPressBack={() => {
              if (SendViaQRBottomSheet.current)
                (SendViaQRBottomSheet as any).current.snapTo(0);
            }}
            onPressDone={() => (SendViaQRBottomSheet as any).current.snapTo(0)}
          />
        )}
        renderHeader={() => (
          <ModalHeader
          // onPressHeader={() => {
          //   if (SendViaQRBottomSheet.current)
          //     (SendViaQRBottomSheet as any).current.snapTo(0);
          // }}
          />
        )}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        enabledGestureInteraction={false}
        ref={SecureReceiveWarningBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={() => (
          <TwoFASetupWarningModal
            onPressOk={() => onPressOkOf2FASetupWarning()}
            //onPressManageBackup={() => props.navigation.replace('ManageBackup')}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            borderColor={Colors.borderColor}
            backgroundColor={Colors.white}
            // onPressHeader={() => {
            //   if (SecureReceiveWarningBottomSheet.current)
            //     (SecureReceiveWarningBottomSheet as any).current.snapTo(0);
            // }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: hp('2%'),
    elevation: 10,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 15,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
    marginBottom: hp('1%'),
  },
  textBoxImage: {
    width: wp('6%'),
    height: wp('6%'),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  contactProfileView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('2%'),
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
    marginLeft: 5,
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
  knowMoreTouchable: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    marginLeft: 'auto',
  },
  requestedAmountText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: 10,
    marginTop: hp('1%'),
  },
  senderAsContactTouchable: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: Colors.backgroundColor1,
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 15,
    height: wp('13%'),
  },
  senderAsContactText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
  },
  senderAsContactCheckView: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: 7,
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedContactView: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.backgroundColor1,
    height: 90,
    borderRadius: 10,
  },
  selectedContactImageView: {
    marginLeft: 15,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 1,
    shadowOffset: { width: 2, height: 2 },
  },
  selectedContactInitialsView: {
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
  },
  selectedContactInitialsText: {
    textAlign: 'center',
    fontSize: RFValue(20),
    lineHeight: RFValue(20), //... One for top and one for bottom alignment
  },
  addingAsContactText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginLeft: 5,
    paddingTop: 5,
    paddingBottom: 3,
  },
  selectedContactPhoneNumber: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(10),
    marginLeft: 5,
    paddingTop: 3,
  },
  selectedContactEmail: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(10),
    marginLeft: 5,
    paddingTop: 3,
    paddingBottom: 5,
  },
  bottomButtonOuterView: {
    marginTop: 'auto',
    marginBottom: hp('3%'),
    paddingTop: 10,
  },
  bottomButtonInnerView: {
    flexDirection: 'row',
    backgroundColor: Colors.blue,
    height: 60,
    borderRadius: 10,
    marginLeft: 25,
    marginRight: 25,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },
  TwoFAWarningView: {
    height: '100%',
    alignItems: 'center',
    marginTop: hp('2%'),
    flex: 1,
  },
});
