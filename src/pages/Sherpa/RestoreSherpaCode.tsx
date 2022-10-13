import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text, SafeAreaView, StatusBar } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Colors from "../../common/Colors";
import CommonStyles from "../../common/Styles/Styles";
import Fonts from "../../common/Fonts";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { RFValue } from "react-native-responsive-fontsize";

export type IRestoreSherpaCodeProps = { navigation: any };

const RestoreSherpaCode: React.FC<IRestoreSherpaCodeProps> = ({
  navigation,
}) => {
  const [code, setCode] = useState("");

  useEffect(() => {
    // set the code here.

    setCode("S1G3H");
  });

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View
        style={[
          CommonStyles.headerContainer,
          {
            backgroundColor: "#F8F8F8",
            marginHorizontal: wp(2),
          },
        ]}
      >
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontFamily: Fonts.FiraSansMedium,
          marginHorizontal: wp(8),
          fontSize: RFValue(20),
          color: "#006CB4",
        }}
      >
        Restore Wallet
      </Text>

      <Text
        style={{
          fontSize: RFValue(13),
          fontFamily: Fonts.FiraSansRegular,
          marginHorizontal: wp(8),
          marginTop: hp(5),
        }}
      >
        Sherpa code
      </Text>

      <Text style={styles.code}>{code}</Text>

      <View style={{flex: 1}} />

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text
          style={{
            color: "#FAFAFA",
            fontFamily: Fonts.FiraSansMedium,
            fontSize: RFValue(13),
          }}
        >
          Restore Wallet
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default RestoreSherpaCode;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  button: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.blue,
    width: wp(40),
    height: hp(7),
    marginBottom: Math.min(hp(5), 40),
    marginHorizontal: wp(8),
  },
  code: {
    backgroundColor: "#fff",
    width: wp(80),
    borderRadius: hp(1.5),
    marginHorizontal: wp(8),
    marginTop: hp(2.5),
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(30),
    letterSpacing: 5,
    color: "#006CB4",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
  },
});
