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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import CommonStyles from "../../common/Styles";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import HeaderTitle from "../../components/HeaderTitle";
import { RFValue } from "react-native-responsive-fontsize";
import ContactList from "../../components/ContactList";
import { uploadEncMShare } from "../../store/actions/sss";
import { useDispatch, useSelector } from "react-redux";
import { getIconByStatus } from "../ManageBackup/utils";

const RestoreWalletByContact = props => {
  const [selectedStatus, setSelectedStatus] = useState("error"); // for preserving health of this entity
  const [contacts, setContacts] = useState([]);

  const index = props.navigation.getParam("index");

  function selectedContactsList(list) {
    if (list.length > 0) setContacts([...list]);
  }

  const dispatch = useDispatch();
  const { DECENTRALIZED_BACKUP } = useSelector(state => state.storage.database);
  const { SHARES_TRANSFER_DETAILS } = DECENTRALIZED_BACKUP;

  const continueNProceed = async () => {
    if (!SHARES_TRANSFER_DETAILS[index]) dispatch(uploadEncMShare(index));
    else console.log(SHARES_TRANSFER_DETAILS[index]);
    // communicationModeBottomSheet.current.snapTo(1);
    props.navigation.navigate("CommunicationMode", {
      contact: contacts[0],
      index
    });
  };

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
