import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";

const ContactSS2 = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => navigation.navigate("ContactSS3")}>
        <Image
          source={require("../../../assets/images/staticScreen/ContactScreen2.png")}
          style={{ width: "100%", height: "100%" }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({});

export default ContactSS2;
