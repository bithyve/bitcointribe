import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ScrollView,
  AsyncStorage,
  FlatList
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import Fonts from "../../common/Fonts";
import Colors from "../../common/Colors";
import CommonStyles from "../../common/Styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import BottomSheet from "reanimated-bottom-sheet";
import HeaderTitle from "../../components/HeaderTitle";
import ContactList from "./ContactList";
import DeviceInfo from "react-native-device-info";
import RadioButton from "../../components/RadioButton";
import CommunicationModeModalContents from "../../components/CommunicationModeModalContents";

export default function RestoreWalletByContacts(props) {
  //   const [contacts, setContacts] = useState([]);
  //   const [requestBottomSheet, setRequestBottomSheet] = useState(
  //     React.createRef()
  //   );
  //   const [communicationModeBottomSheet, setCommunicationMode] = useState(
  //     React.createRef()
  //   );

  //   function selectedContactsList(list) {
  //     setContacts(list);
  //   }

  const continueNProceed = async contacts => {
    // communicationModeBottomSheet.current.snapTo(1);
    await AsyncStorage.setItem("selectedContacts", JSON.stringify(contacts));
    props.navigation.navigate("RestoreSelectedContactsList");
  };

  //   const saveCommunicationMode = async selectedContactMode => {
  //     if (contacts.length > 0) {
  //       if (
  //         contacts[0].communicationMode &&
  //         contacts[0].communicationMode.length > 0
  //       ) {
  //         contacts[1].communicationMode = selectedContactMode;
  //       } else {
  //         contacts[0].communicationMode = selectedContactMode;
  //       }
  //     } else {
  //       contacts[0].communicationMode = selectedContactMode;
  //     }
  //     setContacts(contacts);
  //     await AsyncStorage.setItem("selectedContacts", JSON.stringify(contacts));
  //     console.log("contacts", contacts);
  //     props.navigation.navigate("RestoreSelectedContactsList");
  //   };

  //   function requestHeader() {
  //     return (
  //       <TouchableOpacity
  //         activeOpacity={10}
  //         onPress={() => closeModal()}
  //         style={{ ...styles.modalHeaderContainer }}
  //       >
  //         <View style={styles.modalHeaderHandle} />
  //       </TouchableOpacity>
  //     );
  //   }

  //   function closeModal() {
  //     communicationModeBottomSheet.current.snapTo(0);
  //     return;
  //   }

  //   function renderCommunicationModeContent() {
  //     return (
  //       <CommunicationModeModalContents
  //         onPressProceed={selectedContactMode =>
  //           saveCommunicationMode(selectedContactMode)
  //         }
  //       />
  //     );
  //   }

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
          <ContactList style={{}} continueNProceed={continueNProceed} />
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
}

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
