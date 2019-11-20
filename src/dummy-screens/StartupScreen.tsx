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

import AsyncStorage from "@react-native-community/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { initializeDB } from "../store/actions/storage";
import { credsAuth, storeCreds } from "../store/actions/wallet-setup";

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

  const { isAuthenticated } = useSelector(state => state.walletSetup);

  const pinExists = async () => {
    if (await AsyncStorage.getItem("hasCreds")) {
      if (await AsyncStorage.getItem("walletExists")) {
        setWalletExists(true);
      }
      setHasPin(true);
    }
  };

  useEffect(() => {
    dispatch(initializeDB());
  }, []);

  useEffect(() => {
    pinExists().then(() => {
      if (isAuthenticated)
        walletExists
          ? props.navigation.navigate("HomeNav")
          : props.navigation.navigate("WalletSetup");
    });
  }, [isAuthenticated]);

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
          <Button
            title="Login"
            onPress={() => {
              dispatch(credsAuth(pin));
            }}
          />
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
          <Button
            title="Set"
            onPress={() => {
              dispatch(storeCreds(pin));
              setHasPin(true);
            }}
          />
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
