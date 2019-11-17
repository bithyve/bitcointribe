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
  uploadEncMShares
} from "../../store/actions/sss";
import { S3_SERVICE } from "../../common/constants/serviceTypes";
import S3Service from "../../bitcoin/services/sss/S3Service";

const S3UserScreen = props => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.sss);
  const s3Service: S3Service = useSelector(state => state.sss.service);

  const { healthCheckInitialized, metaShareTransferAssets } = s3Service.sss;
  return (
    <View style={styles.screen}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button title="Init HC" onPress={() => dispatch(initHealthCheck())} />
        {loading.hcInit ? (
          <ActivityIndicator size="small" style={{ marginHorizontal: 5 }} />
        ) : healthCheckInitialized ? (
          <Text style={{ marginTop: 12 }}>HC Initialized!</Text>
        ) : null}
      </View>
      <Button
        title="Prepare MShares"
        onPress={() => dispatch(prepareMShares())}
      />
      <View>
        <Button
          title="Upload Enc MShares(1)"
          onPress={() => dispatch(uploadEncMShares(0))}
        />
        {loading.uploadMetaShare ? (
          <ActivityIndicator size="small" style={{ marginHorizontal: 5 }} />
        ) : metaShareTransferAssets[0] ? (
          <View style={{ marginHorizontal: 40 }}>
            <Text style={{ marginTop: 12 }}>
              OTP: {metaShareTransferAssets[0].otp}
            </Text>
            <Text style={{ marginTop: 12 }}>
              EncKey: {metaShareTransferAssets[0].encryptedKey}
            </Text>
          </View>
        ) : null}
      </View>
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
