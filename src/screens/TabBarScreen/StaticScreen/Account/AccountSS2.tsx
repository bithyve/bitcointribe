import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";

const AccountSS2 = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => navigation.navigate("TabbarBottom")}>
        <Image
          source={require("../../../../assets/images/staticScreen/AccountScreen2.png")}
          style={{ width: "100%", height: "100%" }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({});

export default AccountSS2;
