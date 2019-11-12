import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAddress,
  fetchBalance,
  fetchTransactions
} from "../../store/actions/accounts";

const AccountScreen = props => {
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
      <Button
        title="Fetch Transactions"
        onPress={async () => {
          await dispatch(fetchTransactions(accountType));
        }}
      />
      <Text style={{ marginVertical: 20 }}>
        Account balance: {netBalance ? <Text>{netBalance}</Text> : 0} sats.
      </Text>
      {address ? (
        <Text style={{ marginVertical: 20 }}>Receiving address: {address}</Text>
      ) : null}

      {transactions.totalTransactions ? (
        <View style={{ margin: 40 }}>
          <Text>Total Transactions: {transactions.totalTransactions}</Text>
          <View style={{ margin: 10, padding: 10 }}>
            {transactions.transactionDetails.map(tx => (
              <View key={tx.txid}>
                <Text style={{ marginVertical: 5 }}>Txn ID: {tx.txid}</Text>
                <Text style={{ marginVertical: 5 }}>Amount: {tx.amount}</Text>
              </View>
            ))}
          </View>
        </View>
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
