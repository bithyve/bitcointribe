import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  AsyncStorage,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { FlatList } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RadioButton from '../../components/RadioButton';
// import * as ExpoContacts from 'expo-contacts';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Contacts from 'react-native-contacts';
import ErrorModalContents from '../../components/ErrorModalContents';
import ModalHeader from '../../components/ModalHeader';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import * as Permissions from 'expo-permissions';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import Toast from '../../components/Toast';

export default function AddContactAddressBook(props) {
  let [selectedContacts, setSelectedContacts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterContactData, setFilterContactData] = useState([]);
  const [radioOnOff, setRadioOnOff] = useState(false);
  const [contactPermissionAndroid, setContactPermissionAndroid] = useState(
    false,
  );
  const [contactPermissionIOS, setContactPermissionIOS] = useState(false);
  const [
    contactListErrorBottomSheet,
    setContactListErrorBottomSheet,
  ] = useState(React.createRef());
  const [contactData, setContactData] = useState([]);

  useEffect(() => {
    if (!props.addContactModalOpened) {
      setSelectedContacts([]);
      getContactsAsync();
    }
  }, [props.addContactModalOpened]);

  const requestContactsPermission = async () => {
    try {
      let isContactOpen = false;
      AsyncStorage.getItem('isContactOpen', (err, value) => {
        if (err) console.log(err);
        else {
          isContactOpen = JSON.parse(value);
        }
      });
      if (!isContactOpen) {
        await AsyncStorage.setItem('isContactOpen', JSON.stringify(true));
      }
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      );
      return result;
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    getContactsAsync();
  }, [props.isLoadContacts]);

  // TODO: Migrate it using react-native-contact
  // const getContact = () => {
  //   if (props.isLoadContacts) {
  //     ExpoContacts.getContactsAsync().then(async ({ data }) => {
  //       if (!data.length) {
  //         setErrorMessage(
  //           'No contacts found. Please add contacts to your Address Book and try again',
  //         );
  //         (contactListErrorBottomSheet as any).current.snapTo(1);
  //       }
  //       setContactData(data);
  //       await AsyncStorage.setItem('ContactData', JSON.stringify(data));
  //       const contactList = data.sort(function (a, b) {
  //         if (a.name && b.name) {
  //           if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
  //           if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
  //         }
  //         return 0;
  //       });
  //       setFilterContactData(contactList);
  //     });
  //   }
  // };

  const getContactsAsync = async () => {
    if (Platform.OS === 'android') {
      const granted = await requestContactsPermission();
      console.log('GRANTED', granted);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setErrorMessage(
          'Cannot select contacts. Permission denied.\nYou can enable contacts from the phone settings page Settings > Hexa > contacts',
        );
        (contactListErrorBottomSheet as any).current.snapTo(1);
        setContactPermissionAndroid(false);
        return;
      } else {
        // TODO: Migrate it using react-native-contact
        // getContact();
      }
    } else if (Platform.OS === 'ios') {
      const { status, expires, permissions } = await Permissions.getAsync(
        Permissions.CONTACTS,
      );
      if (status === 'denied') {
        setContactPermissionIOS(false);
        setErrorMessage(
          'Cannot select contacts. Permission denied.\nYou can enable contacts from the phone settings page Settings > Hexa > contacts',
        );
        (contactListErrorBottomSheet as any).current.snapTo(1);
        return;
      } else {
        // TODO: Migrate it using react-native-contact
        // getContact();
      }
    }
  };

  useEffect(() => {
    (async () => {
      await AsyncStorage.getItem('ContactData', (err, value) => {
        if (err) console.log('ERROR in COntactData', err);
        else {
          let data = JSON.parse(value);
          if (data && data.length) {
            setContactData(data);
            const contactList = data.sort(function (a, b) {
              if (a.name && b.name) {
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
              }
              return 0;
            });
            setFilterContactData(contactList);
          }
        }
      });

      let isContactOpen = false;
      AsyncStorage.getItem('isContactOpen', (err, value) => {
        if (err) console.log(err);
        else {
          isContactOpen = JSON.parse(value);
        }
      });
      if (!isContactOpen) {
        await AsyncStorage.setItem('isContactOpen', JSON.stringify(true));
      }
    })();
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
        if (
          (contactData[i].firstName &&
            contactData[i].firstName
              .toLowerCase()
              .startsWith(keyword.toLowerCase())) ||
          (contactData[i].lastName &&
            contactData[i].lastName
              .toLowerCase()
              .startsWith(keyword.toLowerCase()))
        ) {
          filterContactsForDisplay.push(contactData[i]);
        }
      }
      setFilterContactData(filterContactsForDisplay);
    } else {
      return;
    }
  };

  const trustedContacts: TrustedContactsService = useSelector(
    (state) => state.trustedContacts.service,
  );
  const [isTC, setIsTC] = useState(false);

  const isTrustedContact = useCallback(
    (selectedContact) => {
      const contactName = `${selectedContact.firstName} ${selectedContact.lastName ? selectedContact.lastName : ''
        }`
        .toLowerCase()
        .trim();

      const trustedContact = trustedContacts.tc.trustedContacts[contactName];
      if (trustedContact && trustedContact.symmetricKey) {
        // Trusted channel exists
        return true;
      }
      return false;
    },
    [trustedContacts],
  );

  async function onContactSelect(index) {
    let contacts = filterContactData;
    if (contacts[index].checked) {
      selectedContacts = [];
    } else {
      selectedContacts[0] = contacts[index];
    }
    setSelectedContacts(selectedContacts);
    props.onSelectContact(selectedContacts);
    for (let i = 0; i < contacts.length; i++) {
      if (
        selectedContacts.findIndex((value) => value.id == contacts[i].id) > -1
      ) {
        contacts[i].checked = true;
      } else {
        contacts[i].checked = false;
      }
    }
    setRadioOnOff(!radioOnOff);
    setFilterContactData(contacts);
    const isTrustedC = await isTrustedContact(selectedContacts[0]);
    setIsTC(isTrustedC);
    if (isTrustedC) {
      Toast('Contact already exists');
    }
  }

  async function onCancel(value) {
    if (filterContactData.findIndex((tmp) => tmp.id == value.id) > -1) {
      filterContactData[
        filterContactData.findIndex((tmp) => tmp.id == value.id)
      ].checked = false;
    }
    selectedContacts.splice(
      selectedContacts.findIndex((temp) => temp.id == value.id),
      1,
    );
    setSelectedContacts(selectedContacts);
    setRadioOnOff(!radioOnOff);
    props.onSelectContact(selectedContacts);
  }

  const addContact = async () => {
    if (Platform.OS === 'android') {
      const granted = await requestContactsPermission();
      console.log('GRANTED', granted);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setErrorMessage(
          'Cannot select contacts. Permission denied.\nYou can enable contacts from the phone settings page Settings > Hexa > contacts',
        );
        (contactListErrorBottomSheet as any).current.snapTo(1);
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
            console.log('contact', contact);
            getContactsAsync();
          }
        });
      }
    } else if (Platform.OS === 'ios') {
      const { status, expires, permissions } = await Permissions.getAsync(
        Permissions.CONTACTS,
      );
      if (status === 'denied') {
        setContactPermissionIOS(false);
        setErrorMessage(
          'Cannot select contacts. Permission denied.\nYou can enable contacts from the phone settings page Settings > Hexa > contacts',
        );
        (contactListErrorBottomSheet as any).current.snapTo(1);
        return;
      } else {
        var newPerson = {
          displayName: '',
        };
        Contacts.openContactForm(newPerson, (err, contact) => {
          if (err) return;
          if (contact) {
            console.log('contact---', contact);
            getContactsAsync();
          }
        });
      }
    }
  };

  const renderContactListErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        title={'Error while accessing your contacts '}
        info={errorMessage}
        proceedButtonText={'Open Setting'}
        isIgnoreButton={true}
        onPressProceed={() => {
          Linking.openURL('app-settings:');
          (contactListErrorBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (contactListErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/errorImage.png')}
      />
    );
  }, [errorMessage]);

  const renderContactListErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (contactListErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  return (
    <View style={styles.modalContentContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: 'row' }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressBack()}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper>
          <View style={{ justifyContent: 'center', flex: 1 }}>
            <Text style={styles.modalHeaderTitleText}>
              {props.modalTitle ? props.modalTitle : 'Associate a contact'}
            </Text>
            <Text style={styles.modalHeaderInfoText}>
              {'Select a contact from your phones address book'}
            </Text>
          </View>
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              //addContact()
              props.onSkipContinue();
            }}
            style={{
              height: wp('8%'),
              width: wp('22%'),
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.blue,
              justifyContent: 'center',
              borderRadius: 8,
              alignSelf: 'center',
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              Skip
            </Text>
            {/* <FontAwesome
              name="plus"
              color={Colors.white}
              size={10}
              style={{ marginLeft: 5 }}
            /> */}
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingLeft: wp('5%'),
            paddingRight: wp('5%'),
            paddingTop: wp('5%'),
          }}
        >
          {/* <Text style={styles.modalHeaderInfoText}>
            {'Add contacts from your Address Book, or add a new contact'}
          </Text> */}
        </View>
        <View style={{ flex: 1, ...props.style }}>
          <View style={styles.selectedContactContainer}>
            {selectedContacts.length > 0
              ? selectedContacts.map((value) => {
                return (
                  <View style={styles.selectedContactView}>
                    <Text style={styles.selectedContactNameText}>
                      {value.name ? value.name.split(' ')[0] : ''}{' '}
                      <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
                        {value.name ? value.name.split(' ')[1] : ''}
                      </Text>
                    </Text>
                    <AppBottomSheetTouchableWrapper
                      onPress={() => onCancel(value)}
                    >
                      <AntDesign
                        name="close"
                        size={17}
                        color={Colors.white}
                      />
                    </AppBottomSheetTouchableWrapper>
                  </View>
                );
              })
              : null}
          </View>
          {/* <View style={{ alignItems: 'flex-end' }}>
            <AppBottomSheetTouchableWrapper
              style={{ marginRight: 10, padding: 10 }}
              onPress={() => props.onSkipContinue()}
            >
              <Text
                style={{
                  fontSize: RFValue(13, 812),
                  fontFamily: Fonts.FiraSansRegular,
                }}
                onPress={() => props.onSkipContinue()}
              >
                Skip Contact
              </Text>
            </AppBottomSheetTouchableWrapper>
          </View> */}
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
              keyboardType={
                Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
              }
              placeholder="Search"
              placeholderTextColor={Colors.textColorGrey}
              onChangeText={(nameKeyword) => filterContacts(nameKeyword)}
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
                  if (
                    selectedContacts.findIndex((temp) => temp.id == item.id) >
                    -1
                  ) {
                    selected = true;
                  }
                  // if (item.phoneNumbers || item.emails) {
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
                        {item.name && item.name.split(' ')[0]
                          ? item.name.split(' ')[0]
                          : ''}{' '}
                        <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
                          {item.name && item.name.split(' ')[1]
                            ? item.name.split(' ')[1]
                            : ''}
                        </Text>
                      </Text>
                    </AppBottomSheetTouchableWrapper>
                  );
                  // } else {
                  //   return null;
                  // }
                }}
              />
            ) : null}
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
                disabled={isTC}
                onPress={() => props.onPressContinue(selectedContacts)}
                style={styles.bottomButtonView}
              >
                <Text style={styles.buttonText}>Confirm & Proceed</Text>
              </AppBottomSheetTouchableWrapper>
            </View>
          )}
          <BottomSheet
            enabledInnerScrolling={true}
            ref={contactListErrorBottomSheet as any}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('35%')
                : hp('40%'),
            ]}
            renderContent={renderContactListErrorModalContent}
            renderHeader={renderContactListErrorModalHeader}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor1,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: hp('2%'),
    paddingTop: hp('2%'),
    marginLeft: wp('4%'),
    marginRight: wp('4%'),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
  },
  TitleText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
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
