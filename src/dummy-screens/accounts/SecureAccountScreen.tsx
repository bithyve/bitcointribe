import React,{useState} from "react";
import { View, Text, StyleSheet, Button,TextInput } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    setupSecureAccount,
    checkHealth,
    isActive,
    secureFetchAddress,
    secureFetchBalance,
    secureFetchTransactions
} from "../../store/actions/secureAccount";
import {
  SECURE_ACCOUNT
} from "../../common/constants/serviceTypes";
const SecureAccountScreen = props => {
  const serviceType = props.navigation.getParam("serviceType");
  const dispatch = useDispatch();
  const [chunk, setChunk] = useState("");
  const [POS, setPOS] = useState();
  return (
    <View style={styles.screen}>
      <Text>{serviceType} Here!</Text>
      <Button
        title="Setup Secure Account"
        onPress={async() => {
       dispatch(setupSecureAccount(serviceType));
        }}
      />
      <Button
        title="SecureAcc isActive "
        onPress={async() => {
       dispatch(isActive(serviceType));
        }}
      />
      <View style={{ flexDirection: "row", marginVertical: 5 }}>
          <Text>chunk: </Text>
          <TextInput
            value={chunk}
            onChangeText={setChunk}
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
          <Text>POS: </Text>
          <TextInput
            value={POS}
            onChangeText={setPOS}
            style={{
              borderBottomWidth: 0.5,
              width: 200,
              textAlign: "center"
            }}
            keyboardType="numeric"
          />
        </View>

      <Button
        title="Check Health"
        onPress={async() => {
       dispatch(checkHealth(serviceType,{chunk,POS: parseInt(POS)})
       );
        }}
      /> 
      <Button
        title="Fetch Addr"
        onPress={() => {
          dispatch(secureFetchAddress(serviceType));
        }}
      />
      <Button
        title="Fetch Balance"
        onPress={async () => {
          dispatch(secureFetchBalance(serviceType));
        }}
      />
      <Button
        title="Fetch Transactions"
        onPress={async () => {
          dispatch(secureFetchTransactions(serviceType));
        }}
      />
     <Button
            title="Transfer"
            onPress={() => {
              props.navigation.navigate("GAToken", {
                serviceType: SECURE_ACCOUNT
              });
            }}
      />   
    </View>
    
  );
};
SecureAccountScreen.navigationOptions = navData => {
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

export default SecureAccountScreen;
