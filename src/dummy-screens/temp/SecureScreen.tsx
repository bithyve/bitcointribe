import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

import * as SecureStore from "../../storage/secure-store";
import * as Cipher from "../../common/encryption";

const SecureScreen = props => {
  const [pin, setPin] = useState("");
  const [fetchedKey, setFetchedKey] = useState();

  const storeHandler = async () => {
    //hash the pin
    const hash = Cipher.hash(pin);

    // //generate an AES key and ecnrypt it with
    const key = await Cipher.generateKey();
    const encryptedKey = Cipher.encrypt(key, hash);

    //store the AES key against the hash
    if (!(await SecureStore.store(hash, encryptedKey))) {
      Alert.alert("Unable to store", "Secure storage failed", [
        { text: "Okay", style: "cancel" }
      ]);
    } else {
      Alert.alert("Stored", "Secure storage successful", [
        { text: "Okay", style: "cancel" }
      ]);
    }
  };

  const fetchHandler = async () => {
    const hash = Cipher.hash(pin);
    try {
      const encryptedKey = await SecureStore.fetch(hash);
      const key = Cipher.decrypt(encryptedKey, hash);
      setFetchedKey(key);
    } catch (err) {
      Alert.alert(
        "No value found against the given key",
        "Secure fetch failed",
        [{ text: "Okay", style: "cancel" }]
      );
    }
  };

  const removeHandler = async () => {
    const hash = Cipher.hash(pin);
    if (!(await SecureStore.remove(hash))) {
      Alert.alert("Unable to remove", "Secure removal failed", [
        { text: "Okay", style: "cancel" }
      ]);
    }
    setFetchedKey(null);
  };

  const secureDataHandler = async () => {
    if (!fetchedKey) {
      Alert.alert("Unable to secure", "Please fetch the key before securing", [
        { text: "Okay", style: "cancel" }
      ]);
      return;
    }

    const data = "SQLite Data";
    const encrypted = Cipher.encrypt(data, fetchedKey);
    console.log({ encrypted });
    const decrypted = Cipher.decrypt(encrypted, fetchedKey);
    console.log({ decrypted });
  };

  return (
    <View style={styles.screen}>
      <TextInput
        placeholder="Enter a pin"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
      />
      <Button title="Store" onPress={storeHandler} />
      <Button title="Fetch" onPress={fetchHandler} />
      <Button title="Remove" onPress={removeHandler} />
      <Button title="secureData" onPress={secureDataHandler} />

      {fetchedKey ? <Text>{fetchedKey}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  container: {
    width: "75%",
    alignItems: "center"
  }
});

export default SecureScreen;
