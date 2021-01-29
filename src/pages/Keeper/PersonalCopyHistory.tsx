import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  AsyncStorage,
  Platform,
  Alert,
} from "react-native";
import Fonts from "../../common/Fonts";
import BackupStyles from "./Styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getIconByStatus } from "./utils";
import { useDispatch, useSelector } from "react-redux";
import Colors from "../../common/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { RFValue } from "react-native-responsive-fontsize";
import BottomSheet from "reanimated-bottom-sheet";
import ModalHeader from "../../components/ModalHeader";
import HistoryPageComponent from "./HistoryPageComponent";
import PersonalCopyShareModal from "../../components/PersonalCopyShareModal";
import moment from "moment";
import _ from "underscore";
import DeviceInfo, { getFirstInstallTime } from "react-native-device-info";
import ErrorModalContents from "../../components/ErrorModalContents";
import KnowMoreButton from "../../components/KnowMoreButton";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import { SECURE_ACCOUNT } from "../../common/constants/serviceTypes";
import SmallHeaderModal from "../../components/SmallHeaderModal";
import PersonalCopyHelpContents from "../../components/Helper/PersonalCopyHelpContents";
import HistoryHeaderComponent from "./HistoryHeaderComponent";
import {
  getPDFData,
  confirmPDFShared,
  sendApprovalRequest,
  onApprovalStatusChange,
} from "../../store/actions/health";
import KeeperTypeModalContents from "./KeeperTypeModalContent";
import {
  LevelHealthInterface,
  notificationType,
} from "../../bitcoin/utilities/Interface";
import ApproveSetup from "./ApproveSetup";
import { StackActions } from "react-navigation";

