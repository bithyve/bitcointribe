import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  TextInput
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
import EvilIcons from 'react-native-vector-icons/EvilIcons';

export default function AddressBookContents(props) {
  const [contactData, setContactData] = useState([
    {
      name: "Anant Tapadia",
      checked: false,
      id: 1,
      communicationMode: [],
      status: ""
    },
    {
      name: "Mir Liyaqat Ali",
      checked: false,
      id: 2,
      communicationMode: [],
      status: ""
    },
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
  const [searchBox, setSearchBox] = useState('');
  const [filterContactData, setFilterContactData] = useState([]);

  useEffect(() => {
    setSearchBox('');
      const contactList = contactData
        .sort(function (a, b) {
          if(a.name && b.name){
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
          }
          return 0;
        })
    setFilterContactData(contactList);
  }, []);

  const filterContacts = (keyword) => {
    if (contactData.length > 0) {
      if (!keyword.length) {
        setFilterContactData(contactData);
        return;
      }
      let isFilter = true;
      let filterContactsForDisplay = [];
      for (let i = 0; i < contactData.length; i++) {
        if (contactData[i].name && contactData[i].name.toLowerCase().startsWith(keyword.toLowerCase())) {
          filterContactsForDisplay.push(contactData[i])
        }
      }
      setFilterContactData(filterContactsForDisplay);
    } else {
      return;
    }
  }


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
        <View style={[styles.searchBoxContainer]}>
          <View style={styles.searchBoxIcon}>
            <EvilIcons style={{ alignSelf: 'center' }} name="search" size={20} color={Colors.textColorGrey} />
          </View>
          <TextInput
            ref={element => setSearchBox(element)}
            style={styles.searchBoxInput}
            placeholder="Search"
            placeholderTextColor={Colors.textColorGrey}
            onChangeText={(nameKeyword) => filterContacts(nameKeyword)}
          />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flex: 11 }}>
            <FlatList
              data={filterContactData}
              extraData={filterContactData}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                return (
                  <View style={styles.selectedContactsView}>
                    <Text style={styles.contactText}>
                      {item.name.split(" ")[0]}{" "}
                      <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
                        {item.name.split(" ")[1]}
                      </Text>
                    </Text>
                    <TouchableOpacity style={styles.shareButtonView}>
                      <Text style={styles.shareButtonText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
              }
            />
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
    fontSize: RFValue(18),
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
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular
  },
  contactIndexText: {
    fontSize: RFValue(10),
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
    fontSize: RFValue(13),
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
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey
  },
  pageTitle: {
    marginLeft: 30,
    color: Colors.blue,
    fontSize: RFValue(14),
    fontFamily: Fonts.FiraSansRegular
  },
  pageInfoText: {
    marginLeft: 30,
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular
  },
  searchBoxContainer: {
    flexDirection: "row",
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 0.5,
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    justifyContent: 'center',

  },
  searchBoxIcon: {
    justifyContent: 'center',
    marginBottom: -10
  },
  searchBoxInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.blacl,
    borderBottomColor: Colors.borderColor,
    alignSelf: 'center',
    marginBottom: -10
  },
});
