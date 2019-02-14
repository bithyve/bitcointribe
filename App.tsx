/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { AsyncStorage, AppState, View } from "react-native";
import { createRootNavigator } from "./src/app/router/router";
import { createAppContainer } from "react-navigation";

export default class App extends Component<any, any> {
  navigator = null;
  constructor(props: any) {
    super(props);
    this.state = {
      signedIn: true,
      loadingPage: "OnBoarding",
      appState: AppState.currentState
    };
    console.disableYellowBox = true;
  }

  //TODO: App Life Cycle
  componentWillMount() {
    this.retrieveData();
  }

  // componentDidMount() {
  //   AppState.addEventListener('change', this._handleAppStateChange);
  //loaderHandler.showLoader("Loading");
  // }

  // componentWillUnmount() {
  //   AppState.removeEventListener('change', this._handleAppStateChange);
  // }

  //TODO: Fun RetriveData
  retrieveData = async () => {
    try {
      var value = await AsyncStorage.getItem("@loadingPage:key");
      if (value == "Password") {
        this.setState({
          signedIn: false
        });
      } else if (value == "TabbarBottom") {
        this.setState({
          loadingPage: "TabbarBottom"
        });
      } else {
        this.setState({
          loadingPage: "OnBoarding"
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  //TODO: App Check forgound,backgound,active
  _handleAppStateChange = async nextAppState => {
    //if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      try {
        var value = await AsyncStorage.getItem("@loadingPage:key");
        console.log("forgount value =" + value);
        if (value == "Home") {
          this.setState({
            signedIn: false
          });
          AsyncStorage.setItem("@signedPage:key", "Home");
        }
        AsyncStorage.setItem("@loadingPage:key", "Password");
      } catch (error) {
        // Error saving data
      }
    }
    this.setState({ appState: nextAppState });
  };

  render() {
    const { signedIn } = this.state;
    const Layout = createRootNavigator(signedIn, this.state.loadingPage);
    const AppContainer = createAppContainer(Layout);
    // <BusyIndicator />
    return (
      <AppContainer
        ref={nav => {
          this.navigator = nav;
        }}
      />
    );
  }
}
