import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

import CheckMark from "../../assets/images/svgs/checkmarktick.svg";
import Fonts from "../../common/Fonts";
import Colors from "../../common/Colors";

export default function CheckBox(props) {
  return (
    <View style={styles.checkBoxDirectionContainer}>
      {props.checkStatus ? (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.checkBoxColorContainer}
          onPress={() => props.setCheckStatus()}
        >
          <CheckMark />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.checkBoxBorderContainer}
          onPress={() => props.setCheckStatus()}
        ></TouchableOpacity>
      )}
      <View>
        <Text style={styles.checkBoxTitleText}>{props.titleText}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  //
  checkBoxDirectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(6),
    paddingVertical: wp(6),
  },
  checkBoxBorderContainer: {
    borderWidth: 1,
    borderColor: Colors.gray12,
    width: wp(5),
    height: 20,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  checkBoxColorContainer: {
    width: wp(5),
    height: 20,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.green,
  },
  checkBoxTitleText: {
    color: Colors.lightTextColor,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: wp(4),
    width: wp("70%"),
    marginTop: hp(0.6),
  },
});
