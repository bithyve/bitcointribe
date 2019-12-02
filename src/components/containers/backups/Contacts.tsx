import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import Fonts from "../../../common/Fonts";
import Colors from "../../../common/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import ContactList from "../../ContactList";

const Contacts = props => {
  const [selectedStatus, setSelectedStatus] = useState("error"); // for preserving health of this entity
  const [contacts, setContacts] = useState([]);

  function selectedContactsList(list) {
    setContacts(list);
  }

  function continueNProceed() {
    // bottomSheet.current.snapTo(0);
    // setTimeout(() => {
    //   setSelectedType("cloud");
    //   setSelectedStatus("success");
    // }, 1000);
  }

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ marginTop: hp("2%") }}>
          <Text style={styles.modalHeaderTitleText}>Trusted Contact</Text>
          <Text style={styles.modalHeaderInfoText}>Never backed up</Text>
        </View>
        <Image
          style={styles.cardIconImage}
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
          onPressContinue={() => continueNProceed()}
          onSelectContact={list => selectedContactsList(list)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardIconImage: {
    width: 12,
    height: 14,
    resizeMode: "contain",
    marginLeft: "auto"
  },
  modalContainer: {
    height: "100%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: Colors.borderColor,
    alignSelf: "center",
    width: "100%"
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 15
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12, 812),
    marginTop: 5
  },
  modalContentView: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  loader: { height: hp("27%"), justifyContent: "center" }
});

export default Contacts;
