import { chain } from 'icepick'
import {
  CREDS_STORED,
  CREDS_AUTHENTICATED,
  SETUP_INITIALIZED,
  SETUP_LOADING,
  RE_LOGIN,
  AUTH_CRED_CHANGED,
  SWITCH_CREDS_CHANGED,
  PIN_CHANGED_FAILED
} from '../actions/setupAndAuth';

const initialState: {
  isInitialized: Boolean;
  hasCreds: Boolean;
  isAuthenticated: Boolean;
  authenticationFailed: Boolean;
  reLogin: Boolean;
  loading: {
    initializing: Boolean;
    storingCreds: Boolean;
    authenticating: Boolean;
  };
  credsChanged: string;
  pinChangedFailed: Boolean;
} = {
  isInitialized: false,
  hasCreds: false,
  isAuthenticated: false,
  authenticationFailed: false,
  reLogin: false,
  loading: {
    initializing: false,
    storingCreds: false,
    authenticating: false,
  },
  credsChanged: '',
  pinChangedFailed: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SETUP_INITIALIZED:
      return chain(state)
        .setIn(['isInitialized'], true)
        .setIn(['loading', 'initializing'], false)
        .value()


    case CREDS_STORED:
      return chain(state)
        .setIn(['hasCreds'], true)
        .setIn(['loading', 'storingCreds'], false)
        .value()

    case CREDS_AUTHENTICATED:

      return chain(state)
        .setIn(['isAuthenticated'], action.payload.isAuthenticated)
        .setIn(['authenticationFailed'], !action.payload.isAuthenticated)
        .setIn(['loading', 'authenticating'], false)
        .value()


    case SETUP_LOADING:
      let authenticationFailed = action.payload.beingLoaded === 'authenticating' &&
        !state.loading[action.payload.beingLoaded] === true
        ? false
        : state.authenticationFailed

      return chain(state)
        .setIn(['authenticationFailed'], authenticationFailed)
        .setIn(['loading', action.payload.beingLoaded], !state.loading[
          action.payload.beingLoaded
        ])
        .value()



    case RE_LOGIN:

      return chain(state)
        .setIn(['reLogin'], action.payload.loggedIn)
        .setIn(['authenticationFailed'], action.payload.reset
          ? false
          : !action.payload.loggedIn)
        .setIn(['loading', 'authenticating'], false)
        .value()



    case AUTH_CRED_CHANGED:
      return chain(state)
        .setIn(['credsChanged'], action.payload.changed).value()



    case SWITCH_CREDS_CHANGED:
      return chain(state).setIn(['credsChanged'], '').value()

    case PIN_CHANGED_FAILED:
      return chain(state).setIn(['pinChangedFailed'], action.payload.isFailed).value()
  }

  return state;
};
