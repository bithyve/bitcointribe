import {
  CREDS_STORED,
  CREDS_AUTHENTICATED,
  SETUP_INITIALIZED,
  SETUP_LOADING
} from "../actions/setupAndAuth";

const initialState: {
  isInitialized: Boolean;
  hasCreds: Boolean;
  isAuthenticated: Boolean;
  authenticationFailed: Boolean;
  loading: {
    initializing: Boolean;
    storingCreds: Boolean;
    authenticating: Boolean;
  };
} = {
  isInitialized: false,
  hasCreds: false,
  isAuthenticated: false,
  authenticationFailed: false,
  loading: {
    initializing: false,
    storingCreds: false,
    authenticating: false
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SETUP_INITIALIZED:
      return {
        ...state,
        isInitialized: true,
        loading: {
          ...state.loading,
          initializing: false
        }
      };

    case CREDS_STORED:
      return {
        ...state,
        hasCreds: true,
        loading: {
          ...state.loading,
          storingCreds: false
        }
      };

    case CREDS_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        authenticationFailed: !action.payload.isAuthenticated,
        loading: {
          ...state.loading,
          authenticating: false
        }
      };

    case SETUP_LOADING:
      return {
        ...state,
        authenticationFailed:
          action.payload.beingLoaded === "authenticating" &&
          !state.loading[action.payload.beingLoaded] === true
            ? false
            : state.authenticationFailed,
        loading: {
          ...state.loading,
          [action.payload.beingLoaded]: !state.loading[
            action.payload.beingLoaded
          ]
        }
      };
  }

  return state;
};
