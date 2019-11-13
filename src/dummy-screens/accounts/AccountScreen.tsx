import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAddress,
  fetchBalance,
  fetchTransactions
} from "../../store/actions/accounts";

const AccountScreen = props => {
  const accountType = props.navigation.getParam("accountType");
  const dispatch = useDispatch();
  const { address, balances, transactions, loading } = useSelector(
    state => state.accounts[accountType]
  );
  const netBalance = balances
    ? balances.balance + balances.unconfirmedBalance
    : 0;

  return (
    <View style={styles.screen}>
      <Text>{accountType}</Text>
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
      <Button
        title="Transfer"
        onPress={() =>
          props.navigation.navigate("Transfer", {
            accountType
          })
        }
      />
      <View style={{ marginVertical: 20, flexDirection: "row" }}>
        <Text>Account balance: </Text>
        {loading.balances ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text>{netBalance} sats</Text>
        )}
      </View>

      <View style={{ marginVertical: 20 }}>
        <Text style={{ marginBottom: 10 }}>Receiving address:</Text>
        {loading.address ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text>{address}</Text>
        )}
      </View>

      <View style={{ margin: 40 }}>
        {loading.transactions ? (
          <ActivityIndicator size="large" />
        ) : transactions.totalTransactions ? (
          <View>
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
