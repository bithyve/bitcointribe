import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ActivityIndicator
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  transferST1,
  transferST2,
  clearTransfer,
  transferST3
} from "../../store/actions/accounts";
import { SECURE_ACCOUNT } from "../../common/constants/serviceTypes";

const TransferScreen = props => {
  const serviceType = props.navigation.getParam("serviceType");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState();
  const [token, setToken] = useState("");

  const { transfer, loading, service } = useSelector(
    state => state.accounts[serviceType]
  );

  const stage1 = () => (
    <View>
      <View style={{ flexDirection: "row", marginVertical: 5 }}>
        <Text>Address: </Text>
        <TextInput
          value={recipientAddress}
          onChangeText={setRecipientAddress}
          style={{
            borderBottomWidth: 0.5,
            width: 200,
            textAlign: "center"
          }}
        />
      </View>
      <View
        style={{ flexDirection: "row", marginVertical: 5, marginBottom: 10 }}
      >
        <Text>Amount: </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          style={{
            borderBottomWidth: 0.5,
            width: 200,
            textAlign: "center"
          }}
          keyboardType="numeric"
        />
      </View>
      {loading.transfer ? (
        <ActivityIndicator size="small" style={{ marginVertical: 5 }} />
      ) : (
        <Button
          title="Confirm"
          onPress={() => {
            dispatch(
              transferST1(serviceType, {
                recipientAddress,
                amount: parseInt(amount)
              })
            );
          }}
        />
      )}
    </View>
  );

  const stage2 = () => (
    <View>
      <Text style={{ marginVertical: 5 }}>Sending to: {recipientAddress}</Text>
      <Text style={{ marginVertical: 5 }}>Amount: {amount}</Text>
      <Text style={{ marginVertical: 10 }}>
        Transaction Fee: {transfer.stage1.fee}
      </Text>
      {loading.transfer ? (
        <ActivityIndicator size="small" style={{ marginVertical: 5 }} />
      ) : (
        <View>
          <Button
            title="Send"
            onPress={() => {
              dispatch(transferST2(serviceType));
            }}
          />
          <Button
            title="Cancel"
            onPress={() => {
              dispatch(clearTransfer(serviceType));
            }}
          />
        </View>
      )}
    </View>
  );

  const stage3 = () => (
    <View style={{ margin: 40 }}>
      <View style={{ flexDirection: "row", marginVertical: 5 }}>
        <Text>2FA Token: </Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          style={{
            borderBottomWidth: 0.5,
            width: 200,
            textAlign: "center"
          }}
        />
      </View>
      <View style={{ marginVertical: 10 }}>
        {serviceType === SECURE_ACCOUNT ? (
          <Text>2FA Key: {service.secureHDWallet.twoFASetup.secret}</Text>
        ) : null}
      </View>
      {loading.transfer ? (
        <ActivityIndicator size="small" style={{ marginVertical: 5 }} />
      ) : (
        <View>
          <Button
            title="Submit"
            onPress={() => {
              dispatch(transferST3(serviceType, token));
            }}
          />
          <Button
            title="Cancel"
            onPress={() => {
              dispatch(clearTransfer(serviceType));
            }}
          />
        </View>
      )}
    </View>
  );

  const executed = () => (
    <View style={{ margin: 40, padding: 10 }}>
      <Text>Transaction Successful!</Text>
      <Text style={{ marginTop: 10, marginBottom: 4 }}>Transaction ID:</Text>
      <Text>{transfer.txid}</Text>
    </View>
  );

  const dispatch = useDispatch();
  return (
    <View style={styles.screen}>
      {transfer.txid
        ? executed()
        : !transfer.executed
        ? stage1()
        : transfer.executed === "ST1"
        ? stage2()
        : stage3()}
    </View>
  );
};

TransferScreen.navigationOptions = navData => {
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

export default TransferScreen;
