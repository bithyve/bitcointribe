import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  AsyncStorage,
  Alert,
  Keyboard,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from './Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getIconByStatus } from './utils';
import { useSelector } from 'react-redux';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RFValue } from 'react-native-responsive-fontsize';
import ErrorModalContents from '../../components/ErrorModalContents';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../../components/ModalHeader';
import HistoryPageComponent from '../../components/HistoryPageComponent';
import TrustedContacts from './TrustedContacts';
import CommunicationMode from './CommunicationMode';
import ShareOtpWithTrustedContact from './ShareOtpWithTrustedContact';
import moment from 'moment';
import _ from 'underscore';
import TrustedContactQr from './TrustedContactQr';
import { nameToInitials } from '../../common/CommonFunctions';
import { textWithoutEncoding, email } from 'react-native-communications';
import {
  uploadEncMShare,
  checkMSharesHealth,
  ErrorSending,
} from '../../store/actions/sss';
import { useDispatch } from 'react-redux';
import SendShareModal from './SendShareModal';
import TransparentHeaderModal from '../../components/TransparentHeaderModal';
import SendViaLink from '../../components/SendViaLink';
import SendViaQR from '../../components/SendViaQR';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import { EphemeralData } from '../../bitcoin/utilities/Interface';
import config from '../../bitcoin/HexaConfig';
import Toast from '../../components/Toast';
import KnowMoreButton from '../../components/KnowMoreButton';
import { updateEphemeralChannel, updateTrustedContactInfoLocally } from '../../store/actions/trustedContacts';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import FriendsAndFamilyHelpContents from '../../components/Helper/FriendsAndFamilyHelpContents';
import idx from 'idx';

