import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";
import { RFValue } from "react-native-responsive-fontsize";
import ContactList from "../components/ContactList";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function AddressBookContents(props) {
  const [contactData, setContactData] = useState([
    {
      name: "Shivani Altekar",
      checked: false,
      id: 1,
      communicationMode: [],
      status: ""
    },
    {
      name: "Uma AmravatiKr",
      checked: false,
      id: 2,
      communicationMode: [],
      status: ""
    },
    {
      name: "Adison Alter",
      checked: false,
      id: 3,
      communicationMode: [],
      status: ""
    },
    {
      name: "Add Add",
      checked: false,
      id: 4,
      communicationMode: [],
      status: ""
    },
    {
      name: "Raj Boke",
      checked: false,
      id: 5,
      communicationMode: [],
      status: ""
    },
    {
      name: "Samantha Bhujange",
      checked: false,
      id: 6,
      communicationMode: [],
      status: ""
    },
    {
      name: "Kaweri Balwihari",
      checked: false,
      id: 7,
      communicationMode: [],
      status: ""
    },
    {
      name: "Radhesham Bichkule",
      checked: false,
      id: 8,
      communicationMode: [],
      status: ""
    },
    {
      name: "Rameswar Bihari",
      checked: false,
      id: 9,
      communicationMode: [],
      status: ""
    },
    {
      name: "Shahaji Buchade",
      checked: false,
      id: 10,
      communicationMode: [],
      status: ""
    },
    {
      name: "Shabnam Chitale",
      checked: false,
      id: 11,
      communicationMode: [],
      status: ""
    }
  ]);
  const [alphabetsList] = useState([
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z"
  ]);
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => props.onPressBack()}
            style={{ height: 30, width: 30, justifyContent: "center" }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitleText}>{"Address Book"}</Text>
        </View>
      </View>
      <View>
        <Text style={styles.pageTitle}>Pending Action</Text>
        <Text style={styles.pageInfoText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing
        </Text>
        <View style={styles.selectedContactsView}>
          <Text style={styles.contactsNameText}>
            Anant{" "}
            <Text style={{ fontFamily: Fonts.FiraSansMedium }}>Tapadia</Text>
          </Text>
          <TouchableOpacity style={styles.shareButtonView}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{ ...styles.selectedContactsView, marginBottom: hp("3%") }}
        >
          <Text style={styles.contactsNameText}>
            Mir Liyaqat{" "}
            <Text style={{ fontFamily: Fonts.FiraSansMedium }}>Ali</Text>
          </Text>
          <TouchableOpacity style={styles.shareButtonView}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flex: 11 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {contactData.map((value, index) => {
                return (
                  <TouchableOpacity style={styles.contactView}>
                    <Text style={styles.contactText}>
                      {value.name.split(" ")[0]}{" "}
                      <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
                        {value.name.split(" ")[1]}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <View style={styles.contactIndexView}>
            <TouchableOpacity>
              <Text style={styles.contactIndexText}>#</Text>
            </TouchableOpacity>
            {alphabetsList.map(value => (
              <TouchableOpacity>
                <Text style={styles.contactIndexText}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
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
    alignItems: "center",
    flexDirection: "row",
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginBottom: 15
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  modalContentView: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  contactView: {
    height: 50,
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 20
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  contactIndexText: {
    fontSize: RFValue(10, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  contactIndexView: {
    flex: 0.5,
    height: "100%",
    justifyContent: "space-evenly"
  },
  selectedContactsView: {
    marginLeft: 30,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginTop: 15
  },
  contactsNameText: {
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  shareButtonView: {
    height: wp("8%"),
    width: wp("15%"),
    backgroundColor: Colors.backgroundColor,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 5,
    marginLeft: "auto",
    justifyContent: "center",
    alignItems: "center"
  },
  shareButtonText: {
    fontSize: RFValue(10, 812),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey
  },
  pageTitle: {
    marginLeft: 30,
    color: Colors.blue,
    fontSize: RFValue(14, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  pageInfoText: {
    marginLeft: 30,
    color: Colors.textColorGrey,
    fontSize: RFValue(10, 812),
    fontFamily: Fonts.FiraSansRegular
  }
});
