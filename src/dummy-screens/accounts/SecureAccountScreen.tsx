import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    setupSecureAccount,
    checkHealth
} from "../../store/actions/secureAccount-setup";
import {
  SECURE_ACCOUNT
} from "../../common/constants/accountTypes";
const SecureAccountScreen = props => {
  const accountType = props.navigation.getParam("accountType");
  const dispatch = useDispatch();

  return (
    <View style={styles.screen}>
      <Text>{accountType} Here!</Text>
      <Button
        title="Setup Secure Account"
        onPress={() => {
       dispatch(setupSecureAccount(accountType));
        }}
      />
      <Button
        title="Check Health"
        onPress={() => {
       dispatch(checkHealth(accountType));
        }}
      /> 
     <Button
            title="Secure Account"
            onPress={() => {
              props.navigation.navigate("Account", {
                accountType: SECURE_ACCOUNT
              });
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
