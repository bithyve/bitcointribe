import { TOGGLE_ACCESS } from "../actions/misc";

const initialState: {
  clipboardAccess: boolean;
} = {
  clipboardAccess: false,
}

export default (state=initialState, action) => {
  switch (action.type) {
    case TOGGLE_ACCESS:
      return {
        ...state,
        clipboardAccess: !state.clipboardAccess,
      }
    default:
      return state;
  }
};