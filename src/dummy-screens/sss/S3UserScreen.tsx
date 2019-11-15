import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { initHealthCheck } from "../../store/actions/sss";
import { S3_SERVICE } from "../../common/constants/serviceTypes";
import S3Service from "../../bitcoin/services/sss/S3Service";

const S3UserScreen = props => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.sss);
  const s3Service: S3Service = useSelector(state => state.sss.service);

  const { healthCheckInitialized } = s3Service.sss;
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
