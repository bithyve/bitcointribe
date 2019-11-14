import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAddress,
  fetchBalance,
  fetchTransactions,
  clearTransfer,
  getTestcoins
} from "../../store/actions/accounts";
import { TEST_ACCOUNT } from "../../common/constants/accountTypes";

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
    <ScrollView contentContainerStyle={styles.screen}>
      <Button
        title="Fetch Addr"
        onPress={() => {
          dispatch(fetchAddress(accountType));
        }}
      />
      <Button
        title="Fetch Balance"
        onPress={async () => {
          dispatch(fetchBalance(accountType));
        }}
      />
      {accountType === TEST_ACCOUNT ? (
        <Button
          title="Get Testcoins"
          onPress={async () => {
            dispatch(getTestcoins(accountType));
          }}
        />
      ) : null}
      <Button
        title="Fetch Transactions"
        onPress={async () => {
          dispatch(fetchTransactions(accountType));
        }}
      />
      <Button
        title="Transfer"
        onPress={() => {
          dispatch(clearTransfer(accountType));
          props.navigation.navigate("Transfer", {
            accountType
          });
        }}
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
            <Text>Transactions:</Text>
            <View style={{ margin: 10, padding: 10 }}>
              {transactions.transactionDetails.map(tx => (
                <View key={tx.txid}>
                  <Text style={{ marginVertical: 5 }}>Txn ID: {tx.txid}</Text>
                  <View
                    style={{
                      marginVertical: 5,
                      flexDirection: "row",
                      justifyContent: "space-between"
                    }}
                  >
                    <Text>Amount: {tx.amount}</Text>
                    <Text>{tx.transactionType}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

AccountScreen.navigationOptions = navData => {
  return {
    headerTitle: navData.navigation.getParam("accountType")
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default AccountScreen;
