import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  TextInput
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  initHealthCheck,
  prepareMShares,
  uploadEncMShare,
  checkMSharesHealth,
  generatePDF
} from "../../store/actions/sss";
import S3Service from "../../bitcoin/services/sss/S3Service";

const S3UserScreen = props => {
  const dispatch = useDispatch();
  const { SHARES_TRANSFER_DETAILS } = useSelector(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );
  const { loading, service } = useSelector(state => state.sss);
  const s3Service: S3Service = service;
  const [metaShareIndex, setMetaShareIndex] = useState("0");
  const [shareIndex, setShareIndex] = useState("4");

  const {
    healthCheckInitialized,
    healthCheckStatus,
    metaShares
  } = s3Service.sss;
  return (
    <View style={styles.screen}>
      <Button
        title="Prepare MShares"
        onPress={() => dispatch(prepareMShares())}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button title="Init HC" onPress={() => dispatch(initHealthCheck())} />
        {loading.hcInit ? (
          <ActivityIndicator size="small" style={{ marginHorizontal: 5 }} />
        ) : healthCheckInitialized ? (
          <Text style={{ marginTop: 12 }}>HC Initialized!</Text>
        ) : null}
      </View>

      <View>
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 50,
            justifyContent: "space-around"
          }}
        >
          <Button
            title="Upload MShares"
            onPress={() => dispatch(uploadEncMShare(parseInt(metaShareIndex)))}
          />
          <TextInput
            value={metaShareIndex}
            onChangeText={setMetaShareIndex}
            style={{
              borderBottomWidth: 0.5,
              width: 50,
              textAlign: "center"
            }}
            keyboardType="numeric"
          />
        </View>
        {loading.uploadMetaShare ? (
          <ActivityIndicator size="small" style={{ marginHorizontal: 5 }} />
        ) : (metaShareIndex == "0" || metaShareIndex) &&
          metaShares.length &&
          Object.keys(SHARES_TRANSFER_DETAILS).length ? (
          <View style={{ marginHorizontal: 40 }}>
            {SHARES_TRANSFER_DETAILS[metaShareIndex] ? (
              <View>
                <Text style={{ marginTop: 12 }}>
                  OTP:
                  {SHARES_TRANSFER_DETAILS[metaShareIndex].OTP}
                </Text>
                <Text style={{ marginTop: 12 }}>
                  EncKey:
                  {SHARES_TRANSFER_DETAILS[metaShareIndex].ENCRYPTED_KEY}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button
          title="Check Health"
          onPress={() => dispatch(checkMSharesHealth())}
        />
        {loading.checkMSharesHealth ? (
          <ActivityIndicator size="small" style={{ marginHorizontal: 5 }} />
        ) : (metaShareIndex == "0" || metaShareIndex) &&
          Object.keys(healthCheckStatus).length &&
          healthCheckStatus[metaShares[metaShareIndex].shareId] ? (
          (Date.now() - healthCheckStatus[metaShares[metaShareIndex].shareId]) /
            1000 >
          15 ? (
            <Text style={{ marginTop: 12 }}>Bad</Text>
          ) : (
            <Text style={{ marginTop: 12 }}>Great</Text>
          )
        ) : (
          <Text style={{ marginTop: 12 }}>No updates</Text>
        )}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button
          title="Generate PDF"
          onPress={() => dispatch(generatePDF(parseInt(shareIndex)))}
        />
        <TextInput
          value={shareIndex}
          onChangeText={setShareIndex}
          style={{
            borderBottomWidth: 0.5,
            width: 50,
            textAlign: "center"
          }}
          keyboardType="numeric"
        />
      </View>
      <Button
        title="Recovery"
        onPress={() => props.navigation.navigate("Recovery")}
      />
    </View>
  );
};

S3UserScreen.navigationOptions = {
  headerTitle: "User"
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default S3UserScreen;
