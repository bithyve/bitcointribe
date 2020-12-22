import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, AsyncStorage, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import PersonalNodeConnectionForm, { PersonalNodeFormData } from './PersonalNodeConnectionForm'
import PersonalNodeDetailsSection from './PersonalNodeDetailsSection'
import PersonalNodeSettingsHeader from './PersonalNodeSettingsHeader'
import PersonalNode from '../../../common/data/models/PersonalNode'
import BottomInfoBox from '../../../components/BottomInfoBox'

export type Props = {
  navigation: any;
};

const NodeSettingsContainerScreen: React.FC<Props> = ( ) => {
  const [ personalNode, setPersonalNode ] = useState<PersonalNode>( {
  } )

  const [ isPersonalNodeConnectionEnabled, setIsPersonalNodeConnectionEnabled ] = useState( false )
  const [ isEditingPersonalNodeConnection, setIsEditingPersonalNodeConnection ] = useState( false )

  async function getPersonalNodeData() {
    const personalNodeData = await AsyncStorage.getItem( 'PersonalNode' )

    if ( personalNodeData ) {
      const personalNode: PersonalNode = JSON.parse( personalNodeData )

      setIsPersonalNodeConnectionEnabled( personalNode.isConnectionActive )
      setIsEditingPersonalNodeConnection( personalNode.activeNodeURL == null )
      setPersonalNode( personalNode )
    } else {
      setIsPersonalNodeConnectionEnabled( false )
      setIsEditingPersonalNodeConnection( true )
      setPersonalNode( {
        isConnectionActive: false,
        activeNodeIPAddress: null,
        activeNodePortNumber: null,
        activeNodeURL: null,
      } )
    }
  }

  async function handleSettingsSubmission( {
    ipAddress,
    portNumber,
  }: PersonalNodeFormData ) {
    // TODO: How would the UI dispatch some kind of action here that would be handled
    // on the back-end if we're using AsyncStorage for PersonalNode data?

    // For now, just mock out the completion process...
    const newPersonalNodeConfig: PersonalNode = {
      isConnectionActive: true,
      activeNodeIPAddress: ipAddress,
      activeNodePortNumber: portNumber,
      activeNodeURL: `${ipAddress}:${portNumber}`,
    }

    setIsEditingPersonalNodeConnection( false )
    setIsPersonalNodeConnectionEnabled( true )
    setPersonalNode( newPersonalNodeConfig )
  }


  useEffect( () => {
    getPersonalNodeData()
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
                setIsPersonalNodeConnectionEnabled( !isPersonalNodeConnectionEnabled )
              }}
            />

            {( isPersonalNodeConnectionEnabled && isEditingPersonalNodeConnection ) && (
              <PersonalNodeConnectionForm
                onSubmit={handleSettingsSubmission}
              />
            ) || ( isPersonalNodeConnectionEnabled ) && (
              <PersonalNodeDetailsSection
                personalNode={personalNode}
                onEditButtonPressed={() => setIsEditingPersonalNodeConnection( true ) }
              />
            )
            }
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.floatingNoteContainer}>
        <BottomInfoBox
          title={'Note'}
          infoText={
            'Test account will always use the default BitHyve test node, irrelevant of personal node'
          }
        />
      </View>
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
