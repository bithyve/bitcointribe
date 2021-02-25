import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useDispatch } from 'react-redux'
import TorConnectionForm, { TorFormData } from './TorConnectionForm'
import TorDetailsSection from './TorDetailsSection'
import TorSettingsHeader from './TorSettingsHeader'
import Tor from '../../../common/data/models/Tor'
import BottomInfoBox from '../../../components/BottomInfoBox'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import TorConnectionSuccessBottomSheet from '../../../components/bottom-sheets/settings/TorConnectionSuccessBottomSheet'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import TorConnectionFailureBottomSheet from '../../../components/bottom-sheets/settings/TorConnectionFailureBottomSheet'
import useTorSettingsState from '../../../utils/hooks/state-selectors/torSettings/UseTorSettingsState'
import useActiveTor from '../../../utils/hooks/state-selectors/torSettings/UseActiveTor'
import {  plainnetConnectionCompleted, connectOverPlainnet, torConnectionCompleted, torPreferenceToggled, saveTorConfiguration } from '../../../store/actions/torSettings'
import { Keyboard } from 'react-native'
import PlainnetConnectionSuccessBottomSheet from '../../../components/bottom-sheets/settings/PlainnetConnectionSuccessBottomSheet'

export type Props = {
  navigation: any;
};

const TorSettingsContainerScreen: React.FC<Props> = ( ) => {
  const dispatch = useDispatch()
  const torSettingsState = useTorSettingsState()
  const activeTor = useActiveTor()

  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()

  const isTorConnectionEnabled = useMemo( () => {
    return torSettingsState.prefersTorConnection
  }, [ torSettingsState.prefersTorConnection ] )

  useEffect( ()=>{
    // resets tor preference if there's no active tor
    if( torSettingsState.prefersTorConnection && !activeTor )
      dispatch( personalTorToggled( false ) )
  }, [] )

  const [ isEditingTorConnection, setIsEditingTorConnection ] = useState( false )
  const [ isKeyboardVisible, setKeyboardVisible ] = useState( false )

  const showConnectionSucceededBottomSheet = useCallback( () => {
    dispatch( personalTorConnectionCompleted() )

    presentBottomSheet(
      <TorConnectionSuccessBottomSheet
        onConfirmPressed={() => {
          dismissBottomSheet()
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        dismissOnOverlayPress: false,
        snapPoints: [ 0, '40%' ],
      },
    )
  },
  [ presentBottomSheet, dismissBottomSheet ],
  )


  const showPlainnetConnectionSuccessBottomSheet = useCallback( () => {
    dispatch( plainnetConnectionCompleted() )

    presentBottomSheet(
      <PlainnetConnectionSuccessBottomSheet
        onConfirmPressed={() => {
          dismissBottomSheet()
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        dismissOnOverlayPress: false,
        snapPoints: [ 0, '40%' ],
      },
    )
  },
  [ presentBottomSheet, dismissBottomSheet ],
  )

  const showConnectionFailedBottomSheet = useCallback( () => {
    dispatch( torConnectionCompleted() )

    presentBottomSheet(
      <TorConnectionFailureBottomSheet
        onTryAgainPressed={() => {
          dismissBottomSheet()
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        dismissOnOverlayPress: false,
        snapPoints: [ 0, '40%' ],
      },
    )
  },
  [ presentBottomSheet, dismissBottomSheet ],
  )

  async function handleSettingsSubmission( {
    useFallback
  }: TorFormData ) {
    const newTorConfig: Tor = {
      isConnectionActive: true,
      useFallback
    }

    setIsEditingTorConnection( false )
    dispatch( saveTorConfiguration( newTorConfig ) )
  }

  function handleConnectionToggle() {
    const prefersTorConnection = !isTorConnectionEnabled

    if ( prefersTorConnection == false && activeTor ) {
      // switching back to plainnet
      dispatch( connectOverPlainnet() )
    } else {
      if ( activeTor ) {
        // reconnecting over Tor
        activeTor.isConnectionActive = true
        dispatch( saveTorConfiguration( activeTor ) )
      }
    }

    dispatch( torPreferenceToggled( prefersTorConnection ) )
  }


  useEffect( () => {
    if ( torSettingsState.hasTorConnectionSucceeded ) {
      showConnectionSucceededBottomSheet()
    } else if ( torSettingsState.hasPlainnetConnectionSucceeded ) {
      showPlainnetConnectionSuccessBottomSheet()
    } else if ( torSettingsState.hasTorConnectionFailed ) {
      showConnectionFailedBottomSheet()
    }
  }, [
    torSettingsState.hasTorConnectionSucceeded,
    torSettingsState.hasPlainnetConnectionSucceeded,
    torSettingsState.hasTorConnectionFailed,
  ] )


  useEffect( () => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible( true )
      }
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible( false )
      }
    )

    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [] )

  return (
    <View style={styles.rootContainer}>
      <KeyboardAvoidingView
        style={styles.rootContainer}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={{
          flex: 1
        }}>
          <View style={styles.rootContentContainer}>

            <TorSettingsHeader
              containerStyle={{
                paddingHorizontal: 14
              }}
              isConnectionEnabled={isTorConnectionEnabled}
              onToggle={handleConnectionToggle}
            />

            {( isTorConnectionEnabled && isEditingTorConnection ) && (
              <TorConnectionForm
                onSubmit={handleSettingsSubmission}
              />
            ) || ( isTorConnectionEnabled ) && (
              <TorDetailsSection
                tor={activeTor}
                onEditButtonPressed={() => setIsEditingTorConnection( true ) }
              />
            )
            }
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isKeyboardVisible == false && (
        <View style={styles.floatingNoteContainer}>
          <BottomInfoBox
            title={'Note'}
            infoText={
              'Tor functionality is currently experimental'
            }
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    height: '100%',
  },

  rootContentContainer: {

  },

  floatingNoteContainer: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 24,
  }
} )

export default TorSettingsContainerScreen
