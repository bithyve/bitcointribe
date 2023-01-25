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
import {  bitHyveNodeConnectionCompleted, connectToBitHyveNode, personalNodeConnectionCompleted, personalNodePreferenceToggled, savePersonalNodeConfiguration, setAllNodes, setIsConnectionActive } from '../../../store/actions/nodeSettings'
import { Keyboard } from 'react-native'
import BitHyveNodeConnectionSuccessBottomSheet from '../../../components/bottom-sheets/settings/BitHyveNodeConnectionSuccessBottomSheet'
import { translations } from '../../../common/content/LocContext'
import Node from './node'
import Toast from '../../../components/Toast'
import Loader from '../../../components/loader'

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
  
  // const { connectToMyNodeEnabled, nodeDetails } = useAppSelector((state) => state.settings);
  const [nodeList, setNodeList] = useState(nodeSettingsState.personalNodes || []);
  const [ConnectToNode, setConnectToNode] = useState(nodeSettingsState.isConnectionActive);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedNodeItem, setSelectedNodeItem] = useState(null);

  // const isPersonalNodeConnectionEnabled = useMemo( () => {
  //   return nodeSettingsState.prefersPersonalNodeConnection
  // }, [ nodeSettingsState.prefersPersonalNodeConnection ] )

  // useEffect( ()=>{
  //   // resets personal node preference if there's no active personal node
  //   if( nodeSettingsState.prefersPersonalNodeConnection && !activePersonalNode )
  //     dispatch( personalNodePreferenceToggled( false ) )
  // }, [] )

  // useEffect( () => {
  //   return () => {
  //     dismissBottomSheet()
  //   }
  // }, [ navigation ] )

  // const [ isAddClick, setIsAddClick ] = useState( false )
  // const [ isKeyboardVisible, setKeyboardVisible ] = useState( false )

  // const showConnectionSucceededBottomSheet = useCallback( () => {
  //   dispatch( personalNodeConnectionCompleted() )

  //   presentBottomSheet(
  //     <PersonalNodeConnectionSuccessBottomSheet
  //       onConfirmPressed={() => {
  //         dismissBottomSheet()
  //       }}
  //     />,
  //     {
  //       ...defaultBottomSheetConfigs,
  //       dismissOnOverlayPress: false,
  //       snapPoints: [ 0, '40%' ],
  //     },
  //   )
  // },
  // [ presentBottomSheet, dismissBottomSheet ],
  // )


  // const showBitHyveConnectionSuccessBottomSheet = useCallback( () => {
  //   dispatch( bitHyveNodeConnectionCompleted() )

  //   presentBottomSheet(
  //     <BitHyveNodeConnectionSuccessBottomSheet
  //       onConfirmPressed={() => {
  //         dismissBottomSheet()
  //       }}
  //     />,
  //     {
  //       ...defaultBottomSheetConfigs,
  //       dismissOnOverlayPress: false,
  //       snapPoints: [ 0, '40%' ],
  //     },
  //   )
  // },
  // [ presentBottomSheet, dismissBottomSheet ],
  // )

  // const showConnectionFailedBottomSheet = useCallback( () => {
  //   dispatch( personalNodeConnectionCompleted() )

  //   presentBottomSheet(
  //     <PersonalNodeConnectionFailureBottomSheet
  //       onTryAgainPressed={() => {
  //         dismissBottomSheet()
  //       }}
  //     />,
  //     {
  //       ...defaultBottomSheetConfigs,
  //       dismissOnOverlayPress: false,
  //       snapPoints: [ 0, '40%' ],
  //     },
  //   )
  // },
  // [ presentBottomSheet, dismissBottomSheet ],
  // )

  const handleSettingsSubmission = async ( nodeDetail: PersonalNode ) => {
    setLoading(true);
    await onCloseClick();
    const { nodes, node } = await Node.save(nodeDetail, nodeList);
    if (nodes === null || node === null) {
      console.log('node not saved');
      setLoading(false);
      return;
    }

    setNodeList(nodes);
    dispatch(setAllNodes(nodes));
    setSelectedNodeItem(node);
    setLoading(false);
  }

  const handleConnectionToggle = async (value: boolean) => {
    setConnectToNode(value);
    dispatch(setIsConnectionActive(value));
    if (value) {
      setSelectedNodeItem(Node.getModalParams(null));
      setVisible(true)
    } else {
      setLoading(true);
      updateNode(null);
      await Node.connectToDefaultNode();
      setLoading(false);
    }
  }


  // useEffect( () => {
  //   if ( nodeSettingsState.hasPersonalNodeConnectionSucceeded ) {
  //     showConnectionSucceededBottomSheet()
  //   } else if ( nodeSettingsState.hasBitHyveNodeConnectionSucceeded ) {
  //     showBitHyveConnectionSuccessBottomSheet()
  //   } else if ( nodeSettingsState.hasPersonalNodeConnectionFailed ) {
  //     showConnectionFailedBottomSheet()
  //   }
  // }, [
  //   nodeSettingsState.hasPersonalNodeConnectionSucceeded,
  //   nodeSettingsState.hasBitHyveNodeConnectionSucceeded,
  //   nodeSettingsState.hasPersonalNodeConnectionFailed,
  // ] )


  // useEffect( () => {
  //   const keyboardDidShowListener = Keyboard.addListener(
  //     'keyboardDidShow',
  //     () => {
  //       setKeyboardVisible( true )
  //     }
  //   )
  //   const keyboardDidHideListener = Keyboard.addListener(
  //     'keyboardDidHide',
  //     () => {
  //       setKeyboardVisible( false )
  //     }
  //   )

  //   return () => {
  //     keyboardDidHideListener.remove()
  //     keyboardDidShowListener.remove()
  //   }
  // }, [] )

  const onCloseClick = async()=> {
    if (nodeList.length == 0 || nodeList.filter((item) => item.isConnected == true).length == 0) {
      await onChangeConnectToMyNode(false);
    }
    setVisible(false);
  }

  async function onChangeConnectToMyNode(value) {
    setConnectToNode(value);
    dispatch(setIsConnectionActive(value));
    if (value) {
      setSelectedNodeItem(Node.getModalParams(null));
      setVisible( true )
    } else {
      setLoading(true);
      updateNode(null);
      await Node.connectToDefaultNode();
      setLoading(false);
    }
  }

  const updateNode = (selectedItem) => {
    const nodes = [...nodeList];
    const updatedNodes = nodes.map((item) => {
      const node = { ...item };
      node.isConnected = item.id === selectedItem?.id ? selectedItem.isConnected : false;
      return node;
    });

    setNodeList(updatedNodes);
    dispatch(setAllNodes(updatedNodes));
  };

  function onAddButtonPressed() {
    setSelectedNodeItem(null);
    setVisible( true )
  }

  const onSelectedNodeitem = (selectedItem: PersonalNode) => {
    setSelectedNodeItem(selectedItem);
  };

  const onEdit = async (selectedItem: PersonalNode) => {
    setSelectedNodeItem(selectedItem);
    setVisible(true)
  };

  const onDelete = async (selectedItem: PersonalNode) => {
    const filteredNodes = nodeList?.filter((item) => item.id !== selectedItem.id);
    setNodeList(filteredNodes);
    dispatch(setAllNodes(filteredNodes));
    setSelectedNodeItem(null);

    if (filteredNodes?.length === 0 || selectedItem.isConnected) {
      console.log('defaut node')
      setConnectToNode(false);
      dispatch(setIsConnectionActive(false));
      setLoading(true);
      await Node.connectToDefaultNode();
      setLoading(false);
    }
  };

  const onConnectNode = async (selectedItem) => {
    setLoading(true);
    setSelectedNodeItem(selectedItem);
    let node = { ...selectedItem };

    if (!selectedItem.isConnected) {
      node = await Node.connect(selectedItem, nodeList);
    }
    else {
      await disconnectNode(node);
      setLoading(false);
      return;
    }

    setConnectToNode(node?.isConnected);
    dispatch(setIsConnectionActive(node?.isConnected));
    updateNode(node);

    if (node.isConnected) {
      Toast( 'Node connected successfully' )
      // showToast(`${settings.nodeConnectionSuccess}`, <TickIcon />);
    }
    else {
      Toast( 'Node connection failed' )
      // showToast(`${settings.nodeConnectionFailure}`, <ToastErrorIcon />, 1000, true);
    }

    setLoading(false);
  };

  const disconnectNode = async (node) => {
    node.isConnected = false;
    await Node.connectToDefaultNode();
    setConnectToNode(node?.isConnected);
    dispatch(setIsConnectionActive(node?.isConnected));
    updateNode(node);
  }

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
              isConnectionEnabled={ConnectToNode}
              onToggle={handleConnectionToggle}
            />

            {visible ? (
              <PersonalNodeConnectionForm
                onCloseClick={() => onCloseClick() }
                onSubmit={handleSettingsSubmission}
                params={Node.getModalParams(selectedNodeItem)}
              />
            ): (
              <PersonalNodeDetailsSection
                // personalNode={activePersonalNode}
                onAddButtonPressed={() => onAddButtonPressed() }
                nodeList={nodeList}
                ConnectToNode
                onEdit={onEdit}
                onDelete={onDelete}
                onConnectNode={onConnectNode}
                onSelectedNodeitem={onSelectedNodeitem}
                selectedNodeItem={selectedNodeItem}
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
