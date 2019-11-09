import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  TextInput,
  Alert
} from "react-native";
import * as Cipher from "../storage/encryption";
import * as SecureStore from "../storage/secure-store";
import AsyncStorage from "@react-native-community/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { initializeDB, keyFetched } from "../store/actions/storage";

const HomeScreen = props => {
  // const initialize = useCallback(async () => {
  //   try {
  //     await database.init();
  //     console.log("Database initialized");
  //   } catch (err) {
  //     console.log(err);
  //     Alert.alert("Database Init Failed", "Failed to initialize database", [
  //       { text: "Okay", style: "default" }
  //     ]);
  //   }
  //   // const res = await database.insert("test-title");
  //   // console.log({ res });
  //   // const tres = await database.fetch();
  //   // console.log({ tres });
  // }, []);

  const dispatch = useDispatch();
  const dbInitialized = useSelector(state => state.storage.databaseInitialized);
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState();
  const [loggedIn, setLoggedIn] = useState(false);

  const pinExists = async () => {
    const value = await AsyncStorage.getItem("hasPin");
    if (value) {
      setHasPin(Boolean(value));
    }
  };

  useEffect(() => {
    dispatch(initializeDB());
    pinExists();
  }, []);

  const storePin = async () => {
    try {
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
      await AsyncStorage.setItem("hasPin", "true");
      setHasPin(true);
    } catch (err) {
      console.log(err);
    }
  };

  const login = async () => {
    try {
      // hash the pin and fetch AES from secure store
      const hash = Cipher.hash(pin);
      const encryptedKey = await SecureStore.fetch(hash);
      const key = Cipher.decrypt(encryptedKey, hash);
      dispatch(keyFetched(key));
      setLoggedIn(true);
    } catch (err) {
      console.log(err);
      Alert.alert("Incorrect pin", "Please retry", [
        { text: "Okay", style: "cancel" }
      ]);
    }
  };

  return (
    <View style={styles.screen}>
      <Text>HomeScreen!</Text>
      {hasPin ? (
        !loggedIn ? (
          <View>
            <TextInput
              placeholder="Enter pin"
              value={pin}
              onChangeText={setPin}
              style={{
                borderBottomWidth: 0.5,
                width: 150,
                textAlign: "center"
              }}
              keyboardType="numeric"
            />
            <Button title="Login" onPress={login} />
          </View>
        ) : (
          <View>
            <Button
              title="W-Setup"
              onPress={() => {
                props.navigation.navigate("WSetup");
              }}
            />
            <Button
              title="Store"
              onPress={() => {
                props.navigation.navigate("Store");
              }}
            />
            <Button
              title="Secure"
              onPress={() => {
                props.navigation.navigate("Secure");
              }}
            />
          </View>
        )
      ) : (
        <View>
          <TextInput
            placeholder="Setup Pin"
            value={pin}
            onChangeText={setPin}
            style={{
              borderBottomWidth: 0.5,
              width: 150,
              textAlign: "center"
            }}
            keyboardType="numeric"
          />
          <Button title="Set" onPress={storePin} />
        </View>
      )}
      {dbInitialized ? (
        <Text>Database has been initialized</Text>
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default HomeScreen;
