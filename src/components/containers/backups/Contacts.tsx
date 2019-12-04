import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Fonts from "../../../common/Fonts";
import BackupStyles from "./Styles";
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
          onPressContinue={() => props.continueNProceed()}
          onSelectContact={list => selectedContactsList(list)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Contacts;
