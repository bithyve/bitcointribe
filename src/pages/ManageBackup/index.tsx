import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Image,
  FlatList,
  Platform,
  RefreshControl,
  Alert,
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
import {
  initHealthCheck,
  checkMSharesHealth,
  checkPDFHealth,
} from '../../store/actions/sss';
import S3Service from '../../bitcoin/services/sss/S3Service';
import HomePageShield from '../../components/HomePageShield';
import Icons from '../../common/Icons';
import ErrorModalContents from '../../components/ErrorModalContents';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import WalletBackupAndRecoveryContents from '../../components/Helper/WalletBackupAndRecoveryContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import { fetchSSSFromDB } from '../../store/actions/storage';
import { requestSharePdf } from '../../store/actions/manageBackup';
import RegenerateHealper from '../../components/Helper/RegenerateHealper';
import { ModalShareIntent } from 'hexaComponents/Modal/ManageBackup';
import Singleton from 'hexaCommon/Singleton';
import ModalHeader from '../../components/ModalHeader';
import SecondaryDevice from './SecondaryDevice';
import HealthCheckSecurityQuestion from './HealthCheckSecurityQuestion';
import SecondaryDeviceHealthCheck from '../HealthCheck/SecondaryDeviceHealthCheck';
import CloudHealthCheck from '../HealthCheck/CloudHealthCheck';
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';

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
  let [
    secondaryDeviceAutoHighlightFlags,
    setSecondaryDeviceAutoHighlightFlags,
  ] = useState('');
  let [
    personalCopy1AutoHighlightFlags,
    setPersonalCopy1AutoHighlightFlags,
  ] = useState('');
  let [
    personalCopy2AutoHighlightFlags,
    setPersonalCopy2AutoHighlightFlags,
  ] = useState('');
  let [securityAutoHighlightFlags, setSecurityAutoHighlightFlags] = useState(
    'true',
  );
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
  const [selectedPersonalCopy, setSelectedPersonalCopy] = useState();
  const [secondaryDeviceHistory, setSecondaryDeviceHistory] = useState([
    {
      id: 1,
      title: 'Recovery Secret Not Accessible',
      date: '19 May ‘19, 11:00am',
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Secret Received',
      date: '1 June ‘19, 9:00am',
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Secret In-Transit',
      date: '30 May ‘19, 11:00am',
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Secret Accessible',
      date: '24 May ‘19, 5:00pm',
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 5,
      title: 'Recovery Secret In-Transit',
      date: '20 May ‘19, 11:00am',
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 6,
      title: 'Recovery Secret Not Accessible',
      date: '19 May ‘19, 11:00am',
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
  ]);

  const [
    WalletBackupAndRecoveryBottomSheet,
    setWalletBackupAndRecoveryBottomSheet,
  ] = useState(React.createRef());
  const [secondaryDeviceBottomSheet, setSecondaryDeviceBottomSheet] = useState(
    React.createRef(),
  );
  const [
    CommunicationModeBottomSheet,
    setCommunicationModeBottomSheet,
  ] = useState(React.createRef());
  // const [
  //   SecurityQuestionBottomSheet,
  //   setSecurityQuestionBottomSheet,
  // ] = useState(React.createRef());
  // const [
  //   HealthCheckSuccessBottomSheet,
  //   setHealthCheckSuccessBottomSheet,
  // ] = useState(React.createRef());
  const [
    RegenerateShareHelperBottomSheet,
    setRegenerateShareHelperBottomSheet,
  ] = useState(React.createRef());
  // const [
  //   PersonalCopy1ShareBottomSheet,
  //   setPersonalCopy1ShareBottomSheet,
  // ] = useState(React.createRef());
  // const [
  //   PersonalCopy2ShareBottomSheet,
  //   setPersonalCopy2ShareBottomSheet,
  // ] = useState(React.createRef());
  const [
    shareOtpWithTrustedContactBottomSheet,
    setShareOtpWithTrustedContactBottomSheet,
  ] = useState(React.createRef());
  const [selectedType, setSelectedType] = useState('');
  const [contacts, setContacts] = useState([]);
  const [isSecretShared1, setIsSecretShared1] = useState(false);
  const [isSecretShared2, setIsSecretShared2] = useState(false);
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
  const s3Service: S3Service = useSelector(state => state.sss.service);
  const { databaseSSS } = useSelector(state => state.storage);
  const [overallHealth, setOverallHealth] = useState();
  const health = useSelector(state => state.sss.overallHealth);
  //const { overallHealth } = useSelector( state => state.sss );
  const healthLoading = useSelector(
    state => state.sss.loading.checkMSharesHealth,
  );

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

  const getIconByStatus = status => {
    if (status == 'Ugly') {
      return require('../../assets/images/icons/icon_error_red.png');
    } else if (status == 'Bad') {
      return require('../../assets/images/icons/icon_error_yellow.png');
    } else if (status == 'Good') {
      return require('../../assets/images/icons/icon_check.png');
    }
  };

  // const renderSecondaryDeviceContents = () => {
  //   return (
  //     <SecondaryDevice
  //       onPressOk={() => {
  //         setAutoHighlightFlags({
  //           ...autoHighlightFlags,
  //           secondaryDevice: true,
  //         });
  //         secondaryDeviceBottomSheet.current.snapTo(0);
  //       }}
  //       onPressBack={() => {
  //         setAutoHighlightFlags({
  //           ...autoHighlightFlags,
  //           secondaryDevice: true,
  //         });
  //         secondaryDeviceBottomSheet.current.snapTo(0);
  //       }}
  //     />
  //   );
  // };

  // function renderSecondaryDeviceHeader() {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         (secondaryDeviceBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }

  // const renderPersonalCopy1ShareModalContent = () => {
  //   const selectedPersonalCopy = {
  //     title: 'Personal Copy 1',
  //     personalInfo: null,
  //     time: 'never',
  //     status: 'Ugly',
  //     type: 'copy1',
  //     route: 'PersonalCopy',
  //   };
  //   return (
  //     <ModalShareIntent
  //       removeHighlightingFromCard={removeHighlightingFromCard}
  //       selectedPersonalCopy={selectedPersonalCopy}
  //       onPressBack={() => {
  //         (PersonalCopy1ShareBottomSheet as any).current.snapTo(0);
  //         //setArrModalShareIntent({ ...arrModalShareIntent, snapTop: 0 });
  //       }}
  //       onPressShare={() => {
  //         // setAutoHighlightFlags({ ...autoHighlightFlags, personalCopy1: true }); // autoHighlightFlags turning up to be null
  //         setAutoHighlightFlags({
  //           secondaryDevice: true,
  //           trustedContact1: true,
  //           trustedContact2: true,
  //           personalCopy1: true,
  //           personalCopy2: false,
  //           securityAns: true,
  //         });

  //         (PersonalCopy1ShareBottomSheet as any).current.snapTo(0);

  //         // setArrModalShareIntent({ ...arrModalShareIntent, snapTop: 0 });
  //         // let pdfShared = JSON.parse(await AsyncStorage.getItem('pdfShared'));
  //         // pdfShared = pdfShared ? pdfShared : {};
  //         // const updatedPDFShared = {
  //         //   ...pdfShared,
  //         //   [type == 'copy2' ? 4 : 3]: true,
  //         // };
  //         // await AsyncStorage.setItem(
  //         //   'pdfShared',
  //         //   JSON.stringify({
  //         //     ...updatedPDFShared,
  //         //   }),
  //         // );

  //         // if (
  //         //   arrModalShareIntent.item &&
  //         //   arrModalShareIntent.item.type == 'copy1'
  //         // ) {
  //         //   AsyncStorage.setItem('personalCopy1AutoHighlightFlags', 'true');
  //         // } else if (
  //         //   arrModalShareIntent.item &&
  //         //   arrModalShareIntent.item.type == 'copy2'
  //         // ) {
  //         //   AsyncStorage.setItem('personalCopy2AutoHighlightFlags', 'true');
  //         // }
  //         // setSelectedType('');
  //       }}
  //     />
  //   );
  // };

  // const renderPersonalCopy1ShareModalHeader = useCallback(() => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         (PersonalCopy1ShareBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, []);

  // const renderPersonalCopy2ShareModalContent = () => {
  //   const selectedPersonalCopy = {
  //     title: 'Personal Copy 2',
  //     personalInfo: null,
  //     time: 'never',
  //     status: 'Ugly',
  //     type: 'copy2',
  //     route: 'PersonalCopy',
  //   };
  //   return (
  //     <ModalShareIntent
  //       removeHighlightingFromCard={removeHighlightingFromCard}
  //       selectedPersonalCopy={selectedPersonalCopy}
  //       onPressBack={() => {
  //         (PersonalCopy2ShareBottomSheet as any).current.snapTo(0);

  //         //setArrModalShareIntent({ ...arrModalShareIntent, snapTop: 0 });
  //       }}
  //       onPressShare={() => {
  //         (PersonalCopy2ShareBottomSheet as any).current.snapTo(0);
  //         // setAutoHighlightFlags({ ...autoHighlightFlags, personalCopy2: true });

  //         setAutoHighlightFlags({
  //           secondaryDevice: true,
  //           trustedContact1: true,
  //           trustedContact2: true,
  //           personalCopy1: true,
  //           personalCopy2: true,
  //           securityAns: true,
  //         });

  //         // setArrModalShareIntent({ ...arrModalShareIntent, snapTop: 0 });
  //         // let pdfShared = JSON.parse(await AsyncStorage.getItem('pdfShared'));
  //         // pdfShared = pdfShared ? pdfShared : {};
  //         // const updatedPDFShared = {
  //         //   ...pdfShared,
  //         //   [type == 'copy2' ? 4 : 3]: true,
  //         // };
  //         // await AsyncStorage.setItem(
  //         //   'pdfShared',
  //         //   JSON.stringify({
  //         //     ...updatedPDFShared,
  //         //   }),
  //         // );

  //         // if (
  //         //   arrModalShareIntent.item &&
  //         //   arrModalShareIntent.item.type == 'copy1'
  //         // ) {
  //         //   AsyncStorage.setItem('personalCopy1AutoHighlightFlags', 'true');
  //         // } else if (
  //         //   arrModalShareIntent.item &&
  //         //   arrModalShareIntent.item.type == 'copy2'
  //         // ) {
  //         //   AsyncStorage.setItem('personalCopy2AutoHighlightFlags', 'true');
  //         // }
  //         // setSelectedType('');
  //       }}
  //     />
  //   );
  // };

  // const renderPersonalCopy2ShareModalHeader = useCallback(() => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         (PersonalCopy2ShareBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, []);

  const renderWalletBackupAndRecoveryContents = () => {
    return (
      <WalletBackupAndRecoveryContents
        onPressManageBackup={() => {
          WalletBackupAndRecoveryBottomSheet.current.snapTo(0);
        }}
        onSkip={() => {
          WalletBackupAndRecoveryBottomSheet.current.snapTo(0);
        }}
        onStartBackup={() => {
          WalletBackupAndRecoveryBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderWalletBackupAndRecoveryHeader = () => {
    return (
      <ModalHeader
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          WalletBackupAndRecoveryBottomSheet.current.snapTo(0);
        }}
      />
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

  // const renderSecurityQuestionContent = () => {
  //   return (
  //     <HealthCheckSecurityQuestion
  //       bottomSheetRef={SecurityQuestionBottomSheet}
  //       onPressConfirm={async () => {
  //         SecurityQuestionBottomSheet.current.snapTo(0);
  //         (HealthCheckSuccessBottomSheet as any).current.snapTo(1);
  //         await AsyncStorage.setItem('securityAutoHighlightFlags', 'true');
  //         setTimeout(() => {
  //           setSelectedType('');
  //         }, 2);
  //       }}
  //     />
  //   );
  // };
  // const renderSecurityQuestionHeader = () => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         (SecurityQuestionBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // };

  // const renderHealthCheckSuccessModalContent = () => {
  //   return (
  //     <ErrorModalContents
  //       modalRef={HealthCheckSuccessBottomSheet}
  //       title={'Health Check Successful'}
  //       info={'Questions Successfully Backed Up'}
  //       note={'Hexa will remind you to help\nremember the answers'}
  //       proceedButtonText={'View Health'}
  //       isIgnoreButton={false}
  //       onPressProceed={() => {
  //         (HealthCheckSuccessBottomSheet as any).current.snapTo(0);
  //         dispatch(checkMSharesHealth());
  //       }}
  //       isBottomImage={true}
  //     />
  //   );
  // };

  // const renderHealthCheckSuccessModalHeader = () => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         onPressOnHealthCheckSuccess();
  //       }}
  //     />
  //   );
  // };

  const renderSecondaryDeviceHistoryContent = () => {
    return (
      <SecondaryDeviceHealthCheck
        data={secondaryDeviceHistory}
        title={'Secondary Device'}
        time={selectedTime}
        status={selectedStatus}
        reshareInfo={'consectetur Lorem ipsum dolor sit amet, consectetur sit '}
        onPressConfirm={() => {
          ConfirmBottomSheet.current.snapTo(1);
        }}
        onPressReshare={() => {
          ReshareBottomSheet.current.snapTo(1);
        }}
        modalRef={SecondaryDeviceHistoryBottomSheet}
        onPressBack={() => {
          SecondaryDeviceHistoryBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderSecondaryDeviceHistoryHeader = () => {
    return (
      <ModalHeader
        backgroundColor={Colors.backgroundColor}
        onPressHeader={() => {
          SecondaryDeviceHistoryBottomSheet.current.snapTo(0);
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
        reshareInfo={'consectetur Lorem ipsum dolor sit amet, consectetur sit '}
        onPressConfirm={() => {
          ConfirmBottomSheet.current.snapTo(1);
        }}
        onPressReshare={() => {
          ReshareBottomSheet.current.snapTo(1);
        }}
        modalRef={PersonalCopyHistoryBottomSheet}
        onPressBack={() => {
          PersonalCopyHistoryBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderPersonalCopyHistoryHeader = () => {
    return (
      <ModalHeader
        backgroundColor={Colors.backgroundColor}
        onPressHeader={() => {
          PersonalCopyHistoryBottomSheet.current.snapTo(0);
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
          ConfirmBottomSheet.current.snapTo(1);
        }}
        modalRef={SecurityQuestionHistoryBottomSheet}
        onPressBack={() => {
          SecurityQuestionHistoryBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderSecurityQuestionHistoryHeader = () => {
    return (
      <ModalHeader
        backgroundColor={Colors.backgroundColor}
        onPressHeader={() => {
          SecurityQuestionHistoryBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderChangeContent = () => {
    return (
      <ErrorModalContents
        modalRef={ChangeBottomSheet}
        title={'Change your\nTrusted Contact'}
        info={'Having problems with your Trusted Contact'}
        note={
          'You can change the Trusted Contact you selected to share your Recovery Secret'
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
      title = 'Reshare Recovery Secret\nwith Secondary Device';
      info = 'Did your secondary device not receive the Recovery Secret?';
      note = 'You can reshare the Recovery Secret with your \nSecondary Device';
    } else if (
      SelectTypeToReshare == 'contact1' ||
      SelectTypeToReshare == 'contact2'
    ) {
      title = 'Reshare Recovery Secret\nwith Trusted Contact';
      info = 'Did your contact not receive the Recovery Secret?';
      note =
        'You can reshare the Recovery Secret with your Trusted\nContact via Email or Sms';
    } else if (
      SelectTypeToReshare == 'copy1' ||
      SelectTypeToReshare == 'copy2'
    ) {
      title = 'Reshare Recovery Secret\nwith Personal Copy';
      info = 'Did your personal Copies not receive the Recovery Secret?';
      note = 'You can reshare the Recovery Secret with your \nPersonal Copy';
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
      SecondaryDeviceHistoryBottomSheet.current.snapTo(0);
    } else if (SelectTypeToReshare == 'contact1') {
      setTimeout(() => {
        setChosenContact(contacts[0]);
        setChosenContactIndex(1);
      }, 2);
      CommunicationModeBottomSheet.current.snapTo(1);
    } else if (SelectTypeToReshare == 'contact2') {
      setTimeout(() => {
        setChosenContact(contacts[1]);
        setChosenContactIndex(2);
      }, 2);
      CommunicationModeBottomSheet.current.snapTo(1);
    } else if (SelectTypeToReshare == 'copy1') {
      PersonalCopyHistoryBottomSheet.current.snapTo(0);
      // (PersonalCopy1ShareBottomSheet as any).current.snapTo(1);
    } else if (SelectTypeToReshare == 'copy2') {
      PersonalCopyHistoryBottomSheet.current.snapTo(0);
      // (PersonalCopy1ShareBottomSheet as any).current.snapTo(1);
    } else if (SelectTypeToReshare == 'security') {
      // SecurityQuestionBottomSheet.current.snapTo(1);
      SecurityQuestionHistoryBottomSheet.current.snapTo(0);
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
      title = 'Confirm Recovery Secret\nwith Secondary Device';
      info = 'Your Secondary Device seems away from their Hexa App';
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Secret';
      proceedButtonText = 'Send a message';
    } else if (
      SelectTypeToReshare == 'contact1' ||
      SelectTypeToReshare == 'contact2'
    ) {
      title = 'Confirm Recovery Secret\nwith Trusted Contact';
      info = 'Your Trusted Contact seems away from their Hexa App';
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Secret';
      proceedButtonText = 'Confirm';
    } else if (
      SelectTypeToReshare == 'copy1' ||
      SelectTypeToReshare == 'copy2'
    ) {
      title = 'Confirm Recovery Secret\nwith Personal Copy';
      info = 'Your Trusted Contact seems away from their Hexa App';
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Secret';
      proceedButtonText = 'Confirm';
    } else if (SelectTypeToReshare == 'security') {
      title = 'Confirm Recovery Secret\nwith Security Question';
      info = 'Your Security Question seems away from their Hexa App';
      note =
        'You can send them a reminder to open their app to\nensure they have your Recovery Secret';
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
      SecondaryDeviceHistoryBottomSheet.current.snapTo(0);
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
      PersonalCopyHistoryBottomSheet.current.snapTo(0);
      (PersonalCopyQRScannerBottomSheet as any).current.snapTo(1);
    } else if (SelectTypeToReshare == 'copy2') {
      setTimeout(() => {
        setLoadCamera(true);
      }, 2);
      PersonalCopyHistoryBottomSheet.current.snapTo(0);
      (PersonalCopyQRScannerBottomSheet as any).current.snapTo(1);
    } else if (SelectTypeToReshare == 'security') {
      // SecurityQuestionBottomSheet.current.snapTo(1);
      SecurityQuestionHistoryBottomSheet.current.snapTo(0);
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
        onPressProceed={() => {}}
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

  const getScannerData = data => {
    console.log('data', data);
  };

  // const removeHighlightingFromCard = () => {
  //   setSelectedType('');
  // };

  // const onPressOnHealthCheckSuccess = async () => {
  //   (HealthCheckSuccessBottomSheet as any).current.snapTo(0);
  //   await AsyncStorage.setItem('securityAutoHighlightFlags', 'true');
  // };

  const secretSharedTrustedContact1 = isSecretShared1 => {
    setIsSecretShared1(isSecretShared1);
  };

  const secretSharedTrustedContact2 = isSecretShared2 => {
    setIsSecretShared2(isSecretShared2);
  };

  const [autoHighlightFlags, setAutoHighlightFlags] = useState({
    secondaryDevice: false,
    trustedContact1: false,
    trustedContact2: false,
    personalCopy1: false,
    personalCopy2: false,
    securityAns: false,
  });

  const autoHighlight = async () => {
    const {
      secondaryDevice,
      trustedContact1,
      trustedContact2,
      personalCopy1,
      personalCopy2,
      securityAns,
    } = autoHighlightFlags;

    console.log('At AutoHighlight');
    console.log({ autoHighlightFlags });

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
    } else {
      if (overallHealth) {
        if (overallHealth.sharesInfo[0].shareStage === 'Ugly') {
          setSelectedType('secondaryDevice');
        } else if (overallHealth.sharesInfo[1].shareStage === 'Ugly') {
          setSelectedType('contact1');
        } else if (overallHealth.sharesInfo[2].shareStage === 'Ugly') {
          setSelectedType('contact2');
        } else if (overallHealth.sharesInfo[3].shareStage === 'Ugly') {
          setSelectedType('copy1');
        } else if (overallHealth.sharesInfo[4].shareStage === 'Ugly') {
          setSelectedType('copy2');
        } else if (overallHealth.qaStatus.stage === 'Ugly') {
          setSelectedType('security');
        } else if (overallHealth.sharesInfo[0].shareStage === 'Bad') {
          setSelectedType('secondaryDevice');
        } else if (overallHealth.sharesInfo[1].shareStage === 'Bad') {
          setSelectedType('contact1');
        } else if (overallHealth.sharesInfo[2].shareStage === 'Bad') {
          setSelectedType('contact2');
        } else if (overallHealth.sharesInfo[3].shareStage === 'Bad') {
          setSelectedType('copy1');
        } else if (overallHealth.sharesInfo[4].shareStage === 'Bad') {
          setSelectedType('copy2');
        } else if (overallHealth.qaStatus.stage === 'Bad') {
          setSelectedType('security');
        }
      }
    }
  };

  // console.log({ selectedType });

  const setContactsFromAsync = async () => {
    let contactList = JSON.parse(
      await AsyncStorage.getItem('SelectedContacts'),
    );
    setContacts(contactList);
    if (contactList.length) {
      if (
        contactList.findIndex(value => value && value.type == 'contact1') != -1
      ) {
        pageData[1].personalInfo =
          contactList[
            contactList.findIndex(value => value && value.type == 'contact1')
          ];
      }
      if (
        contactList.findIndex(value => value && value.type == 'contact2') != -1
      ) {
        pageData[2].personalInfo =
          contactList[
            contactList.findIndex(value => value && value.type == 'contact2')
          ];
      }
    }
    setPageData([...pageData]);
  };

  const setAutoHighlightFlagsFromAsync = async () => {
    const highlightFlags = await AsyncStorage.getItem('AutoHighlightFlags');
    if (highlightFlags) {
      setAutoHighlightFlags(JSON.parse(highlightFlags));
    } else {
      const autoHighlightFlags = {
        secondaryDevice: false,
        trustedContact1: false,
        trustedContact2: false,
        personalCopy1: false,
        personalCopy2: false,
        securityAns: true, // due to auto-health (during initialization)
      };
      setAutoHighlightFlags(autoHighlightFlags);
      await AsyncStorage.setItem(
        'AutoHighlightFlags',
        JSON.stringify(autoHighlightFlags),
      );
    }
  };

  // useEffect(() => {
  //   let focusListener = props.navigation.addListener('didFocus', () => {
  //     setContactsFromAsync();
  //     setAutoHighlightFlagsFromAsync();
  //   });
  //   return () => {
  //     focusListener.remove();
  //   };
  // }, []);

  useEffect(() => {
    setContactsFromAsync();
    setAutoHighlightFlagsFromAsync();
  }, []);

  useEffect(() => {
    if (autoHighlightFlags) {
      autoHighlight();
      AsyncStorage.setItem(
        'AutoHighlightFlags',
        JSON.stringify(autoHighlightFlags),
      );
    }
  }, [autoHighlightFlags]);

  // const setSetupFlowAsync = async () => {
  //   let secondaryDeviceAutoHighlightFlags = await AsyncStorage.getItem(
  //     'secondaryDeviceAutoHighlightFlags',
  //   );
  //   let contact1AutoHighlightFlags = await AsyncStorage.getItem(
  //     'contact1AutoHighlightFlags',
  //   );
  //   let contact2AutoHighlightFlags = await AsyncStorage.getItem(
  //     'contact2AutoHighlightFlags',
  //   );
  //   let personalCopy1AutoHighlightFlags = await AsyncStorage.getItem(
  //     'personalCopy1AutoHighlightFlags',
  //   );
  //   let personalCopy2AutoHighlightFlags = await AsyncStorage.getItem(
  //     'personalCopy2AutoHighlightFlags',
  //   );
  //   let securityAutoHighlightFlags = await AsyncStorage.getItem(
  //     'securityAutoHighlightFlags',
  //   );

  //   console.log('----Setup Flow Sync----');
  //   console.log({
  //     secondaryDeviceAutoHighlightFlags,
  //     contact1AutoHighlightFlags,
  //     contact2AutoHighlightFlags,
  //     personalCopy1AutoHighlightFlags,
  //     personalCopy2AutoHighlightFlags,
  //     securityAutoHighlightFlags,
  //   });
  //   setSecondaryDeviceAutoHighlightFlags(secondaryDeviceAutoHighlightFlags);
  //   setContact1AutoHighlightFlags(contact1AutoHighlightFlags);
  //   setContact2AutoHighlightFlags(contact2AutoHighlightFlags);
  //   setPersonalCopy1AutoHighlightFlags(personalCopy1AutoHighlightFlags);
  //   setPersonalCopy2AutoHighlightFlags(personalCopy2AutoHighlightFlags);
  //   setSecurityAutoHighlightFlags(securityAutoHighlightFlags);
  // };

  useEffect(() => {
    // (async () => {
    //   await setSetupFlowAsync();
    //   console.log('Executing autoHighlight');
    //   autoHighlightOptions();
    // })();

    // getOverAllHealth();
    // // HC down-streaming
    // if (s3Service) {
    //   const { healthCheckInitialized } = s3Service.sss;
    //   if (healthCheckInitialized) {
    //     dispatch(checkMSharesHealth());
    //   }
    // }
    dispatch(fetchSSSFromDB());
    // if (!s3Service.sss.healthCheckInitialized) dispatch(initHealthCheck());
    checkNShowHelperModal();
  }, []);

  // const getOverAllHealth = async () => {
  //   const storedHealth = await AsyncStorage.getItem('overallHealth');
  //   if (storedHealth) {
  //     setOverallHealth(JSON.parse(storedHealth));
  //   }
  // };

  useEffect(() => {
    if (health) setOverallHealth(health);
  }, [health]);

  useEffect(() => {
    if (overallHealth) {
      setIsNextStepDisable(false);
      const updatedPageData = [...pageData];
      updatedPageData.forEach(data => {
        switch (data.title) {
          case 'Secondary Device':
            data.status = overallHealth.sharesInfo[0].shareStage;
            data.time = overallHealth.sharesInfo[0].updatedAt;
            break;

          case 'Trusted Contact 1':
            data.status = overallHealth.sharesInfo[1].shareStage;
            data.time = overallHealth.sharesInfo[1].updatedAt;
            break;

          case 'Trusted Contact 2':
            data.status = overallHealth.sharesInfo[2].shareStage;
            data.time = overallHealth.sharesInfo[2].updatedAt;
            break;

          case 'Personal Copy 1':
            data.status = overallHealth.sharesInfo[3].shareStage;
            data.time = overallHealth.sharesInfo[3].updatedAt;
            break;

          case 'Personal Copy 2':
            data.status = overallHealth.sharesInfo[4].shareStage;
            data.time = overallHealth.sharesInfo[4].updatedAt;
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
        WalletBackupAndRecoveryBottomSheet.current.snapTo(1);
      }, 1000);
    }
  };

  // const autoHighlightOptions = async () => {
  //   let contactList = JSON.parse(
  //     await AsyncStorage.getItem('SelectedContacts'),
  //   );
  //   setContacts(contactList);
  //   // console.log('----Auto Highlightt Option----');
  //   // console.log({
  //   //   secondaryDeviceAutoHighlightFlags,
  //   //   contact1AutoHighlightFlags,
  //   //   contact2AutoHighlightFlags,
  //   //   personalCopy1AutoHighlightFlags,
  //   //   personalCopy2AutoHighlightFlags,
  //   //   securityAutoHighlightFlags,
  //   // });
  //   if (secondaryDeviceAutoHighlightFlags != 'true') {
  //     setSelectedType('secondaryDevice');
  //   } else if (contact1AutoHighlightFlags != 'true') {
  //     setSelectedType('contact1');
  //   } else if (contact2AutoHighlightFlags != 'true') {
  //     setSelectedType('contact2');
  //   } else if (personalCopy1AutoHighlightFlags != 'true') {
  //     setSelectedType('copy1');
  //   } else if (personalCopy2AutoHighlightFlags != 'true') {
  //     setSelectedType('copy2');
  //   } else if (securityAutoHighlightFlags != 'true') {
  //     setSelectedType('security');
  //   } else {
  //     if (overallHealth) {
  //       if (overallHealth.sharesInfo[0].shareStage === 'Ugly') {
  //         setSelectedType('secondaryDevice');
  //       } else if (overallHealth.sharesInfo[1].shareStage === 'Ugly') {
  //         setSelectedType('contact1');
  //       } else if (overallHealth.sharesInfo[2].shareStage === 'Ugly') {
  //         setSelectedType('contact2');
  //       } else if (overallHealth.sharesInfo[3].shareStage === 'Ugly') {
  //         setSelectedType('copy1');
  //       } else if (overallHealth.sharesInfo[4].shareStage === 'Ugly') {
  //         setSelectedType('copy2');
  //       } else if (overallHealth.qaStatus.stage === 'Ugly') {
  //         setSelectedType('security');
  //       } else if (overallHealth.sharesInfo[0].shareStage === 'Bad') {
  //         setSelectedType('secondaryDevice');
  //       } else if (overallHealth.sharesInfo[1].shareStage === 'Bad') {
  //         setSelectedType('contact1');
  //       } else if (overallHealth.sharesInfo[2].shareStage === 'Bad') {
  //         setSelectedType('contact2');
  //       } else if (overallHealth.sharesInfo[3].shareStage === 'Bad') {
  //         setSelectedType('copy1');
  //       } else if (overallHealth.sharesInfo[4].shareStage === 'Bad') {
  //         setSelectedType('copy2');
  //       } else if (overallHealth.qaStatus.stage === 'Bad') {
  //         setSelectedType('security');
  //       }
  //     }
  //   }
  //   if (contactList.length) {
  //     if (contactList.findIndex(value => value.type == 'contact1') != -1) {
  //       pageData[1].personalInfo =
  //         contactList[contactList.findIndex(value => value.type == 'contact1')];
  //     }
  //     if (contactList.findIndex(value => value.type == 'contact2') != -1) {
  //       pageData[2].personalInfo =
  //         contactList[contactList.findIndex(value => value.type == 'contact2')];
  //     }
  //   }
  //   setPageData(pageData);
  // };

  // const nextStep = async () => {
  //   if (secondaryDeviceAutoHighlightFlags != 'true') {
  //     secondaryDeviceBottomSheet.current.snapTo(1);
  //   } else if (contact1AutoHighlightFlags != 'true') {
  //     setTimeout(() => {
  //       setLoadOnTrustedContactBottomSheet(true);
  //     }, 10);
  //   } else if (contact2AutoHighlightFlags != 'true') {
  //     setTimeout(() => {
  //       setLoadOnTrustedContactBottomSheet(true);
  //     }, 10);
  //   } else if (personalCopy1AutoHighlightFlags != 'true') {
  //     (PersonalCopyShareBottomSheet as any).current.snapTo(1);
  //   } else if (personalCopy2AutoHighlightFlags != 'true') {
  //     (PersonalCopyShareBottomSheet as any).current.snapTo(1);
  //   } else if (securityAutoHighlightFlags != 'true') {
  //     SecurityQuestionBottomSheet.current.snapTo(1);
  //   }
  //   else {
  //     if (overallHealth) {
  //       if (overallHealth.sharesInfo[0].shareStage === 'Ugly') {
  //         // Secondary device
  //         ConfirmBottomSheet.current.snapTo(1);
  //       }
  //       else if (overallHealth.sharesInfo[1].shareStage === 'Ugly') {
  //         setSelectedTime(getTime(pageData[1].time));
  //         setSelectedStatus(pageData[1].status);
  //         setSelectTypeToReshare('contact1');
  //         //Trusted contact 1
  //         ConfirmBottomSheet.current.snapTo(1);
  //       } else if (overallHealth.sharesInfo[2].shareStage === 'Ugly') {
  //         setSelectedTime(getTime(pageData[2].time));
  //         setSelectedStatus(pageData[2].status);
  //         setSelectTypeToReshare('contact2');
  //         //Trusted contact 2
  //         ConfirmBottomSheet.current.snapTo(1);
  //       } else if (overallHealth.sharesInfo[3].shareStage === 'Ugly') {
  //         setSelectedTime(getTime(pageData[3].time));
  //         setSelectedStatus(pageData[3].status);
  //         setSelectTypeToReshare('copy1');
  //         //personal copy 1
  //         setTimeout(() => {
  //           setLoadCamera(true);
  //         }, 2);
  //         ConfirmBottomSheet.current.snapTo(1);
  //       } else if (overallHealth.sharesInfo[4].shareStage === 'Ugly') {
  //         setSelectedTime(getTime(pageData[4].time));
  //         setSelectedStatus(pageData[4].status);
  //         setSelectTypeToReshare('copy2');
  //         //personal copy 2
  //         setTimeout(() => {
  //           setLoadCamera(true);
  //         }, 2);
  //         ConfirmBottomSheet.current.snapTo(1);
  //       } else if (overallHealth.qaStatus.stage === 'Ugly') {
  //         setSelectedTime(getTime(pageData[5].time));
  //         setSelectedStatus(pageData[5].status);
  //         setSelectTypeToReshare('security');
  //         // Security question
  //         SecurityQuestionBottomSheet.current.snapTo(1);
  //       } else if (overallHealth.sharesInfo[0].shareStage === 'Bad') {
  //         // Secondary device
  //         SecondaryDeviceHistoryBottomSheet.current.snapTo(1);
  //       } else if (overallHealth.sharesInfo[1].shareStage === 'Bad') {
  //         setSelectedTime(getTime(pageData[1].time));
  //         setSelectedStatus(pageData[1].status);
  //         setSelectTypeToReshare('contact1');
  //         //Trusted contact 1
  //         ConfirmBottomSheet.current.snapTo(1);
  //       } else if (overallHealth.sharesInfo[2].shareStage === 'Bad') {
  //         setSelectedTime(getTime(pageData[2].time));
  //         setSelectedStatus(pageData[2].status);
  //         setSelectTypeToReshare('contact2');
  //         //Trusted contact 2
  //         ConfirmBottomSheet.current.snapTo(1);
  //       } else if (overallHealth.sharesInfo[3].shareStage === 'Ugly') {
  //         setSelectedTime(getTime(pageData[3].time));
  //         setSelectedStatus(pageData[3].status);
  //         setSelectTypeToReshare('copy1');
  //         //personal copy 1
  //         setTimeout(() => {
  //           setLoadCamera(true);
  //         }, 2);
  //         ConfirmBottomSheet.current.snapTo(1);
  //       }
  //       else if (overallHealth.sharesInfo[4].shareStage === 'Ugly') {
  //         setSelectedTime(getTime(pageData[4].time));
  //         setSelectedStatus(pageData[4].status);
  //         setSelectTypeToReshare('copy2');
  //         //personal copy 2
  //         setTimeout(() => {
  //           setLoadCamera(true);
  //         }, 2);
  //         ConfirmBottomSheet.current.snapTo(1);
  //       }
  //       else if (overallHealth.qaStatus.stage === 'Bad') {
  //         // Security question
  //         SecurityQuestionBottomSheet.current.snapTo(1);
  //       }
  //     }
  //   }
  // };

  const nextStep = async () => {
    const {
      secondaryDevice,
      trustedContact1,
      trustedContact2,
      personalCopy1,
      personalCopy2,
      securityAns,
    } = autoHighlightFlags;

    if (!secondaryDevice) {
      const data = pageData[0];
      // secondaryDeviceBottomSheet.current.snapTo(1);
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
    } else if (!trustedContact1) {
      props.navigation.navigate('TrustedContactHistory', {
        selectedStatus: pageData[1].status,
        selectedTime: getTime(pageData[1].time),
        selectedTitle: pageData[1].title,
        updateAutoHighlightFlags: () =>
          setAutoHighlightFlags({
            ...autoHighlightFlags,
            trustedContact1: true,
          }),
        next: 'true',
      });
    } else if (!trustedContact2) {
      props.navigation.navigate('TrustedContactHistory', {
        selectedStatus: pageData[2].status,
        selectedTime: getTime(pageData[2].time),
        selectedTitle: pageData[2].title,
        updateAutoHighlightFlags: () =>
          setAutoHighlightFlags({
            ...autoHighlightFlags,
            trustedContact2: true,
          }),
        next: 'true',
      });
    } else if (!personalCopy1) {
      // (PersonalCopy1ShareBottomSheet as any).current.snapTo(1);
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
    } else if (!personalCopy2) {
      // (PersonalCopy2ShareBottomSheet as any).current.snapTo(1);
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
    } else if (!securityAns) {
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
        if (overallHealth.sharesInfo[0].shareStage === 'Ugly') {
          // Secondary device
          // ConfirmBottomSheet.current.snapTo(1);
          // secondaryDeviceBottomSheet.current.snapTo(1);
          const data = pageData[0];
          // secondaryDeviceBottomSheet.current.snapTo(1);
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
        } else if (overallHealth.sharesInfo[1].shareStage === 'Ugly') {
          // setSelectedTime(getTime(pageData[1].time));
          // setSelectedStatus(pageData[1].status);
          // setSelectTypeToReshare('contact1');
          // //Trusted contact 1
          // // ConfirmBottomSheet.current.snapTo(1);
          // setTimeout(() => {}, 10);
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
            next: 'true',
          });
        } else if (overallHealth.sharesInfo[2].shareStage === 'Ugly') {
          // setSelectedTime(getTime(pageData[2].time));
          // setSelectedStatus(pageData[2].status);
          // setSelectTypeToReshare('contact2');
          // //Trusted contact 2
          // // ConfirmBottomSheet.current.snapTo(1);
          // setTimeout(() => {}, 10);
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
            next: 'true',
          });
        } else if (overallHealth.sharesInfo[3].shareStage === 'Ugly') {
          // setSelectedTime(getTime(pageData[3].time));
          // setSelectedStatus(pageData[3].status);
          // setSelectTypeToReshare('copy1');
          // //personal copy 1
          // setTimeout(() => {
          //   setLoadCamera(true);
          // }, 2);
          // ConfirmBottomSheet.current.snapTo(1);
          // (PersonalCopy1ShareBottomSheet as any).current.snapTo(1);
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
        } else if (overallHealth.sharesInfo[4].shareStage === 'Ugly') {
          // setSelectedTime(getTime(pageData[4].time));
          // setSelectedStatus(pageData[4].status);
          // setSelectTypeToReshare('copy2');
          // //personal copy 2
          // setTimeout(() => {
          //   setLoadCamera(true);
          // }, 2);
          // ConfirmBottomSheet.current.snapTo(1);
          // (PersonalCopy2ShareBottomSheet as any).current.snapTo(1);
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
          setSelectedTime(getTime(pageData[5].time));
          setSelectedStatus(pageData[5].status);
          setSelectTypeToReshare('security');
          // Security question
          // SecurityQuestionBottomSheet.current.snapTo(1);
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
        } else if (overallHealth.sharesInfo[0].shareStage === 'Bad') {
          // Secondary device
          // SecondaryDeviceHistoryBottomSheet.current.snapTo(1);
          // secondaryDeviceBottomSheet.current.snapTo(1);
          const data = pageData[0];
          // secondaryDeviceBottomSheet.current.snapTo(1);
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
        } else if (overallHealth.sharesInfo[1].shareStage === 'Bad') {
          // setSelectedTime(getTime(pageData[1].time));
          // setSelectedStatus(pageData[1].status);
          // setSelectTypeToReshare('contact1');
          //Trusted contact 1
          // ConfirmBottomSheet.current.snapTo(1);
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
            next: 'true',
          });

          setTimeout(() => {}, 10);
        } else if (overallHealth.sharesInfo[2].shareStage === 'Bad') {
          // setSelectedTime(getTime(pageData[2].time));
          // setSelectedStatus(pageData[2].status);
          // setSelectTypeToReshare('contact2');
          //Trusted contact 2
          // ConfirmBottomSheet.current.snapTo(1);
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
            next: 'true',
          });

          setTimeout(() => {}, 10);
        } else if (overallHealth.sharesInfo[3].shareStage === 'Bad') {
          // setSelectedTime(getTime(pageData[3].time));
          // setSelectedStatus(pageData[3].status);
          // setSelectTypeToReshare('copy1');
          // //personal copy 1
          // setTimeout(() => {
          //   setLoadCamera(true);
          // }, 2);
          // ConfirmBottomSheet.current.snapTo(1);
          // (PersonalCopy1ShareBottomSheet as any).current.snapTo(1);
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
        } else if (overallHealth.sharesInfo[4].shareStage === 'Bad') {
          // setSelectedTime(getTime(pageData[4].time));
          // setSelectedStatus(pageData[4].status);
          // setSelectTypeToReshare('copy2');
          // //personal copy 2
          // setTimeout(() => {
          //   setLoadCamera(true);
          // }, 2);
          // ConfirmBottomSheet.current.snapTo(1);
          // (PersonalCopy2ShareBottomSheet as any).current.snapTo(1);
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
          // SecurityQuestionBottomSheet.current.snapTo(1);
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

  // useEffect(() => {
  //   if (databaseSSS.pdfDetails) {
  //     pageData[3].personalInfo = databaseSSS.pdfDetails.copy1;
  //     pageData[4].personalInfo = databaseSSS.pdfDetails.copy2;
  //     if (databaseSSS.pdfDetails.copy1.flagShare) {
  //       pageData[3].status = 'success';
  //     }
  //     if (databaseSSS.pdfDetails.copy2.flagShare) {
  //       pageData[4].status = 'success';
  //     }
  //     setPageData(pageData);
  //     setArrModalShareIntent({ ...arrModalShareIntent, snapTop: 0 });
  //   }
  // }, [databaseSSS]);

  useEffect(() => {
    onContactsUpdate();
  }, [contacts]);

  const onContactsUpdate = async () => {
    if (contacts.length) {
      if (
        contacts.findIndex(value => value && value.type == 'contact1') != -1
      ) {
        pageData[1].personalInfo =
          contacts[
            contacts.findIndex(value => value && value.type == 'contact1')
          ];
      }
      if (
        contacts.findIndex(value => value && value.type == 'contact2') != -1
      ) {
        pageData[2].personalInfo =
          contacts[
            contacts.findIndex(value => value && value.type == 'contact2')
          ];
      }
    }
    setPageData(pageData);
  };

  const getTime = item => {
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
        dispatch(checkMSharesHealth());
      } else {
        dispatch(initHealthCheck());
      }
    }
  }, [s3Service]);

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
          <TouchableOpacity
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
          </TouchableOpacity>
        </View>
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
              <Text style={{ ...CommonStyles.headerTitles, marginLeft: 25 }}>
                Manage Backup
              </Text>
              <Text
                style={{ ...CommonStyles.headerTitlesInfoText, marginLeft: 25 }}
              >
                The wallet backup is not secured. Please complete the setup to
                safeguard against loss of funds
              </Text>
              <KnowMoreButton
                onpress={() => {
                  WalletBackupAndRecoveryBottomSheet.current.snapTo(1);
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
          {pageData.map((item, index) => {
            const {
              secondaryDevice,
              trustedContact1,
              trustedContact2,
              personalCopy1,
              personalCopy2,
              securityAns,
            } = autoHighlightFlags;
            return (
              <View
                style={{
                  opacity: !selectedType || item.type == selectedType ? 1 : 0.5,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    // setSelectedTime(getTime(item.time));
                    // setSelectedStatus(item.status);
                    if (item.type == 'secondaryDevice') {
                      props.navigation.navigate('SecondaryDeviceHistory', {
                        selectedStatus: item.status,
                        selectedTime: getTime(item.time),
                        selectedTitle: item.title,
                        updateAutoHighlightFlags: () =>
                          setAutoHighlightFlags({
                            ...autoHighlightFlags,
                            secondaryDevice: true,
                          }),
                      });
                      // setTimeout(() => {
                      //   setSelectTypeToReshare('secondaryDevice');
                      // }, 10);
                      // if (autoHighlightFlags.secondaryDevice) {
                      //   SecondaryDeviceHistoryBottomSheet.current.snapTo(1);
                      // } else {
                      //   secondaryDeviceBottomSheet.current.snapTo(1);
                      // }
                    } else if (item.type == 'contact1') {
                      props.navigation.navigate('TrustedContactHistory', {
                        selectedStatus: item.status,
                        selectedTime: getTime(item.time),
                        selectedTitle: item.title,
                      });
                      // setLoadOnTrustedContactBottomSheet(true);
                      // setTimeout(() => {
                      //   setSelectTypeToReshare('contact1');
                      // }, 10);
                      // if (trustedContact1) {
                      //   if (item.personalInfo) {
                      //     setContactToConfirm(item.personalInfo);
                      //   }
                      // } else {
                      //   setTimeout(() => {
                      //   }, 2);
                      // }
                    } else if (item.type == 'contact2') {
                      props.navigation.navigate('TrustedContactHistory', {
                        selectedStatus: item.status,
                        selectedTime: getTime(item.time),
                        selectedTitle: item.title,
                      });
                      // setTimeout(() => {
                      //   setSelectTypeToReshare('contact2');
                      // }, 10);
                      // if (trustedContact2) {
                      //   if (item.personalInfo) {
                      //     setContactToConfirm(item.personalInfo);
                      //   }
                      // } else {
                      //   setTimeout(() => {
                      //   }, 2);
                      //   setLoadOnTrustedContactBottomSheet(true);
                      // }
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
                      // if (!databaseSSS && !databaseSSS.pdfDetails) {
                      //   Alert.alert(
                      //     'Generating Personal Copy',
                      //     'Please, try again in a while',
                      //   );
                      //   return;
                      // }
                      // AsyncStorage.getItem('personalCopy1Shared').then(
                      //   personalCopy1Shared => {
                      //     if (personalCopy1Shared) {
                      //       props.navigation.navigate('QrScanner', {
                      //         scanedCode: qrData => {
                      //           const index = 3;
                      //           dispatch(checkPDFHealth(qrData, index));
                      //         },
                      //       });
                      //     } else {
                      //       // setTimeout(() => {
                      //       //   setSelectTypeToReshare('copy1');
                      //       // }, 10);
                      //       if (personalCopy1) {
                      //         setSelectTypeToReshare('copy1');
                      //         PersonalCopyHistoryBottomSheet.current.snapTo(1);
                      //       } else {
                      //         // setSelectedPersonalCopy(item);
                      //         (PersonalCopy1ShareBottomSheet as any).current.snapTo(
                      //           1,
                      //         );
                      //       }
                      //     }
                      //   },
                      // );
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
                      // if (!databaseSSS && !databaseSSS.pdfDetails) {
                      //   Alert.alert(
                      //     'Generating Personal Copy',
                      //     'Please, try again in a while',
                      //   );
                      //   return;
                      // }
                      // AsyncStorage.getItem('personalCopy2Shared').then(
                      //   personalCopy2Shared => {
                      //     if (personalCopy2Shared) {
                      //       props.navigation.navigate('QrScanner', {
                      //         scanedCode: qrData => {
                      //           const index = 4;
                      //           dispatch(checkPDFHealth(qrData, index));
                      //         },
                      //       });
                      //     } else {
                      //       if (personalCopy2) {
                      //         setSelectTypeToReshare('copy2');
                      //         PersonalCopyHistoryBottomSheet.current.snapTo(1);
                      //       } else {
                      //         // setSelectedPersonalCopy(item);
                      //         (PersonalCopy2ShareBottomSheet as any).current.snapTo(
                      //           1,
                      //         );
                      //       }
                      //     }
                      //   },
                      // );
                    } else if (item.type == 'security') {
                      props.navigation.navigate('SecurityQuestionHistory', {
                        selectedStatus: item.status,
                        selectedTime: getTime(item.time),
                        selectedTitle: item.title,
                        updateAutoHighlightFlags: () =>
                          setAutoHighlightFlags({
                            ...autoHighlightFlags,
                            securityAns: true,
                          }),
                      });
                      // setTimeout(() => {
                      //   setSelectTypeToReshare('security');
                      // }, 2);
                      // if (securityAns) {
                      //   SecurityQuestionHistoryBottomSheet.current.snapTo(1);// history modal
                      // } else {
                      //   SecurityQuestionBottomSheet.current.snapTo(1);// sr modal
                      // }
                    }
                    // else {
                    //   secondaryDeviceBottomSheet.current.snapTo(1);
                    // }
                  }}
                  style={{
                    ...styles.manageBackupCard,
                    borderColor:
                      item.status == 'Ugly'
                        ? Colors.red
                        : item.status == 'Bad'
                        ? Colors.yellow
                        : item.status == 'Good'
                        ? Colors.green
                        : Colors.blue,
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
                  {(item.type == 'contact1' || item.type == 'contact2') &&
                  item.personalInfo &&
                  !item.personalInfo.imageAvailable ? (
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
                        {item.personalInfo && item.personalInfo.name
                          ? nameToInitials(item.personalInfo.name)
                          : ''}
                      </Text>
                    </View>
                  ) : (
                    <Image
                      style={styles.cardImage}
                      source={getImageByType(item)}
                    />
                  )}
                  <View style={{ marginLeft: 15 }}>
                    <Text style={styles.cardTitleText}>
                      {item.personalInfo &&
                      (item.type == 'contact1' || item.type == 'contact2')
                        ? item.personalInfo.name
                        : item.title}
                    </Text>
                    <Text style={styles.cardTimeText}>
                      Last backup{' '}
                      <Text
                        style={{
                          fontFamily: Fonts.FiraSansMediumItalic,
                          fontWeight: 'bold',
                          fontStyle: 'italic',
                        }}
                      >
                        {getTime(item.time)}
                      </Text>
                    </Text>
                  </View>
                  <Image
                    style={styles.cardIconImage}
                    source={getIconByStatus(item.status)}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
        {/* <BottomSheet
          onCloseStart={() => onPressSecondaryDeviceOk()}
          enabledInnerScrolling={true}
          ref={secondaryDeviceBottomSheet}
          snapPoints={[-30, hp('90%')]}
          renderContent={renderSecondaryDeviceContents}
          renderHeader={renderSecondaryDeviceHeader}
        /> */}
        <BottomSheet
          enabledInnerScrolling={true}
          ref={WalletBackupAndRecoveryBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('90%')
              : hp('90%'),
          ]}
          renderContent={renderWalletBackupAndRecoveryContents}
          renderHeader={renderWalletBackupAndRecoveryHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={RegenerateShareHelperBottomSheet}
          snapPoints={[-50, hp('95%')]}
          renderContent={renderRegenerateShareHelperContents}
          renderHeader={renderRegenerateShareHelperHeader}
        />
        {/* <BottomSheet
          enabledInnerScrolling={true}
          ref={PersonalCopy1ShareBottomSheet}
          snapPoints={[-50, hp('95%')]}
          renderContent={renderPersonalCopy1ShareModalContent}
          renderHeader={renderPersonalCopy1ShareModalHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={PersonalCopy2ShareBottomSheet}
          snapPoints={[-50, hp('95%')]}
          renderContent={renderPersonalCopy2ShareModalContent}
          renderHeader={renderPersonalCopy2ShareModalHeader}
        /> */}
        <BottomSheet
          enabledInnerScrolling={true}
          ref={PersonalCopyQRScannerBottomSheet}
          snapPoints={[-30, hp('90%')]}
          renderContent={renderPersonalCopyConfirmModalContent}
          renderHeader={renderPersonalCopyConfirmModalHeader}
        />
        {/* <ModalShareIntent
          removeHighlightingFromCard={removeHighlightingFromCard}
          data={arrModalShareIntent}
          onPressHandle={() => {
            setArrModalShareIntent({ ...arrModalShareIntent, snapTop: 0 });
          }}
          onPressShare={async type => {
            setArrModalShareIntent({ ...arrModalShareIntent, snapTop: 0 });
            dispatch(requestSharePdf(type, itemSelected));
            let pdfShared = JSON.parse(await AsyncStorage.getItem('pdfShared'));
            pdfShared = pdfShared ? pdfShared : {};
            const updatedPDFShared = {
              ...pdfShared,
              [type == 'copy2' ? 4 : 3]: true,
            };
            await AsyncStorage.setItem(
              'pdfShared',
              JSON.stringify({
                ...updatedPDFShared,
              }),
            );
            if (
              arrModalShareIntent.item &&
              arrModalShareIntent.item.type == 'copy1'
            ) {
              setTimeout(() => {
                setPersonalCopy1AutoHighlightFlags('true')
              }, 10);
              AsyncStorage.setItem('personalCopy1AutoHighlightFlags', 'true');
            } else if (
              arrModalShareIntent.item &&
              arrModalShareIntent.item.type == 'copy2'
            ) {
              setTimeout(() => {
                setPersonalCopy2AutoHighlightFlags('true')
              }, 10);
              AsyncStorage.setItem('personalCopy2AutoHighlightFlags', 'true');
            }
            setSelectedType('');
          }}
        /> */}
        {/* <BottomSheet
          enabledInnerScrolling={true}
          ref={SecurityQuestionBottomSheet}
          snapPoints={[-30, hp('75%'), hp('90%')]}
          renderContent={renderSecurityQuestionContent}
          renderHeader={renderSecurityQuestionHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={HealthCheckSuccessBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('37%')
              : hp('45%'),
          ]}
          renderContent={renderHealthCheckSuccessModalContent}
          renderHeader={renderHealthCheckSuccessModalHeader}
        /> */}
        <BottomSheet
          enabledInnerScrolling={true}
          ref={SecondaryDeviceHistoryBottomSheet}
          snapPoints={[-30, hp('90%')]}
          renderContent={renderSecondaryDeviceHistoryContent}
          renderHeader={renderSecondaryDeviceHistoryHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={PersonalCopyHistoryBottomSheet}
          snapPoints={[-30, hp('90%')]}
          renderContent={renderPersonalCopyHistoryContent}
          renderHeader={renderPersonalCopyHistoryHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={SecurityQuestionHistoryBottomSheet}
          snapPoints={[-30, hp('90%')]}
          renderContent={renderSecurityQuestionHistoryContent}
          renderHeader={renderSecurityQuestionHistoryHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={ChangeBottomSheet}
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
          ref={ReshareBottomSheet}
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
          ref={ConfirmBottomSheet}
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
            Next Step
          </Text>
        </TouchableOpacity>
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
});
