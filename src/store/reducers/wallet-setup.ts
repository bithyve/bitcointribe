import { CREDS_STORED, CREDS_AUTHENTICATED } from "../actions/wallet-setup";

const initialState: {
  hasCreds: Boolean;
  isAuthenticated: Boolean;
} = {
  hasCreds: false,
  isAuthenticated: false
};

export default (state = initialState, action) => {
  switch (action.type) {
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
