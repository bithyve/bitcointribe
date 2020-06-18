console.disableYellowBox = true;
import React, { Component, useState, useEffect } from "react";
import Navigator from "./src/navigation/Navigator";
import { store, Provider } from "./src/store";



import { getVersion, getBuildId } from 'react-native-device-info'
import { setApiHeaders } from "./src/services/api";
import firebase from 'react-native-firebase';
import { NavigationState } from "react-navigation";

const prefix = 'hexa://'

class App extends Component {
  private NoInternetBottomSheet: React.RefObject<any>;

  constructor(props) {
    super(props);
    firebase.analytics().setAnalyticsCollectionEnabled(true);
  }


  componentWillMount = () => {
    this.getAppVersion()
  };

  getAppVersion = async () => {
    let version = await getVersion()
    let buildNumber = await getBuildId()
    setApiHeaders({ appVersion: version, appBuildNumber: buildNumber })
  }

  getActiveRouteName(navigationState: NavigationState) {
    if (!navigationState) {
      return null;
    }
    const route = navigationState.routes[navigationState.index];
    // Dive into nested navigators
    if (route.routes) {
      return this.getActiveRouteName(route);
    }
    return route.routeName;
  }

  render() {
    return (
      <Provider store={store} uriPrefix={prefix}>
        <Navigator
          onNavigationStateChange={(prevState, currentState) => {
            const currentScreen = this.getActiveRouteName(currentState);
            const prevScreen = this.getActiveRouteName(prevState);
            if (prevScreen !== currentScreen) {
              firebase.analytics().setCurrentScreen(currentScreen);
            }
          }}
        />

      </Provider>
    )
  }
}

export default App

