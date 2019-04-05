import React, { Component } from "react";
import {
  View,
  AsyncStorage,
  Image,
  StyleSheet,
  ImageBackground,
  Text,
  Alert,
  StatusBar,
  Animated,
  Easing
} from "react-native";

import { colors, images } from "bithyve/src/app/constants/Constants";
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
    this.state = ({
      centerLogo: null,
      centerLogoOpticy:new Animated.Value(0)
    })

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
    }, 3000);

    Animated.timing(this.state.centerLogoOpticy,{
      toValue:1,
      duration:100,
      easing:Easing.bounce
    }).start();

    setTimeout(()=>{
        this.setState({centerLogo:images.LaunchScreen.hexaBaseCard})
    },1000);
    setTimeout(()=> {
        this.setState({centerLogo:images.LaunchScreen.hexaLogo})
    },2000);
}

  render() {
    const animatedOpcity = {opacity:this.state.centerLogoOpticy}
    return (
      <View style={styles.container}>
        <ImageBackground
          source={images.LaunchScreen.img1}
          style={styles.backgroundImage}
          imageStyle={{
            resizeMode: "cover" // works only here!
          }}
        >
          <Animated.Image
            source={this.state.centerLogo}
            style={[animatedOpcity,{ height: 200, width: 200 }]}
          />
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
