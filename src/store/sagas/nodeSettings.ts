import axios from 'axios'
import { put, call, select } from 'redux-saga/effects'
import config from '../../bitcoin/HexaConfig'
import PersonalNode from '../../common/data/models/PersonalNode'
import { bitHyveNodeConnectionSucceeded, CONNECT_TO_BIT_HYVE_NODE, CONNECT_TO_NODE, personalNodeConfigurationSet, personalNodeConnectionFailed, personalNodeConnectionSucceeded, personalNodePreferenceToggled, RESTORE_PERSONAL_NODE_CONFIGURATION, SAVE_PERSONAL_NODE_CONFIGURATION, setDefaultNodes, setDefaultNodesSaved } from '../actions/nodeSettings'
import { createWatcher } from '../utils/utilities'
import { NetworkType } from '../../bitcoin/utilities/Interface'
import { predefinedMainnetNodes, predefinedTestnetNodes } from '../../bitcoin/electrum/predefinedNodes'
import { NodeStateOperations } from '../reducers/nodeSettings'
import ElectrumClient from '../../bitcoin/electrum/client'
import { fetchFeeRates } from '../actions/accounts'
import Toast from '../../components/Toast'


function* savePersonalNodeConfiguration( { payload }: { payload: PersonalNode } ) {
  try {
    const res = yield call( axios.get, payload.urlPath + '/fee-estimates' )
    const feeEstimates = res.data
    if( feeEstimates && Object.keys( feeEstimates ).length ){
      yield call( config.connectToPersonalNode, payload )
      yield put( personalNodeConfigurationSet( payload ) )
      yield put( personalNodeConnectionSucceeded( payload ) )
    } else {
      throw new Error( 'Failed to connect to personal node' )
    }
  } catch {
    yield put( personalNodeConnectionFailed( 'Nope' ) )
  }
}

export const savePersonalNodeConfigurationWatcher = createWatcher(
  savePersonalNodeConfiguration,
  SAVE_PERSONAL_NODE_CONFIGURATION
)


function* connectToBitHyveNode() {
  const activePersonalNode: PersonalNode = yield select( state => state.nodeSettings.activePersonalNode )

  if( activePersonalNode ){
    activePersonalNode.isConnectionActive = false
    yield put( personalNodeConfigurationSet( activePersonalNode ) )

  }

  yield put( bitHyveNodeConnectionSucceeded( ) )
  yield call( config.connectToBitHyveNode )
}

export const connectToBitHyveNodeWatcher = createWatcher(
  connectToBitHyveNode,
  CONNECT_TO_BIT_HYVE_NODE
)



function* restorePersonalNodeConfiguration( { payload }: { payload: PersonalNode } ) {
  yield put( personalNodeConfigurationSet( payload ) )
  if( payload.isConnectionActive ){
    yield call( config.connectToPersonalNode, payload )
    yield put( personalNodePreferenceToggled( true ) )
  }
}

export const restorePersonalNodeConfigurationWatcher = createWatcher(
  restorePersonalNodeConfiguration,
  RESTORE_PERSONAL_NODE_CONFIGURATION
)

function* connectToNodeWorker() {
  try {
    console.log( 'Connecting to node...' )

    const savedDefaultNodes: PersonalNode[] = yield select( state => state.nodeSettings.defaultNodes )

    const areDefaultNodesSaved = yield select(
      state => state.nodeSettings.defaultNodesSaved
    )

    if ( !areDefaultNodesSaved && !savedDefaultNodes?.length ) {
      const hardcodedDefaultNodes =
        config.NETWORK_TYPE === NetworkType.TESTNET
          ? predefinedTestnetNodes
          : predefinedMainnetNodes

      for( const node of hardcodedDefaultNodes ){
        yield put( setDefaultNodes( node, NodeStateOperations.ADD ) )
      }
      console.log( 'Saved default nodes...' )
      yield put( setDefaultNodesSaved( true ) )
    }


    const defaultNodes: PersonalNode[] = yield select( state => state.nodeSettings.defaultNodes )
    const personalNodes: PersonalNode[] = yield select( state => state.nodeSettings.personalNodes )

    ElectrumClient.setActivePeer( defaultNodes, personalNodes )
    const { connected, connectedTo, error } = yield call( ElectrumClient.connect )
    if ( connected ) {
      // yield put( electrumClientConnectionExecuted( {
      //   successful: connected, connectedTo
      // } ) )
      Toast( `Connected to: ${connectedTo}` )
      yield put( fetchFeeRates() )
    } else {
      // yield put( electrumClientConnectionExecuted( {
      //   successful: connected, error
      // } ) )
      Toast( `Failed to connect: ${error}` )
    }
  } catch ( err ) {
    console.log( {
      err
    } )
  }
}

export const connectToNodeWatcher = createWatcher( connectToNodeWorker, CONNECT_TO_NODE )
