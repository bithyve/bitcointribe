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
  AsyncStorage,
  RefreshControl,
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
import CopyThisText from '../../components/CopyThisText';
import KnowMoreButton from '../../components/KnowMoreButton';
import { useDispatch, useSelector } from 'react-redux';
import { initHealthCheck, checkMSharesHealth } from '../../store/actions/sss';
import S3Service from '../../bitcoin/services/sss/S3Service';
import HomePageShield from '../../components/HomePageShield';
import BackupStyles from './Styles';
import ContactList from '../../components/ContactList';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomInfoBox from '../../components/BottomInfoBox';
import Icons from "../../common/Icons";
import TransparentHeaderModal from "../../components/TransparentHeaderModal";
import ErrorModalContents from '../../components/ErrorModalContents';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import WalletBackupAndRecoveryContents from '../../components/Helper/WalletBackupAndRecoveryContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import { fetchSSSFromDB } from '../../store/actions/storage';
import { requestSharePdf } from '../../store/actions/manageBackup';
import RegenerateHealper from '../../components/Helper/RegenerateHealper';
import { ModalShareIntent } from 'hexaComponents/Modal/ManageBackup';

import Singleton from "hexaCommon/Singleton";
import SecondaryDeviceModelContents from '../../components/ManageBackup/SecondaryDeviceModelContents';
import TrustedContactModalContents from '../../components/ManageBackup/TrustedContactModalContents';
import ShareOtpWithTrustedContactContents from '../../components/ShareOtpWithTrustedContactContents';
import TrustedContacts from './TrustedContacts';
import CommunicationMode from './CommunicationMode';

let itemSelected = {};

