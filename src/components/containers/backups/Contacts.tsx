import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import Fonts from "../../../common/Fonts";
import BackupStyles from "./Styles";
import Colors from "../../../common/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import ContactList from "../../ContactList";
import { uploadEncMShare } from "../../../store/actions/sss";
import { useDispatch, useSelector } from "react-redux";
import CommunicationModeModalContents from "../../CommunicationModeModalContents";
import DeviceInfo from "react-native-device-info";
import BottomSheet from "reanimated-bottom-sheet";
import AsyncStorage from "@react-native-community/async-storage";
import { TouchableOpacity } from "react-native-gesture-handler";

const Contacts = props => {
  const [selectedStatus, setSelectedStatus] = useState("error"); // for preserving health of this entity
  const [contacts, setContacts] = useState([]);
  const [communicationModeBottomSheet, setCommunicationMode] = useState(
    React.createRef()
  );

  function selectedContactsList(list) {
    if (list.length > 0) setContacts([...list]);
  }

  const continueNProceed = async () => {
    communicationModeBottomSheet.current.snapTo(1);
  };

  function requestHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => closeModal()}
        style={{ ...styles.modalHeaderContainer }}
      >
        <View style={styles.modalHeaderHandle} />
      </TouchableOpacity>
    );
  }

  function closeModal() {
    communicationModeBottomSheet.current.snapTo(0);
    return;
  }

  function renderCommunicationModeContent() {
    return (
      <CommunicationModeModalContents
        onPressProceed={selectedContactMode => {
          console.log(selectedContactMode);
        }}
        contact={contacts[0]}
      />
    );
  }

  return (
    <View style={BackupStyles.modalContainer}>
      <View style={BackupStyles.modalHeaderTitleView}>
        <View style={{ marginTop: hp("2%") }}>
          <Text style={BackupStyles.modalHeaderTitleText}>Trusted Contact</Text>
          <Text style={BackupStyles.modalHeaderInfoText}>Never backed up</Text>
        </View>
        <Image
          style={BackupStyles.cardIconImage}
          source={props.getIconByStatus(selectedStatus)}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            marginLeft: 30,
            color: Colors.textColorGrey,
            fontFamily: Fonts.FiraSansRegular,
            fontSize: RFValue(12, 812),
            marginTop: 5
          }}
        >
          Select contact to{" "}
          <Text
            style={{
              fontFamily: Fonts.FiraSansMediumItalic,
              fontWeight: "bold"
            }}
          >
            send recovery secret
          </Text>
        </Text>
        <ContactList
          style={{}}
          onPressContinue={continueNProceed}
          onSelectContact={selectedContactsList}
        />
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={communicationModeBottomSheet}
        snapPoints={[
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? 0 : 0,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("65%") : hp("75%")
        ]}
        renderContent={renderCommunicationModeContent}
        renderHeader={requestHeader}
      />
    </View>
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
export default Contacts;
