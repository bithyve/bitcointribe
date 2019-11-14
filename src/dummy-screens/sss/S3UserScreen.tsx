import React from "react";
import { View, Text, StyleSheet } from "react-native";

const S3UserScreen = props => {
  return (
    <View style={styles.screen}>
      <Text>UserScreen Here!</Text>
    </View>
  );
};

S3UserScreen.navigationOptions = {
  headerTitle: "User"
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default S3UserScreen;
