import React from "react";
import { View, Text, StyleSheet } from "react-native";

const S3GuardianScreen = props => {
  return (
    <View style={styles.screen}>
      <Text>GuardianScreen Here!</Text>
    </View>
  );
};

S3GuardianScreen.navigationOptions = {
  headerTitle: "Guardian"
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default S3GuardianScreen;
