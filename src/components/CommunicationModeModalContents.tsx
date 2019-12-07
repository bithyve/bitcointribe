import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator
} from "react-native";
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import RadioButton from "../components/RadioButton";
import { useSelector } from "react-redux";

export default function CommunicationModeModalContents(props) {
  const { contact } = props;
  if (!contact) return <View></View>;

  const communicationInfo = [...contact.phoneNumbers, ...contact.emails];

  const [selectedContactMode, setSelectedContactMode] = useState();
  const [contactInfo, setContactInfo] = useState(
    communicationInfo.map(({ number, email }, index) => {
      return {
        id: index,
        info: number || email,
        isSelected: false,
        type: number ? "number" : "email"
      };
    })
  );

  const onContactSelect = index => {
    setContactInfo([
      ...contactInfo.map(item => {
        if (item !== contactInfo[index]) {
          return {
            ...item,
            isSelected: false
          };
        } else {
          return {
            ...item,
            isSelected: !item.isSelected
          };
        }
      })
    ]);
    // contactInfo[index].isSelected would become true during the next render cycle (batched state updates)
    if (!contactInfo[index].isSelected) {
      setSelectedContactMode({ ...contactInfo[index], isSelected: true });
    } else {
      setSelectedContactMode(null);
    }
  };

  const { loading } = useSelector(state => state.sss);

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
            <Image
              source={require("../assets/images/icons/pexels-photo.png")}
              style={styles.contactProfileImage}
            />
            <Text style={styles.contactNameText}>{contact.name}</Text>
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
        {selectedContactMode ? (
          <TouchableOpacity
            onPress={() => props.onPressProceed(selectedContactMode)}
            disabled={loading.uploadMetaShare}
            style={{
              ...styles.proceedButtonView,
              backgroundColor: Colors.blue
            }}
          >
            {loading.uploadMetaShare ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.proceedButtonText}>Proceed</Text>
            )}
          </TouchableOpacity>
        ) : null}
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
    fontSize: RFValue(18, 812),
    marginLeft: 20,
    marginRight: 20
  },
  commModeModalInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11, 812),
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
    fontSize: RFValue(25, 812),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 20
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
    fontSize: RFValue(13, 812),
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
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  }
});
