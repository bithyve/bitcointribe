import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  initHealthCheck,
  prepareMShares,
  uploadEncMShares,
  checkMSharesHealth
} from "../../store/actions/sss";
import S3Service from "../../bitcoin/services/sss/S3Service";

const S3UserScreen = props => {
  const dispatch = useDispatch();
  const { SHARES_TRANSFER_DETAILS } = useSelector(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );
  const { loading, service } = useSelector(state => state.sss);
  const s3Service: S3Service = service;

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
        <Button
          title="Upload Enc MShares(1)"
          onPress={() => dispatch(uploadEncMShares(0))}
        />
        {loading.uploadMetaShare ? (
          <ActivityIndicator size="small" style={{ marginHorizontal: 5 }} />
        ) : metaShares.length && Object.keys(SHARES_TRANSFER_DETAILS).length ? (
          <View style={{ marginHorizontal: 40 }}>
            <Text style={{ marginTop: 12 }}>
              OTP: {SHARES_TRANSFER_DETAILS[metaShares[0].shareId].otp}
            </Text>
            <Text style={{ marginTop: 12 }}>
              EncKey:
              {SHARES_TRANSFER_DETAILS[metaShares[0].shareId].encryptedKey}
            </Text>
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
        ) : Object.keys(healthCheckStatus).length &&
          healthCheckStatus[metaShares[0].shareId] ? (
          (Date.now() - healthCheckStatus[metaShares[0].shareId]) / 1000 >
          15 ? (
            <Text style={{ marginTop: 12 }}>Bad</Text>
          ) : (
            <Text style={{ marginTop: 12 }}>Great</Text>
          )
        ) : (
          <Text style={{ marginTop: 12 }}>No updates</Text>
        )}
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
