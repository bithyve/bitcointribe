import { CLIPBOARD_READ_STATE } from "../actions/doNotStore";

const initalState: {
  didAccess: boolean;
} = {
  didAccess: false,
}

const doNotStoreReducer = (state = initalState, action) => {
  switch (action.type) {
    case CLIPBOARD_READ_STATE:
      return {...state, didAccess: true};
    default: 
      return state;
  }
};

export default doNotStoreReducer;