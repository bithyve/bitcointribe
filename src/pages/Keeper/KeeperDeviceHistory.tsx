import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Colors from "../../common/Colors";
import BottomSheet from "reanimated-bottom-sheet";
import ModalHeader from "../../components/ModalHeader";
import HistoryPageComponent from "./HistoryPageComponent";
import moment from "moment";
import ErrorModalContents from "../../components/ErrorModalContents";
import DeviceInfo from "react-native-device-info";
import QRModal from "../Accounts/QRModal";
import SmallHeaderModal from "../../components/SmallHeaderModal";
import KeeperDeviceHelpContents from "../../components/Helper/KeeperDeviceHelpContents";
import ApproveSetup from "./ApproveSetup";
import HistoryHeaderComponent from "./HistoryHeaderComponent";
import _ from "underscore";
import { useDispatch, useSelector } from "react-redux";
import {
  sendApprovalRequest,
  onApprovalStatusChange,
} from "../../store/actions/health";
import KeeperTypeModalContents from "./KeeperTypeModalContent";
import {
  LevelHealthInterface,
  notificationType,
} from "../../bitcoin/utilities/Interface";

const KeeperDeviceHistory = (props) => {
  const dispatch = useDispatch();
  const ErrorBottomSheet = React.createRef();
  const HelpBottomSheet = React.createRef();
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageHeader, setErrorMessageHeader] = useState("");
  const [QrBottomSheet, setQrBottomSheet] = useState(React.createRef());
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const ApproveSetupBottomSheet = React.createRef();
  const ApprovePrimaryKeeperBottomSheet = React.createRef();
  const keeperTypeBottomSheet = React.createRef();
  const ReshareBottomSheet = React.createRef();

  const [qrScannedData, setQrScannedData] = useState("");
  const [secondaryDeviceHistory, setSecondaryDeviceHistory] = useState([
    {
      id: 1,
      title: "Recovery Key created",
      date: null,
      info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit",
    },
    {
      id: 2,
      title: "Recovery Key in-transit",
      date: null,
      info:
        "consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet",
    },
    {
      id: 3,
      title: "Recovery Key accessible",
      date: null,
      info: "Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit",
    },
    {
      id: 4,
      title: "Recovery Key not accessible",
      date: null,
      info: "Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet",
    },
  ]);
  const [isPrimaryKeeper, setIsPrimaryKeeper] = useState(
    props.navigation.state.params.isPrimaryKeeper
  );
  const [selectedLevelId, setSelectedLevelId] = useState(
    props.navigation.state.params.selectedLevelId
  );
  const [selectedKeeper, setSelectedKeeper] = useState(
    props.navigation.state.params.selectedKeeper
  );
  const [isReshare, setIsReshare] = useState(
    props.navigation.state.params.selectedTitle == "Primary Keeper"
      ? false
      : true
  );
  const levelHealth: LevelHealthInterface[] = useSelector(
    (state) => state.health.levelHealth
  );
  const [selectedKeeperType, setSelectedKeeperType] = useState("");
  const [selectedKeeperName, setSelectedKeeperName] = useState("");
  const keeperInfo: any[] = useSelector((state) => state.health.keeperInfo);
  const currentLevel = useSelector((state) => state.health.currentLevel);
  const keeperApproveStatus = useSelector(
    (state) => state.health.keeperApproveStatus
  );
  const [isChange, setIsChange] = useState(false);
  useEffect(() => {
    setIsPrimaryKeeper(props.navigation.state.params.isPrimaryKeeper);
    setSelectedLevelId(props.navigation.state.params.selectedLevelId);
    setSelectedKeeper(props.navigation.state.params.selectedKeeper);
    setIsReshare(
      props.navigation.state.params.selectedTitle == "Primary Keeper" ||
        props.navigation.state.params.selectedTitle == "Keeper Device"
        ? false
        : true
    );
    setIsChange(
      props.navigation.state.params.isChangeKeeperType
        ? props.navigation.state.params.isChangeKeeperType
        : false
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

    const sortedHistory = _.sortBy(currentHistory, "date");
    sortedHistory.forEach((element) => {
      element.date = moment(element.date)
        .utc()
        .local()
        .format("DD MMMM YYYY HH:mm");
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
    if (isChange) {
      setQrBottomSheetsFlag(true);
      (QrBottomSheet as any).current.snapTo(1);
    }
  }, [isChange]);

  useEffect(() => {
    (async () => {
      if (!isReshare) {
        setQrBottomSheetsFlag(true);
        (QrBottomSheet as any).current.snapTo(1);
      }
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem("shareHistory")
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
        proceedButtonText={"Try again"}
        onPressProceed={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require("../../assets/images/icons/errorImage.png")}
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
        QRModalHeader={"QR scanner"}
        title={"Note"}
        infoText={
          "Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diam nonumy eirmod"
        }
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={(qrData) => {
          try {
            setQrScannedData(qrData);
            if (qrData) {
              props.navigation.navigate("KeeperFeatures", {
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
          if (QrBottomSheet.current) (QrBottomSheet as any).current.snapTo(0);
        }}
        onPressContinue={() => {
          let qrScannedData = isPrimaryKeeper
            ? '{"uuid":"3c96b489e61bd74d1f82a236","publicKey":"6e2d9c020e5dcbf5b09b0be7df102436b1fae3db5e547f3a2460aaa61df6d69c","ephemeralAddress":"602ae7c502aaf0a349150cc42434896f26539eaceafb98519210f4ba1a493267","walletName":"MacPro"}'
            : '{"uuid":"2f760eb3e5ff4b696c2e6cd5","publicKey":"297465943d38886e2854f110821d2edb7b0ab6aa1556934858b7a902bb4c4941","ephemeralAddress":"c34b7e8513bce3a4e43a42870d46ced80ff19a47208a657128f5cae4b22dee5d","walletName":"Mac"}';
          props.navigation.navigate("KeeperFeatures", {
            isReshare,
            qrScannedData,
            isPrimaryKeeper: isPrimaryKeeper,
            selectedShareId: selectedKeeper.shareId,
            selectedLevelId: selectedLevelId,
            isChange,
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

  const sendApprovalRequestToPK = (type) => {
    let PKShareId =
      currentLevel == 2 || currentLevel == 1
        ? levelHealth[1].levelInfo[2].shareId
        : currentLevel == 3
        ? levelHealth[2].levelInfo[2].shareId
        : levelHealth[1].levelInfo[2].shareId;
    dispatch(
      sendApprovalRequest(
        selectedKeeper.shareId,
        PKShareId,
        type == "pdf"
          ? notificationType.uploadSecondaryShare
          : notificationType.approveKeeper
      )
    );
    if (type == "pdf" && !keeperApproveStatus.shareId) {
      dispatch(
        onApprovalStatusChange(
          false,
          moment(new Date()).valueOf(),
          selectedKeeper.shareId
        )
      );
    }
    (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(1);
    (keeperTypeBottomSheet as any).current.snapTo(0);
  };

  const renderReshareContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ReshareBottomSheet}
        title={"Reshare with the same keeper?"}
        info={"Proceed if you want to reshare the share with the same keeper"}
        note={
          "For a different keeper, please go back and choose ‘Change Keeper"
        }
        proceedButtonText={"Reshare"}
        cancelButtonText={"Back"}
        isIgnoreButton={true}
        onPressProceed={() => {
          if (isPrimaryKeeper) {
            setQrBottomSheetsFlag(true);
            (QrBottomSheet as any).current.snapTo(1);
          } else {
            sendApprovalRequestToPK(
              isPrimaryKeeper ? "primaryKeeper" : "device"
            );
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

  const onPressChangeKeeperType = (type, name) => {
    if (type == "contact") {
      let levelhealth: LevelHealthInterface[] = [];
      if (
        levelHealth[1] &&
        levelHealth[1].levelInfo.findIndex((v) => v.updatedAt > 0) > -1
      )
        levelhealth = [levelHealth[1]];
      if (
        levelHealth[2] &&
        levelHealth[2].levelInfo.findIndex((v) => v.updatedAt > 0) > -1
      )
        levelhealth = [levelHealth[1], levelHealth[2]];
      let index = 1;
      let contactCount = 0;
      for (let i = 0; i < levelhealth.length; i++) {
        const element = levelhealth[i];
        for (let j = 0; j < element.levelInfo.length; j++) {
          const element2 = element.levelInfo[j];
          if (
            levelhealth[i] &&
            element2.shareType == "contact" &&
            props.keeper &&
            props.keeper.shareId != element2.shareId &&
            levelhealth[i] &&
            element2.shareType == "contact" &&
            props.keeper.shareType == "contact"
          ) {
            contactCount++;
          } else if (
            !props.keeper &&
            levelhealth[i] &&
            element2.shareType == "contact"
          )
            contactCount++;
          if (element2.shareType == "contact" && contactCount < 2) {
            if (
              keeperInfo.findIndex(
                (value) =>
                  value.shareId == element2.shareId && value.type == "contact"
              ) > -1
            ) {
              if (
                keeperInfo[
                  keeperInfo.findIndex(
                    (value) =>
                      value.shareId == element2.shareId &&
                      value.type == "contact"
                  )
                ].data.index == 1
              )
                index = 2;
            }
          }
        }
      }
      props.navigation.navigate("TrustedContactHistoryKeeper", {
        ...props.navigation.state.params,
        selectedTitle: name,
        index: index,
        isChangeKeeperType: true
      });
    }
    if (type == "device") {
      (QrBottomSheet as any).current.snapTo(1);
    }
    if (type == "pdf") {
      props.navigation.navigate("PersonalCopyHistoryKeeper", {
        ...props.navigation.state.params,
        selectedTitle: name,
      });
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
        headerImage={require("../../assets/images/icons/icon_secondarydevice.png")}
      />
      <View style={{ flex: 1 }}>
        <HistoryPageComponent
          type={"secondaryDevice"}
          IsReshare={isReshare}
          data={sortedHistory(secondaryDeviceHistory)}
          confirmButtonText={"Confirm"}
          onPressConfirm={() => {
            (QrBottomSheet.current as any).snapTo(1);
          }}
          reshareButtonText={"Restore Keeper"}
          onPressReshare={async () => {
            (ReshareBottomSheet as any).current.snapTo(1);
          }}
          changeButtonText={"Change Keeper"}
          onPressChange={() => {
            if (isPrimaryKeeper) {
              setQrBottomSheetsFlag(true);
              (QrBottomSheet as any).current.snapTo(1);
            } else {
              (keeperTypeBottomSheet as any).current.snapTo(1);
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
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("35%") : hp("40%"),
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
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("90%") : hp("89%"),
        ]}
        renderContent={renderQrContent}
        renderHeader={renderQrHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={HelpBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("87%") : hp("89%"),
        ]}
        renderContent={renderHelpContent}
        renderHeader={renderHelpHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ApprovePrimaryKeeperBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("60%") : hp("70"),
        ]}
        renderContent={() => (
          <ApproveSetup
            isContinueDisabled={
              selectedKeeperType == "pdf"
                ? !keeperApproveStatus.status
                : false
            }
            onPressContinue={() => {
              if (isPrimaryKeeper) {
                (QrBottomSheet.current as any).snapTo(1);
              } else {
                onPressChangeKeeperType(selectedKeeperType, selectedKeeperName);
                (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(0);
              }
            }}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() => {
              (keeperTypeBottomSheet as any).current.snapTo(1);
              (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(0);
            }}
          />
        )}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ReshareBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("37%") : hp("45%"),
        ]}
        renderContent={renderReshareContent}
        renderHeader={() => <ModalHeader />}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={keeperTypeBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("75%") : hp("75%"),
        ]}
        renderContent={() => (
          <KeeperTypeModalContents
            onPressSetup={async (type, name) => {
              setSelectedKeeperType(type);
              setSelectedKeeperName(name);
              sendApprovalRequestToPK(type);
            }}
            onPressBack={() => (keeperTypeBottomSheet as any).current.snapTo(0)}
            selectedLevelId={selectedLevelId}
            keeper={selectedKeeper}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() =>
              (keeperTypeBottomSheet as any).current.snapTo(0)
            }
          />
        )}
      />
    </View>
  );
};

export default KeeperDeviceHistory;

const styles = StyleSheet.create({});
