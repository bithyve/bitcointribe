import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  TextInput,
  ImageBackground
} from "react-native";

//TODO: Custome Pages
import { images } from "../../app/constants/Constants";

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    StatusBar.setHidden(true);
    this.state = {
      code: "",
      visible: false
    };
    this.click_HomeScreenShow = this.click_HomeScreenShow.bind();
    // this.click_HomeScreenShow();
  }

  //TODO: Tabbar screen show
  click_HomeScreenShow() {
    this.props.navigation.navigate("TabbarBottom");
  }

  render() {
    return (
      <ImageBackground
        source={images.loginScreen.backgoundImage}
        style={styles.container}
      >
        <View style={styles.viewAppIcon}>
          <Image style={styles.imgAppIcon} source={images.appIcon} />
          <Text style={styles.txtTitle}>Login with</Text>
          <Text style={styles.txtSubTitle}>FACE ID</Text>
          <Image
            style={styles.imgFaceId}
            source={images.loginScreen.faceIdImage}
          />
          <Text style={styles.txtUnderLine}>
                                                                                 
          </Text>
          <Text style={styles.txtTitle}>Use</Text>
          <Text style={[styles.txtSubTitle, { color: "#F8F8FF" }]}>
            PASSCODE
          </Text>
          <View style={styles.viewPasscode}>
            <TextInput
              secureTextEntry={true}
              keyboardType="numeric"
              maxLength={1}
              style={styles.txtInppasscode}
            />
            <TextInput
              secureTextEntry={true}
              keyboardType="numeric"
              maxLength={1}
              style={styles.txtInppasscode}
            />
            <TextInput
              secureTextEntry={true}
              keyboardType="numeric"
              maxLength={1}
              style={styles.txtInppasscode}
            />
            <TextInput
              secureTextEntry={true}
              keyboardType="numeric"
              maxLength={1}
              style={styles.txtInppasscode}
              onChangeText={() =>
                this.props.navigation.navigate("TabbarBottom")
              }
            />
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  viewAppIcon: {
    alignItems: "center"
  },
  imgAppIcon: {
    width: 120,
    height: 120,
    marginTop: 40
  },
  txtTitle: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 20
  },
  txtSubTitle: {
    color: "#ffffff",
    fontSize: 28
  },
  imgFaceId: {
    width: 80,
    height: 80,
    margin: 10
  },
  txtUnderLine: {
    color: "#ffffff",
    textDecorationLine: "underline"
  },
  //passcode input
  viewPasscode: {
    flexDirection: "row",
    marginTop: 15
  },
  txtInppasscode: {
    width: 30,
    height: 30,
    marginLeft: 5,
    borderColor: "#fffff2",
    borderWidth: 1,
    borderRadius: 3,
    textAlign: "center"
  }
});
