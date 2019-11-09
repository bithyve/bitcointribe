import React, { useState } from "react";
import { View, Text, StyleSheet, Button, TextInput } from "react-native";
import { useDispatch } from "react-redux";
import { initializeSetup } from "../store/actions/setup";

const WalletSetupScreen = props => {
  const [walletName, setWalletName] = useState("");
  const [securityAns, setSecurityAns] = useState("");
  const dispatch = useDispatch();

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
      <View style={{ flexDirection: "row" }}>
        <Text>Security Ans:</Text>
        <TextInput
          value={securityAns}
          onChangeText={setSecurityAns}
          style={{
            borderBottomWidth: 0.5,
            width: 150,
            textAlign: "center"
          }}
        />
      </View>
      <Button
        title="Submit"
        onPress={() => {
          dispatch(initializeSetup(walletName, securityAns));
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

export default WalletSetupScreen;
