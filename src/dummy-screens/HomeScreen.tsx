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
          <Text style={{ marginVertical: 10 }}>
            Welcome to {`${walletName}'s`} wallet!
          </Text>
          <Button
            title="Regular Account"
            onPress={() => {
              props.navigation.navigate("AccountNav", {
                accountType: REGULAR_ACCOUNT
              });
            }}
          />
          <Button
            title="Test Account"
            onPress={() => {
              props.navigation.navigate("AccountNav", {
                accountType: TEST_ACCOUNT
              });
            }}
          />
          <Button
            title="SSS"
            onPress={() => {
              props.navigation.navigate("SSS", {});
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
