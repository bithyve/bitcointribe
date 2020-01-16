import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  TextInput
} from "react-native";
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import RadioButton from "../components/RadioButton";

export default function CommunicationModeModalContents(props) {
  const [selectedContactMode, setSelectedContactMode] = useState([]);
  const [contactInfo, setContactInfo] = useState([
    {
      id: 1,
      info: "+91 000 000 0000",
      isSelected: false
    },
    {
      id: 2,
      info: "+44 0000 000000",
      isSelected: false
    },
    {
      id: 3,
      info: "sophiebabel@bithyve.com",
      isSelected: false
    }
  ]);
  const [radioOnOff, setRadioOnOff] = useState(false);
  const onContactSelect = async index => {
    contactInfo[index].isSelected = !contactInfo[index].isSelected;
    setContactInfo(contactInfo);
    if (contactInfo[index].isSelected) {
      selectedContactMode.push(contactInfo[index]);
    } else if (
      selectedContactMode.findIndex(
        value => value.id == contactInfo[index].id
      ) > -1 &&
      !contactInfo[index].isSelected
    ) {
      selectedContactMode.splice(
        selectedContactMode.findIndex(temp => temp.id == contactInfo[index].id),
        1
      );
    }
    setSelectedContactMode(selectedContactMode);
    console.log("selectedContactMode", selectedContactMode);
    setRadioOnOff(!radioOnOff);
  };

  return (
    <View style={{ ...styles.modalContentContainer, height: "100%" }}>
      <View style={{ height: "100%" }}>
        <View style={{ marginTop: hp("3.5%"), marginBottom: hp("2%") }}>
          <Text style={styles.commModeModalHeaderText}>
            Select Mode of Communication{"\n"}for Contact
          </Text>
          <Text style={styles.commModeModalInfoText}>
            You can choose a primary number or email
          </Text>
        </View>
        <View style={styles.contactProfileView}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: Colors.backgroundColor,
                flex: 1,
                height: 80,
                justifyContent: "center",
                marginLeft: 60,
                overflow: "hidden",
                position: "relative",
                borderRadius: 10
              }}
            >
              <Text style={styles.contactNameText}>Sophie Babel</Text>
            </View>
            <View
              style={{
                backgroundColor: Colors.white,
                width: 80,
                height: 80,
                borderRadius: 80 / 2,
                position: "absolute",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Image
                source={require("../assets/images/icons/pexels-photo.png")}
                style={{ ...styles.contactProfileImage }}
              />
            </View>
          </View>
        </View>
        <View>
          <ScrollView>
            {contactInfo.map((item, index) => {
              return (
                <TouchableOpacity
                  onPress={() => onContactSelect(index)}
                  style={styles.contactInfo}
                >
                  <RadioButton
                    size={15}
                    color={Colors.lightBlue}
                    borderColor={Colors.borderColor}
                    isChecked={item.isSelected}
                    onpress={() => onContactSelect(index)}
                  />
                  <Text style={styles.contactInfoText}>{item.info}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        {selectedContactMode.length > 0 && (
          <TouchableOpacity
            onPress={() => props.onPressProceed(selectedContactMode)}
            style={{
              ...styles.proceedButtonView,
              backgroundColor: Colors.blue
            }}
          >
            <Text style={styles.proceedButtonText}>Proceed</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: "100%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1
  },
  commModeModalHeaderText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(18),
    marginLeft: 20,
    marginRight: 20
  },
  commModeModalInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginLeft: 20,
    marginRight: 20,
    marginTop: hp("0.7%")
  },
  contactProfileView: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp("3%"),
    marginTop: hp("3.5%")
  },
  contactProfileImage: {
    width: 70,
    height: 70,
    resizeMode: "cover",
    borderRadius: 70 / 2
  },
  contactNameText: {
    color: Colors.black,
    fontSize: RFValue(25),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: "cover"
  },
  contactInfo: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: hp("2%"),
    marginBottom: hp("2%")
  },
  contactInfoText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
    marginLeft: 10
  },
  proceedButtonView: {
    marginLeft: 20,
    marginTop: hp("3.5%"),
    height: wp("13%"),
    width: wp("30%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 }
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium
  }
});
