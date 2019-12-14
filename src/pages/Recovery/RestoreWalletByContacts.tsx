import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import Colors from "../../common/Colors";
import CommonStyles from "../../common/Styles";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import HeaderTitle from "../../components/HeaderTitle";
import ContactList from "../../components/ContactList";
import { requestShare } from "../../store/actions/sss";
import { useDispatch, useSelector } from "react-redux";

const RestoreWalletByContact = props => {
  const [contacts, setContacts] = useState([]);

  const index = props.navigation.getParam("index");
  if (index !== 1 && index !== 2) throw new Error("Contact index out of bound");

  const { RECOVERY_SHARES } = useSelector(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );

  const { REQUEST_DETAILS } = RECOVERY_SHARES[index]
    ? RECOVERY_SHARES[index]
    : { REQUEST_DETAILS: null };

  const dispatch = useDispatch();
  useEffect(() => {
    if (!REQUEST_DETAILS) dispatch(requestShare(index));
  }, []);

  const continueNProceed = async () => {
    props.navigation.navigate("RecoveryCommunication", {
      contact: contacts[0],
      index
    });
  };

  function selectedContactsList(list) {
    if (list.length > 0) setContacts([...list]);
  }
  // function requestHeader() {
  //   return (
  //     <TouchableOpacity
  //       activeOpacity={10}
  //       onPress={() => closeModal()}
  //       style={{ ...styles.modalHeaderContainer }}
  //     >
  //       <View style={styles.modalHeaderHandle} />
  //     </TouchableOpacity>
  //   );
  // }

  // function closeModal() {
  //   communicationModeBottomSheet.current.snapTo(0);
  //   return;
  // }

  // function renderCommunicationModeContent() {
  //   return (
  //     <CommunicationModeModalContents
  //       onPressProceed={communicate}
  //       contact={contacts[0]}
  //     />
  //   );
  // }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.navigate("RestoreSelectedContactsList");
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
            style={{ height: 54, marginLeft: "auto" }}
            onPress={() => {}}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <Ionicons name="md-search" color={Colors.blue} size={20} />
            </View>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == "ios" ? "padding" : ""}
          enabled
        >
          <HeaderTitle
            isKnowMoreButton={true}
            onPressKnowMore={() => {}}
            firstLineTitle={"Restore wallet using"}
            secondLineTitle={"Contacts"}
            infoTextNormal={"Select contacts to "}
            infoTextBold={"send recovery request"}
          />
          <ContactList
            style={{}}
            onPressContinue={() => continueNProceed()}
            onSelectContact={list => selectedContactsList(list)}
          />
        </KeyboardAvoidingView>
        {/* <BottomSheet
          enabledInnerScrolling={true}
          ref={communicationModeBottomSheet}
          snapPoints={[
            Platform.OS == "ios" && DeviceInfo.hasNotch() ? 0 : 0,
            Platform.OS == "ios" && DeviceInfo.hasNotch()
              ? hp("65%")
              : hp("75%")
          ]}
          renderContent={renderCommunicationModeContent}
          renderHeader={requestHeader}
        /> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalHeaderContainer: {
    paddingTop: 20
  },
  modalHeaderHandle: {
    width: 30,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 7,
    marginBottom: 7
  }
});

export default RestoreWalletByContact;
