import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  Platform,
  Alert,
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
import SendViaLink from "../../components/SendViaLink";
import config from "../../bitcoin/HexaConfig";
import ShareOtpWithTrustedContact from "./ShareOtpWithTrustedContact";
import ContactListForRestore from "../RestoreHexaWithKeeper/ContactListForRestore";
import TrustedContactsService from "../../bitcoin/services/TrustedContactsService";

const KeeperDeviceHistory = (props) => {
  const dispatch = useDispatch();
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [HelpBottomSheet, setHelpBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageHeader, setErrorMessageHeader] = useState("");
  const [QrBottomSheet, setQrBottomSheet] = useState(React.createRef());
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const [ApproveSetupBottomSheet, setApproveSetupBottomSheet] = useState(
    React.createRef()
  );
  const [
    ApprovePrimaryKeeperBottomSheet,
    setApprovePrimaryKeeperBottomSheet,
  ] = useState(React.createRef());
  const [
    ContactListForRestoreBottomSheet,
    setContactListForRestoreBottomSheet,
  ] = useState(React.createRef());
  const [SendViaLinkBottomSheet, setSendViaLinkBottomSheet] = useState(
    React.createRef()
  );
  const [keeperTypeBottomSheet, setkeeperTypeBottomSheet] = useState(
    React.createRef()
  );
  const [
    shareOtpWithTrustedContactBottomSheet,
    setShareOtpWithTrustedContactBottomSheet,
  ] = useState(React.createRef());
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
    props.navigation.state.params.selectedKeeper &&
      props.navigation.state.params.selectedKeeper.shareType &&
      props.navigation.state.params.selectedKeeper.shareType == "primaryKeeper"
      ? true
      : false
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
  const [contactList, setContactList] = useState([]);
  const [selectedContact, setSelectedContact]: [
    selectedContact: any,
    setSelectedContact: any
  ] = useState({});
  const [linkToRequest, setLinkToRequest] = useState("");
  const [renderTimer, setRenderTimer] = useState(false);
  const [isOtpType, setIsOtpType] = useState(false);
  const [otp, setOtp] = useState("");
  const database = useSelector((state) => state.storage.database);
  let trustedContactsInfo = useSelector(
    (state) => state.trustedContacts.trustedContactsInfo
  );
  const trustedContacts: TrustedContactsService = useSelector(
    (state) => state.trustedContacts.service
  );
  const { SHARES_TRANSFER_DETAILS } = database.DECENTRALIZED_BACKUP;
  const [publicKey, setPublicKey] = useState('');
  useEffect(() => {
    console.log('props.navigation.state.params.isPrimaryKeeper', props.navigation.state.params.isPrimaryKeeper)
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
      getContactList();
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

  const getContactList = () => {
    if (
      levelHealth.length > 1 &&
      currentLevel >= 2 &&
      levelHealth.findIndex(
        (value) =>
          value.levelInfo.findIndex((item) => item.shareType == "contact") > -1
      ) > -1
    ) {
      let i = 0;
      let contactArr = [];
      if (currentLevel == 2 && levelHealth[1]) i = 1;
      if (currentLevel == 3 && levelHealth[2]) i = 2;
      for (i; i < levelHealth.length; i++) {
        const element = levelHealth[i].levelInfo;
        for (let j = 0; j < element.length; j++) {
          const item = element[j];
          let index = keeperInfo.findIndex(
            (value) => value.shareId == item.shareId
          );
          if (item.shareType == "contact" && index > -1) {
            let obj = {
              data: keeperInfo[index].data ? keeperInfo[index].data : {},
              ...item,
            };
            contactArr.push(obj);
          }
        }
      }
      setContactList(contactArr);
      console.log("contactArr", contactArr);
    }
  };

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
        isFromKeeperDeviceHistory={false}
        QRModalHeader={"QR scanner"}
        title={"Note"}
        infoText={
          "Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diam nonumy eirmod"
        }
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={(qrData) => {
          try {
            if (qrData) {
              props.navigation.navigate("KeeperFeatures", {
                isReshare,
                qrScannedData: qrData,
                isPrimaryKeeper: isPrimaryKeeper,
                selectedShareId: selectedKeeper.shareId,
                selectedLevelId: selectedLevelId,
                isChange,
                prevKeeperType: props.navigation.getParam("prevKeeperType")
                  ? props.navigation.getParam("prevKeeperType")
                  : null,
                contactIndex: props.navigation.getParam("contactIndex")
                  ? props.navigation.getParam("contactIndex")
                  : null,
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
        // onPressContinue={() => {
        //   let qrScannedData = isPrimaryKeeper
        //     ? '{"uuid":"b0020db78f86a75a7acec96d","publicKey":"507fcf14ac310051172cf9fed6dd2d52a05e210f828c7c81350ae7ead8a7a666","ephemeralAddress":"151bc50ae433427f50cad1a0edbc529c4a0aee2d45e92421199676873be2e297","walletName":"Mad"}' : '{"uuid":"eead4aa97a699820ece330d5","publicKey":"2e140dccaf2f5e7aaf426f7adb9d0bbf260266edbefc2a42a2d2914df70df06e","ephemeralAddress":"3d4d58d6dc3fff4e72e0d3f1470ae6e89850eb78ff97074b08b2503ab23a9329","walletName":"df"}';
        //   props.navigation.navigate("KeeperFeatures", {
        //     isReshare,
        //     qrScannedData,
        //     isPrimaryKeeper: isPrimaryKeeper,
        //     selectedShareId: selectedKeeper.shareId,
        //     selectedLevelId: selectedLevelId,
        //     isChange,
        //     prevKeeperType: props.navigation.getParam('prevKeeperType') ? props.navigation.getParam('prevKeeperType') : null,
        //     contactIndex: props.navigation.getParam('contactIndex') ? props.navigation.getParam('contactIndex') : null,
        //   });
        // }}
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
        type == "pdf" || type == "contact"
          ? notificationType.uploadSecondaryShare
          : notificationType.approveKeeper
      )
    );
    if ((type == "pdf" || type == "contact") && keeperApproveStatus.shareId != selectedKeeper.shareId) {
      dispatch(
        onApprovalStatusChange({
          status: false,
          initiatedAt: moment(new Date()).valueOf(),
          shareId: selectedKeeper.shareId,
        })
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
      (QrBottomSheet as any).current.snapTo(1);
    }
    if (type == "pdf") {
      props.navigation.navigate("PersonalCopyHistoryKeeper", {
        ...props.navigation.state.params,
        selectedTitle: name,
      });
    }
  };

  useEffect(() => {
    if (
      selectedContact &&
      selectedContact.firstName &&
      SHARES_TRANSFER_DETAILS[selectedContact.index]
    ) {
      const contactName = `${selectedContact.firstName} ${
        selectedContact.lastName ? selectedContact.lastName : ""
      }`
        .toLowerCase()
        .trim();
      console.log({ contactName });
      if (!trustedContacts.tc.trustedContacts[contactName]) return;
      createDeepLink();
    }
  }, [
    SHARES_TRANSFER_DETAILS[selectedContact.index],
    selectedContact,
    trustedContacts,
    // uploadMetaShare,
    // updateEphemeralChannelLoader,
    // updateTrustedChannelLoader,
  ]);

  const createDeepLink = useCallback(() => {
    let chosenContact: any = selectedContact;
    try {
      if (!chosenContact) {
        console.log("Err: Contact missing");
        return;
      }
      if (!SHARES_TRANSFER_DETAILS[chosenContact.index]) {
        setTimeout(() => {
          setErrorMessageHeader("Failed to share");
          setErrorMessage(
            "There was some error while sharing the Recovery Key, please try again"
          );
        }, 2);
        (ErrorBottomSheet as any).current.snapTo(1);
        return;
      }

      const contactName = `${chosenContact.firstName} ${
        chosenContact.lastName ? chosenContact.lastName : ""
      }`
        .toLowerCase()
        .trim();
      if (
        !trustedContacts.tc.trustedContacts[contactName] &&
        !trustedContacts.tc.trustedContacts[contactName].ephemeralChannel
      ) {
        console.log(
          "Err: Trusted Contact/Ephemeral Channel does not exists for contact: ",
          contactName
        );
        return;
      }
      const {
        publicKey,
        symmetricKey,
        otp,
      } = trustedContacts.tc.trustedContacts[contactName];
      setPublicKey(publicKey);
      const requester = database.WALLET_SETUP.walletName;
      const appVersion = DeviceInfo.getVersion();
      if (chosenContact.phoneNumbers && chosenContact.phoneNumbers.length) {
        const phoneNumber = chosenContact.phoneNumbers[0].number;
        console.log({ phoneNumber });
        let number = phoneNumber.replace(/[^0-9]/g, ""); // removing non-numeric characters
        number = number.slice(number.length - 10); // last 10 digits only
        const numHintType = "num";
        const numHint = number[0] + number.slice(number.length - 2);
        const numberEncPubKey = TrustedContactsService.encryptPub(
          publicKey,
          number
        ).encryptedPub;
        const numberDL =
          `https://hexawallet.io/${config.APP_STAGE}/scns` +
          `/${requester}` +
          `/${numberEncPubKey}` +
          `/${numHintType}` +
          `/${numHint}` +
          `/v${appVersion}`;
        console.log({ numberDL });
        setIsOtpType(false);
        setLinkToRequest(numberDL);
      } else if (chosenContact.emails && chosenContact.emails.length) {
        const email = chosenContact.emails[0].email;
        const emailHintType = "eml";
        const trucatedEmail = email.replace(".com", "");
        const emailHint =
          email[0] + trucatedEmail.slice(trucatedEmail.length - 2);
        const emailEncPubKey = TrustedContactsService.encryptPub(
          publicKey,
          email
        ).encryptedPub;

        const emailDL =
          `https://hexawallet.io/${config.APP_STAGE}/scns/${
            symmetricKey ? "atcg" : "tcg"
          }` +
          `/${requester}` +
          `/${emailEncPubKey}` +
          `/${emailHintType}` +
          `/${emailHint}` +
          `/v${appVersion}`;
        console.log({ emailDL });
        setIsOtpType(false);
        setLinkToRequest(emailDL);
      } else if (otp) {
        const otpHintType = "otp";
        const otpHint = "xxx";
        const otpEncPubKey = TrustedContactsService.encryptPub(publicKey, otp)
          .encryptedPub;

        const otpDL =
          `https://hexawallet.io/${config.APP_STAGE}/scns/${
            symmetricKey ? "atcg" : "tcg"
          }` +
          `/${requester}` +
          `/${otpEncPubKey}` +
          `/${otpHintType}` +
          `/${otpHint}` +
          `/v${appVersion}`;
        setIsOtpType(true);
        setOtp(otp);
        setLinkToRequest(otpDL);
      } else {
        Alert.alert("Invalid Contact", "Something went wrong.");
        return;
      }
      dispatch(
        onApprovalStatusChange(
          {
            status: false,
            initiatedAt: moment(new Date()).valueOf(),
            shareId: 'PK_recovery',
            transferDetails: {key: publicKey.substring(0, 24), otp: ''}
          })
      );
    } catch (error) {
      console.log("error TC", error);
    }
  }, [selectedContact, trustedContacts]);

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
            if (isPrimaryKeeper) {
              console.log("contactList.length", contactList.length);
              if (contactList.length) {
                if(keeperApproveStatus.shareId == 'PK_recovery' && keeperApproveStatus.secondaryShare) {
                  (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(1);
                } else {
                  (ContactListForRestoreBottomSheet as any).current.snapTo(1);
                }                
              } else {
                setQrBottomSheetsFlag(true);
                (QrBottomSheet as any).current.snapTo(1);
              }
            } else {
              sendApprovalRequestToPK(
                isPrimaryKeeper ? "primaryKeeper" : "device"
              );
            }
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
        ref={ApprovePrimaryKeeperBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("60%") : hp("70"),
        ]}
        renderContent={() => (
          <ApproveSetup
            isContinueDisabled={
                selectedKeeperType != "device"
                ? !keeperApproveStatus.status
                : false
            }
            onPressContinue={() => {
              if (isPrimaryKeeper) {
                (QrBottomSheet.current as any).snapTo(1);
                (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(0);
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
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={SendViaLinkBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("83%") : hp("85%"),
        ]}
        renderContent={() => (
          <SendViaLink
            headerText={"Send Request"}
            subHeaderText={"Send a Primary Keeper recovery request link"}
            contactText={"Requesting for Primary Keeper recovery:"}
            contact={selectedContact ? selectedContact : null}
            contactEmail={""}
            infoText={`Click here to accept Keeper request for ${
              database.WALLET_SETUP.walletName
            } Hexa wallet- link will expire in ${
              config.TC_REQUEST_EXPIRY / (60000 * 60)
            } hours`}
            link={linkToRequest}
            onPressBack={() => {
              if (isOtpType) {
                setRenderTimer(true);
                (shareOtpWithTrustedContactBottomSheet as any).snapTo(1);
              }
              (SendViaLinkBottomSheet as any).current.snapTo(0);
              (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(1);
            }}
            onPressDone={() => {
              if (isOtpType) {
                setRenderTimer(true);
                (shareOtpWithTrustedContactBottomSheet as any).snapTo(1);
                (SendViaLinkBottomSheet as any).current.snapTo(0);
              }else{
                (SendViaLinkBottomSheet as any).current.snapTo(0);
                (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(1);
              }
              dispatch(
                onApprovalStatusChange(
                  {
                    status: false,
                    initiatedAt: moment(new Date()).valueOf(),
                    shareId: 'PK_recovery',
                    transferDetails: {key: publicKey.substring(0, 24), otp: ''}
                  })
              );
            }}
          />
        )}
        renderHeader={() => <ModalHeader />}
      />
      <BottomSheet
        onCloseEnd={() => {}}
        enabledInnerScrolling={true}
        ref={shareOtpWithTrustedContactBottomSheet as any}
        snapPoints={[-30, hp("65%")]}
        renderContent={() => (
          <ShareOtpWithTrustedContact
            renderTimer={renderTimer}
            onPressOk={() => {
              setRenderTimer(false);
              (shareOtpWithTrustedContactBottomSheet as any).snapTo(0);
            }}
            onPressBack={() => {
              setRenderTimer(false);
              (shareOtpWithTrustedContactBottomSheet as any).snapTo(0);
            }}
            OTP={otp}
          />
        )}
        renderHeader={() => (
          <ModalHeader
            onPressHeader={() => {
              setRenderTimer(false);
              (shareOtpWithTrustedContactBottomSheet as any).snapTo(0);
            }}
          />
        )}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ContactListForRestoreBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("50%") : hp("60%"),
        ]}
        renderContent={() => {
          return (
            <ContactListForRestore
              title={"Select Contact to Create link"}
              subText={
                "Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diamnonumy eirmod"
              }
              info={
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore."
              }
              contactList={contactList}
              modalRef={ContactListForRestoreBottomSheet}
              onPressCard={(contact, index) => {
                setSelectedContact(contact.data);
                console.log("contact", contact);
                (ContactListForRestoreBottomSheet as any).current.snapTo(0);
                (SendViaLinkBottomSheet as any).current.snapTo(1);
              }}
            />
          );
        }}
        renderHeader={() => (
          <ModalHeader
            onPressHeader={() =>
              (ContactListForRestoreBottomSheet as any).current.snapTo(0)
            }
          />
        )}
      />
    </View>
  );
};

export default KeeperDeviceHistory;

const styles = StyleSheet.create({});
