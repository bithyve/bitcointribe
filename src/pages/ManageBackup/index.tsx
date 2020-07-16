import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Image,
  Platform,
  RefreshControl,
  AsyncStorage,
  InteractionManager,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fonts from '../../common/Fonts';
import Colors from '../../common/Colors';
import { nameToInitials } from '../../common/CommonFunctions';
import CommonStyles from '../../common/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import KnowMoreButton from '../../components/KnowMoreButton';
import { useDispatch, useSelector } from 'react-redux';
import { initHealthCheck, checkMSharesHealth } from '../../store/actions/sss';
import S3Service from '../../bitcoin/services/sss/S3Service';
import HomePageShield from '../../components/HomePageShield';
import Icons from '../../common/Icons';
import ErrorModalContents from '../../components/ErrorModalContents';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import WalletBackupAndRecoveryContents from '../../components/Helper/WalletBackupAndRecoveryContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import RegenerateHealper from '../../components/Helper/RegenerateHealper';
import ModalHeader from '../../components/ModalHeader';
import SecondaryDeviceHealthCheck from '../HealthCheck/SecondaryDeviceHealthCheck';
import CloudHealthCheck from '../HealthCheck/CloudHealthCheck';
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter';
import moment from 'moment';
import ManageBackupHelpContents from '../../components/Helper/ManageBackupHelpContents';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';

