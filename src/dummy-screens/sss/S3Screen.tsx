import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

const S3Screen = props => {
  return (
    <View style={styles.screen}>
      <Button
        title="Continue as User"
        onPress={() => props.navigation.navigate("S3User")}
      />
      <Button
        title="Continue as Guardian"
        onPress={() => props.navigation.navigate("S3Guardian")}
      />
    </View>
  );
};

S3Screen.navigationOptions = {
  headerTitle: "SSS"
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default S3Screen;
