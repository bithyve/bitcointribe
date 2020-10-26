
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Navigator from './src/navigation/Navigator';
import { Provider } from 'react-redux';
import makeStore from './src/store';
import NoInternetModalContents from './src/components/NoInternetModalContents';
import { useDispatch } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { getVersion, getBuildId } from 'react-native-device-info';
import { setApiHeaders } from './src/services/api';
import firebase from 'react-native-firebase';
import { updatePreference } from './src/store/actions/preferences';
import usePreferencesState from './src/utils/hooks/state-selectors/preferences/UsePreferencesState';
import { BottomSheetModalProvider, useBottomSheetModal } from '@gorhom/bottom-sheet';
import defaultBottomSheetConfigs from './src/common/configs/BottomSheetConfigs';
import getActiveRouteName from './src/utils/navigation/GetActiveRouteName';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(true);

export const URI_PREFIX = 'hexa://';

async function configureAPIHeaders() {
  const version = await getVersion();
  const buildNumber = await getBuildId();

  setApiHeaders({ appVersion: version, appBuildNumber: buildNumber });
};


export default function AppWrapper() {

  // Creates and holds an instance of the store so only children in the `Provider`'s
  // context can have access to it. (see: https://stackoverflow.com/a/60329482/8859365)
  const store = makeStore();

  useEffect(() => {
    configureAPIHeaders();
    firebase.analytics().setAnalyticsCollectionEnabled(true);
  }, []);

  return (
    <Provider store={store} uriPrefix={URI_PREFIX}>
      <BottomSheetModalProvider>
        <AppContent />
      </BottomSheetModalProvider>
    </Provider>
  );
}

function AppContent() {
  const dispatch = useDispatch();
  const { present: presentBottomSheet, dismiss: dismissBottomSheet } = useBottomSheetModal();

  const preferencesState = usePreferencesState();
  const [previousScreenName, setPreviousScreenName] = useState<string | null>();
  const [currentScreenName, setCurrentScreenName] = useState<string | null>();

  const canShowNoInternetWarning = useMemo(() => {
    return (
      currentScreenName != 'Login' &&
      currentScreenName != 'Launch' &&
      currentScreenName != 'ReLogin' &&
      preferencesState.hasShownNoInternetWarning === false
    );
  }, [previousScreenName, currentScreenName, preferencesState.hasShownNoInternetWarning]);

  async function resetInternetWarningFlag() {
    await dispatch(updatePreference({
      key: 'hasShownNoInternetWarning',
      value: false,
    }));
  }

  const showNoInternetWarning = useCallback(() => {
    presentBottomSheet(
      <NoInternetModalContents
        onPressTryAgain={() => {
          dismissBottomSheet();
        }}
        onPressIgnore={() => {
          resetInternetWarningFlag();
          dismissBottomSheet();
        }}
      />,
      defaultBottomSheetConfigs,
    );
  }, [presentBottomSheet, dismissBottomSheet]);

  function setupInternetWarningListener() {
    return NetInfo.addEventListener((state) => {
      if (
        state.isInternetReachable == null ||
        canShowNoInternetWarning == false
      ) {
        return;
      }

      if (state.isInternetReachable) {
        dismissBottomSheet();
      } else {
        showNoInternetWarning();
      }
    });
  }

  useEffect(() => {
    return () => {
      // reset when the app component unmounts
      resetInternetWarningFlag();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = setupInternetWarningListener();

    return () => {
      unsubscribe();
    };
  }, []);


  return (
    <Navigator
      onNavigationStateChange={async (prevState, currentState) => {
        setPreviousScreenName(getActiveRouteName(prevState));
        setCurrentScreenName(getActiveRouteName(currentState));

        if (previousScreenName !== currentScreenName) {
          firebase.analytics().setCurrentScreen(currentScreenName);
        }
      }}
    />
  );
}