const PersonalCopyHistory = (props) => {
  const dispatch = useDispatch();
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [HelpBottomSheet, setHelpBottomSheet] = useState(React.createRef());
  const [keeperTypeBottomSheet, setkeeperTypeBottomSheet] = useState(
    React.createRef()
  );
  const [
    ApprovePrimaryKeeperBottomSheet,
    setApprovePrimaryKeeperBottomSheet,
  ] = useState(React.createRef());
  const [selectedKeeperType, setSelectedKeeperType] = useState("");
  const [selectedKeeperName, setSelectedKeeperName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageHeader, setErrorMessageHeader] = useState("");

  const [blockReshare, setBlockReshare] = useState("");

  const [personalCopyHistory, setPersonalCopyHistory] = useState([
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
  const [
    PersonalCopyShareBottomSheet,
    setPersonalCopyShareBottomSheet,
  ] = useState(React.createRef());

  const selectedPersonalCopy = props.navigation.getParam(
    "selectedPersonalCopy"
  );

  const [personalCopyDetails, setPersonalCopyDetails] = useState(null);
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
    props.navigation.state.params.selectedTitle == "Pdf Keeper" ? false : true
  );
  const levelHealth = useSelector((state) => state.health.levelHealth);
  const currentLevel = useSelector((state) => state.health.currentLevel);
  const keeperInfo = useSelector((state) => state.health.keeperInfo);
  const pdfInfo = useSelector((state) => state.health.pdfInfo);
  const keeperApproveStatus = useSelector(
    (state) => state.health.keeperApproveStatus
  );
  useEffect(() => {
    setIsPrimaryKeeper(props.navigation.state.params.isPrimaryKeeper);
    setSelectedLevelId(props.navigation.state.params.selectedLevelId);
    setSelectedKeeper(props.navigation.state.params.selectedKeeper);
    setIsReshare(
      props.navigation.state.params.selectedTitle == "Pdf Keeper" ? false : true
    );
  }, [
    props.navigation.state.params.selectedLevelId,
    props.navigation.state.params.isPrimaryKeeper,
    props.navigation.state.params.selectedKeeper,
    props.navigation.state.params.selectedStatus,
  ]);

  // const saveInTransitHistory = async () => {
  //   try{
  //       const shareHistory = JSON.parse(await AsyncStorage.getItem("shareHistory"));
  //     if (shareHistory) {
  //       let updatedShareHistory = [...shareHistory];
  //       // updatedShareHistory = {
  //       //   ...updatedShareHistory,
  //       //   inTransit: Date.now(),
  //       // };
  //       updateHistory(updatedShareHistory);
  //       await AsyncStorage.setItem(
  //         "shareHistory",
  //         JSON.stringify(updatedShareHistory)
  //       );
  //     }
  //   }catch(e){
  //     console.log('e', e)
  //   }
  // };

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
    const updatedPersonalCopyHistory = [...personalCopyHistory];
    if (shareHistory.createdAt)
      updatedPersonalCopyHistory[0].date = shareHistory.createdAt;
    if (shareHistory.inTransit)
      updatedPersonalCopyHistory[1].date = shareHistory.inTransit;

    if (shareHistory.accessible)
      updatedPersonalCopyHistory[2].date = shareHistory.accessible;

    if (shareHistory.notAccessible)
      updatedPersonalCopyHistory[3].date = shareHistory.notAccessible;

    setPersonalCopyHistory(updatedPersonalCopyHistory);
  };

  useEffect(() => {
    (async () => {
      console.log("useEffect pdfInfo", pdfInfo);
      dispatch(getPDFData(selectedKeeper.shareId));
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem("shareHistory")
      );
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
      // onPressHeader={() => {
      //   (ErrorBottomSheet as any).current.snapTo(0);
      // }}
      />
    );
  }, []);

  const renderPersonalCopyShareModalContent = useCallback(() => {
    return (
      <PersonalCopyShareModal
        removeHighlightingFromCard={() => {}}
        selectedPersonalCopy={selectedPersonalCopy}
        personalCopyDetails={personalCopyDetails}
        onPressBack={() => {
          (PersonalCopyShareBottomSheet as any).current.snapTo(0);
        }}
        onPressShare={() => {}}
        onPressConfirm={() => {
          try {
            dispatch(confirmPDFShared(selectedKeeper.shareId));
            (PersonalCopyShareBottomSheet as any).current.snapTo(0);
            const popAction = StackActions.pop({ n: 1 });
            props.navigation.dispatch(popAction);            
          } catch (err) {
            console.log("error", err);
          }
        }}
      />
    );
  }, [selectedPersonalCopy, personalCopyDetails]);

  const renderPersonalCopyShareModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (PersonalCopyShareBottomSheet as any).current.snapTo(0);
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
      <PersonalCopyHelpContents
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
    console.log("PKShareId", PKShareId);
    dispatch(
      sendApprovalRequest(
        selectedKeeper.shareId,
        PKShareId,
        type == "pdf" || type == "contact"
          ? notificationType.uploadSecondaryShare
          : notificationType.approveKeeper
      )
    );
    if ((type == "pdf" || type == "contact") && !keeperApproveStatus.shareId) {
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
        isChangeKeeperType: true,
      });
    }
    if (type == "device") {
      props.navigation.navigate("KeeperDeviceHistory", {
        ...props.navigation.state.params,
        selectedTitle: name,
        isChangeKeeperType: true,
      });
    }
    if (type == "pdf") {
      (PersonalCopyShareBottomSheet as any).current.snapTo(1);
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
        headerImage={require("../../assets/images/icons/note.png")}
      />
      <View style={{ flex: 1 }}>
        <HistoryPageComponent
          type={"copy"}
          IsReshare={isReshare}
          data={sortedHistory(personalCopyHistory)}
          confirmButtonText={"Confirm"}
          onPressConfirm={() => {
            (PersonalCopyShareBottomSheet as any).current.snapTo(1);
          }}
          reshareButtonText={"Restore Keeper"}
          onPressReshare={async () => {
            console.log(
              "onPressReshare PersonalCopyShareBottomSheet",
              PersonalCopyShareBottomSheet
            );
            (PersonalCopyShareBottomSheet as any).current.snapTo(1);
          }}
          changeButtonText={"Change Keeper"}
          onPressChange={() => {
            (keeperTypeBottomSheet as any).current.snapTo(1);
          }}
        />
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={PersonalCopyShareBottomSheet as any}
        snapPoints={[-50, hp("85%")]}
        renderContent={renderPersonalCopyShareModalContent}
        renderHeader={renderPersonalCopyShareModalHeader}
      />
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
              selectedKeeperType == "pdf"  || selectedKeeperType == "contact" 
              ? !keeperApproveStatus.status : false
            }
            onPressContinue={() => {
              onPressChangeKeeperType(selectedKeeperType, selectedKeeperName);
              (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(0);
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
    </View>
  );
};

export default PersonalCopyHistory;

const styles = StyleSheet.create({});
