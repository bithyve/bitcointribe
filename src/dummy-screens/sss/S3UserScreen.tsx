import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { initHealthCheck } from "../../store/actions/sss";

const S3UserScreen = props => {
  const dispatch = useDispatch();
  const { hcInit, loading } = useSelector(state => state.sss);
  return (
    <View style={styles.screen}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button title="Init HC" onPress={() => dispatch(initHealthCheck())} />
        {!loading.hcInit ? (
          <ActivityIndicator size="small" style={{ marginHorizontal: 5 }} />
        ) : null}
        {!hcInit ? (
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
