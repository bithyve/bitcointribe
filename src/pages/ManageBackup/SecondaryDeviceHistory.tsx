import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  AsyncStorage,
  Platform,
  Alert,
} from 'react-native';
import Fonts from '../../common/Fonts';
import NavStyles from '../../common/Styles/NavStyles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getIconByStatus } from './utils';
import { useDispatch, useSelector } from 'react-redux';
import { checkMSharesHealth, ErrorSending } from '../../store/actions/sss';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RFValue } from 'react-native-responsive-fontsize';
import BottomSheet from 'reanimated-bottom-sheet';
import ModalHeader from '../../components/ModalHeader';
import HistoryPageComponent from '../../components/HistoryPageComponent';
import SecondaryDevice from './SecondaryDevice';
import moment from 'moment';
import _ from 'underscore';
import ErrorModalContents from '../../components/ErrorModalContents';
import DeviceInfo from 'react-native-device-info';
import KnowMoreButton from '../../components/KnowMoreButton';
import { uploadEncMShare } from '../../store/actions/sss';
import {
  EphemeralDataElements,
  TrustedContactDerivativeAccountElements,
} from '../../bitcoin/utilities/Interface';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import {
  updateEphemeralChannel,
  updateTrustedContactsInfoLocally,
} from '../../store/actions/trustedContacts';
import config from '../../bitcoin/HexaConfig';
import QRModal from '../Accounts/QRModal';
import S3Service from '../../bitcoin/services/sss/S3Service';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import {
  SECURE_ACCOUNT,
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
  TEST_ACCOUNT,
} from '../../common/constants/wallet-service-types';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import KeeperDeviceHelpContents from '../../components/Helper/KeeperDeviceHelpContents';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';

