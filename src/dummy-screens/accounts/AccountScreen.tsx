import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddress, fetchBalance } from "../../store/actions/accounts";

const AccountScreen = props => {
  const accountType = props.navigation.getParam("accountType");
  const dispatch = useDispatch();
  const { address, balances } = useSelector(
    state => state.accounts[accountType]
  );

  const netBalance = balances
    ? balances.balance + balances.unconfirmedBalance
    : 0;

  return (
    <View style={styles.screen}>
      <Text>{accountType} Here!</Text>
      <Button
        title="Fetch Addr"
        onPress={() => {
          dispatch(fetchAddress(accountType));
        }}
      />
      <Button
        title="Fetch Balance"
        onPress={async () => {
          await dispatch(fetchBalance(accountType));
        }}
      />
      <Text style={{ marginVertical: 20 }}>
        Account balance: {netBalance ? <Text>{netBalance}</Text> : 0} sats.
      </Text>
      {address ? (
        <Text style={{ marginVertical: 20 }}>Receiving address: {address}</Text>
      ) : null}
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

export default AccountScreen;
