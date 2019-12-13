import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  requestShare,
  downloadMShare,
  recoverMmnemonic
} from "../../store/actions/sss";

const RecoveryScreen = props => {
  const { securityAns } = useSelector(
    state => state.storage.database.WALLET_SETUP
  );
  const { mnemonic } = useSelector(state => state.sss);
  const dispatch = useDispatch();

  const { WALLET_SETUP } = useSelector(state => state.storage.database);
  const { RECOVERY_SHARES } = useSelector(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );

  const metaShares = [];
  Object.keys(RECOVERY_SHARES).forEach(key => {
    const { META_SHARE } = RECOVERY_SHARES[key];
    if (META_SHARE) metaShares.push(META_SHARE);
  });

  return (
    <View style={styles.screen}>
      <Button
        title="Request Share"
        onPress={() => {
          dispatch(
            requestShare(
              WALLET_SETUP.walletName,
              Object.keys(RECOVERY_SHARES).length
            )
          );
        }}
      />
      {Object.keys(RECOVERY_SHARES).map(key => {
        const { REQUEST_DETAILS, META_SHARE } = RECOVERY_SHARES[key];
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
      {metaShares.length == 3 ? (
        <View style={{ marginTop: 15 }}>
          <Button
            title="Recover Mnemonic"
            onPress={() => dispatch(recoverMmnemonic(metaShares, securityAns))}
          />
          {mnemonic ? <Text style={{ marginTop: 10 }}>{mnemonic}</Text> : null}
        </View>
      ) : null}
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
