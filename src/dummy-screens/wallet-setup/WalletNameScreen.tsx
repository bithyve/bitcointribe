import React, { useState } from "react";
import { View, Text, StyleSheet, Button, TextInput } from "react-native";

const WalletNameScreen = props => {
  const [walletName, setWalletName] = useState("");

  return (
    <View style={styles.screen}>
      <Text style={{ marginBottom: 50 }}>Wallet Setup Simulator</Text>
      <View style={{ flexDirection: "row" }}>
        <Text>Wallet Name:</Text>
        <TextInput
          value={walletName}
          onChangeText={setWalletName}
          style={{
            borderBottomWidth: 0.5,
            width: 150,
            textAlign: "center"
          }}
        />
      </View>
      <Button
        title="Next"
        onPress={() => {
          props.navigation.navigate("SecurityQues", { walletName });
        }}
      />
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

export default WalletNameScreen;