const TrustedContactHistory = (props) => {
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [HelpBottomSheet, setHelpBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const isErrorSendingFailed = useSelector((state) => state.sss.errorSending);

  const dispatch = useDispatch();
  const [selectedContactMode, setSelectedContactMode] = useState(null);
  const [ChangeBottomSheet, setChangeBottomSheet] = useState(React.createRef());
  const [changeContact, setChangeContact] = useState(false);
  const [ReshareBottomSheet, setReshareBottomSheet] = useState(
    React.createRef(),
  );
  const [ConfirmBottomSheet, setConfirmBottomSheet] = useState(
    React.createRef(),
  );
  const [OTP, setOTP] = useState('');
  const [renderTimer, setRenderTimer] = useState(false);
  const [chosenContactIndex, setChosenContactIndex] = useState(1);
  const [chosenContact, setChosenContact] = useState(Object);
  const [trustedContactsBottomSheet, setTrustedContactsBottomSheet] = useState(
    React.createRef(),
  );
  const [SendViaLinkBottomSheet, setSendViaLinkBottomSheet] = useState(
    React.createRef(),
  );

  const [SendViaQRBottomSheet, setSendViaQRBottomSheet] = useState(
    React.createRef(),
  );
  const [shareBottomSheet, setshareBottomSheet] = useState(React.createRef());
  const [
    shareOtpWithTrustedContactBottomSheet,
    setShareOtpWithTrustedContactBottomSheet,
  ] = useState(React.createRef());
  const [
    CommunicationModeBottomSheet,
    setCommunicationModeBottomSheet,
  ] = useState(React.createRef());
  const [LoadContacts, setLoadContacts] = useState(false);
  let [SelectedContacts, setSelectedContacts] = useState([]);
  // const [isSecretShared1, setIsSecretShared1] = useState(false);
  // const [isSecretShared2, setIsSecretShared2] = useState(false);
  // const [
  //   trustedContactQrBottomSheet,
  //   setTrustedContactQrBottomSheet,
  // ] = useState(React.createRef());
  // const [Temp, setTemp] = useState(false);
  //   const [autoHighlightFlags, setAutoHighlightFlags] = useState({
  //     secondaryDevice: false,
  //     trustedContact1: false,
  //     trustedContact2: false,
  //     personalCopy1: false,
  //     personalCopy2: false,
  //     securityAns: false,
  //   });
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

  const trustedContacts: TrustedContactsService = useSelector(
    (state) => state.trustedContacts.service,
  );

  const [trustedLink, setTrustedLink] = useState('');
  const [trustedQR, setTrustedQR] = useState('');

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
  ]);

  const overallHealth = useSelector((state) => state.sss.overallHealth);
  const [shared, setShared] = useState(false);
  const [activateReshare, setActivateReshare] = useState(
    props.navigation.getParam('activateReshare'),
  );
  const next = props.navigation.getParam('next');
  const selectedTitle = props.navigation.getParam('selectedTitle');
  const index = selectedTitle == 'Trusted Contact 1' ? 1 : 2;
  const updateAutoHighlightFlags = props.navigation.getParam(
    'updateAutoHighlightFlags',
  );
  function isEmpty(obj) {
    return Object.keys(obj).every((k) => !Object.keys(obj[k]).length);
  }
  useEffect(() => {
    (async () => {
      let selectedContactModeTemp = await AsyncStorage.getItem(
        'selectedContactMode',
      );
      setSelectedContactMode(JSON.parse(selectedContactModeTemp));
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem('shareHistory'),
      );
      //console.log("test",{ shareHistory });
      if (shareHistory) updateHistory(shareHistory);
    })();
    setContactInfo();
  }, []);

  const setContactInfo = useCallback(async () => {
    let trustedContactsInfo: any = useSelector(state => idx(state, _ => _.trustedContacts.trustedContactInfo))
    if (trustedContactsInfo) {
      const selectedContacts = trustedContactsInfo.slice(1, 3);
      setSelectedContacts(selectedContacts);

      if (selectedTitle == 'Trusted Contact 1' && selectedContacts[0]) {
        setChosenContact(selectedContacts[0]);
      } else if (selectedTitle == 'Trusted Contact 2' && selectedContacts[1]) {
        setChosenContact(selectedContacts[1]);
      }
    }

    // let SelectedContactsTemp = JSON.parse(
    //   await AsyncStorage.getItem('SelectedContacts'),
    // );
    // if (SelectedContactsTemp) {
    //   setSelectedContacts(SelectedContactsTemp);
    //   if (selectedTitle == 'Trusted Contact 1' && SelectedContactsTemp[0]) {
    //     setChosenContact(SelectedContactsTemp[0]);
    //   } else if (
    //     selectedTitle == 'Trusted Contact 2' &&
    //     SelectedContactsTemp[1]
    //   ) {
    //     setChosenContact(SelectedContactsTemp[1]);
    //   }
    // }
  }, [selectedTitle]);

  const getContacts = useCallback(
    async (selectedContacts, index) => {
      let contactList = SelectedContacts;
      if (!contactList) {
        contactList = [];
      }
      if (index == 1) {
        contactList[0] = selectedContacts[0];
      }
      if (index == 2) {
        contactList[1] = selectedContacts[0];
      }
      setTimeout(() => {
        setChosenContact(selectedContacts[0]);
      }, 2);
      (trustedContactsBottomSheet as any).current.snapTo(0);
      //(CommunicationModeBottomSheet as any).current.snapTo(1);
      (shareBottomSheet as any).current.snapTo(1);
    },
    [SelectedContacts, chosenContact],
  );

  const isTrustedContact = useCallback(
    (selectedContact) => {
      const contactName = `${selectedContact.firstName} ${
        selectedContact.lastName ? selectedContact.lastName : ''
        }`
        .toLowerCase()
        .trim();

      const trustedContact = trustedContacts.tc.trustedContacts[contactName];
      if (trustedContact && trustedContact.symmetricKey) {
        // Trusted channel exists
        return true;
      }
      return false;
    },
    [trustedContacts],
  );

  const renderTrustedContactsContent = useCallback(() => {
    return (
      <TrustedContacts
        LoadContacts={LoadContacts}
        onPressBack={() => {
          (trustedContactsBottomSheet as any).current.snapTo(0);
        }}
        onPressContinue={async (selectedContacts, index) => {
          Keyboard.dismiss();
          const isTrustedC = await isTrustedContact(selectedContacts[0]);
          if (isTrustedC) {
            Toast('Trusted Contact already exists');
          } else {
            getContacts(selectedContacts, index);
          }
        }}
        index={index}
      />
    );
  }, [LoadContacts, getContacts]);

  const renderTrustedContactsHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (trustedContactsBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  // const renderCommunicationModeModalContent = useCallback(() => {
  //   return (
  //     <CommunicationMode
  //       onContactUpdate={(contact) => {
  //         setTimeout(() => {
  //           setChosenContact(contact);
  //           setTemp(!Temp);
  //         }, 2);
  //       }}
  //       contact={chosenContact ? chosenContact : null}
  //       index={index}
  //       changeContact={changeContact}
  //       onPressBack={() => {
  //         (CommunicationModeBottomSheet as any).current.snapTo(0);
  //       }}
  //       onPressContinue={async (OTP, index, selectedContactMode, contact) => {
  //         let selectedContactModeTemp = JSON.parse(
  //           await AsyncStorage.getItem('selectedContactMode'),
  //         );
  //         if (!selectedContactModeTemp) {
  //           selectedContactModeTemp = [];
  //         }
  //         if (index == 1) {
  //           selectedContactModeTemp[0] = selectedContactMode;
  //         }
  //         if (index == 2) {
  //           selectedContactModeTemp[1] = selectedContactMode;
  //         }
  //         await AsyncStorage.setItem(
  //           'selectedContactMode',
  //           JSON.stringify(selectedContactModeTemp),
  //         );
  //         setSelectedContactMode(selectedContactModeTemp);
  //         if (selectedContactMode.type == 'qrcode') {
  //           setContactForTrustedQR(contact);
  //           (trustedContactQrBottomSheet as any).current.snapTo(1);
  //           (CommunicationModeBottomSheet as any).current.snapTo(0);
  //         } else {
  //           // setTimeout(() => {
  //           //   setRenderTimer(true);
  //           //   setOTP(OTP);
  //           //   setChosenContactIndex(index);
  //           // }, 10);
  //           setChosenContactIndex(index);
  //           onOTPShare(index); // enables reshare
  //           (CommunicationModeBottomSheet as any).current.snapTo(0);
  //           // (shareOtpWithTrustedContactBottomSheet as any).current.snapTo(1);
  //         }
  //       }}
  //     />
  //   );
  // }, [chosenContact, index, selectedContactMode]);

  // const renderCommunicationModeModalHeader = useCallback(() => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         (CommunicationModeBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, []);

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
      setTrustedContactHistory(updatedTrustedContactHistory);
    },
    [trustedContactHistory],
  );

  const saveInTransitHistory = useCallback(async () => {
    const shareHistory = JSON.parse(await AsyncStorage.getItem('shareHistory'));
    if (shareHistory) {
      const updatedShareHistory = [...shareHistory];
      updatedShareHistory[index] = {
        ...updatedShareHistory[index],
        inTransit: Date.now(),
      };
      updateHistory(updatedShareHistory);
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify(updatedShareHistory),
      );
    }
  }, [updateHistory]);

  const onOTPShare = useCallback(
    async (index) => {
      // (shareOtpWithTrustedContactBottomSheet as any).current.snapTo(0);
      // (trustedContactQrBottomSheet.current as any).snapTo(0); // closes either of them based on which was on.

      // let selectedContactList = JSON.parse(
      //   await AsyncStorage.getItem('SelectedContacts'),
      // );
      // if (!selectedContactList) {
      //   selectedContactList = [];
      // }
      // if (index == 2) {
      //   selectedContactList[1] = chosenContact;
      // } else if (index == 1) {
      //   selectedContactList[0] = chosenContact;
      // }
      // await AsyncStorage.setItem(
      //   'SelectedContacts',
      //   JSON.stringify(selectedContactList),
      // );

      updateAutoHighlightFlags();
      saveInTransitHistory();
      setActivateReshare(true);
      // dispatch(checkMSharesHealth());
    },
    [updateAutoHighlightFlags, saveInTransitHistory, chosenContact],
  );

  const renderShareOtpWithTrustedContactContent = useCallback(() => {
    return (
      <ShareOtpWithTrustedContact
        renderTimer={renderTimer}
        onPressOk={(index) => {
          setRenderTimer(false);
          onOTPShare(index);
          if (next) {
            props.navigation.goBack();
          }
        }}
        onPressBack={() => {
          (shareOtpWithTrustedContactBottomSheet as any).current.snapTo(0);
        }}
        OTP={OTP}
        index={chosenContactIndex}
      />
    );
  }, [onOTPShare, OTP, chosenContactIndex, renderTimer, selectedContactMode]);

  const renderShareOtpWithTrustedContactHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (shareOtpWithTrustedContactBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderConfirmContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ConfirmBottomSheet}
        title={'Confirm Recovery Key\nwith Keeper'}
        note={
          'Your Recovery Keys with contacts get confirmed automatically when the contact opens their app.\nSimply remind them to open their Hexa app and login to confirm your Recovery Key'
        }
        proceedButtonText={'Ok, got it'}
        onPressProceed={() => {
          //communicate();
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  }, [selectedContactMode]);

  const renderConfirmHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [selectedContactMode]);

  const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/errorImage.png')}
      />
    );
  }, []);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  if (isErrorSendingFailed) {
    setTimeout(() => {
      setErrorMessageHeader('Error sending Recovery Key');
      setErrorMessage(
        'There was an error while sending your Recovery Key, please try again in a little while',
      );
    }, 2);
    (ErrorBottomSheet as any).current.snapTo(1);
    dispatch(ErrorSending(null));
  }

  // const communicate = async () => {
  //   let selectedContactModeTmp =
  //     index == 1 ? selectedContactMode[0] : selectedContactMode[1];
  //   if (!SHARES_TRANSFER_DETAILS[index]) {
  //     setTimeout(() => {
  //       setErrorMessageHeader('Failed to share');
  //       setErrorMessage(
  //         'There was some error while sharing the Recovery Secret, please try again',
  //       );
  //     }, 2);
  //     (ErrorBottomSheet as any).current.snapTo(1);
  //     //Alert.alert('Failed to share');
  //     return;
  //   }
  //   const deepLink =
  //     `https://hexawallet.io/app/${WALLET_SETUP.walletName}/sss/ek/` +
  //     SHARES_TRANSFER_DETAILS[index].ENCRYPTED_KEY;

  //   switch (selectedContactModeTmp.type) {
  //     case 'number':
  //       textWithoutEncoding(selectedContactModeTmp.info, deepLink);
  //       break;

  //     case 'email':
  //       email(
  //         [selectedContactModeTmp.info],
  //         null,
  //         null,
  //         'Guardian request',
  //         deepLink,
  //       );
  //       break;
  //     case 'qrcode':
  //       (trustedContactQrBottomSheet as any).current.snapTo(1);
  //       break;
  //   }
  //   if (selectedContactModeTmp.type != 'qrcode') {
  //     let otpTemp = SHARES_TRANSFER_DETAILS[index].OTP
  //       ? SHARES_TRANSFER_DETAILS[index].OTP
  //       : null;
  //     setTimeout(() => {
  //       setRenderTimer(true);
  //       setOTP(otpTemp);
  //       setChosenContactIndex(index);
  //     }, 10);
  //     (shareOtpWithTrustedContactBottomSheet as any).current.snapTo(1);
  //   }
  // };

  // useEffect(() => {
  //   if (
  //     !SHARES_TRANSFER_DETAILS[index] ||
  //     Date.now() - SHARES_TRANSFER_DETAILS[index].UPLOADED_AT >   config.TC_REQUEST_EXPIRY;
  //   )
  //     dispatch(uploadEncMShare(index));
  //   else {
  //     //  Alert.alert('OTP', SHARES_TRANSFER_DETAILS[index].OTP);
  //     //console.log(SHARES_TRANSFER_DETAILS[index]);
  //   }
  // }, [SHARES_TRANSFER_DETAILS[index]]);

  const onPressReshare = useCallback(async () => {
    // let selectedContactList = JSON.parse(
    //   await AsyncStorage.getItem('SelectedContacts'),
    // );
    //console.log({ selectedContactList });
    //console.log({ chosenContact });
    // if (selectedTitle == 'Trusted Contact 1') {
    //   setChosenContact(selectedContactList[0]);
    // } else if (selectedTitle == 'Trusted Contact 2') {
    //   setChosenContact(selectedContactList[1]);
    // }
    // (CommunicationModeBottomSheet as any).current.snapTo(1);
    (shareBottomSheet as any).current.snapTo(1);
    (ReshareBottomSheet as any).current.snapTo(0);
  }, [selectedTitle, chosenContact]);

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
          onPressReshare();
        }}
        onPressIgnore={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  }, [onPressReshare]);

  const renderReshareHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderChangeContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ChangeBottomSheet}
        title={'Change your\nKeeper'}
        info={'Having problems with your Keeper'}
        note={
          'You can change the Keeper you selected to send your Recovery Key'
        }
        proceedButtonText={'Change'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          setTimeout(() => {
            setLoadContacts(true);
            setChangeContact(true);
          }, 2);

          (trustedContactsBottomSheet as any).current.snapTo(1);
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  }, []);

  const renderChangeHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  // const renderTrustedContactQrContents = useCallback(() => {
  //   const index = selectedTitle == 'Trusted Contact 1' ? 1 : 2;
  //   if (!contactForTrustedQR) return;

  //   return (
  //     <TrustedContactQr
  //       index={index}
  //       contact={contactForTrustedQR}
  //       onPressOk={() => {
  //         onOTPShare(index);
  //       }}
  //       onPressBack={() => {
  //         onOTPShare(index);
  //         (trustedContactQrBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, [selectedTitle, contactForTrustedQR]);

  // const renderTrustedContactQrHeader = useCallback(() => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         (trustedContactQrBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, []);

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

  useEffect(() => {
    if (overallHealth) {
      if (overallHealth.sharesInfo[index].updatedAt) {
        setShared(true);
      }
    }
  }, [overallHealth]);

  useEffect(() => {
    if (next) {
      setLoadContacts(true);
      (trustedContactsBottomSheet as any).current.snapTo(1);
    }
  }, [next]);

  const getImageIcon = () => {
    if (chosenContact.name) {
      if (chosenContact.imageAvailable) {
        return (
          <Image
            source={chosenContact.image}
            style={{
              width: wp('9%'),
              height: wp('9%'),
              resizeMode: 'contain',
              alignSelf: 'center',
              marginRight: 8,
              borderRadius: wp('9%') / 2,
            }}
          />
        );
      } else {
        return (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.shadowBlue,
              width: wp('10%'),
              height: wp('10%'),
              alignSelf: 'center',
              marginRight: 8,
              borderRadius: wp('10%') / 2,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 13,
                lineHeight: 13, //... One for top and one for bottom alignment
              }}
            >
              {chosenContact && chosenContact.name
                ? nameToInitials(
                  chosenContact.firstName && chosenContact.lastName
                    ? chosenContact.firstName + ' ' + chosenContact.lastName
                    : chosenContact.firstName && !chosenContact.lastName
                      ? chosenContact.firstName
                      : !chosenContact.firstName && chosenContact.lastName
                        ? chosenContact.lastName
                        : '',
                )
                : ''}
            </Text>
          </View>
        );
      }
    }
    return (
      <Image
        style={{
          width: wp('9%'),
          height: wp('9%'),
          resizeMode: 'contain',
          alignSelf: 'center',
          marginRight: 8,
        }}
        source={require('../../assets/images/icons/icon_user.png')}
      />
    );
  };

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

    if (!chosenContact) {
      console.log('Err: Contact missing');
      return;
    }

    const contactName = `${chosenContact.firstName} ${
      chosenContact.lastName ? chosenContact.lastName : ''
      }`
      .toLowerCase()
      .trim();

    if (
      !trustedContacts.tc.trustedContacts[contactName] &&
      !trustedContacts.tc.trustedContacts[contactName].ephemeralChannel
    ) {
      console.log(
        'Err: Trusted Contact/Ephemeral Channel does not exists for contact: ',
        contactName,
      );
      return;
    }

    const publicKey = trustedContacts.tc.trustedContacts[contactName].publicKey;
    const requester = WALLET_SETUP.walletName;
    const appVersion = DeviceInfo.getVersion();
    if (chosenContact.phoneNumbers && chosenContact.phoneNumbers.length) {
      const phoneNumber = chosenContact.phoneNumbers[0].number;
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
      setActivateReshare(true);
    } else if (chosenContact.emails && chosenContact.emails.length) {
      const email = chosenContact.emails[0].email;
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
      setActivateReshare(true);
    } else {
      Alert.alert(
        'Invalid Contact',
        'Cannot add a contact without phone-num/email as a trusted entity',
      );
    }
  }, [
    chosenContact,
    trustedContacts,
    SHARES_TRANSFER_DETAILS[index],
    uploadMetaShare,
    updateEphemeralChannelLoader,
  ]);

  const updateTrustedContactsInfo = useCallback(
    async (contact) => {
      let { trustedContactsInfo } = useSelector((state) => state.trustedContacts.trustedContacts)
      if (trustedContactsInfo) {
        if (trustedContactsInfo[index]) {
          let found = false;
          for (let i = 3; i < trustedContactsInfo.length; i++) {
            // push if not present in TC list
            if (
              trustedContactsInfo[i] &&
              trustedContactsInfo[i].name == trustedContactsInfo[index].name
            ) {
              found = true;
              break;
            }
          }

          if (!found) trustedContactsInfo.push(trustedContactsInfo[index]);
        }

        for (let i = 0; i < trustedContactsInfo.length; i++) {
          if (
            trustedContactsInfo[i] &&
            trustedContactsInfo[i].name == contact.name
          ) {
            trustedContactsInfo.splice(i, 1);
            break;
          }
        }
        trustedContactsInfo[index] = contact;
      } else {
        trustedContactsInfo = [];
        trustedContactsInfo[0] = null; // securing initial 3 positions for Guardians
        trustedContactsInfo[1] = null;
        trustedContactsInfo[2] = null;
        trustedContactsInfo[index] = contact;
      }
      dispatch(updateTrustedContactInfoLocally(trustedContactsInfo))
      await AsyncStorage.setItem(
        'TrustedContactsInfo',
        JSON.stringify(trustedContactsInfo),
      );
    },
    [index],
  );

  const createGuardian = useCallback(async () => {
    if (!Object.keys(chosenContact).length) return;
    if (
      chosenContact.firstName &&
      ((chosenContact.phoneNumbers && chosenContact.phoneNumbers.length) ||
        (chosenContact.emails && chosenContact.emails.length))
    ) {
      const walletID = await AsyncStorage.getItem('walletID');
      const FCM = await AsyncStorage.getItem('fcmToken');
      console.log({ walletID, FCM });

      const contactName = `${chosenContact.firstName} ${
        chosenContact.lastName ? chosenContact.lastName : ''
        }`
        .toLowerCase()
        .trim();
      let data: EphemeralData = {
        walletID,
        FCM,
      };
      const trustedContact = trustedContacts.tc.trustedContacts[contactName];

      if (changeContact && !trustedContacts.tc.trustedContacts[contactName]) {
        // !trustedContacts.tc.trustedContacts[contactName] ensures that TC actually changed
        setTrustedLink('');
        setTrustedQR('');
        // remove the previous TC
        let { trustedContactsInfo } = useSelector((state) => state.trustedContacts.trustedContacts)
        let previousGuardianName;
        if (trustedContactsInfo) {
          trustedContactsInfo = JSON.parse(trustedContactsInfo);
          const previousGuardian = trustedContactsInfo[index];
          if (previousGuardian) {
            previousGuardianName = `${previousGuardian.firstName} ${
              previousGuardian.lastName ? previousGuardian.lastName : ''
              }`
              .toLowerCase()
              .trim();
          } else {
            console.log('Previous guardian details missing');
          }
        }

        dispatch(
          uploadEncMShare(index, contactName, data, true, previousGuardianName),
        );
        updateTrustedContactsInfo(chosenContact);
        onOTPShare(index); // enables reshare
        setChangeContact(false);
      } else if (
        !SHARES_TRANSFER_DETAILS[index] ||
        Date.now() - SHARES_TRANSFER_DETAILS[index].UPLOADED_AT >
        config.TC_REQUEST_EXPIRY
      ) {
        setTrustedLink('');
        setTrustedQR('');
        dispatch(uploadEncMShare(index, contactName, data));
        updateTrustedContactsInfo(chosenContact);
        onOTPShare(index); // enables reshare
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
            contactName,
            trustedContact.ephemeralChannel.data[0],
          ),
        );
      }
    } else {
      console.log({ chosenContact });
      Alert.alert(
        'Invalid Contact',
        'Cannot add a contact without phone-num/email as a trusted entity',
      );
    }
  }, [SHARES_TRANSFER_DETAILS[index], chosenContact, changeContact]);

  useEffect(() => {
    if (chosenContact.firstName && SHARES_TRANSFER_DETAILS[index]) {
      const contactName = `${chosenContact.firstName} ${
        chosenContact.lastName ? chosenContact.lastName : ''
        }`
        .toLowerCase()
        .trim();
      console.log({ contactName });
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
    chosenContact,
    trustedContacts,
    uploadMetaShare,
    updateEphemeralChannelLoader,
  ]);

  const SendShareModalFunction = useCallback(() => {
    //console.log("chosenContact", chosenContact);
    if (!isEmpty(chosenContact)) {
      return (
        <SendShareModal
          contact={chosenContact ? chosenContact : null}
          index={index}
          textHeader={'Sharing Recovery Key with'}
          onPressViaQr={(index) => {
            createGuardian();
            if (SendViaQRBottomSheet.current)
              (SendViaQRBottomSheet as any).current.snapTo(1);
            // setChosenContactIndex(index);
          }}
          onPressViaLink={(index) => {
            createGuardian();
            if (SendViaLinkBottomSheet.current)
              (SendViaLinkBottomSheet as any).current.snapTo(1);
            // setChosenContactIndex(index);
          }}
        />
      );
    }
  }, [chosenContact, index]);

  const SendModalFunction = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (shareBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderSendViaLinkContents = useCallback(() => {
    if (!isEmpty(chosenContact)) {
      return (
        <SendViaLink
          headerText={"Send Request"}
          subHeaderText={'Send a Keeper request link'}
          contactText={'Adding as a Keeper:'}
          contact={chosenContact ? chosenContact : null}
          contactEmail={''}
          infoText={`Click here to accept Keeper request for ${
            WALLET_SETUP.walletName
          } Hexa wallet- link will expire in ${
            config.TC_REQUEST_EXPIRY / 60000
          } minutes`}
          link={trustedLink}
          onPressBack={() => {
            if (SendViaLinkBottomSheet.current)
              (SendViaLinkBottomSheet as any).current.snapTo(0);
          }}
          onPressDone={() => {
            (SendViaLinkBottomSheet as any).current.snapTo(0);
          }}
        />
      );
    }
  }, [chosenContact, trustedLink]);

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
    if (!isEmpty(chosenContact)) {
      return (
        <SendViaQR
          contactText={'Adding to Friends and Family:'}
          contact={chosenContact ? chosenContact : null}
          noteHeader={'Scan QR'}
          noteText={
            'On scanning, you will be adding the contact as your Keeper'
          }
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
    }
  }, [chosenContact, trustedQR]);

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

  const renderHelpHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if (HelpBottomSheet.current)
            (HelpBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderHelpContent = () => {
    return (
      <FriendsAndFamilyHelpContents />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
      <SafeAreaView
        style={{ flex: 0, backgroundColor: Colors.backgroundColor }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View
        style={{
          ...styles.modalHeaderTitleView,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              // marginLeft: 10,
              marginRight: 10,
            }}
          >
            {getImageIcon()}
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={BackupStyles.modalHeaderTitleText}>
                {chosenContact.firstName && chosenContact.lastName
                  ? chosenContact.firstName + ' ' + chosenContact.lastName
                  : chosenContact.firstName && !chosenContact.lastName
                    ? chosenContact.firstName
                    : !chosenContact.firstName && chosenContact.lastName
                      ? chosenContact.lastName
                      : 'Friends and Family'}
              </Text>
              <Text style={BackupStyles.modalHeaderInfoText}>
                Last backup{' '}
                <Text
                  style={{
                    fontFamily: Fonts.FiraSansMediumItalic,
                    fontWeight: 'bold',
                  }}
                >
                  {' '}
                  {props.navigation.state.params.selectedTime}
                </Text>
              </Text>
            </View>
            <KnowMoreButton
              onpress={() => {
                (HelpBottomSheet as any).current.snapTo(1);
              }}
              containerStyle={{
                marginTop: 'auto',
                marginBottom: 'auto',
                marginRight: 10,
              }}
              textStyle={{}}
            />
            <Image
              style={{
                width: shared || activateReshare ? 14 : 17,
                height: shared || activateReshare ? 16 : 17,
                resizeMode: 'contain',
                marginLeft: 'auto',
                alignSelf: 'center',
              }}
              source={
                shared || activateReshare
                  ? getIconByStatus(
                    props.navigation.state.params.selectedStatus,
                  )
                  : require('../../assets/images/icons/icon_error_gray.png')
              }
            />
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <HistoryPageComponent
          //   IsReshare={
          //     (autoHighlightFlags.trustedContact1 &&
          //       props.navigation.state.params.selectedTitle ==
          //         'Trusted Contact 1') ||
          //     (autoHighlightFlags.trustedContact2 &&
          //       props.navigation.state.params.selectedTitle ==
          //         'Trusted Contact 2')
          //       ? true
          //       : false
          //   }
          type={'contact'}
          IsReshare={shared || activateReshare}
          onPressContinue={() => {
            setTimeout(() => {
              setLoadContacts(true);
            }, 2);
            (trustedContactsBottomSheet as any).current.snapTo(1);
          }}
          data={sortedHistory(trustedContactHistory)}
          reshareInfo={
            shared || activateReshare
              ? 'Want to send the Recovery Key again to the same destination? '
              : null
          }
          changeInfo={
            shared || activateReshare
              ? 'Want to send the Recovery Key to another contact? '
              : null
          }
          onPressChange={() => {
            (ChangeBottomSheet as any).current.snapTo(1);
          }}
          onPressConfirm={() => {
            (ConfirmBottomSheet as any).current.snapTo(1);
          }}
          onPressReshare={() => {
            (ReshareBottomSheet as any).current.snapTo(1);
          }}
        />
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={trustedContactsBottomSheet as any}
        snapPoints={[-30, hp('85%')]}
        renderContent={renderTrustedContactsContent}
        renderHeader={renderTrustedContactsHeader}
      />
      {/* <BottomSheet
        enabledInnerScrolling={true}
        ref={CommunicationModeBottomSheet as any}
        snapPoints={[-30, hp('75%')]}
        renderContent={renderCommunicationModeModalContent}
        renderHeader={renderCommunicationModeModalHeader}
      /> */}
      <BottomSheet
        onCloseEnd={() => {
          if (Object.keys(chosenContact).length > 0) {
            setRenderTimer(false);
            // onOTPShare(index); commented: causing intransit history to re-iterate
          }
        }}
        enabledInnerScrolling={true}
        ref={shareOtpWithTrustedContactBottomSheet as any}
        snapPoints={[-30, hp('70%')]}
        renderContent={renderShareOtpWithTrustedContactContent}
        renderHeader={renderShareOtpWithTrustedContactHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ChangeBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderChangeContent}
        renderHeader={renderChangeHeader}
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
        ref={ConfirmBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderConfirmContent}
        renderHeader={renderConfirmHeader}
      />
      {/* <BottomSheet
        onCloseEnd={() => {
          if (Object.keys(chosenContact).length > 0) {
            onOTPShare(index);
          }
        }}
        onCloseStart={() => {}}
        enabledInnerScrolling={true}
        ref={trustedContactQrBottomSheet as any}
        snapPoints={[-30, hp('85%')]}
        renderContent={renderTrustedContactQrContents}
        renderHeader={renderTrustedContactQrHeader}
      /> */}
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
        ref={HelpBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('87%') : hp('89%'),
        ]}
        renderContent={renderHelpContent}
        renderHeader={renderHelpHeader}
      />
    </View>
  );
};

export default TrustedContactHistory;

const styles = StyleSheet.create({
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('3%'),
    marginTop: 20,
    marginBottom: 15,
  },
  cardImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
