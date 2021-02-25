import axios from 'axios'
import { put, call, select } from 'redux-saga/effects'
import Tor from '../../common/data/models/Tor'
import { plainnetConnectionSucceeded, CONNECT_OVER_PLAINNET, torConfigurationSet, torConnectionFailed, torConnectionSucceeded, torPreferenceToggled, RESTORE_TOR_CONFIGURATION, SAVE_TOR_CONFIGURATION } from '../actions/torSettings'
import { createWatcher } from '../utils/utilities'


function* saveTorConfiguration( { payload }: { payload: Tor } ) {
  try {
    const res = yield call( axios.get, payload.urlPath + '/fee-estimates' )
    const feeEstimates = res.data
    if( feeEstimates && Object.keys( feeEstimates ).length ){
      yield put( torConfigurationSet( payload ) )
      yield put( torConnectionSucceeded( payload ) )
    } else {
      throw new Error( 'Failed to connect over Tor' )
    }
  } catch {
    yield put( torConnectionFailed( 'Nope' ) )
  }
}

export const saveTorConfigurationWatcher = createWatcher(
  saveTorConfiguration,
  SAVE_TOR_CONFIGURATION
)


function* connectOverPlainnet() {
  const activeTor: Tor = yield select( state => state.torSettings.activeTor )

  if( activeTor ){
    activeTor.isConnectionActive = false
    yield put( torConfigurationSet( activeTor ) )

  }

  yield put( plainnetConnectionSucceeded( ) )
}

export const connectOverPlainnetWatcher = createWatcher(
  connectOverPlainnet,
  CONNECT_OVER_PLAINNET
)



function* restoreTorConfiguration( { payload }: { payload: Tor } ) {
  yield put( torConfigurationSet( payload ) )
  if( payload.isConnectionActive ){
    yield put( torPreferenceToggled( true ) )
  }
}

export const restoreTorConfigurationWatcher = createWatcher(
  restoreTorConfiguration,
  RESTORE_TOR_CONFIGURATION
)
