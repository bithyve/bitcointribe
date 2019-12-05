import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  Share,
  Button,
  View
} from "react-native";
import * as ExpoContacts from "expo-contacts";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

async function requestContactsPermission() {
  try {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: "Contacts Permission",
        message: "Please grant permission to read contacts on your device",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
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
    if (Platform.OS === "android") {
      if (!(await requestContactsPermission())) {
        Alert.alert("Cannot select tursted contacts; permission denied");
        return;
      }
    }
    ExpoContacts.getContactsAsync().then(({ data }) => {
      if (!data.length) Alert.alert("No contacts found!");
      setContactData([data[0]]); // shred for testing
    });
  };

  useEffect(() => {
    getContactsAsync();
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.screen}
    >
      {contactData.map((value, index) => {
        return (
          <TouchableOpacity onPress={() => setSelectedContact(value)}>
            <Text>
              {value.name.split(" ")[0]} <Text>{value.name.split(" ")[1]}</Text>
            </Text>
          </TouchableOpacity>
        );
      })}
      {selectedContact ? (
        <View style={{ marginTop: 10 }}>
          <Button title="Share DL" onPress={() => {}} />
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 40
  }
});

export default TestLink;
