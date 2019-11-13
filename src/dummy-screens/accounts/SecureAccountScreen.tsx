import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    setupSecureAccount
} from "../../store/actions/secureAccount-setup";

const SecureAccountScreen = props => {
  const accountType = props.navigation.getParam("accountType");
  const dispatch = useDispatch();
  const { address, balances, transactions } = useSelector(
    state => state.accounts[accountType]
  );
  console.log({ transactions });

  const netBalance = balances
    ? balances.balance + balances.unconfirmedBalance
    : 0;

  return (
    <View style={styles.screen}>
      <Text>{accountType} Here!</Text>
      <Button
        title="Setup Secure Account"
        onPress={() => {
          dispatch(setupSecureAccount());
        }}
      />    
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

export default SecureAccountScreen;