export default function ManageBackup(props) {
  const [
    PersonalCopyQRScannerBottomSheet,
    setPersonalCopyQRScannerBottomSheet,
  ] = useState(React.createRef());
  const [IsReshare, setIsReshare] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Ugly');
  const [isNextStepDisable, setIsNextStepDisable] = useState(false);
  const [LoadCamera, setLoadCamera] = useState(false);
  const [ChangeBottomSheet, setChangeBottomSheet] = useState(React.createRef());
  const [ReshareBottomSheet, setReshareBottomSheet] = useState(
    React.createRef(),
  );
  const [ConfirmBottomSheet, setConfirmBottomSheet] = useState(
    React.createRef(),
  );
  const [SelectTypeToReshare, setSelectTypeToReshare] = useState({});
  const [
    SecondaryDeviceHistoryBottomSheet,
    setSecondaryDeviceHistoryBottomSheet,
  ] = useState(React.createRef());
  const [
    PersonalCopyHistoryBottomSheet,
    setPersonalCopyHistoryBottomSheet,
  ] = useState(React.createRef());
  const [
    SecurityQuestionHistoryBottomSheet,
    setSecurityQuestionHistoryBottomSheet,
  ] = useState(React.createRef());
  const [
    WalletBackupAndRecoveryBottomSheet,
    setWalletBackupAndRecoveryBottomSheet,
  ] = useState(React.createRef());
  const [
    CommunicationModeBottomSheet,
    setCommunicationModeBottomSheet,
  ] = useState(React.createRef());
  const [
    RegenerateShareHelperBottomSheet,
    setRegenerateShareHelperBottomSheet,
  ] = useState(React.createRef());

  const [secondaryDeviceHistory, setSecondaryDeviceHistory] = useState([
    {
      id: 1,
      title: 'Recovery Key Not Accessible',
      date: '19 May ‘19, 11:00am',
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Key Received',
      date: '1 June ‘19, 9:00am',
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Key In-Transit',
      date: '30 May ‘19, 11:00am',
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Key Accessible',
      date: '24 May ‘19, 5:00pm',
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 5,
      title: 'Recovery Key In-Transit',
      date: '20 May ‘19, 11:00am',
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 6,
      title: 'Recovery Key Not Accessible',
      date: '19 May ‘19, 11:00am',
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
  ]);

  const [selectedType, setSelectedType] = useState('');
  const [contacts, setContacts] = useState([]);
  const [pageData, setPageData] = useState([
    {
      title: 'Secondary Device',
      personalInfo: null,
      time: 'never',
      status: 'Ugly',
      type: 'secondaryDevice',
      route: 'SecondaryDevice',
    },
    {
      title: 'Trusted Contact 1',
      personalInfo: null,
      time: 'never',
      status: 'Ugly',
      type: 'contact1',
      route: 'TrustedContacts',
      isOTPShared: false,
    },
    {
      title: 'Trusted Contact 2',
      personalInfo: null,
      time: 'never',
      status: 'Ugly',
      type: 'contact2',
      route: 'TrustedContacts',
      isOTPShared: false,
    },
    {
      title: 'Personal Copy 1',
      personalInfo: null,
      time: 'never',
      status: 'Ugly',
      type: 'copy1',
      route: 'PersonalCopy',
    },
    {
      title: 'Personal Copy 2',
      personalInfo: null,
      time: 'never',
      status: 'Ugly',
      type: 'copy2',
      route: 'PersonalCopy',
    },
    {
      title: 'Security Questions',
      personalInfo: null,
      time: 'never',
      status: 'Ugly',
      type: 'security',
      route: 'HealthCheckSecurityAnswer',
    },
  ]);
  const dispatch = useDispatch();
  const s3Service: S3Service = useSelector((state) => state.sss.service);
  // const { databaseSSS } = useSelector(state => state.storage);
  const [overallHealth, setOverallHealth] = useState(null);
  const health = useSelector((state) => state.sss.overallHealth);
  //const { overallHealth } = useSelector( state => state.sss );
  const healthLoading = useSelector(
    (state) => state.sss.loading.checkMSharesHealth,
  );
  const [is_initiated, setIs_initiated] = useState(false);

  function getImageByType(item) {
    let type = item.type;
    if (type == 'secondaryDevice') {
      return require('../../assets/images/icons/icon_secondarydevice.png');
    } else if (type == 'contact1' || type == 'contact2') {
      return require('../../assets/images/icons/icon_user.png');
    } else if (type == 'copy1' || type == 'copy2') {
      if (
        item.personalInfo &&
        item.personalInfo.flagShare &&
        item.personalInfo.shareDetails.type == 'GoogleDrive'
      ) {
        return Icons.manageBackup.PersonalCopy.icloud;
      } else if (
        item.personalInfo &&
        item.personalInfo.flagShare &&
        item.personalInfo.shareDetails.type == 'Email'
      ) {
        return Icons.manageBackup.PersonalCopy.email;
      } else if (
        item.personalInfo &&
        item.personalInfo.flagShare &&
        item.personalInfo.shareDetails.type == 'Print'
      ) {
        return Icons.manageBackup.PersonalCopy.print;
      } else {
        return require('../../assets/images/icons/note.png');
      }
    }
    if (type == 'print') {
      return require('../../assets/images/icons/print.png');
    } else if (type == 'security') {
      return require('../../assets/images/icons/icon_securityquestion.png');
    }
  }

  const getIconByStatus = (status) => {
    if (status == 'Ugly') {
      return require('../../assets/images/icons/icon_error_red.png');
    } else if (status == 'Bad') {
      return require('../../assets/images/icons/icon_error_yellow.png');
    } else if (status == 'Good') {
      return require('../../assets/images/icons/icon_check.png');
    }
  };

  const renderWalletBackupAndRecoveryContents = () => {
    return (
      // <WalletBackupAndRecoveryContents
      //   onPressManageBackup={() => {
      //     (WalletBackupAndRecoveryBottomSheet as any).current.snapTo(0);
      //   }}
      //   onSkip={() => {
      //     (WalletBackupAndRecoveryBottomSheet as any).current.snapTo(0);
      //   }}
      //   onStartBackup={() => {
      //     (WalletBackupAndRecoveryBottomSheet as any).current.snapTo(0);
      //   }}
      // />
      <ManageBackupHelpContents />
    );
  };

  const renderWalletBackupAndRecoveryHeader = () => {
    return (
      <AppBottomSheetTouchableWrapper
        activeOpacity={10}
        style={styles.modalHeaderContainer}
        onPress={() => (WalletBackupAndRecoveryBottomSheet as any).current.snapTo(0)}
      >
        <View style={{ height: 20 }}>
          <View style={styles.modalHeaderHandle} />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.healthOfAppText}>
            Health of the App
          </Text>
        </View>
        <View style={styles.healthOfAppDivider}/>
      </AppBottomSheetTouchableWrapper>
    );
  };

  const renderRegenerateShareHelperContents = () => {
    return (
      <RegenerateHealper
        topButtonText={'Regenerate Shares'}
        continueButtonText={'Continue'}
        quitButtonText={'Quit'}
        onPressRegenerateShare={() => {
          (RegenerateShareHelperBottomSheet as any).current.snapTo(0);
          props.navigation.navigate('NewWalletNameRegenerateShare');
        }}
        onPressContinue={() => {
          (RegenerateShareHelperBottomSheet as any).current.snapTo(0);
          props.navigation.navigate('NewWalletNameRegenerateShare');
        }}
        onPressQuit={() => {
          (RegenerateShareHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };
  const renderRegenerateShareHelperHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHandle={() => {
          (RegenerateShareHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderSecondaryDeviceHistoryContent = () => {
    return (
      <SecondaryDeviceHealthCheck
        data={secondaryDeviceHistory}
        title={'Keeper Device'}
        time={selectedTime}
        status={selectedStatus}
        reshareInfo={
          'Want to send the Recovery Key again to the same destination? '
        }
        onPressConfirm={() => {
          (ConfirmBottomSheet as any).current.snapTo(1);
        }}
        onPressReshare={() => {
          (ReshareBottomSheet as any).current.snapTo(1);
        }}
        modalRef={SecondaryDeviceHistoryBottomSheet}
        onPressBack={() => {
          (SecondaryDeviceHistoryBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderSecondaryDeviceHistoryHeader = () => {
    return (
      <ModalHeader
        backgroundColor={Colors.backgroundColor}
        onPressHeader={() => {
          (SecondaryDeviceHistoryBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderPersonalCopyHistoryContent = () => {
    return (
      <SecondaryDeviceHealthCheck
        data={secondaryDeviceHistory}
        title={'Personal Copy'}
        time={selectedTime}
        status={selectedStatus}
        reshareInfo={
          'Want to send the Recovery Key again to the same destination? '
        }
        onPressConfirm={() => {
          (ConfirmBottomSheet as any).current.snapTo(1);
        }}
        onPressReshare={() => {
          (ReshareBottomSheet as any).current.snapTo(1);
        }}
        modalRef={PersonalCopyHistoryBottomSheet}
        onPressBack={() => {
          (PersonalCopyHistoryBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderPersonalCopyHistoryHeader = () => {
    return (
      <ModalHeader
        backgroundColor={Colors.backgroundColor}
        onPressHeader={() => {
          (PersonalCopyHistoryBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderSecurityQuestionHistoryContent = () => {
    return (
      <SecondaryDeviceHealthCheck
        data={secondaryDeviceHistory}
        title={'Security Question'}
        time={selectedTime}
        status={selectedStatus}
        onPressConfirm={() => {
          (ConfirmBottomSheet as any).current.snapTo(1);
        }}
        modalRef={SecurityQuestionHistoryBottomSheet}
        onPressBack={() => {
          (SecurityQuestionHistoryBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderSecurityQuestionHistoryHeader = () => {
    return (
      <ModalHeader
        backgroundColor={Colors.backgroundColor}
        onPressHeader={() => {
          (SecurityQuestionHistoryBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderChangeContent = () => {
    return (
      <ErrorModalContents
        modalRef={ChangeBottomSheet}
        title={'Change your\nKeeper'}
        info={'Having problems with your Keeper?'}
        note={
          'You can change the Keeper you selected to sebd your Recovery Key'
        }
        proceedButtonText={'Change'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          setTimeout(() => {
            setIsReshare(false);
          }, 2);
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const renderChangeHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderReshareContent = () => {
    let title = '';
    let info = '';
    let note = '';
    if (SelectTypeToReshare == 'secondaryDevice') {
      title = 'Reshare Recovery Key\nwith Keeper Device';
      info = 'Did your Keeper device not receive the Recovery Key?';
      note = 'You can reshare the Recovery Key with your \nKeeper Device';
    } else if (
      SelectTypeToReshare == 'contact1' ||
      SelectTypeToReshare == 'contact2'
    ) {
      title = 'Reshare Recovery Key\nwith Keeper';
      info = 'Did your Keeper not receive the Recovery Key?';
      note = 'You can reshare the Recovery Key with your Keeper';
    } else if (
      SelectTypeToReshare == 'copy1' ||
      SelectTypeToReshare == 'copy2'
    ) {
      title = 'Reshare Recovery Key\nwith Personal Copy';
      info = 'Did your personal Copies not receive the Recovery Key?';
      note = 'You can reshare the Recovery Key with your \nPersonal Copy';
    }
    return (
      <ErrorModalContents
        modalRef={ReshareBottomSheet}
        title={title}
        info={info}
        note={note}
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
  };

  const onPressReshare = () => {
    setTimeout(() => {
      setIsReshare(true);
    }, 2);
    if (SelectTypeToReshare == 'secondaryDevice') {
      // secondaryDeviceBottomSheet.current.snapTo(1);
      (SecondaryDeviceHistoryBottomSheet as any).current.snapTo(0);
    } else if (SelectTypeToReshare == 'contact1') {
      // setTimeout(() => {
      //   setChosenContact(contacts[0]);
      //   setChosenContactIndex(1);
      // }, 2);
      (CommunicationModeBottomSheet as any).current.snapTo(1);
    } else if (SelectTypeToReshare == 'contact2') {
      // setTimeout(() => {
      //   setChosenContact(contacts[1]);
      //   setChosenContactIndex(2);
      // }, 2);
      (CommunicationModeBottomSheet as any).current.snapTo(1);
    } else if (SelectTypeToReshare == 'copy1') {
      (PersonalCopyHistoryBottomSheet as any).current.snapTo(0);
      // (PersonalCopy1ShareBottomSheet as any).current.snapTo(1);
    } else if (SelectTypeToReshare == 'copy2') {
      (PersonalCopyHistoryBottomSheet as any).current.snapTo(0);
      // (PersonalCopy1ShareBottomSheet as any).current.snapTo(1);
    } else if (SelectTypeToReshare == 'security') {
      // SecurityQuestionBottomSheet.current.snapTo(1);
      (SecurityQuestionHistoryBottomSheet as any).current.snapTo(0);
    }
    (ReshareBottomSheet as any).current.snapTo(0);
  };

  const renderReshareHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderConfirmContent = () => {
    let title = '';
    let info = '';
    let note = '';
    let proceedButtonText = '';
    if (SelectTypeToReshare == 'secondaryDevice') {
      title = 'Confirm Recovery Key\nwith Keeper Device';
      info = 'Your Keeper Device seems away from their Hexa App';
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Key';
      proceedButtonText = 'Send a message';
    } else if (
      SelectTypeToReshare == 'contact1' ||
      SelectTypeToReshare == 'contact2'
    ) {
      title = 'Confirm Recovery Key\nwith Keeper';
      info = 'Your Keeper seems away from their Hexa App';
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Key';
      proceedButtonText = 'Confirm';
    } else if (
      SelectTypeToReshare == 'copy1' ||
      SelectTypeToReshare == 'copy2'
    ) {
      title = 'Confirm Recovery Key\nwith Personal Copy';
      info = 'Your Keeper seems away from their Hexa App';
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Key';
      proceedButtonText = 'Confirm';
    } else if (SelectTypeToReshare == 'security') {
      title = 'Confirm Recovery Key\nwith Security Question';
      info = 'Your Security Question seems away from their Hexa App';
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Key';
      proceedButtonText = 'Confirm';
    }
    return (
      <ErrorModalContents
        modalRef={ConfirmBottomSheet}
        title={title}
        info={info}
        note={note}
        proceedButtonText={proceedButtonText}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          onPressConfirm();
        }}
        onPressIgnore={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const onPressConfirm = () => {
    if (SelectTypeToReshare == 'secondaryDevice') {
      setSelectedType('');
      (SecondaryDeviceHistoryBottomSheet as any).current.snapTo(0);
    } else if (SelectTypeToReshare == 'contact1') {
      setTimeout(() => {
        setSelectedType('');
      }, 2);
    } else if (SelectTypeToReshare == 'contact2') {
      setTimeout(() => {
        setSelectedType('');
      }, 2);
    } else if (SelectTypeToReshare == 'copy1') {
      setTimeout(() => {
        setLoadCamera(true);
      }, 2);
      (PersonalCopyHistoryBottomSheet as any).current.snapTo(0);
      (PersonalCopyQRScannerBottomSheet as any).current.snapTo(1);
    } else if (SelectTypeToReshare == 'copy2') {
      setTimeout(() => {
        setLoadCamera(true);
      }, 2);
      (PersonalCopyHistoryBottomSheet as any).current.snapTo(0);
      (PersonalCopyQRScannerBottomSheet as any).current.snapTo(1);
    } else if (SelectTypeToReshare == 'security') {
      // SecurityQuestionBottomSheet.current.snapTo(1);
      (SecurityQuestionHistoryBottomSheet as any).current.snapTo(0);
    }
    (ConfirmBottomSheet as any).current.snapTo(0);
  };

  const renderConfirmHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderPersonalCopyConfirmModalContent = () => {
    return (
      <CloudHealthCheck
        LoadCamera={LoadCamera}
        modalRef={PersonalCopyQRScannerBottomSheet}
        scannedCode={getScannerData}
        goPressBack={() => {
          setTimeout(() => {
            setLoadCamera(false);
            setSelectedType('');
          }, 2);
          (PersonalCopyQRScannerBottomSheet as any).current.snapTo(0);
        }}
        onPressProceed={() => { }}
        onPressIgnore={() => {
          setTimeout(() => {
            setLoadCamera(false);
            setSelectedType('');
          }, 2);
          (PersonalCopyQRScannerBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderPersonalCopyConfirmModalHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setTimeout(() => {
            setLoadCamera(false);
            setSelectedType('');
          }, 2);
          (PersonalCopyQRScannerBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const getScannerData = (data) => {
    console.log('data', data);
  };

  const [autoHighlightFlags, setAutoHighlightFlags] = useState({
    secondaryDevice: false,
    trustedContact1: false,
    trustedContact2: false,
    personalCopy1: false,
    personalCopy2: false,
    securityAns: true,
  });

  const autoHighlight = async () => {
    let {
      secondaryDevice,
      trustedContact1,
      trustedContact2,
      personalCopy1,
      personalCopy2,
      securityAns,
    } = autoHighlightFlags;

    if (!overallHealth) {
      if (!secondaryDevice) {
        setSelectedType('secondaryDevice');
      } else if (!trustedContact1) {
        setSelectedType('contact1');
      } else if (!trustedContact2) {
        setSelectedType('contact2');
      } else if (!personalCopy1) {
        setSelectedType('copy1');
      } else if (!personalCopy2) {
        setSelectedType('copy2');
      } else if (!securityAns) {
        setSelectedType('security');
      }
      return;
    }

    if (
      !secondaryDevice &&
      !(overallHealth.sharesInfo[0] && overallHealth.sharesInfo[0].updatedAt)
    ) {
      setSelectedType('secondaryDevice');
    } else if (
      !trustedContact1 &&
      !(overallHealth.sharesInfo[1] && overallHealth.sharesInfo[1].updatedAt)
    ) {
      setSelectedType('contact1');
    } else if (
      !trustedContact2 &&
      !(overallHealth.sharesInfo[2] && overallHealth.sharesInfo[2].updatedAt)
    ) {
      setSelectedType('contact2');
    } else if (
      !personalCopy1 &&
      !(overallHealth.sharesInfo[3] && overallHealth.sharesInfo[3].updatedAt)
    ) {
      setSelectedType('copy1');
    } else if (
      !personalCopy2 &&
      !(overallHealth.sharesInfo[4] && overallHealth.sharesInfo[4].updatedAt)
    ) {
      setSelectedType('copy2');
    } else if (!securityAns && !overallHealth.qaStatus.updatedAt) {
      setSelectedType('security');
    } else {
      if (overallHealth) {
        if (
          overallHealth.sharesInfo[0] &&
          overallHealth.sharesInfo[0].shareStage === 'Ugly'
        ) {
          setSelectedType('secondaryDevice');
        } else if (
          overallHealth.sharesInfo[1] &&
          overallHealth.sharesInfo[1].shareStage === 'Ugly'
        ) {
          setSelectedType('contact1');
        } else if (
          overallHealth.sharesInfo[2] &&
          overallHealth.sharesInfo[2].shareStage === 'Ugly'
        ) {
          setSelectedType('contact2');
        } else if (
          overallHealth.sharesInfo[3] &&
          overallHealth.sharesInfo[3].shareStage === 'Ugly'
        ) {
          setSelectedType('copy1');
        } else if (
          overallHealth.sharesInfo[4] &&
          overallHealth.sharesInfo[4].shareStage === 'Ugly'
        ) {
          setSelectedType('copy2');
        } else if (overallHealth.qaStatus.stage === 'Ugly') {
          setSelectedType('security');
        } else if (
          overallHealth.sharesInfo[0] &&
          overallHealth.sharesInfo[0].shareStage === 'Bad'
        ) {
          setSelectedType('secondaryDevice');
        } else if (
          overallHealth.sharesInfo[1] &&
          overallHealth.sharesInfo[1].shareStage === 'Bad'
        ) {
          setSelectedType('contact1');
        } else if (
          overallHealth.sharesInfo[2] &&
          overallHealth.sharesInfo[2].shareStage === 'Bad'
        ) {
          setSelectedType('contact2');
        } else if (
          overallHealth.sharesInfo[3] &&
          overallHealth.sharesInfo[3].shareStage === 'Bad'
        ) {
          setSelectedType('copy1');
        } else if (
          overallHealth.sharesInfo[4] &&
          overallHealth.sharesInfo[4].shareStage === 'Bad'
        ) {
          setSelectedType('copy2');
        } else if (overallHealth.qaStatus.stage === 'Bad') {
          setSelectedType('security');
        }
      }
    }
  };

  const setContactsFromAsync = async () => {
    let { trustedContactsInfo } = useSelector((state) => state.trustedContacts.trustedContacts)
    if (trustedContactsInfo) {
      const selectedContacts = trustedContactsInfo.slice(1, 3);
      setContacts(selectedContacts);

      if (selectedContacts[0]) {
        pageData[1].personalInfo = selectedContacts[0];
      }
      if (selectedContacts[1]) {
        pageData[2].personalInfo = selectedContacts[1];
      }
      setPageData([...pageData]);
    }
  };

  const setAutoHighlightFlagsFromAsync = async () => {
    const highlightFlags = await AsyncStorage.getItem('AutoHighlightFlags');
    if (highlightFlags) {
      console.log('Setting autoHighlight flags');
      setAutoHighlightFlags(JSON.parse(highlightFlags));
    }
  };

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIs_initiated(true);
    });
    let focusListener = props.navigation.addListener('didFocus', () => {
      setContactsFromAsync();
      // setAutoHighlightFlagsFromAsync();
    });
    return () => {
      focusListener.remove();
    };
  }, []);

  useEffect(() => {
    setAutoHighlightFlagsFromAsync();
  }, []);

  // useEffect(() => {
  //   if (autoHighlightFlags) {
  //     autoHighlight();
  //     AsyncStorage.setItem(
  //       'AutoHighlightFlags',
  //       JSON.stringify(autoHighlightFlags),
  //     );
  //   }
  // }, [autoHighlightFlags, overallHealth]);

  useEffect(() => {
    if (overallHealth) {
      // update acc to overall health (aids post wallet recovery)
      const updatedAutoHighlightFlags = { ...autoHighlightFlags };
      if (
        overallHealth.sharesInfo[0] &&
        overallHealth.sharesInfo[0].updatedAt
      ) {
        updatedAutoHighlightFlags.secondaryDevice = true;
      }
      if (
        overallHealth.sharesInfo[1] &&
        overallHealth.sharesInfo[1].updatedAt
      ) {
        updatedAutoHighlightFlags.trustedContact1 = true;
      }
      if (
        overallHealth.sharesInfo[2] &&
        overallHealth.sharesInfo[2].updatedAt
      ) {
        updatedAutoHighlightFlags.trustedContact2 = true;
      }
      if (
        overallHealth.sharesInfo[3] &&
        overallHealth.sharesInfo[3].updatedAt
      ) {
        updatedAutoHighlightFlags.personalCopy1 = true;
      }
      if (
        overallHealth.sharesInfo[4] &&
        overallHealth.sharesInfo[4].updatedAt
      ) {
        updatedAutoHighlightFlags.personalCopy2 = true;
      }
      if (overallHealth.qaStatus.updatedAt) {
        updatedAutoHighlightFlags.securityAns = true;
      }

      if (
        JSON.stringify(updatedAutoHighlightFlags) !==
        JSON.stringify(autoHighlightFlags)
      ) {
        setAutoHighlightFlags(updatedAutoHighlightFlags);
        // TODO -- replace this
        AsyncStorage.setItem(
          'AutoHighlightFlags',
          JSON.stringify(updatedAutoHighlightFlags),
        );
      }
    }
  }, [overallHealth]);

  useEffect(() => {
    autoHighlight();
  }, [autoHighlightFlags]);

  useEffect(() => {
    // dispatch(fetchSSSFromDB());
    checkNShowHelperModal();
  }, []);

  useEffect(() => {
    if (health) setOverallHealth(health);
    else {
      (async () => {
        const storedHealth = await AsyncStorage.getItem('overallHealth');
        if (storedHealth) {
          setOverallHealth(JSON.parse(storedHealth));
        }
      })();
    }
  }, [health]);

  // useEffect(() => {
  //   if (health) setOverallHealth(health);
  // }, [health]);

  useEffect(() => {
    if (overallHealth) {
      setIsNextStepDisable(false);
      const updatedPageData = [...pageData];
      updatedPageData.forEach((data) => {
        switch (data.title) {
          case 'Secondary Device':
            if (overallHealth.sharesInfo[0]) {
              data.status = overallHealth.sharesInfo[0].shareStage;
              data.time = overallHealth.sharesInfo[0].updatedAt;
            }
            break;

          case 'Trusted Contact 1':
            if (overallHealth.sharesInfo[1]) {
              data.status = overallHealth.sharesInfo[1].shareStage;
              data.time = overallHealth.sharesInfo[1].updatedAt;
            }
            break;

          case 'Trusted Contact 2':
            if (overallHealth.sharesInfo[2]) {
              data.status = overallHealth.sharesInfo[2].shareStage;
              data.time = overallHealth.sharesInfo[2].updatedAt;
            }
            break;

          case 'Personal Copy 1':
            if (overallHealth.sharesInfo[3]) {
              data.status = overallHealth.sharesInfo[3].shareStage;
              data.time = overallHealth.sharesInfo[3].updatedAt;
            }
            break;

          case 'Personal Copy 2':
            if (overallHealth.sharesInfo[4]) {
              data.status = overallHealth.sharesInfo[4].shareStage;
              data.time = overallHealth.sharesInfo[4].updatedAt;
            }
            break;

          case 'Security Questions':
            data.status = overallHealth.qaStatus.stage;
            data.time = overallHealth.qaStatus.updatedAt;
            break;

          default:
            break;
        }
      });
      setPageData(updatedPageData);
      // autoHighlightOptions();
    }
  }, [overallHealth]);

  const checkNShowHelperModal = async () => {
    let isManageBackupHelperDone = await AsyncStorage.getItem(
      'isManageBackupHelperDone',
    );
    if (!isManageBackupHelperDone) {
      await AsyncStorage.setItem('isManageBackupHelperDone', 'true');
      setTimeout(() => {
        (WalletBackupAndRecoveryBottomSheet as any).current.snapTo(1);
      }, 1000);
    }
  };

  const nextStep = async () => {
    const {
      secondaryDevice,
      trustedContact1,
      trustedContact2,
      personalCopy1,
      personalCopy2,
      securityAns,
    } = autoHighlightFlags;

    if (
      !secondaryDevice &&
      !(overallHealth.sharesInfo[0] && overallHealth.sharesInfo[0].updatedAt)
    ) {
      const data = pageData[0];
      props.navigation.navigate('SecondaryDeviceHistory', {
        selectedStatus: data.status,
        selectedTime: getTime(data.time),
        selectedTitle: data.title,
        updateAutoHighlightFlags: () =>
          setAutoHighlightFlags({
            ...autoHighlightFlags,
            secondaryDevice: true,
          }),
        next: 'true',
      });
    } else if (
      !trustedContact1 &&
      !(overallHealth.sharesInfo[1] && overallHealth.sharesInfo[1].updatedAt)
    ) {
      props.navigation.navigate('TrustedContactHistory', {
        selectedStatus: pageData[1].status,
        selectedTime: getTime(pageData[1].time),
        selectedTitle: pageData[1].title,
        updateAutoHighlightFlags: () =>
          setAutoHighlightFlags({
            ...autoHighlightFlags,
            trustedContact1: true,
          }),
        activateReshare: autoHighlightFlags.trustedContact1,
        next: 'true',
      });
    } else if (
      !trustedContact2 &&
      !(overallHealth.sharesInfo[2] && overallHealth.sharesInfo[2].updatedAt)
    ) {
      props.navigation.navigate('TrustedContactHistory', {
        selectedStatus: pageData[2].status,
        selectedTime: getTime(pageData[2].time),
        selectedTitle: pageData[2].title,
        updateAutoHighlightFlags: () =>
          setAutoHighlightFlags({
            ...autoHighlightFlags,
            trustedContact2: true,
          }),
        activateReshare: autoHighlightFlags.trustedContact2,
        next: 'true',
      });
    } else if (
      !personalCopy1 &&
      !(overallHealth.sharesInfo[3] && overallHealth.sharesInfo[3].updatedAt)
    ) {
      const data = pageData[3];
      props.navigation.navigate('PersonalCopyHistory', {
        selectedStatus: data.status,
        selectedTime: getTime(data.time),
        selectedTitle: data.title,
        selectedPersonalCopy: data,
        updateAutoHighlightFlags: () =>
          setAutoHighlightFlags({
            ...autoHighlightFlags,
            personalCopy1: true,
          }),
        next: 'true',
      });
    } else if (
      !personalCopy2 &&
      !(overallHealth.sharesInfo[4] && overallHealth.sharesInfo[4].updatedAt)
    ) {
      const data = pageData[4];
      props.navigation.navigate('PersonalCopyHistory', {
        selectedStatus: data.status,
        selectedTime: getTime(data.time),
        selectedTitle: data.title,
        selectedPersonalCopy: data,
        updateAutoHighlightFlags: () =>
          setAutoHighlightFlags({
            ...autoHighlightFlags,
            personalCopy2: true,
          }),
        next: 'true',
      });
    } else if (!securityAns && !overallHealth.qaStatus.updatedAt) {
      const data = pageData[5];
      props.navigation.navigate('SecurityQuestionHistory', {
        selectedStatus: data.status,
        selectedTime: getTime(data.time),
        selectedTitle: data.title,
        updateAutoHighlightFlags: () =>
          setAutoHighlightFlags({
            ...autoHighlightFlags,
            securityAns: true,
          }),
        next: 'true',
      });
    } else {
      if (overallHealth) {
        if (
          overallHealth.sharesInfo[0] &&
          overallHealth.sharesInfo[0].shareStage === 'Ugly'
        ) {
          const data = pageData[0];
          props.navigation.navigate('SecondaryDeviceHistory', {
            selectedStatus: data.status,
            selectedTime: getTime(data.time),
            selectedTitle: data.title,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                secondaryDevice: true,
              }),
            next: 'true',
          });
        } else if (
          overallHealth.sharesInfo[1] &&
          overallHealth.sharesInfo[1].shareStage === 'Ugly'
        ) {
          props.navigation.navigate('TrustedContactHistory', {
            selectedStatus: pageData[1].status,
            selectedTime: getTime(pageData[1].time),
            selectedTitle: pageData[1].title,
            isConfirm: true,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                trustedContact1: true,
              }),
            activateReshare: autoHighlightFlags.trustedContact1,
            next: 'true',
          });
        } else if (
          overallHealth.sharesInfo[2] &&
          overallHealth.sharesInfo[2].shareStage === 'Ugly'
        ) {
          props.navigation.navigate('TrustedContactHistory', {
            selectedStatus: pageData[2].status,
            selectedTime: getTime(pageData[2].time),
            selectedTitle: pageData[2].title,
            isConfirm: true,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                trustedContact2: true,
              }),
            activateReshare: autoHighlightFlags.trustedContact2,
            next: 'true',
          });
        } else if (
          overallHealth.sharesInfo[3] &&
          overallHealth.sharesInfo[3].shareStage === 'Ugly'
        ) {
          const data = pageData[3];
          props.navigation.navigate('PersonalCopyHistory', {
            selectedStatus: data.status,
            selectedTime: getTime(data.time),
            selectedTitle: data.title,
            selectedPersonalCopy: data,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                personalCopy1: true,
              }),
            next: 'true',
          });
        } else if (
          overallHealth.sharesInfo[4] &&
          overallHealth.sharesInfo[4].shareStage === 'Ugly'
        ) {
          const data = pageData[4];
          props.navigation.navigate('PersonalCopyHistory', {
            selectedStatus: data.status,
            selectedTime: getTime(data.time),
            selectedTitle: data.title,
            selectedPersonalCopy: data,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                personalCopy2: true,
              }),
            next: 'true',
          });
        } else if (overallHealth.qaStatus.stage === 'Ugly') {
          // Security question
          const data = pageData[5];
          props.navigation.navigate('SecurityQuestionHistory', {
            selectedStatus: data.status,
            selectedTime: getTime(data.time),
            selectedTitle: data.title,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                securityAns: true,
              }),
            next: 'true',
          });
        } else if (
          overallHealth.sharesInfo[0] &&
          overallHealth.sharesInfo[0].shareStage === 'Bad'
        ) {
          // Secondary device
          const data = pageData[0];
          props.navigation.navigate('SecondaryDeviceHistory', {
            selectedStatus: data.status,
            selectedTime: getTime(data.time),
            selectedTitle: data.title,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                secondaryDevice: true,
              }),
            next: 'true',
          });
        } else if (
          overallHealth.sharesInfo[1] &&
          overallHealth.sharesInfo[1].shareStage === 'Bad'
        ) {
          //Trusted contact 1
          props.navigation.navigate('TrustedContactHistory', {
            selectedStatus: pageData[1].status,
            selectedTime: getTime(pageData[1].time),
            selectedTitle: pageData[1].title,
            isConfirm: true,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                trustedContact1: true,
              }),
            activateReshare: autoHighlightFlags.trustedContact1,
            next: 'true',
          });
        } else if (
          overallHealth.sharesInfo[2] &&
          overallHealth.sharesInfo[2].shareStage === 'Bad'
        ) {
          //Trusted contact 2
          props.navigation.navigate('TrustedContactHistory', {
            selectedStatus: pageData[2].status,
            selectedTime: getTime(pageData[2].time),
            selectedTitle: pageData[2].title,
            isConfirm: true,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                trustedContact2: true,
              }),
            activateReshare: autoHighlightFlags.trustedContact2,
            next: 'true',
          });
        } else if (
          overallHealth.sharesInfo[3] &&
          overallHealth.sharesInfo[3].shareStage === 'Bad'
        ) {
          const data = pageData[3];
          props.navigation.navigate('PersonalCopyHistory', {
            selectedStatus: data.status,
            selectedTime: getTime(data.time),
            selectedTitle: data.title,
            selectedPersonalCopy: data,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                personalCopy1: true,
              }),
            next: 'true',
          });
        } else if (
          overallHealth.sharesInfo[4] &&
          overallHealth.sharesInfo[4].shareStage === 'Bad'
        ) {
          const data = pageData[4];
          props.navigation.navigate('PersonalCopyHistory', {
            selectedStatus: data.status,
            selectedTime: getTime(data.time),
            selectedTitle: data.title,
            selectedPersonalCopy: data,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                personalCopy2: true,
              }),
            next: 'true',
          });
        } else if (overallHealth.qaStatus.stage === 'Bad') {
          // Security question
          const data = pageData[5];
          props.navigation.navigate('SecurityQuestionHistory', {
            selectedStatus: data.status,
            selectedTime: getTime(data.time),
            selectedTitle: data.title,
            updateAutoHighlightFlags: () =>
              setAutoHighlightFlags({
                ...autoHighlightFlags,
                securityAns: true,
              }),
            next: 'true',
          });
        }
      }
    }
  };

  useEffect(() => {
    onContactsUpdate();
  }, [contacts]);

  const onContactsUpdate = async () => {
    if (contacts.length) {
      if (
        contacts.findIndex((value) => value && value.type == 'contact1') != -1
      ) {
        pageData[1].personalInfo =
          contacts[
          contacts.findIndex((value) => value && value.type == 'contact1')
          ];
      }
      if (
        contacts.findIndex((value) => value && value.type == 'contact2') != -1
      ) {
        pageData[2].personalInfo =
          contacts[
          contacts.findIndex((value) => value && value.type == 'contact2')
          ];
      }
    }
    setPageData(pageData);
  };

  const getTime = (item) => {
    return (item.toString() && item.toString() == '0') ||
      item.toString() == 'never'
      ? 'never'
      : timeFormatter(moment(new Date()), item);
  };

  useEffect(() => {
    // HC init and down-streaming
    if (s3Service) {
      const { healthCheckInitialized } = s3Service.sss;
      if (healthCheckInitialized) {
        (async () => {
          const intialHealthSync = await AsyncStorage.getItem(
            'initalHealthSync',
          );
          if (!intialHealthSync) {
            dispatch(checkMSharesHealth());
            // TODO -- replace this
            AsyncStorage.setItem('initalHealthSync', 'true');
          }
        })();
      } else {
        // console.log({ healthCheckInitialized });
        dispatch(initHealthCheck());
      }
    }
  }, [s3Service]);

  const getStatusIcon = (item) => {
    if (item.type == 'secondaryDevice' && autoHighlightFlags.secondaryDevice) {
      return {
        icon: getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
            ? Colors.yellow
            : item.status == 'Good'
            ? Colors.green
            : Colors.textColorGrey,
      };
    }
    if (item.type == 'contact1' && autoHighlightFlags.trustedContact1) {
      return {
        icon: getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
            ? Colors.yellow
            : item.status == 'Good'
            ? Colors.green
            : Colors.textColorGrey,
      };
    }
    if (item.type == 'contact2' && autoHighlightFlags.trustedContact2) {
      return {
        icon: getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
            ? Colors.yellow
            : item.status == 'Good'
            ? Colors.green
            : Colors.textColorGrey,
      };
    }
    if (item.type == 'copy1' && autoHighlightFlags.personalCopy1) {
      return {
        icon: getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
            ? Colors.yellow
            : item.status == 'Good'
            ? Colors.green
            : Colors.textColorGrey,
      };
    }
    if (item.type == 'copy2' && autoHighlightFlags.personalCopy2) {
      return {
        icon: getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
            ? Colors.yellow
            : item.status == 'Good'
            ? Colors.green
            : Colors.textColorGrey,
      };
    }
    if (item.type == 'security' && autoHighlightFlags.securityAns) {
      return {
        icon: getIconByStatus(item.status),
        color:
          item.status == 'Ugly'
            ? Colors.red
            : item.status == 'Bad'
            ? Colors.yellow
            : item.status == 'Good'
            ? Colors.green
            : Colors.textColorGrey,
      };
    }
    return {
      icon: require('../../assets/images/icons/icon_error_gray.png'),
      color: Colors.lightTextColor,
    };
  };

  const getImageIcon = (item) => {
    if (item.type == 'contact1' || item.type == 'contact2') {
      if (item.personalInfo) {
        if (item.personalInfo.imageAvailable) {
          return (
            <Image
              source={item.personalInfo.image}
              style={{
                width: 35,
                height: 35,
                borderRadius: 35 / 2,
                resizeMode: 'contain',
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
                width: 35,
                height: 35,
                borderRadius: 30,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  lineHeight: 13, //... One for top and one for bottom alignment
                }}
              >
                {item.personalInfo
                  ? nameToInitials(
                    item.personalInfo.firstName && item.personalInfo.lastName
                      ? item.personalInfo.firstName +
                      ' ' +
                      item.personalInfo.lastName
                      : item.personalInfo.firstName &&
                        !item.personalInfo.lastName
                        ? item.personalInfo.firstName
                        : !item.personalInfo.firstName &&
                          item.personalInfo.lastName
                          ? item.personalInfo.lastName
                          : '',
                  )
                  : ''}
              </Text>
            </View>
          );
        }
      }
    }
    return <Image style={styles.cardImage} source={getImageByType(item)} />;
  };

  const getCardTitle = (item) => {
    if (item.type === 'contact1' || item.type === 'contact2') {
      if (item.personalInfo) {
        if (item.personalInfo.firstName && item.personalInfo.lastName) {
          return item.personalInfo.firstName + ' ' + item.personalInfo.lastName;
        }
        if (!item.personalInfo.firstName && item.personalInfo.lastName) {
          return item.personalInfo.lastName;
        }
        if (item.personalInfo.firstName && !item.personalInfo.lastName) {
          return item.personalInfo.firstName;
        }

        return '';
      } else {
        return 'Friends and Family';
      }
    }

    if (item.type === 'copy1' || item.type === 'copy2') {
      return 'Personal Copy';
    }

    if (item.type === 'secondaryDevice') {
      return 'Keeper Device';
    }

    if (item.type === 'security') {
      return 'Security Question';
    }

    return item.title;
  };

  const getCardSubText = (item) => {
    if (item.type === 'contact1' || item.type === 'contact2') {
      if (item.personalInfo) {
        return 'Friends and Family';
      }
      return 'Select a Friend or Family member as a Keeper';
    }
    if (item.type === 'secondaryDevice') {
      if (item.status === 'Ugly') {
        return 'Another device running Hexa app that you own';
      }
      return 'Last Backup ';
    }
    if (item.type === 'copy1' || item.type === 'copy2') {
      if (item.status === 'Ugly') {
        return 'Secure your Recovery Key as a file (pdf)';
      }
      return 'The PDFs are locked with your Security Answer';
    }

    return 'Last Backup ';
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ flex: 1, position: 'relative' }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={{
              marginLeft: 'auto',
              marginRight: 10,
              padding: 10,
            }}
            activeOpacity={1}
            // onPress={() => {
            //   RegenerateShareHelperBottomSheet.current.snapTo(1);
            // }}
          >
            <Image
              source={require('../../assets/images/icons/icon_settings1.png')}
              style={{
                width: wp('5%'),
                height: wp('5%'),
                resizeMode: 'contain',
              }}
            />
          </TouchableOpacity> */}
        </View>
        {is_initiated ? (
          <View style={{ flex: 1 }}>
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={healthLoading}
                  onRefresh={() => {
                    dispatch(checkMSharesHealth());
                  }}
                />
              }
            >
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <View style={{ flex: 2 }}>
                  <Text
                    style={{ ...CommonStyles.headerTitles, marginLeft: 25 }}
                  >
                    Manage Backup
                  </Text>
                  <Text
                    style={{
                      ...CommonStyles.headerTitlesInfoText,
                      marginLeft: 25,
                    }}
                  >
                    The wallet backup is not complete. Please complete the setup
                    to safeguard against loss of funds
                  </Text>
                  <KnowMoreButton
                    onpress={() => {
                      (WalletBackupAndRecoveryBottomSheet as any).current.snapTo(
                        1,
                      );
                    }}
                    containerStyle={{ marginTop: 10, marginLeft: 25 }}
                    textStyle={{}}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {overallHealth ? (
                    <HomePageShield
                      circleShadowColor={Colors.borderColor}
                      shieldImage={require('../../assets/images/icons/protector_gray.png')}
                      shieldStatus={overallHealth.overallStatus}
                    />
                  ) : (
                      <HomePageShield
                        circleShadowColor={Colors.borderColor}
                        shieldImage={require('../../assets/images/icons/protector_gray.png')}
                        shieldStatus={0}
                      />
                    )}
                </View>
              </View>
              <View style={{ marginBottom: 10 }}>
                {pageData.map((item, index) => {
                  return (
                    <View style={{}}>
                      <TouchableOpacity
                        onPress={() => {
                          if (item.type == 'secondaryDevice') {
                            props.navigation.navigate(
                              'SecondaryDeviceHistory',
                              {
                                selectedStatus: item.status,
                                selectedTime: getTime(item.time),
                                selectedTitle: getCardTitle(item),
                                updateAutoHighlightFlags: () =>
                                  setAutoHighlightFlags({
                                    ...autoHighlightFlags,
                                    secondaryDevice: true,
                                  }),
                              },
                            );
                          } else if (item.type == 'contact1') {
                            props.navigation.navigate('TrustedContactHistory', {
                              selectedStatus: item.status,
                              selectedTime: getTime(item.time),
                              selectedTitle: item.title,
                              updateAutoHighlightFlags: () =>
                                setAutoHighlightFlags({
                                  ...autoHighlightFlags,
                                  trustedContact1: true,
                                }),
                              activateReshare:
                                autoHighlightFlags.trustedContact1,
                            });
                          } else if (item.type == 'contact2') {
                            props.navigation.navigate('TrustedContactHistory', {
                              selectedStatus: item.status,
                              selectedTime: getTime(item.time),
                              selectedTitle: item.title,
                              updateAutoHighlightFlags: () =>
                                setAutoHighlightFlags({
                                  ...autoHighlightFlags,
                                  trustedContact2: true,
                                }),
                              activateReshare:
                                autoHighlightFlags.trustedContact2,
                            });
                          } else if (item.type === 'copy1') {
                            props.navigation.navigate('PersonalCopyHistory', {
                              selectedStatus: item.status,
                              selectedTime: getTime(item.time),
                              selectedTitle: item.title,
                              selectedPersonalCopy: item,
                              updateAutoHighlightFlags: () =>
                                setAutoHighlightFlags({
                                  ...autoHighlightFlags,
                                  personalCopy1: true,
                                }),
                            });
                          } else if (item.type == 'copy2') {
                            props.navigation.navigate('PersonalCopyHistory', {
                              selectedStatus: item.status,
                              selectedTime: getTime(item.time),
                              selectedTitle: item.title,
                              selectedPersonalCopy: item,
                              updateAutoHighlightFlags: () =>
                                setAutoHighlightFlags({
                                  ...autoHighlightFlags,
                                  personalCopy2: true,
                                }),
                            });
                          } else if (item.type == 'security') {
                            props.navigation.navigate(
                              'SecurityQuestionHistory',
                              {
                                selectedStatus: item.status,
                                selectedTime: getTime(item.time),
                                selectedTitle: getCardTitle(item),
                                updateAutoHighlightFlags: () =>
                                  setAutoHighlightFlags({
                                    ...autoHighlightFlags,
                                    securityAns: true,
                                  }),
                              },
                            );
                          }
                        }}
                        style={{
                          ...styles.manageBackupCard,
                          borderColor: getStatusIcon(item).color,
                          elevation:
                            selectedType && item.type == selectedType ? 10 : 0,
                          shadowColor:
                            selectedType && item.type == selectedType
                              ? Colors.borderColor
                              : Colors.white,
                          shadowOpacity:
                            selectedType && item.type == selectedType ? 10 : 0,
                          shadowOffset:
                            selectedType && item.type == selectedType
                              ? { width: 0, height: 10 }
                              : { width: 0, height: 0 },
                          shadowRadius:
                            selectedType && item.type == selectedType ? 10 : 0,
                        }}
                      >
                        {getImageIcon(item)}
                        <View style={{ marginLeft: 15 }}>
                          <Text style={styles.cardTitleText}>
                            {getCardTitle(item)}
                          </Text>
                          <Text style={styles.cardTimeText}>
                            {getCardSubText(item)}
                            {(item.type === 'security' ||
                              (item.type === 'secondaryDevice' &&
                                item.status !== 'Ugly')) && (
                                <Text
                                  style={{
                                    fontFamily: Fonts.FiraSansMediumItalic,
                                    fontWeight: 'bold',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  {getTime(item.time)}
                                </Text>
                              )}
                          </Text>
                        </View>
                        <Image
                          style={styles.cardIconImage}
                          source={getStatusIcon(item).icon}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
            <BottomSheet
              enabledInnerScrolling={true}
              ref={WalletBackupAndRecoveryBottomSheet as any}
              snapPoints={[
                -50,
                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                  ? hp('89%')
                  : hp('89%'),
              ]}
              renderContent={renderWalletBackupAndRecoveryContents}
              renderHeader={renderWalletBackupAndRecoveryHeader}
            />
            <BottomSheet
              enabledInnerScrolling={true}
              ref={RegenerateShareHelperBottomSheet as any}
              snapPoints={[-50, hp('95%')]}
              renderContent={renderRegenerateShareHelperContents}
              renderHeader={renderRegenerateShareHelperHeader}
            />
            <BottomSheet
              enabledInnerScrolling={true}
              ref={PersonalCopyQRScannerBottomSheet as any}
              snapPoints={[-30, hp('90%')]}
              renderContent={renderPersonalCopyConfirmModalContent}
              renderHeader={renderPersonalCopyConfirmModalHeader}
            />
            <BottomSheet
              enabledInnerScrolling={true}
              ref={SecondaryDeviceHistoryBottomSheet as any}
              snapPoints={[-30, hp('90%')]}
              renderContent={renderSecondaryDeviceHistoryContent}
              renderHeader={renderSecondaryDeviceHistoryHeader}
            />
            <BottomSheet
              enabledInnerScrolling={true}
              ref={PersonalCopyHistoryBottomSheet as any}
              snapPoints={[-30, hp('90%')]}
              renderContent={renderPersonalCopyHistoryContent}
              renderHeader={renderPersonalCopyHistoryHeader}
            />
            <BottomSheet
              enabledInnerScrolling={true}
              ref={SecurityQuestionHistoryBottomSheet as any}
              snapPoints={[-30, hp('90%')]}
              renderContent={renderSecurityQuestionHistoryContent}
              renderHeader={renderSecurityQuestionHistoryHeader}
            />
            <BottomSheet
              enabledInnerScrolling={true}
              ref={ChangeBottomSheet as any}
              snapPoints={[
                -50,
                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                  ? hp('37%')
                  : hp('45%'),
              ]}
              renderContent={renderChangeContent}
              renderHeader={renderChangeHeader}
            />
            <BottomSheet
              enabledInnerScrolling={true}
              ref={ReshareBottomSheet as any}
              snapPoints={[
                -50,
                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                  ? hp('37%')
                  : hp('45%'),
              ]}
              renderContent={renderReshareContent}
              renderHeader={renderReshareHeader}
            />
            <BottomSheet
              enabledInnerScrolling={true}
              ref={ConfirmBottomSheet as any}
              snapPoints={[
                -50,
                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                  ? hp('37%')
                  : hp('45%'),
              ]}
              renderContent={renderConfirmContent}
              renderHeader={renderConfirmHeader}
            />
            <TouchableOpacity
              disabled={isNextStepDisable}
              onPress={() => nextStep()}
              style={{
                height: wp('10%'),
                width: wp('30%'),
                backgroundColor: Colors.blue,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 5,
                marginLeft: 'auto',
                margin: 15,
                position: 'absolute',
                bottom: 0,
                marginBottom: 20,
                left: wp('65%'),
                marginRight: 20,
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                }}
              >
                {autoHighlightFlags.secondaryDevice &&
                  autoHighlightFlags.trustedContact1 &&
                  autoHighlightFlags.trustedContact2 &&
                  autoHighlightFlags.personalCopy1 &&
                  autoHighlightFlags.personalCopy2 &&
                  autoHighlightFlags.securityAns
                  ? 'Confirm Shares'
                  : 'Complete Setup'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
            <ScrollView
              contentContainerStyle={{
                backgroundColor: Colors.backgroundColor,
              }}
              refreshControl={<RefreshControl refreshing={!is_initiated} />}
            />
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shieldImage: {
    width: wp('16%'),
    height: wp('25%'),
    resizeMode: 'contain',
    marginLeft: 'auto',
    marginRight: 20,
  },
  manageBackupCard: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.white,
  },
  cardImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  cardTitleText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  cardTimeText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(10),
  },
  cardIconImage: {
    width: 12,
    height: 14,
    resizeMode: 'contain',
    marginLeft: 'auto',
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
  },
  modalHeaderContainer: {
    borderTopLeftRadius: 10,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightWidth: 1,
    borderTopWidth: 1,
    backgroundColor: Colors.blue,
    borderLeftColor: Colors.blue,
    borderRightColor: Colors.blue,
    borderTopColor: Colors.blue,
  },
  healthOfAppText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(20),
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  healthOfAppDivider: {
    backgroundColor: Colors.homepageButtonColor,
    height: 1,
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    marginBottom: hp('1%'),
  }
});
