import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button } from "react-native";
import { useDispatch } from "react-redux";
import { transferST1 } from "../../store/actions/accounts";

const TransferScreen = props => {
  const accountType = props.navigation.getParam("accountType");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState();

  const dispatch = useDispatch();
  return (
    <View style={styles.screen}>
      <View style={{ flexDirection: "row" }}>
        <Text>Address: </Text>
        <TextInput
          value={recipientAddress}
          onChangeText={setRecipientAddress}
          style={{
            borderBottomWidth: 0.5,
            width: 200,
            textAlign: "center",
            marginVertical: 5
          }}
        />
      </View>
      <View style={{ flexDirection: "row" }}>
        <Text>Amount: </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          style={{
            borderBottomWidth: 0.5,
            width: 200,
            textAlign: "center",
            marginVertical: 5
          }}
          keyboardType="numeric"
        />
      </View>
      <Button
        title="Confirm"
        onPress={() => {
          dispatch(
            transferST1(accountType, {
              recipientAddress,
              amount: parseInt(amount)
            })
          );
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

export default TransferScreen;
