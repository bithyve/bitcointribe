import { Action } from 'redux'
import PersonalNode from '../../common/data/models/PersonalNode'
import { NodeStateOperations } from '../reducers/nodeSettings'

export const PERSONAL_NODE_PREFERENCE_TOGGLED = 'PERSONAL_NODE_PREFERENCE_TOGGLED'

export const SAVE_PERSONAL_NODE_CONFIGURATION = 'SAVE_PERSONAL_NODE_CONFIGURATION'
export const PERSONAL_NODE_CONFIGURATION_SET = 'PERSONAL_NODE_CONFIGURATION_SET'
export const RESTORE_PERSONAL_NODE_CONFIGURATION = 'RESTORE_PERSONAL_NODE_CONFIGURATION'

export const SET_PERSONAL_NODES = 'SET_PERSONAL_NODES'
export const SET_DEFAULT_NODES = 'SET_DEFAULT_NODES'
export const SET_DEFAULT_NODES_SAVED = 'SET_DEFAULT_NODES_SAVED'
export const CONNECT_TO_NODE = 'CONNECT_TO_NODE'
export const SET_ELECTRUM_CLIENT_NOT_CONNECTED_ERR = 'SET_ELECTRUM_CLIENT_NOT_CONNECTED'
export const RESET_ELECTRUM_CLIENT_NOT_CONNECTED_ERR = 'RESET_ELECTRUM_CLIENT_NOT_CONNECTED'
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

export interface SetPersonalNodesAction extends Action {
  type: typeof SET_PERSONAL_NODES;
  payload: {node: PersonalNode, operation: NodeStateOperations};
}

export const setPersonalNodes = (
  node: PersonalNode, operation: NodeStateOperations
): SetPersonalNodesAction => {
  return {
    type: SET_PERSONAL_NODES,
    payload: {
      node, operation
    }
  }
}

export const connectToNode = () => {
  return {
    type: CONNECT_TO_NODE
  }
}

export const setElectrumNotConnectedErr = ( err ) => {
  return {
    type: SET_ELECTRUM_CLIENT_NOT_CONNECTED_ERR,
    payload: err
  }
}

export const resetElectrumNotConnectedErr = () => {
  return {
    type: RESET_ELECTRUM_CLIENT_NOT_CONNECTED_ERR
  }
}

export interface SetDefaultNodesAction extends Action {
  type: typeof SET_DEFAULT_NODES;
  payload: {node: PersonalNode, operation: NodeStateOperations};
}

export const setDefaultNodes = (
  node: PersonalNode, operation: NodeStateOperations
): SetDefaultNodesAction => {
  return {
    type: SET_DEFAULT_NODES,
    payload: {
      node, operation
    }
  }
}

export const setDefaultNodesSaved = ( saved: boolean ) => {
  return {
    type: SET_DEFAULT_NODES_SAVED,
    payload: saved
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
