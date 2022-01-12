import { chain } from 'icepick'
import {
  CREDS_STORED,
  CREDS_AUTHENTICATED,
  COMPLETED_WALLET_SETUP,
  SETUP_LOADING,
  RE_LOGIN,
  AUTH_CRED_CHANGED,
  SWITCH_CREDS_CHANGED,
  PIN_CHANGED_FAILED,
  INIT_RECOVERY_COMPLETED,
  WALLET_SETUP_FAILED,
  COMPLETED_PASSWORD_RESET

} from '../actions/setupAndAuth'

const initialState: {
  hasCreds: Boolean;
  isAuthenticated: Boolean;
  authenticationFailed: Boolean;
  walletSetupCompleted: Boolean;
  walletSetupFailed: Boolean;
  reLogin: Boolean;
  loading: {
    initializing: Boolean;
    storingCreds: Boolean;
    authenticating: Boolean;
  };
  credsChanged: string;
  pinChangedFailed: Boolean;
  initializeRecoveryCompleted: boolean;
  passwordResetState: string
} = {
  hasCreds: false,
  isAuthenticated: false,
  authenticationFailed: false,
  walletSetupCompleted: false,
  walletSetupFailed: false,
  reLogin: false,
  loading: {
    initializing: false,
    storingCreds: false,
    authenticating: false,
  },
  credsChanged: '',
  pinChangedFailed: false,
  initializeRecoveryCompleted: false,
  passwordResetState: ''
}

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case CREDS_STORED:
        return chain( state )
          .setIn( [ 'hasCreds' ], true )
          .setIn( [ 'loading', 'storingCreds' ], false )
          .value()
      case COMPLETED_PASSWORD_RESET:
        return chain( state )
          .setIn( [ 'passwordResetState' ], action.payload.state )
          .value()
      case CREDS_AUTHENTICATED:
        return chain( state )
          .setIn( [ 'isAuthenticated' ], action.payload.isAuthenticated )
          .setIn( [ 'authenticationFailed' ], !action.payload.isAuthenticated )
          .setIn( [ 'loading', 'authenticating' ], false )
          .value()

      case COMPLETED_WALLET_SETUP:
        return chain( state )
          .setIn( [ 'walletSetupCompleted' ], true )
          .value()

      case WALLET_SETUP_FAILED:
        return chain( state )
          .setIn( [ 'walletSetupFailed' ], true )
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

      case INIT_RECOVERY_COMPLETED:
        return {
          ...state,
          initializeRecoveryCompleted: action.payload.initializeRecoveryCompleted,
        }
  }

  return state
}
