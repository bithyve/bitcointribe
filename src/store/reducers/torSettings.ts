import Tor from '../../common/data/models/Tor'
import { CONNECT_TO_TOR, TOR_CONNECTING_FAILED, TOR_CONNECTING_SUCCEEDED, TOR_PREFERENCE_TOGGLED, TOR_CONFIGURATION_SET, TOR_CONNECTING_COMPLETED, PLAINNET_CONNECTING_SUCCEEDED, PLAINNET_CONNECTING_COMPLETED } from '../actions/torSettings'

export type TorSettingsState = {
  isConnectionActive: boolean;
  prefersTorConnection: boolean;

  activeTor: Tor | null;

  isConnectionInProgress: boolean;

  hasTorConnectionSucceeded: boolean;
  hasTorConnectionFailed: boolean;
  torConnectionErrorMessage: string | null;

  hasPlainnetConnectionSucceeded: boolean;
  hasPlainnetConnectionFailed: boolean;
  plainnetConnectionErrorMessage: string | null;
};

const INITIAL_STATE: TorSettingsState = {
  isConnectionActive: false,
  prefersTorConnection: false,

  activeTor: null,

  isConnectionInProgress: false,

  hasTorConnectionSucceeded: false,
  hasTorConnectionFailed: false,
  torConnectionErrorMessage: null,

  hasPlainnetConnectionSucceeded: false,
  hasPlainnetConnectionFailed: false,
  plainnetConnectionErrorMessage: null,
}


const torSettingsReducer = ( state: TorSettingsState = INITIAL_STATE, action ): TorSettingsState => {
  switch ( action.type ) {
      case TOR_PREFERENCE_TOGGLED:
        return {
          ...state,
          prefersTorConnection: action.payload,
        }

      case TOR_CONFIGURATION_SET:
        return {
          ...state,
          activeTor: action.payload,
        }

      case CONNECT_OVER_TOR:
        return {
          ...state,
          isConnectionInProgress: true,
          hasTorConnectionSucceeded: false,
          hasTorConnectionFailed: false,
        }

      case TOR_CONNECTING_SUCCEEDED:
        return {
          ...state,
          isConnectionInProgress: false,
          hasTorConnectionSucceeded: true,
          hasTorConnectionFailed: false,
          activeTor: action.payload
        }

      case TOR_CONNECTING_FAILED:
        return {
          ...state,
          isConnectionInProgress: false,
          activeTor: null,
          hasTorConnectionSucceeded: false,
          hasTorConnectionFailed: true,
          torConnectionErrorMessage: action.payload,
        }

      case TOR_CONNECTING_COMPLETED:
        return {
          ...state,
          isConnectionInProgress: false,
          hasTorConnectionSucceeded: false,
          hasTorConnectionFailed: false,
          torConnectionErrorMessage: null,
        }


      case PLAINNET_CONNECTING_SUCCEEDED:
        return {
          ...state,
          isConnectionInProgress: false,
          hasPlainnetConnectionSucceeded: true,
          hasPlainnetConnectionFailed: false,
          activeTor: null,
        }

      case PLAINNET_CONNECTING_COMPLETED:
        return {
          ...state,
          isConnectionInProgress: false,
          hasPlainnetConnectionSucceeded: false,
          hasPlainnetConnectionFailed: false,
          plainnetConnectionErrorMessage: null,
        }
      default:
        return state
  }
}

export default torSettingsReducer
