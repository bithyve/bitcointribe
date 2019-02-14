import React, { Component } from "react";
import {
  View,
  AsyncStorage,
  Image,
  StyleSheet,
  Text,
  Alert
} from "react-native";

import { colors } from "../../app/constants/Constants";
import Singleton from "../../app/constants/Singleton";
import * as Keychain from "react-native-keychain";
interface Props {
  onComplited: Function;
}

export default class LaunchScreen extends Component<Props, any> {
  constructor(props: any) {
    super(props);
  }
  async componentDidMount() {
    let commonData = Singleton.getInstance();
    let value = await AsyncStorage.getItem("PasscodeCreateStatus");
    let status = JSON.parse(value);
    const credentials = await Keychain.getGenericPassword();
    commonData.setPasscode(credentials.password);
    setTimeout(() => {
      if (status) {
        this.props.onComplited(false, "PasscodeScreen");
      } else {
        this.props.onComplited(false, "OnBoardingNavigator");
      }
    }, 1000);
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.appLogo}
          source={require("../../assets/images/appLogo.png")}
        />
        <Text style={styles.txtAppName}>MY MONEY</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  appLogo: {
    width: 300,
    height: 300,
    borderRadius: 150
  },
  txtAppName: {
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 20,
    color: colors.appColor
  }
});