export default function ManageBackup(props) {
  const [OTP, setOTP] = useState('');
  const [chosenContactIndex, setChosenContactIndex] = useState(0);
  const [chosenContact, setChosenContact] = useState({});
  const [Contact, setContact] = useState([]);
  const [ChangeBottomSheet, setChangeBottomSheet] = useState(React.createRef());
  const [ReshareBottomSheet, setReshareBottomSheet] = useState(React.createRef());
  const [ConfirmBottomSheet, setConfirmBottomSheet] = useState(React.createRef());
  const [pageData1, setPageData1] = useState([
    {
      id: 1, title: "Recovery Secret Not Accessible", date: "19 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
    },
    {
      id: 2, title: "Recovery Secret Received", date: "1 June ‘19, 9:00am", info: "consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet"
    },
    {
      id: 3, title: "Recovery Secret In-Transit", date: "30 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
    },
    {
      id: 4, title: "Recovery Secret Accessible", date: "24 May ‘19, 5:00pm", info: "Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet"
    },
    {
      id: 5, title: "Recovery Secret In-Transit", date: "20 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
    },
    {
      id: 6, title: "Recovery Secret Not Accessible", date: "19 May ‘19, 11:00am", info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit"
    }
  ]);
  const SelectOption = (Id) => {
    if (Id == SelectedOption) {
      setSelectedOption(0)
    }
    else {
      setSelectedOption(Id)
    }
  }
  const [SelectedOption, setSelectedOption] = useState(0);
  const [
    WalletBackupAndRecoveryBottomSheet,
    setWalletBackupAndRecoveryBottomSheet,
  ] = useState(React.createRef());
  const [secondaryDeviceBottomSheet, setSecondaryDeviceBottomSheet] = useState(
    React.createRef(),
  );
  const [trustedContactsBottomSheet, setTrustedContactsBottomSheet] = useState(
    React.createRef(),
  );
  const [CommunicationModeBottomSheet, setCommunicationModeBottomSheet] = useState(
    React.createRef(),
  );
  const [
    RegenerateShareHelperBottomSheet,
    setRegenerateShareHelperBottomSheet,
  ] = useState(React.createRef());
  //const [ refShareIntentBottomSheet, setRefShareIntentBottomSheet ] = useRef();
  const [shareOtpWithTrustedContactBottomSheet, setShareOtpWithTrustedContactBottomSheet] = useState(React.createRef());
  const [selectedType, setSelectedType] = useState('');
  const [contactIndex, setContactIndex] = useState();
  const [selectedStatus, setSelectedStatus] = useState('error');
  const [contacts, setContacts] = useState([]);
  const [isSecretShared1, setIsSecretShared1] = useState(false);
  const [isSecretShared2, setIsSecretShared2] = useState(false);
  const [arrModalShareIntent, setArrModalShareIntent] = useState({ snapTop: 0, item: {} });

  const [cloudData, setCloudData] = useState([
    {
      title: 'iCloud Drive',
      info: 'Store backup in iCloud Drive',
      imageIcon: require('../../assets/images/icons/logo_brand_brands_logos_icloud.png'),
    },
    {
      title: 'Google Drive',
      info: 'Store backup in Google Drive',
      imageIcon: require('../../assets/images/icons/logo_brand_brands_logos_icloud.png'),
    },
    {
      title: 'One Drive',
      info: 'Store backup in One Drive',
      imageIcon: require('../../assets/images/icons/logo_brand_brands_logos_icloud.png'),
    },
    {
      title: 'DropBox Storage',
      info: 'Store backup in Dropbox Storage',
      imageIcon: require('../../assets/images/icons/logo_brand_brands_logos_icloud.png'),
    },
  ]);
  const [pageData, setPageData] = useState([
    {
      title: 'Secondary Device',
      personalInfo: null,
      time: '3 months ago',
      status: 'error',
      type: 'secondaryDevice',
      route: 'SecondaryDevice',
    },
    {
      title: 'Trusted Contact 1',
      personalInfo: null,
      time: '1 month ago',
      status: 'error',
      type: 'contact',
      route: 'TrustedContacts',
    },
    {
      title: 'Trusted Contact 2',
      personalInfo: null,
      time: '12 days ago',
      status: 'error',
      type: 'contact',
      route: 'TrustedContacts',
    },
    {
      title: 'Personal Copy 1',
      personalInfo: null,
      time: '2 days ago',
      status: 'error',
      type: 'copy1',
      route: 'PersonalCopy',
    },
    {
      title: 'Personal Copy 2',
      personalInfo: null,
      time: '2 days ago',
      status: 'error',
      type: 'copy2',
      route: 'PersonalCopy',
    },
    {
      title: 'Security Questions',
      personalInfo: null,
      time: '1 day ago',
      status: 'error',
      type: 'security',
      route: 'HealthCheckSecurityAnswer',
    },
  ]);

  function getImageByType(item) {
    let type = item.type;
    if (type == 'secondaryDevice') {
      return require('../../assets/images/icons/icon_secondarydevice.png');
    } else if (type == 'contact') {
      return require('../../assets/images/icons/icon_user.png');
    } else if (type == 'copy1' || type == 'copy2') {
      if (item.personalInfo && item.personalInfo.flagShare && item.personalInfo.shareDetails.type == "GoogleDrive") {
        return Icons.manageBackup.PersonalCopy.icloud;
      }
      else if (item.personalInfo && item.personalInfo.flagShare && item.personalInfo.shareDetails.type == "Email") {
        return Icons.manageBackup.PersonalCopy.email;
      }
      else if (item.personalInfo && item.personalInfo.flagShare && (item.personalInfo.shareDetails.type == "Print")) {
        return Icons.manageBackup.PersonalCopy.print;
      }
      else {
        return require('../../assets/images/icons/note.png');
      }
      // return require('../../assets/images/icons/icon_cloud.png');
    }
    if (type == 'print') {
      return require('../../assets/images/icons/print.png');
    } else if (type == 'security') {
      return require('../../assets/images/icons/icon_securityquestion.png');
    }
  }

  // function selectedContactsList(list) {
  //   setContacts(list);
  // }

  // function continueNProceed() {
  //   bottomSheet.current.snapTo(0);
  // setTimeout(() => {
  //   setSelectedType("cloud");
  //   setSelectedStatus("success");
  // }, 1000);
  //}

  // const [contactIndex, setContactIndex] = useState();
  // function openModal(type, title?) {
  //   // title as dummy identifier for Trusted Contact index
  //   setSelectedType(type);
  //   if (title)
  //     title === "Trusted Contact 1" ? setContactIndex(1) : setContactIndex(2);

  //   bottomSheet.current.snapTo(1);
  // }

  //   function onCloseEnd() {
  //     if (selectedType == "secondaryDevice") {
  //       setSelectedType("contact");
  //       setSelectedStatus("warning");
  //     }
  //   }

  const getIconByStatus = status => {
    if (status == 'error') {
      return require('../../assets/images/icons/icon_error_red.png');
    } else if (status == 'warning') {
      return require('../../assets/images/icons/icon_error_yellow.png');
    } else if (status == 'success') {
      return require('../../assets/images/icons/icon_check.png');
    }
  };

  function onCloseEnd() {
    if (selectedType == 'secondaryDevice') {
      setSelectedType('contact');
      setSelectedStatus('warning');
    }
  }

  function renderCommunicationModeModalContent() {
    return (
      <CommunicationMode
        secretSharedTrustedContact1={secretSharedTrustedContact1}
        secretSharedTrustedContact2={secretSharedTrustedContact2}
        contact={Contact[0] ? Contact[0] : null}
        index={chosenContactIndex}
        onPressBack={() => { CommunicationModeBottomSheet.current.snapTo(0) }}
        onPressContinue={(OTP) => {
          setTimeout(() => {
            setOTP(OTP);
          }, 10);
          CommunicationModeBottomSheet.current.snapTo(0)
          shareOtpWithTrustedContactBottomSheet.current.snapTo(1)
        }}
      />
    );
  }

  function renderCommunicationModeModalHeader() {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (CommunicationModeBottomSheet as any).current.snapTo(0);
        }} />
    );
  }

  function renderShareOtpWithTrustedContactContent() {
    return (
      <ShareOtpWithTrustedContactContents
        onPressBack={() => { shareOtpWithTrustedContactBottomSheet.current.snapTo(0) }}
        OTP={OTP}
      />
    );
  }

  function renderShareOtpWithTrustedContactHeader() {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (shareOtpWithTrustedContactBottomSheet as any).current.snapTo(0);
        }} />
    );
  }

  const getContacts = async (selectedContacts, index) => {
    let contactListArray = [];
    let contactList = JSON.parse(
      await AsyncStorage.getItem('SelectedContacts'),
    );
    if (contactList) {
      contactListArray = contactList;
      if (selectedContacts.length == 2) {
        contactListArray[0] = selectedContacts[0];
        contactListArray[1] = selectedContacts[1];
      }
      else if (selectedContacts.length == 1 && index == 0) {
        contactListArray[0] = selectedContacts[0];
      }
      else if (selectedContacts.length == 1 && index == 1) {
        contactListArray[1] = selectedContacts[0];
      }
    } else {
      for (let i = 0; i < selectedContacts.length; i++) {
        contactListArray.push(selectedContacts[i]);
      }
    }
    setContact(contactListArray);
    await AsyncStorage.setItem('SelectedContacts', JSON.stringify(contactListArray));
    let AsyncContacts = JSON.parse(await AsyncStorage.getItem('SelectedContacts'));
    if (AsyncContacts && AsyncContacts.length == 2 && chosenContactIndex == 0) {
      setChosenContact(AsyncContacts[0])
    }
    else if (AsyncContacts && AsyncContacts.length == 2 && chosenContactIndex == 1) {
      setChosenContact(AsyncContacts[1])
    }
    else if (AsyncContacts && AsyncContacts.length == 1) {
      setChosenContact(AsyncContacts[0])
    }
    trustedContactsBottomSheet.current.snapTo(0);
    CommunicationModeBottomSheet.current.snapTo(1);
  }

  function renderTrustedContactsContent() {
    return (
      <TrustedContacts
        onPressBack={() => { trustedContactsBottomSheet.current.snapTo(0) }}
        onPressContinue={(selectedContacts, index) => getContacts(selectedContacts, index)}
        index={chosenContactIndex}
      />
    );
  }

  function renderTrustedContactsHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => {
          (trustedContactsBottomSheet as any).current.snapTo(0);
        }}
        style={styles.modalHeader}
      >
        <View style={styles.modalHeaderHandle} />
      </TouchableOpacity>
    );
  }

  const renderSecondaryDeviceContents = () => {
    return (
      <SecondaryDeviceModelContents
        onPressOk={() => { secondaryDeviceBottomSheet.current.snapTo(0) }}
        onPressBack={() => { secondaryDeviceBottomSheet.current.snapTo(0) }}
        onPressChange={() => { ChangeBottomSheet.current.snapTo(1) }}
        onPressConfirm={() => { ConfirmBottomSheet.current.snapTo(1) }}
        onPressReshare={() => { ReshareBottomSheet.current.snapTo(1) }}
      />
    );
  };

  function renderSecondaryDeviceHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => {
          (secondaryDeviceBottomSheet as any).current.snapTo(0);
        }}
        style={styles.modalHeader}
      >
        <View style={styles.modalHeaderHandle} />
      </TouchableOpacity>
    );
  }

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
      <TransparentHeaderModal
        onPressheader={() => {
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderReshareContent = () => {
    return (
      <ErrorModalContents
        modalRef={ReshareBottomSheet}
        title={'Reshare Recovery Secret\nwith Trusted Contact'}
        info={'Did your contact not receive the Recovery Secret?'}
        note={
          'You can reshare the Recovery Secret with your Trusted\nContact via Email or Sms'
        }
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const renderReshareHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderConfirmContent = () => {
    return (
      <ErrorModalContents
        modalRef={ConfirmBottomSheet}
        title={'Confirm Recovery Secret\nwith Trusted Contact'}
        info={'Your Trusted Contact seems away from their Hexa App'}
        note={
          'You can send them a reminder to open their app to\nensure they have your Recovery Secret'
        }
        proceedButtonText={'Confirm'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const renderConfirmHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  // function renderContent() {
  //   switch (selectedType) {
  //     case "secondaryDevice":
  //       props.navigation.navigate("SecondaryDevice");
  //       break;
  //     case "contact":
  //       props.navigation.navigate("TrustedContacts", { index: contactIndex });
  //       break;
  //     case "cloud":
  //       props.navigation.navigate("Cloud");
  //       break;
  //   }
  // }

  // function renderHeader() {
  //   return (
  //     <TouchableOpacity
  //       activeOpacity={10}
  //       onPress={() => {
  //         bottomSheet.current.snapTo(0);
  //       }}
  //       style={styles.modalHeader}
  //     >
  //       <View style={styles.modalHeaderHandle} />
  //     </TouchableOpacity>
  //   );
  // }

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
      <SmallHeaderModal
        borderColor={Colors.blue}
        headerColor={Colors.blue}
        onPressHandle={() => {
          WalletBackupAndRecoveryBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const dispatch = useDispatch();
  const s3Service: S3Service = useSelector(state => state.sss.service);
  const { databaseSSS } = useSelector(state => state.storage);

  useEffect(() => {
    // ( async () => {
    //   const contactList = await AsyncStorage.getItem( 'SelectedContacts' );
    // } )();
    dispatch(fetchSSSFromDB());
    checkNShowHelperModal();
    if (!s3Service.sss.healthCheckInitialized) dispatch(initHealthCheck());
  }, []);

  useEffect(() => {
    if (databaseSSS.pdfDetails) {
      pageData[3].personalInfo = databaseSSS.pdfDetails.copy1;
      pageData[4].personalInfo = databaseSSS.pdfDetails.copy2;
      if (databaseSSS.pdfDetails.copy1.flagShare) {
        pageData[3].status = 'success';
      }
      if (databaseSSS.pdfDetails.copy2.flagShare) {
        pageData[4].status = 'success';
      }
      setPageData(pageData);
      setArrModalShareIntent({ ...arrModalShareIntent, snapTop: 0 });
    }
  }, [databaseSSS]);

  const checkNShowHelperModal = async () => {
    let isManageBackupHelperDone = await AsyncStorage.getItem(
      'isManageBackupHelperDone',
    );
    if (!isManageBackupHelperDone) {
      AsyncStorage.setItem('isManageBackupHelperDone', 'true');
      WalletBackupAndRecoveryBottomSheet.current.snapTo(1);
    }
  };

  const [overallHealth, setOverallHealth] = useState();
  const health = useSelector(state => state.sss.overallHealth);
  useEffect(() => {
    if (health) setOverallHealth(health);
  }, [health]);

  useEffect(() => {
    (async () => {
      if (!overallHealth) {
        const storedHealth = await AsyncStorage.getItem('overallHealth');
        if (storedHealth) {
          setOverallHealth(JSON.parse(storedHealth));
        }
      }
    })();
  }, []);

  //const { overallHealth } = useSelector( state => state.sss );
  useEffect(() => {
    if (overallHealth) {
      const updatedPageData = [...pageData];
      updatedPageData.forEach(data => {
        switch (data.title) {
          case 'Secondary Device':
            if (overallHealth.sharesInfo[0].shareStage === 'Good') {
              data.status = 'success';
            } else if (overallHealth.sharesInfo[0].shareStage === 'Bad') {
              data.status = 'warning';
            } else if (overallHealth.sharesInfo[0].shareStage === 'Ugly') {
              data.status = 'error';
            }
            break;

          case 'Trusted Contact 1':
            if (overallHealth.sharesInfo[1].shareStage === 'Good') {
              data.status = 'success';
            } else if (overallHealth.sharesInfo[1].shareStage === 'Bad') {
              data.status = 'warning';
            } else if (overallHealth.sharesInfo[1].shareStage === 'Ugly') {
              data.status = 'error';
            }
            break;

          case 'Trusted Contact 2':
            if (overallHealth.sharesInfo[2].shareStage === 'Good') {
              data.status = 'success';
            } else if (overallHealth.sharesInfo[2].shareStage === 'Bad') {
              data.status = 'warning';
            } else if (overallHealth.sharesInfo[2].shareStage === 'Ugly') {
              data.status = 'error';
            }
            break;

          case 'Security Questions':
            if (overallHealth.qaStatus === 'Good') {
              data.status = 'success';
            } else if (overallHealth.qaStatus === 'Bad') {
              data.status = 'warning';
            } else if (overallHealth.qaStatus === 'Ugly') {
              data.status = 'error';
            }
            break;

          default:
            break;
        }
      });
      setPageData(updatedPageData);
    }
  }, [overallHealth]);

  const healthLoading = useSelector(
    state => state.sss.loading.checkMSharesHealth,
  );
  useEffect(() => {
    // HC down-streaming
    if (s3Service) {
      const { healthCheckInitialized } = s3Service.sss;

      if (healthCheckInitialized) {
        dispatch(checkMSharesHealth());
      }
    }
  }, []);

  const renderBuyHelperContents = () => {
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
  const renderBuyHelperHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={() => {
          (RegenerateShareHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  // const getTrustContact = async (contacts, index) => {
  //   setContacts(contacts);
  //   setContactIndex(index);
  //   const contactList1 = await AsyncStorage.getItem('SelectedContacts');

  //   CommunicationModeBottomSheet.current.snapTo(1);
  // };

  useEffect(() => {
    if (contacts) {
      const updatedPageData = [...pageData];
      for (let i = 0; i < updatedPageData.length; i++) {
        if (contactIndex == 1) {
          if (contacts.length == 2) {
            updatedPageData[i].title == 'Trusted Contact 1'
              ? (updatedPageData[i].personalInfo = contacts[0])
              : updatedPageData[i].title == 'Trusted Contact 2'
                ? (updatedPageData[i].personalInfo = contacts[1])
                : '';
          } else if (!updatedPageData[1].personalInfo) {
            updatedPageData[i].title == 'Trusted Contact 1'
              ? (updatedPageData[i].personalInfo = contacts[0])
              : '';
          }
        }

        if (contactIndex == 2) {
          if (contacts.length == 2) {
            updatedPageData[i].title == 'Trusted Contact 1'
              ? (updatedPageData[i].personalInfo = contacts[0])
              : updatedPageData[i].title == 'Trusted Contact 2'
                ? (updatedPageData[i].personalInfo = contacts[1])
                : '';
          } else if (!updatedPageData[2].personalInfo) {
            updatedPageData[i].title == 'Trusted Contact 2'
              ? (updatedPageData[i].personalInfo = contacts[0])
              : '';
          }
        }
      }
      setPageData(updatedPageData);
    }
  }, [contacts]);

  const secretSharedTrustedContact1 = isSecretShared1 => {
    setIsSecretShared1(isSecretShared1);
  };

  const secretSharedTrustedContact2 = isSecretShared2 => {
    setIsSecretShared2(isSecretShared2);
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ flex: 1 }}>
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
            }}
            onPress={() => {
              RegenerateShareHelperBottomSheet.current.snapTo(1);
            }}
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
          <FlatList
            data={pageData}
            extraData={this.state}
            renderItem={({ item, index }) => (
              <View
              // style={{
              //   opacity: !selectedType || item.type == selectedType ? 1 : 0.5
              // }}
              >
                <TouchableOpacity
                  disabled={
                    item.personalInfo && item.personalInfo.flagShare
                      ? true
                      : false
                  }
                  onPress={() => {
                    // shareOtpWithTrustedContactBottomSheet.current.snapTo(1);
                    if (item.type == 'secondaryDevice') {
                      secondaryDeviceBottomSheet.current.snapTo(1);
                    }
                    if (item.type == 'contact') {
                      if (item.title == "Trusted Contact 1") {
                        setTimeout(() => {
                          setChosenContactIndex(0);
                        }, 10)
                      }
                      if (item.title == "Trusted Contact 2") {
                        setTimeout(() => {
                          setChosenContactIndex(1);
                        }, 10)
                      }
                      trustedContactsBottomSheet.current.snapTo(1);
                    }
                    // let singleton = Singleton.getInstance();
                    // singleton.setSelectedPdfDetails(pageData);
                    // itemSelected = item;
                    // if (item.route == 'PersonalCopy') {
                    //   setArrModalShareIntent({
                    //     snapTop: 1,
                    //     item,
                    //   });
                    // }
                    // if (item.type == 'contact' && !item.personalInfo) {
                    //   props.navigation.navigate(item.route, {
                    //     index:
                    //       item.title === 'Trusted Contact 1'
                    //         ? 1
                    //         : item.title === 'Trusted Contact 2'
                    //           ? 2
                    //           : undefined,
                    //     getTrustContact: getTrustContact,
                    //     contacts: contacts ? contacts : [],
                    //   });
                    // } else {
                    //   if (item.type == 'contact') {
                    //     if (isSecretShared1 || isSecretShared2) {
                    //       props.navigation.navigate(
                    //         'TrustedContactHealthCheck',
                    //       );
                    //     } else {
                    //       props.navigation.navigate('CommunicationMode', {
                    //         contact: item.personalInfo,
                    //         index:
                    //           item.title === 'Trusted Contact 1'
                    //             ? 1
                    //             : item.title === 'Trusted Contact 2'
                    //               ? 2
                    //               : undefined,
                    //         secretSharedTrustedContact1:
                    //           item.title === 'Trusted Contact 1'
                    //             ? secretSharedTrustedContact1
                    //             : null,
                    //         secretSharedTrustedContact2:
                    //           item.title === 'Trusted Contact 2'
                    //             ? secretSharedTrustedContact2
                    //             : null,
                    //       });
                    //     }
                    //   } else {
                    //     props.navigation.navigate(item.route);
                    //   }
                    // }
                  }}
                  style={{
                    ...styles.manageBackupCard,
                    borderColor:
                      item.status == 'error'
                        ? Colors.red
                        : item.status == 'warning'
                          ? Colors.yellow
                          : item.status == 'success'
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
                  {item.type == 'contact' &&
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
                      {item.personalInfo && item.type == 'contact'
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
                        {item.time}
                      </Text>
                    </Text>
                  </View>
                  <Image
                    style={styles.cardIconImage}
                    source={getIconByStatus(item.status)}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </ScrollView>
        <BottomSheet
          onCloseEnd={() => onCloseEnd()}
          enabledInnerScrolling={true}
          ref={secondaryDeviceBottomSheet}
          snapPoints={[-30, hp("90%")]}
          renderContent={renderSecondaryDeviceContents}
          renderHeader={renderSecondaryDeviceHeader}
        />
        <BottomSheet
          onCloseEnd={() => onCloseEnd()}
          enabledInnerScrolling={true}
          ref={trustedContactsBottomSheet}
          snapPoints={[-30, hp("90%")]}
          renderContent={renderTrustedContactsContent}
          renderHeader={renderTrustedContactsHeader}
        />
        <BottomSheet
          onCloseEnd={() => onCloseEnd()}
          enabledInnerScrolling={true}
          ref={CommunicationModeBottomSheet}
          snapPoints={[-30, hp("75%")]}
          renderContent={renderCommunicationModeModalContent}
          renderHeader={renderCommunicationModeModalHeader}
        />
        <BottomSheet
          onCloseEnd={() => onCloseEnd()}
          enabledInnerScrolling={true}
          ref={shareOtpWithTrustedContactBottomSheet}
          snapPoints={[-30, hp("70%")]}
          renderContent={renderShareOtpWithTrustedContactContent}
          renderHeader={renderShareOtpWithTrustedContactHeader}
        />
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
          renderContent={renderBuyHelperContents}
          renderHeader={renderBuyHelperHeader}
        />
        <ModalShareIntent
          data={arrModalShareIntent}
          onPressHandle={() => {
            setArrModalShareIntent({ ...arrModalShareIntent, snapTop: 0 })
          }
          }
          onPressShare={(type) => {
            setArrModalShareIntent({ ...arrModalShareIntent, snapTop: 0 })
            dispatch(requestSharePdf(type, itemSelected));
          }}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={ChangeBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
          ]}
          renderContent={renderChangeContent}
          renderHeader={renderChangeHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={ReshareBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
          ]}
          renderContent={renderReshareContent}
          renderHeader={renderReshareHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={ConfirmBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
          ]}
          renderContent={renderConfirmContent}
          renderHeader={renderConfirmHeader}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  knowMoreButton: {
    marginTop: 10,
    height: wp('6%'),
    width: wp('18%'),
    marginLeft: 25,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  knowMoreButtonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
  },
  shieldImage: {
    width: wp('16%'),
    height: wp('25%'),
    resizeMode: 'contain',
    marginLeft: 'auto',
    marginRight: 20,
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 15,
  },
  modalHeader: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    height: 25,
    width: '80%',
    alignSelf: 'center',
    borderColor: Colors.borderColor,
  },
  addressView: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: RFValue(13),
    color: Colors.lightBlue,
  },
  copyIconView: {
    width: 48,
    height: 50,
    backgroundColor: Colors.borderColor,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  listElements: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    borderBottomWidth: 0.5,
    borderColor: Colors.borderColor,
    paddingTop: 25,
    paddingBottom: 25,
    paddingLeft: 10,
    alignItems: 'center',
  },
  listElementsTitle: {
    color: Colors.blue,
    fontSize: RFValue(13),
    marginLeft: 13,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementsInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    marginLeft: 13,
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementIcon: {
    paddingRight: 5,
    marginLeft: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listElementsIconImage: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
    alignSelf: 'center',
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: "center",
    flexDirection: "row",
    paddingRight: 10,
    paddingBottom: hp("1.5%"),
    paddingTop: hp("1%"),
    marginBottom: hp("1.5%")
  },
});
