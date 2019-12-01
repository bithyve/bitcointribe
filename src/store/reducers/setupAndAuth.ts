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
  loading: {
    initializing: Boolean;
  };
} = {
  isInitialized: false,
  hasCreds: false,
  isAuthenticated: false,
  loading: {
    initializing: false
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
        hasCreds: true
      };

    case CREDS_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated
      };

    case SETUP_LOADING:
      return {
        ...state,
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
