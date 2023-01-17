import { Action } from 'redux'
import PersonalNode from '../../common/data/models/PersonalNode'

export const PERSONAL_NODE_PREFERENCE_TOGGLED = 'PERSONAL_NODE_PREFERENCE_TOGGLED'

export const SAVE_PERSONAL_NODE_CONFIGURATION = 'SAVE_PERSONAL_NODE_CONFIGURATION'
export const PERSONAL_NODE_CONFIGURATION_SET = 'PERSONAL_NODE_CONFIGURATION_SET'
export const RESTORE_PERSONAL_NODE_CONFIGURATION = 'RESTORE_PERSONAL_NODE_CONFIGURATION'

export const SET_ALL_NODES = 'SET_ALL_NODES'
export const IS_CONNECTION_ACTIVE = 'IS_CONNECTION_ACTIVE'
export const CONNECT_TO_PERSONAL_NODE = 'CONNECT_TO_PERSONAL_NODE'
export const PERSONAL_NODE_CONNECTING_FAILED = 'PERSONAL_NODE_CONNECTING_FAILED'
export const PERSONAL_NODE_CONNECTING_SUCCEEDED = 'PERSONAL_NODE_CONNECTING_SUCCEEDED'
export const PERSONAL_NODE_CONNECTING_COMPLETED = 'PERSONAL_NODE_CONNECTING_COMPLETED'

export const CONNECT_TO_BIT_HYVE_NODE = 'CONNECT_TO_BIT_HYVE_NODE'
export const BIT_HYVE_NODE_CONNECTING_FAILED = 'BIT_HYVE_NODE_CONNECTING_FAILED'
export const BIT_HYVE_NODE_CONNECTING_SUCCEEDED = 'BIT_HYVE_NODE_CONNECTING_SUCCEEDED'
export const BIT_HYVE_NODE_CONNECTING_COMPLETED = 'BIT_HYVE_NODE_CONNECTING_COMPLETED'


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

export const restorePersonalNodeConfiguration = ( payload: PersonalNode ) => {
  return {
    type: RESTORE_PERSONAL_NODE_CONFIGURATION,
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

export interface SetConnectionActive extends Action {
  type: typeof IS_CONNECTION_ACTIVE;
  payload: boolean;
}

export const setIsConnectionActive = (
  payload: boolean
): SetConnectionActive => {
  return {
    type: IS_CONNECTION_ACTIVE,
    payload,
  }
}

export interface SetAllNodesAction extends Action {
  type: typeof SET_ALL_NODES;
  payload: PersonalNode[];
}

export const setAllNodes = (
  payload: PersonalNode[]
): SetAllNodesAction => {
  return {
    type: SET_ALL_NODES,
    payload
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


export interface BitHyveNodeConnectionAction extends Action {
  type: typeof CONNECT_TO_BIT_HYVE_NODE;
}

export const connectToBitHyveNode = (
): BitHyveNodeConnectionAction => {
  return {
    type: CONNECT_TO_BIT_HYVE_NODE,
  }
}


export interface BitHyveNodeConnectionSuccessAction extends Action {
  type: typeof BIT_HYVE_NODE_CONNECTING_SUCCEEDED;
}

export const bitHyveNodeConnectionSucceeded = (
): BitHyveNodeConnectionSuccessAction => {
  return {
    type: BIT_HYVE_NODE_CONNECTING_SUCCEEDED,
  }
}


export interface BitHyveNodeConnectionFailureAction extends Action {
  type: typeof BIT_HYVE_NODE_CONNECTING_FAILED;
  payload: string;
}

export const bitHyveNodeConnectionFailed = (
  errorMessage: string
): BitHyveNodeConnectionFailureAction => {
  return {
    type: BIT_HYVE_NODE_CONNECTING_FAILED,
    payload: errorMessage,
  }
}

export interface BitHyveNodeConnectionCompletionAction extends Action {
  type: typeof BIT_HYVE_NODE_CONNECTING_COMPLETED;
}

export const bitHyveNodeConnectionCompleted = (): BitHyveNodeConnectionCompletionAction => {
  return {
    type: BIT_HYVE_NODE_CONNECTING_COMPLETED
  }
}
