import React, { Component } from "react";
import {
  View,
  AsyncStorage,
  Image,
  StyleSheet,
  ImageBackground,
  Text,
  Alert,
  StatusBar
} from "react-native";

import { colors } from "bithyve/src/app/constants/Constants";
import Singleton from "bithyve/src/app/constants/Singleton";

//localization
import { localization } from "bithyve/src/app/manager/Localization/i18n";

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
        <ImageBackground
          source={require("bithyve/src/assets/images/LaunchScrenn/lunchScreenIcon.png")}
          style={styles.backgroundImage}
          imageStyle={{
            resizeMode: "cover" // works only here!
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
  },
  backgroundImage: {
    flex: 1
  }
});
