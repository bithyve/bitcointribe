import PersonalNode from '../../common/data/models/PersonalNode'
import { CONNECT_TO_PERSONAL_NODE, PERSONAL_NODE_CONNECTING_FAILED, PERSONAL_NODE_CONNECTING_SUCCEEDED, PERSONAL_NODE_PREFERENCE_TOGGLED, PERSONAL_NODE_CONFIGURATION_SET, PERSONAL_NODE_CONNECTING_COMPLETED } from '../actions/nodeSettings'

export type NodeSettingsState = {
  isConnectionActive: boolean;
  prefersPersonalNodeConnection: boolean;

  activePersonalNode: PersonalNode | null;
  personalNodes: PersonalNode[];

  isConnectionInProgress: boolean;
  hasConnectionSucceeded: boolean;
  hasConnectionFailed: boolean;
  connectionFailureErrorMessage: string | null;
};

const INITIAL_STATE: NodeSettingsState = {
  isConnectionActive: false,
  prefersPersonalNodeConnection: false,

  activePersonalNode: null,
  personalNodes: [],

  isConnectionInProgress: false,
  hasConnectionSucceeded: false,
  hasConnectionFailed: false,
  connectionFailureErrorMessage: null,
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

      case CONNECT_TO_PERSONAL_NODE:
        return {
          ...state,
          isConnectionInProgress: true,
          hasConnectionSucceeded: false,
          hasConnectionFailed: false,
        }

      case PERSONAL_NODE_CONNECTING_SUCCEEDED:
        return {
          ...state,
          isConnectionInProgress: false,
          hasConnectionSucceeded: true,
          hasConnectionFailed: false,
          activePersonalNode: action.payload
        }

      case PERSONAL_NODE_CONNECTING_FAILED:
        return {
          ...state,
          isConnectionInProgress: false,
          activePersonalNode: null,
          hasConnectionSucceeded: false,
          hasConnectionFailed: true,
          connectionFailureErrorMessage: action.payload,
        }

      case PERSONAL_NODE_CONNECTING_COMPLETED:
        return {
          ...state,
          isConnectionInProgress: false,
          hasConnectionSucceeded: false,
          hasConnectionFailed: false,
          connectionFailureErrorMessage: null,
        }
      default:
        return state
  }
}

export default nodeSettingsReducer
