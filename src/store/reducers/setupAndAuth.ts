import {
  CREDS_STORED,
  CREDS_AUTHENTICATED,
  SETUP_INITIALIZED
} from "../actions/setupAndAuth";

const initialState: {
  isInitialized: Boolean;
  hasCreds: Boolean;
  isAuthenticated: Boolean;
} = {
  isInitialized: false,
  hasCreds: false,
  isAuthenticated: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SETUP_INITIALIZED:
      return {
        ...state,
        isInitialized: true
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
  }

  return state;
};
