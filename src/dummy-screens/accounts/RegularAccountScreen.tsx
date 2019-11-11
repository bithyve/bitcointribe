import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddress } from "../../store/actions/accounts";
import { REGULAR_ACCOUNT } from "../../common/constants/accountTypes";

const RegularAccountScreen = props => {
  console.log("PAINTED");
  const dispatch = useDispatch();
  const address = useSelector(state => state.accounts.REGULAR_ACCOUNT.address);
  return (
    <View style={styles.screen}>
      <Text>RegularAccount Here!</Text>
      <Button
        title="Fetch Addr"
        onPress={() => {
          dispatch(fetchAddress(REGULAR_ACCOUNT));
        }}
      />
      {address ? <Text>{address}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default RegularAccountScreen;
