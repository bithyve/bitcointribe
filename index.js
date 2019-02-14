/** @format */
import React from "react";
import { createAppContainer } from "react-navigation";
import { AsyncStorage, AppState, AppRegistry, Linking } from "react-native";
import DeepLinking from "react-native-deep-linking";
import "./shim";
import { name as appName } from "./app.json";
import { createRootNavigator } from "./src/app/router/router";
// import LaunchScreen from "../"
import LaunchScreen from "./src/screens/LaunchScreen/LaunchScreen";
import Singleton from "./src/app/constants/Singleton";

export default class MyMoney extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      status: true,
      isStartPage: "OnBoardingNavigator",
      appState: AppState.currentState
    };
  }

  async componentDidMount() {
    try {
      AppState.addEventListener("change", this._handleAppStateChange);
      AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(true));

      //TODO: Deep Linking
      let commonData = Singleton.getInstance();
      DeepLinking.addScheme("https://");
      Linking.addEventListener("url", this.handleUrl);

      DeepLinking.addRoute(
        "/mobile.cmshuawei.com/jointAccountCreate",
        response => {
          // bithyve://jointAccountCreate
          console.log({
            response
          });
        }
      );
      DeepLinking.addRoute(
        "/mobile.cmshuawei.com/jointAccountCreate/:script",
        response => {
          // bithyve:///jointAccountCreate/pageName
          let res = response;
          console.log({
            res
          });
          Alert.alert(JSON.stringify(response));
        }
      );
      DeepLinking.addRoute(
        "/mobile.cmshuawei.com/jointAccountCreate/:pageName/:script",
        response => {
          // bithyve://jointAccountCreate/pageName/100
          console.log({
            response
          });
          let pageName = response.pageName;
          commonData.setRootViewController(pageName);
          commonData.setDeepLinkingUrl(response.script);
        }
      );

      Linking.getInitialURL()
        .then(url => {
          if (url) {
            let uri_dec = decodeURIComponent(url);
            Linking.openURL(url);
            DeepLinking.evaluateUrl(uri_dec);
          }
        })
        .catch(err => console.error("An error occurred", err));
    } catch (error) {
      // Error saving data
    }
  }

  handleUrl = ({ url }) => {
    let uri_dec = decodeURIComponent(url);
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        DeepLinking.evaluateUrl(uri_dec);
      }
    });
  };

  componentWillUnmount() {
    Linking.removeEventListener("url", this.handleUrl);
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = async nextAppState => {
    var status = JSON.parse(await AsyncStorage.getItem("PasscodeCreateStatus"));
    let flag_BackgoundApp = JSON.parse(
      await AsyncStorage.getItem("flag_BackgoundApp")
    );
    if (status && flag_BackgoundApp) {
      this.setState({
        appState: AppState.currentState
      });
      if (this.state.appState.match(/inactive|background/)) {
        console.log({
          status
        });
        this.setState({
          status: true
        });
        console.log("forgound = " + this.state.status, this.state.isStartPage);
      }
    }
  };

  onComplited(status, pageName) {
    this.setState({
      status: status,
      isStartPage: pageName
    });
  }
  render() {
    const Layout = createRootNavigator(
      this.state.status,
      this.state.isStartPage
    );
    console.log("first = " + this.state.status, this.state.isStartPage);
    const AppContainer = createAppContainer(Layout);
    return this.state.status ? (
      <LaunchScreen
        onComplited={(status: boolean, pageName: string) =>
          this.onComplited(status, pageName)
        }
      />
    ) : (
      <AppContainer />
    );
  }
}

console.disableYellowBox = true;
AppRegistry.registerComponent(appName, () => MyMoney);
