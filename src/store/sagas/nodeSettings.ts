import { put } from 'redux-saga/effects'
import PersonalNode from '../../common/data/models/PersonalNode'
import { personalNodeConfigurationSet, personalNodeConnectionFailed, personalNodeConnectionSucceeded, SAVE_PERSONAL_NODE_CONFIGURATION } from '../actions/nodeSettings'
import { createWatcher } from '../utils/utilities'


function* savePersonalNodeConfiguration( { payload }: { payload: PersonalNode } ) {
  try {
    // TODO: Implement backend logic here for processing the save

    yield put(
      personalNodeConfigurationSet( payload )
    )

    if ( Math.random() >= 0.5 ) {
      yield put( personalNodeConnectionSucceeded( payload ) )
    } else {
      throw new Error()
    }
  } catch {
    yield put( personalNodeConnectionFailed( 'Nope' ) )
  }
}

export const savePersonalNodeConfigurationWatcher = createWatcher(
  savePersonalNodeConfiguration,
  SAVE_PERSONAL_NODE_CONFIGURATION
)
