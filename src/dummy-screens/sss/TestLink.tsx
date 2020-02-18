import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  AsyncStorage,
  Button,
  View,
} from 'react-native';
import * as ExpoContacts from 'expo-contacts';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { text, email } from 'react-native-communications';

async function requestContactsPermission() {
  try {
    //global.isContactOpen = true;
    let isContactOpen = await AsyncStorage.getItem('isContactOpen');
    if (!isContactOpen) {
      await AsyncStorage.setItem('isContactOpen', 'true');
    }
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Contacts Permission',
        message: 'Please grant permission to read contacts on your device',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
  }
}

const TestLink = props => {
  const [contactData, setContactData] = useState([]);
  const [selectedContact, setSelectedContact] = useState();

  const getContactsAsync = async () => {
    if (Platform.OS === 'android') {
      if (!(await requestContactsPermission())) {
        Alert.alert('Cannot select tursted contacts; permission denied');
        return;
      }
    }
    ExpoContacts.getContactsAsync().then(({ data }) => {
      if (!data.length) Alert.alert('No contacts found!');
      setContactData([data[0]]);
    });
  };

  useEffect(() => {
    getContactsAsync();
  }, []);

  const onShare = async mode => {
    if (mode === 'text') {
      selectedContact.phoneNumbers
        ? text(
            selectedContact.phoneNumbers[0].number,
            'This is deep/universal link!',
          )
        : Alert.alert('Following contact has no associated number');
    } else if (mode === 'email') {
      selectedContact.emails
        ? email(
            selectedContact.emails[0].email,
            null,
            null,
            'Guardian request',
            'This is deep/universal link!',
          )
        : Alert.alert('Following contact has no associated email');
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.screen}
    >
      {contactData.map((value, index) => {
        return (
          <TouchableOpacity onPress={() => setSelectedContact(value)}>
            <Text>
              {value.name && value.name.split(' ')[0] ? value.name.split(' ')[0] : ""} <Text>{value.name && value.name.split(' ')[0] ? value.name.split(' ')[1] : ""}</Text>
            </Text>
          </TouchableOpacity>
        );
      })}
      {selectedContact ? (
        <View style={{ marginTop: 10 }}>
          <Button title="Share via Text" onPress={() => onShare('text')} />
          <Button title="Share via Email" onPress={() => onShare('email')} />
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 40,
  },
});

export default TestLink;
