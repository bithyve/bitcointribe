import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button
} from "react-native";
import { useSelector } from "react-redux";
import {
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
  SECURE_ACCOUNT
} from "../common/constants/serviceTypes";

const HomeScreen = props => {
  const database = useSelector(state => state.storage.database);
  let walletName;
  if (database) {
    walletName = database.WALLET_SETUP.walletName;
  }
  return (
    <View style={styles.screen}>
      {walletName ? (
        <View>
          <Text style={{ marginVertical: 10 }}>
            Welcome to {`${walletName}'s`} wallet!
          </Text>
          <Button
            title="Checking Account"
            onPress={() => {
              props.navigation.navigate("Account", {
                serviceType: REGULAR_ACCOUNT
              });
            }}
          />
          <Button
            title="Test Account"
            onPress={() => {
              props.navigation.navigate("Account", {
                serviceType: TEST_ACCOUNT
              });
            }}
          />
          <Button
            title="Secure Account"
            onPress={() => {
              props.navigation.navigate("Account", {
                serviceType: SECURE_ACCOUNT
              });
            }}
          />
          <Button
            title="SSS"
            onPress={() => {
              props.navigation.navigate("SSS");
            }}
          />
        </View>
      ) : (
        <ActivityIndicator size="large" />
      )}
    </View>
  );
};

HomeScreen.navigationOptions = {
  headerTitle: "Home"
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default HomeScreen;
