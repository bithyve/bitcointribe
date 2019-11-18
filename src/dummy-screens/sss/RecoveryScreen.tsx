import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { requestShare, downloadMShare } from "../../store/actions/sss";

const RecoveryScreen = props => {
  const dispatch = useDispatch();
  const [otp, setOTP] = useState("");
  const [encryptedKey, setEncryptedKey] = useState("");

  const { RECOVERY_SHARES } = useSelector(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );

  return (
    <View style={styles.screen}>
      <Button title="Request Share" onPress={() => dispatch(requestShare())} />
      {RECOVERY_SHARES.map(({ REQUEST_DETAILS, META_SHARE }) => {
        if (META_SHARE) return;
        const { otp, encryptedKey } = REQUEST_DETAILS;

        return (
          <View style={{ marginTop: 10 }} key={encryptedKey}>
            {otp && encryptedKey ? (
              <View>
                <Text>OTP: {otp}</Text>
                <Text>EncryptedKey: {encryptedKey}</Text>
                <Button
                  title="Download"
                  onPress={() =>
                    dispatch(downloadMShare(otp, encryptedKey, "recovery"))
                  }
                />
              </View>
            ) : null}
          </View>
        );
      })}
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
