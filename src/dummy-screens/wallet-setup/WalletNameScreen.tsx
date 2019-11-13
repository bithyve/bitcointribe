import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { View, Text, StyleSheet, Button, TextInput } from "react-native";
import { updateWalletName } from "../../store/actions/wallet-setup";

const WalletNameScreen = props => {
  const [walletName, setWalletName] = useState("");
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
      <Button
        title="Next"
        onPress={() => {
          dispatch(updateWalletName(walletName));
          props.navigation.navigate("SecurityQues");
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
