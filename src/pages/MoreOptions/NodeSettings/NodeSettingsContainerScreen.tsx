import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useDispatch } from 'react-redux'
import PersonalNodeConnectionForm, { PersonalNodeFormData } from './PersonalNodeConnectionForm'
import PersonalNodeDetailsSection from './PersonalNodeDetailsSection'
import PersonalNodeSettingsHeader from './PersonalNodeSettingsHeader'
import PersonalNode from '../../../common/data/models/PersonalNode'
import BottomInfoBox from '../../../components/BottomInfoBox'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import PersonalNodeConnectionSuccessBottomSheet from '../../../components/bottom-sheets/settings/PersonalNodeConnectionSuccessBottomSheet'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import PersonalNodeConnectionFailureBottomSheet from '../../../components/bottom-sheets/settings/PersonalNodeConnectionFailureBottomSheet'
import useNodeSettingsState from '../../../utils/hooks/state-selectors/nodeSettings/UseNodeSettingsState'
import useActivePersonalNode from '../../../utils/hooks/state-selectors/nodeSettings/UseActivePersonalNode'
import {  bitHyveNodeConnectionCompleted, connectToBitHyveNode, personalNodeConnectionCompleted, personalNodePreferenceToggled, savePersonalNodeConfiguration } from '../../../store/actions/nodeSettings'
import { Keyboard } from 'react-native'
import BitHyveNodeConnectionSuccessBottomSheet from '../../../components/bottom-sheets/settings/BitHyveNodeConnectionSuccessBottomSheet'
import { translations } from '../../../common/content/LocContext'

export type Props = {
  navigation: any;
};

const NodeSettingsContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const nodeSettingsState = useNodeSettingsState()
  const activePersonalNode = useActivePersonalNode()
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]
  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()

  const isPersonalNodeConnectionEnabled = useMemo( () => {
    return nodeSettingsState.prefersPersonalNodeConnection
  }, [ nodeSettingsState.prefersPersonalNodeConnection ] )

  useEffect( ()=>{
    // resets personal node preference if there's no active personal node
    if( nodeSettingsState.prefersPersonalNodeConnection && !activePersonalNode )
      dispatch( personalNodePreferenceToggled( false ) )
  }, [] )

  useEffect( () => {
    return () => {
      dismissBottomSheet()
    }
  }, [ navigation ] )

  const [ isEditingPersonalNodeConnection, setIsEditingPersonalNodeConnection ] = useState( false )
  const [ isKeyboardVisible, setKeyboardVisible ] = useState( false )

  const showConnectionSucceededBottomSheet = useCallback( () => {
    dispatch( personalNodeConnectionCompleted() )

    presentBottomSheet(
      <PersonalNodeConnectionSuccessBottomSheet
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


  const showBitHyveConnectionSuccessBottomSheet = useCallback( () => {
    dispatch( bitHyveNodeConnectionCompleted() )

    presentBottomSheet(
      <BitHyveNodeConnectionSuccessBottomSheet
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
    dispatch( personalNodeConnectionCompleted() )

    presentBottomSheet(
      <PersonalNodeConnectionFailureBottomSheet
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
    ipAddress,
    portNumber,
    useFallback
  }: PersonalNodeFormData ) {
    const newPersonalNodeConfig: PersonalNode = {
      isConnectionActive: true,
      ipAddress: ipAddress,
      portNumber: portNumber,
      urlPath: `${ipAddress}:${portNumber}`,
      useFallback
    }

    setIsEditingPersonalNodeConnection( false )
    dispatch( savePersonalNodeConfiguration( newPersonalNodeConfig ) )
  }

  function handleConnectionToggle() {
    const prefersPersonalNodeConnection = !isPersonalNodeConnectionEnabled

    if ( prefersPersonalNodeConnection == false && activePersonalNode ) {
      // switching back to BH(default)-node
      dispatch( connectToBitHyveNode() )
    } else {
      if ( activePersonalNode ) {
        // reconnecting to personal node
        activePersonalNode.isConnectionActive = true
        dispatch( savePersonalNodeConfiguration( activePersonalNode ) )
      }
    }

    dispatch( personalNodePreferenceToggled( prefersPersonalNodeConnection ) )
  }


  useEffect( () => {
    if ( nodeSettingsState.hasPersonalNodeConnectionSucceeded ) {
      showConnectionSucceededBottomSheet()
    } else if ( nodeSettingsState.hasBitHyveNodeConnectionSucceeded ) {
      showBitHyveConnectionSuccessBottomSheet()
    } else if ( nodeSettingsState.hasPersonalNodeConnectionFailed ) {
      showConnectionFailedBottomSheet()
    }
  }, [
    nodeSettingsState.hasPersonalNodeConnectionSucceeded,
    nodeSettingsState.hasBitHyveNodeConnectionSucceeded,
    nodeSettingsState.hasPersonalNodeConnectionFailed,
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

            <PersonalNodeSettingsHeader
              containerStyle={{
                paddingHorizontal: 14
              }}
              isConnectionEnabled={isPersonalNodeConnectionEnabled}
              onToggle={handleConnectionToggle}
            />

            {( isPersonalNodeConnectionEnabled && isEditingPersonalNodeConnection ) && (
              <PersonalNodeConnectionForm
                onSubmit={handleSettingsSubmission}
              />
            ) || ( isPersonalNodeConnectionEnabled ) && (
              <PersonalNodeDetailsSection
                personalNode={activePersonalNode}
                onEditButtonPressed={() => setIsEditingPersonalNodeConnection( true ) }
              />
            )
            }
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isKeyboardVisible == false && (
        <View style={styles.floatingNoteContainer}>
          <BottomInfoBox
            title={common.note}
            infoText={
              strings.nodeisaccessible
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

export default NodeSettingsContainerScreen
