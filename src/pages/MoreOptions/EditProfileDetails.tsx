import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import Icon from "react-native-vector-icons/Ionicons";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import {
    heightPercentageToDP,
    widthPercentageToDP,
  } from "react-native-responsive-screen";

import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";

const EditProfileDetails = (props) => {
  const [pickerResponse, setPickerResponse] = useState(null);
  const [username, setUsername] = useState(props.walletName ? props.walletName : '');
  const onImageLibraryPress = async () => {
    const options = {
      selectionLimit: 1,
      mediaType: "photo",
      includeBase64: false,
    };
    const result = await launchImageLibrary(options);
    const uri = result?.assets && result.assets[0].uri;
    setPickerResponse(uri);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeIconWrapper}
        onPress={props.closeBottomSheet}
      >
        <Icon name={"close-outline"} color={"#fff"} size={20} />
      </TouchableOpacity>
      <View style={styles.titleWrapper}>
        <Text style={styles.titleStyle}>Edit Details</Text>
        <Text style={styles.subTitleStyle}>Edit your name {"&"} picture</Text>
      </View>
      <View
        style={{ flexDirection: "row", width: "100%", alignItems: "center" }}
      >
        <TouchableOpacity
          onPress={() => onImageLibraryPress()}
          style={{ width: "40%" }}
        >
          {pickerResponse ? (
            <View>
              <Image
                style={styles.imageStyle}
                source={{ uri: pickerResponse }}
              />
              <Text style={styles.changeTextstyle}>Change</Text>
            </View>
          ) : (
            <View style={[styles.imageStyle, styles.pickImageView]}>
              <Text>Pick Image</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={{ width: "55%" }}>
          <TextInput
            style={styles.inputBox}
            autoCorrect={false}
            autoFocus={false}
            placeholder={ "Username"}
            placeholderTextColor={Colors.textColorGrey}
            onChangeText={(name) => {
              name = name.replace(/[^A-Za-z0-9 ]/g, "");
              setUsername(name);
            }}
            value={username}
          />
        </View>
      </View>
      <TouchableOpacity
              style={styles.saveBtnStyle}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontFamily: Fonts.FiraSansSemiBold,
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.backgroundColor,
  },
  closeIconWrapper: {
    backgroundColor: "#FFC723",
    height: 35,
    width: 35,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  titleWrapper: {
    marginVertical: 20,
  },
  titleStyle: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontWeight: "500",
    lineHeight: 45,
  },
  subTitleStyle: {
    color: Colors.greyText,
    fontSize: RFValue(12),
  },
  imageStyle: {
    height: 120,
    width: 120,
    borderRadius: 120,
    position: "relative",
  },
  pickImageView: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: Colors.greyText,
    borderWidth: 0.6,
  },
  changeTextstyle: {
    color: Colors.backgroundColor1,
    fontSize: RFValue(10),
    position: "absolute",
    bottom: 10,
    right: 62,
  },
  inputBox: {
    backgroundColor: Colors.backgroundColor1,
    height: 60,
    width: "100%",
    borderColor: Colors.greyText,
    borderWidth: 0.2,
    borderRadius: 10,
    paddingLeft: 5,
  },
  saveBtnStyle: {
    marginTop: "15%",
    backgroundColor: Colors.blue,
    width: widthPercentageToDP(30),
    height: heightPercentageToDP(7),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: widthPercentageToDP(3),
    alignSelf: 'flex-end'
  }
});
export default EditProfileDetails;
