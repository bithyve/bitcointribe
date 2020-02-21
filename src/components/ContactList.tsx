import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AsyncStorage,
  PermissionsAndroid,
  Platform,
  Alert,
  TextInput,
  SafeAreaView,
} from 'react-native';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import RadioButton from '../components/RadioButton';
import AntDesign from 'react-native-vector-icons/AntDesign';
import * as ExpoContacts from 'expo-contacts';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Contacts from 'react-native-contacts';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';
import { FlatList } from "react-native-gesture-handler";
import * as Permissions from 'expo-permissions';


export default function ContactList(props) {
  let [selectedContacts, setSelectedContacts] = useState([]);
  const [scrollViewRef, setScrollViewRef] = useState(React.createRef());
  const [contactData, setContactData] = useState([]);
  const [filterContactData, setFilterContactData] = useState([]);
  const [radioOnOff, setRadioOnOff] = useState(false);
  const [contactPermissionAndroid, setContactPermissionAndroid] = useState(false);
  const [contactPermissionIOS, setContactPermissionIOS] = useState(false);

  const requestContactsPermission = async () => {
    try {
      let isContactOpen=false;
      AsyncStorage.getItem('isContactOpen', (err, value) => {
        if (err) console.log(err)
         else {
          isContactOpen = JSON.parse(value)
        }
        });
        if (!isContactOpen) {
          await AsyncStorage.setItem('isContactOpen', JSON.stringify(true));
        }
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
        return result;
    } catch (err) {
      console.warn(err);
    }
  }
  
  const checkPermission = async () => {
    const { status, expires, permissions } = await Permissions.getAsync(Permissions.CONTACTS);
    if (status !== 'granted') {
      setContactPermissionIOS(false)
      Alert.alert('Cannot select trusted contacts. Permission denied.\nYou can enable contacts from the phone settings page Settings > Hexa > contacts');
      return;
    }else{
      setContactPermissionIOS(true)
    }
  }

  const getContact = () => {
    ExpoContacts.getContactsAsync().then(({ data }) => {
      if (!data.length) Alert.alert('No contacts found!');
      setContactData(data);
      const contactList = data.sort(function(a, b) {
        if (a.name && b.name) {
          if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
          if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        }
        return 0;
      });
      setFilterContactData(contactList);
    });
  }
  
  const getContactsAsync = async () => {
    if (Platform.OS === 'android') {
      const granted = await requestContactsPermission();
        console.log("GRANTED", granted);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Cannot select trusted contacts. Permission denied.\nYou can enable contacts from the phone settings page Settings > Hexa > contacts');
          setContactPermissionAndroid(false);
          return;
        } else {
          getContact();
    }
  } else {
    getContact();
  }

    
  };

  useEffect(() => {
    (async () => {
      let isContactOpen=false;
      AsyncStorage.getItem('isContactOpen', (err, value) => {
      if (err) console.log(err)
       else {
        isContactOpen = JSON.parse(value)
      }
  });
      if (!isContactOpen) {
        await AsyncStorage.setItem('isContactOpen', JSON.stringify(true));
      }
    })();
    getContactsAsync();
  }, []);

  const filterContacts = keyword => {
    console.log('contactData.length', contactData);
    if (contactData.length > 0) {
      if (!keyword.length) {
        setFilterContactData(contactData);
        return;
      }
      let isFilter = true;
      let filterContactsForDisplay = [];
      for (let i = 0; i < contactData.length; i++) {
        if (
          contactData[i].name &&
          contactData[i].name.toLowerCase().startsWith(keyword.toLowerCase())
        ) {
          filterContactsForDisplay.push(contactData[i]);
        }
      }
      setFilterContactData(filterContactsForDisplay);
    } else {
      return;
    }
  };

  function onContactSelect(index) {
    let contacts = filterContactData;
    if(props.isTrustedContact){
      if (contacts[index].checked) {
        selectedContacts=[];
      } else {
        selectedContacts[0]=contacts[index];
      }
    }
    else{
      if (contacts[index].checked) {
        selectedContacts.splice(
          selectedContacts.findIndex(temp => temp.id == contacts[index].id),
          1
        );
      } else {
        if (selectedContacts.length === 2) {
          selectedContacts.pop();
        }
        selectedContacts.push(contacts[index]);
      }
    }
    setSelectedContacts(selectedContacts);
    for (let i = 0; i < contacts.length; i++) {
      if (
        selectedContacts.findIndex(value => value.id == contacts[i].id) > -1
      ) {
        contacts[i].checked = true;
      } else {
        contacts[i].checked = false;
      }
    }
    setRadioOnOff(!radioOnOff);
    setFilterContactData(contacts);
    props.onSelectContact(selectedContacts);
  }

  function onCancel(value) {
    if (filterContactData.findIndex(tmp => tmp.id == value.id) > -1) {
      filterContactData[
        filterContactData.findIndex(tmp => tmp.id == value.id)
      ].checked = false;
    }
    selectedContacts.splice(
      selectedContacts.findIndex(temp => temp.id == value.id),
      1,
    );
    setSelectedContacts(selectedContacts);
    setRadioOnOff(!radioOnOff);
    props.onSelectContact(selectedContacts);
  }

  const addContact = async() => {
      if (Platform.OS === 'android') {
        const granted = await requestContactsPermission();
        console.log("GRANTED", granted);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Cannot select trusted contacts. Permission denied.\nYou can enable contacts from the phone settings page Settings > Hexa > contacts');
          setContactPermissionAndroid(false);
          return;
        } else {
          var newPerson = {
            displayName: '',
          };
          console.log('contact permission granted');
          Contacts.openContactForm(newPerson, (err, contact) => {
            if (err) return;
            if (contact) {
              console.log("contact",contact);
              getContactsAsync();
            }
          });
        }
       
      } else {
        var newPerson = {
          displayName: '',
        };
        //if(contactPermissionAndroid){
          Contacts.openContactForm(newPerson, (err, contact) => {
            if (err) return;
            if (contact) {
              console.log("contact",contact);
              getContactsAsync();
            }
          });
       // }
      }}

  return (
      <View style={{ flex: 1, ...props.style }}>
        <SafeAreaView style={{ flex: 0 }} />
        <View style={styles.selectedContactContainer}>
          {selectedContacts.length > 0 ? selectedContacts.map(value => {
            return(
            <View style={styles.selectedContactView}>
              <Text style={styles.selectedContactNameText}>
                {value.name ? value.name.split(" ")[0] : ''}{" "}
                <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
                  {value.name ? value.name.split(" ")[1] : ''}
                </Text>
              </Text>
              <AppBottomSheetTouchableWrapper onPress={() => onCancel(value)}>
                <AntDesign name="close" size={17} color={Colors.white} />
              </AppBottomSheetTouchableWrapper>
            </View>
          )}): null}
        </View>
        <AppBottomSheetTouchableWrapper
          style={{ marginLeft: 'auto', marginRight: 10, padding: 10 }}
          onPress={() => addContact()}
        >
          <Text
            style={{
              fontSize: RFValue(13, 812),
              fontFamily: Fonts.FiraSansRegular,
            }}
            onPress={() => addContact()}
          >
            Add contact
          </Text>
        </AppBottomSheetTouchableWrapper>
        <View style={[styles.searchBoxContainer]}>
          <View style={styles.searchBoxIcon}>
            <EvilIcons
              style={{ alignSelf: 'center' }}
              name="search"
              size={20}
              color={Colors.textColorGrey}
            />
          </View>
          <TextInput
            style={styles.searchBoxInput}
            placeholder="Search"
            placeholderTextColor={Colors.textColorGrey}
            onChangeText={nameKeyword => filterContacts(nameKeyword)}
          />
        </View>
        <View style={{ flex: 1, flexDirection: 'row', position: 'relative' }}>
          {filterContactData ? (
            <FlatList
              keyExtractor={(item, index) => item.id}
              data={filterContactData}
              extraData={radioOnOff}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                let selected = false;
                if (selectedContacts.findIndex(temp => temp.id == item.id) > -1) {
                  selected = true;
                }
                if(item.phoneNumbers || item.emails){
                return (
                  <AppBottomSheetTouchableWrapper
                    onPress={() => onContactSelect(index)}
                    style={styles.contactView}
                    key={index}
                  >
                    <RadioButton
                      size={15}
                      color={Colors.lightBlue}
                      borderColor={Colors.borderColor}
                      isChecked={item.checked}
                      onpress={() => onContactSelect(index)}
                    />
                    <Text style={styles.contactText}>
                      {item.name && item.name.split(' ')[0] ? item.name.split(' ')[0] : ""}{' '}
                      <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
                        {item.name && item.name.split(' ')[1] ? item.name.split(' ')[1] : ""}
                      </Text>
                    </Text>
                  </AppBottomSheetTouchableWrapper>
                );
                }
                else{
                  return null;
                }
              }}
            />
          ) : null}
          {/* <View style={styles.contactIndexView}>
              <AppBottomSheetTouchableWrapper
                onPress={() => {
                }}
              >
                <Text style={styles.contactIndexText}>#</Text>
              </AppBottomSheetTouchableWrapper>
              {alphabetsList.map(value => (
                <AppBottomSheetTouchableWrapper
                  onPress={() => {

                  }}
                >
                  <Text style={styles.contactIndexText}>{value}</Text>
                </AppBottomSheetTouchableWrapper>
              ))}
            </View>*/}
        </View>
        {selectedContacts.length >= 1 && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              width: wp('50%'),
              alignSelf: 'center',
            }}
          >
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressContinue()}
              style={styles.bottomButtonView}
            >
              <Text style={styles.buttonText}>Confirm & Proceed</Text>
            </AppBottomSheetTouchableWrapper>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  bottomButtonView: {
    height: 50,
    width: wp('50%'),
    backgroundColor: Colors.blue,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    marginBottom: 20,
  },
  selectedContactView: {
    width: wp('42%'),
    height: wp('12%'),
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedContactNameText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  selectedContactContainer: {
    height: wp('20%'),
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
  },
  contactView: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexView: {
    flex: 0.5,
    height: '100%',
    justifyContent: 'space-evenly',
  },
  searchBoxContainer: {
    flexDirection: 'row',
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 0.5,
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    justifyContent: 'center',
  },
  searchBoxIcon: {
    justifyContent: 'center',
    marginBottom: -10,
  },
  searchBoxInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.blacl,
    borderBottomColor: Colors.borderColor,
    alignSelf: 'center',
    marginBottom: -10,
  },
});
