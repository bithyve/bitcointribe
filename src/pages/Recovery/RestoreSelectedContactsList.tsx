import React, { useState, useEffect } from "react";
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
  TextInput,
  KeyboardAvoidingView,
  AsyncStorage
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import Fonts from "../../common/Fonts";
import Colors from "../../common/Colors";
import CommonStyles from "../../common/Styles";
import { RFValue } from "react-native-responsive-fontsize";
import BottomSheet from "reanimated-bottom-sheet";
import DeviceInfo from "react-native-device-info";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import Feather from "react-native-vector-icons/Feather";
import HeaderTitle from "../../components/HeaderTitle";
import BottomInfoBox from "../../components/BottomInfoBox";
import KnowMoreButton from "../../components/KnowMoreButton";
import RequestModalContents from "../../components/RequestModalContents";
import TransparentHeaderModal from "../../components/TransparentHeaderModal";
import Entypo from "react-native-vector-icons/Entypo";
import RecoveryQuestionModalContents from "../../components/RecoveryQuestionModalContents";
import RecoverySuccessModalContents from "../../components/RecoverySuccessModalContents";
import RecoveryWalletNameModalContents from "../../components/RecoveryWalletNameModalContents";

export default function RestoreSelectedContactsList(props) {
  const walletDetails = props.navigation.getParam("walletDetails");

  const [selectedContacts, setSelectedContacts] = useState([]);
  const [walletNameBottomSheet, setWalletNameBottomSheet] = useState(
    React.createRef()
  );
  const [successMessageBottomSheet, setSuccessMessageBottomSheet] = useState(
    React.createRef()
  );
  const [
    recoveryQuestionBottomSheet,
    setRecoveryQuestionBottomSheet
  ] = useState(React.createRef());
  const [requestBottomSheet, setRequestBottomSheet] = useState(
    React.createRef()
  );
  const [walletNameOpenModal, setWalletNameOpenModal] = useState("close");
  // const [walletName, setWalletName] = useState("");
  const [isContactSelected, setIsContactSelected] = useState(true);
  const [dropdownBoxValue, setDropdownBoxValue] = useState({
    id: "",
    question: ""
  });
  const [answer, setAnswer] = useState("");

  // function openCloseModal() {
  //   if (!walletName) {
  //     walletNameBottomSheet.current.snapTo(0);
  //     return;
  //   }
  //   if (walletNameOpenModal == "closed") {
  //     setWalletNameOpenModal("half");
  //     return;
  //   }
  //   if (walletNameOpenModal == "half") {
  //     setWalletNameOpenModal("full");
  //     return;
  //   }
  //   if (walletNameOpenModal == "full") {
  //     setWalletNameOpenModal("closed");
  //     return;
  //   }
  // }

  const getSelectedContactList = async () => {
    let contactList = await AsyncStorage.getItem("selectedContacts");
    if (contactList) {
      setSelectedContacts(JSON.parse(contactList));
    }
  };

  useEffect(() => {
    let focusListener = props.navigation.addListener("didFocus", () => {
      getSelectedContactList();
    });
    return () => {
      focusListener.remove();
    };
  }, []);

  useEffect(() => {
    if (walletNameOpenModal == "closed") {
      walletNameBottomSheet.current.snapTo(0);
    }
    if (walletNameOpenModal == "half") {
      walletNameBottomSheet.current.snapTo(1);
    }
    if (walletNameOpenModal == "full") {
      walletNameBottomSheet.current.snapTo(2);
    }
  }, [walletNameOpenModal]);

  const openRequestModal = () => {
    requestBottomSheet.current.snapTo(1);
  };

  function renderContent() {
    return (
      <RecoveryWalletNameModalContents
        onTextChange={text => {
          setWalletName(text);
        }}
        onPressTextBoxFocus={() => {
          setWalletNameOpenModal("full");
        }}
        onPressTextBoxBlur={() => {
          setWalletNameOpenModal("half");
        }}
        onPressProceed={() => {
          walletNameBottomSheet.current.snapTo(0);
          recoveryQuestionBottomSheet.current.snapTo(1);
        }}
      />
    );
  }

  const onPressRequest = async () => {
    let selectedContacts = JSON.parse(
      await AsyncStorage.getItem("selectedContacts")
    );
    if (!selectedContacts[0].status && !selectedContacts[1].status) {
      selectedContacts[1].status = "received";
    } else if (selectedContacts[1].status == "received") {
      selectedContacts[0].status = "inTransit";
      selectedContacts[1].status = "rejected";
    }
    AsyncStorage.setItem("selectedContacts", JSON.stringify(selectedContacts));
    getSelectedContactList();
    requestBottomSheet.current.snapTo(0);
  };

  const RequestModalContentFunction = () => {
    return (
      <RequestModalContents
        onPressRequest={() => onPressRequest()}
        onPressViaQr={() => {}}
      />
    );
  };

  const RequestHeaderFunction = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          requestBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  function renderHeader() {
    return <TransparentHeaderModal onPressheader={() => closeModal()} />;
  }

  function closeModal() {
    successMessageBottomSheet.current.snapTo(0);
    recoveryQuestionBottomSheet.current.snapTo(0);
    walletNameBottomSheet.current.snapTo(0);
    return;
  }

  const submitRecoveryQuestion = () => {
    recoveryQuestionBottomSheet.current.snapTo(0);
    successMessageBottomSheet.current.snapTo(1);
  };

  function renderRecoveryQuestionContent() {
    return (
      <RecoveryQuestionModalContents
        onQuestionSelect={value => {
          setDropdownBoxValue(value);
        }}
        onTextChange={text => {
          setAnswer(text);
        }}
        onPressConfirm={() => submitRecoveryQuestion()}
        onPressKnowMore={() => {}}
        bottomSheetRef={recoveryQuestionBottomSheet}
      />
    );
  }

  function renderSuccessContent() {
    return (
      <RecoverySuccessModalContents
        walletName={"Pam’s Wallet"}
        walletAmount={"2,065,000"}
        walletUnit={"sats"}
        onPressGoToWallet={() => {
          props.navigation.navigate("Home");
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.navigate("RestoreAndRecoverWallet");
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <HeaderTitle
          firstLineTitle={"Restore wallet using"}
          secondLineTitle={"Recovery Secrets"}
          infoTextNormal={
            "These are the Recovery Secrets that you have stored in five places. "
          }
          infoTextBold={"You need three of them restore your wallet"}
        />
        <TouchableOpacity
          style={{ ...styles.listElements, marginTop: 60 }}
          onPress={() =>
            props.navigation.navigate("RestoreWalletBySecondaryDevice", {
              walletName: walletDetails.walletName
            })
          }
        >
          <Image
            style={styles.iconImage}
            source={require("../../assets/images/icons/icon_secondarydevice.png")}
          />
          <View style={styles.textInfoView}>
            <Text style={styles.listElementsTitle}>Secondary Device (One)</Text>
            <Text style={styles.listElementsInfo}>
              You need your secondary device with you to scan the QR code
            </Text>
          </View>
          <View style={styles.listElementIcon}>
            <Ionicons
              name="ios-arrow-forward"
              color={Colors.textColorGrey}
              size={15}
              style={{ alignSelf: "center" }}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          onPress={() => props.navigation.navigate("RestoreWalletByContacts")}
        >
          <View
            style={{
              ...styles.listElements,
              marginBottom: selectedContacts.length > 0 ? 0 : 10
            }}
          >
            <Image
              style={styles.iconImage}
              source={require("../../assets/images/icons/icon_contact.png")}
            />
            <View style={styles.textInfoView}>
              <Text style={styles.listElementsTitle}>
                Trusted Contacts (Two)
              </Text>
              <Text style={styles.listElementsInfo}>
                Select one or two contacts with whom you have stored your
                recover secret
              </Text>
            </View>
            <View style={styles.listElementIcon}>
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={15}
                style={{ alignSelf: "center" }}
              />
            </View>
          </View>
          {selectedContacts.length > 0 && (
            <View style={{}}>
              {selectedContacts.map(value => {
                return (
                  <TouchableOpacity
                    activeOpacity={value.status == "" ? 0 : 10}
                    onPress={() =>
                      value.status == "" ? openRequestModal() : {}
                    }
                    style={{ ...styles.selectedContactView, marginBottom: 15 }}
                  >
                    <View>
                      <Text style={styles.selectedContactName}>
                        {value.name.split(" ")[0]}{" "}
                        <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
                          {value.name.split(" ")[1]}
                        </Text>
                      </Text>
                      <Text
                        style={{
                          ...styles.selectedContactName,
                          fontSize: RFValue(11, 812)
                        }}
                      >
                        {value.communicationMode
                          ? value.communicationMode[0].info
                          : ""}
                      </Text>
                    </View>
                    {value.status == "received" ? (
                      <View
                        style={{ flexDirection: "row", marginLeft: "auto" }}
                      >
                        <View
                          style={{
                            ...styles.secretReceivedView,
                            backgroundColor: Colors.green
                          }}
                        >
                          <Text
                            style={{
                              ...styles.secretReceivedText,
                              color: Colors.darkGreen
                            }}
                          >
                            Secret Receieved
                          </Text>
                        </View>
                        <View
                          style={{
                            ...styles.secretReceivedCheckSignView,
                            backgroundColor: Colors.green
                          }}
                        >
                          <Feather
                            name={"check"}
                            size={12}
                            color={Colors.darkGreen}
                          />
                        </View>
                      </View>
                    ) : value.status == "inTransit" ? (
                      <View
                        style={{ flexDirection: "row", marginLeft: "auto" }}
                      >
                        <View
                          style={{
                            ...styles.secretReceivedView,
                            backgroundColor: Colors.lightBlue
                          }}
                        >
                          <Text
                            style={{
                              ...styles.secretReceivedText,
                              color: Colors.blue
                            }}
                          >
                            Secret In-Transit
                          </Text>
                        </View>
                        <View
                          style={{
                            ...styles.secretReceivedCheckSignView,
                            backgroundColor: Colors.lightBlue
                          }}
                        >
                          <Ionicons
                            name={"md-time"}
                            size={15}
                            color={Colors.blue}
                          />
                        </View>
                      </View>
                    ) : value.status == "rejected" ? (
                      <View
                        style={{ flexDirection: "row", marginLeft: "auto" }}
                      >
                        <View
                          style={{
                            ...styles.secretReceivedView,
                            backgroundColor: Colors.lightRed
                          }}
                        >
                          <Text
                            style={{
                              ...styles.secretReceivedText,
                              color: Colors.red
                            }}
                          >
                            Rejected by Contact
                          </Text>
                        </View>
                        <View
                          style={{
                            height: 25,
                            width: 25,
                            justifyContent: "center",
                            alignItems: "center",
                            marginLeft: 5
                          }}
                        >
                          <Entypo
                            name={"dots-three-horizontal"}
                            size={15}
                            color={Colors.borderColor}
                          />
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => openRequestModal()}
                        style={{ flexDirection: "row", marginLeft: "auto" }}
                      >
                        <Text>{value.status}</Text>
                        <View style={styles.dotsView} />
                        <View style={styles.dotsView} />
                        <View style={styles.dotsView} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.separator} />
        <TouchableOpacity
          style={{ ...styles.listElements, marginBottom: hp("5%") }}
          onPress={() =>
            props.navigation.navigate("RestoreWalletUsingDocuments")
          }
        >
          <Image
            style={styles.iconImage}
            source={require("../../assets/images/icons/files-and-folders-2.png")}
          />
          <View style={styles.textInfoView}>
            <Text style={styles.listElementsTitle}>Personal Copies (Two)</Text>
            <Text style={styles.listElementsInfo}>
              Select one or two of the sources where you have kept the Recovery
              Secret
            </Text>
          </View>
          <View style={styles.listElementIcon}>
            <Ionicons
              name="ios-arrow-forward"
              color={Colors.textColorGrey}
              size={15}
              style={{ alignSelf: "center" }}
            />
          </View>
        </TouchableOpacity>
        <View style={{ justifyContent: "center" }}>
          <TouchableOpacity
            style={{ ...styles.questionConfirmButton, margin: 20 }}
            onPress={() => {
              walletNameBottomSheet.current.snapTo(1);
            }}
          >
            <Text style={styles.proceedButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomSheet
        enabledInnerScrolling={true}
        ref={walletNameBottomSheet}
        snapPoints={[
          0,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("50%") : hp("60%"),
          Platform.OS == "ios" ? hp("90%") : hp("55%")
        ]}
        renderContent={renderContent}
        renderHeader={renderHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={successMessageBottomSheet}
        snapPoints={[
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? 0 : 0,
          hp("60%")
        ]}
        renderContent={renderSuccessContent}
        renderHeader={renderHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={recoveryQuestionBottomSheet}
        snapPoints={[
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? 0 : 0,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("67%") : hp("72%"),
          Platform.OS == "ios" ? hp("90%") : hp("72%")
        ]}
        renderContent={renderRecoveryQuestionContent}
        renderHeader={renderHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={requestBottomSheet}
        snapPoints={[
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? 0 : 0,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("60%") : hp("75%")
        ]}
        renderContent={RequestModalContentFunction}
        renderHeader={RequestHeaderFunction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listElements: {
    flexDirection: "row",
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: "center"
  },
  listElementsTitle: {
    color: Colors.blue,
    fontSize: RFValue(13, 812),
    marginLeft: 13,
    marginBottom: 5,
    fontFamily: Fonts.FiraSansRegular
  },
  listElementsInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11, 812),
    marginLeft: 13,
    fontFamily: Fonts.FiraSansRegular
  },
  listElementIcon: {
    paddingRight: 5,
    marginLeft: 25,
    justifyContent: "center",
    alignItems: "center"
  },
  dotsView: {
    backgroundColor: Colors.borderColor,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5
  },
  separator: {
    borderBottomColor: Colors.backgroundColor,
    borderBottomWidth: 5
  },
  iconImage: {
    resizeMode: "contain",
    width: 25,
    height: 30,
    alignSelf: "center"
  },
  textInfoView: {
    justifyContent: "space-between",
    flex: 1
  },

  selectedContactView: {
    marginLeft: 20,
    marginRight: 20,
    height: 50,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 15
  },
  selectedContactName: {
    marginLeft: 10,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey
  },
  secretReceivedView: {
    borderRadius: 5,
    height: 25,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  secretReceivedText: {
    fontSize: RFValue(9, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  secretReceivedCheckSignView: {
    backgroundColor: Colors.green,
    borderRadius: 25 / 2,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5
  },
  questionConfirmButton: {
    height: wp("13%"),
    width: wp("35%"),
    justifyContent: "center",
    borderRadius: 8,
    alignItems: "center",
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.blue,
    marginTop: hp("6%")
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  }
});
