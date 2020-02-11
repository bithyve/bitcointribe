import {
  CREDS_STORED,
  CREDS_AUTHENTICATED,
  SETUP_INITIALIZED,
  SETUP_LOADING,
  RE_LOGIN,
  AUTH_CRED_CHANGED,
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
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SETUP_INITIALIZED:
      return {
        ...state,
        isInitialized: true,
        loading: {
          ...state.loading,
          initializing: false,
        },
      };

    case CREDS_STORED:
      return {
        ...state,
        hasCreds: true,
        loading: {
          ...state.loading,
          storingCreds: false,
        },
      };

    case CREDS_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        authenticationFailed: !action.payload.isAuthenticated,
        loading: {
          ...state.loading,
          authenticating: false,
        },
      };

    case SETUP_LOADING:
      return {
        ...state,
        authenticationFailed:
          action.payload.beingLoaded === 'authenticating' &&
          !state.loading[action.payload.beingLoaded] === true
            ? false
            : state.authenticationFailed,
        loading: {
          ...state.loading,
          [action.payload.beingLoaded]: !state.loading[
            action.payload.beingLoaded
          ],
        },
      };

    case RE_LOGIN:
      return {
        ...state,
        reLogin: action.payload.loggedIn,
        authenticationFailed: action.payload.reset
          ? false
          : !action.payload.loggedIn,
        loading: {
          ...state.loading,
          authenticating: false,
        },
      };

    case AUTH_CRED_CHANGED:
      return {
        ...state,
        credsChanged: action.payload.changed,
      };
  }

  return state;
};
