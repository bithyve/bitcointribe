import PersonalNode from '../../common/data/models/PersonalNode'
import { CONNECT_TO_PERSONAL_NODE, PERSONAL_NODE_CONNECTING_FAILED, PERSONAL_NODE_CONNECTING_SUCCEEDED, PERSONAL_NODE_PREFERENCE_TOGGLED, PERSONAL_NODE_CONFIGURATION_SET, PERSONAL_NODE_CONNECTING_COMPLETED, BIT_HYVE_NODE_CONNECTING_SUCCEEDED, BIT_HYVE_NODE_CONNECTING_COMPLETED, SET_ALL_NODES, IS_CONNECTION_ACTIVE } from '../actions/nodeSettings'

export type NodeSettingsState = {
  isConnectionActive: boolean;
  prefersPersonalNodeConnection: boolean;

  activePersonalNode: PersonalNode | null;
  personalNodes: PersonalNode[];

  isConnectionInProgress: boolean;

  hasPersonalNodeConnectionSucceeded: boolean;
  hasPersonalNodeConnectionFailed: boolean;
  personalNodeConnectionErrorMessage: string | null;

  hasBitHyveNodeConnectionSucceeded: boolean;
  hasBitHyveNodeConnectionFailed: boolean;
  bitHyveNodeConnectionErrorMessage: string | null;
};

const INITIAL_STATE: NodeSettingsState = {
  isConnectionActive: false,
  prefersPersonalNodeConnection: false,

  activePersonalNode: null,
  personalNodes: [],

  isConnectionInProgress: false,

  hasPersonalNodeConnectionSucceeded: false,
  hasPersonalNodeConnectionFailed: false,
  personalNodeConnectionErrorMessage: null,

  hasBitHyveNodeConnectionSucceeded: false,
  hasBitHyveNodeConnectionFailed: false,
  bitHyveNodeConnectionErrorMessage: null,
}


const nodeSettingsReducer = ( state: NodeSettingsState = INITIAL_STATE, action ): NodeSettingsState => {
  switch ( action.type ) {
      case PERSONAL_NODE_PREFERENCE_TOGGLED:
        return {
          ...state,
          prefersPersonalNodeConnection: action.payload,
        }

      case PERSONAL_NODE_CONFIGURATION_SET:
        return {
          ...state,
          activePersonalNode: action.payload,
        }

      case SET_ALL_NODES:
        return {
          ...state,
          personalNodes: action.payload
        }

      case IS_CONNECTION_ACTIVE:
        return {
          ...state,
          isConnectionActive: action.payload,
          // hasPersonalNodeConnectionSucceeded: false,
          // hasPersonalNodeConnectionFailed: false,
        }

      case CONNECT_TO_PERSONAL_NODE:
        return {
          ...state,
          isConnectionInProgress: true,
          hasPersonalNodeConnectionSucceeded: false,
          hasPersonalNodeConnectionFailed: false,
        }

      case PERSONAL_NODE_CONNECTING_SUCCEEDED:
        return {
          ...state,
          isConnectionInProgress: false,
          hasPersonalNodeConnectionSucceeded: true,
          hasPersonalNodeConnectionFailed: false,
          activePersonalNode: action.payload
        }

      case PERSONAL_NODE_CONNECTING_FAILED:
        return {
          ...state,
          isConnectionInProgress: false,
          activePersonalNode: null,
          hasPersonalNodeConnectionSucceeded: false,
          hasPersonalNodeConnectionFailed: true,
          personalNodeConnectionErrorMessage: action.payload,
        }

      case PERSONAL_NODE_CONNECTING_COMPLETED:
        return {
          ...state,
          isConnectionInProgress: false,
          hasPersonalNodeConnectionSucceeded: false,
          hasPersonalNodeConnectionFailed: false,
          personalNodeConnectionErrorMessage: null,
        }

      case BIT_HYVE_NODE_CONNECTING_SUCCEEDED:
        return {
          ...state,
          isConnectionInProgress: false,
          hasBitHyveNodeConnectionSucceeded: true,
          hasBitHyveNodeConnectionFailed: false,
          activePersonalNode: null,
        }

      case BIT_HYVE_NODE_CONNECTING_COMPLETED:
        return {
          ...state,
          isConnectionInProgress: false,
          hasBitHyveNodeConnectionSucceeded: false,
          hasBitHyveNodeConnectionFailed: false,
          bitHyveNodeConnectionErrorMessage: null,
        }
      default:
        return state
  }
}

export default nodeSettingsReducer
