import PersonalNode from '../../common/data/models/PersonalNode'
import { CONNECT_TO_PERSONAL_NODE, PERSONAL_NODE_CONNECTING_FAILED, PERSONAL_NODE_CONNECTING_SUCCEEDED, PERSONAL_NODE_PREFERENCE_TOGGLED, PERSONAL_NODE_CONFIGURATION_SET, PERSONAL_NODE_CONNECTING_COMPLETED, BIT_HYVE_NODE_CONNECTING_SUCCEEDED, BIT_HYVE_NODE_CONNECTING_COMPLETED, IS_CONNECTION_ACTIVE, SET_PERSONAL_NODES, SET_DEFAULT_NODES, SET_DEFAULT_NODES_SAVED, SET_ELECTRUM_CLIENT_NOT_CONNECTED_ERR, RESET_ELECTRUM_CLIENT_NOT_CONNECTED_ERR,  } from '../actions/nodeSettings'

export enum NodeStateOperations {
  ADD= 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export type NodeSettingsState = {
  isConnectionActive: boolean;
  prefersPersonalNodeConnection: boolean;

  activePersonalNode: PersonalNode | null;
  defaultNodesSaved: boolean;
  defaultNodes: PersonalNode[],
  personalNodes: PersonalNode[];

  electrumClientConnectionStatus: {
    inProgress: boolean;
    success: boolean;
    connectedTo: string;
    failed: boolean;
    error: string;
    setElectrumNotConnectedErr: string;
  };

  isConnectionInProgress: boolean;

  hasPersonalNodeConnectionSucceeded: boolean;
  hasPersonalNodeConnectionFailed: boolean;
  personalNodeConnectionErrorMessage: string | null;

  hasBitHyveNodeConnectionSucceeded: boolean;
  hasBitHyveNodeConnectionFailed: boolean;
  bitHyveNodeConnectionErrorMessage: string | null;
};

export const INITIAL_STATE: NodeSettingsState = {
  isConnectionActive: false,
  prefersPersonalNodeConnection: false,

  activePersonalNode: null,
  defaultNodesSaved: false,
  defaultNodes: [],
  personalNodes: [],

  electrumClientConnectionStatus: {
    inProgress: false,
    success: false,
    connectedTo: null,
    failed: false,
    error: null,
    setElectrumNotConnectedErr: '',
  },

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

      case SET_PERSONAL_NODES:
        const { node: selectedPersonalNode, operation: personalNodesOperation } = action.payload
        let updatedPersonalNodes = [ ...state.personalNodes ]

        switch( personalNodesOperation ){
            case NodeStateOperations.ADD:
            case NodeStateOperations.UPDATE:
              let toAdd = true
              for( let idx = 0; idx < updatedPersonalNodes.length; idx++ ){
                if( updatedPersonalNodes[ idx ].id === selectedPersonalNode.id ) {
                  updatedPersonalNodes[ idx ] = selectedPersonalNode
                  toAdd = false
                  break
                }
              }
              if( toAdd ) updatedPersonalNodes.push( selectedPersonalNode )
              break

            case NodeStateOperations.DELETE:
              updatedPersonalNodes = updatedPersonalNodes.filter( ( item ) => item.id !== selectedPersonalNode.id )
              break
        }

        return {
          ...state,
          personalNodes: updatedPersonalNodes
        }


      case SET_DEFAULT_NODES:
        const { node: selectedDefaultNode, operation: defaultNodesOperation } = action.payload
        let updatedDefaultNodes = [ ...state.defaultNodes ]

        switch( defaultNodesOperation ){
            case NodeStateOperations.ADD:
            case NodeStateOperations.UPDATE:
              let toAdd = true
              for( let idx = 0; idx < updatedDefaultNodes.length; idx++ ){
                if( updatedDefaultNodes[ idx ].id === selectedDefaultNode.id ) {
                  updatedDefaultNodes[ idx ] = selectedDefaultNode
                  toAdd = false
                  break
                }
              }
              if( toAdd ) updatedDefaultNodes.push( selectedDefaultNode )

              break

            case NodeStateOperations.DELETE:
              updatedDefaultNodes = updatedDefaultNodes.filter( ( item ) => item.id !== selectedDefaultNode.id )
              break
        }

        return {
          ...state,
          defaultNodes: updatedDefaultNodes
        }

      case SET_DEFAULT_NODES_SAVED:
        return {
          ...state,
          defaultNodesSaved: action.payload
        }

      case SET_ELECTRUM_CLIENT_NOT_CONNECTED_ERR:
        return {
          ...state,
          electrumClientConnectionStatus: {
            ...state.electrumClientConnectionStatus,
            setElectrumNotConnectedErr: action.payload
          }
        }

      case RESET_ELECTRUM_CLIENT_NOT_CONNECTED_ERR:
        return {
          ...state,
          electrumClientConnectionStatus: {
            ...state.electrumClientConnectionStatus,
            setElectrumNotConnectedErr: ''
          }
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
