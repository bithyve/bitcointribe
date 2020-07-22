console.disableYellowBox = true;
import React, { Component, useState, useEffect } from 'react';
import Navigator from './src/navigation/Navigator';
import { store, Provider } from './src/store';
import NoInternetModalContents from './src/components/NoInternetModalContents';
import TransparentHeaderModal from './src/components/TransparentHeaderModal';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import NetInfo from '@react-native-community/netinfo';
import { getVersion, getBuildId } from 'react-native-device-info';
import { setApiHeaders } from './src/services/api';
import firebase from 'react-native-firebase';
import { NavigationState } from 'react-navigation';
import { AsyncStorage } from 'react-native';
import ModalHeader from './src/components/ModalHeader';

const prefix = 'hexa://';

class App extends Component {
  private NoInternetBottomSheet: React.RefObject<any>;

  constructor(props) {
    super(props);
    firebase.analytics().setAnalyticsCollectionEnabled(true);
    this.NoInternetBottomSheet = React.createRef();
  }

  componentWillMount = () => {
    this.getAppVersion();
  };

  getAppVersion = async () => {
    let version = await getVersion();
    let buildNumber = await getBuildId();
    setApiHeaders({ appVersion: version, appBuildNumber: buildNumber });
  };

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

  componentWillUnmount = async () => {
    await AsyncStorage.setItem(
      'isInternetModalCome',
      JSON.stringify(false),
    );
  }

  render() {
    return (
      <Provider store={store} uriPrefix={prefix}>
        <Navigator
          onNavigationStateChange={async (prevState, currentState) => {
            const currentScreen = this.getActiveRouteName(currentState);
            const prevScreen = this.getActiveRouteName(prevState);
            let isInternetModalCome = JSON.parse(
              await AsyncStorage.getItem('isInternetModalCome'),
            );
            if (
              currentScreen != 'Login' &&
              currentScreen != 'Home' &&
              currentScreen != 'Launch' &&
              currentScreen != 'ReLogin' && !isInternetModalCome
            ) {
              console.log("global.isInternetModalCome", isInternetModalCome, typeof isInternetModalCome);
              NetInfo.addEventListener((state) => {
                setTimeout(() => {
                  if (state.isInternetReachable === null) {
                    return;
                  }
                  if (state.isInternetReachable) {
                    (this.NoInternetBottomSheet as any).current.snapTo(0);
                  } else {
                    (this.NoInternetBottomSheet as any).current.snapTo(1);
                  }
                }, 1000);
              });
            }
            if (prevScreen !== currentScreen) {
              firebase.analytics().setCurrentScreen(currentScreen);
            }
          }}
        />
        <BottomSheet
          onCloseEnd={() => {}}
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={this.NoInternetBottomSheet}
          snapPoints={[-50, hp('60%')]}
          renderContent={() => (
            <NoInternetModalContents
              onPressTryAgain={() => {
                (this.NoInternetBottomSheet as any).current.snapTo(0);
              }}
              onPressIgnore={async () => {
                await AsyncStorage.setItem(
                  'isInternetModalCome',
                  JSON.stringify(true),
                );
                (this.NoInternetBottomSheet as any).current.snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
            // onPressHeader={() => {
            //     (this.NoInternetBottomSheet as any).current.snapTo(0);
            //   }}
            />
          )}
        />
      </Provider>
    );
  }
}

export default App;
