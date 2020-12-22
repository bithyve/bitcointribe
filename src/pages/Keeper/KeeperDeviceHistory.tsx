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
import {
  sendApprovalRequest,
} from '../../store/actions/health';
import KeeperTypeModalContents from './KeeperTypeModalContent';
import { notificationType } from '../../bitcoin/utilities/Interface';

const KeeperDeviceHistory = (props) => {
  const dispatch = useDispatch();
  const ErrorBottomSheet = React.createRef();
  const HelpBottomSheet = React.createRef();
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const [QrBottomSheet, setQrBottomSheet] = useState(React.createRef());
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const ApproveSetupBottomSheet = React.createRef();
  const ApprovePrimaryKeeperBottomSheet = React.createRef();
  const keeperTypeBottomSheet = React.createRef().current;
  const ReshareBottomSheet = React.createRef();

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
    props.navigation.state.params.selectedTitle == 'Primary Keeper'
      ? false
      : true,
  );
  const levelHealth = useSelector((state) => state.health.levelHealth);
  const currentLevel = useSelector((state) => state.health.currentLevel);
  useEffect(() => {
    console.log('props.navigation.state.params', props.navigation.state.params)
    setIsPrimaryKeeper(props.navigation.state.params.isPrimaryKeeper);
    setSelectedLevelId(props.navigation.state.params.selectedLevelId);
    setSelectedKeeper(props.navigation.state.params.selectedKeeper);
    setIsReshare(
      props.navigation.state.params.selectedTitle == 'Primary Keeper' ||
        props.navigation.state.params.selectedTitle == 'Keeper Device'
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
      if (!isReshare) {
        setQrBottomSheetsFlag(true);
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
                selectedLevelId,
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
          if (QrBottomSheet.current)
            (QrBottomSheet as any).current.snapTo(0);
        }}
        onPressContinue={() => {
          // {"uuid":"b7e20f3b5c16fd6f72747562","publicKey":"21dee57f5948ea041b0a9b9ca2445cbd838f569aa192c71b8e232a5b41b5b9ca","privateKey":"0f1cd0d4821a5848f01b701fd3efb3a85641227f5b86679e21847705cc23e026","ephemeralAddress":"bf6b8efb0c3fffdfacce12b0ae5ac0ee589c5a092e7146821f6ff38c38bd1458","isSignUp":true,"password":"1111","walletName":"PK"}
          let qrScannedData = isPrimaryKeeper
            ? '{"uuid":"b7e20f3b5c16fd6f72747562","publicKey": "21dee57f5948ea041b0a9b9ca2445cbd838f569aa192c71b8e232a5b41b5b9ca","ephemeralAddress": "bf6b8efb0c3fffdfacce12b0ae5ac0ee589c5a092e7146821f6ff38c38bd1458","walletName":"PK"}'
            : '{"uuid":"e8b47a1fe92784edaa21aa0d","publicKey": "594ce61f0188b4efeabd5ccdd69f869714c7ae5dc28416b8f82fa886a51e449a","ephemeralAddress": "61df97609d46b14cfe0c0a168e6c23c07454d73f783c13a04ba1e9667c631709","walletName":"SK"}';
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
      dispatch(
        sendApprovalRequest(
          selectedKeeper.shareId,
          PKShareId,
          notificationType.approveKeeper,
        ),
      );
      (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(1);
    }
  };

  const renderReshareContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ReshareBottomSheet}
        title={'Reshare with the same keeper?'}
        info={'Proceed if you want to reshare the share with the same keeper'}
        note={
          'For a different keeper, please go back and choose ‘Change Keeper'
        }
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          if (isPrimaryKeeper) {
            setQrBottomSheetsFlag(true);
            (QrBottomSheet as any).current.snapTo(1);
          } else {
            sendApprovalRequestToPK();
          }
          // onPressReshare();
        }}
        onPressIgnore={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  }, []);

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
            (ReshareBottomSheet as any).current.snapTo(1);
          }}
          changeButtonText={'Change Keeper'}
          onPressChange={() => {
            if (isPrimaryKeeper) {
              setQrBottomSheetsFlag(true);
              (QrBottomSheet as any).current.snapTo(1);
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
        onCloseStart={() => { }}
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
                (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(0);
              }
            }}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() => {
              (keeperTypeBottomSheet as any).snapTo(1);
              (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(0);
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
            onPressSetup={(type, name) => { }}
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
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ReshareBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderReshareContent}
        renderHeader={() => <ModalHeader />}
      />
    </View>
  );
};

export default KeeperDeviceHistory;

const styles = StyleSheet.create({});
