import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { NodeDetail } from '../../../bitcoin/electrum/interface'
import Node from '../../../bitcoin/electrum/node'
import Colors from '../../../common/Colors'
import PersonalNode from '../../../common/data/models/PersonalNode'
import HeaderTitle from '../../../components/HeaderTitle'
import Loader from '../../../components/loader'
import Toast from '../../../components/Toast'
import { setDefaultNodes, setPersonalNodes } from '../../../store/actions/nodeSettings'
import { NodeStateOperations } from '../../../store/reducers/nodeSettings'
import useNodeSettingsState from '../../../utils/hooks/state-selectors/nodeSettings/UseNodeSettingsState'
import PersonalNodeConnectionForm from './PersonalNodeConnectionForm'
import PersonalNodeDetailsSection from './PersonalNodeDetailsSection'

export type Props = {
  navigation: any;
};

const NodeSettingsContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const nodeSettingsState = useNodeSettingsState()
  const [ isAddNodeModalVisible, setAddNodeModalVisible ] = useState( false )
  const [ loading, setLoading ] = useState( false )
  const [ nodeList, setNodeList ] = useState( [] )
  const [ currentlySelectedNode, setCurrentlySelectedNodeItem ] = useState( null )

  useEffect( () => {
    setNodeList( [ ...nodeSettingsState.defaultNodes, ...nodeSettingsState.personalNodes ] )
  }, [ nodeSettingsState.defaultNodes, nodeSettingsState.personalNodes ] )

  const onSaveCallback = async ( nodeDetail: PersonalNode ) => {
    setLoading( true )
    setAddNodeModalVisible( false )
    const { saved, nodes, node } = await Node.save( nodeDetail, nodeList )
    if ( saved ) {
      setNodeList( nodes )
      if( node.isDefault ) dispatch( setDefaultNodes( node, NodeStateOperations.ADD ) )
      else dispatch( setPersonalNodes(  node, NodeStateOperations.ADD ) )
    } else {
      Toast( `Failed to save, unable to connect to: ${nodeDetail.host} ` )
    }
    setLoading( false )
  }

  const onDelete = async ( selectedItem: NodeDetail ) => {
    const isConnected = Node.nodeConnectionStatus( selectedItem )
    if ( isConnected ) await Node.disconnect( selectedItem )

    const nodes = Node.delete( selectedItem, nodeList )
    setNodeList( nodes )

    if( selectedItem.isDefault ) dispatch( setDefaultNodes(  selectedItem, NodeStateOperations.DELETE ) )
    else dispatch( setPersonalNodes( selectedItem, NodeStateOperations.DELETE ) )

    setCurrentlySelectedNodeItem( null )
  }

  const updateNode = ( selectedItem ) => {
    const updatedNodes = Node.update( selectedItem, nodeList )
    setNodeList( updatedNodes )
    if( selectedItem.isDefault ) dispatch( setDefaultNodes(  selectedItem, NodeStateOperations.UPDATE ) )
    else dispatch( setPersonalNodes( selectedItem, NodeStateOperations.UPDATE ) )
  }

  const onConnectNode = async ( selectedNode: NodeDetail ) => {
    let nodes = [ ...nodeList ]
    if (
      currentlySelectedNode &&
      selectedNode.id !== currentlySelectedNode.id &&
      currentlySelectedNode.isConnected
    ) {
      // disconnect currently selected node(if connected)
      await Node.disconnect( currentlySelectedNode )
      currentlySelectedNode.isConnected = false
      nodes = nodes.map( ( item ) => {
        if ( item.id === currentlySelectedNode.id ) return {
          ...currentlySelectedNode
        }
        return item
      } )

      if( currentlySelectedNode.isDefault ) dispatch( setDefaultNodes( currentlySelectedNode, NodeStateOperations.UPDATE ) )
      else dispatch( setPersonalNodes(  currentlySelectedNode, NodeStateOperations.UPDATE ) )

      setCurrentlySelectedNodeItem( null )
    }

    setLoading( true )
    setCurrentlySelectedNodeItem( selectedNode )
    const node = {
      ...selectedNode
    }

    const { connected, connectedTo, error } = await Node.connectToSelectedNode( node )
    if( connected ){
      node.isConnected = connected
      nodes = nodes.map( ( item ) => {
        if ( item.id === node.id ) return {
          ...node
        }
        return item
      } )

      if( node.isDefault ) dispatch( setDefaultNodes( node, NodeStateOperations.UPDATE ) )
      else dispatch( setPersonalNodes( node, NodeStateOperations.UPDATE ) )

      Toast( `Connected to: ${connectedTo}` )
    } else Toast( `Failed to connect: ${error}` )

    setNodeList( nodes )
    setLoading( false )
  }

  const disconnectNode = async ( selectedNode: NodeDetail ) => {
    await Node.disconnect( selectedNode )
    selectedNode.isConnected = false
    updateNode( selectedNode )
  }

  function onAddButtonPressed() {
    setCurrentlySelectedNodeItem( null )
    setAddNodeModalVisible( true )
  }

  const onSelectedNodeitem = ( selectedItem: PersonalNode ) => {
    setCurrentlySelectedNodeItem( selectedItem )
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <HeaderTitle
        navigation={navigation}
        backButton={true}
        firstLineTitle={'Node Settings'}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <KeyboardAvoidingView
        style={styles.rootContainer}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={{
          flex: 1
        }}>
          <View style={styles.rootContentContainer}>
            {isAddNodeModalVisible ? (
              <PersonalNodeConnectionForm
                onCloseClick={() => { setAddNodeModalVisible( false ) } }
                onSubmit={onSaveCallback}
                params={Node.getModalParams( currentlySelectedNode )}
              />
            ): (
              <PersonalNodeDetailsSection
                // personalNode={activePersonalNode}
                onAddButtonPressed={() => onAddButtonPressed() }
                nodeList={nodeList}
                onDelete={onDelete}
                onConnectNode={onConnectNode}
                onDisconnectNode={disconnectNode}
                onSelectedNodeitem={onSelectedNodeitem}
                selectedNodeItem={currentlySelectedNode}
              />
            )
            }
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading ? <Loader isLoading={true} /> : null}
      {/* {isKeyboardVisible == false && (
        <View style={styles.floatingNoteContainer}>
          <BottomInfoBox
            title={common.note}
            infoText={
              strings.nodeisaccessible
            }
          />
        </View>
      )} */}
    </SafeAreaView>
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
