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
import {  connectToBitHyveNode, personalNodeConnectionCompleted, personalNodePreferenceToggled, savePersonalNodeConfiguration } from '../../../store/actions/nodeSettings'
import { Keyboard } from 'react-native'

export type Props = {
  navigation: any;
};

const NodeSettingsContainerScreen: React.FC<Props> = ( ) => {
  const dispatch = useDispatch()
  const nodeSettingsState = useNodeSettingsState()
  const activePersonalNode = useActivePersonalNode()

  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()

  const isPersonalNodeConnectionEnabled = useMemo( () => {
    return nodeSettingsState.prefersPersonalNodeConnection
  }, [ nodeSettingsState.prefersPersonalNodeConnection ] )

  const [ isEditingPersonalNodeConnection, setIsEditingPersonalNodeConnection ] = useState( false )
  const [ isKeyboardVisible, setKeyboardVisible ] = useState( false )

  const showConnectionSucceededBottomSheet = useCallback( () => {
    presentBottomSheet(
      <PersonalNodeConnectionSuccessBottomSheet
        onViewNodeDetailsPressed={() => {
          dispatch( personalNodeConnectionCompleted() )
          dismissBottomSheet()
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '40%' ],
      },
    )
  },
  [ presentBottomSheet, dismissBottomSheet ],
  )

  const showConnectionFailedBottomSheet = useCallback( () => {
    presentBottomSheet(
      <PersonalNodeConnectionFailureBottomSheet
        onTryAgainPressed={() => {
          dispatch( personalNodeConnectionCompleted() )
          dismissBottomSheet()
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '40%' ],
      },
    )
  },
  [ presentBottomSheet, dismissBottomSheet ],
  )

  async function handleSettingsSubmission( {
    ipAddress,
    portNumber,
  }: PersonalNodeFormData ) {
    const newPersonalNodeConfig: PersonalNode = {
      isConnectionActive: true,
      ipAddress: ipAddress,
      portNumber: portNumber,
      urlPath: `${ipAddress}:${portNumber}`,
    }

    setIsEditingPersonalNodeConnection( false )
    dispatch( savePersonalNodeConfiguration( newPersonalNodeConfig ) )
  }

  useEffect( () => {
    if ( nodeSettingsState.hasConnectionSucceeded ) {
      showConnectionSucceededBottomSheet()
    } else if ( nodeSettingsState.hasConnectionFailed ) {
      showConnectionFailedBottomSheet()
    }
  }, [ nodeSettingsState.hasConnectionSucceeded, nodeSettingsState.hasConnectionFailed ] )


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
              onToggle={() => {
                dispatch( personalNodePreferenceToggled( !isPersonalNodeConnectionEnabled ) )
                if( nodeSettingsState.activePersonalNode ){
                  if( isPersonalNodeConnectionEnabled ) {
                    // switching back to BH(default)-node
                    dispatch( connectToBitHyveNode() )
                  } else {
                    // reconnecting to personal node
                    const reactivatePersonalNode: PersonalNode = nodeSettingsState.activePersonalNode
                    reactivatePersonalNode.isConnectionActive = true
                    dispatch( savePersonalNodeConfiguration( reactivatePersonalNode ) )
                  }
                }
              }}
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
            title={'Note'}
            infoText={
              'Test account will always use the default BitHyve test node, irrelevant of personal node'
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
