import React, { useEffect, useState, useMemo, useCallback } from 'react'
import Navigator from './src/navigation/Navigator'
import { Provider } from 'react-redux'
import { Provider as MobxProvider } from 'mobx-react'
import Stores from './src/mobxstore'
import makeStore from './src/store'
import NoInternetModalContents from './src/components/NoInternetModalContents'
import { useDispatch } from 'react-redux'
import NetInfo from '@react-native-community/netinfo'
import { getVersion, getBuildId, getBuildNumber } from 'react-native-device-info'
import { setApiHeaders } from './src/services/api'
import firebase from '@react-native-firebase/app'
import analytics from '@react-native-firebase/analytics'
// import crashlytics from '@react-native-firebase/crashlytics'
import { updatePreference } from './src/store/actions/preferences'
import usePreferencesState from './src/utils/hooks/state-selectors/preferences/UsePreferencesState'
import { BottomSheetModalProvider, useBottomSheetModal } from '@gorhom/bottom-sheet'
import defaultBottomSheetConfigs from './src/common/configs/BottomSheetConfigs'
import getActiveRouteName from './src/utils/navigation/GetActiveRouteName'
import { LogBox } from 'react-native'
import ModalContainer from './src/components/home/ModalContainer'
import { RootSiblingParent } from 'react-native-root-siblings'

import { LocalizationProvider } from './src/common/content/LocContext'
LogBox.ignoreAllLogs( true )

export const URI_PREFIX = 'hexa://'

async function configureAPIHeaders() {
  const version = await getVersion()
  const buildNumber = getBuildNumber()

  setApiHeaders( {
    appVersion: version, appBuildNumber: buildNumber
  } )
}

export default function AppWrapper() {

  // Creates and holds an instance of the store so only children in the `Provider`'s
  // context can have access to it. (see: https://stackoverflow.com/a/60329482/8859365)
  const store = makeStore()

  function updare() {

  }

  /*useEffect( () => {
    ( async () => {
      configureAPIHeaders()
      await firebase.analytics().setAnalyticsCollectionEnabled( true )
      await crashlytics().setCrashlyticsCollectionEnabled( true )
    } )()
  }, [] )*/

  return (

    <MobxProvider
      SettingsStore={Stores.settingsStore}
      BalanceStore={Stores.walletStore}
      TransactionsStore={Stores.transactionsStore}
      ChannelsStore={Stores.channelsStore}
      NodeInfoStore={Stores.nodeInfoStore}
      InvoicesStore={Stores.invoicesStore}
      FiatStore={Stores.fiatStore}
      UnitsStore={Stores.unitsStore}
      PaymentsStore={Stores.paymentsStore}
      FeeStore={Stores.feeStore}
      UTXOsStore={Stores.utxosStore}
      ActivityStore={Stores.activityStore}
    >
      <RootSiblingParent>
        <Provider store={store} uriPrefix={URI_PREFIX}>
          <BottomSheetModalProvider>
            <LocalizationProvider>
              <AppContent />
            </LocalizationProvider>
          </BottomSheetModalProvider>
        </Provider>
      </RootSiblingParent>

    </MobxProvider>
  )
}


function AppContent() {
  const dispatch = useDispatch()
  const { present: presentBottomSheet, dismiss: dismissBottomSheet } = useBottomSheetModal()
  const [ noInternetModal, showNoInternetModal ] = useState( false )
  const preferencesState = usePreferencesState()
  const [ previousScreenName, setPreviousScreenName ] = useState<string | null>()
  const [ currentScreenName, setCurrentScreenName ] = useState<string | null>()
  const forceUpdate = useState()[ 1 ].bind( null, {
  } )

  function update() {
    forceUpdate()
  }
  const canShowNoInternetWarning = useMemo( () => {
    return (
      currentScreenName != 'Login' &&
      currentScreenName != 'Launch' &&
      currentScreenName != 'ReLogin' &&
      preferencesState.hasShownNoInternetWarning === false
    )
  }, [ previousScreenName, currentScreenName, preferencesState.hasShownNoInternetWarning ] )

  async function resetInternetWarningFlag() {
    await dispatch( updatePreference( {
      key: 'hasShownNoInternetWarning',
      value: false,
    } ) )
  }

  // const showNoInternetWarning = useCallback( () => {
  //   presentBottomSheet(
  //     <NoInternetModalContents
  //       onPressTryAgain={() => {
  //         dismissBottomSheet()
  //       }}
  //       onPressIgnore={() => {
  //         resetInternetWarningFlag()
  //         dismissBottomSheet()
  //       }}
  //     />,
  //     defaultBottomSheetConfigs,
  //   )
  // }, [ presentBottomSheet, dismissBottomSheet ] )

  function setupInternetWarningListener() {
    return NetInfo.addEventListener( ( state ) => {
      if (
        state.isInternetReachable == null ||
        canShowNoInternetWarning == false
      ) {
        return
      }

      if ( state.isInternetReachable ) {
        showNoInternetModal( false )
      } else {
        showNoInternetModal( true )
      }
    } )
  }

  useEffect( () => {
    return () => {
      // reset when the app component unmounts
      resetInternetWarningFlag()
    }
  }, [] )

  useEffect( () => {
    const unsubscribe = setupInternetWarningListener()

    return () => {
      unsubscribe()
    }
  }, [] )

  return (
    <>
      <Navigator
        onNavigationStateChange={async ( prevState, currentState ) => {
          setPreviousScreenName( getActiveRouteName( prevState ) )
          setCurrentScreenName( getActiveRouteName( currentState ) )

          if ( previousScreenName !== currentScreenName ) {
            analytics().logEvent( currentScreenName )
          }
        }}
      />
      <ModalContainer visible={noInternetModal} closeBottomSheet={() => {showNoInternetModal( false )}} >
        <NoInternetModalContents
          onPressTryAgain={() => {
            showNoInternetModal( false )
          }}
          onPressIgnore={() => {
            resetInternetWarningFlag()
            showNoInternetModal( false )
          }}
        />
      </ModalContainer>
    </>
  )
}

