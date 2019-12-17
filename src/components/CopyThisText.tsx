import React from "react";
import { View, Image, TouchableOpacity, Text, Clipboard } from "react-native";
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
export default function CopyThisText(props) {
  function writeToClipboard() {
    Clipboard.setString(props.text);
  }

  return (
    <TouchableOpacity
      onPress={() => writeToClipboard()}
      style={{
        flexDirection: "row",
        paddingLeft: 25,
        paddingRight: 25,
        marginTop: 30
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.backgroundColor,
          borderBottomLeftRadius: 8,
          borderTopLeftRadius: 8,
          height: 50,
          paddingLeft: 15,
          paddingRight: 15,
          justifyContent: "center"
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            fontSize: RFValue(13, 812),
            color: Colors.lightBlue
          }}
        >
          {props.text}
        </Text>
      </View>
      <View
        style={{
          width: 48,
          height: 50,
          backgroundColor: Colors.borderColor,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Image
          style={{ width: 18, height: 20 }}
          source={require("../assets/images/icons/icon-copy.png")}
        />
      </View>
    </TouchableOpacity>
  );
}
