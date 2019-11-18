import React, { useState } from "react";
import { View, Text, StyleSheet, Button, TextInput } from "react-native";
import S3Service from "../../bitcoin/services/sss/S3Service";

const RecoveryScreen = props => {
  const [walletName, setWalletName] = useState("");
  const [otp, setOTP] = useState("");
  const [encryptedKey, setEncryptedKey] = useState("");

  return (
    <View style={styles.screen}>
      <View style={{ flexDirection: "row" }}>
        <Text>Wallet Name: </Text>
        <TextInput
          value={walletName}
          onChangeText={setWalletName}
          style={{
            borderBottomWidth: 0.5,
            width: 200,
            textAlign: "center"
          }}
        />
      </View>
      <View style={{ marginTop: 10 }}>
        <Button
          title="Request Share"
          onPress={() => {
            const { otp, encryptedKey } = S3Service.generateRequestCreds();
            console.log({ otp, encryptedKey, walletName });
            setOTP(otp);
            setEncryptedKey(encryptedKey);
          }}
        />
        {otp && encryptedKey ? (
          <View>
            <Text>OTP: {otp}</Text>
            <Text>EncryptedKey: {encryptedKey}</Text>
            <Text>Tag: {walletName}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

RecoveryScreen.navigationOptions = {
  headerTitle: "Recovery"
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 40
  }
});

export default RecoveryScreen;
