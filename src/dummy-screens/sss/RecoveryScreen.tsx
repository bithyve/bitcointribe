import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { requestShare } from "../../store/actions/sss";

const RecoveryScreen = props => {
  const dispatch = useDispatch();
  const { RECOVERY_SHARES } = useSelector(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );

  return (
    <View style={styles.screen}>
      <Button title="Request Share" onPress={() => dispatch(requestShare())} />
      {RECOVERY_SHARES.map(({ otp, encryptedKey }) => (
        <View style={{ marginTop: 10 }} key={encryptedKey}>
          {otp && encryptedKey ? (
            <View>
              <Text>OTP: {otp}</Text>
              <Text>EncryptedKey: {encryptedKey}</Text>
            </View>
          ) : null}
        </View>
      ))}
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
