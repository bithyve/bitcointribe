import axios from 'axios'
import { put, call, select } from 'redux-saga/effects'
import config from '../../bitcoin/HexaConfig'
import PersonalNode from '../../common/data/models/PersonalNode'
import { CONNECT_TO_BITHYVE_NODE, personalNodeConfigurationSet, personalNodeConnectionFailed, personalNodeConnectionSucceeded, SAVE_PERSONAL_NODE_CONFIGURATION } from '../actions/nodeSettings'
import { createWatcher } from '../utils/utilities'


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
  yield call( config.connectToBitHyveNode )
}

export const connectToBitHyveNodeWatcher = createWatcher(
  connectToBitHyveNode,
  CONNECT_TO_BITHYVE_NODE
)
