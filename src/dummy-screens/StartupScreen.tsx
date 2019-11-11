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
import * as Cipher from "../common/encryption";
import * as SecureStore from "../storage/secure-store";
import AsyncStorage from "@react-native-community/async-storage";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeDB,
  keyFetched,
  fetchFromDB
} from "../store/actions/storage";

const StartupScreen = props => {
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
  const [walletExists, setWalletExists] = useState(false);
  const [pin, setPin] = useState();

  const pinExists = async () => {
    if (await AsyncStorage.getItem("hasPin")) {
      if (await AsyncStorage.getItem("walletExists")) {
        setWalletExists(true);
      }
      setHasPin(true);
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
      dispatch(fetchFromDB());
      walletExists
        ? props.navigation.navigate("HomeNav")
        : props.navigation.navigate("WalletSetup");
    } catch (err) {
      console.log(err);
      Alert.alert("Incorrect pin", "Please retry", [
        { text: "Okay", style: "cancel" }
      ]);
    }
  };

  return (
    <View style={styles.screen}>
      <Text>StartupScreen!</Text>
      {hasPin ? (
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

export default StartupScreen;
