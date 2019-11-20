import { CREDS_STORED } from "../actions/wallet-setup";

const initialState: {
  hasCreds: Boolean;
} = {
  hasCreds: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CREDS_STORED:
      return {
        ...state,
        hasCreds: true
      };
  }
  return state;
};
