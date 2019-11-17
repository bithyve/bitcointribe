import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  ActivityIndicator
} from "react-native";
import { downloadMShare, updateMSharesHealth } from "../../store/actions/sss";

const S3GuardianScreen = props => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.sss);
  const [encryptedKey, setEncryptedKey] = useState("");
  const [otp, setOTP] = useState("");

  return (
    <View style={styles.screen}>
      <View style={{ marginHorizontal: 50 }}>
        <View
          style={{
            flexDirection: "row",
            marginVertical: 5
          }}
        >
          <Text>Encrypted Key: </Text>
          <TextInput
            value={encryptedKey}
            onChangeText={setEncryptedKey}
            style={{
              borderBottomWidth: 0.5,
              width: 200,
              textAlign: "center"
            }}
          />
        </View>
        <View
          style={{ flexDirection: "row", marginVertical: 5, marginBottom: 10 }}
        >
          <Text>OTP: </Text>
          <TextInput
            value={otp}
            onChangeText={setOTP}
            style={{
              borderBottomWidth: 0.5,
              width: 200,
              textAlign: "center"
            }}
          />
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button
          title="Download MShare"
          onPress={() => dispatch(downloadMShare(otp, encryptedKey))}
        />
        {loading.downloadMetaShare ? (
          <ActivityIndicator size="small" style={{ marginHorizontal: 5 }} />
        ) : null}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button
          title="Update Health"
          onPress={() => dispatch(updateMSharesHealth())}
        />
        {loading.updateMSharesHealth ? (
          <ActivityIndicator size="small" style={{ marginHorizontal: 5 }} />
        ) : null}
      </View>
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
