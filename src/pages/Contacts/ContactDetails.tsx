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
  uploadEncMShare,
} from '../../store/actions/sss';
import S3Service from '../../bitcoin/services/sss/S3Service';
import ErrorModalContents from '../../components/ErrorModalContents';
import config from '../../bitcoin/HexaConfig';
import SendViaQR from '../../components/SendViaQR';
import BottomInfoBox from '../../components/BottomInfoBox';
import SendShareModal from '../ManageBackup/SendShareModal';
import {
  EphemeralDataElements,
  MetaShare,
} from '../../bitcoin/utilities/Interface';
import {
  updateEphemeralChannel,
  removeTrustedContact,
} from '../../store/actions/trustedContacts';

export default function ContactDetails(props) {
  const [isSendDisabled, setIsSendDisabled] = useState(false);
  const dispatch = useDispatch();
  const [Loading, setLoading] = useState(true);
  const Contact = props.navigation.state.params.contact;
  const contactsType = props.navigation.state.params.contactsType;
  const itemIndex = props.navigation.state.params.index;
  const index = props.navigation.state.params.shareIndex;
  const [contact, setContact] = useState(Contact ? Contact : Object);
  const [SelectedOption, setSelectedOption] = useState(0);
  const [ReshareBottomSheet, setReshareBottomSheet] = useState(
    React.createRef(),
  );
  const [shareBottomSheet, setshareBottomSheet] = useState(React.createRef());

  const [SendViaLinkBottomSheet, setSendViaLinkBottomSheet] = useState(
    React.createRef(),
  );
  const [SendViaQRBottomSheet, setSendViaQRBottomSheet] = useState(
    React.createRef(),
  );
  const [ExitKeyQRBottomSheet, setExitKeyQRBottomSheet] = useState(
    React.createRef(),
  );
  const [trustedContactHistory, setTrustedContactHistory] = useState([
    {
      id: 1,
      title: 'Recovery Key created',
      date: null,
      // info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Key in-transit',
      date: null,
      // info: 'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Key accessible',
      date: null,
      // info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Key not accessible',
      date: null,
      // info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 5,
      title: 'Sent Amount',
      date: null,
      // info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
  ]);

  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [buttonText, setButtonText] = useState('Try again');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const [trustedLink, setTrustedLink] = useState('');
  const [trustedQR, setTrustedQR] = useState('');
  const [encryptedExitKey, setEncryptedExitKey] = useState('');

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

  const { DECENTRALIZED_BACKUP, WALLET_SETUP } = useSelector(
    (state) => state.storage.database,
  );
  const { SHARES_TRANSFER_DETAILS } = DECENTRALIZED_BACKUP;
  const uploadMetaShare = useSelector(
    (state) => state.sss.loading.uploadMetaShare,
  );
  const updateEphemeralChannelLoader = useSelector(
    (state) => state.trustedContacts.loading.updateEphemeralChannel,
  );

  useEffect(() => {
    let setIsSendDisabledListener = props.navigation.addListener(
      'didFocus',
      () => {
        setIsSendDisabled(false);
      },
    );
    return () => {
      setIsSendDisabledListener.remove();
    };
  }, []);

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

  const onPressResendRequest = () => {
    if (index < 3) {
      setTimeout(() => {
        (ReshareBottomSheet as any).current.snapTo(1);
      }, 2);
    } else {
      props.navigation.navigate('AddContactSendRequest', {
        SelectedContact: [Contact],
      });
    }
  };

  const getHistoryForTrustedContacts = async () => {
    let OtherTrustedContactsHistory = [];
    if (contactsType == 'Other Contacts') {
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

  const generateHelpRestoreQR = useCallback(() => {
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
    const appVersion = DeviceInfo.getVersion();
    if (
      UNDER_CUSTODY[requester] &&
      UNDER_CUSTODY[requester].TRANSFER_DETAILS &&
      Date.now() - UNDER_CUSTODY[requester].TRANSFER_DETAILS.UPLOADED_AT <
        config.TC_REQUEST_EXPIRY
    ) {
      const { KEY, UPLOADED_AT } = UNDER_CUSTODY[requester].TRANSFER_DETAILS;

      // if (Contact.phoneNumbers && Contact.phoneNumbers.length) {
      //   const phoneNumber = Contact.phoneNumbers[0].number;
      //   console.log({ phoneNumber });
      //   let number = phoneNumber.replace(/[^0-9]/g, ''); // removing non-numeric characters
      // number = number.slice(number.length - 10); // last 10 digits only
      // const numHintType = 'num';
      // const numHint = number[0] + number.slice(number.length - 2);
      //   const numberEncKey = TrustedContactsService.encryptPub(KEY, number)
      //     .encryptedPub;
      //   const numberDL =
      //     `https://hexawallet.io/${config.APP_STAGE}/rrk` +
      //     `/${requester}` +
      //     `/${numberEncKey}` +
      //     `/${numHintType}` +
      //     `/${numHint}` +
      //     `/${UPLOADED_AT}` +
      //      `/v${appVersion}`;
      //   console.log({ numberDL });
      //   setTrustedLink(numberDL);
      //   setTimeout(() => {
      //     (SendViaLinkBottomSheet as any).current.snapTo(1);
      //   }, 2);
      // } else if (Contact.emails && Contact.emails.length) {
      //   const email = Contact.emails[0].email;
      //   const emailHintType = 'eml';
      // const trucatedEmail = email.replace('.com', '');
      // const emailHint =
      //   email[0] + trucatedEmail.slice(trucatedEmail.length - 2);
      //   const emailEncKey = TrustedContactsService.encryptPub(
      //     KEY,
      //     email,
      //   ).encryptedPub;
      //   const emailDL =
      //     `https://hexawallet.io/${config.APP_STAGE}/rrk` +
      //     `/${requester}` +
      //     `/${emailEncKey}` +
      //     `/${emailHintType}` +
      //     `/${emailHint}` +
      //     `/${UPLOADED_AT}`  +
      //     `/v${appVersion}`;
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
          ver: appVersion,
        }),
      );

      setTimeout(() => {
        (SendViaQRBottomSheet as any).current.snapTo(1);
      }, 2);

      dispatch(UploadSuccessfully(null));
    }
  }, [Contact, UNDER_CUSTODY]);

  useEffect(() => {
    if (!Contact || !Contact.isWard) {
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
      return;
    }
    const requester =
      trustedContacts.tc.trustedContacts[contactName].contactsWalletName;

    const metaShare: MetaShare = UNDER_CUSTODY[requester].META_SHARE;
    if (metaShare.meta.index === 0) {
      const encryptedExitKey = metaShare.encryptedStaticNonPMDD;
      setEncryptedExitKey(
        JSON.stringify({ type: 'encryptedExitKey', encryptedExitKey }),
      );
    }
  }, [Contact]);

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
      config.TC_REQUEST_EXPIRY
    ) {
      dispatch(uploadRequestedShare(requester, encryptionKey));
    } else {
      generateHelpRestoreQR();
    }
  }, [Contact, UNDER_CUSTODY]);

  useEffect(() => {
    if (uploadSuccessfull) generateHelpRestoreQR();
  }, [uploadSuccessfull]);

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

  const renderSendViaLinkContents = useCallback(() => {
    return (
      <SendViaLink
        contactText={'Send Recovery Secret'}
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
        headerText={'Send Recovery Secret'}
        subHeaderText={'You should scan the QR to restore'}
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
  }, [Contact, trustedQR, encryptedExitKey]);

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

  const renderExitKeyQRContents = useCallback(() => {
    return (
      <SendViaQR
        headerText={'Encrypted Exit Key'}
        subHeaderText={'You should scan the QR to restore Personal Copy'}
        contactText={''}
        contact={Contact}
        QR={encryptedExitKey}
        contactEmail={''}
        onPressBack={() => {
          if (ExitKeyQRBottomSheet.current)
            (ExitKeyQRBottomSheet as any).current.snapTo(0);
        }}
        onPressDone={() => {
          (ExitKeyQRBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [Contact, trustedQR, encryptedExitKey]);

  const renderExitKeyQRHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          if (ExitKeyQRBottomSheet.current)
            (ExitKeyQRBottomSheet as any).current.snapTo(0);
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

  const renderReshareContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ReshareBottomSheet}
        title={'Reshare Recovery Key\nwith Keeper'}
        info={'Did your Keeper not receive the Recovery Key?'}
        note={'You can reshare the Recovery Key with your Keeper'}
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (shareBottomSheet as any).current.snapTo(1);
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  }, []);

  const renderReshareHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  function isEmpty(obj) {
    return Object.keys(obj).every((k) => !Object.keys(obj[k]).length);
  }

  const createGuardian = useCallback(async () => {
    if (!Object.keys(Contact).length) return;
    if (
      Contact.firstName &&
      ((Contact.phoneNumbers && Contact.phoneNumbers.length) ||
        (Contact.emails && Contact.emails.length))
    ) {
      const walletID = await AsyncStorage.getItem('walletID');
      const FCM = await AsyncStorage.getItem('fcmToken');
      console.log({ walletID, FCM });

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

      let data: EphemeralDataElements = {
        walletID,
        FCM,
      };
      const trustedContact = trustedContacts.tc.trustedContacts[contactName];

      // if (changeContact && !trustedContacts.tc.trustedContacts[contactName]) {
      //   // !trustedContacts.tc.trustedContacts[contactName] ensures that TC actually changed
      //   setTrustedLink('');
      //   setTrustedQR('');
      //   // remove the previous TC
      //   let trustedContactsInfo: any = await AsyncStorage.getItem(
      //     'TrustedContactsInfo',
      //   );

      //   let previousGuardianName;
      //   if (trustedContactsInfo) {
      //     trustedContactsInfo = JSON.parse(trustedContactsInfo);
      //     const previousGuardian = trustedContactsInfo[index];
      //     if (previousGuardian) {
      //       previousGuardianName = `${previousGuardian.firstName} ${
      //         previousGuardian.lastName ? previousGuardian.lastName : ''
      //       }`
      //         .toLowerCase()
      //         .trim();
      //     } else {
      //       console.log('Previous guardian details missing');
      //     }
      //   }

      //   dispatch(
      //     uploadEncMShare(index, contactName, data, true, previousGuardianName),
      //   );
      //   updateTrustedContactsInfo(Contact);
      //   onOTPShare(index); // enables reshare
      //   setChangeContact(false);
      // } else
      console.log({ index });
      console.log(SHARES_TRANSFER_DETAILS);
      console.log(
        Date.now() - SHARES_TRANSFER_DETAILS[index].UPLOADED_AT >
          config.TC_REQUEST_EXPIRY,
      );
      if (
        !SHARES_TRANSFER_DETAILS[index] ||
        Date.now() - SHARES_TRANSFER_DETAILS[index].UPLOADED_AT >
          config.TC_REQUEST_EXPIRY
      ) {
        setTrustedLink('');
        setTrustedQR('');
        dispatch(uploadEncMShare(index, contactInfo, data));
      } else if (
        trustedContact &&
        !trustedContact.symmetricKey &&
        trustedContact.ephemeralChannel &&
        trustedContact.ephemeralChannel.initiatedAt &&
        Date.now() - trustedContact.ephemeralChannel.initiatedAt >
          config.TC_REQUEST_EXPIRY
      ) {
        setTrustedLink('');
        setTrustedQR('');
        dispatch(
          updateEphemeralChannel(
            contactInfo,
            trustedContact.ephemeralChannel.data[0],
          ),
        );
      }
    } else {
      Alert.alert(
        'Invalid Contact',
        'Cannot add a contact without phone-num/email as a entity',
      );
    }
  }, [SHARES_TRANSFER_DETAILS[index], Contact, trustedContacts]);

  const createDeepLink = useCallback(() => {
    console.log(uploadMetaShare, updateEphemeralChannelLoader);
    if (uploadMetaShare || updateEphemeralChannelLoader) {
      if (trustedLink) setTrustedLink('');
      if (trustedQR) setTrustedQR('');
      return;
    }
    if (!SHARES_TRANSFER_DETAILS[index]) {
      setTimeout(() => {
        setErrorMessageHeader('Failed to share');
        setErrorMessage(
          'There was some error while sharing the Recovery Key, please try again',
        );
      }, 2);
      (ErrorBottomSheet as any).current.snapTo(1);
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

    if (
      !trustedContacts.tc.trustedContacts[contactName] &&
      !trustedContacts.tc.trustedContacts[contactName].ephemeralChannel
    ) {
      console.log(
        'Err: Contact/Ephemeral Channel does not exists for contact: ',
        contactName,
      );
      return;
    }

    const publicKey = trustedContacts.tc.trustedContacts[contactName].publicKey;
    const requester = WALLET_SETUP.walletName;
    const appVersion = DeviceInfo.getVersion();
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
        `https://hexawallet.io/${config.APP_STAGE}/tcg` +
        `/${requester}` +
        `/${numberEncPubKey}` +
        `/${numHintType}` +
        `/${numHint}` +
        `/${trustedContacts.tc.trustedContacts[contactName].ephemeralChannel.initiatedAt}` +
        `/v${appVersion}`;
      console.log({ numberDL });
      setTrustedLink(numberDL);
    } else if (Contact.emails && Contact.emails.length) {
      const email = Contact.emails[0].email;
      const emailHintType = 'eml';
      const trucatedEmail = email.replace('.com', '');
      const emailHint =
        email[0] + trucatedEmail.slice(trucatedEmail.length - 2);
      const emailEncPubKey = TrustedContactsService.encryptPub(publicKey, email)
        .encryptedPub;
      const emailDL =
        `https://hexawallet.io/${config.APP_STAGE}/tcg` +
        `/${requester}` +
        `/${emailEncPubKey}` +
        `/${emailHintType}` +
        `/${emailHint}` +
        `/${trustedContacts.tc.trustedContacts[contactName].ephemeralChannel.initiatedAt}` +
        `/v${appVersion}`;
      console.log({ emailDL });
      setTrustedLink(emailDL);
    } else {
      Alert.alert(
        'Invalid Contact',
        'Cannot add a contact without phone-num/email as a entity',
      );
    }
  }, [
    Contact,
    trustedContacts,
    SHARES_TRANSFER_DETAILS[index],
    uploadMetaShare,
    updateEphemeralChannelLoader,
  ]);

  useEffect(() => {
    if (Contact.firstName && SHARES_TRANSFER_DETAILS[index]) {
      const contactName = `${Contact.firstName} ${
        Contact.lastName ? Contact.lastName : ''
      }`
        .toLowerCase()
        .trim();
      console.log({ contactName });

      if (contactName === 'secondary device') return;

      if (!trustedContacts.tc.trustedContacts[contactName]) return;

      createDeepLink();
      const publicKey =
        trustedContacts.tc.trustedContacts[contactName].publicKey;
      setTrustedQR(
        JSON.stringify({
          isGuardian: true,
          requester: WALLET_SETUP.walletName,
          publicKey,
          uploadedAt:
            trustedContacts.tc.trustedContacts[contactName].ephemeralChannel
              .initiatedAt,
          type: 'trustedGuardian',
          ver: DeviceInfo.getVersion(),
        }),
      );
    }
  }, [
    SHARES_TRANSFER_DETAILS[index],
    Contact,
    trustedContacts,
    uploadMetaShare,
    updateEphemeralChannelLoader,
  ]);

  const SendShareModalFunction = useCallback(() => {
    //console.log("Contact", Contact);
    if (!isEmpty(Contact)) {
      return (
        <SendShareModal
          contact={Contact ? Contact : null}
          textHeader={'Sharing Key with'}
          onPressViaQr={() => {
            createGuardian();
            if (SendViaQRBottomSheet.current)
              (SendViaQRBottomSheet as any).current.snapTo(1);
            (shareBottomSheet as any).current.snapTo(0);
          }}
          onPressViaLink={() => {
            createGuardian();
            if (SendViaLinkBottomSheet.current)
              (SendViaLinkBottomSheet as any).current.snapTo(1);
            (shareBottomSheet as any).current.snapTo(0);
          }}
        />
      );
    }
  }, [Contact]);

  const SendModalFunction = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (shareBottomSheet as any).current.snapTo(0);
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
            {Contact.hasTrustedChannel &&
            !Contact.hasXpub ? null : Contact.contactName ===
                'Secondary Device' && !Contact.hasXpub ? null : (
              <TouchableOpacity
                disabled={isSendDisabled}
                onPress={() => {
                  setIsSendDisabled(true);
                  Contact.hasXpub
                    ? onPressSend()
                    : Contact.contactName != 'Secondary Device'
                    ? onPressResendRequest()
                    : null;
                }}
                style={{
                  height: wp('6%'),
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: Colors.lightBlue,
                  marginLeft: 'auto',
                  marginBottom: 10,
                  borderRadius: 4,
                  flexDirection: 'row',
                  alignSelf: 'flex-end',
                  paddingLeft: wp('1.5%'),
                  paddingRight: wp('1.5%'),
                }}
              >
                {Contact.hasXpub && (
                  <Image
                    source={require('../../assets/images/icons/icon_bitcoin_light.png')}
                    style={{
                      height: wp('4%'),
                      width: wp('4%'),
                      resizeMode: 'contain',
                    }}
                  />
                )}
                <Text
                  style={{
                    color: Colors.white,
                    fontFamily: Fonts.FiraSansMedium,
                    fontSize: RFValue(10),
                    marginLeft: 2,
                  }}
                >
                  {Contact.hasXpub
                    ? 'Send'
                    : index < 3
                    ? 'Reshare'
                    : 'Resend Request'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {Loading ? (
          <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
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
            <BottomInfoBox
              backgroundColor={Colors.white}
              title={'Note'}
              infoText={'The details of your friend and Family will come here.'}
            />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
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
                      {/* <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansRegular,
                          marginTop: 5,
                        }}
                      >
                        {value.info}
                      </Text> */}
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
                      {/* <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(8),
                          fontFamily: Fonts.FiraSansRegular,
                          marginTop: 5,
                        }}
                      >
                        {value.info}
                      </Text> */}
                    </TouchableOpacity>
                  );
                }
              })}
            </ScrollView>
            {sortedHistory(trustedContactHistory).length <= 1 && (
              <BottomInfoBox
                backgroundColor={Colors.white}
                title={'Note'}
                infoText={
                  'The details of your friend and Family will come here.'
                }
              />
            )}
          </View>
        )}
        {contactsType == "I'm Keeper of" && (
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
              disabled={!Contact.isWard}
              style={{
                ...styles.bottomButton,
                opacity: Contact.isWard ? 1 : 0.5,
              }}
              onPress={onHelpRestore}
            >
              <Image
                source={require('../../assets/images/icons/icon_restore.png')}
                style={styles.buttonImage}
              />
              <View>
                {uploading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.buttonText}>Help Restore</Text>
                )}
                {/* <Text numberOfLines={1} style={styles.buttonInfo}>
                  Lorem ipsum dolor
                </Text> */}
              </View>
            </TouchableOpacity>
            {encryptedExitKey ? (
              <TouchableOpacity
                style={{
                  ...styles.bottomButton,
                  opacity: encryptedExitKey ? 1 : 0.5,
                }}
                disabled={encryptedExitKey ? false : true}
                onPress={() => {
                  if (encryptedExitKey) {
                    (ExitKeyQRBottomSheet as any).current.snapTo(1);
                  }
                }}
              >
                <Image
                  source={require('../../assets/images/icons/icon_request.png')}
                  style={styles.buttonImage}
                />
                <View>
                  <Text style={styles.buttonText}>
                    {encryptedExitKey ? 'Show Secondary Key' : 'Request Key'}
                  </Text>
                  {encryptedExitKey ? (
                    <Text numberOfLines={1} style={styles.buttonInfo}>
                      {'Help restore PDF'}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        <TouchableOpacity
          style={{
            ...styles.bottomButton,
          }}
          onPress={() => {
            dispatch(removeTrustedContact(contact.contactName));
            props.navigation.goBack();
          }}
        >
          <View>
            <Text style={styles.buttonText}>Remove</Text>
          </View>
        </TouchableOpacity>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendViaLinkBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('83%') : hp('85%'),
        ]}
        renderContent={renderSendViaLinkContents}
        renderHeader={renderSendViaLinkHeader}
      />
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
        ref={ExitKeyQRBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('83%') : hp('85%'),
        ]}
        renderContent={renderExitKeyQRContents}
        renderHeader={renderExitKeyQRHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ReshareBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderReshareContent}
        renderHeader={renderReshareHeader}
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
      <BottomSheet
        enabledInnerScrolling={true}
        ref={shareBottomSheet as any}
        snapPoints={[
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 0 : 0,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('50%') : hp('65%'),
        ]}
        renderContent={SendShareModalFunction}
        renderHeader={SendModalFunction}
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
