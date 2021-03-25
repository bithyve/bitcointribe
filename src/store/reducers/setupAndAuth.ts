import { chain } from 'icepick'
import {
  CREDS_STORED,
  CREDS_AUTHENTICATED,
  SETTED_WALLET_DETAILS,
  SETUP_LOADING,
  RE_LOGIN,
  AUTH_CRED_CHANGED,
  SWITCH_CREDS_CHANGED,
  PIN_CHANGED_FAILED,
  IS_NEW_HEALTH_SYSTEM,
  INIT_RECOVERY_COMPLETED,

} from '../actions/setupAndAuth'

const initialState: {
  hasCreds: Boolean;
  isAuthenticated: Boolean;
  authenticationFailed: Boolean;
  walletDetailsSetted: Boolean;
  reLogin: Boolean;
  loading: {
    initializing: Boolean;
    storingCreds: Boolean;
    authenticating: Boolean;
  };
  credsChanged: string;
  pinChangedFailed: Boolean;
  isNewHealthSystemSet: Boolean;
  initializeRecoveryCompleted: boolean;
} = {
  hasCreds: false,
  isAuthenticated: false,
  authenticationFailed: false,
  walletDetailsSetted: false,
  reLogin: false,
  loading: {
    initializing: false,
    storingCreds: false,
    authenticating: false,
  },
  credsChanged: '',
  pinChangedFailed: false,
  isNewHealthSystemSet: false,
  initializeRecoveryCompleted: false
}

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case CREDS_STORED:
        return chain( state )
          .setIn( [ 'hasCreds' ], true )
          .setIn( [ 'loading', 'storingCreds' ], false )
          .value()

      case CREDS_AUTHENTICATED:
        return chain( state )
          .setIn( [ 'isAuthenticated' ], action.payload.isAuthenticated )
          .setIn( [ 'authenticationFailed' ], !action.payload.isAuthenticated )
          .setIn( [ 'loading', 'authenticating' ], false )
          .value()

      case SETTED_WALLET_DETAILS:
        return chain( state )
          .setIn( [ 'walletDetailsSetted' ], true )
          .value()

      case SETUP_LOADING:
        const authenticationFailed = action.payload.beingLoaded === 'authenticating' &&
        !state.loading[ action.payload.beingLoaded ] === true
          ? false
          : state.authenticationFailed
        return chain( state )
          .setIn( [ 'authenticationFailed' ], authenticationFailed )
          .setIn( [ 'loading', action.payload.beingLoaded ], !state.loading[
            action.payload.beingLoaded
          ] )
          .value()



      case RE_LOGIN:
        return chain( state )
          .setIn( [ 'reLogin' ], action.payload.loggedIn )
          .setIn( [ 'authenticationFailed' ], action.payload.reset
            ? false
            : !action.payload.loggedIn )
          .setIn( [ 'loading', 'authenticating' ], false )
          .value()



      case AUTH_CRED_CHANGED:
        return chain( state )
          .setIn( [ 'credsChanged' ], action.payload.changed ).value()

      case SWITCH_CREDS_CHANGED:
        return chain( state ).setIn( [ 'credsChanged' ], '' ).value()

      case PIN_CHANGED_FAILED:
        return chain( state ).setIn( [ 'pinChangedFailed' ], action.payload.isFailed ).value()

      case IS_NEW_HEALTH_SYSTEM:
        return {
          ...state,
          isNewHealthSystemSet: action.payload.isNewHealthSystemSet,
        }

      case INIT_RECOVERY_COMPLETED:
        return {
          ...state,
          initializeRecoveryCompleted: action.payload.initializeRecoveryCompleted,
        }
  }

  return state
}
