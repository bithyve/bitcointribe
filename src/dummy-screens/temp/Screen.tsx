import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Screen = props => {
  return (
    <View style={styles.screen}>
      <Text>Screen Here!</Text>
    </View>
  );
};

Screen.navigationOptions = {
  headerTitle: "Screen"
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default Screen;
