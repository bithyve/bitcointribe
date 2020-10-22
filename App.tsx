console.disableYellowBox = true;
import React, { useEffect, useRef } from 'react';
import Navigator from './src/navigation/Navigator';
import { Provider } from 'react-redux';
import makeStore from './src/store';
import NoInternetModalContents from './src/components/NoInternetModalContents';
import BottomSheet from 'reanimated-bottom-sheet';
import { useDispatch } from 'react-redux';
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import NetInfo from '@react-native-community/netinfo';
import { getVersion, getBuildId } from 'react-native-device-info';
import { setApiHeaders } from './src/services/api';
import firebase from 'react-native-firebase';
import { NavigationState } from 'react-navigation';
import { updatePreference } from './src/store/actions/preferences';
import usePreferencesState from './src/utils/hooks/state-selectors/preferences/UsePreferencesState';

export const URI_PREFIX = 'hexa://';

function getActiveRouteName(navigationState: NavigationState) {
  if (!navigationState) {
    return null;
  }

  const route = navigationState.routes[navigationState.index];
  // Dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route);
  }
  return route.routeName;
}

export default function AppWrapper() {

  // Creates and holds an instance of the store so only children in the `Provider`'s
  // context can have access to it. (see: https://stackoverflow.com/a/60329482/8859365)
  const store = makeStore();

  return (
    <Provider store={store} uriPrefix={URI_PREFIX}>
      <AppContent />
    </Provider>
  );
}

function AppContent() {
  const dispatch = useDispatch();
  const preferencesState = usePreferencesState();
  const noInternetBottomSheetRef = useRef<BottomSheet>();

  async function getAppVersion() {
    let version = await getVersion();
    let buildNumber = await getBuildId();
    setApiHeaders({ appVersion: version, appBuildNumber: buildNumber });
  };

  async function resetInternetWarningFlag() {
    await dispatch(updatePreference({
      key: 'hasShownNoInternetWarning',
      value: false,
    }));
  }

  useEffect(() => {
    getAppVersion();
  }, []);

  useEffect(() => {
    firebase.analytics().setAnalyticsCollectionEnabled(true);
  }, []);


  useEffect(() => {
    return () => {
      resetInternetWarningFlag();
    };
  }, []);

  return (
    <>
      <Navigator
        onNavigationStateChange={async (prevState, currentState) => {
          const currentScreen = getActiveRouteName(currentState);
          const prevScreen = getActiveRouteName(prevState);

          if (
            currentScreen != 'Login' &&
            currentScreen != 'Launch' &&
            currentScreen != 'ReLogin' &&
            !preferencesState.hasShownNoInternetWarning
          ) {
            NetInfo.addEventListener((state) => {
              setTimeout(() => {
                if (state.isInternetReachable === null) {
                  return;
                }
                if (state.isInternetReachable) {
                  noInternetBottomSheetRef.current?.snapTo(0);
                } else {
                  noInternetBottomSheetRef.current?.snapTo(1);
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
        onCloseEnd={() => { }}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={noInternetBottomSheetRef}
        snapPoints={[-50, hp('60%')]}
        renderContent={() => (
          <NoInternetModalContents
            onPressTryAgain={() => {
              noInternetBottomSheetRef.current?.snapTo(0);
            }}
            onPressIgnore={() => {
              resetInternetWarningFlag();
              noInternetBottomSheetRef.current?.snapTo(0);
            }}
          />
        )}
      />
    </>
  );
}
