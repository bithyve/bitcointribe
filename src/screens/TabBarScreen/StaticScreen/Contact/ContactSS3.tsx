import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";

const ContactSS3 = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => navigation.navigate("TabbarBottom")}>
        <Image
          source={require("../../../assets/images/staticScreen/ContactScreen3.png")}
          style={{ width: "100%", height: "100%" }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({});

export default ContactSS3;
