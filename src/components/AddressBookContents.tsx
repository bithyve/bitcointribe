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
import AsyncStorage from '@react-native-community/async-storage';

export default function AddressBookContents(props) {
  let [AssociatedContact, setAssociatedContact] = useState([]);
  let [SelectedContacts, setSelectedContacts] = useState([]);

  useEffect(()=>{
    getAssociatedContact();
  },[]);

  const getAssociatedContact = async() =>{
    let SelectedContacts = JSON.parse(await AsyncStorage.getItem("SelectedContacts"));
    setSelectedContacts(SelectedContacts)
    let AssociatedContact = JSON.parse(await AsyncStorage.getItem("AssociatedContacts"));
    setAssociatedContact(AssociatedContact)
  }
  
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* <TouchableOpacity
            onPress={() => props.onPressBack()}
            style={{ height: 30, width: 30, justifyContent: "center" }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity> */}
          <Text style={styles.modalHeaderTitleText}>{"Address Book"}</Text>
        </View>
      </View>
      <View>
        <Text style={styles.pageTitle}>You are the Guardian of</Text>
        {/* <Text style={styles.pageInfoText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing
        </Text> */}
      </View>
     
        {AssociatedContact && AssociatedContact.length ?  
          <View style={{ flex: 1, flexDirection: "row", marginBottom: 15}}>
            <FlatList
              data={AssociatedContact}
              extraData={AssociatedContact}
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
            :
            <View style={{ flex: 1, flexDirection: "row", marginBottom: 15, justifyContent:'center',alignItems:'center'}}>
              <Text style={{marginLeft: 30,color:Colors.textColorGrey, fontFamily:Fonts.FiraSansMediumItalic, fontSize:RFValue(16), }}>Nothing to show</Text>
            </View>
        }
      

      <View>
        <Text style={styles.pageTitle}>Guardians of your Secrets</Text>
        {/* <Text style={styles.pageInfoText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing
        </Text> */}
      </View>
      
          {SelectedContacts && SelectedContacts.length? 
            <View style={{ flex: 1, flexDirection: "row", marginBottom: 15 }}>
              <FlatList
                data={SelectedContacts}
                extraData={SelectedContacts}
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
            :
            <View style={{ flex: 1, flexDirection: "row", marginBottom: 15, justifyContent:'center', alignItems:'center' , }}>
              <Text style={{marginLeft: 30, color:Colors.textColorGrey, fontFamily:Fonts.FiraSansMediumItalic, fontSize:RFValue(16), textAlign:'center', }}>Nothing to show</Text>
            </View>
          }
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
