import { Action } from 'redux'
import PersonalNode from '../../common/data/models/PersonalNode'

export const PERSONAL_NODE_PREFERENCE_TOGGLED = 'PERSONAL_NODE_PREFERENCE_TOGGLED'

export const SAVE_PERSONAL_NODE_CONFIGURATION = 'SAVE_PERSONAL_NODE_CONFIGURATION'
export const PERSONAL_NODE_CONFIGURATION_SET = 'PERSONAL_NODE_CONFIGURATION_SET'

export const CONNECT_TO_PERSONAL_NODE = 'CONNECT_TO_PERSONAL_NODE'
export const PERSONAL_NODE_CONNECTING_FAILED = 'PERSONAL_NODE_CONNECTING_FAILED'
export const PERSONAL_NODE_CONNECTING_SUCCEEDED = 'PERSONAL_NODE_CONNECTING_SUCCEEDED'
export const PERSONAL_NODE_CONNECTING_COMPLETED = 'PERSONAL_NODE_CONNECTING_COMPLETED'


export interface PersonalNodePreferenceToggledAction extends Action {
  type: typeof PERSONAL_NODE_PREFERENCE_TOGGLED;
  payload: boolean;
}

export const personalNodePreferenceToggled = ( prefersPersonalNodeConnection ): PersonalNodePreferenceToggledAction => {
  return {
    type: PERSONAL_NODE_PREFERENCE_TOGGLED,
    payload: prefersPersonalNodeConnection
  }
}


export interface PersonalNodeConfigurationSaveAction extends Action {
  type: typeof SAVE_PERSONAL_NODE_CONFIGURATION;
  payload: PersonalNode;
}

export const savePersonalNodeConfiguration = ( payload: PersonalNode ): PersonalNodeConfigurationSaveAction => {
  return {
    type: SAVE_PERSONAL_NODE_CONFIGURATION,
    payload,
  }
}


export interface PersonalNodeConfigurationSetAction extends Action {
  type: typeof PERSONAL_NODE_CONFIGURATION_SET;
  payload: PersonalNode;
}

export const personalNodeConfigurationSet = ( payload: PersonalNode ): PersonalNodeConfigurationSetAction => {
  return {
    type: PERSONAL_NODE_CONFIGURATION_SET,
    payload,
  }
}


export interface PersonalNodeConnectionAction extends Action {
  type: typeof CONNECT_TO_PERSONAL_NODE;
  payload: PersonalNode;
}

export const connectToPersonalNode = (
  payload: PersonalNode
): PersonalNodeConnectionAction => {
  return {
    type: CONNECT_TO_PERSONAL_NODE,
    payload,
  }
}


export interface PersonalNodeConnectionSuccessAction extends Action {
  type: typeof PERSONAL_NODE_CONNECTING_SUCCEEDED;
  payload: PersonalNode;
}

export const personalNodeConnectionSucceeded = (
  payload: PersonalNode
): PersonalNodeConnectionSuccessAction => {
  return {
    type: PERSONAL_NODE_CONNECTING_SUCCEEDED,
    payload,
  }
}


export interface PersonalNodeConnectionFailureAction extends Action {
  type: typeof PERSONAL_NODE_CONNECTING_FAILED;
  payload: string;
}

export const personalNodeConnectionFailed = (
  errorMessage: string
): PersonalNodeConnectionFailureAction => {
  return {
    type: PERSONAL_NODE_CONNECTING_FAILED,
    payload: errorMessage,
  }
}

export interface PersonalNodeConnectionCompletionAction extends Action {
  type: typeof PERSONAL_NODE_CONNECTING_COMPLETED;
}

export const personalNodeConnectionCompleted = (): PersonalNodeConnectionCompletionAction => {
  return {
    type: PERSONAL_NODE_CONNECTING_COMPLETED
  }
}
