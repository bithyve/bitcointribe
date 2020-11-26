import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import BottomSheet from 'reanimated-bottom-sheet';
import ModalHeader from '../../components/ModalHeader';
import HistoryPageComponent from './HistoryPageComponent';
import moment from 'moment';
import ErrorModalContents from '../../components/ErrorModalContents';
import DeviceInfo from 'react-native-device-info';
import QRModal from '../Accounts/QRModal';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import KeeperDeviceHelpContents from '../../components/Helper/KeeperDeviceHelpContents';
import ApproveSetup from './ApproveSetup';
import HistoryHeaderComponent from './HistoryHeaderComponent';
import _ from 'underscore';
import { useDispatch, useSelector } from 'react-redux';
import { sendApprovalRequest } from '../../store/actions/health';
import KeeperTypeModalContents from './KeeperTypeModalContent';
import { notificationType } from '../../bitcoin/utilities/Interface';

const KeeperDeviceHistory = (props) => {
  const dispatch = useDispatch();
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [HelpBottomSheet, setHelpBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const [QrBottomSheet, setQrBottomSheet] = useState(React.createRef());
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const [ApproveSetupBottomSheet, setApproveSetupBottomSheet] = useState(
    React.createRef(),
  );
  const [
    ApprovePrimaryKeeperBottomSheet,
    setApprovePrimaryKeeperBottomSheet,
  ] = useState(React.createRef().current);
  const [keeperTypeBottomSheet, setKeeperTypeBottomSheet] = useState(
    React.createRef().current,
  );
  const [qrScannedData, setQrScannedData] = useState('');
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
  const [isPrimaryKeeper, setIsPrimaryKeeper] = useState(
    props.navigation.state.params.isPrimaryKeeper,
  );
  const [selectedLevelId, setSelectedLevelId] = useState(
    props.navigation.state.params.selectedLevelId,
  );
  const [selectedKeeper, setSelectedKeeper] = useState(
    props.navigation.state.params.selectedKeeper,
  );
  const [isReshare, setIsReshare] = useState(
    props.navigation.state.params.selectedStatus == 'notAccessible'
      ? false
      : true,
  );
  const levelHealth = useSelector((state) => state.health.levelHealth);
  const currentLevel = useSelector((state) => state.health.currentLevel);

  useEffect(() => {
    setIsPrimaryKeeper(props.navigation.state.params.isPrimaryKeeper);
    setSelectedLevelId(props.navigation.state.params.selectedLevelId);
    setSelectedKeeper(props.navigation.state.params.selectedKeeper);
    setIsReshare(
      props.navigation.state.params.selectedStatus == 'notAccessible'
        ? false
        : true,
    );
  }, [
    props.navigation.state.params.selectedLevelId,
    props.navigation.state.params.isPrimaryKeeper,
    props.navigation.state.params.selectedKeeper,
    props.navigation.state.params.selectedStatus,
  ]);

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
      if (props.navigation.state.params.selectedStatus == 'notAccessible') {
        (QrBottomSheet as any).current.snapTo(1);
      }
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem('shareHistory'),
      );
      if (shareHistory[0].inTransit || shareHistory[0].accessible) {
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

  const renderQrContent = useCallback(() => {
    return (
      <QRModal
        isFromKeeperDeviceHistory={true}
        QRModalHeader={'QR scanner'}
        title={'Note'}
        infoText={
          'Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diam nonumy eirmod'
        }
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={(qrData) => {
          try {
            setQrScannedData(qrData);
            if (qrData) {
              props.navigation.navigate('KeeperFeatures', {
                isReshare,
                qrScannedData: qrData,
                isPrimaryKeeper: isPrimaryKeeper,
                selectedShareId: selectedKeeper.shareId,
                selectedLevelId
              });
              (QrBottomSheet as any).current.snapTo(0);
            }
          } catch (err) {
            console.log({ err });
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
        onPressContinue={() => {
          // {uuid: "49c33c31d647e83eabc8f820", publicKey: "65abf583924eeaf11095d7079977fd0b0774f462e22460975048bfd02ebc84f5", privateKey: "0a24e05d1c8b40f08657f695a58d5681a72e2ca7367c302d6e7414d349b9e3ee", ephemeralAddress: "ce6c7ac1637cc5286f8312b20182ec4238a40699842a061641ef9cf6011e11c4", isSignUp: true, …}
          let qrScannedData = isPrimaryKeeper ?
            '{"uuid":"f9e2309af828c73867858da6","publicKey": "5bff353bba9a545842c8f889cb2ee748b96e397f4ea4b839bf678ad042f03346","ephemeralAddress": "e90337892695b31607617bd874e6db801c5e703f873aab367b0f3d8579e94169","walletName":"Primary"}' :
            '{"uuid":"49c33c31d647e83eabc8f820","publicKey": "65abf583924eeaf11095d7079977fd0b0774f462e22460975048bfd02ebc84f5","ephemeralAddress": "ce6c7ac1637cc5286f8312b20182ec4238a40699842a061641ef9cf6011e11c4","walletName":"Secondary"}';
            console.log('qrScannedData', qrScannedData)
          props.navigation.navigate('KeeperFeatures', {
            isReshare,
            qrScannedData,
            isPrimaryKeeper: isPrimaryKeeper,
            selectedShareId: selectedKeeper.shareId,
            selectedLevelId: selectedLevelId,
          });
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

  const sendApprovalRequestToPK = () => {
    if (!isPrimaryKeeper) {
      let PKShareId;
      if (currentLevel == 2) PKShareId = levelHealth[1].levelInfo[2].shareId;
      if (currentLevel == 3) PKShareId = levelHealth[2].levelInfo[2].shareId;
      dispatch(sendApprovalRequest(selectedKeeper.shareId, PKShareId, notificationType.approveKeeper));
      (ApprovePrimaryKeeperBottomSheet as any).snapTo(1);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
      <SafeAreaView
        style={{ flex: 0, backgroundColor: Colors.backgroundColor }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <HistoryHeaderComponent
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={props.navigation.state.params.selectedTitle}
        selectedTime={props.navigation.state.params.selectedTime}
        selectedStatus={props.navigation.state.params.selectedStatus}
        moreInfo={props.navigation.state.params.selectedTitle}
        headerImage={require('../../assets/images/icons/icon_secondarydevice.png')}
      />
      <View style={{ flex: 1 }}>
        <HistoryPageComponent
          type={'secondaryDevice'}
          IsReshare={isReshare}
          data={sortedHistory(secondaryDeviceHistory)}
          confirmButtonText={'Confirm'}
          onPressConfirm={() => {
            (QrBottomSheet.current as any).snapTo(1);
          }}
          reshareButtonText={'Restore Keeper'}
          onPressReshare={async () => {
            if (isPrimaryKeeper) {
              (QrBottomSheet.current as any).snapTo(1);
            } else {
              sendApprovalRequestToPK();
            }
          }}
          changeButtonText={'Change Keeper'}
          onPressChange={() => {
            if (isPrimaryKeeper) {
              (QrBottomSheet.current as any).snapTo(1);
            } else {
              sendApprovalRequestToPK();
            }
          }}
        />
      </View>
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
        onCloseStart={() => {}}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={QrBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('90%') : hp('89%'),
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
        enabledInnerScrolling={true}
        ref={ApproveSetupBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('60%') : hp('70%'),
        ]}
        renderContent={() => (
          <ApproveSetup
            onPressContinue={() => {
              if (ApproveSetupBottomSheet as any)
                (ApproveSetupBottomSheet as any).current.snapTo(0);

              props.navigation.navigate('KeeperFeatures', {
                isReshare,
                qrScannedData,
                isPrimaryKeeper: isPrimaryKeeper,
                selectedShareId: selectedKeeper.shareId,
              });
            }}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            backgroundColor={Colors.backgroundColor1}
            onPressHeader={() => {
              if (ApproveSetupBottomSheet as any)
                (ApproveSetupBottomSheet as any).current.snapTo(0);
            }}
          />
        )}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ApprovePrimaryKeeperBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('60%') : hp('70'),
        ]}
        renderContent={() => (
          <ApproveSetup
            onPressContinue={() => {
              if (isPrimaryKeeper) {
                (QrBottomSheet.current as any).snapTo(1);
              } else {
                (keeperTypeBottomSheet as any).snapTo(1);
                (ApprovePrimaryKeeperBottomSheet as any).snapTo(0);
              }
            }}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() => {
              (keeperTypeBottomSheet as any).snapTo(1);
              (ApprovePrimaryKeeperBottomSheet as any).snapTo(0);
            }}
          />
        )}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={keeperTypeBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('75%') : hp('75%'),
        ]}
        renderContent={() => (
          <KeeperTypeModalContents
            onPressSetup={(type, name) => {}}
            onPressBack={() => (keeperTypeBottomSheet as any).snapTo(0)}
            selectedLevelId={selectedLevelId}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() => (keeperTypeBottomSheet as any).snapTo(0)}
          />
        )}
      />
    </View>
  );
};

export default KeeperDeviceHistory;

const styles = StyleSheet.create({});
