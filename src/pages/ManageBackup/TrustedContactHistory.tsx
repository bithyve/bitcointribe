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

const TrustedContactHistory = props => {
  const [ChangeBottomSheet, setChangeBottomSheet] = useState(React.createRef());
  const [ReshareBottomSheet, setReshareBottomSheet] = useState(
    React.createRef(),
  );
  const [ConfirmBottomSheet, setConfirmBottomSheet] = useState(
    React.createRef(),
  );
  const [OTP, setOTP] = useState('');
  const [renderTimer, setRenderTimer] = useState(false);
  const [chosenContactIndex, setChosenContactIndex] = useState(1);
  const [chosenContact, setChosenContact] = useState({});
  const [trustedContactsBottomSheet, setTrustedContactsBottomSheet] = useState(
    React.createRef(),
  );
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
  const [
    trustedContactQrBottomSheet,
    setTrustedContactQrBottomSheet,
  ] = useState(React.createRef());
  //   const [autoHighlightFlags, setAutoHighlightFlags] = useState({
  //     secondaryDevice: false,
  //     trustedContact1: false,
  //     trustedContact2: false,
  //     personalCopy1: false,
  //     personalCopy2: false,
  //     securityAns: false,
  //   });

  const [trustedContactHistory, setTrustedContactHistory] = useState([
    {
      id: 1,
      title: 'Recovery Secret created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Secret in-transit',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Secret accessible',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Secret not accessible',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
  ]);

  const overallHealth = useSelector(state => state.sss.overallHealth);
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

  const setContactInfo = useCallback(async () => {
    let SelectedContactsTemp = JSON.parse(
      await AsyncStorage.getItem('SelectedContacts'),
    );
    if (SelectedContactsTemp) {
      setSelectedContacts(SelectedContactsTemp);
      if (selectedTitle == 'Trusted Contact 1' && SelectedContactsTemp[0]) {
        setChosenContact(SelectedContactsTemp[0]);
      } else if (
        selectedTitle == 'Trusted Contact 2' &&
        SelectedContactsTemp[1]
      ) {
        setChosenContact(SelectedContactsTemp[1]);
      }
    }
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
      (CommunicationModeBottomSheet as any).current.snapTo(1);
    },
    [SelectedContacts, chosenContact],
  );

  const renderTrustedContactsContent = useCallback(() => {
    return (
      <TrustedContacts
        LoadContacts={LoadContacts}
        onPressBack={() => {
          (trustedContactsBottomSheet as any).current.snapTo(0);
        }}
        onPressContinue={(selectedContacts, index) =>
          getContacts(selectedContacts, index)
        }
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

  const renderCommunicationModeModalContent = useCallback(() => {
    return (
      <CommunicationMode
        contact={chosenContact ? chosenContact : null}
        index={index}
        onPressBack={() => {
          (CommunicationModeBottomSheet as any).current.snapTo(0);
        }}
        onPressContinue={(OTP, index, selectedContactMode) => {
          if (selectedContactMode.type == 'qrcode') {
            (trustedContactQrBottomSheet as any).current.snapTo(1);
            (CommunicationModeBottomSheet as any).current.snapTo(0);
          } else {
            setTimeout(() => {
              setRenderTimer(true);
              setOTP(OTP);
              setChosenContactIndex(index);
            }, 10);
            (CommunicationModeBottomSheet as any).current.snapTo(0);
            (shareOtpWithTrustedContactBottomSheet as any).current.snapTo(1);
          }
        }}
      />
    );
  }, [chosenContact, index]);

  const renderCommunicationModeModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (CommunicationModeBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const updateHistory = useCallback(
    shareHistory => {
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
    async index => {
      let selectedContactList = JSON.parse(
        await AsyncStorage.getItem('SelectedContacts'),
      );
      if (!selectedContactList) {
        selectedContactList = [];
      }
      if (index == 2) {
        selectedContactList[1] = chosenContact;
      } else if (index == 1) {
        selectedContactList[0] = chosenContact;
      }
      await AsyncStorage.setItem(
        'SelectedContacts',
        JSON.stringify(selectedContactList),
      );

      updateAutoHighlightFlags();
      saveInTransitHistory();
      setActivateReshare(true);

      (shareOtpWithTrustedContactBottomSheet as any).current.snapTo(0);
      (trustedContactQrBottomSheet.current as any).snapTo(0); // closes either of them based on which was on.
    },
    [updateAutoHighlightFlags, saveInTransitHistory, chosenContact],
  );

  const renderShareOtpWithTrustedContactContent = useCallback(() => {
    return (
      <ShareOtpWithTrustedContact
        renderTimer={renderTimer}
        onPressOk={index => {
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
  }, [onOTPShare, OTP, chosenContactIndex, renderTimer]);

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
        title={'Confirm Recovery Secret\nwith Trusted Contact'}
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
  }, []);

  const renderConfirmHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const onPressReshare = useCallback(async () => {
    let selectedContactList = JSON.parse(
      await AsyncStorage.getItem('SelectedContacts'),
    );
    console.log({ selectedContactList });
    console.log({ chosenContact });
    if (selectedTitle == 'Trusted Contact 1') {
      setChosenContact(selectedContactList[0]);
    } else if (selectedTitle == 'Trusted Contact 2') {
      setChosenContact(selectedContactList[1]);
    }
    (CommunicationModeBottomSheet as any).current.snapTo(1);
    (ReshareBottomSheet as any).current.snapTo(0);
  }, [selectedTitle]);

  const renderReshareContent = useCallback(() => {
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
            setLoadContacts(true);
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

  const renderTrustedContactQrContents = useCallback(() => {
    const index = selectedTitle == 'Trusted Contact 1' ? 1 : 2;
    return (
      <TrustedContactQr
        index={index}
        onPressOk={() => onOTPShare(index)}
        onPressBack={() => {
          (trustedContactQrBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [selectedTitle, chosenContact]);

  const renderTrustedContactQrHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (trustedContactQrBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const sortedHistory = useCallback(history => {
    const currentHistory = history.filter(element => {
      if (element.date) return element;
    });

    const sortedHistory = _.sortBy(currentHistory, 'date');
    sortedHistory.forEach(element => {
      element.date = moment(element.date)
        .utc()
        .local()
        .format('DD MMMM YYYY HH:mm');
    });

    return sortedHistory;
  }, []);

  useEffect(() => {
    if (overallHealth) {
      if (overallHealth.sharesInfo[2].updatedAt) {
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

  useEffect(() => {
    (async () => {
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem('shareHistory'),
      );
      console.log({ shareHistory });
      if (shareHistory) updateHistory(shareHistory);
    })();

    setContactInfo();
  }, []);

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
                ? nameToInitials(chosenContact.name)
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
                {chosenContact.name
                  ? chosenContact.name
                  : props.navigation.state.params.selectedTitle}
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
                  : require('../../assets/images/icons/settings.png')
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
              ? 'Want to send the Recovery Secret again to the same destination? '
              : null
          }
          changeInfo={
            shared || activateReshare
              ? 'Want to share the Recovery Secret with another contact? '
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
      <BottomSheet
        enabledInnerScrolling={true}
        ref={CommunicationModeBottomSheet as any}
        snapPoints={[-30, hp('75%')]}
        renderContent={renderCommunicationModeModalContent}
        renderHeader={renderCommunicationModeModalHeader}
      />
      <BottomSheet
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
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderConfirmContent}
        renderHeader={renderConfirmHeader}
      />
      <BottomSheet
        onCloseStart={() => {}}
        enabledInnerScrolling={true}
        ref={trustedContactQrBottomSheet as any}
        snapPoints={[-30, hp('90%')]}
        renderContent={renderTrustedContactQrContents}
        renderHeader={renderTrustedContactQrHeader}
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