const SecondaryDeviceHistory = (props) => {
  const [ErrorBottomSheet] = useState(React.createRef());
  const [HelpBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const isErrorSendingFailed = useSelector((state) => state.sss.errorSending);
  const [QrBottomSheet] = useState(React.createRef());
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const [blockReshare, setBlockReshare] = useState('');
  const SHARES_TRANSFER_DETAILS = useSelector(
    (state) =>
      state.storage.database.DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
  );
  const fcmTokenValue = useSelector((state) => state.preferences.fcmTokenValue);

  const WALLET_SETUP = useSelector(
    (state) => state.storage.database.WALLET_SETUP,
  );

  let trustedContactsInfo = useSelector(
    (state) => state.trustedContacts.trustedContactsInfo,
  );

  const dispatch = useDispatch();
  const [secondaryQR, setSecondaryQR] = useState('');
  const s3Service: S3Service = useSelector((state) => state.sss.service);
  const secureAccount: SecureAccount = useSelector(
    (state) => state.accounts[SECURE_ACCOUNT].service,
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
  const [ReshareBottomSheet] = useState(
    React.createRef(),
  );
  const [ChangeBottomSheet] = useState(React.createRef());
  const [guardianExists, setGuardianExists] = useState(false);

  const [secondaryDeviceHistory, setSecondaryDeviceHistory] = useState([
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
    // {
    //   id: 5,
    //   title: 'Recovery Secret In-Transit',
    //   date: '20 May ‘19, 11:00am',
    //   info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    // },
    // {
    //   id: 6,
    //   title: 'Recovery Secret Not Accessible',
    //   date: '19 May ‘19, 11:00am',
    //   info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    // },
  ]);
  const [secondaryDeviceBottomSheet] = useState(
    React.createRef(),
  );
  const [
    secondaryDeviceMessageBottomSheet,
  ] = useState(React.createRef());
  const [isReshare, setIsReshare] = useState(false);
  const uploadMetaShare = useSelector(
    (state) => state.sss.loading.uploadMetaShare,
  );
  const updateEphemeralChannelLoader = useSelector(
    (state) => state.trustedContacts.loading.updateEphemeralChannel,
  );

  const updateAutoHighlightFlags = props.navigation.getParam(
    'updateAutoHighlightFlags',
  );
  const next = props.navigation.getParam('next');

  const saveInTransitHistory = async () => {
    const shareHistory = JSON.parse(await AsyncStorage.getItem('shareHistory'));
    if (shareHistory) {
      const updatedShareHistory = [...shareHistory];
      updatedShareHistory[0] = {
        ...updatedShareHistory[0],
        inTransit: Date.now(),
      };
      updateHistory(updatedShareHistory);
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify(updatedShareHistory),
      );
    }
  };

  const updateTrustedContactsInfo = useCallback(
    async (contact) => {
      let tcInfo = trustedContactsInfo ? [...trustedContactsInfo] : null;

      if (tcInfo) {
        tcInfo[0] = contact;
      } else {
        tcInfo = [];
        tcInfo[2] = undefined; // securing initial 3 positions for Guardians
        tcInfo[0] = contact;
      }
      await AsyncStorage.setItem('TrustedContactsInfo', JSON.stringify(tcInfo));
      dispatch(updateTrustedContactsInfoLocally(tcInfo));
    },
    [trustedContactsInfo],
  );

  const createGuardian = useCallback(
    async (changeKeeper?: boolean) => {
      const walletID = await AsyncStorage.getItem('walletID');
      const FCM = fcmTokenValue;
      //await AsyncStorage.getItem('fcmToken');

      const firstName = 'Secondary';
      const lastName = 'Device';
      const contactName = `${firstName} ${lastName ? lastName : ''}`
        .toLowerCase()
        .trim();

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

      let data: EphemeralDataElements = {
        walletID,
        FCM,
        trustedAddress: trustedReceivingAddress,
        trustedTestAddress: testAccount.hdWallet.receivingAddress,
      };
      const trustedContact = trustedContacts.tc.trustedContacts[contactName];

      let info = null;
      if (trustedContact && trustedContact.secondaryKey) {
        info = trustedContact.secondaryKey;
      }

      const contactInfo = {
        contactName,
        info,
      };

      if (changeKeeper) {
        setSecondaryQR('');
        dispatch(uploadEncMShare(0, contactInfo, data, changeKeeper));
        updateTrustedContactsInfo({ firstName, lastName });
      } else {
        if (
          !SHARES_TRANSFER_DETAILS[0] ||
          Date.now() - SHARES_TRANSFER_DETAILS[0].UPLOADED_AT >
          config.TC_REQUEST_EXPIRY
        ) {
          setSecondaryQR('');
          dispatch(uploadEncMShare(0, contactInfo, data));
          updateTrustedContactsInfo({ firstName, lastName });
        } else if (
          trustedContact &&
          !trustedContact.symmetricKey &&
          trustedContact.ephemeralChannel &&
          trustedContact.ephemeralChannel.initiatedAt &&
          Date.now() - trustedContact.ephemeralChannel.initiatedAt >
          config.TC_REQUEST_EXPIRY
        ) {
          setSecondaryQR('');
          dispatch(
            updateEphemeralChannel(
              contactInfo,
              trustedContact.ephemeralChannel.data[0],
            ),
          );
        }
      }
    },
    [SHARES_TRANSFER_DETAILS, trustedContacts],
  );

  useEffect(() => {
    if (uploadMetaShare || updateEphemeralChannelLoader) {
      if (secondaryQR) setSecondaryQR('');
      return;
    }

    const firstName = 'Secondary';
    const lastName = 'Device';
    const contactName = `${firstName} ${lastName ? lastName : ''}`
      .toLowerCase()
      .trim();

    if (
      trustedContacts.tc.trustedContacts[contactName] &&
      trustedContacts.tc.trustedContacts[contactName].ephemeralChannel
    ) {
      const { publicKey, secondaryKey } = trustedContacts.tc.trustedContacts[
        contactName
      ];

      setSecondaryQR(
        JSON.stringify({
          isGuardian: true,
          requester: WALLET_SETUP.walletName,
          publicKey,
          info: secondaryKey,
          uploadedAt:
            trustedContacts.tc.trustedContacts[contactName].ephemeralChannel
              .initiatedAt,
          type: 'secondaryDeviceGuardian',
          ver: DeviceInfo.getVersion(),
        }),
      );
    }
  }, [
    SHARES_TRANSFER_DETAILS,
    trustedContacts,
    uploadMetaShare,
    updateEphemeralChannelLoader,
  ]);

  useEffect(() => {
    const firstName = 'Secondary';
    const lastName = 'Device';
    const contactName = `${firstName} ${lastName ? lastName : ''}`
      .toLowerCase()
      .trim();
    const tcInstance = trustedContacts.tc.trustedContacts[contactName];
    console.log({ tcInstance });
    if (tcInstance) {
      if (tcInstance.symmetricKey) {
        setGuardianExists(true);
      }
    }
  }, [trustedContacts]);

  useEffect(() => {
    (async () => {
      // blocking keeper reshare till 100% health
      const blockPCShare = await AsyncStorage.getItem('blockPCShare');
      if (blockPCShare) {
        setBlockReshare(blockPCShare);
      } else if (!secureAccount.secureHDWallet.secondaryMnemonic) {
        AsyncStorage.setItem('blockPCShare', 'true');
        setBlockReshare(blockPCShare);
      }
    })();
  }, []);

  const renderSecondaryDeviceContents = useCallback(() => {
    return (
      <SecondaryDevice
        secondaryQR={secondaryQR}
        onPressOk={async () => {
          updateAutoHighlightFlags();
          saveInTransitHistory();
          // dispatch(checkMSharesHealth());
          (secondaryDeviceBottomSheet as any).current.snapTo(0);
          if (next) {
            props.navigation.goBack();
          }
          setTimeout(() => {
            setIsReshare(true);
          }, 2);
        }}
        onPressBack={() => {
          (secondaryDeviceBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [secondaryQR]);

  const renderSecondaryDeviceHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (secondaryDeviceBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);
  const renderSecondaryDeviceMessageContents = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={secondaryDeviceMessageBottomSheet}
        title={`Keeper Device`}
        note={
          'For confirming your Recovery Key on the Keeper Device, simply open the app on that device and log in'
        }
        proceedButtonText={'Ok, got it'}
        onPressProceed={() => {
          if (secondaryDeviceMessageBottomSheet.current)
            (secondaryDeviceMessageBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          if (secondaryDeviceMessageBottomSheet.current)
            (secondaryDeviceMessageBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  }, []);

  const renderSecondaryDeviceMessageHeader = useCallback(() => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (secondaryDeviceMessageBottomSheet as any).current.snapTo(0);
      // }}
      />
    );
  }, []);

  useEffect(() => {
    if (next) (secondaryDeviceBottomSheet as any).current.snapTo(1);
  }, [next]);

  const sortedHistory = (history) => {
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
  };

  const updateHistory = (shareHistory) => {
    const updatedSecondaryHistory = [...secondaryDeviceHistory];
    if (shareHistory[0].createdAt)
      updatedSecondaryHistory[0].date = shareHistory[0].createdAt;
    if (shareHistory[0].inTransit)
      updatedSecondaryHistory[1].date = shareHistory[0].inTransit;

    if (shareHistory[0].accessible)
      updatedSecondaryHistory[2].date = shareHistory[0].accessible;

    if (shareHistory[0].notAccessible)
      updatedSecondaryHistory[3].date = shareHistory[0].notAccessible;
    setSecondaryDeviceHistory(updatedSecondaryHistory);
  };

  useEffect(() => {
    (async () => {
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem('shareHistory'),
      );
      if (shareHistory[0].inTransit || shareHistory[0].accessible) {
        setIsReshare(true);
      }
      if (shareHistory) updateHistory(shareHistory);
    })();
  }, []);

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
  }, [errorMessage, errorMessageHeader]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  useEffect(() => {
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
  }, [isErrorSendingFailed]);

  const renderQrContent = useCallback(() => {
    return (
      <QRModal
        QRModalHeader={'Keeper Reshare'}
        title={'Scan the Exit Key'}
        infoText={
          'For re-sharing the Recovery Key for the Keeper Device, you will have to scan the Exit Key from the Personal Copies (pdfs). Please scan it here to proceed'
        }
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={(qrData) => {
          let isValid = false;
          try {
            qrData = JSON.parse(qrData);
            if (qrData.type && qrData.type === 'encryptedExitKey') {
              const res = s3Service.decryptStaticNonPMDD(
                qrData.encryptedExitKey,
              );
              if (res.status === 200) {
                isValid = secureAccount.isSecondaryMnemonic(
                  res.data.decryptedStaticNonPMDD.secondaryMnemonic,
                );
              } else {
                Alert.alert('Reshare failed', 'Unable to decrypt the exit key');
              }
            } else {
              isValid = secureAccount.isSecondaryMnemonic(qrData);
            }
          } catch (err) {
            // parsing fails during secondary mnemonic from PDF
            console.log({ err });
            isValid = secureAccount.isSecondaryMnemonic(qrData);
          }

          if (isValid) {
            //create buddyMShare
            const changeKeeper = true; // increments the version of the meta share
            createGuardian(changeKeeper);
            (secondaryDeviceBottomSheet.current as any).snapTo(1);
          } else {
            Alert.alert(
              'Invalid Exit Key',
              'Please scan appropriate QR from one of your personal copy',
            );
          }

          setTimeout(() => {
            setQrBottomSheetsFlag(false);
            (QrBottomSheet.current as any).snapTo(0);
          }, 2);
        }}
        onBackPress={() => {
          setTimeout(() => {
            setQrBottomSheetsFlag(false);
          }, 2);
          (QrBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [QrBottomSheetsFlag]);

  const renderQrHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setTimeout(() => {
            setQrBottomSheetsFlag(false);
          }, 2);
          (QrBottomSheet as any).current.snapTo(0);
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

  const renderReshareContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ReshareBottomSheet}
        title={'Reshare with the same device?'}
        info={
          'Proceed if you want to reshare the link/ QR with the same device'
        }
        note={
          'For a different device, please go back and choose ‘Change device'
        }
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (ReshareBottomSheet as any).current.snapTo(0);

          if (blockReshare) {
            (QrBottomSheet.current as any).snapTo(1);
          } else {
            createGuardian();
            (secondaryDeviceBottomSheet as any).current.snapTo(1);
          }
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
      // onPressHeader={() => {
      //   (ReshareBottomSheet as any).current.snapTo(0);
      // }}
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
          (ChangeBottomSheet as any).current.snapTo(0);

          if (blockReshare) {
            (QrBottomSheet.current as any).snapTo(1);
          } else {
            const changeKeeper = true;
            createGuardian(changeKeeper);
            (secondaryDeviceBottomSheet as any).current.snapTo(1);
          }
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
      // onPressHeader={() => {
      //   (ChangeBottomSheet as any).current.snapTo(0);
      // }}
      />
    );
  }, []);

  const renderHelpContent = () => {
    return (
      <KeeperDeviceHelpContents
        titleClicked={() => {
          if (HelpBottomSheet.current)
            (HelpBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
      <SafeAreaView
        style={{ flex: 0, backgroundColor: Colors.backgroundColor }}
      />

      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      <View style={NavStyles.modalHeaderTitleView}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              marginRight: 10,
            }}
          >
            <Image
              style={{
                width: wp('9%'),
                height: wp('9%'),
                resizeMode: 'contain',
                alignSelf: 'center',
                marginRight: 8,
              }}
              source={require('../../assets/images/icons/icon_secondarydevice.png')}
            />
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={NavStyles.modalHeaderTitleText}>
                {props.navigation.state.params.selectedTitle}
              </Text>
              <Text style={NavStyles.modalHeaderInfoText}>
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
                width: isReshare ? 14 : 17,
                height: isReshare ? 16 : 17,
                resizeMode: 'contain',
                marginLeft: 'auto',
                alignSelf: 'center',
              }}
              source={
                isReshare
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
          type={'secondaryDevice'}
          IsReshare={isReshare}
          data={sortedHistory(secondaryDeviceHistory)}
          reshareInfo={
            isReshare && !guardianExists
              ? 'Want to send the Recovery Key again to the same device? '
              : null
          }
          changeInfo={
            isReshare
              ? 'Want to send the Recovery Key to another device? '
              : null
          }
          onPressReshare={() => {
            (ReshareBottomSheet as any).current.snapTo(1);
          }}
          onPressChange={() => {
            (ChangeBottomSheet as any).current.snapTo(1);
          }}
          onPressConfirm={() => {
            (secondaryDeviceMessageBottomSheet as any).current.snapTo(1);
          }}
          onPressContinue={() => {
            createGuardian();
            (secondaryDeviceBottomSheet as any).current.snapTo(1);
          }}
        />
      </View>
      <BottomSheet
        onCloseStart={() => {
          (secondaryDeviceBottomSheet.current as any).snapTo(0);
        }}
        enabledInnerScrolling={true}
        ref={secondaryDeviceBottomSheet as any}
        snapPoints={[-30, hp('85%')]}
        renderContent={renderSecondaryDeviceContents}
        renderHeader={renderSecondaryDeviceHeader}
      />
      <BottomSheet
        onCloseStart={() => {
          (secondaryDeviceMessageBottomSheet.current as any).snapTo(0);
        }}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={secondaryDeviceMessageBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderSecondaryDeviceMessageContents}
        renderHeader={renderSecondaryDeviceMessageHeader}
      />
      <BottomSheet
        enabledGestureInteraction={false}
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
        onOpenEnd={() => {
          setQrBottomSheetsFlag(true);
        }}
        onCloseEnd={() => {
          setQrBottomSheetsFlag(false);
          (QrBottomSheet as any).current.snapTo(0);
        }}
        onCloseStart={() => { }}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={QrBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('92%') : hp('91%'),
        ]}
        renderContent={renderQrContent}
        renderHeader={renderQrHeader}
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
      <BottomSheet
        enabledGestureInteraction={false}
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
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ChangeBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderChangeContent}
        renderHeader={renderChangeHeader}
      />
    </View>
  );
};

export default SecondaryDeviceHistory;
