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
  TEST_ACCOUNT
} from "../common/constants/accountTypes";

const HomeScreen = props => {
  const database = useSelector(state => state.storage.database);
  const { walletName } = database;
  return (
    <View style={styles.screen}>
      {walletName ? (
        <View>
          <Text>Welcome to {`${walletName}'s`} HEXA!</Text>
          <Button
            title="Regular Account"
            onPress={() => {
              props.navigation.navigate("Account", {
                accountType: REGULAR_ACCOUNT
              });
            }}
          />
          <Button
            title="Test Account"
            onPress={() => {
              props.navigation.navigate("Account", {
                accountType: TEST_ACCOUNT
              });
            }}
          />
        </View>
      ) : (
        <ActivityIndicator size="large" />
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
