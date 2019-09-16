import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";

const AccountSS1 = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => navigation.navigate("AccountSS2")}>
        <Image
          source={require("../../../../assets/images/staticScreen/AccountScreen1.png")}
          style={{ width: "100%", height: "100%" }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({});

export default AccountSS1;
