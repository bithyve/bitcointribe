import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  AsyncStorage,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { nameToInitials } from '../../common/CommonFunctions';
import Entypo from 'react-native-vector-icons/Entypo';
import _ from 'underscore';
import moment from 'moment';
import { addTransferDetails } from '../../store/actions/accounts';
import { REGULAR_ACCOUNT } from '../../common/constants/serviceTypes';
import BottomSheet from 'reanimated-bottom-sheet';
import SendViaLink from '../../components/SendViaLink';
import ModalHeader from '../../components/ModalHeader';
import DeviceInfo from 'react-native-device-info';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import {
  uploadRequestedShare,
  ErrorSending,
  UploadSuccessfully,
} from '../../store/actions/sss';
import S3Service from '../../bitcoin/services/sss/S3Service';
import ErrorModalContents from '../../components/ErrorModalContents';
import config from '../../bitcoin/HexaConfig';
import SendViaQR from '../../components/SendViaQR';

export default function ContactDetails(props) {
  const dispatch = useDispatch();
  const [Loading, setLoading] = useState(true);
  const Contact = props.navigation.state.params.contact;
  const contactsType = props.navigation.state.params.contactsType;
  const index = props.navigation.state.params.index;
  const [contact, setContact] = useState(Contact ? Contact : Object);
  const [SelectedOption, setSelectedOption] = useState(0);
  // const [SendViaLinkBottomSheet, setSendViaLinkBottomSheet] = useState(
  //   React.createRef(),
  // );
  const [SendViaQRBottomSheet, setSendViaQRBottomSheet] = useState(
    React.createRef(),
  );
  const [trustedContactHistory, setTrustedContactHistory] = useState([
    {
      id: 1,
      title: 'Recovery Key created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Key in-transit',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Key accessible',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Key not accessible',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 5,
      title: 'Sent Amount',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
  ]);

  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [buttonText, setButtonText] = useState('Try again');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  // const [trustedLink, setTrustedLink] = useState('');
  const [trustedQR, setTrustedQR] = useState('');

  const [key, setKey] = useState('');
  const uploading = useSelector(
    (state) => state.sss.loading.uploadRequestedShare,
  );
  const errorSending = useSelector((state) => state.sss.errorSending);
  const uploadSuccessfull = useSelector(
    (state) => state.sss.uploadSuccessfully,
  );
  const trustedContacts: TrustedContactsService = useSelector(
    (state) => state.trustedContacts.service,
  );
  const { UNDER_CUSTODY } = useSelector(
    (state) => state.storage.database.DECENTRALIZED_BACKUP,
  );

  useEffect(() => {
    setContact(Contact);
    if (contactsType == 'My Keepers') saveInTransitHistory('inTransit');
    else getHistoryForTrustedContacts();
  }, [Contact]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [trustedContactHistory]);

  const onPressSend = () => {
    if (contactsType == 'My Keepers') {
      saveInTransitHistory('isSent');
    }
    dispatch(
      addTransferDetails(REGULAR_ACCOUNT, {
        selectedContact: Contact,
      }),
    );
    props.navigation.navigate('SendToContact', {
      selectedContact: Contact,
      serviceType: REGULAR_ACCOUNT,
      isFromAddressBook: true,
    });
  };

  const getHistoryForTrustedContacts = async () => {
    let OtherTrustedContactsHistory = [];
    if (contactsType == 'Other Trusted Contacts') {
      OtherTrustedContactsHistory = JSON.parse(
        await AsyncStorage.getItem('OtherTrustedContactsHistory'),
      );
    } else {
      OtherTrustedContactsHistory = JSON.parse(
        await AsyncStorage.getItem('IMKeeperOfHistory'),
      );
    }
    if (OtherTrustedContactsHistory) {
      OtherTrustedContactsHistory = getHistoryByContactId(
        OtherTrustedContactsHistory,
      );
    }
    if (OtherTrustedContactsHistory && OtherTrustedContactsHistory.length > 0) {
      setTrustedContactHistory(sortedHistory(OtherTrustedContactsHistory));
    } else {
      setTrustedContactHistory([]);
    }
  };

  const getHistoryByContactId = (history) => {
    let array = [];
    if (history && history.length > 0) {
      for (let i = 0; i < history.length; i++) {
        const element = history[i];
        if (
          element.selectedContactInfo &&
          element.selectedContactInfo.selectedContact.id == Contact.id
        ) {
          array.push(element);
        }
      }
    }
    return array;
  };

  const sortedHistory = useCallback((history) => {
    const currentHistory = history.filter((element) => {
      if (element.date) return element;
    });
    const sortedHistory = _.sortBy(currentHistory, 'date');
    sortedHistory.forEach((element) => {
      element.date = moment(element.date)
        .utc()
        .local()
        .format('DD MMMM YYYY HH:mm');
    });
    return sortedHistory;
  }, []);

  const updateHistory = useCallback(
    (shareHistory) => {
      const updatedTrustedContactHistory = [...trustedContactHistory];
      if (shareHistory[index].createdAt)
        updatedTrustedContactHistory[0].date = shareHistory[index].createdAt;
      if (shareHistory[index].inTransit)
        updatedTrustedContactHistory[1].date = shareHistory[index].inTransit;
      if (shareHistory[index].accessible)
        updatedTrustedContactHistory[2].date = shareHistory[index].accessible;
      if (shareHistory[index].notAccessible)
        updatedTrustedContactHistory[3].date =
          shareHistory[index].notAccessible;
      if (shareHistory[index].inSent)
        updatedTrustedContactHistory[4].date = shareHistory[index].inSent;
      setTrustedContactHistory(updatedTrustedContactHistory);
    },
    [trustedContactHistory],
  );

  const saveInTransitHistory = useCallback(
    async (type) => {
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem('shareHistory'),
      );
      if (shareHistory) {
        const updatedShareHistory = [...shareHistory];
        if (type == 'inTransit') {
          updatedShareHistory[index] = {
            ...updatedShareHistory[index],
            inTransit: Date.now(),
          };
        }
        if (type == 'isSent') {
          updatedShareHistory[index] = {
            ...updatedShareHistory[index],
            inSent: Date.now(),
          };
        }
        updateHistory(updatedShareHistory);
        await AsyncStorage.setItem(
          'shareHistory',
          JSON.stringify(updatedShareHistory),
        );
      }
    },
    [updateHistory],
  );

  const getImageIcon = (item) => {
    if (item) {
      if (item.imageAvailable) {
        return (
          <View style={styles.headerImageView}>
            <Image source={item.image} style={styles.headerImage} />
          </View>
        );
      } else {
        return (
          <View style={styles.headerImageView}>
            <View style={styles.headerImageInitials}>
              <Text style={styles.headerImageInitialsText}>
                {item
                  ? nameToInitials(
                      item.firstName && item.lastName
                        ? item.firstName + ' ' + item.lastName
                        : item.firstName && !item.lastName
                        ? item.firstName
                        : !item.firstName && item.lastName
                        ? item.lastName
                        : '',
                    )
                  : ''}
              </Text>
            </View>
          </View>
        );
      }
    }
  };

  const SelectOption = (Id) => {
    if (Id == SelectedOption) {
      setSelectedOption(0);
    } else {
      setSelectedOption(Id);
    }
  };

  useEffect(() => {
    if (!Contact) {
      Alert.alert('Contact details missing');
      return;
    }

    const contactName = `${Contact.firstName} ${
      Contact.lastName ? Contact.lastName : ''
    }`
      .toLowerCase()
      .trim();

    if (
      !trustedContacts.tc.trustedContacts[contactName] &&
      !trustedContacts.tc.trustedContacts[contactName].isWard
    ) {
      Alert.alert(
        'Restore request failed',
        'You are not a keeper of the selected contact',
      );
      return;
    }

    const requester =
      trustedContacts.tc.trustedContacts[contactName].contactsWalletName;

    if (
      UNDER_CUSTODY[requester] &&
      UNDER_CUSTODY[requester].TRANSFER_DETAILS &&
      Date.now() - UNDER_CUSTODY[requester].TRANSFER_DETAILS.UPLOADED_AT <
        600000
    ) {
      const { KEY, UPLOADED_AT } = UNDER_CUSTODY[requester].TRANSFER_DETAILS;

      // if (Contact.phoneNumbers && Contact.phoneNumbers.length) {
      //   const phoneNumber = Contact.phoneNumbers[0].number;
      //   console.log({ phoneNumber });
      //   const number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
      //   const numHintType = 'num';
      //   const numHint = number.slice(number.length - 3);
      //   const numberEncKey = TrustedContactsService.encryptPub(KEY, number)
      //     .encryptedPub;
      //   const numberDL =
      //     `https://hexawallet.io/${config.APP_STAGE}/rrk` +
      //     `/${requester}` +
      //     `/${numberEncKey}` +
      //     `/${numHintType}` +
      //     `/${numHint}` +
      //     `/${UPLOADED_AT}`;
      //   console.log({ numberDL });
      //   setTrustedLink(numberDL);
      //   setTimeout(() => {
      //     (SendViaLinkBottomSheet as any).current.snapTo(1);
      //   }, 2);
      // } else if (Contact.emails && Contact.emails.length) {
      //   const email = Contact.emails[0].email;
      //   const emailInitials: string = email.split('@')[0];
      //   const emailHintType = 'eml';
      //   const emailHint = emailInitials.slice(emailInitials.length - 3);
      //   const emailEncKey = TrustedContactsService.encryptPub(
      //     KEY,
      //     emailInitials,
      //   ).encryptedPub;
      //   const emailDL =
      //     `https://hexawallet.io/${config.APP_STAGE}/rrk` +
      //     `/${requester}` +
      //     `/${emailEncKey}` +
      //     `/${emailHintType}` +
      //     `/${emailHint}` +
      //     `/${UPLOADED_AT}`;
      //   console.log({ emailDL });
      //   setTrustedLink(emailDL);
      //   setTimeout(() => {
      //     (SendViaLinkBottomSheet as any).current.snapTo(1);
      //   }, 2);
      // } else {
      //   Alert.alert(
      //     'Invalid Contact',
      //     'Cannot add a contact without phone-num/email as a trusted entity',
      //   );
      // }

      setTrustedQR(
        JSON.stringify({
          requester: requester,
          publicKey: KEY,
          uploadedAt: UPLOADED_AT,
          type: 'ReverseRecoveryQR',
        }),
      );

      setTimeout(() => {
        (SendViaQRBottomSheet as any).current.snapTo(1);
      }, 2);

      dispatch(UploadSuccessfully(null));
    }
  }, [Contact, UNDER_CUSTODY]);

  const onHelpRestore = useCallback(() => {
    if (!Contact) {
      console.log('Err: Contact missing');
      return;
    }

    const contactName = `${Contact.firstName} ${
      Contact.lastName ? Contact.lastName : ''
    }`
      .toLowerCase()
      .trim();

    if (
      !trustedContacts.tc.trustedContacts[contactName] &&
      !trustedContacts.tc.trustedContacts[contactName].isWard
    ) {
      Alert.alert(
        'Restore request failed',
        'You are not a keeper of the selected contact',
      );
      return;
    }
    const requester =
      trustedContacts.tc.trustedContacts[contactName].contactsWalletName;
    const encryptionKey = S3Service.generateRequestCreds().key;

    if (
      !UNDER_CUSTODY[requester] ||
      !UNDER_CUSTODY[requester].TRANSFER_DETAILS
    ) {
      dispatch(uploadRequestedShare(requester, encryptionKey));
    } else if (
      Date.now() - UNDER_CUSTODY[requester].TRANSFER_DETAILS.UPLOADED_AT >
      600000
    ) {
      dispatch(uploadRequestedShare(requester, encryptionKey));
    } else {
      setTimeout(() => {
        (SendViaQRBottomSheet as any).current.snapTo(1);
      }, 2);
    }
  }, [Contact, UNDER_CUSTODY]);

  useEffect(() => {
    if (errorSending) {
      setTimeout(() => {
        setErrorMessageHeader('Error sending Recovery Secret');
        setErrorMessage(
          'There was an error while sending your Recovery Secret, please try again in a little while',
        );
        setButtonText('Try again');
      }, 2);
      (ErrorBottomSheet as any).current.snapTo(1);
      dispatch(ErrorSending(null));
    }
  }, [errorSending]);

  // const renderSendViaLinkContents = useCallback(() => {
  //   return (
  //     <SendViaLink
  //       contactText={'Send Recovery Secret'}
  //       contact={Contact}
  //       link={trustedLink}
  //       contactEmail={''}
  //       onPressBack={() => {
  //         if (SendViaLinkBottomSheet.current)
  //           (SendViaLinkBottomSheet as any).current.snapTo(0);
  //       }}
  //       onPressDone={() => {
  //         (SendViaLinkBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, [Contact, trustedLink]);

  // const renderSendViaLinkHeader = useCallback(() => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         if (SendViaLinkBottomSheet.current)
  //           (SendViaLinkBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, []);

  const renderSendViaQRContents = useCallback(() => {
    return (
      <SendViaQR
        headerText={'Send Recovery Secret'}
        subHeaderText={'Your ward should scan the QR to restore'}
        contactText={''}
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

  const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={buttonText}
        onPressProceed={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/errorImage.png')}
      />
    );
  }, [errorMessage, errorMessageHeader, buttonText]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 0, backgroundColor: Colors.backgroundColor }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            {getImageIcon(contact)}
            <View>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(11),
                  marginLeft: 10,
                }}
              >
                {contactsType}
              </Text>
              <Text style={styles.contactText}>
                {Contact.contactName == 'Secondary Device'
                  ? 'Keeper Device'
                  : contact.contactName}
              </Text>
              {contact.connectedVia ? (
                <Text style={styles.phoneText}>{contact.connectedVia}</Text>
              ) : null}
            </View>
            {Contact.hasXpub && Contact.contactName != 'Secondary Device' && (
              <TouchableOpacity
                onPress={() => onPressSend()}
                style={{
                  width: wp('15%'),
                  height: wp('6%'),
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: Colors.lightBlue,
                  marginLeft: 'auto',
                  marginBottom: 10,
                  borderRadius: 4,
                  flexDirection: 'row',
                  alignSelf: 'flex-end',
                }}
              >
                <Image
                  source={require('../../assets/images/icons/icon_bitcoin_light.png')}
                  style={{
                    height: wp('4%'),
                    width: wp('4%'),
                    resizeMode: 'contain',
                  }}
                />
                <Text
                  style={{
                    color: Colors.white,
                    fontFamily: Fonts.FiraSansMedium,
                    fontSize: RFValue(10),
                    marginLeft: 2,
                  }}
                >
                  Send
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {!Loading ? (
          <ScrollView style={{ flex: 1 }}>
            {sortedHistory(trustedContactHistory).map((value) => {
              if (SelectedOption == value.id) {
                return (
                  <TouchableOpacity
                    key={value.id}
                    onPress={() => SelectOption(value.id)}
                    style={{
                      margin: wp('3%'),
                      backgroundColor: Colors.white,
                      borderRadius: 10,
                      height: wp('20%'),
                      width: wp('90%'),
                      justifyContent: 'center',
                      paddingLeft: wp('3%'),
                      paddingRight: wp('3%'),
                      alignSelf: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.blue,
                        fontSize: RFValue(13),
                        fontFamily: Fonts.FiraSansRegular,
                      }}
                    >
                      {value.title}
                    </Text>
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(10),
                        fontFamily: Fonts.FiraSansRegular,
                        marginTop: 5,
                      }}
                    >
                      {value.info}
                    </Text>
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(9),
                        fontFamily: Fonts.FiraSansRegular,
                        marginTop: hp('0.3%'),
                      }}
                    >
                      {value.date}
                    </Text>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity
                    key={value.id}
                    onPress={() => SelectOption(value.id)}
                    style={{
                      margin: wp('3%'),
                      backgroundColor: Colors.white,
                      borderRadius: 10,
                      height: wp('15%'),
                      width: wp('85%'),
                      justifyContent: 'center',
                      paddingLeft: wp('3%'),
                      paddingRight: wp('3%'),
                      alignSelf: 'center',
                    }}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansRegular,
                        }}
                      >
                        {value.title}
                      </Text>
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(9),
                          fontFamily: Fonts.FiraSansRegular,
                          marginLeft: 'auto',
                        }}
                      >
                        {value.date}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(8),
                        fontFamily: Fonts.FiraSansRegular,
                        marginTop: 5,
                      }}
                    >
                      {value.info}
                    </Text>
                  </TouchableOpacity>
                );
              }
            })}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>
            <ScrollView>
              {[1, 2, 3, 4, 5].map((value, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      margin: wp('3%'),
                      backgroundColor: Colors.white,
                      borderRadius: 10,
                      height: wp('20%'),
                      width: wp('90%'),
                      paddingLeft: wp('3%'),
                      paddingRight: wp('3%'),
                      alignSelf: 'center',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      <View
                        style={{
                          backgroundColor: Colors.backgroundColor,
                          height: wp('4%'),
                          width: wp('40%'),
                          borderRadius: 10,
                        }}
                      />
                      <View
                        style={{
                          backgroundColor: Colors.backgroundColor,
                          height: wp('4%'),
                          width: wp('30%'),
                          marginTop: 5,
                          borderRadius: 10,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <View style={{ backgroundColor: Colors.backgroundColor }}>
              <View
                style={{
                  margin: 15,
                  backgroundColor: Colors.white,
                  padding: 10,
                  paddingTop: 20,
                  borderRadius: 7,
                }}
              >
                <Text
                  style={{
                    color: Colors.black,
                    fontSize: RFValue(13),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  No history
                </Text>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  The history of your Recovery Key will appear here
                </Text>
              </View>
            </View>
          </View>
        )}
        {(contactsType == 'My Keepers' || contactsType == "I'm Keeper of") && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              backgroundColor: Colors.white,
              paddingTop: wp('3%'),
              paddingBottom: wp('4%'),
              height: wp('30'),
            }}
          >
            <TouchableOpacity
              style={styles.bottomButton}
              onPress={onHelpRestore}
            >
              <Image
                source={require('../../assets/images/icons/icon_sell.png')}
                style={styles.buttonImage}
              />
              <View>
                {uploading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.buttonText}>Help Restore</Text>
                )}
                <Text numberOfLines={1} style={styles.buttonInfo}>
                  Lorem ipsum dolor
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton}>
              <Image
                source={require('../../assets/images/icons/icon_buy.png')}
                style={styles.buttonImage}
              />
              <View>
                <Text style={styles.buttonText}>Request Key</Text>
                <Text numberOfLines={1} style={styles.buttonInfo}>
                  Lorem ipsum dolor
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* <BottomSheet
        enabledInnerScrolling={true}
        ref={SendViaLinkBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('83%') : hp('85%'),
        ]}
        renderContent={renderSendViaLinkContents}
        renderHeader={renderSendViaLinkHeader}
      /> */}
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendViaQRBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('83%') : hp('85%'),
        ]}
        renderContent={renderSendViaQRContents}
        renderHeader={renderSendViaQRHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: wp('15%'),
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.black,
  },
  phoneText: {
    marginTop: 3,
    marginLeft: 10,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  filterButton: {
    height: wp('8%'),
    width: wp('12%'),
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerImageView: {
    width: wp('17%'),
    height: wp('17%'),
    borderColor: 'red',
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp('17%') / 2,
  },
  headerImage: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('15%') / 2,
  },
  headerImageInitials: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.shadowBlue,
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('15%') / 2,
  },
  headerImageInitialsText: {
    textAlign: 'center',
    fontSize: RFValue(17),
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('30%'),
  },
  buttonImage: {
    width: wp('10%'),
    height: wp('10%'),
    resizeMode: 'contain',
    tintColor: Colors.blue,
  },
  buttonText: {
    color: Colors.black,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansMedium,
    marginLeft: 10,
  },
  buttonInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue(9),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 5,
    marginLeft: 10,
  },
  bottomButton: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    height: wp('17%'),
    width: wp('40%'),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.borderColor,
    alignSelf: 'center',
  },
});
