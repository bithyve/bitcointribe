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
import {
  TEST_ACCOUNT,
  SECURE_ACCOUNT
} from "../../common/constants/serviceTypes";

const AccountScreen = props => {
  const serviceType = props.navigation.getParam("serviceType");
  const dispatch = useDispatch();
  const { loading, service } = useSelector(
    state => state.accounts[serviceType]
  );

  if (serviceType !== SECURE_ACCOUNT) {
    const { mnemonic } = service.getMnemonic().data;
    console.log({ mnemonic });
  }

  const { balances, receivingAddress, transactions } =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;
  const netBalance = service
    ? balances.balance + balances.unconfirmedBalance
    : 0;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Button
        title="Fetch Addr"
        onPress={() => {
          dispatch(fetchAddress(serviceType));
        }}
      />
      <Button
        title="Fetch Balance"
        onPress={async () => {
          dispatch(fetchBalance(serviceType));
        }}
      />
      {serviceType === TEST_ACCOUNT ? (
        <Button
          title="Get Testcoins"
          onPress={async () => {
            dispatch(getTestcoins(serviceType));
          }}
        />
      ) : null}
      <Button
        title="Fetch Transactions"
        onPress={async () => {
          dispatch(fetchTransactions(serviceType));
        }}
      />
      <Button
        title="Transfer"
        onPress={() => {
          dispatch(clearTransfer(serviceType));
          props.navigation.navigate("Transfer", {
            serviceType
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
        {loading.receivingAddress ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text>{receivingAddress}</Text>
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
    headerTitle: navData.navigation.getParam("serviceType")
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
